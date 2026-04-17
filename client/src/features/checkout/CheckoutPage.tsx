import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createOrder, Order } from '@/features/orders/services/ordersApi';
import { toast } from '@/components/ui';
import { formatDisplayCurrency, translate } from '@/features/shared/utils/displayPreferences';
import { useCartStore } from '@/store/cartStore';
import { useThemeStore } from '@/store/themeStore';
import { StorefrontBreadcrumb } from '@/features/storefront/components/StorefrontBreadcrumb';
import { CheckoutFormView } from './components/CheckoutFormView';
import { CheckoutTransferView } from './components/CheckoutTransferView';

const BANK_CONFIG = {
    bankId: 'MB',
    accountNo: '0389892547',
    accountName: 'BUI NGOC THU',
    template: 'compact2',
};

const SHIPPING_FEE = 30000;

export const CheckoutPage = () => {
    const navigate = useNavigate();
    const language = useThemeStore((state) => state.language);
    const { items, subtotal, clearCart } = useCartStore();
    const [loading, setLoading] = useState(false);
    const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
    const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
    const [copied, setCopied] = useState<string | null>(null);
    const [countdown, setCountdown] = useState(15 * 60);
    const bankTransferRef = useRef(false);

    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        address: '',
        ward: '',
        district: '',
        province: '',
        deliverySlot: '08:00-12:00' as '08:00-12:00' | '14:00-18:00',
        paymentMethod: 'COD' as 'COD' | 'BANK_TRANSFER',
    });

    const copy = useMemo(
        () => ({
            copied: (label: string) =>
                translate(
                    {
                        vi: `Đã sao chép ${label.toLowerCase()}`,
                        en: `Copied ${label}`,
                    },
                    language
                ),
            emptyCart: translate({ vi: 'Giỏ hàng đang trống.', en: 'Your cart is empty.' }, language),
            bankOrderCreated: translate(
                {
                    vi: 'Đơn hàng đã tạo. Vui lòng hoàn tất chuyển khoản.',
                    en: 'Your order has been created. Please complete the bank transfer.',
                },
                language
            ),
            orderCreated: translate({ vi: 'Đặt hàng thành công!', en: 'Order placed successfully!' }, language),
            orderCreateFailed: translate({ vi: 'Đặt hàng thất bại', en: 'Failed to place your order' }, language),
            transferTitle: translate({ vi: 'Thanh toán chuyển khoản', en: 'Bank transfer checkout' }, language),
            transferBreadcrumb: translate({ vi: 'Thanh toán', en: 'Payment' }, language),
            transferSubtitle: translate(
                {
                    vi: 'Quét QR hoặc chuyển khoản thủ công với đúng nội dung để hệ thống xác nhận đơn.',
                    en: 'Scan the QR code or transfer manually with the exact note so the system can confirm the order.',
                },
                language
            ),
            checkoutTitle: 'Checkout',
            checkoutSubtitleEmpty: translate(
                { vi: 'Giỏ hàng đang trống nên chưa thể tiếp tục thanh toán.', en: 'Your cart is empty, so checkout cannot continue yet.' },
                language
            ),
            checkoutEmptyTitle: translate({ vi: 'Chưa có sản phẩm để checkout', en: 'No items available for checkout' }, language),
            checkoutEmptyDescription: translate(
                { vi: 'Hãy thêm sản phẩm vào giỏ trước khi nhập địa chỉ giao hàng và phương thức thanh toán.', en: 'Add products to your cart before entering your shipping address and payment method.' },
                language
            ),
            backToShop: translate({ vi: 'Quay lại mua sắm', en: 'Back to shopping' }, language),
            cartLabel: translate({ vi: 'Giỏ hàng', en: 'Cart' }, language),
            checkoutSubtitle: translate(
                { vi: 'Điền địa chỉ giao hàng, chọn khung giờ nhận hàng và xác nhận phương thức thanh toán.', en: 'Enter your shipping address, choose a delivery window, and confirm the payment method.' },
                language
            ),
        }),
        [language]
    );

    useEffect(() => {
        if (!createdOrder || countdown <= 0) {
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
    }, [createdOrder, countdown]);

    useEffect(() => {
        if (subtotal + SHIPPING_FEE > 2000000 && formData.paymentMethod === 'COD') {
            setFormData((prev) => ({ ...prev, paymentMethod: 'BANK_TRANSFER' }));
        }
    }, [subtotal, formData.paymentMethod]);

    const orderTotal = subtotal + SHIPPING_FEE;
    const isCodDisabled = orderTotal > 2000000;
    const countdownLabel = `${Math.floor(countdown / 60)}:${(countdown % 60).toString().padStart(2, '0')}`;

    const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = event.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        setCopied(label);
        toast.success(copy.copied(label));
        setTimeout(() => setCopied(null), 2000);
    };

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();

        if (items.length === 0) {
            toast.error(copy.emptyCart);
            return;
        }

        setLoading(true);

        try {
            const response = await createOrder({
                items: items.map((item) => ({
                    product: item.productId,
                    quantity: item.quantity,
                    price: item.price,
                })),
                shippingAddress: {
                    fullName: formData.fullName,
                    phone: formData.phone,
                    address: formData.address,
                    ward: formData.ward,
                    district: formData.district,
                    province: formData.province,
                },
                deliverySlot: formData.deliverySlot,
                paymentMethod: formData.paymentMethod,
            });

            if (formData.paymentMethod === 'BANK_TRANSFER') {
                bankTransferRef.current = true;
                setCreatedOrder(response.order);
                setCheckoutUrl(response.checkoutUrl || null);
                clearCart();
                toast.success(copy.bankOrderCreated);
                return;
            }

            clearCart();
            toast.success(copy.orderCreated);
            navigate(`/orders/${response.order._id}`);
        } catch (error: any) {
            const message = error.response?.data?.error || copy.orderCreateFailed;
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    if (createdOrder) {
        return (
            <>
                <StorefrontBreadcrumb
                    title={copy.transferTitle}
                    items={[{ label: copy.checkoutTitle, to: '/checkout' }, { label: copy.transferBreadcrumb }]}
                    subtitle={copy.transferSubtitle}
                />
                <CheckoutTransferView
                    bankConfig={BANK_CONFIG}
                    copied={copied}
                    checkoutUrl={checkoutUrl}
                    countdownLabel={countdownLabel}
                    createdOrder={createdOrder}
                    formatPrice={formatDisplayCurrency}
                    onContinueShopping={() => navigate('/products')}
                    onCopy={copyToClipboard}
                    onOpenOrder={() => navigate(`/orders/${createdOrder._id}`)}
                />
            </>
        );
    }

    if (items.length === 0 && !bankTransferRef.current) {
        return (
            <>
                <StorefrontBreadcrumb
                    title={copy.checkoutTitle}
                    items={[{ label: copy.checkoutTitle }]}
                    subtitle={copy.checkoutSubtitleEmpty}
                />

                <section className="section-b-space">
                    <div className="container-fluid-lg">
                        <div className="ttdn-empty-state text-center">
                            <h3 className="fw-bold text-dark mb-2">{copy.checkoutEmptyTitle}</h3>
                            <p className="text-content mb-4">{copy.checkoutEmptyDescription}</p>
                            <button type="button" className="btn btn-animation px-4" onClick={() => navigate('/products')}>
                                {copy.backToShop}
                            </button>
                        </div>
                    </div>
                </section>
            </>
        );
    }

    return (
        <>
            <StorefrontBreadcrumb
                title={copy.checkoutTitle}
                items={[{ label: copy.cartLabel, to: '/cart' }, { label: copy.checkoutTitle }]}
                subtitle={copy.checkoutSubtitle}
            />
            <CheckoutFormView
                formData={formData}
                formatPrice={formatDisplayCurrency}
                isCodDisabled={isCodDisabled}
                items={items}
                loading={loading}
                onChange={handleChange}
                onSubmit={handleSubmit}
                shippingFee={SHIPPING_FEE}
                subtotal={subtotal}
                total={orderTotal}
            />
        </>
    );
};
