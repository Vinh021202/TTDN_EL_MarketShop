import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { formatDisplayCurrency, translate } from '@/features/shared/utils/displayPreferences';
import { validateCart } from '@/features/cart/services/cartApi';
import { useCartStore } from '@/store/cartStore';
import { useThemeStore } from '@/store/themeStore';
import { StorefrontBreadcrumb } from '@/features/storefront/components/StorefrontBreadcrumb';

const SHIPPING_FEE = 30000;

export const CartPage = () => {
    const navigate = useNavigate();
    const language = useThemeStore((state) => state.language);
    const { items, subtotal, reservationExpiresAt, removeItem, updateQuantity, calculateSubtotal } = useCartStore();
    const [timeLeft, setTimeLeft] = useState('');
    const [wholesaleWarning, setWholesaleWarning] = useState(false);
    const [perishableWeight, setPerishableWeight] = useState(0);

    const copy = useMemo(
        () => ({
            title: translate({ vi: 'Giỏ hàng', en: 'Cart' }, language),
            emptySubtitle: translate(
                { vi: 'Giỏ đang trống. Chọn thêm sản phẩm để tiếp tục mua sắm.', en: 'Your cart is empty. Add products to keep shopping.' },
                language
            ),
            emptyTitle: translate({ vi: 'Chưa có sản phẩm nào trong giỏ', en: 'Your cart is empty' }, language),
            emptyDescription: translate(
                { vi: 'Khám phá lại danh mục và thêm nông sản, thực phẩm tươi hoặc nguyên liệu nấu ăn vào phiên mua hiện tại.', en: 'Browse the catalog again and add fresh produce, groceries, or cooking ingredients to this shopping session.' },
                language
            ),
            exploreProducts: translate({ vi: 'Khám phá sản phẩm', en: 'Explore products' }, language),
            subtitle: translate(
                { vi: 'Kiểm tra lại số lượng, thời gian giữ chỗ và tạm tính trước khi sang checkout.', en: 'Review quantities, reservation time, and totals before continuing to checkout.' },
                language
            ),
            reservedTitle: (remainingTime: string) =>
                translate(
                    { vi: `Sản phẩm đang được giữ trong ${remainingTime}`, en: `Items are reserved for ${remainingTime}` },
                    language
                ),
            reservedDescription: translate(
                { vi: 'Hoàn tất checkout trước khi hết thời gian để tránh mất giữ chỗ.', en: 'Complete checkout before the timer runs out to avoid losing the reservation.' },
                language
            ),
            wholesaleTitle: (weight: number) =>
                translate(
                    { vi: `Đơn hàng tươi sống khối lượng lớn (${weight}kg)`, en: `Large perishable order (${weight}kg)` },
                    language
                ),
            wholesaleDescription: translate(
                { vi: 'Tổng khối lượng đang vượt ngưỡng 50kg cho hàng cần bảo quản lạnh hoặc đông. Bạn nên liên hệ kênh bán buôn để được hỗ trợ giao vận.', en: 'The total weight is above the 50kg threshold for chilled or frozen goods. Please contact the wholesale channel for delivery support.' },
                language
            ),
            unitPrice: (price: number, unit: string) =>
                translate(
                    { vi: `Đơn giá ${formatDisplayCurrency(price)} / ${unit}`, en: `Unit price ${formatDisplayCurrency(price)} / ${unit}` },
                    language
                ),
            reservationHint: translate(
                { vi: 'Sản phẩm này đang nằm trong phiên giỏ hàng được giữ chỗ.', en: 'This item is currently held in your reserved cart session.' },
                language
            ),
            decreaseQuantity: (name: string) =>
                translate({ vi: `Giảm số lượng ${name}`, en: `Decrease quantity for ${name}` }, language),
            increaseQuantity: (name: string) =>
                translate({ vi: `Tăng số lượng ${name}`, en: `Increase quantity for ${name}` }, language),
            remove: translate({ vi: 'Xóa', en: 'Remove' }, language),
            summaryTitle: translate({ vi: 'Tóm tắt giỏ hàng', en: 'Cart summary' }, language),
            totalItems: translate({ vi: 'Tổng số lượng', en: 'Total items' }, language),
            subtotal: translate({ vi: 'Tạm tính', en: 'Subtotal' }, language),
            shippingFee: translate({ vi: 'Phí giao hàng', en: 'Shipping fee' }, language),
            total: translate({ vi: 'Tổng cộng', en: 'Total' }, language),
            checkout: translate({ vi: 'Tiến hành thanh toán', en: 'Proceed to checkout' }, language),
            continueShopping: translate({ vi: 'Quay lại mua sắm', en: 'Continue shopping' }, language),
            expired: translate({ vi: 'Hết hạn', en: 'Expired' }, language),
        }),
        [language]
    );

    useEffect(() => {
        calculateSubtotal();
    }, [calculateSubtotal]);

    useEffect(() => {
        if (items.length === 0) {
            setWholesaleWarning(false);
            setPerishableWeight(0);
            return;
        }

        validateCart()
            .then((response) => {
                setWholesaleWarning(response.requiresWholesaleContact || false);
                setPerishableWeight(response.totalPerishableWeight || 0);
            })
            .catch(console.error);
    }, [items]);

    useEffect(() => {
        if (!reservationExpiresAt) {
            setTimeLeft('');
            return;
        }

        const interval = setInterval(() => {
            const now = Date.now();
            const expiry = new Date(reservationExpiresAt).getTime();
            const diff = expiry - now;

            if (diff <= 0) {
                setTimeLeft(copy.expired);
                clearInterval(interval);
                return;
            }

            const minutes = Math.floor(diff / 60000);
            const seconds = Math.floor((diff % 60000) / 1000);
            setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`);
        }, 1000);

        return () => clearInterval(interval);
    }, [reservationExpiresAt, copy.expired]);

    const totalItems = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);
    const total = subtotal + SHIPPING_FEE;

    if (items.length === 0) {
        return (
            <>
                <StorefrontBreadcrumb title={copy.title} items={[{ label: copy.title }]} subtitle={copy.emptySubtitle} />

                <section className="cart-section section-b-space">
                    <div className="container-fluid-lg">
                        <div className="ttdn-empty-state text-center">
                            <ShoppingBag size={48} className="mx-auto text-success mb-3" />
                            <h3 className="fw-bold text-dark mb-2">{copy.emptyTitle}</h3>
                            <p className="text-content mb-4">{copy.emptyDescription}</p>
                            <button type="button" className="btn btn-animation px-4" onClick={() => navigate('/products')}>
                                {copy.exploreProducts}
                            </button>
                        </div>
                    </div>
                </section>
            </>
        );
    }

    return (
        <>
            <StorefrontBreadcrumb title={copy.title} items={[{ label: copy.title }]} subtitle={copy.subtitle} />

            <section className="cart-section section-b-space">
                <div className="container-fluid-lg">
                    {reservationExpiresAt ? (
                        <div className="ttdn-info-banner is-timer">
                            <AlertCircle size={20} className="text-success flex-shrink-0" />
                            <div>
                                <h4 className="fw-bold text-dark mb-1">{copy.reservedTitle(timeLeft)}</h4>
                                <p className="text-content mb-0">{copy.reservedDescription}</p>
                            </div>
                        </div>
                    ) : null}

                    {wholesaleWarning ? (
                        <div className="ttdn-info-banner is-warning">
                            <AlertCircle size={20} className="text-warning flex-shrink-0" />
                            <div>
                                <h4 className="fw-bold text-dark mb-1">{copy.wholesaleTitle(perishableWeight)}</h4>
                                <p className="text-content mb-0">{copy.wholesaleDescription}</p>
                            </div>
                        </div>
                    ) : null}

                    <div className="row g-xl-5 g-4">
                        <div className="col-xxl-8 col-xl-7">
                            <div className="ttdn-cart-shell">
                                {items.map((item) => (
                                    <div key={item.productId} className="ttdn-cart-row">
                                        <div className="ttdn-cart-media">
                                            <Link to={`/products/${item.productId}`} className="ttdn-cart-image text-decoration-none">
                                                {item.image ? <img src={item.image} alt={item.name} /> : <ShoppingBag size={36} className="text-success" />}
                                            </Link>

                                            <div className="ttdn-cart-copy">
                                                <p className="theme-color fw-semibold small mb-1">{item.unit}</p>
                                                <Link to={`/products/${item.productId}`} className="ttdn-cart-title text-decoration-none">
                                                    {item.name}
                                                </Link>
                                                <p className="text-content mb-1">{copy.unitPrice(item.price, item.unit)}</p>
                                                <p className="text-content mb-0">{copy.reservationHint}</p>
                                            </div>
                                        </div>

                                        <div className="ttdn-cart-meta">
                                            <div className="ttdn-cart-qty">
                                                <button
                                                    type="button"
                                                    aria-label={copy.decreaseQuantity(item.name)}
                                                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                                >
                                                    <Minus size={16} />
                                                </button>
                                                <span className="ttdn-cart-qty-value">{item.quantity}</span>
                                                <button
                                                    type="button"
                                                    aria-label={copy.increaseQuantity(item.name)}
                                                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                                >
                                                    <Plus size={16} />
                                                </button>
                                            </div>

                                            <div className="text-md-end">
                                                <h4 className="theme-color fw-bold mb-2">{formatDisplayCurrency(item.price * item.quantity)}</h4>
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-outline-danger rounded-pill"
                                                    onClick={() => removeItem(item.productId)}
                                                >
                                                    <Trash2 size={14} className="me-1" />
                                                    {copy.remove}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="col-xxl-4 col-xl-5">
                            <div className="summery-box p-sticky">
                                <div className="summery-header">
                                    <h3>{copy.summaryTitle}</h3>
                                </div>

                                <div className="summery-contain">
                                    <ul>
                                        <li>
                                            <h4>{copy.totalItems}</h4>
                                            <h4 className="price">{totalItems}</h4>
                                        </li>
                                        <li>
                                            <h4>{copy.subtotal}</h4>
                                            <h4 className="price">{formatDisplayCurrency(subtotal)}</h4>
                                        </li>
                                        <li>
                                            <h4>{copy.shippingFee}</h4>
                                            <h4 className="price">{formatDisplayCurrency(SHIPPING_FEE)}</h4>
                                        </li>
                                    </ul>
                                </div>

                                <ul className="summery-total">
                                    <li className="list-total border-top-0">
                                        <h4>{copy.total}</h4>
                                        <h4 className="price theme-color">{formatDisplayCurrency(total)}</h4>
                                    </li>
                                </ul>

                                <div className="button-group cart-button">
                                    <ul>
                                        <li>
                                            <button type="button" className="btn btn-animation proceed-btn fw-bold" onClick={() => navigate('/checkout')}>
                                                {copy.checkout}
                                            </button>
                                        </li>
                                        <li>
                                            <button type="button" className="btn btn-light shopping-button text-dark" onClick={() => navigate('/products')}>
                                                {copy.continueShopping}
                                            </button>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};
