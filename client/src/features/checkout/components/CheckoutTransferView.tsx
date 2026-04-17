import { AlertCircle, Check, CheckCircle, Copy, CreditCard, QrCode } from 'lucide-react';
import { Order } from '@/features/orders/services/ordersApi';
import { translate } from '@/features/shared/utils/displayPreferences';
import { useThemeStore } from '@/store/themeStore';

interface BankConfig {
    bankId: string;
    accountNo: string;
    accountName: string;
    template: string;
}

interface CheckoutTransferViewProps {
    bankConfig: BankConfig;
    copied: string | null;
    checkoutUrl: string | null;
    countdownLabel: string;
    createdOrder: Order;
    formatPrice: (price: number) => string;
    onContinueShopping: () => void;
    onCopy: (text: string, label: string) => void;
    onOpenOrder: () => void;
}

function PaymentCopyField({
    label,
    value,
    copyValue,
    copied,
    onCopy,
    highlightClassName,
}: {
    label: string;
    value: string;
    copyValue: string;
    copied: string | null;
    onCopy: (text: string, label: string) => void;
    highlightClassName?: string;
}) {
    const language = useThemeStore((state) => state.language);

    return (
        <div className="ttdn-bank-card">
            <p className="text-content small text-uppercase fw-semibold mb-2">{label}</p>
            <div className="ttdn-copy-row">
                <p className={`mb-0 fw-bold ${highlightClassName || 'text-dark'}`}>{value}</p>
                <button
                    type="button"
                    className="ttdn-copy-button"
                    onClick={() => onCopy(copyValue, label)}
                    aria-label={translate({ vi: `Sao chép ${label}`, en: `Copy ${label}` }, language)}
                >
                    {copied === label ? <Check size={16} className="text-success" /> : <Copy size={16} />}
                </button>
            </div>
        </div>
    );
}

export function CheckoutTransferView({
    bankConfig,
    copied,
    checkoutUrl,
    countdownLabel,
    createdOrder,
    formatPrice,
    onContinueShopping,
    onCopy,
    onOpenOrder,
}: CheckoutTransferViewProps) {
    const language = useThemeStore((state) => state.language);
    const transferContent = createdOrder.orderNumber || `DH${createdOrder._id.slice(-8).toUpperCase()}`;
    const orderTotal = createdOrder.total;
    const qrImageUrl = `https://img.vietqr.io/image/${bankConfig.bankId}-${bankConfig.accountNo}-${bankConfig.template}.png?amount=${orderTotal}&addInfo=${encodeURIComponent(transferContent)}&accountName=${encodeURIComponent(bankConfig.accountName)}`;

    const labels = {
        bankTransfer: translate({ vi: 'Chuyển khoản ngân hàng', en: 'Bank transfer' }, language),
        heroTitle: translate(
            { vi: `Hoàn tất chuyển khoản cho đơn #${transferContent}`, en: `Complete payment for order #${transferContent}` },
            language
        ),
        heroDescription: translate(
            { vi: 'Dùng đúng nội dung chuyển khoản để hệ thống xác nhận tự động.', en: 'Use the exact transfer note so the system can confirm your payment automatically.' },
            language
        ),
        timeRemaining: translate({ vi: 'Thời gian còn lại', en: 'Time remaining' }, language),
        scanQr: translate({ vi: 'Quét mã QR', en: 'Scan QR code' }, language),
        scanDescription: translate(
            { vi: 'Mở app ngân hàng, quét mã và xác nhận giao dịch.', en: 'Open your banking app, scan the QR code, and confirm the transfer.' },
            language
        ),
        transferInfo: translate({ vi: 'Thông tin chuyển khoản', en: 'Transfer details' }, language),
        bank: translate({ vi: 'Ngân hàng', en: 'Bank' }, language),
        accountNumber: translate({ vi: 'Số tài khoản', en: 'Account number' }, language),
        accountName: translate({ vi: 'Chủ tài khoản', en: 'Account holder' }, language),
        transferNote: translate({ vi: 'Nội dung', en: 'Transfer note' }, language),
        transferWarning: translate(
            { vi: 'Chuyển đúng', en: 'Transfer exactly' },
            language
        ),
        subtotal: translate({ vi: 'Tạm tính', en: 'Subtotal' }, language),
        shippingFee: translate({ vi: 'Phí giao hàng', en: 'Shipping fee' }, language),
        total: translate({ vi: 'Tổng cộng', en: 'Total' }, language),
        viewOrder: translate({ vi: 'Xem chi tiết đơn hàng', en: 'View order details' }, language),
        continueShopping: translate({ vi: 'Tiếp tục mua sắm', en: 'Continue shopping' }, language),
    };

    return (
        <section className="section-b-space">
            <div className="container-fluid-lg">
                <div className="ttdn-page-hero mb-4">
                    <div className="d-flex flex-wrap justify-content-between align-items-start gap-3">
                        <div>
                            <p className="text-uppercase small fw-bold text-white-50 mb-2">{labels.bankTransfer}</p>
                            <h2 className="text-white fw-bold mb-2">{labels.heroTitle}</h2>
                            <p className="text-white-50 mb-0">{labels.heroDescription}</p>
                        </div>

                        <div className="ttdn-hero-stats">
                            <p className="mb-1 text-white-50">{labels.timeRemaining}</p>
                            <h3 className="mb-0 text-white">{countdownLabel}</h3>
                        </div>
                    </div>
                </div>

                <div className="row g-4">
                    <div className="col-lg-7">
                        <div className="ttdn-qr-card text-center">
                            <div className="d-flex align-items-center gap-2 mb-4">
                                <QrCode size={20} className="text-success" />
                                <h3 className="fw-bold text-dark mb-0">{labels.scanQr}</h3>
                            </div>

                            {checkoutUrl ? (
                                <div className="rounded-4 overflow-hidden border">
                                    <iframe src={checkoutUrl} title="SePay payment" className="w-100" style={{ height: 580, border: 0 }} />
                                </div>
                            ) : (
                                <>
                                    <div className="bg-white rounded-4 p-3 shadow-sm d-inline-block mb-3">
                                        <img
                                            src={qrImageUrl}
                                            alt="VietQR payment"
                                            className="img-fluid"
                                            style={{ maxWidth: 320 }}
                                            onError={(event) => {
                                                (event.target as HTMLImageElement).src = `https://img.vietqr.io/image/${bankConfig.bankId}-${bankConfig.accountNo}-${bankConfig.template}.png`;
                                            }}
                                        />
                                    </div>
                                    <p className="text-content mb-0">{labels.scanDescription}</p>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="col-lg-5">
                        <div className="ttdn-qr-card">
                            <div className="d-flex align-items-center gap-2 mb-4">
                                <CreditCard size={20} className="text-success" />
                                <h3 className="fw-bold text-dark mb-0">{labels.transferInfo}</h3>
                            </div>

                            <div className="ttdn-bank-grid mb-4">
                                <PaymentCopyField
                                    label={labels.bank}
                                    value="MB Bank"
                                    copyValue="MB Bank"
                                    copied={copied}
                                    onCopy={onCopy}
                                />
                                <PaymentCopyField
                                    label={labels.accountNumber}
                                    value={bankConfig.accountNo}
                                    copyValue={bankConfig.accountNo}
                                    copied={copied}
                                    onCopy={onCopy}
                                />
                                <PaymentCopyField
                                    label={labels.accountName}
                                    value={bankConfig.accountName}
                                    copyValue={bankConfig.accountName}
                                    copied={copied}
                                    onCopy={onCopy}
                                />
                                <PaymentCopyField
                                    label={labels.transferNote}
                                    value={transferContent}
                                    copyValue={transferContent}
                                    copied={copied}
                                    onCopy={onCopy}
                                    highlightClassName="theme-color"
                                />
                            </div>

                            <div className="ttdn-summary-note mb-4">
                                <div className="d-flex align-items-start gap-2">
                                    <AlertCircle size={18} className="text-warning mt-1 flex-shrink-0" />
                                    <p className="text-content mb-0">
                                        {labels.transferWarning} <strong>{formatPrice(orderTotal)}</strong> {translate({ vi: 'và giữ nguyên nội dung', en: 'and keep the note' }, language)} <strong>{transferContent}</strong>.
                                    </p>
                                </div>
                            </div>

                            <div className="border-top pt-4">
                                <div className="d-flex justify-content-between text-content mb-2">
                                    <span>{labels.subtotal}</span>
                                    <span>{formatPrice(createdOrder.subtotal)}</span>
                                </div>
                                <div className="d-flex justify-content-between text-content mb-3">
                                    <span>{labels.shippingFee}</span>
                                    <span>{formatPrice(createdOrder.shippingFee)}</span>
                                </div>
                                <div className="d-flex justify-content-between fw-bold text-dark">
                                    <span>{labels.total}</span>
                                    <span className="theme-color">{formatPrice(orderTotal)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="d-flex flex-column flex-sm-row gap-3 mt-4">
                    <button type="button" className="btn btn-light shopping-button text-dark" onClick={onOpenOrder}>
                        <CheckCircle size={16} className="me-2" />
                        {labels.viewOrder}
                    </button>
                    <button type="button" className="btn btn-animation" onClick={onContinueShopping}>
                        {labels.continueShopping}
                    </button>
                </div>
            </div>
        </section>
    );
}
