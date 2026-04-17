import { useEffect, useMemo, useState } from 'react';
import {
    AlertCircle,
    ArrowLeft,
    CheckCircle2,
    Clock3,
    CreditCard,
    Loader2,
    MapPin,
    Package,
    XCircle,
} from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
    adminOrderFlow,
    formatAdminCurrency,
    formatAdminDateTime,
    getAdminFirstImageUrl,
    getAdminOrderStatusClassName,
    getAdminOrderStatusLabel,
} from './adminPresentation';
import { adminGetOrderDetail, adminUpdateOrderStatus } from './services/adminApi';

const paymentMethodLabels: Record<string, string> = {
    cod: 'Thanh toán khi nhận hàng',
    bank_transfer: 'Chuyển khoản ngân hàng',
};

const paymentStatusLabels: Record<string, string> = {
    pending: 'Chờ thanh toán',
    paid: 'Đã thanh toán',
    failed: 'Thất bại',
    refunded: 'Đã hoàn tiền',
};

export function AdminOrderDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const fetchOrder = async () => {
        if (!id) {
            return;
        }

        setLoading(true);
        setError('');

        try {
            const data = await adminGetOrderDetail(id);
            setOrder(data.order);
        } catch {
            setError('Không thể tải chi tiết đơn hàng.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrder();
    }, [id]);

    const nextStatus = useMemo(() => {
        if (!order?.orderStatus) {
            return null;
        }

        const currentIndex = adminOrderFlow.indexOf(order.orderStatus);

        if (currentIndex === -1 || currentIndex === adminOrderFlow.length - 1) {
            return null;
        }

        return adminOrderFlow[currentIndex + 1];
    }, [order?.orderStatus]);

    const handleUpdateStatus = async (status: string) => {
        if (!id) {
            return;
        }

        setUpdating(true);
        setError('');

        try {
            await adminUpdateOrderStatus(id, status);
            setSuccess(`Đã cập nhật đơn sang trạng thái "${getAdminOrderStatusLabel(status)}".`);
            fetchOrder();
        } catch (updateError: any) {
            setError(updateError.response?.data?.error || 'Không thể cập nhật đơn hàng.');
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="ttdn-admin-card text-center">
                <div className="spinner-border text-success mb-3" role="status" />
                <h2 className="h5 fw-bold text-dark mb-2">Đang tải đơn hàng</h2>
                <p className="text-muted mb-0">Hệ thống đang lấy thông tin mới nhất từ order API.</p>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="ttdn-admin-card text-center">
                <h2 className="h5 fw-bold text-dark mb-2">Không tìm thấy đơn hàng</h2>
                <p className="text-muted mb-4">Đơn hàng có thể không còn tồn tại hoặc không khả dụng lúc này.</p>
                <Link to="/admin/orders" className="btn btn-light rounded-pill px-4">
                    Quay lại danh sách
                </Link>
            </div>
        );
    }

    const canCancel = ['pending', 'confirmed'].includes(order.orderStatus);

    return (
        <div className="d-grid gap-4">
            <section className="ttdn-admin-page-intro">
                <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3">
                    <div>
                        <p className="text-uppercase small fw-bold text-white-50 mb-2">Chi tiết đơn hàng</p>
                        <h2 className="display-6 fw-bold text-white mb-2">Đơn #{order.orderNumber}</h2>
                        <p className="text-white-50 mb-0">Tạo lúc {formatAdminDateTime(order.createdAt)}</p>
                    </div>
                    <div className="d-flex flex-wrap gap-2">
                        <button
                            type="button"
                            className="btn rounded-pill px-4 ttdn-admin-hero-light-btn"
                            onClick={() => navigate('/admin/orders')}
                        >
                            <ArrowLeft size={16} className="me-2" />
                            Quay lại
                        </button>
                        <span
                            className={`badge rounded-pill px-3 py-2 align-self-center ${getAdminOrderStatusClassName(
                                order.orderStatus
                            )}`}
                        >
                            {getAdminOrderStatusLabel(order.orderStatus)}
                        </span>
                    </div>
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

            {order.orderStatus !== 'completed' && order.orderStatus !== 'cancelled' ? (
                <section className="ttdn-admin-card">
                    <div className="d-flex flex-wrap gap-2">
                        {nextStatus ? (
                            <button
                                type="button"
                                className="btn theme-bg-color text-white rounded-pill px-4"
                                onClick={() => handleUpdateStatus(nextStatus)}
                                disabled={updating}
                            >
                                {updating ? <Loader2 size={16} className="me-2" /> : null}
                                Chuyển sang {getAdminOrderStatusLabel(nextStatus)}
                            </button>
                        ) : null}
                        {canCancel ? (
                            <button
                                type="button"
                                className="btn btn-outline-danger rounded-pill px-4"
                                onClick={() => {
                                    if (window.confirm('Bạn chắc chắn muốn hủy đơn hàng này?')) {
                                        handleUpdateStatus('cancelled');
                                    }
                                }}
                                disabled={updating}
                            >
                                <XCircle size={16} className="me-2" />
                                Hủy đơn
                            </button>
                        ) : null}
                    </div>
                </section>
            ) : null}

            <div className="row g-4">
                <div className="col-xl-8">
                    <div className="ttdn-admin-form-grid">
                        <section className="ttdn-admin-card">
                            <div className="d-flex align-items-center gap-2 mb-4">
                                <Package size={18} className="text-success" />
                                <h3 className="h4 fw-bold text-dark mb-0">Sản phẩm trong đơn</h3>
                            </div>

                            <div className="d-grid gap-3">
                                {(order.items || []).map((item: any, index: number) => {
                                    const imageUrl = getAdminFirstImageUrl(item.product?.images);

                                    return (
                                        <div key={`${item.name}-${index}`} className="ttdn-order-item-card">
                                            <div className="d-flex gap-3 align-items-center">
                                                <div className="ttdn-admin-thumb">
                                                    {imageUrl ? (
                                                        <img src={imageUrl} alt={item.name} />
                                                    ) : (
                                                        <div className="w-100 h-100 d-flex align-items-center justify-content-center text-muted">
                                                            <Package size={20} />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-grow-1">
                                                    <p className="fw-bold text-dark mb-1">{item.name}</p>
                                                    <p className="text-muted mb-1 small">
                                                        {formatAdminCurrency(item.price)} x {item.quantity}
                                                    </p>
                                                    <p className="text-muted mb-0 small">
                                                        Đơn vị: {item.product?.unit || 'N/A'}
                                                    </p>
                                                </div>
                                                <strong className="theme-color">
                                                    {formatAdminCurrency(item.subtotal || item.price * item.quantity)}
                                                </strong>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>

                        <section className="ttdn-admin-card">
                            <div className="d-flex align-items-center gap-2 mb-4">
                                <Clock3 size={18} className="text-success" />
                                <h3 className="h4 fw-bold text-dark mb-0">Timeline xử lý</h3>
                            </div>

                            <div className="ttdn-admin-timeline">
                                {(order.timeline || []).map((entry: any, index: number) => (
                                    <div key={`${entry.timestamp}-${index}`} className="ttdn-admin-timeline-item">
                                        <div className="ttdn-admin-timeline-index">{index + 1}</div>
                                        <div>
                                            <span
                                                className={`badge rounded-pill px-3 py-2 ${getAdminOrderStatusClassName(
                                                    entry.status
                                                )}`}
                                            >
                                                {getAdminOrderStatusLabel(entry.status)}
                                            </span>
                                            <p className="text-dark fw-semibold mb-1 mt-2">
                                                {formatAdminDateTime(entry.timestamp)}
                                            </p>
                                            {entry.note ? (
                                                <p className="text-muted mb-0">{entry.note}</p>
                                            ) : null}
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
                            <div className="d-flex align-items-center gap-2 mb-4">
                                <MapPin size={18} className="text-success" />
                                <h3 className="h4 fw-bold text-dark mb-0">Thông tin giao hàng</h3>
                            </div>

                            <div className="d-grid gap-3">
                                <div className="ttdn-order-item-card">
                                    <p className="text-muted small mb-1">Người nhận</p>
                                    <p className="fw-bold text-dark mb-0">{order.shippingAddress?.fullName}</p>
                                </div>
                                <div className="ttdn-order-item-card">
                                    <p className="text-muted small mb-1">Số điện thoại</p>
                                    <p className="fw-bold text-dark mb-0">{order.shippingAddress?.phone}</p>
                                </div>
                                <div className="ttdn-order-item-card">
                                    <p className="text-muted small mb-1">Địa chỉ</p>
                                    <p className="fw-bold text-dark mb-0">
                                        {[
                                            order.shippingAddress?.street,
                                            order.shippingAddress?.ward,
                                            order.shippingAddress?.district,
                                            order.shippingAddress?.city,
                                        ]
                                            .filter(Boolean)
                                            .join(', ')}
                                    </p>
                                </div>
                                <div className="ttdn-order-item-card">
                                    <p className="text-muted small mb-1">Khung giao</p>
                                    <p className="fw-bold text-dark mb-0">{order.deliverySlot || 'Chưa xếp'}</p>
                                </div>
                            </div>
                        </section>

                        <section className="ttdn-admin-card">
                            <div className="d-flex align-items-center gap-2 mb-4">
                                <CreditCard size={18} className="text-success" />
                                <h3 className="h4 fw-bold text-dark mb-0">Thanh toán</h3>
                            </div>

                            <div className="d-grid gap-3 mb-4">
                                <div className="ttdn-order-item-card">
                                    <p className="text-muted small mb-1">Phương thức</p>
                                    <p className="fw-bold text-dark mb-0">
                                        {paymentMethodLabels[order.paymentMethod] || order.paymentMethod}
                                    </p>
                                </div>
                                <div className="ttdn-order-item-card">
                                    <p className="text-muted small mb-1">Trạng thái thanh toán</p>
                                    <p className="fw-bold text-dark mb-0">
                                        {paymentStatusLabels[order.paymentStatus] || order.paymentStatus}
                                    </p>
                                </div>
                                {order.sepayTransactionId ? (
                                    <div className="ttdn-order-item-card">
                                        <p className="text-muted small mb-1">Mã giao dịch</p>
                                        <p className="fw-bold text-dark mb-0">{order.sepayTransactionId}</p>
                                    </div>
                                ) : null}
                            </div>

                            <div className="ttdn-admin-note">
                                <div className="d-flex justify-content-between text-muted mb-2">
                                    <span>Tạm tính</span>
                                    <span>{formatAdminCurrency(order.subtotal || 0)}</span>
                                </div>
                                <div className="d-flex justify-content-between text-muted mb-2">
                                    <span>Phí giao hàng</span>
                                    <span>{formatAdminCurrency(order.shippingFee || 0)}</span>
                                </div>
                                {order.discount ? (
                                    <div className="d-flex justify-content-between text-success mb-2">
                                        <span>Giảm giá</span>
                                        <span>-{formatAdminCurrency(order.discount || 0)}</span>
                                    </div>
                                ) : null}
                                <div className="d-flex justify-content-between fw-bold text-dark pt-2 border-top">
                                    <span>Tổng cộng</span>
                                    <span className="theme-color">{formatAdminCurrency(order.total || 0)}</span>
                                </div>
                            </div>

                            {order.notes ? (
                                <div className="ttdn-order-item-card mt-4">
                                    <p className="text-muted small mb-1">Ghi chú</p>
                                    <p className="mb-0 text-dark">{order.notes}</p>
                                </div>
                            ) : null}
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
