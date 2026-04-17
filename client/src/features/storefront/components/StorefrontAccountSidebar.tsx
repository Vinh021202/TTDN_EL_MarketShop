import { NavLink } from 'react-router-dom';
import { ClipboardList, Heart, Receipt, UserCircle } from 'lucide-react';
import { translate } from '@/features/shared/utils/displayPreferences';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';

interface SidebarStat {
    label: string;
    value: string;
}

interface StorefrontAccountSidebarProps {
    description: string;
    stats: SidebarStat[];
    title: string;
}

export function StorefrontAccountSidebar({
    description,
    stats,
    title,
}: StorefrontAccountSidebarProps) {
    const user = useAuthStore((state) => state.user);
    const language = useThemeStore((state) => state.language);

    const navItems = [
        {
            to: '/profile',
            label: translate({ vi: 'Thông tin tài khoản', en: 'Account details' }, language),
            icon: UserCircle,
        },
        {
            to: '/orders',
            label: translate({ vi: 'Đơn hàng của tôi', en: 'My orders' }, language),
            icon: Receipt,
        },
        {
            to: '/recipes',
            label: translate({ vi: 'Kho công thức', en: 'Recipe library' }, language),
            icon: ClipboardList,
        },
    ];

    return (
        <aside className="ttdn-account-sidebar">
            <div className="ttdn-panel mb-4">
                <div className="d-flex align-items-center gap-3 mb-3">
                    <div
                        className="d-inline-flex align-items-center justify-content-center rounded-circle theme-bg-color text-white fw-bold fs-4 flex-shrink-0"
                        style={{ width: 62, height: 62 }}
                    >
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="min-w-0">
                        <p className="text-uppercase small fw-bold theme-color mb-1">{title}</p>
                        <h3 className="h5 fw-bold text-dark mb-1 text-truncate">{user?.name}</h3>
                        <p className="text-muted small mb-0 text-truncate">{user?.email}</p>
                    </div>
                </div>

                <p className="text-muted mb-3">{description}</p>

                <div className="row g-3">
                    {stats.map((stat) => (
                        <div key={stat.label} className="col-6">
                            <div className="ttdn-account-stat">
                                <p className="text-muted small mb-1">{stat.label}</p>
                                <h4 className="mb-0 text-dark fw-bold">{stat.value}</h4>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="ttdn-panel">
                <p className="text-uppercase small fw-bold text-muted mb-3">
                    {translate({ vi: 'Điều hướng', en: 'Navigation' }, language)}
                </p>
                <div className="d-grid gap-2 ttdn-account-nav">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) =>
                                `ttdn-account-nav-link text-decoration-none${isActive ? ' active' : ''}`
                            }
                        >
                            <item.icon size={18} />
                            <span>{item.label}</span>
                        </NavLink>
                    ))}

                    <NavLink to="/cart" className="ttdn-account-nav-link text-decoration-none">
                        <Heart size={18} />
                        <span>{translate({ vi: 'Giỏ hàng hiện tại', en: 'Current cart' }, language)}</span>
                    </NavLink>
                </div>
            </div>
        </aside>
    );
}
