import { useEffect, useState } from 'react';
import { AlertCircle, RefreshCw, Search, ShieldCheck, ShieldOff } from 'lucide-react';
import { formatAdminDate, getAdminRoleClassName, getAdminRoleLabel } from './adminPresentation';
import { adminGetAllUsers, adminToggleUserActive } from './services/adminApi';

export function AdminUsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [togglingId, setTogglingId] = useState<string | null>(null);

    const fetchUsers = async (nextPage = page, nextSearch = search) => {
        setLoading(true);
        setError('');

        try {
            const data = await adminGetAllUsers({
                page: nextPage,
                limit: 20,
                search: nextSearch || undefined,
            });

            setUsers(data.users || []);
            setTotal(data.pagination?.total || 0);
            setTotalPages(data.pagination?.totalPages || 1);
        } catch {
            setError('Không thể tải danh sách người dùng.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleSearch = (event: React.FormEvent) => {
        event.preventDefault();
        setPage(1);
        fetchUsers(1, search);
    };

    const handleToggle = async (user: any) => {
        const action = user.isActive ? 'vô hiệu hóa' : 'kích hoạt';

        if (!window.confirm(`Bạn có chắc muốn ${action} tài khoản "${user.name}"?`)) {
            return;
        }

        setTogglingId(user._id);

        try {
            await adminToggleUserActive(user._id);
            setUsers((previous) =>
                previous.map((currentUser) =>
                    currentUser._id === user._id
                        ? { ...currentUser, isActive: !currentUser.isActive }
                        : currentUser
                )
            );
        } catch (toggleError: any) {
            setError(toggleError.response?.data?.error || 'Không thể cập nhật tài khoản.');
        } finally {
            setTogglingId(null);
        }
    };

    return (
        <div className="d-grid gap-4">
            <section className="ttdn-admin-page-intro">
                <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3">
                    <div>
                        <p className="text-uppercase small fw-bold text-white-50 mb-2">Người dùng</p>
                        <h2 className="display-6 fw-bold text-white mb-2">Quản lý người dùng</h2>
                        <p className="text-white-50 mb-0">
                            Tìm tài khoản, xem vai trò và bật tắt trạng thái truy cập ngay trong khu quản trị.
                        </p>
                    </div>
                    <div className="ttdn-admin-card bg-transparent border border-white border-opacity-25 shadow-none text-white">
                        <p className="text-white-50 mb-1">Tổng tài khoản</p>
                        <h3 className="h2 fw-bold text-white mb-0">{total}</h3>
                    </div>
                </div>
            </section>

            <section className="ttdn-admin-toolbar">
                <form className="row g-3 flex-grow-1" onSubmit={handleSearch}>
                    <div className="col-lg-8">
                        <label className="form-label text-muted small text-uppercase fw-bold mb-2">
                            Tìm kiếm
                        </label>
                        <div className="storefront-search-shell">
                            <Search size={18} className="text-success flex-shrink-0" />
                            <input
                                type="search"
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                className="storefront-search-input"
                                placeholder="Tìm theo tên hoặc email..."
                            />
                        </div>
                    </div>
                    <div className="col-lg-4 d-flex align-items-end gap-2">
                        <button type="submit" className="btn theme-bg-color text-white rounded-pill px-4">
                            Tìm
                        </button>
                        <button
                            type="button"
                            className="btn btn-light rounded-pill px-4"
                            onClick={() => {
                                setSearch('');
                                setPage(1);
                                fetchUsers(1, '');
                            }}
                        >
                            <RefreshCw size={16} className="me-2" />
                            Làm mới
                        </button>
                    </div>
                </form>
            </section>

            {error ? (
                <div className="ttdn-admin-card">
                    <div className="d-flex align-items-center gap-2 text-danger">
                        <AlertCircle size={18} />
                        <strong>{error}</strong>
                    </div>
                </div>
            ) : null}

            <section className="ttdn-admin-table-shell">
                <div className="table-responsive">
                    <table>
                        <thead>
                            <tr>
                                <th>Người dùng</th>
                                <th>Vai trò</th>
                                <th>Ngày tạo</th>
                                <th>Trạng thái</th>
                                <th className="text-end">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array.from({ length: 5 }).map((_, index) => (
                                    <tr key={index}>
                                        <td colSpan={5}>
                                            <div className="placeholder-glow">
                                                <span className="placeholder col-12" style={{ height: 28 }} />
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center text-muted py-5">
                                        Chưa có người dùng nào phù hợp.
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user._id}>
                                        <td>
                                            <div className="ttdn-admin-table-media">
                                                <span className="ttdn-admin-avatar">
                                                    {user.name?.charAt(0)?.toUpperCase() || '?'}
                                                </span>
                                                <div className="min-w-0">
                                                    <p className="fw-bold text-dark mb-1 text-truncate">{user.name}</p>
                                                    <p className="text-muted mb-0 small text-truncate">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span
                                                className={`badge rounded-pill px-3 py-2 ${getAdminRoleClassName(
                                                    user.role
                                                )}`}
                                            >
                                                {getAdminRoleLabel(user.role)}
                                            </span>
                                        </td>
                                        <td>{formatAdminDate(user.createdAt)}</td>
                                        <td>
                                            <span
                                                className={`badge rounded-pill px-3 py-2 ${
                                                    user.isActive
                                                        ? 'bg-success-subtle text-success-emphasis'
                                                        : 'bg-danger-subtle text-danger-emphasis'
                                                }`}
                                            >
                                                {user.isActive ? 'Hoạt động' : 'Bị khóa'}
                                            </span>
                                        </td>
                                        <td className="text-end">
                                            <button
                                                type="button"
                                                className={`btn rounded-pill ${
                                                    user.isActive ? 'btn-outline-danger' : 'btn-outline-success'
                                                }`}
                                                onClick={() => handleToggle(user)}
                                                disabled={togglingId === user._id}
                                            >
                                                {user.isActive ? (
                                                    <>
                                                        <ShieldOff size={16} className="me-2" />
                                                        Khóa
                                                    </>
                                                ) : (
                                                    <>
                                                        <ShieldCheck size={16} className="me-2" />
                                                        Mở khóa
                                                    </>
                                                )}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 ? (
                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 px-4 py-4 border-top">
                        <p className="text-muted mb-0">
                            Trang {page} / {totalPages}
                        </p>
                        <div className="d-flex gap-2">
                            <button
                                type="button"
                                className="btn btn-light rounded-pill px-4"
                                disabled={page === 1}
                                onClick={() => {
                                    const nextPage = Math.max(1, page - 1);
                                    setPage(nextPage);
                                    fetchUsers(nextPage, search);
                                }}
                            >
                                Trước
                            </button>
                            <button
                                type="button"
                                className="btn btn-light rounded-pill px-4"
                                disabled={page === totalPages}
                                onClick={() => {
                                    const nextPage = Math.min(totalPages, page + 1);
                                    setPage(nextPage);
                                    fetchUsers(nextPage, search);
                                }}
                            >
                                Sau
                            </button>
                        </div>
                    </div>
                ) : null}
            </section>
        </div>
    );
}
