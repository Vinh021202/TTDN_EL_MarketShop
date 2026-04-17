import { ChangeEvent, FormEvent, ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { AlertCircle, ArrowLeft, CheckCircle2, ImagePlus, Loader2, Plus, Trash2 } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getAdminImageUrl } from './adminPresentation';
import {
    AdminRecipePayload,
    AdminRecipeProductOption,
    adminCreateRecipe,
    adminGetAllProducts,
    adminGetRecipeById,
    adminUpdateRecipe,
    uploadImage,
} from './services/adminApi';

const difficultyOptions = ['dễ', 'trung bình', 'khó'];

const createSlug = (value: string) =>
    value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

const createIngredient = () => ({ product: '', quantity: '', unit: 'gram', isOptional: false, notes: '' });
const createStep = () => ({ instruction: '', duration: '', image: '', tips: '' });

const initialForm = {
    name: '',
    slug: '',
    description: '',
    thumbnail: '',
    video: '',
    prepTime: '10',
    cookTime: '15',
    servings: '2',
    difficulty: 'trung bình',
    tags: '',
    estimatedCost: '',
    calories: '',
    isActive: true,
    isFeatured: false,
};

export function AdminRecipeFormPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const isEdit = Boolean(id);

    const [form, setForm] = useState(initialForm);
    const [ingredients, setIngredients] = useState([createIngredient()]);
    const [steps, setSteps] = useState([createStep()]);
    const [products, setProducts] = useState<AdminRecipeProductOption[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [slugTouched, setSlugTouched] = useState(false);

    useEffect(() => {
        let cancelled = false;

        const loadData = async () => {
            setLoading(true);
            setError('');

            try {
                const requests: Promise<any>[] = [adminGetAllProducts({ page: 1, limit: 200 })];
                if (id) requests.push(adminGetRecipeById(id));

                const [productData, recipeData] = await Promise.all(requests);
                if (cancelled) return;

                setProducts(productData.products || []);

                if (recipeData?.recipe) {
                    const recipe = recipeData.recipe;
                    setForm({
                        name: recipe.name || '',
                        slug: recipe.slug || '',
                        description: recipe.description || '',
                        thumbnail: getAdminImageUrl(recipe.thumbnail),
                        video: recipe.video || '',
                        prepTime: String(recipe.prepTime || 0),
                        cookTime: String(recipe.cookTime || 0),
                        servings: String(recipe.servings || 1),
                        difficulty: recipe.difficulty || 'trung bình',
                        tags: Array.isArray(recipe.tags) ? recipe.tags.join(', ') : '',
                        estimatedCost: recipe.estimatedCost === undefined ? '' : String(recipe.estimatedCost),
                        calories: recipe.calories === undefined ? '' : String(recipe.calories),
                        isActive: Boolean(recipe.isActive),
                        isFeatured: Boolean(recipe.isFeatured),
                    });
                    setIngredients(
                        Array.isArray(recipe.ingredients) && recipe.ingredients.length
                            ? recipe.ingredients.map((item: any) => ({
                                  product: typeof item.product === 'string' ? item.product : item.product?._id || '',
                                  quantity: item.quantity === undefined ? '' : String(item.quantity),
                                  unit: item.unit || 'gram',
                                  isOptional: Boolean(item.isOptional),
                                  notes: item.notes || '',
                              }))
                            : [createIngredient()]
                    );
                    setSteps(
                        Array.isArray(recipe.steps) && recipe.steps.length
                            ? [...recipe.steps]
                                  .sort((a, b) => a.order - b.order)
                                  .map((item: any) => ({
                                      instruction: item.instruction || '',
                                      duration: item.duration === undefined ? '' : String(item.duration),
                                      image: item.image || '',
                                      tips: item.tips || '',
                                  }))
                            : [createStep()]
                    );
                    setSlugTouched(true);
                }
            } catch {
                if (!cancelled) setError('Không thể tải dữ liệu công thức.');
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        loadData();
        return () => {
            cancelled = true;
        };
    }, [id]);

    useEffect(() => {
        if (slugTouched) return;
        const nextSlug = createSlug(form.name);
        setForm((previous) => (previous.slug === nextSlug ? previous : { ...previous, slug: nextSlug }));
    }, [form.name, slugTouched]);

    const productMap = useMemo(() => new Map(products.map((product) => [product._id, product])), [products]);

    const updateIngredient = (index: number, field: string, value: string | boolean) => {
        setIngredients((previous) =>
            previous.map((item, itemIndex) => (itemIndex === index ? { ...item, [field]: value } : item))
        );
    };

    const updateStep = (index: number, field: string, value: string) => {
        setSteps((previous) =>
            previous.map((item, itemIndex) => (itemIndex === index ? { ...item, [field]: value } : item))
        );
    };

    const handleThumbnailUpload = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setError('');

        try {
            const reader = new FileReader();
            const base64 = await new Promise<string>((resolve) => {
                reader.onload = () => resolve(reader.result as string);
                reader.readAsDataURL(file);
            });
            const result = await uploadImage(base64);
            setForm((previous) => ({ ...previous, thumbnail: result.url || '' }));
        } catch {
            setError('Tải ảnh thumbnail thất bại.');
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setError('');
        setSuccess('');

        const normalizedIngredients = ingredients
            .map((item) => ({
                product: item.product.trim(),
                quantity: Number(item.quantity),
                unit: item.unit.trim() || 'gram',
                isOptional: item.isOptional,
                notes: item.notes.trim() || undefined,
            }))
            .filter((item) => item.product && Number.isFinite(item.quantity) && item.quantity > 0);

        const normalizedSteps = steps
            .map((item, index) => ({
                order: index + 1,
                instruction: item.instruction.trim(),
                duration: item.duration ? Number(item.duration) : undefined,
                image: item.image.trim() || undefined,
                tips: item.tips.trim() || undefined,
            }))
            .filter((item) => item.instruction);

        if (!form.name.trim()) return setError('Tên công thức là bắt buộc.');
        if (!normalizedIngredients.length) return setError('Vui lòng thêm ít nhất một nguyên liệu hợp lệ.');
        if (!normalizedSteps.length) return setError('Vui lòng thêm ít nhất một bước thực hiện.');

        const payload: AdminRecipePayload = {
            name: form.name.trim(),
            slug: form.slug.trim() || undefined,
            description: form.description.trim() || undefined,
            thumbnail: form.thumbnail.trim() || undefined,
            video: form.video.trim() || undefined,
            prepTime: Math.max(0, Number(form.prepTime) || 0),
            cookTime: Math.max(0, Number(form.cookTime) || 0),
            servings: Math.max(1, Number(form.servings) || 1),
            difficulty: form.difficulty,
            ingredients: normalizedIngredients,
            steps: normalizedSteps,
            tags: form.tags ? form.tags.split(',').map((item) => item.trim()).filter(Boolean) : [],
            estimatedCost: form.estimatedCost ? Number(form.estimatedCost) : undefined,
            calories: form.calories ? Number(form.calories) : undefined,
            isActive: form.isActive,
            isFeatured: form.isFeatured,
        };

        setSubmitting(true);
        try {
            if (id) {
                await adminUpdateRecipe(id, payload);
                setSuccess('Đã cập nhật công thức thành công.');
            } else {
                await adminCreateRecipe(payload);
                setSuccess('Đã tạo công thức mới.');
                setTimeout(() => navigate('/admin/recipes'), 900);
            }
        } catch (submitError: any) {
            setError(submitError.response?.data?.error || 'Không thể lưu công thức.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="ttdn-admin-card text-center">
                <div className="spinner-border text-success mb-3" role="status" />
                <h2 className="h5 fw-bold text-dark mb-2">Đang tải công thức</h2>
                <p className="text-muted mb-0">Hệ thống đang lấy dữ liệu để bạn chỉnh sửa.</p>
            </div>
        );
    }

    return (
        <form className="d-grid gap-4" onSubmit={handleSubmit}>
            <section className="ttdn-admin-page-intro">
                <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3">
                    <div>
                        <p className="text-uppercase small fw-bold text-white-50 mb-2">Công thức</p>
                        <h2 className="display-6 fw-bold text-white mb-2">{isEdit ? 'Chỉnh sửa công thức' : 'Thêm công thức mới'}</h2>
                    </div>
                    <Link to="/admin/recipes" className="btn btn-light rounded-pill px-4">
                        <ArrowLeft size={16} className="me-2" />
                        Quay lại danh sách
                    </Link>
                </div>
            </section>

            {error ? <AlertBox tone="danger" message={error} /> : null}
            {success ? <AlertBox tone="success" message={success} /> : null}

            <div className="row g-4">
                <div className="col-xl-8">
                    <div className="ttdn-admin-form-grid">
                        <section className="ttdn-admin-card">
                            <SectionTitle eyebrow="Nội dung" title="Thông tin cơ bản" />
                            <div className="row g-3">
                                <InputField label="Tên công thức *">
                                    <input type="text" className="form-control" value={form.name} onChange={(event) => setForm((previous) => ({ ...previous, name: event.target.value }))} required />
                                </InputField>
                                <InputField label="Slug" className="col-md-6">
                                    <input type="text" className="form-control" value={form.slug} onChange={(event) => { setSlugTouched(true); setForm((previous) => ({ ...previous, slug: createSlug(event.target.value) })); }} />
                                </InputField>
                                <InputField label="Video (URL)" className="col-md-6">
                                    <input type="url" className="form-control" value={form.video} onChange={(event) => setForm((previous) => ({ ...previous, video: event.target.value }))} />
                                </InputField>
                                <InputField label="Mô tả" className="col-12">
                                    <textarea className="form-control" rows={5} value={form.description} onChange={(event) => setForm((previous) => ({ ...previous, description: event.target.value }))} />
                                </InputField>
                                <InputField label="Tags" className="col-12">
                                    <input type="text" className="form-control" value={form.tags} onChange={(event) => setForm((previous) => ({ ...previous, tags: event.target.value }))} placeholder="nhanh, healthy, gia đình" />
                                </InputField>
                            </div>
                        </section>

                        <section className="ttdn-admin-card">
                            <div className="d-flex justify-content-between align-items-center gap-3 mb-4">
                                <SectionTitle eyebrow="Nguyên liệu" title="Danh sách nguyên liệu" />
                                <button type="button" className="btn btn-light rounded-pill px-4" onClick={() => setIngredients((previous) => [...previous, createIngredient()])}>
                                    <Plus size={16} className="me-2" />
                                    Thêm
                                </button>
                            </div>
                            <div className="ttdn-admin-stack">
                                {ingredients.map((ingredient, index) => (
                                    <div key={index} className="ttdn-admin-subcard">
                                        <div className="d-flex justify-content-between align-items-center gap-3 mb-3">
                                            <strong>Nguyên liệu {index + 1}</strong>
                                            {ingredients.length > 1 ? (
                                                <button type="button" className="btn btn-outline-danger rounded-pill" onClick={() => setIngredients((previous) => previous.filter((_, itemIndex) => itemIndex !== index))}>
                                                    <Trash2 size={16} />
                                                </button>
                                            ) : null}
                                        </div>
                                        <div className="row g-3">
                                            <InputField label="Sản phẩm *" className="col-lg-6">
                                                <select className="form-select" value={ingredient.product} onChange={(event) => updateIngredient(index, 'product', event.target.value)}>
                                                    <option value="">Chọn sản phẩm</option>
                                                    {products.map((product) => (
                                                        <option key={product._id} value={product._id}>{product.name}</option>
                                                    ))}
                                                </select>
                                                {productMap.get(ingredient.product) ? <p className="ttdn-admin-helper-text mb-0 mt-2">Đơn vị kho: {productMap.get(ingredient.product)?.unit || 'chưa khai báo'}</p> : null}
                                            </InputField>
                                            <InputField label="Số lượng *" className="col-md-3">
                                                <input type="number" min={0} step="0.1" className="form-control" value={ingredient.quantity} onChange={(event) => updateIngredient(index, 'quantity', event.target.value)} />
                                            </InputField>
                                            <InputField label="Đơn vị" className="col-md-3">
                                                <input type="text" className="form-control" value={ingredient.unit} onChange={(event) => updateIngredient(index, 'unit', event.target.value)} />
                                            </InputField>
                                            <InputField label="Ghi chú" className="col-12">
                                                <input type="text" className="form-control" value={ingredient.notes} onChange={(event) => updateIngredient(index, 'notes', event.target.value)} />
                                            </InputField>
                                            <div className="col-12">
                                                <div className="form-check form-switch">
                                                    <input id={`ingredient-optional-${index}`} type="checkbox" className="form-check-input" checked={ingredient.isOptional} onChange={(event) => updateIngredient(index, 'isOptional', event.target.checked)} />
                                                    <label className="form-check-label" htmlFor={`ingredient-optional-${index}`}>Nguyên liệu tùy chọn</label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="ttdn-admin-card">
                            <div className="d-flex justify-content-between align-items-center gap-3 mb-4">
                                <SectionTitle eyebrow="Các bước" title="Quy trình thực hiện" />
                                <button type="button" className="btn btn-light rounded-pill px-4" onClick={() => setSteps((previous) => [...previous, createStep()])}>
                                    <Plus size={16} className="me-2" />
                                    Thêm
                                </button>
                            </div>
                            <div className="ttdn-admin-stack">
                                {steps.map((step, index) => (
                                    <div key={index} className="ttdn-admin-subcard">
                                        <div className="d-flex justify-content-between align-items-center gap-3 mb-3">
                                            <strong>Bước {index + 1}</strong>
                                            {steps.length > 1 ? (
                                                <button type="button" className="btn btn-outline-danger rounded-pill" onClick={() => setSteps((previous) => previous.filter((_, itemIndex) => itemIndex !== index))}>
                                                    <Trash2 size={16} />
                                                </button>
                                            ) : null}
                                        </div>
                                        <div className="row g-3">
                                            <InputField label="Hướng dẫn *" className="col-12">
                                                <textarea className="form-control" rows={4} value={step.instruction} onChange={(event) => updateStep(index, 'instruction', event.target.value)} />
                                            </InputField>
                                            <InputField label="Thời lượng (phút)" className="col-md-4">
                                                <input type="number" min={0} className="form-control" value={step.duration} onChange={(event) => updateStep(index, 'duration', event.target.value)} />
                                            </InputField>
                                            <InputField label="Ảnh minh họa (URL)" className="col-md-8">
                                                <input type="url" className="form-control" value={step.image} onChange={(event) => updateStep(index, 'image', event.target.value)} />
                                            </InputField>
                                            <InputField label="Mẹo nhỏ" className="col-12">
                                                <input type="text" className="form-control" value={step.tips} onChange={(event) => updateStep(index, 'tips', event.target.value)} />
                                            </InputField>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                </div>

                <div className="col-xl-4">
                    <div className="ttdn-admin-form-grid">
                        <section className="ttdn-admin-card">
                            <SectionTitle eyebrow="Hiển thị" title="Thumbnail & trạng thái" />
                            <div className="ttdn-admin-preview-frame mb-3">
                                {form.thumbnail ? <img src={form.thumbnail} alt={form.name || 'Thumbnail công thức'} /> : <div className="text-center text-muted"><ImagePlus size={28} className="mb-2" /><p className="mb-0">Chưa có thumbnail</p></div>}
                            </div>
                            <div className="d-grid gap-3">
                                <InputField label="Thumbnail (URL)">
                                    <input type="url" className="form-control" value={form.thumbnail} onChange={(event) => setForm((previous) => ({ ...previous, thumbnail: event.target.value }))} />
                                </InputField>
                                <div className="d-flex flex-wrap gap-2">
                                    <button type="button" className="btn btn-light rounded-pill px-4" disabled={uploading} onClick={() => fileInputRef.current?.click()}>
                                        {uploading ? <Loader2 size={16} className="me-2 animate-spin" /> : <ImagePlus size={16} className="me-2" />}
                                        Tải ảnh
                                    </button>
                                    {form.thumbnail ? <button type="button" className="btn btn-outline-danger rounded-pill px-4" onClick={() => setForm((previous) => ({ ...previous, thumbnail: '' }))}>Xóa ảnh</button> : null}
                                </div>
                                <input ref={fileInputRef} type="file" hidden accept="image/*" onChange={handleThumbnailUpload} />
                                <div className="row g-3">
                                    <InputField label="Sơ chế (phút)" className="col-md-6"><input type="number" min={0} className="form-control" value={form.prepTime} onChange={(event) => setForm((previous) => ({ ...previous, prepTime: event.target.value }))} /></InputField>
                                    <InputField label="Nấu (phút)" className="col-md-6"><input type="number" min={0} className="form-control" value={form.cookTime} onChange={(event) => setForm((previous) => ({ ...previous, cookTime: event.target.value }))} /></InputField>
                                    <InputField label="Khẩu phần" className="col-md-6"><input type="number" min={1} className="form-control" value={form.servings} onChange={(event) => setForm((previous) => ({ ...previous, servings: event.target.value }))} /></InputField>
                                    <InputField label="Độ khó" className="col-md-6"><select className="form-select" value={form.difficulty} onChange={(event) => setForm((previous) => ({ ...previous, difficulty: event.target.value }))}>{difficultyOptions.map((option) => <option key={option} value={option}>{option}</option>)}</select></InputField>
                                    <InputField label="Chi phí ước tính" className="col-md-6"><input type="number" min={0} className="form-control" value={form.estimatedCost} onChange={(event) => setForm((previous) => ({ ...previous, estimatedCost: event.target.value }))} /></InputField>
                                    <InputField label="Calories" className="col-md-6"><input type="number" min={0} className="form-control" value={form.calories} onChange={(event) => setForm((previous) => ({ ...previous, calories: event.target.value }))} /></InputField>
                                </div>
                                <div className="ttdn-admin-subcard">
                                    <div className="d-grid gap-3">
                                        <div className="form-check form-switch">
                                            <input id="recipe-active" type="checkbox" className="form-check-input" checked={form.isActive} onChange={(event) => setForm((previous) => ({ ...previous, isActive: event.target.checked }))} />
                                            <label className="form-check-label fw-semibold" htmlFor="recipe-active">Hiển thị ngoài storefront</label>
                                        </div>
                                        <div className="form-check form-switch">
                                            <input id="recipe-featured" type="checkbox" className="form-check-input" checked={form.isFeatured} onChange={(event) => setForm((previous) => ({ ...previous, isFeatured: event.target.checked }))} />
                                            <label className="form-check-label fw-semibold" htmlFor="recipe-featured">Đánh dấu nổi bật</label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="ttdn-admin-card">
                            <SectionTitle eyebrow="Lưu thay đổi" title="Hoàn tất biểu mẫu" />
                            <div className="d-grid gap-2">
                                <button type="submit" className="btn theme-bg-color text-white rounded-pill px-4 py-3" disabled={submitting || uploading}>
                                    {submitting ? <><Loader2 size={16} className="me-2 animate-spin" />Đang lưu công thức</> : isEdit ? 'Cập nhật công thức' : 'Tạo công thức'}
                                </button>
                                <Link to="/admin/recipes" className="btn btn-light rounded-pill px-4 py-3">Hủy và quay lại</Link>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </form>
    );
}

function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
    return (
        <div>
            <p className="text-uppercase small fw-bold theme-color mb-1">{eyebrow}</p>
            <h3 className="h4 fw-bold text-dark mb-0">{title}</h3>
        </div>
    );
}

function InputField({
    label,
    className = 'col-12',
    children,
}: {
    label: string;
    className?: string;
    children: ReactNode;
}) {
    return (
        <div className={className}>
            <label className="form-label text-muted small text-uppercase fw-bold mb-2">{label}</label>
            {children}
        </div>
    );
}

function AlertBox({ tone, message }: { tone: 'danger' | 'success'; message: string }) {
    const Icon = tone === 'danger' ? AlertCircle : CheckCircle2;
    return (
        <div className="ttdn-admin-card">
            <div className={`d-flex align-items-center gap-2 text-${tone}`}>
                <Icon size={18} />
                <strong>{message}</strong>
            </div>
        </div>
    );
}
