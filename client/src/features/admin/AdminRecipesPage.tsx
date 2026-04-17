import { useEffect, useState } from 'react';
import {
    AlertCircle,
    ExternalLink,
    Pencil,
    Plus,
    RefreshCw,
    Search,
    Star,
    Trash2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatAdminDate, getAdminImageUrl } from './adminPresentation';
import { AdminRecipe, adminDeleteRecipe, adminGetAllRecipes } from './services/adminApi';

const difficultyOptions = [
    { value: '', label: 'Tất cả độ khó' },
    { value: 'dễ', label: 'Dễ' },
    { value: 'trung bình', label: 'Trung bình' },
    { value: 'khó', label: 'Khó' },
];

const getTotalTimeLabel = (recipe: AdminRecipe) => `${(recipe.prepTime || 0) + (recipe.cookTime || 0)} phút`;

export function AdminRecipesPage() {
    const [recipes, setRecipes] = useState<AdminRecipe[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');
    const [difficulty, setDifficulty] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchRecipes = async (nextPage = page, nextSearch = search, nextDifficulty = difficulty) => {
        setLoading(true);
        setError('');

        try {
            const data = await adminGetAllRecipes({
                page: nextPage,
                limit: 12,
                search: nextSearch || undefined,
                difficulty: nextDifficulty || undefined,
            });

            setRecipes(data.recipes || []);
            setTotal(data.pagination?.total || 0);
            setTotalPages(data.pagination?.totalPages || 1);
        } catch {
            setError('Không thể tải danh sách công thức.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRecipes();
    }, []);

    const handleSearch = (event: React.FormEvent) => {
        event.preventDefault();
        setPage(1);
        fetchRecipes(1, search, difficulty);
    };

    const handleDelete = async (id: string, name: string) => {
        if (!window.confirm(`Bạn chắc chắn muốn xóa hẳn công thức "${name}"?`)) {
            return;
        }

        try {
            await adminDeleteRecipe(id);
            fetchRecipes(page, search, difficulty);
        } catch {
            setError('Không thể xóa công thức.');
        }
    };

    return (
        <div className="d-grid gap-4">
            <section className="ttdn-admin-page-intro">
                <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3">
                    <div>
                        <p className="text-uppercase small fw-bold text-white-50 mb-2">Công thức</p>
                        <h2 className="display-6 fw-bold text-white mb-2">Quản lý nội dung công thức</h2>
                        <p className="text-white-50 mb-0">
                            Theo dõi công thức hiện có và chuẩn bị sẵn luồng thêm, sửa, xóa cho đội vận hành.
                        </p>
                    </div>

                    <div className="d-flex flex-column align-items-start align-items-lg-end gap-3">
                        <div className="ttdn-admin-card bg-transparent border border-white border-opacity-25 shadow-none text-white">
                            <p className="text-white-50 mb-1">Tổng công thức</p>
                            <h3 className="h2 fw-bold text-white mb-0">{total}</h3>
                        </div>
                        <Link to="/admin/recipes/new" className="btn rounded-pill px-4 ttdn-admin-hero-light-btn">
                            <Plus size={16} className="me-2" />
                            Thêm công thức
                        </Link>
                    </div>
                </div>
            </section>

            <section className="ttdn-admin-toolbar">
                <form className="row g-3 flex-grow-1" onSubmit={handleSearch}>
                    <div className="col-lg-7">
                        <label className="form-label text-muted small text-uppercase fw-bold mb-2">
                            Tìm kiếm
                        </label>
                        <div className="storefront-search-shell">
                            <Search size={18} className="text-success flex-shrink-0" />
                            <input
                                type="search"
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                className="storefront-search-input"
                                placeholder="Tìm theo tên công thức, slug hoặc tag..."
                            />
                        </div>
                    </div>

                    <div className="col-lg-3">
                        <label className="form-label text-muted small text-uppercase fw-bold mb-2">
                            Độ khó
                        </label>
                        <select
                            className="form-select"
                            value={difficulty}
                            onChange={(event) => setDifficulty(event.target.value)}
                        >
                            {difficultyOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="col-lg-2 d-flex align-items-end gap-2">
                        <button type="submit" className="btn theme-bg-color text-white rounded-pill px-4">
                            Tìm
                        </button>
                        <button
                            type="button"
                            className="btn btn-light rounded-pill px-4"
                            onClick={() => {
                                setSearch('');
                                setDifficulty('');
                                setPage(1);
                                fetchRecipes(1, '', '');
                            }}
                        >
                            <RefreshCw size={16} className="me-2" />
                            Làm mới
                        </button>
                    </div>
                </form>
            </section>

            {error ? (
                <div className="ttdn-admin-card">
                    <div className="d-flex align-items-center gap-2 text-danger">
                        <AlertCircle size={18} />
                        <strong>{error}</strong>
                    </div>
                </div>
            ) : null}

            <section className="ttdn-admin-table-shell">
                <div className="table-responsive">
                    <table>
                        <thead>
                            <tr>
                                <th>Công thức</th>
                                <th>Độ khó</th>
                                <th>Thời lượng</th>
                                <th>Hiển thị</th>
                                <th className="text-end">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array.from({ length: 5 }).map((_, index) => (
                                    <tr key={index}>
                                        <td colSpan={5}>
                                            <div className="placeholder-glow">
                                                <span className="placeholder col-12" style={{ height: 28 }} />
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : recipes.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center text-muted py-5">
                                        Chưa có công thức nào phù hợp.
                                    </td>
                                </tr>
                            ) : (
                                recipes.map((recipe) => {
                                    const imageUrl = getAdminImageUrl(recipe.thumbnail);
                                    const ingredientCount = Array.isArray(recipe.ingredients)
                                        ? recipe.ingredients.length
                                        : 0;
                                    const stepCount = Array.isArray(recipe.steps) ? recipe.steps.length : 0;

                                    return (
                                        <tr key={recipe._id}>
                                            <td>
                                                <div className="ttdn-admin-table-media">
                                                    <div className="ttdn-admin-thumb">
                                                        {imageUrl ? (
                                                            <img src={imageUrl} alt={recipe.name} />
                                                        ) : (
                                                            <div className="w-100 h-100 d-flex align-items-center justify-content-center text-muted small">
                                                                N/A
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="min-w-0">
                                                        <p className="fw-bold text-dark mb-1 text-truncate">
                                                            {recipe.name}
                                                        </p>
                                                        <div className="d-flex flex-wrap align-items-center gap-2 small text-muted">
                                                            <span>{ingredientCount} nguyên liệu</span>
                                                            <span>•</span>
                                                            <span>{stepCount} bước</span>
                                                            <span>•</span>
                                                            <span>{recipe.servings} khẩu phần</span>
                                                        </div>
                                                        <p className="text-muted mb-0 small mt-1 text-truncate">
                                                            Cập nhật {formatAdminDate(recipe.updatedAt)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            <td>
                                                <span className="badge rounded-pill bg-light text-dark px-3 py-2">
                                                    {recipe.difficulty}
                                                </span>
                                            </td>

                                            <td>
                                                <p className="fw-bold text-dark mb-1">{getTotalTimeLabel(recipe)}</p>
                                                <small className="text-muted">
                                                    Sơ chế {recipe.prepTime} phút • Nấu {recipe.cookTime} phút
                                                </small>
                                            </td>

                                            <td>
                                                <div className="d-grid gap-2 justify-items-start">
                                                    <span
                                                        className={`badge rounded-pill px-3 py-2 ${
                                                            recipe.isActive
                                                                ? 'bg-success-subtle text-success-emphasis'
                                                                : 'bg-danger-subtle text-danger-emphasis'
                                                        }`}
                                                    >
                                                        {recipe.isActive ? 'Đang hiển thị' : 'Đã ẩn'}
                                                    </span>

                                                    <span
                                                        className={`badge rounded-pill px-3 py-2 ${
                                                            recipe.isFeatured
                                                                ? 'bg-warning-subtle text-warning-emphasis'
                                                                : 'bg-light text-muted'
                                                        }`}
                                                    >
                                                        <Star size={12} className="me-1" />
                                                        {recipe.isFeatured ? 'Nổi bật' : 'Thường'}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="text-end">
                                                <div className="d-inline-flex gap-2 flex-wrap justify-content-end">
                                                    <a
                                                        href={`/recipes/${recipe.slug}`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="btn btn-light rounded-pill"
                                                        title="Xem ngoài cửa hàng"
                                                    >
                                                        <ExternalLink size={16} />
                                                    </a>
                                                    <Link
                                                        to={`/admin/recipes/${recipe._id}/edit`}
                                                        className="btn btn-light rounded-pill"
                                                        title="Chỉnh sửa công thức"
                                                    >
                                                        <Pencil size={16} />
                                                    </Link>
                                                    <button
                                                        type="button"
                                                        className="btn btn-outline-danger rounded-pill"
                                                        title="Xóa công thức"
                                                        onClick={() => handleDelete(recipe._id, recipe.name)}
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 ? (
                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 px-4 py-4 border-top">
                        <p className="text-muted mb-0">
                            Trang {page} / {totalPages}
                        </p>

                        <div className="d-flex gap-2">
                            <button
                                type="button"
                                className="btn btn-light rounded-pill px-4"
                                disabled={page === 1}
                                onClick={() => {
                                    const nextPage = Math.max(1, page - 1);
                                    setPage(nextPage);
                                    fetchRecipes(nextPage, search, difficulty);
                                }}
                            >
                                Trước
                            </button>
                            <button
                                type="button"
                                className="btn btn-light rounded-pill px-4"
                                disabled={page === totalPages}
                                onClick={() => {
                                    const nextPage = Math.min(totalPages, page + 1);
                                    setPage(nextPage);
                                    fetchRecipes(nextPage, search, difficulty);
                                }}
                            >
                                Sau
                            </button>
                        </div>
                    </div>
                ) : null}
            </section>
        </div>
    );
}
