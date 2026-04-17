export const formatAdminCurrency = (value: number) =>
    new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    }).format(value || 0);

export const formatAdminDate = (value: string) =>
    new Date(value).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });

export const formatAdminDateTime = (value: string) =>
    new Date(value).toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

export const adminOrderStatusOptions = [
    { value: '', label: 'Tất cả' },
    { value: 'pending', label: 'Chờ xác nhận' },
    { value: 'confirmed', label: 'Đã xác nhận' },
    { value: 'preparing', label: 'Đang chuẩn bị' },
    { value: 'shipping', label: 'Đang giao' },
    { value: 'completed', label: 'Hoàn thành' },
    { value: 'cancelled', label: 'Đã hủy' },
] as const;

const adminOrderStatusLabels: Record<string, string> = Object.fromEntries(
    adminOrderStatusOptions.map((item) => [item.value, item.label])
);

const adminOrderStatusClassNames: Record<string, string> = {
    pending: 'ttdn-admin-status-badge ttdn-admin-status-badge--pending',
    confirmed: 'ttdn-admin-status-badge ttdn-admin-status-badge--confirmed',
    preparing: 'ttdn-admin-status-badge ttdn-admin-status-badge--preparing',
    shipping: 'ttdn-admin-status-badge ttdn-admin-status-badge--shipping',
    completed: 'ttdn-admin-status-badge ttdn-admin-status-badge--completed',
    cancelled: 'ttdn-admin-status-badge ttdn-admin-status-badge--cancelled',
};

const adminRoleLabels: Record<string, string> = {
    customer: 'Khách hàng',
    admin: 'Quản trị viên',
    superadmin: 'Quản trị cấp cao',
};

export const adminOrderFlow = ['pending', 'confirmed', 'preparing', 'shipping', 'completed'];

export const getAdminOrderStatusLabel = (status: string) =>
    adminOrderStatusLabels[status] || status;

export const getAdminOrderStatusClassName = (status: string) =>
    adminOrderStatusClassNames[status] || 'ttdn-admin-status-badge';

export const getAdminRoleClassName = (role: string) => {
    if (role === 'admin') {
        return 'bg-info-subtle text-info-emphasis';
    }

    if (role === 'superadmin') {
        return 'bg-primary-subtle text-primary-emphasis';
    }

    return 'bg-light text-muted';
};

export const getAdminRoleLabel = (role: string) => adminRoleLabels[role] || role;

export const getAdminImageUrl = (image: any) => {
    if (!image) {
        return '';
    }

    return typeof image === 'string' ? image : image.url || '';
};

export const getAdminFirstImageUrl = (images?: any[]) => {
    if (!images?.length) {
        return '';
    }

    return getAdminImageUrl(images[0]);
};
