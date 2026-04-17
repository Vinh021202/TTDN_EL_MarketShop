import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { CreditCard, MapPin, Package, PackageCheck, TimerReset } from 'lucide-react';
import { cancelOrder, getOrderById } from '@/features/orders/services/ordersApi';
import { toast } from '@/components/ui';
import { translate } from '@/features/shared/utils/displayPreferences';
import { useThemeStore } from '@/store/themeStore';
import { StorefrontBreadcrumb } from '@/features/storefront/components/StorefrontBreadcrumb';
import { StorefrontAccountSidebar } from '@/features/storefront/components/StorefrontAccountSidebar';
import {
    formatOrderDateTime,
    formatOrderPrice,
    getOrderDisplayCode,
    getOrderItemImage,
    getOrderStatusClassName,
    getOrderStatusLabel,
    getPaymentMethodLabel,
    getPaymentStatusLabel,
    isBankTransferOrder,
    isPaidOrder,
} from './orderPresentation';

export const OrderDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const language = useThemeStore((state) => state.language);
    const [cancelling, setCancelling] = useState(false);

    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['order', id],
        queryFn: () => getOrderById(id!),
        enabled: !!id,
    });

    const order = data?.order;

    const copy = useMemo(
        () => ({
            orders: translate({ vi: 'Đơn hàng của tôi', en: 'My orders' }, language),
            detail: translate({ vi: 'Chi tiết đơn hàng', en: 'Order details' }, language),
            subtitle: translate(
                { vi: 'Xem trạng thái, địa chỉ nhận hàng, timeline xử lý và thông tin thanh toán của đơn hiện tại.', en: 'View status, shipping address, processing timeline, and payment details for this order.' },
                language
            ),
            loadingTitle: translate({ vi: 'Đang tải chi tiết đơn hàng', en: 'Loading order details' }, language),
            loadingDescription: translate(
                { vi: 'Mình đang lấy dữ liệu mới nhất từ order API.', en: 'Fetching the latest data from the order API.' },
                language
            ),
            missingTitle: translate({ vi: 'Không tìm thấy đơn hàng', en: 'Order not found' }, language),
            missingDescription: translate(
                { vi: 'Đơn có thể không còn tồn tại hoặc bạn không có quyền xem đơn này.', en: 'This order may no longer exist or you do not have permission to view it.' },
                language
            ),
            backToOrders: translate({ vi: 'Quay lại danh sách đơn', en: 'Back to orders' }, language),
            sidebarTitle: translate({ vi: 'Chi tiết đơn', en: 'Order details' }, language),
            sidebarDescription: translate(
                { vi: 'Theo dõi tiến trình đơn hàng và quay lại thanh toán nếu đơn chuyển khoản vẫn đang chờ xác nhận.', en: 'Track the order progress and return to payment if the bank transfer is still awaiting confirmation.' },
                language
            ),
            orderCode: translate({ vi: 'Mã đơn', en: 'Order code' }, language),
            status: translate({ vi: 'Trạng thái', en: 'Status' }, language),
            payment: translate({ vi: 'Thanh toán', en: 'Payment' }, language),
            total: translate({ vi: 'Tổng cộng', en: 'Total' }, language),
            pageTitle: (code: string) =>
                translate(
                    { vi: `Đơn #${code}`, en: `Order #${code}` },
                    language
                ),
            createdAt: (value: string) =>
                translate(
                    { vi: `Tạo lúc ${value}`, en: `Created at ${value}` },
                    language
                ),
            payNow: translate({ vi: 'Thanh toán ngay', en: 'Pay now' }, language),
            productsInOrder: translate({ vi: 'Sản phẩm trong đơn', en: 'Items in this order' }, language),
            unit: translate({ vi: 'Đơn vị', en: 'Unit' }, language),
            shippingAddress: translate({ vi: 'Địa chỉ giao hàng', en: 'Shipping address' }, language),
            recipient: translate({ vi: 'Người nhận', en: 'Recipient' }, language),
            phone: translate({ vi: 'Điện thoại', en: 'Phone' }, language),
            address: translate({ vi: 'Địa chỉ', en: 'Address' }, language),
            timeline: translate({ vi: 'Timeline xử lý', en: 'Processing timeline' }, language),
            paymentInfo: translate({ vi: 'Thanh toán', en: 'Payment' }, language),
            paymentMethod: translate({ vi: 'Phương thức', en: 'Method' }, language),
            paymentStatus: translate({ vi: 'Trạng thái thanh toán', en: 'Payment status' }, language),
            deliverySlot: translate({ vi: 'Khung giờ giao', en: 'Delivery slot' }, language),
            orderTotal: translate({ vi: 'Tổng cộng', en: 'Order total' }, language),
            subtotal: translate({ vi: 'Tạm tính', en: 'Subtotal' }, language),
            shippingFee: translate({ vi: 'Phí giao hàng', en: 'Shipping fee' }, language),
            payTransfer: translate({ vi: 'Thanh toán chuyển khoản', en: 'Pay by transfer' }, language),
            cancelOrder: translate({ vi: 'Hủy đơn hàng', en: 'Cancel order' }, language),
            cancelling: translate({ vi: 'Đang hủy...', en: 'Cancelling...' }, language),
            confirmCancel: translate({ vi: 'Bạn có chắc muốn hủy đơn hàng này không?', en: 'Are you sure you want to cancel this order?' }, language),
            cancelSuccess: translate({ vi: 'Đã hủy đơn hàng.', en: 'Order cancelled.' }, language),
            cancelFailed: translate({ vi: 'Không thể hủy đơn', en: 'Unable to cancel this order' }, language),
            notAvailable: translate({ vi: 'N/A', en: 'N/A' }, language),
        }),
        [language]
    );

    const stats = useMemo(() => {
        if (!order) {
            return [
                { label: copy.orderCode, value: '--' },
                { label: copy.status, value: '--' },
                { label: copy.payment, value: '--' },
                { label: copy.total, value: '--' },
            ];
        }

        return [
            { label: copy.orderCode, value: getOrderDisplayCode(order) },
            { label: copy.status, value: getOrderStatusLabel(order.orderStatus) },
            { label: copy.payment, value: getPaymentStatusLabel(order.paymentStatus) },
            { label: copy.total, value: formatOrderPrice(order.total) },
        ];
    }, [order, copy]);

    const handleCancel = async () => {
        if (!order || !window.confirm(copy.confirmCancel)) {
            return;
        }

        setCancelling(true);

        try {
            await cancelOrder(order._id);
            toast.success(copy.cancelSuccess);
            refetch();
        } catch (cancelError: any) {
            const message = cancelError.response?.data?.error || copy.cancelFailed;
            toast.error(message);
        } finally {
            setCancelling(false);
        }
    };

    if (isLoading) {
        return (
            <>
                <StorefrontBreadcrumb title={copy.detail} items={[{ label: copy.orders, to: '/orders' }, { label: copy.detail }]} />
                <section className="section-b-space">
                    <div className="container-fluid-lg">
                        <div className="ttdn-empty-state text-center">
                            <div className="spinner-border text-success mb-3" role="status" />
                            <h3 className="fw-bold text-dark mb-2">{copy.loadingTitle}</h3>
                            <p className="text-content mb-0">{copy.loadingDescription}</p>
                        </div>
                    </div>
                </section>
            </>
        );
    }

    if (error || !order) {
        return (
            <>
                <StorefrontBreadcrumb title={copy.detail} items={[{ label: copy.orders, to: '/orders' }, { label: copy.detail }]} />
                <section className="section-b-space">
                    <div className="container-fluid-lg">
                        <div className="ttdn-empty-state text-center">
                            <h3 className="fw-bold text-dark mb-2">{copy.missingTitle}</h3>
                            <p className="text-content mb-4">{copy.missingDescription}</p>
                            <a href="/orders" className="btn btn-animation px-4">
                                {copy.backToOrders}
                            </a>
                        </div>
                    </div>
                </section>
            </>
        );
    }

    const canCancel = ['pending', 'confirmed'].includes(order.orderStatus);
    const canPayNow = isBankTransferOrder(order.paymentMethod) && !isPaidOrder(order.paymentStatus);

    return (
        <>
            <StorefrontBreadcrumb
                title={copy.pageTitle(getOrderDisplayCode(order))}
                items={[{ label: copy.orders, to: '/orders' }, { label: copy.pageTitle(getOrderDisplayCode(order)) }]}
                subtitle={copy.subtitle}
            />

            <section className="user-dashboard-section section-b-space">
                <div className="container-fluid-lg">
                    <div className="row g-4">
                        <div className="col-xl-4 col-xxl-3">
                            <StorefrontAccountSidebar title={copy.sidebarTitle} description={copy.sidebarDescription} stats={stats} />
                        </div>

                        <div className="col-xl-8 col-xxl-9">
                            <div className="ttdn-page-hero mb-4">
                                <div className="d-flex flex-wrap justify-content-between align-items-start gap-3">
                                    <div>
                                        <p className="text-uppercase small fw-bold text-white-50 mb-2">{copy.detail}</p>
                                        <h2 className="text-white fw-bold mb-2">{copy.pageTitle(getOrderDisplayCode(order))}</h2>
                                        <p className="text-white-50 mb-0">{copy.createdAt(formatOrderDateTime(order.createdAt))}</p>
                                    </div>

                                    <div className="d-flex flex-column align-items-start align-items-lg-end gap-2">
                                        <span className={`badge rounded-pill px-3 py-2 ${getOrderStatusClassName(order.orderStatus)}`}>
                                            {getOrderStatusLabel(order.orderStatus)}
                                        </span>
                                        {canPayNow ? (
                                            <a href={`/payment/${order._id}`} className="btn btn-light rounded-pill px-4">
                                                {copy.payNow}
                                            </a>
                                        ) : null}
                                    </div>
                                </div>
                            </div>

                            <div className="row g-4">
                                <div className="col-lg-8">
                                    <div className="ttdn-panel mb-4">
                                        <div className="d-flex align-items-center gap-2 mb-4">
                                            <Package size={20} className="text-success" />
                                            <h3 className="fw-bold text-dark mb-0">{copy.productsInOrder}</h3>
                                        </div>

                                        <div className="d-grid gap-3">
                                            {order.items.map((item: any, index: number) => {
                                                const imageUrl = getOrderItemImage(item);

                                                return (
                                                    <div key={`${order._id}-${index}`} className="ttdn-order-item-card">
                                                        <div className="d-flex gap-3 align-items-center">
                                                            <div className="ttdn-recipe-thumbnail">
                                                                {imageUrl ? (
                                                                    <img src={imageUrl} alt={item.name} />
                                                                ) : (
                                                                    <div className="w-100 h-100 d-flex align-items-center justify-content-center text-success fs-3">
                                                                        <Package size={28} />
                                                                    </div>
                                                                )}
                                                            </div>

                                                            <div className="flex-grow-1 min-w-0">
                                                                <p className="fw-bold text-dark mb-1">{item.name}</p>
                                                                <p className="text-muted mb-1">
                                                                    {formatOrderPrice(item.price)} x {item.quantity}
                                                                </p>
                                                                <p className="text-muted small mb-0">
                                                                    {copy.unit}: {item.product?.unit || copy.notAvailable}
                                                                </p>
                                                            </div>

                                                            <strong className="theme-color text-nowrap">
                                                                {formatOrderPrice(item.subtotal || item.price * item.quantity)}
                                                            </strong>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="ttdn-panel mb-4">
                                        <div className="d-flex align-items-center gap-2 mb-4">
                                            <MapPin size={20} className="text-success" />
                                            <h3 className="fw-bold text-dark mb-0">{copy.shippingAddress}</h3>
                                        </div>

                                        <div className="row g-3">
                                            <div className="col-md-6">
                                                <div className="ttdn-order-item-card h-100">
                                                    <p className="text-muted small mb-1">{copy.recipient}</p>
                                                    <p className="fw-bold text-dark mb-0">{order.shippingAddress.fullName}</p>
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="ttdn-order-item-card h-100">
                                                    <p className="text-muted small mb-1">{copy.phone}</p>
                                                    <p className="fw-bold text-dark mb-0">{order.shippingAddress.phone}</p>
                                                </div>
                                            </div>
                                            <div className="col-12">
                                                <div className="ttdn-order-item-card">
                                                    <p className="text-muted small mb-1">{copy.address}</p>
                                                    <p className="fw-bold text-dark mb-0">
                                                        {order.shippingAddress.street}
                                                        {order.shippingAddress.ward ? `, ${order.shippingAddress.ward}` : ''}
                                                        , {order.shippingAddress.district}, {order.shippingAddress.city}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="ttdn-panel">
                                        <div className="d-flex align-items-center gap-2 mb-4">
                                            <TimerReset size={20} className="text-success" />
                                            <h3 className="fw-bold text-dark mb-0">{copy.timeline}</h3>
                                        </div>

                                        <div className="d-grid gap-3">
                                            {order.timeline.map((event: any, index: number) => (
                                                <div key={`${event.timestamp}-${index}`} className="ttdn-step-card">
                                                    <div className="d-flex gap-3">
                                                        <div className="ttdn-step-index">{index + 1}</div>
                                                        <div>
                                                            <p className="fw-bold text-dark mb-1">{getOrderStatusLabel(event.status)}</p>
                                                            <p className="text-muted mb-1">{formatOrderDateTime(event.timestamp)}</p>
                                                            {event.note ? <p className="text-muted mb-0">{event.note}</p> : null}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="col-lg-4">
                                    <div className="ttdn-panel mb-4">
                                        <div className="d-flex align-items-center gap-2 mb-4">
                                            <CreditCard size={20} className="text-success" />
                                            <h3 className="fw-bold text-dark mb-0">{copy.paymentInfo}</h3>
                                        </div>

                                        <div className="d-grid gap-3">
                                            <div className="ttdn-order-item-card">
                                                <p className="text-muted small mb-1">{copy.paymentMethod}</p>
                                                <p className="fw-bold text-dark mb-0">{getPaymentMethodLabel(order.paymentMethod)}</p>
                                            </div>
                                            <div className="ttdn-order-item-card">
                                                <p className="text-muted small mb-1">{copy.paymentStatus}</p>
                                                <p className="fw-bold text-dark mb-0">{getPaymentStatusLabel(order.paymentStatus)}</p>
                                            </div>
                                            <div className="ttdn-order-item-card">
                                                <p className="text-muted small mb-1">{copy.deliverySlot}</p>
                                                <p className="fw-bold text-dark mb-0">{order.deliverySlot}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="ttdn-panel">
                                        <div className="d-flex align-items-center gap-2 mb-4">
                                            <PackageCheck size={20} className="text-success" />
                                            <h3 className="fw-bold text-dark mb-0">{copy.orderTotal}</h3>
                                        </div>

                                        <div className="d-grid gap-3 mb-4">
                                            <div className="d-flex justify-content-between text-muted">
                                                <span>{copy.subtotal}</span>
                                                <span>{formatOrderPrice(order.subtotal)}</span>
                                            </div>
                                            <div className="d-flex justify-content-between text-muted">
                                                <span>{copy.shippingFee}</span>
                                                <span>{formatOrderPrice(order.shippingFee)}</span>
                                            </div>
                                            <div className="d-flex justify-content-between fw-bold text-dark fs-5">
                                                <span>{copy.total}</span>
                                                <span className="theme-color">{formatOrderPrice(order.total)}</span>
                                            </div>
                                        </div>

                                        <div className="d-grid gap-2">
                                            {canPayNow ? (
                                                <a href={`/payment/${order._id}`} className="btn btn-animation w-100">
                                                    {copy.payTransfer}
                                                </a>
                                            ) : null}

                                            {canCancel ? (
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-danger rounded-pill w-100"
                                                    onClick={handleCancel}
                                                    disabled={cancelling}
                                                >
                                                    {cancelling ? copy.cancelling : copy.cancelOrder}
                                                </button>
                                            ) : null}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};
