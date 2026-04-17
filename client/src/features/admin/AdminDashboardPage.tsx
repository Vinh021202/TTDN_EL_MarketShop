import { useEffect, useMemo, useState } from 'react';
import {
    AlertCircle,
    CheckCircle2,
    Clock3,
    Package,
    ShoppingBag,
    Sparkles,
    TrendingUp,
    Truck,
    Users,
    XCircle,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatAdminCurrency, getAdminOrderStatusClassName, getAdminOrderStatusLabel } from './adminPresentation';
import { getDashboardStats } from './services/adminApi';

const statusIcons: Record<string, React.ElementType> = {
    pending: Clock3,
    confirmed: CheckCircle2,
    preparing: Package,
    shipping: Truck,
    completed: CheckCircle2,
    cancelled: XCircle,
};

const statusDescriptions: Record<string, string> = {
    pending: 'Đơn mới chờ xác nhận',
    confirmed: 'Đơn đã được duyệt',
    preparing: 'Đơn đang được chuẩn bị',
    shipping: 'Đơn đang trên đường giao',
    completed: 'Đơn đã hoàn tất',
    cancelled: 'Đơn đã hủy',
};

export function AdminDashboardPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        getDashboardStats()
            .then(setData)
            .catch(() => setError('Không thể tải dữ liệu dashboard.'))
            .finally(() => setLoading(false));
    }, []);

    const statCards = useMemo(() => {
        const stats = data?.stats || {};

        return [
            {
                label: 'Tổng doanh thu',
                value: formatAdminCurrency(stats.totalRevenue || 0),
                note: `Tháng này: ${formatAdminCurrency(stats.monthlyRevenue || 0)}`,
                icon: TrendingUp,
            },
            {
                label: 'Đơn hôm nay',
                value: stats.todayOrders || 0,
                note: `Mọi trạng thái: ${Object.values(stats.ordersByStatus || {}).reduce(
                    (sum: number, count: any) => sum + Number(count || 0),
                    0
                )}`,
                icon: ShoppingBag,
            },
            {
                label: 'Sản phẩm đang bán',
                value: stats.activeProducts || 0,
                note: `Tổng sản phẩm: ${stats.totalProducts || 0}`,
                icon: Package,
            },
            {
                label: 'Người dùng',
                value: stats.totalUsers || 0,
                note: 'Tài khoản đang có trên hệ thống',
                icon: Users,
            },
        ];
    }, [data?.stats]);

    if (loading) {
        return (
            <div className="ttdn-admin-card text-center">
                <div className="spinner-border text-success mb-3" role="status" />
                <h2 className="h5 fw-bold text-dark mb-2">Đang tải dashboard</h2>
                <p className="text-muted mb-0">Hệ thống đang lấy số liệu mới nhất từ admin API.</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="ttdn-admin-card">
                <div className="d-flex align-items-center gap-2 text-danger">
                    <AlertCircle size={18} />
                    <strong>{error}</strong>
                </div>
            </div>
        );
    }

    const stats = data?.stats || {};
    const recentOrders = data?.recentOrders || [];
    const topProducts = data?.topProducts || [];

    return (
        <div className="d-grid gap-4">
            <section className="ttdn-admin-page-intro">
                <div className="row g-4 align-items-center">
                    <div className="col-lg-8">
                        <p className="text-uppercase small fw-bold text-white-50 mb-2">Tổng quan</p>
                        <h2 className="display-6 fw-bold text-white mb-3">
                            Quản trị cửa hàng tập trung, rõ ràng và dễ theo dõi.
                        </h2>
                        <p className="text-white-50 mb-0">
                            Theo dõi doanh thu, trạng thái đơn hàng và nhóm sản phẩm nổi bật ngay từ dashboard chính.
                        </p>
                    </div>
                    <div className="col-lg-4">
                        <div className="ttdn-admin-card bg-transparent border border-white border-opacity-25 shadow-none text-white">
                            <p className="text-white-50 mb-1">Đơn chờ xử lý</p>
                            <h3 className="h2 fw-bold text-white mb-2">{stats.ordersByStatus?.pending || 0}</h3>
                            <p className="text-white-50 mb-0">
                                Hoàn thành: {stats.ordersByStatus?.completed || 0} đơn
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="row g-4">
                {statCards.map((card) => (
                    <div key={card.label} className="col-sm-6 col-xl-3">
                        <div className="ttdn-admin-stat-card">
                            <div className="d-flex justify-content-between gap-3">
                                <div>
                                    <p className="text-muted text-uppercase small fw-bold mb-2">{card.label}</p>
                                    <h3 className="h3 fw-bold text-dark mb-2">{card.value}</h3>
                                    <p className="text-muted mb-0 small">{card.note}</p>
                                </div>
                                <span className="ttdn-admin-stat-icon">
                                    <card.icon size={22} />
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </section>

            <section className="ttdn-admin-card">
                <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
                    <div>
                        <p className="text-uppercase small fw-bold theme-color mb-1">Đơn hàng</p>
                        <h3 className="h4 fw-bold text-dark mb-0">Trạng thái hiện tại</h3>
                    </div>
                    <Link to="/admin/orders" className="btn btn-light rounded-pill">
                        Xem tất cả đơn
                    </Link>
                </div>

                <div className="row g-3">
                    {Object.entries(statusIcons).map(([status, Icon]) => (
                        <div key={status} className="col-sm-6 col-xl-2">
                            <div className={`ttdn-admin-order-status-card ttdn-admin-order-status-card--${status}`}>
                                <div className="d-flex justify-content-between align-items-start gap-3 mb-4">
                                    <span className={getAdminOrderStatusClassName(status)}>
                                        <Icon size={14} className="me-2" />
                                        {getAdminOrderStatusLabel(status)}
                                    </span>
                                    <span className={`ttdn-admin-order-status-dot ttdn-admin-order-status-dot--${status}`} />
                                </div>
                                <h3 className="ttdn-admin-order-status-count">
                                    {stats.ordersByStatus?.[status] || 0}
                                </h3>
                                <p className="ttdn-admin-order-status-meta mb-1">đơn</p>
                                <p className="ttdn-admin-order-status-caption mb-0">
                                    {statusDescriptions[status]}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section className="row g-4">
                <div className="col-xl-6">
                    <div className="ttdn-admin-card h-100">
                        <div className="d-flex justify-content-between align-items-center gap-3 mb-4">
                            <div>
                                <p className="text-uppercase small fw-bold theme-color mb-1">Mới nhất</p>
                                <h3 className="h4 fw-bold text-dark mb-0">Đơn hàng gần đây</h3>
                            </div>
                            <Link to="/admin/orders" className="btn btn-light rounded-pill btn-sm px-3">
                                Quản lý đơn
                            </Link>
                        </div>

                        <div className="d-grid gap-3">
                            {recentOrders.slice(0, 6).map((order: any) => (
                                <Link
                                    key={order._id}
                                    to={`/admin/orders/${order._id}`}
                                    className="ttdn-order-item-card text-decoration-none"
                                >
                                    <div className="d-flex justify-content-between gap-3">
                                        <div className="min-w-0">
                                            <p className="fw-bold text-dark mb-1 text-truncate">
                                                {order.orderNumber}
                                            </p>
                                            <p className="text-muted mb-0 small">
                                                {order.user?.name || 'Khách lẻ'}
                                            </p>
                                        </div>
                                        <div className="text-end">
                                            <p className="fw-bold theme-color mb-1">
                                                {formatAdminCurrency(order.total || 0)}
                                            </p>
                                            <span
                                                className={`badge rounded-pill px-3 py-2 ${getAdminOrderStatusClassName(
                                                    order.orderStatus
                                                )}`}
                                            >
                                                {getAdminOrderStatusLabel(order.orderStatus)}
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="col-xl-6">
                    <div className="ttdn-admin-card h-100">
                        <div className="d-flex justify-content-between align-items-center gap-3 mb-4">
                            <div>
                                <p className="text-uppercase small fw-bold theme-color mb-1">Bán chạy</p>
                                <h3 className="h4 fw-bold text-dark mb-0">Sản phẩm nổi bật</h3>
                            </div>
                            <Link to="/admin/products" className="btn btn-light rounded-pill btn-sm px-3">
                                Xem kho hàng
                            </Link>
                        </div>

                        <div className="d-grid gap-3">
                            {topProducts.map((product: any, index: number) => (
                                <div key={product._id} className="ttdn-order-item-card">
                                    <div className="d-flex justify-content-between align-items-center gap-3">
                                        <div className="d-flex align-items-center gap-3 min-w-0">
                                            <span className="ttdn-admin-stat-icon">{index + 1}</span>
                                            <div className="min-w-0">
                                                <p className="fw-bold text-dark mb-1 text-truncate">
                                                    {product.name}
                                                </p>
                                                <p className="text-muted mb-0 small">
                                                    Đã bán {product.totalSold || 0} sản phẩm
                                                </p>
                                            </div>
                                        </div>
                                        <p className="fw-bold theme-color mb-0">
                                            {formatAdminCurrency(product.totalRevenue || 0)}
                                        </p>
                                    </div>
                                </div>
                            ))}

                            {!topProducts.length ? (
                                <div className="ttdn-admin-note">
                                    <div className="d-flex align-items-center gap-2">
                                        <Sparkles size={16} className="text-success" />
                                        <span>Chưa có dữ liệu bán chạy để hiển thị.</span>
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
