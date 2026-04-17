import type { ChangeEvent, FormEvent } from 'react';
import { AlertCircle, CreditCard, MapPin, Truck } from 'lucide-react';
import type { CartItem } from '@/store/cartStore';
import { translate } from '@/features/shared/utils/displayPreferences';
import { useThemeStore } from '@/store/themeStore';
import { CheckoutOptionCard } from './CheckoutOptionCard';

interface CheckoutFormData {
    fullName: string;
    phone: string;
    address: string;
    ward: string;
    district: string;
    province: string;
    deliverySlot: '08:00-12:00' | '14:00-18:00';
    paymentMethod: 'COD' | 'BANK_TRANSFER';
}

interface CheckoutFormViewProps {
    formData: CheckoutFormData;
    formatPrice: (price: number) => string;
    isCodDisabled: boolean;
    items: CartItem[];
    loading: boolean;
    onChange: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    onSubmit: (event: FormEvent) => void;
    shippingFee: number;
    subtotal: number;
    total: number;
}

export function CheckoutFormView({
    formData,
    formatPrice,
    isCodDisabled,
    items,
    loading,
    onChange,
    onSubmit,
    shippingFee,
    subtotal,
    total,
}: CheckoutFormViewProps) {
    const language = useThemeStore((state) => state.language);
    const codLimit = formatPrice(2000000);

    const addressFields = [
        { id: 'fullName', label: translate({ vi: 'Họ và tên', en: 'Full name' }, language), className: 'col-md-6' },
        { id: 'phone', label: translate({ vi: 'Số điện thoại', en: 'Phone number' }, language), className: 'col-md-6' },
        { id: 'address', label: translate({ vi: 'Địa chỉ chi tiết', en: 'Street address' }, language), className: 'col-12' },
        { id: 'ward', label: translate({ vi: 'Phường/Xã', en: 'Ward/Commune' }, language), className: 'col-md-4' },
        { id: 'district', label: translate({ vi: 'Quận/Huyện', en: 'District' }, language), className: 'col-md-4' },
        { id: 'province', label: translate({ vi: 'Tỉnh/Thành phố', en: 'Province/City' }, language), className: 'col-md-4' },
    ] as const;

    return (
        <section className="checkout-section-2 section-b-space">
            <div className="container-fluid-lg">
                <form onSubmit={onSubmit}>
                    <div className="row g-sm-4 g-4">
                        <div className="col-lg-8">
                            <div className="left-sidebar-checkout">
                                <div className="checkout-detail-box">
                                    <ul>
                                        <li>
                                            <div className="ttdn-checkout-icon">
                                                <MapPin size={22} />
                                            </div>
                                            <div className="checkout-box">
                                                <div className="checkout-title">
                                                    <h4>{translate({ vi: 'Địa chỉ giao hàng', en: 'Delivery address' }, language)}</h4>
                                                </div>

                                                <div className="checkout-detail">
                                                    <div className="row g-4">
                                                        {addressFields.map((field) => (
                                                            <div key={field.id} className={field.className}>
                                                                <div className="form-floating theme-form-floating">
                                                                    <input
                                                                        id={field.id}
                                                                        name={field.id}
                                                                        className="form-control"
                                                                        placeholder={field.label}
                                                                        value={formData[field.id as keyof CheckoutFormData] as string}
                                                                        onChange={onChange}
                                                                        required
                                                                    />
                                                                    <label htmlFor={field.id}>{field.label}</label>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </li>

                                        <li>
                                            <div className="ttdn-checkout-icon">
                                                <Truck size={22} />
                                            </div>
                                            <div className="checkout-box">
                                                <div className="checkout-title">
                                                    <h4>{translate({ vi: 'Khung giờ giao hàng', en: 'Delivery window' }, language)}</h4>
                                                </div>

                                                <div className="checkout-detail">
                                                    <div className="ttdn-option-grid">
                                                        <CheckoutOptionCard
                                                            active={formData.deliverySlot === '08:00-12:00'}
                                                            name="deliverySlot"
                                                            value="08:00-12:00"
                                                            checked={formData.deliverySlot === '08:00-12:00'}
                                                            title={translate({ vi: 'Buổi sáng (08:00 - 12:00)', en: 'Morning (08:00 - 12:00)' }, language)}
                                                            description={translate(
                                                                { vi: 'Phù hợp cho đơn cần nhận sớm trong ngày.', en: 'Best for orders you want delivered earlier in the day.' },
                                                                language
                                                            )}
                                                            onChange={onChange}
                                                        />
                                                        <CheckoutOptionCard
                                                            active={formData.deliverySlot === '14:00-18:00'}
                                                            name="deliverySlot"
                                                            value="14:00-18:00"
                                                            checked={formData.deliverySlot === '14:00-18:00'}
                                                            title={translate({ vi: 'Buổi chiều (14:00 - 18:00)', en: 'Afternoon (14:00 - 18:00)' }, language)}
                                                            description={translate(
                                                                { vi: 'Linh hoạt hơn cho lịch nhận hàng sau giờ trưa.', en: 'A more flexible choice for afternoon deliveries.' },
                                                                language
                                                            )}
                                                            onChange={onChange}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </li>

                                        <li>
                                            <div className="ttdn-checkout-icon">
                                                <CreditCard size={22} />
                                            </div>
                                            <div className="checkout-box">
                                                <div className="checkout-title">
                                                    <h4>{translate({ vi: 'Phương thức thanh toán', en: 'Payment method' }, language)}</h4>
                                                </div>

                                                <div className="checkout-detail">
                                                    <div className="ttdn-option-grid">
                                                        <CheckoutOptionCard
                                                            active={formData.paymentMethod === 'COD'}
                                                            disabled={isCodDisabled}
                                                            name="paymentMethod"
                                                            value="COD"
                                                            checked={formData.paymentMethod === 'COD'}
                                                            title={translate({ vi: 'Thanh toán khi nhận hàng (COD)', en: 'Cash on delivery (COD)' }, language)}
                                                            description={
                                                                isCodDisabled
                                                                    ? translate(
                                                                          {
                                                                              vi: `COD chỉ áp dụng cho đơn dưới ${codLimit}.`,
                                                                              en: `COD is only available for orders below ${codLimit}.`,
                                                                          },
                                                                          language
                                                                      )
                                                                    : translate(
                                                                          {
                                                                              vi: 'Bạn thanh toán bằng tiền mặt khi đơn được giao tới.',
                                                                              en: 'Pay in cash when your order is delivered.',
                                                                          },
                                                                          language
                                                                      )
                                                            }
                                                            onChange={onChange}
                                                            badge={
                                                                isCodDisabled ? (
                                                                    <span className="badge bg-danger-subtle text-danger rounded-pill">
                                                                        {translate({ vi: 'Vượt hạn mức', en: 'Limit exceeded' }, language)}
                                                                    </span>
                                                                ) : undefined
                                                            }
                                                        />
                                                        <CheckoutOptionCard
                                                            active={formData.paymentMethod === 'BANK_TRANSFER'}
                                                            name="paymentMethod"
                                                            value="BANK_TRANSFER"
                                                            checked={formData.paymentMethod === 'BANK_TRANSFER'}
                                                            title={translate({ vi: 'Chuyển khoản ngân hàng', en: 'Bank transfer' }, language)}
                                                            description={translate(
                                                                {
                                                                    vi: 'Sau khi tạo đơn, hệ thống sẽ hiển thị QR và nội dung chuyển khoản.',
                                                                    en: 'After the order is created, the system will show a QR code and transfer details.',
                                                                },
                                                                language
                                                            )}
                                                            onChange={onChange}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-4">
                            <div className="right-side-summery-box">
                                <div className="summery-box-2">
                                    <div className="summery-header">
                                        <h3>{translate({ vi: 'Tóm tắt đơn hàng', en: 'Order summary' }, language)}</h3>
                                    </div>

                                    <ul className="summery-contain">
                                        {items.map((item) => (
                                            <li key={item.productId}>
                                                {item.image ? (
                                                    <img src={item.image} alt={item.name} className="img-fluid checkout-image" />
                                                ) : (
                                                    <div
                                                        className="checkout-image d-inline-flex align-items-center justify-content-center bg-light rounded-3"
                                                        style={{ width: 60, height: 60 }}
                                                    >
                                                        <AlertCircle size={18} className="text-success" />
                                                    </div>
                                                )}
                                                <h4>
                                                    {item.name} <span>X {item.quantity}</span>
                                                </h4>
                                                <h4 className="price">{formatPrice(item.price * item.quantity)}</h4>
                                            </li>
                                        ))}
                                    </ul>

                                    <ul className="summery-total">
                                        <li>
                                            <h4>{translate({ vi: 'Tạm tính', en: 'Subtotal' }, language)}</h4>
                                            <h4 className="price">{formatPrice(subtotal)}</h4>
                                        </li>
                                        <li>
                                            <h4>{translate({ vi: 'Phí giao hàng', en: 'Shipping fee' }, language)}</h4>
                                            <h4 className="price">{formatPrice(shippingFee)}</h4>
                                        </li>
                                        <li className="list-total">
                                            <h4>{translate({ vi: 'Tổng cộng', en: 'Total' }, language)}</h4>
                                            <h4 className="price theme-color">{formatPrice(total)}</h4>
                                        </li>
                                    </ul>

                                    <button type="submit" className="btn btn-animation w-100 justify-content-center mt-4" disabled={loading}>
                                        {loading
                                            ? translate({ vi: 'Đang tạo đơn...', en: 'Creating order...' }, language)
                                            : translate({ vi: 'Đặt hàng', en: 'Place order' }, language)}
                                    </button>
                                </div>

                                <div className="checkout-offer">
                                    <div className="offer-title">
                                        <div className="offer-name">
                                            <h6>{translate({ vi: 'Lưu ý trước khi xác nhận', en: 'Before you confirm' }, language)}</h6>
                                        </div>
                                    </div>

                                    <ul className="offer-detail">
                                        <li>
                                            <p>
                                                {translate(
                                                    {
                                                        vi: `Phí giao hàng hiện được tính cố định ${formatPrice(shippingFee)}.`,
                                                        en: `Shipping is currently charged at a flat ${formatPrice(shippingFee)}.`,
                                                    },
                                                    language
                                                )}
                                            </p>
                                        </li>
                                        <li>
                                            <p>
                                                {translate(
                                                    {
                                                        vi: `COD chỉ áp dụng khi tổng thanh toán không vượt ${codLimit}.`,
                                                        en: `COD is only available when the total does not exceed ${codLimit}.`,
                                                    },
                                                    language
                                                )}
                                            </p>
                                        </li>
                                        <li>
                                            <p>
                                                {translate(
                                                    {
                                                        vi: 'Chọn chuyển khoản sẽ hiển thị QR ngay sau khi đơn được tạo.',
                                                        en: 'Choosing bank transfer will show a QR code right after the order is created.',
                                                    },
                                                    language
                                                )}
                                            </p>
                                        </li>
                                        <li>
                                            <p>
                                                {translate(
                                                    {
                                                        vi: 'Sau khi đặt hàng, bạn có thể xem lại chi tiết trong mục đơn hàng của tôi.',
                                                        en: 'After placing the order, you can review it again in your orders page.',
                                                    },
                                                    language
                                                )}
                                            </p>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </section>
    );
}
