import { formatDisplayCurrency, formatDisplayDateTime, translate } from '@/features/shared/utils/displayPreferences';

const orderStatusLabels: Record<string, { vi: string; en: string }> = {
    pending: { vi: 'Chờ xác nhận', en: 'Pending confirmation' },
    confirmed: { vi: 'Đã xác nhận', en: 'Confirmed' },
    preparing: { vi: 'Đang chuẩn bị', en: 'Preparing' },
    shipping: { vi: 'Đang giao', en: 'Shipping' },
    completed: { vi: 'Hoàn thành', en: 'Completed' },
    cancelled: { vi: 'Đã hủy', en: 'Cancelled' },
};

const orderStatusClassNames: Record<string, string> = {
    pending: 'bg-warning-subtle text-warning-emphasis',
    confirmed: 'bg-info-subtle text-info-emphasis',
    preparing: 'bg-primary-subtle text-primary-emphasis',
    shipping: 'bg-secondary-subtle text-secondary-emphasis',
    completed: 'bg-success-subtle text-success-emphasis',
    cancelled: 'bg-danger-subtle text-danger-emphasis',
};

const paymentMethodLabels: Record<string, { vi: string; en: string }> = {
    cod: { vi: 'Thanh toán khi nhận hàng', en: 'Cash on delivery' },
    bank_transfer: { vi: 'Chuyển khoản ngân hàng', en: 'Bank transfer' },
};

const paymentStatusLabels: Record<string, { vi: string; en: string }> = {
    pending: { vi: 'Chờ thanh toán', en: 'Awaiting payment' },
    paid: { vi: 'Đã thanh toán', en: 'Paid' },
    failed: { vi: 'Thanh toán lỗi', en: 'Payment failed' },
    refunded: { vi: 'Đã hoàn tiền', en: 'Refunded' },
};

export const formatOrderPrice = (price: number) => formatDisplayCurrency(price);

export const formatOrderDateTime = (value: string) => formatDisplayDateTime(value);

export const getOrderStatusLabel = (status: string) =>
    translate(orderStatusLabels[status] || { vi: status, en: status });

export const getOrderStatusClassName = (status: string) =>
    orderStatusClassNames[status] || 'bg-light text-muted';

export const getPaymentMethodLabel = (paymentMethod: string) =>
    translate(paymentMethodLabels[paymentMethod] || { vi: paymentMethod, en: paymentMethod });

export const getPaymentStatusLabel = (paymentStatus: string) =>
    translate(paymentStatusLabels[paymentStatus] || { vi: paymentStatus, en: paymentStatus });

export const isBankTransferOrder = (paymentMethod: string) => paymentMethod === 'bank_transfer';

export const isPaidOrder = (paymentStatus: string) => paymentStatus === 'paid';

export const getOrderDisplayCode = (order: { _id: string; orderNumber?: string }) =>
    order.orderNumber || order._id.slice(-6).toUpperCase();

export const getOrderItemImage = (item: any) => {
    const image = item?.product?.images?.[0];

    if (!image) {
        return '';
    }

    return typeof image === 'string' ? image : image.url || '';
};
