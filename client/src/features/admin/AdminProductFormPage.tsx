import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, AlertCircle, CheckCircle2, ImagePlus, Loader2, Plus, Trash2 } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getAdminImageUrl } from './adminPresentation';
import {
    adminCreateProduct,
    adminGetProductById,
    adminUpdateProduct,
    getCategories,
    uploadImage,
} from './services/adminApi';

const units = [
    { value: 'kg', label: 'kg' },
    { value: 'gram', label: 'gram' },
    { value: 'pack', label: 'Gói' },
    { value: 'bundle', label: 'Bó' },
    { value: 'carton', label: 'Thùng' },
    { value: 'piece', label: 'Cái' },
];

const storageTypes = [
    { value: 'nhiệt độ thường', label: 'Nhiệt độ thường' },
    { value: 'ngăn mát', label: 'Ngăn mát' },
    { value: 'ngăn đông', label: 'Ngăn đông' },
];

const origins = ['Đà Lạt', 'Miền Tây', 'Miền Bắc', 'Miền Trung', 'Nhập khẩu', 'Khác'];

const initialForm = {
    name: '',
    description: '',
    price: '',
    stock: '',
    unit: 'kg',
    sku: '',
    category: '',
    tags: '',
    origin: '',
    storageType: 'nhiệt độ thường',
    expiryDate: '',
    manufacturingDate: '',
};

export function AdminProductFormPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isEdit = Boolean(id);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [form, setForm] = useState({ ...initialForm });
    const [images, setImages] = useState<string[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(isEdit);
    const [submitting, setSubmitting] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        getCategories()
            .then((data) => setCategories(data.categories || data || []))
            .catch(() => {});

        if (!id) {
            return;
        }

        adminGetProductById(id)
            .then((data) => {
                const product = data.product;
                setForm({
                    name: product.name || '',
                    description: product.description || '',
                    price: String(product.price || ''),
                    stock: String(product.stockQuantity || ''),
                    unit: product.unit || 'kg',
                    sku: product.sku || '',
                    category: product.category?._id || product.category || '',
                    tags: (product.tags || []).join(', '),
                    origin: product.origin || '',
                    storageType: product.storageType || 'nhiệt độ thường',
                    expiryDate: product.expiryDate ? product.expiryDate.slice(0, 10) : '',
                    manufacturingDate: product.manufacturingDate
                        ? product.manufacturingDate.slice(0, 10)
                        : '',
                });
                setImages((product.images || []).map((image: any) => getAdminImageUrl(image)).filter(Boolean));
            })
            .catch(() => setError('Không thể tải thông tin sản phẩm.'))
            .finally(() => setLoading(false));
    }, [id]);

    const handleUploadImages = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []);

        if (!files.length) {
            return;
        }

        setUploading(true);
        setError('');

        try {
            const nextUrls: string[] = [];

            for (const file of files) {
                const reader = new FileReader();
                const base64 = await new Promise<string>((resolve) => {
                    reader.onload = () => resolve(reader.result as string);
                    reader.readAsDataURL(file);
                });

                const result = await uploadImage(base64);
                nextUrls.push(result.url);
            }

            setImages((previous) => [...previous, ...nextUrls]);
        } catch {
            setError('Tải ảnh thất bại. Vui lòng thử lại.');
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError('');
        setSuccess('');

        if (!images.length) {
            setError('Vui lòng tải lên ít nhất một ảnh sản phẩm.');
            return;
        }

        setSubmitting(true);

        const payload = {
            ...form,
            price: Number(form.price),
            stock: Number(form.stock),
            stockQuantity: Number(form.stock),
            images,
            tags: form.tags
                ? form.tags
                      .split(',')
                      .map((item) => item.trim())
                      .filter(Boolean)
                : [],
            expiryDate: form.expiryDate || undefined,
            manufacturingDate: form.manufacturingDate || undefined,
        };

        try {
            if (id) {
                await adminUpdateProduct(id, payload);
                setSuccess('Đã cập nhật sản phẩm thành công.');
            } else {
                await adminCreateProduct(payload);
                setSuccess('Đã tạo sản phẩm mới.');
                setTimeout(() => navigate('/admin/products'), 900);
            }
        } catch (submitError: any) {
            setError(submitError.response?.data?.error || 'Không thể lưu sản phẩm.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="ttdn-admin-card text-center">
                <div className="spinner-border text-success mb-3" role="status" />
                <h2 className="h5 fw-bold text-dark mb-2">Đang tải sản phẩm</h2>
                <p className="text-muted mb-0">Hệ thống đang lấy dữ liệu chỉnh sửa hiện tại.</p>
            </div>
        );
    }

    return (
        <form className="d-grid gap-4" onSubmit={handleSubmit}>
            <section className="ttdn-admin-page-intro">
                <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3">
                    <div>
                        <p className="text-uppercase small fw-bold text-white-50 mb-2">Sản phẩm</p>
                        <h2 className="display-6 fw-bold text-white mb-2">
                            {id ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
                        </h2>
                        <p className="text-white-50 mb-0">
                            Cập nhật nội dung, hình ảnh, tồn kho và thông tin thực phẩm trong cùng một form quản lý.
                        </p>
                    </div>
                    <Link to="/admin/products" className="btn btn-light rounded-pill px-4">
                        <ArrowLeft size={16} className="me-2" />
                        Quay lại danh sách
                    </Link>
                </div>
            </section>

            {error ? (
                <div className="ttdn-admin-card">
                    <div className="d-flex align-items-center gap-2 text-danger">
                        <AlertCircle size={18} />
                        <strong>{error}</strong>
                    </div>
                </div>
            ) : null}

            {success ? (
                <div className="ttdn-admin-card">
                    <div className="d-flex align-items-center gap-2 text-success">
                        <CheckCircle2 size={18} />
                        <strong>{success}</strong>
                    </div>
                </div>
            ) : null}

            <div className="row g-4">
                <div className="col-xl-8">
                    <div className="ttdn-admin-form-grid">
                        <section className="ttdn-admin-card">
                            <div className="d-flex justify-content-between align-items-center gap-3 mb-4">
                                <div>
                                    <p className="text-uppercase small fw-bold theme-color mb-1">Nội dung</p>
                                    <h3 className="h4 fw-bold text-dark mb-0">Thông tin cơ bản</h3>
                                </div>
                            </div>

                            <div className="row g-3">
                                <div className="col-12">
                                    <FieldLabel label="Tên sản phẩm *" />
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={form.name}
                                        onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                                        required
                                    />
                                </div>

                                <div className="col-12">
                                    <FieldLabel label="Mô tả *" />
                                    <textarea
                                        className="form-control"
                                        rows={5}
                                        value={form.description}
                                        onChange={(event) =>
                                            setForm((prev) => ({ ...prev, description: event.target.value }))
                                        }
                                        required
                                    />
                                </div>

                                <div className="col-md-6">
                                    <FieldLabel label="Giá bán *" />
                                    <input
                                        type="number"
                                        min={0}
                                        className="form-control"
                                        value={form.price}
                                        onChange={(event) => setForm((prev) => ({ ...prev, price: event.target.value }))}
                                        required
                                    />
                                </div>

                                <div className="col-md-6">
                                    <FieldLabel label="Tồn kho *" />
                                    <input
                                        type="number"
                                        min={0}
                                        className="form-control"
                                        value={form.stock}
                                        onChange={(event) => setForm((prev) => ({ ...prev, stock: event.target.value }))}
                                        required
                                    />
                                </div>

                                <div className="col-md-6">
                                    <FieldLabel label="Đơn vị tính *" />
                                    <select
                                        className="form-select"
                                        value={form.unit}
                                        onChange={(event) => setForm((prev) => ({ ...prev, unit: event.target.value }))}
                                    >
                                        {units.map((unit) => (
                                            <option key={unit.value} value={unit.value}>
                                                {unit.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="col-md-6">
                                    <FieldLabel label="Danh mục" />
                                    <select
                                        className="form-select"
                                        value={form.category}
                                        onChange={(event) =>
                                            setForm((prev) => ({ ...prev, category: event.target.value }))
                                        }
                                    >
                                        <option value="">Chọn danh mục</option>
                                        {categories.map((category) => (
                                            <option key={category._id} value={category._id}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="col-md-6">
                                    <FieldLabel label="SKU" />
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={form.sku}
                                        onChange={(event) => setForm((prev) => ({ ...prev, sku: event.target.value }))}
                                    />
                                </div>

                                <div className="col-md-6">
                                    <FieldLabel label="Tags" />
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={form.tags}
                                        onChange={(event) => setForm((prev) => ({ ...prev, tags: event.target.value }))}
                                        placeholder="rau sạch, hữu cơ, premium"
                                    />
                                </div>
                            </div>
                        </section>

                        <section className="ttdn-admin-card">
                            <div className="d-flex justify-content-between align-items-center gap-3 mb-4">
                                <div>
                                    <p className="text-uppercase small fw-bold theme-color mb-1">Thực phẩm</p>
                                    <h3 className="h4 fw-bold text-dark mb-0">Thông tin bổ sung</h3>
                                </div>
                            </div>

                            <div className="row g-3">
                                <div className="col-md-6">
                                    <FieldLabel label="Nguồn gốc" />
                                    <select
                                        className="form-select"
                                        value={form.origin}
                                        onChange={(event) => setForm((prev) => ({ ...prev, origin: event.target.value }))}
                                    >
                                        <option value="">Chọn nguồn gốc</option>
                                        {origins.map((origin) => (
                                            <option key={origin} value={origin}>
                                                {origin}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="col-md-6">
                                    <FieldLabel label="Bảo quản" />
                                    <select
                                        className="form-select"
                                        value={form.storageType}
                                        onChange={(event) =>
                                            setForm((prev) => ({ ...prev, storageType: event.target.value }))
                                        }
                                    >
                                        {storageTypes.map((storageType) => (
                                            <option key={storageType.value} value={storageType.value}>
                                                {storageType.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="col-md-6">
                                    <FieldLabel label="Ngày sản xuất" />
                                    <input
                                        type="date"
                                        className="form-control"
                                        value={form.manufacturingDate}
                                        onChange={(event) =>
                                            setForm((prev) => ({ ...prev, manufacturingDate: event.target.value }))
                                        }
                                    />
                                </div>

                                <div className="col-md-6">
                                    <FieldLabel label="Hạn sử dụng" />
                                    <input
                                        type="date"
                                        className="form-control"
                                        value={form.expiryDate}
                                        onChange={(event) =>
                                            setForm((prev) => ({ ...prev, expiryDate: event.target.value }))
                                        }
                                    />
                                </div>
                            </div>
                        </section>
                    </div>
                </div>

                <div className="col-xl-4">
                    <div className="ttdn-admin-form-grid">
                        <section className="ttdn-admin-card">
                            <div className="d-flex justify-content-between align-items-center gap-3 mb-3">
                                <div>
                                    <p className="text-uppercase small fw-bold theme-color mb-1">Gallery</p>
                                    <h3 className="h4 fw-bold text-dark mb-0">Hình ảnh sản phẩm</h3>
                                </div>
                            </div>

                            <p className="ttdn-admin-note mb-4">
                                Ảnh đầu tiên sẽ được ưu tiên hiển thị ở storefront và bảng quản trị.
                            </p>

                            <button
                                type="button"
                                className="btn btn-light rounded-pill w-100 mb-4"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading}
                            >
                                {uploading ? (
                                    <Loader2 size={16} className="me-2" />
                                ) : (
                                    <ImagePlus size={16} className="me-2" />
                                )}
                                {uploading ? 'Đang tải ảnh...' : 'Tải thêm ảnh'}
                            </button>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                multiple
                                className="d-none"
                                onChange={handleUploadImages}
                            />

                            <div className="ttdn-admin-upload-grid">
                                {images.map((image, index) => (
                                    <div key={`${image}-${index}`} className="ttdn-admin-upload-item">
                                        <img src={image} alt={`Sản phẩm ${index + 1}`} />
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-danger position-absolute top-0 end-0 m-2 rounded-pill"
                                            onClick={() => setImages((prev) => prev.filter((_, itemIndex) => itemIndex !== index))}
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                        {index === 0 ? (
                                            <span className="badge bg-success position-absolute start-0 bottom-0 m-2">
                                                Chính
                                            </span>
                                        ) : null}
                                    </div>
                                ))}

                                <button
                                    type="button"
                                    className="ttdn-admin-upload-item btn btn-light d-flex flex-column align-items-center justify-content-center gap-2"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <Plus size={20} />
                                    <span>Thêm ảnh</span>
                                </button>
                            </div>
                        </section>

                        <section className="ttdn-admin-card">
                            <div className="d-grid gap-2">
                                <button
                                    type="submit"
                                    className="btn theme-bg-color text-white rounded-pill"
                                    disabled={submitting || uploading}
                                >
                                    {submitting ? <Loader2 size={16} className="me-2" /> : null}
                                    {id ? 'Lưu thay đổi' : 'Tạo sản phẩm'}
                                </button>
                                <Link to="/admin/products" className="btn btn-light rounded-pill">
                                    Hủy bỏ
                                </Link>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </form>
    );
}

function FieldLabel({ label }: { label: string }) {
    return <label className="form-label text-muted small text-uppercase fw-bold mb-2">{label}</label>;
}
