import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { PackageCheck, Receipt, ShoppingBag } from 'lucide-react';
import { getMyOrders } from '@/features/orders/services/ordersApi';
import { translate } from '@/features/shared/utils/displayPreferences';
import { useThemeStore } from '@/store/themeStore';
import {
    formatOrderDateTime,
    formatOrderPrice,
    getOrderDisplayCode,
    getOrderStatusClassName,
    getOrderStatusLabel,
} from './orderPresentation';
import { StorefrontBreadcrumb } from '@/features/storefront/components/StorefrontBreadcrumb';
import { StorefrontAccountSidebar } from '@/features/storefront/components/StorefrontAccountSidebar';

export const OrderListPage = () => {
    const language = useThemeStore((state) => state.language);
    const { data, isLoading, error } = useQuery({
        queryKey: ['my-orders'],
        queryFn: getMyOrders,
    });

    const orders = data?.orders || [];

    const copy = useMemo(
        () => ({
            title: translate({ vi: 'Đơn hàng của tôi', en: 'My orders' }, language),
            subtitle: translate(
                { vi: 'Theo dõi trạng thái đơn, giá trị thanh toán và mở nhanh từng đơn hàng.', en: 'Track order status, payment totals, and open each order quickly.' },
                language
            ),
            sidebarDescription: translate(
                { vi: 'Xem nhanh toàn bộ lịch sử mua hàng, từ đơn chờ xác nhận tới đơn đã hoàn thành.', en: 'See your full order history, from pending confirmation to completed deliveries.' },
                language
            ),
            totalOrders: translate({ vi: 'Tổng đơn', en: 'Total orders' }, language),
            processing: translate({ vi: 'Đang xử lý', en: 'In progress' }, language),
            completed: translate({ vi: 'Hoàn thành', en: 'Completed' }, language),
            latestValue: translate({ vi: 'Giá trị gần nhất', en: 'Latest value' }, language),
            heroTag: translate({ vi: 'Lịch sử đơn hàng', en: 'Order history' }, language),
            heroTitle: translate({ vi: 'Lịch sử mua hàng và trạng thái hiện tại', en: 'Your purchase history and current status' }, language),
            heroDescription: translate(
                { vi: 'Mở từng đơn để xem chi tiết sản phẩm, thanh toán và tiến độ giao hàng.', en: 'Open each order to view line items, payment details, and delivery progress.' },
                language
            ),
            latestOrder: translate({ vi: 'Đơn gần nhất', en: 'Latest order' }, language),
            loadingErrorTitle: translate({ vi: 'Không thể tải đơn hàng', en: 'Unable to load orders' }, language),
            loadingErrorDescription: translate(
                { vi: 'Đã có lỗi khi tải danh sách đơn. Bạn thử tải lại trang giúp mình.', en: 'There was a problem loading your orders. Please refresh the page and try again.' },
                language
            ),
            emptyTitle: translate({ vi: 'Bạn chưa có đơn hàng nào', en: 'You do not have any orders yet' }, language),
            emptyDescription: translate(
                { vi: 'Khi hoàn tất checkout, lịch sử mua hàng sẽ xuất hiện tại đây.', en: 'Once you complete checkout, your order history will appear here.' },
                language
            ),
            startShopping: translate({ vi: 'Bắt đầu mua sắm', en: 'Start shopping' }, language),
            orderPrefix: translate({ vi: 'Đơn', en: 'Order' }, language),
            orderItems: (count: number) =>
                translate(
                    {
                        vi: `${count} sản phẩm trong đơn này`,
                        en: `${count} items in this order`,
                    },
                    language
                ),
            quantity: (count: number) =>
                translate(
                    {
                        vi: `Số lượng: ${count}`,
                        en: `Quantity: ${count}`,
                    },
                    language
                ),
            detailHint: translate(
                { vi: 'Theo dõi trạng thái và timeline chi tiết ở trang order detail.', en: 'Track status and the full timeline from the order detail page.' },
                language
            ),
            viewDetail: translate({ vi: 'Xem chi tiết', en: 'View details' }, language),
        }),
        [language]
    );

    const stats = useMemo(() => {
        const completed = orders.filter((order: any) => order.orderStatus === 'completed').length;
        const active = orders.filter((order: any) => ['pending', 'confirmed', 'preparing', 'shipping'].includes(order.orderStatus)).length;

        return [
            { label: copy.totalOrders, value: String(orders.length) },
            { label: copy.processing, value: String(active) },
            { label: copy.completed, value: String(completed) },
            { label: copy.latestValue, value: orders[0] ? formatOrderPrice(orders[0].total) : '--' },
        ];
    }, [orders, copy]);

    return (
        <>
            <StorefrontBreadcrumb title={copy.title} items={[{ label: copy.title }]} subtitle={copy.subtitle} />

            <section className="user-dashboard-section section-b-space">
                <div className="container-fluid-lg">
                    <div className="row g-4">
                        <div className="col-xl-4 col-xxl-3">
                            <StorefrontAccountSidebar title={copy.title} description={copy.sidebarDescription} stats={stats} />
                        </div>

                        <div className="col-xl-8 col-xxl-9">
                            <div className="ttdn-page-hero mb-4">
                                <div className="d-flex flex-wrap justify-content-between align-items-start gap-3">
                                    <div>
                                        <p className="text-uppercase small fw-bold text-white-50 mb-2">{copy.heroTag}</p>
                                        <h2 className="text-white fw-bold mb-2">{copy.heroTitle}</h2>
                                        <p className="text-white-50 mb-0">{copy.heroDescription}</p>
                                    </div>
                                    <div className="ttdn-hero-stats">
                                        <p className="mb-1 text-white-50">{copy.latestOrder}</p>
                                        <h3 className="mb-0 text-white">{orders[0] ? getOrderDisplayCode(orders[0]) : '--'}</h3>
                                    </div>
                                </div>
                            </div>

                            {isLoading ? (
                                <div className="row g-4">
                                    {Array.from({ length: 3 }).map((_, index) => (
                                        <div key={index} className="col-12">
                                            <div className="ttdn-panel placeholder-glow">
                                                <span className="placeholder col-4 mb-3"></span>
                                                <span className="placeholder col-8 mb-2"></span>
                                                <span className="placeholder col-6"></span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : error ? (
                                <div className="ttdn-empty-state text-center">
                                    <h3 className="fw-bold text-dark mb-2">{copy.loadingErrorTitle}</h3>
                                    <p className="text-content mb-0">{copy.loadingErrorDescription}</p>
                                </div>
                            ) : orders.length === 0 ? (
                                <div className="ttdn-empty-state text-center">
                                    <ShoppingBag size={46} className="mx-auto text-success mb-3" />
                                    <h3 className="fw-bold text-dark mb-2">{copy.emptyTitle}</h3>
                                    <p className="text-content mb-4">{copy.emptyDescription}</p>
                                    <Link to="/products" className="btn btn-animation px-4">
                                        {copy.startShopping}
                                    </Link>
                                </div>
                            ) : (
                                <div className="d-grid gap-4">
                                    {orders.map((order: any) => (
                                        <article key={order._id} className="ttdn-panel">
                                            <div className="d-flex flex-column flex-lg-row justify-content-between gap-3 mb-4">
                                                <div>
                                                    <div className="d-flex align-items-center gap-2 mb-2">
                                                        <Receipt size={18} className="text-success" />
                                                        <h3 className="h5 fw-bold text-dark mb-0">
                                                            {copy.orderPrefix} #{getOrderDisplayCode(order)}
                                                        </h3>
                                                    </div>
                                                    <p className="text-muted mb-1">{formatOrderDateTime(order.createdAt)}</p>
                                                    <p className="text-muted mb-0">{copy.orderItems(order.items.length)}</p>
                                                </div>

                                                <div className="d-flex flex-column align-items-lg-end gap-2">
                                                    <span className={`badge rounded-pill px-3 py-2 ${getOrderStatusClassName(order.orderStatus)}`}>
                                                        {getOrderStatusLabel(order.orderStatus)}
                                                    </span>
                                                    <strong className="theme-color fs-5">{formatOrderPrice(order.total)}</strong>
                                                </div>
                                            </div>

                                            <div className="row g-3 mb-4">
                                                {order.items.slice(0, 3).map((item: any, index: number) => (
                                                    <div key={`${order._id}-${index}`} className="col-md-4">
                                                        <div className="ttdn-order-item-card h-100">
                                                            <p className="fw-semibold text-dark mb-1">{item.name || item.product?.name}</p>
                                                            <p className="text-muted small mb-2">{copy.quantity(item.quantity)}</p>
                                                            <strong className="theme-color">{formatOrderPrice(item.subtotal || item.price * item.quantity)}</strong>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
                                                <div className="text-muted small">{copy.detailHint}</div>
                                                <Link to={`/orders/${order._id}`} className="btn btn-light rounded-pill px-4">
                                                    <PackageCheck size={16} className="me-2" />
                                                    {copy.viewDetail}
                                                </Link>
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};
