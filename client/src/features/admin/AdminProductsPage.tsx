import { useEffect, useState } from 'react';
import { AlertCircle, Pencil, Plus, RefreshCw, Search, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatAdminCurrency, getAdminFirstImageUrl } from './adminPresentation';
import { adminDeleteProduct, adminGetAllProducts } from './services/adminApi';

export function AdminProductsPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchProducts = async (nextPage = page, nextSearch = search) => {
        setLoading(true);
        setError('');

        try {
            const data = await adminGetAllProducts({
                page: nextPage,
                limit: 15,
                search: nextSearch || undefined,
            });

            setProducts(data.products || []);
            setTotal(data.pagination?.total || 0);
            setTotalPages(data.pagination?.totalPages || 1);
        } catch {
            setError('Không thể tải danh sách sản phẩm.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleSearch = (event: React.FormEvent) => {
        event.preventDefault();
        setPage(1);
        fetchProducts(1, search);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Bạn chắc chắn muốn ẩn sản phẩm này?')) {
            return;
        }

        try {
            await adminDeleteProduct(id);
            fetchProducts(page, search);
        } catch {
            setError('Không thể cập nhật trạng thái sản phẩm.');
        }
    };

    return (
        <div className="d-grid gap-4">
            <section className="ttdn-admin-page-intro">
                <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3">
                    <div>
                        <p className="text-uppercase small fw-bold text-white-50 mb-2">Sản phẩm</p>
                        <h2 className="display-6 fw-bold text-white mb-2">Quản lý kho sản phẩm</h2>
                        <p className="text-white-50 mb-0">
                            Xem tồn kho, giá bán và cập nhật trạng thái sản phẩm ngay trong giao diện quản trị.
                        </p>
                    </div>
                    <div className="d-flex flex-column align-items-start align-items-lg-end gap-3">
                        <div className="ttdn-admin-card bg-transparent border border-white border-opacity-25 shadow-none text-white">
                            <p className="text-white-50 mb-1">Tổng sản phẩm</p>
                            <h3 className="h2 fw-bold text-white mb-0">{total}</h3>
                        </div>
                        <Link to="/admin/products/new" className="btn rounded-pill px-4 ttdn-admin-hero-light-btn">
                            <Plus size={16} className="me-2" />
                            Thêm sản phẩm
                        </Link>
                    </div>
                </div>
            </section>

            <section className="ttdn-admin-toolbar">
                <form className="row g-3 flex-grow-1" onSubmit={handleSearch}>
                    <div className="col-lg-8">
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
                                placeholder="Tìm theo tên sản phẩm, SKU hoặc danh mục..."
                            />
                        </div>
                    </div>
                    <div className="col-lg-4 d-flex align-items-end gap-2">
                        <button type="submit" className="btn theme-bg-color text-white rounded-pill px-4">
                            Tìm
                        </button>
                        <button
                            type="button"
                            className="btn btn-light rounded-pill px-4"
                            onClick={() => {
                                setSearch('');
                                setPage(1);
                                fetchProducts(1, '');
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
                                <th>Sản phẩm</th>
                                <th>Giá bán</th>
                                <th>Tồn kho</th>
                                <th>Trạng thái</th>
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
                            ) : products.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center text-muted py-5">
                                        Chưa có sản phẩm nào phù hợp.
                                    </td>
                                </tr>
                            ) : (
                                products.map((product) => {
                                    const imageUrl = getAdminFirstImageUrl(product.images);

                                    return (
                                        <tr key={product._id}>
                                            <td>
                                                <div className="ttdn-admin-table-media">
                                                    <div className="ttdn-admin-thumb">
                                                        {imageUrl ? (
                                                            <img src={imageUrl} alt={product.name} />
                                                        ) : (
                                                            <div className="w-100 h-100 d-flex align-items-center justify-content-center text-muted small">
                                                                N/A
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="fw-bold text-dark mb-1 text-truncate">
                                                            {product.name}
                                                        </p>
                                                        <p className="text-muted mb-0 small">
                                                            {product.category?.name || 'Chưa có danh mục'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <p className="fw-bold text-dark mb-0">
                                                    {formatAdminCurrency(product.price || 0)}
                                                </p>
                                                <small className="text-muted">/ {product.unit || 'đơn vị'}</small>
                                            </td>
                                            <td>
                                                <span
                                                    className={`fw-bold ${
                                                        product.stockQuantity === 0
                                                            ? 'text-danger'
                                                            : product.stockQuantity < 10
                                                              ? 'text-warning'
                                                              : 'text-success'
                                                    }`}
                                                >
                                                    {product.stockQuantity}
                                                </span>
                                            </td>
                                            <td>
                                                <span
                                                    className={`badge rounded-pill px-3 py-2 ${
                                                        product.isActive
                                                            ? 'bg-success-subtle text-success-emphasis'
                                                            : 'bg-danger-subtle text-danger-emphasis'
                                                    }`}
                                                >
                                                    {product.isActive ? 'Đang bán' : 'Đã ẩn'}
                                                </span>
                                            </td>
                                            <td className="text-end">
                                                <div className="d-inline-flex gap-2">
                                                    <Link
                                                        to={`/admin/products/${product._id}/edit`}
                                                        className="btn btn-light rounded-pill"
                                                    >
                                                        <Pencil size={16} />
                                                    </Link>
                                                    <button
                                                        type="button"
                                                        className="btn btn-outline-danger rounded-pill"
                                                        onClick={() => handleDelete(product._id)}
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
                                    fetchProducts(nextPage, search);
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
                                    fetchProducts(nextPage, search);
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
