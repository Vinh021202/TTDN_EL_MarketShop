import { useEffect, useMemo, useState } from 'react';
import {
    AlertCircle,
    BadgePercent,
    Pencil,
    Plus,
    RefreshCw,
    Trash2,
    Truck,
} from 'lucide-react';
import { formatAdminDateTime } from './adminPresentation';
import {
    type AdminVoucher,
    adminCreateVoucher,
    adminDeleteVoucher,
    adminGetAllVouchers,
    adminUpdateVoucher,
} from './services/adminApi';

interface VoucherFormState {
    code: string;
    quantity: string;
    discountPercent: string;
    description: string;
    isActive: boolean;
}

const emptyFormState: VoucherFormState = {
    code: '',
    quantity: '50',
    discountPercent: '10',
    description: '',
    isActive: true,
};

const getRemainingQuantity = (voucher: AdminVoucher) =>
    Math.max(0, Number(voucher.remainingQuantity ?? voucher.quantity - voucher.usedCount));

const getVoucherValueLabel = (voucher: AdminVoucher) =>
    voucher.type === 'freeship' ? 'Miễn phí vận chuyển' : `Giảm ${voucher.discountPercent || 0}%`;

export function AdminVouchersPage() {
    const [vouchers, setVouchers] = useState<AdminVoucher[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');
    const [editingVoucherId, setEditingVoucherId] = useState<string | null>(null);
    const [form, setForm] = useState<VoucherFormState>(emptyFormState);

    const fetchVouchers = async () => {
        setLoading(true);
        setError('');

        try {
            const data = await adminGetAllVouchers();
            setVouchers(data.vouchers || []);
        } catch {
            setError('Không thể tải danh sách voucher.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVouchers();
    }, []);

    const summary = useMemo(() => {
        const percentageVouchers = vouchers.filter((voucher) => voucher.type === 'percentage');
        const activeVouchers = vouchers.filter((voucher) => voucher.isActive);
        const totalRemaining = vouchers.reduce(
            (total, voucher) => total + getRemainingQuantity(voucher),
            0
        );
        const fixedVoucher = vouchers.find((voucher) => voucher.isFixed);

        return {
            percentageCount: percentageVouchers.length,
            activeCount: activeVouchers.length,
            totalRemaining,
            fixedVoucher,
        };
    }, [vouchers]);

    const resetForm = () => {
        setForm(emptyFormState);
        setEditingVoucherId(null);
    };

    const handleEdit = (voucher: AdminVoucher) => {
        if (voucher.isFixed) {
            return;
        }

        setEditingVoucherId(voucher._id);
        setForm({
            code: voucher.code,
            quantity: String(voucher.quantity),
            discountPercent: String(voucher.discountPercent || ''),
            description: voucher.description || '',
            isActive: voucher.isActive,
        });
        setNotice('');
        setError('');
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSubmitting(true);
        setError('');
        setNotice('');

        try {
            const payload = {
                code: form.code.trim().toUpperCase(),
                quantity: Number(form.quantity),
                discountPercent: Number(form.discountPercent),
                description: form.description.trim() || undefined,
                isActive: form.isActive,
            };

            if (editingVoucherId) {
                await adminUpdateVoucher(editingVoucherId, payload);
                setNotice('Đã cập nhật voucher thành công.');
            } else {
                await adminCreateVoucher(payload);
                setNotice('Đã tạo voucher mới thành công.');
            }

            resetForm();
            await fetchVouchers();
        } catch (requestError: any) {
            setError(requestError?.response?.data?.error || 'Không thể lưu voucher.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (voucher: AdminVoucher) => {
        if (voucher.isFixed) {
            return;
        }

        if (!window.confirm(`Bạn chắc chắn muốn xóa voucher "${voucher.code}"?`)) {
            return;
        }

        try {
            await adminDeleteVoucher(voucher._id);
            setNotice('Đã xóa voucher.');
            if (editingVoucherId === voucher._id) {
                resetForm();
            }
            await fetchVouchers();
        } catch (requestError: any) {
            setError(requestError?.response?.data?.error || 'Không thể xóa voucher.');
        }
    };

    return (
        <div className="d-grid gap-4 ttdn-admin-voucher-page">
            <section className="ttdn-admin-page-intro">
                <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3">
                    <div>
                        <p className="text-uppercase small fw-bold text-white-50 mb-2">Voucher</p>
                        <h2 className="display-6 fw-bold text-white mb-2">Quản lý khuyến mãi và freeship</h2>
                        <p className="text-white-50 mb-0">
                            Tạo voucher giảm giá theo phần trăm, theo dõi số lượng còn lại và luôn giữ sẵn một mã freeship cố định cho hệ thống.
                        </p>
                    </div>

                    <div className="d-flex flex-column align-items-start align-items-lg-end gap-3">
                        <div className="ttdn-admin-card bg-transparent border border-white border-opacity-25 shadow-none text-white">
                            <p className="text-white-50 mb-1">Voucher freeship cố định</p>
                            <h3 className="h2 fw-bold text-white mb-0">{summary.fixedVoucher?.code || 'FREESHIP'}</h3>
                        </div>
                        <button
                            type="button"
                            className="btn rounded-pill px-4 ttdn-admin-hero-light-btn"
                            onClick={resetForm}
                        >
                            <Plus size={16} className="me-2" />
                            Tạo voucher mới
                        </button>
                    </div>
                </div>
            </section>

            <section className="row g-4 align-items-start">
                <div className="col-xl-5">
                    <div className="ttdn-admin-card">
                        <div className="d-flex justify-content-between align-items-start gap-3 mb-4">
                            <div>
                                <p className="text-uppercase small fw-bold theme-color mb-2">Biểu mẫu</p>
                                <h3 className="h4 fw-bold mb-1">
                                    {editingVoucherId ? 'Chỉnh sửa voucher' : 'Thêm voucher giảm giá'}
                                </h3>
                                <p className="text-muted mb-0">
                                    Nhập mã, số lượng phát hành và phần trăm giảm giá.
                                </p>
                            </div>

                            {editingVoucherId ? (
                                <button
                                    type="button"
                                    className="btn btn-light rounded-pill"
                                    onClick={resetForm}
                                >
                                    Hủy
                                </button>
                            ) : null}
                        </div>

                        <form className="ttdn-admin-form-grid" onSubmit={handleSubmit}>
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <label className="form-label fw-semibold">Mã voucher</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={form.code}
                                        onChange={(event) =>
                                            setForm((current) => ({
                                                ...current,
                                                code: event.target.value.toUpperCase(),
                                            }))
                                        }
                                        placeholder="VD: GIAM10"
                                        required
                                    />
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label fw-semibold">Trạng thái</label>
                                    <select
                                        className="form-select"
                                        value={form.isActive ? 'active' : 'inactive'}
                                        onChange={(event) =>
                                            setForm((current) => ({
                                                ...current,
                                                isActive: event.target.value === 'active',
                                            }))
                                        }
                                    >
                                        <option value="active">Đang áp dụng</option>
                                        <option value="inactive">Tạm tắt</option>
                                    </select>
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label fw-semibold">Phần trăm giảm giá</label>
                                    <div className="input-group">
                                        <input
                                            type="number"
                                            min={1}
                                            max={100}
                                            className="form-control"
                                            value={form.discountPercent}
                                            onChange={(event) =>
                                                setForm((current) => ({
                                                    ...current,
                                                    discountPercent: event.target.value,
                                                }))
                                            }
                                            required
                                        />
                                        <span className="input-group-text">%</span>
                                    </div>
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label fw-semibold">Số lượng voucher</label>
                                    <input
                                        type="number"
                                        min={1}
                                        className="form-control"
                                        value={form.quantity}
                                        onChange={(event) =>
                                            setForm((current) => ({
                                                ...current,
                                                quantity: event.target.value,
                                            }))
                                        }
                                        required
                                    />
                                </div>

                                <div className="col-12">
                                    <label className="form-label fw-semibold">Mô tả ngắn</label>
                                    <textarea
                                        className="form-control"
                                        rows={3}
                                        value={form.description}
                                        onChange={(event) =>
                                            setForm((current) => ({
                                                ...current,
                                                description: event.target.value,
                                            }))
                                        }
                                        placeholder="Ví dụ: Giảm 10% cho đơn hàng cuối tuần."
                                    />
                                </div>
                            </div>

                            <div className="ttdn-admin-note">
                                <div className="d-flex align-items-start gap-2">
                                    <Truck size={18} className="mt-1 text-success flex-shrink-0" />
                                    <div>
                                        <strong className="d-block mb-1">Voucher freeship luôn được giữ cố định</strong>
                                        <span className="text-muted">
                                            Mã <strong>FREESHIP</strong> được hệ thống tự tạo và không cho sửa hoặc xóa trong trang này.
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="ttdn-admin-form-actions">
                                <button
                                    type="button"
                                    className="btn btn-light rounded-pill px-4"
                                    onClick={resetForm}
                                    disabled={submitting}
                                >
                                    Làm mới
                                </button>
                                <button
                                    type="submit"
                                    className="btn theme-bg-color text-white rounded-pill px-4"
                                    disabled={submitting}
                                >
                                    {submitting ? 'Đang lưu...' : editingVoucherId ? 'Cập nhật voucher' : 'Thêm voucher'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                <div className="col-xl-7">
                    <div className="row g-3">
                        <div className="col-md-4">
                            <div className="ttdn-admin-subcard h-100">
                                <p className="text-muted text-uppercase small fw-bold mb-2">Voucher giảm giá</p>
                                <h3 className="display-6 fw-bold mb-1">{summary.percentageCount}</h3>
                                <p className="text-muted mb-0">Đang quản lý trong dashboard</p>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="ttdn-admin-subcard h-100">
                                <p className="text-muted text-uppercase small fw-bold mb-2">Đang hoạt động</p>
                                <h3 className="display-6 fw-bold mb-1">{summary.activeCount}</h3>
                                <p className="text-muted mb-0">Bao gồm cả mã freeship cố định</p>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="ttdn-admin-subcard h-100">
                                <p className="text-muted text-uppercase small fw-bold mb-2">Lượt còn lại</p>
                                <h3 className="display-6 fw-bold mb-1">{summary.totalRemaining}</h3>
                                <p className="text-muted mb-0">Tổng số voucher chưa sử dụng</p>
                            </div>
                        </div>
                        <div className="col-12">
                            <div className="ttdn-admin-card">
                                <div className="d-flex align-items-start gap-3">
                                    <div className="ttdn-admin-stat-icon">
                                        <Truck size={22} />
                                    </div>
                                    <div>
                                        <h3 className="h5 fw-bold mb-1">Voucher freeship mặc định</h3>
                                        <p className="text-muted mb-2">
                                            Hệ thống luôn duy trì một mã freeship sẵn sàng cho các chiến dịch giao hàng miễn phí.
                                        </p>
                                        <div className="d-flex flex-wrap gap-2 align-items-center">
                                            <span className="ttdn-admin-code-pill">
                                                {summary.fixedVoucher?.code || 'FREESHIP'}
                                            </span>
                                            <span className="badge rounded-pill bg-success-subtle text-success-emphasis px-3 py-2">
                                                Miễn phí vận chuyển
                                            </span>
                                            <span className="badge rounded-pill bg-light text-dark px-3 py-2">
                                                Số lượng {summary.fixedVoucher?.quantity || 999999}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
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

            {notice ? (
                <div className="ttdn-admin-card">
                    <div className="d-flex align-items-center gap-2 text-success">
                        <RefreshCw size={18} />
                        <strong>{notice}</strong>
                    </div>
                </div>
            ) : null}

            <section className="ttdn-admin-table-shell">
                <div className="table-responsive">
                    <table>
                        <thead>
                            <tr>
                                <th>Mã voucher</th>
                                <th>Ưu đãi</th>
                                <th>Số lượng</th>
                                <th>Trạng thái</th>
                                <th>Cập nhật</th>
                                <th className="text-end">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array.from({ length: 4 }).map((_, index) => (
                                    <tr key={index}>
                                        <td colSpan={6}>
                                            <div className="placeholder-glow">
                                                <span className="placeholder col-12" style={{ height: 28 }} />
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : vouchers.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center text-muted py-5">
                                        Chưa có voucher nào.
                                    </td>
                                </tr>
                            ) : (
                                vouchers.map((voucher) => {
                                    const remainingQuantity = getRemainingQuantity(voucher);

                                    return (
                                        <tr key={voucher._id}>
                                            <td>
                                                <div className="d-grid gap-2">
                                                    <div className="d-flex align-items-center gap-2 flex-wrap">
                                                        <span className="ttdn-admin-code-pill">{voucher.code}</span>
                                                        {voucher.isFixed ? (
                                                            <span className="badge rounded-pill bg-info-subtle text-info-emphasis px-3 py-2">
                                                                Cố định
                                                            </span>
                                                        ) : null}
                                                    </div>
                                                    <span className="text-muted small">
                                                        {voucher.description || 'Không có mô tả'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="d-flex align-items-center gap-2">
                                                    {voucher.type === 'freeship' ? (
                                                        <Truck size={16} className="text-success" />
                                                    ) : (
                                                        <BadgePercent size={16} className="text-success" />
                                                    )}
                                                    <span className="fw-bold text-dark">
                                                        {getVoucherValueLabel(voucher)}
                                                    </span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="d-grid gap-1">
                                                    <span className="fw-bold text-dark">
                                                        Còn {remainingQuantity} / {voucher.quantity}
                                                    </span>
                                                    <small className="text-muted">
                                                        Đã dùng {voucher.usedCount || 0}
                                                    </small>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="d-grid gap-2 justify-items-start">
                                                    <span
                                                        className={`badge rounded-pill px-3 py-2 ${
                                                            voucher.isActive
                                                                ? 'bg-success-subtle text-success-emphasis'
                                                                : 'bg-secondary-subtle text-secondary-emphasis'
                                                        }`}
                                                    >
                                                        {voucher.isActive ? 'Đang áp dụng' : 'Tạm tắt'}
                                                    </span>
                                                    <span className="badge rounded-pill bg-light text-dark px-3 py-2">
                                                        {voucher.type === 'freeship' ? 'Freeship' : 'Giảm giá %'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="text-muted small">
                                                    {formatAdminDateTime(voucher.updatedAt)}
                                                </span>
                                            </td>
                                            <td className="text-end">
                                                <div className="d-inline-flex gap-2 flex-wrap justify-content-end">
                                                    {!voucher.isFixed ? (
                                                        <>
                                                            <button
                                                                type="button"
                                                                className="btn btn-light rounded-pill"
                                                                title="Chỉnh sửa voucher"
                                                                onClick={() => handleEdit(voucher)}
                                                            >
                                                                <Pencil size={16} />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="btn btn-outline-danger rounded-pill"
                                                                title="Xóa voucher"
                                                                onClick={() => handleDelete(voucher)}
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <span className="badge rounded-pill bg-light text-muted px-3 py-2">
                                                            Hệ thống giữ cố định
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}
