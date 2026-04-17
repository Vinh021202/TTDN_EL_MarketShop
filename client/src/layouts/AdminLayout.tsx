import { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
    BookOpen,
    ChevronRight,
    LayoutDashboard,
    LogOut,
    Menu,
    Package,
    ShoppingCart,
    Store,
    TicketPercent,
    UserCircle2,
    Users,
    X,
} from 'lucide-react';
import { getAdminRoleLabel } from '@/features/admin/adminPresentation';
import { useAuthStore } from '@/store/authStore';

const navItems = [
    { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { to: '/admin/products', icon: Package, label: 'Sản phẩm' },
    { to: '/admin/recipes', icon: BookOpen, label: 'Công thức' },
    { to: '/admin/vouchers', icon: TicketPercent, label: 'Voucher' },
    { to: '/admin/orders', icon: ShoppingCart, label: 'Đơn hàng' },
    { to: '/admin/users', icon: Users, label: 'Người dùng' },
];

interface AdminLayoutProps {
    children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        setSidebarOpen(false);
    }, [location.pathname]);

    const currentDateLabel = useMemo(
        () =>
            new Intl.DateTimeFormat('vi-VN', {
                weekday: 'long',
                day: '2-digit',
                month: 'long',
                year: 'numeric',
            }).format(new Date()),
        []
    );

    const pageTitle = useMemo(() => {
        const pathname = location.pathname;

        if (pathname === '/admin') return 'Dashboard';
        if (pathname === '/admin/products/new') return 'Thêm sản phẩm';
        if (pathname.startsWith('/admin/products/') && pathname.endsWith('/edit')) {
            return 'Chỉnh sửa sản phẩm';
        }
        if (pathname.startsWith('/admin/products')) return 'Sản phẩm';
        if (pathname === '/admin/recipes/new') return 'Thêm công thức';
        if (pathname.startsWith('/admin/recipes/') && pathname.endsWith('/edit')) {
            return 'Chỉnh sửa công thức';
        }
        if (pathname.startsWith('/admin/recipes')) return 'Công thức';
        if (pathname.startsWith('/admin/vouchers')) return 'Voucher';
        if (pathname.startsWith('/admin/orders/')) return 'Chi tiết đơn hàng';
        if (pathname.startsWith('/admin/orders')) return 'Đơn hàng';
        if (pathname.startsWith('/admin/users')) return 'Người dùng';

        return 'Dashboard';
    }, [location.pathname]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="ttdn-admin-app">
            <div
                className={`ttdn-admin-sidebar-backdrop ${sidebarOpen ? 'is-visible' : ''}`}
                onClick={() => setSidebarOpen(false)}
            />

            <div className="ttdn-admin-shell">
                <aside className={`ttdn-admin-sidebar ${sidebarOpen ? 'is-open' : ''}`}>
                    <Link to="/admin" className="ttdn-admin-brand">
                        <span className="ttdn-admin-brand-mark">
                            <Store size={22} />
                        </span>
                        <span>
                            <strong className="d-block">TTDN Market</strong>
                            <small className="text-white-50">Bảng quản trị</small>
                        </span>
                    </Link>

                    <div className="ttdn-admin-profile">
                        <div className="d-flex align-items-center gap-3 mb-3">
                            <span className="ttdn-admin-avatar">
                                {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                            </span>
                            <div className="min-w-0">
                                <p className="mb-1 fw-bold text-white text-truncate">{user?.name}</p>
                                <p className="mb-0 text-white-50 small">{getAdminRoleLabel(user?.role || '')}</p>
                            </div>
                        </div>

                        <div className="d-grid gap-2">
                            <Link to="/" className="btn rounded-pill ttdn-admin-profile-link">
                                Xem cửa hàng
                            </Link>
                            <Link to="/profile" className="btn rounded-pill ttdn-admin-profile-link">
                                Tài khoản của tôi
                            </Link>
                        </div>
                    </div>

                    <nav className="ttdn-admin-nav">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                end={item.end}
                                className={({ isActive }) =>
                                    `ttdn-admin-nav-link${isActive ? ' active' : ''}`
                                }
                            >
                                <item.icon size={18} />
                                <span className="flex-grow-1">{item.label}</span>
                                <ChevronRight size={16} />
                            </NavLink>
                        ))}
                    </nav>

                    <div className="ttdn-admin-sidebar-footer">
                        <button
                            type="button"
                            className="btn btn-outline-light rounded-pill w-100 d-inline-flex align-items-center justify-content-center gap-2"
                            onClick={handleLogout}
                        >
                            <LogOut size={16} />
                            Đăng xuất
                        </button>
                    </div>
                </aside>

                <div className="ttdn-admin-main">
                    <header className="ttdn-admin-header">
                        <div className="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-3">
                            <div>
                                <p className="text-uppercase small fw-bold theme-color mb-1">Quản trị</p>
                                <h1 className="h4 fw-bold text-dark mb-1">{pageTitle}</h1>
                                <p className="text-muted mb-0">{currentDateLabel}</p>
                            </div>

                            <div className="d-flex flex-wrap align-items-center gap-2">
                                <button
                                    type="button"
                                    className="btn btn-light rounded-pill d-xl-none"
                                    onClick={() => setSidebarOpen((value) => !value)}
                                >
                                    {sidebarOpen ? <X size={16} /> : <Menu size={16} />}
                                </button>
                                <Link to="/" className="btn btn-light rounded-pill">
                                    <Store size={16} className="me-2" />
                                    Cửa hàng
                                </Link>
                                <Link to="/profile" className="btn btn-light rounded-pill">
                                    <UserCircle2 size={16} className="me-2" />
                                    Hồ sơ
                                </Link>
                                <button
                                    type="button"
                                    className="btn theme-bg-color text-white rounded-pill"
                                    onClick={handleLogout}
                                >
                                    Đăng xuất
                                </button>
                            </div>
                        </div>
                    </header>

                    <main className="ttdn-admin-content">{children}</main>
                </div>
            </div>
        </div>
    );
}
