import { useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getOrderById } from '@/features/orders/services/ordersApi';
import { toast } from '@/components/ui';
import { translate } from '@/features/shared/utils/displayPreferences';
import { useThemeStore } from '@/store/themeStore';
import { StorefrontBreadcrumb } from '@/features/storefront/components/StorefrontBreadcrumb';
import { CheckoutTransferView } from './components/CheckoutTransferView';
import { formatOrderPrice, getOrderDisplayCode, isBankTransferOrder, isPaidOrder } from '@/features/orders/orderPresentation';

const BANK_CONFIG = {
    bankId: 'MB',
    accountNo: '0389892547',
    accountName: 'BUI NGOC THU',
    template: 'compact2',
};

export const PaymentPage = () => {
    const { orderId } = useParams<{ orderId: string }>();
    const navigate = useNavigate();
    const language = useThemeStore((state) => state.language);
    const [copied, setCopied] = useState<string | null>(null);
    const [countdown, setCountdown] = useState(15 * 60);

    const { data, isLoading, error } = useQuery({
        queryKey: ['payment-order', orderId],
        queryFn: () => getOrderById(orderId!),
        enabled: !!orderId,
    });

    const order = data?.order;

    const copy = useMemo(
        () => ({
            title: translate({ vi: 'Thanh toán', en: 'Payment' }, language),
            orders: translate({ vi: 'Đơn hàng của tôi', en: 'My orders' }, language),
            loadingTitle: translate({ vi: 'Đang tải thông tin thanh toán', en: 'Loading payment information' }, language),
            loadingDescription: translate(
                { vi: 'Mình đang lấy đơn hàng chuyển khoản hiện tại.', en: 'Fetching the current bank transfer order.' },
                language
            ),
            notFoundTitle: translate({ vi: 'Không tìm thấy đơn hàng', en: 'Order not found' }, language),
            notFoundDescription: translate(
                { vi: 'Đơn có thể đã bị xóa hoặc bạn không còn quyền truy cập.', en: 'This order may have been removed or you no longer have access to it.' },
                language
            ),
            backToOrders: translate({ vi: 'Quay lại đơn hàng', en: 'Back to orders' }, language),
            pageTitle: (code: string) =>
                translate(
                    { vi: `Thanh toán đơn #${code}`, en: `Pay order #${code}` },
                    language
                ),
            subtitle: translate(
                { vi: 'Trang thanh toán riêng cho các đơn chuyển khoản đang chờ xác nhận.', en: 'A dedicated payment page for bank transfer orders awaiting confirmation.' },
                language
            ),
            copied: (label: string) =>
                translate(
                    {
                        vi: `Đã sao chép ${label.toLowerCase()}`,
                        en: `Copied ${label}`,
                    },
                    language
                ),
        }),
        [language]
    );

    useEffect(() => {
        if (countdown <= 0) {
            return;
        }

        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }

                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [countdown]);

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        setCopied(label);
        toast.success(copy.copied(label));
        setTimeout(() => setCopied(null), 2000);
    };

    if (isLoading) {
        return (
            <>
                <StorefrontBreadcrumb title={copy.title} items={[{ label: copy.orders, to: '/orders' }, { label: copy.title }]} />
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
                <StorefrontBreadcrumb title={copy.title} items={[{ label: copy.orders, to: '/orders' }, { label: copy.title }]} />
                <section className="section-b-space">
                    <div className="container-fluid-lg">
                        <div className="ttdn-empty-state text-center">
                            <h3 className="fw-bold text-dark mb-2">{copy.notFoundTitle}</h3>
                            <p className="text-content mb-4">{copy.notFoundDescription}</p>
                            <a href="/orders" className="btn btn-animation px-4">
                                {copy.backToOrders}
                            </a>
                        </div>
                    </div>
                </section>
            </>
        );
    }

    if (!isBankTransferOrder(order.paymentMethod) || isPaidOrder(order.paymentStatus)) {
        return <Navigate to={`/orders/${order._id}`} replace />;
    }

    return (
        <>
            <StorefrontBreadcrumb
                title={copy.pageTitle(getOrderDisplayCode(order))}
                items={[{ label: copy.orders, to: '/orders' }, { label: copy.title }]}
                subtitle={copy.subtitle}
            />
            <CheckoutTransferView
                bankConfig={BANK_CONFIG}
                copied={copied}
                checkoutUrl={null}
                countdownLabel={`${Math.floor(countdown / 60)}:${(countdown % 60).toString().padStart(2, '0')}`}
                createdOrder={order}
                formatPrice={formatOrderPrice}
                onContinueShopping={() => navigate('/products')}
                onCopy={copyToClipboard}
                onOpenOrder={() => navigate(`/orders/${order._id}`)}
            />
        </>
    );
};
