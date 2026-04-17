import { useEffect, useState } from 'react';
import { AlertCircle, Eye, RefreshCw, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
    adminOrderStatusOptions,
    formatAdminCurrency,
    formatAdminDateTime,
    getAdminOrderStatusClassName,
    getAdminOrderStatusLabel,
} from './adminPresentation';
import { adminGetAllOrders } from './services/adminApi';

export function AdminOrdersPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [status, setStatus] = useState('');
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchOrders = async (nextPage = page, nextStatus = status, nextSearch = search) => {
        setLoading(true);
        setError('');

        try {
            const data = await adminGetAllOrders({
                page: nextPage,
                limit: 15,
                status: nextStatus || undefined,
                search: nextSearch || undefined,
            });

            setOrders(data.orders || []);
            setTotal(data.pagination?.total || 0);
            setTotalPages(data.pagination?.totalPages || 1);
        } catch {
            setError('Không thể tải danh sách đơn hàng.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleSearch = (event: React.FormEvent) => {
        event.preventDefault();
        setPage(1);
        fetchOrders(1, status, search);
    };

    return (
        <div className="d-grid gap-4">
            <section className="ttdn-admin-page-intro">
                <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3">
                    <div>
                        <p className="text-uppercase small fw-bold text-white-50 mb-2">Đơn hàng</p>
                        <h2 className="display-6 fw-bold text-white mb-2">Theo dõi đơn hàng toàn hệ thống</h2>
                        <p className="text-white-50 mb-0">
                            Lọc theo trạng thái, tìm mã đơn và mở chi tiết xử lý ngay trong khu quản trị.
                        </p>
                    </div>
                    <div className="ttdn-admin-card bg-transparent border border-white border-opacity-25 shadow-none text-white">
                        <p className="text-white-50 mb-1">Tổng đơn</p>
                        <h3 className="h2 fw-bold text-white mb-0">{total}</h3>
                    </div>
                </div>
            </section>

            <section className="ttdn-admin-toolbar">
                <form className="row g-3 flex-grow-1" onSubmit={handleSearch}>
                    <div className="col-lg-6">
                        <label className="form-label text-muted small text-uppercase fw-bold mb-2">
                            Tìm mã đơn
                        </label>
                        <div className="storefront-search-shell">
                            <Search size={18} className="text-success flex-shrink-0" />
                            <input
                                type="search"
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                className="storefront-search-input"
                                placeholder="VD: ORD-2026-0001"
                            />
                        </div>
                    </div>

                    <div className="col-lg-3">
                        <label className="form-label text-muted small text-uppercase fw-bold mb-2">
                            Trạng thái
                        </label>
                        <select
                            className="form-select"
                            value={status}
                            onChange={(event) => {
                                const nextStatus = event.target.value;
                                setStatus(nextStatus);
                                setPage(1);
                                fetchOrders(1, nextStatus, search);
                            }}
                        >
                            {adminOrderStatusOptions.map((option) => (
                                <option key={option.value || 'all'} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="col-lg-3 d-flex align-items-end gap-2">
                        <button type="submit" className="btn theme-bg-color text-white rounded-pill px-4">
                            Tìm
                        </button>
                        <button
                            type="button"
                            className="btn btn-light rounded-pill px-4"
                            onClick={() => {
                                setSearch('');
                                setStatus('');
                                setPage(1);
                                fetchOrders(1, '', '');
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
                                <th>Mã đơn</th>
                                <th>Khách hàng</th>
                                <th>Ngày đặt</th>
                                <th>Tổng tiền</th>
                                <th>Khung giao</th>
                                <th>Trạng thái</th>
                                <th className="text-end">Chi tiết</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array.from({ length: 5 }).map((_, index) => (
                                    <tr key={index}>
                                        <td colSpan={7}>
                                            <div className="placeholder-glow">
                                                <span className="placeholder col-12" style={{ height: 28 }} />
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : orders.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center text-muted py-5">
                                        Không có đơn hàng nào phù hợp.
                                    </td>
                                </tr>
                            ) : (
                                orders.map((order) => (
                                    <tr key={order._id}>
                                        <td>
                                            <p className="fw-bold text-dark mb-1">{order.orderNumber}</p>
                                            <small className="text-muted">{order.paymentMethod}</small>
                                        </td>
                                        <td>
                                            <p className="fw-bold text-dark mb-1">{order.user?.name || 'Khách lẻ'}</p>
                                            <small className="text-muted">{order.user?.email || '---'}</small>
                                        </td>
                                        <td>{formatAdminDateTime(order.createdAt)}</td>
                                        <td className="fw-bold theme-color">{formatAdminCurrency(order.total || 0)}</td>
                                        <td>{order.deliverySlot || 'Chưa xếp'}</td>
                                        <td>
                                            <span
                                                className={`badge rounded-pill px-3 py-2 ${getAdminOrderStatusClassName(
                                                    order.orderStatus
                                                )}`}
                                            >
                                                {getAdminOrderStatusLabel(order.orderStatus)}
                                            </span>
                                        </td>
                                        <td className="text-end">
                                            <Link
                                                to={`/admin/orders/${order._id}`}
                                                className="btn btn-light rounded-pill"
                                            >
                                                <Eye size={16} />
                                            </Link>
                                        </td>
                                    </tr>
                                ))
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
                                    fetchOrders(nextPage, status, search);
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
                                    fetchOrders(nextPage, status, search);
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
