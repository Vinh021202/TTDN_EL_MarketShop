import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
    ChevronDown,
    Flame,
    LayoutGrid,
    LogOut,
    MapPin,
    Menu,
    Moon,
    Search,
    ShieldCheck,
    ShoppingBag,
    Sun,
    User,
    X,
} from 'lucide-react';
import { getCategories } from '@/features/shared/api/categoriesApi';
import { translate } from '@/features/shared/utils/displayPreferences';
import { logoutUser } from '@/features/auth/services/authApi';
import { toast } from '@/components/ui';
import { useAuthStore } from '@/store/authStore';
import { DisplayCurrency, DisplayLanguage, useThemeStore } from '@/store/themeStore';
import { useCartStore } from '@/store/cartStore';

export function StorefrontHeader() {
    const navigate = useNavigate();
    const location = useLocation();
    const accountMenuRef = useRef<HTMLDivElement>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
    const { user, isAuthenticated, logout } = useAuthStore();
    const cartItems = useCartStore((state) => state.items);
    const { isDark, language, currency, setLanguage, setCurrency, toggleTheme } = useThemeStore();

    const { data } = useQuery({
        queryKey: ['categories', 'storefront-header'],
        queryFn: getCategories,
        staleTime: 5 * 60 * 1000,
    });

    const copy = useMemo(
        () => ({
            nav: [
                { to: '/', label: translate({ vi: 'Trang chủ', en: 'Home' }, language) },
                { to: '/products', label: translate({ vi: 'Mua sắm', en: 'Shop' }, language) },
                { to: '/recipes', label: translate({ vi: 'Công thức', en: 'Recipes' }, language) },
            ],
            searchPlaceholder: translate(
                {
                    vi: 'Tìm nông sản, thực phẩm tươi, nguyên liệu nấu ăn...',
                    en: 'search for product, delivered to your door...',
                },
                language
            ),
            searchButton: translate({ vi: 'Tìm kiếm', en: 'Search' }, language),
            allCategories: translate({ vi: 'Tất cả danh mục', en: 'All Categories' }, language),
            popularCategories: translate({ vi: 'Danh mục phổ biến', en: 'Popular categories' }, language),
            account: translate({ vi: 'Tài khoản', en: 'Account' }, language),
            profile: translate({ vi: 'Hồ sơ', en: 'Profile' }, language),
            orders: translate({ vi: 'Đơn hàng', en: 'Orders' }, language),
            admin: translate({ vi: 'Quản trị', en: 'Admin' }, language),
            login: translate({ vi: 'Đăng nhập', en: 'Sign in' }, language),
            register: translate({ vi: 'Tạo tài khoản', en: 'Create account' }, language),
            logout: translate({ vi: 'Đăng xuất', en: 'Log out' }, language),
            hotOffer: translate({ vi: 'Ưu đãi hot', en: 'Hot Offers' }, language),
            languageLabel: translate({ vi: 'Ngôn ngữ', en: 'Language' }, language),
            currencyLabel: translate({ vi: 'Tiền tệ', en: 'Currency' }, language),
            themeLabel: translate({ vi: 'Giao diện', en: 'Theme' }, language),
            cart: translate({ vi: 'Giỏ hàng', en: 'Cart' }, language),
        }),
        [language]
    );

    const languageOptions = useMemo(
        () => [
            {
                value: 'vi',
                label: translate({ vi: 'Tiếng Việt', en: 'Vietnamese' }, language),
            },
            { value: 'en', label: 'English' },
        ],
        [language]
    );

    const currencyOptions = useMemo(
        () => [
            { value: 'VND', label: 'VND' },
            { value: 'USD', label: 'USD' },
        ],
        []
    );

    const categories = useMemo(() => data?.categories?.slice(0, 8) ?? [], [data?.categories]);
    const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    useEffect(() => {
        setIsCategoryMenuOpen(false);
        setIsMobileMenuOpen(false);
        setIsAccountMenuOpen(false);
    }, [location.pathname, location.search]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (accountMenuRef.current && !accountMenuRef.current.contains(event.target as Node)) {
                setIsAccountMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const params = new URLSearchParams();
        if (searchTerm.trim()) {
            params.set('search', searchTerm.trim());
        }
        navigate(`/products${params.toString() ? `?${params.toString()}` : ''}`);
    };

    const handleCategoryClick = (categoryId: string) => {
        navigate(`/products?category=${categoryId}`);
    };

    const handleLogout = async () => {
        try {
            await logoutUser();
        } catch (error) {
            console.error('Logout request failed:', error);
        } finally {
            logout();
            toast.success(
                translate({ vi: 'Đã đăng xuất thành công', en: 'Signed out successfully' }, language)
            );
            navigate('/');
        }
    };

    return (
        <header className="storefront-header">
            <div className="container-fluid-lg py-2 py-xl-3">
                <div className="storefront-header-top">
                    <div className="d-flex align-items-center gap-3 flex-shrink-0">
                        <button
                            type="button"
                            className="storefront-action-btn d-xl-none"
                            onClick={() => setIsMobileMenuOpen((value) => !value)}
                            aria-label="Toggle menu"
                        >
                            {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
                        </button>

                        <Link to="/" className="d-flex align-items-center text-decoration-none flex-shrink-0">
                            <img src="/fastkart/assets/images/logo/1.png" alt="Fastkart" style={{ height: 38 }} />
                        </Link>

                        <div className="storefront-header-pin d-none d-md-inline-flex">
                            <MapPin size={18} />
                        </div>
                    </div>

                    <form className="storefront-header-search-form d-none d-lg-block" onSubmit={handleSearchSubmit}>
                        <div className="storefront-search-shell storefront-header-search-shell">
                            <Search size={18} className="text-success flex-shrink-0" />
                            <input
                                type="search"
                                value={searchTerm}
                                onChange={(event) => setSearchTerm(event.target.value)}
                                placeholder={copy.searchPlaceholder}
                                className="storefront-search-input"
                            />
                            <button
                                type="submit"
                                className="btn theme-bg-color text-white rounded-pill px-4 storefront-header-search-button"
                            >
                                {copy.searchButton}
                            </button>
                        </div>
                    </form>

                    <div className="storefront-header-tools ms-auto">
                        <InlineSelect
                            label={copy.languageLabel}
                            value={language}
                            options={languageOptions}
                            onChange={(value) => setLanguage(value as DisplayLanguage)}
                        />
                        <InlineSelect
                            label={copy.currencyLabel}
                            value={currency}
                            options={currencyOptions}
                            onChange={(value) => setCurrency(value as DisplayCurrency)}
                        />

                        <button
                            type="button"
                            className={`storefront-theme-toggle ${isDark ? 'is-dark' : ''}`}
                            onClick={toggleTheme}
                            aria-label={copy.themeLabel}
                            title={copy.themeLabel}
                        >
                            <Sun size={14} className="storefront-theme-icon storefront-theme-icon--sun" />
                            <Moon size={14} className="storefront-theme-icon storefront-theme-icon--moon" />
                            <motion.span
                                className="storefront-theme-toggle-thumb"
                                animate={{ x: isDark ? 18 : 0 }}
                                transition={{ type: 'spring', stiffness: 420, damping: 28 }}
                            />
                        </button>

                        <div className="position-relative" ref={accountMenuRef}>
                            <button
                                type="button"
                                className="storefront-action-btn position-relative"
                                onClick={() => setIsAccountMenuOpen((value) => !value)}
                                aria-label={copy.account}
                            >
                                <User size={18} />
                            </button>

                            {isAccountMenuOpen && (
                                <div className="ttdn-account-menu">
                                    {isAuthenticated ? (
                                        <>
                                            <div className="pb-3 mb-3 border-bottom border-light-subtle">
                                                <p className="mb-1 fw-bold text-dark">{user?.name}</p>
                                                <p className="mb-0 text-muted small">{user?.email}</p>
                                            </div>
                                            <div className="d-grid gap-2">
                                                <Link to="/profile" className="btn btn-light text-start rounded-pill">
                                                    {copy.profile}
                                                </Link>
                                                <Link to="/orders" className="btn btn-light text-start rounded-pill">
                                                    {copy.orders}
                                                </Link>
                                                {(user?.role === 'admin' || user?.role === 'superadmin') && (
                                                    <Link to="/admin" className="btn btn-light text-start rounded-pill">
                                                        <ShieldCheck size={16} className="me-2" />
                                                        {copy.admin}
                                                    </Link>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={handleLogout}
                                                    className="btn btn-outline-danger rounded-pill text-start"
                                                >
                                                    <LogOut size={16} className="me-2" />
                                                    {copy.logout}
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="d-grid gap-2">
                                            <Link to="/login" className="btn btn-light text-start rounded-pill">
                                                {copy.login}
                                            </Link>
                                            <Link
                                                to="/register"
                                                className="btn theme-bg-color text-white text-start rounded-pill"
                                            >
                                                {copy.register}
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <Link
                            to="/cart"
                            className="storefront-action-btn text-decoration-none position-relative"
                            aria-label={copy.cart}
                        >
                            <ShoppingBag size={18} />
                            {cartCount > 0 && (
                                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill theme-bg-color">
                                    {cartCount > 99 ? '99+' : cartCount}
                                </span>
                            )}
                        </Link>
                    </div>
                </div>

                <form className="d-lg-none mt-2" onSubmit={handleSearchSubmit}>
                    <div className="storefront-search-shell">
                        <Search size={18} className="text-success flex-shrink-0" />
                        <input
                            type="search"
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                            placeholder={copy.searchPlaceholder}
                            className="storefront-search-input"
                        />
                    </div>
                </form>

                <div className="storefront-header-bottom d-none d-xl-flex align-items-center justify-content-between gap-3 mt-2">
                    <div className="position-relative">
                        <button
                            type="button"
                            className="btn storefront-category-trigger"
                            onClick={() => setIsCategoryMenuOpen((value) => !value)}
                        >
                            <LayoutGrid size={18} />
                            <span>{copy.allCategories}</span>
                            <ChevronDown size={16} />
                        </button>

                        {isCategoryMenuOpen && (
                            <div className="ttdn-flyout-menu">
                                <p className="text-uppercase text-muted small fw-bold mb-3">{copy.popularCategories}</p>
                                <div className="d-grid gap-2">
                                    {categories.map((category) => (
                                        <button
                                            key={category._id}
                                            type="button"
                                            className="ttdn-filter-button"
                                            onClick={() => handleCategoryClick(category._id)}
                                        >
                                            <span>{category.name}</span>
                                            <ChevronDown size={14} style={{ transform: 'rotate(-90deg)' }} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <nav className="d-flex align-items-center gap-1 flex-wrap">
                        {copy.nav.map((link) => (
                            <NavLink
                                key={link.to}
                                to={link.to}
                                className={({ isActive }) => `storefront-nav-pill ${isActive ? 'is-active' : ''}`}
                            >
                                {link.label}
                            </NavLink>
                        ))}
                    </nav>

                    <Link to="/products" className="storefront-hot-offer text-decoration-none">
                        <Flame size={18} />
                        <span>{copy.hotOffer}</span>
                    </Link>
                </div>

                {isMobileMenuOpen && (
                    <div className="ttdn-mobile-panel d-xl-none mt-3">
                        <div className="d-grid gap-3">
                            <div className="row g-3">
                                <div className="col-6">
                                    <InlineSelect
                                        label={copy.languageLabel}
                                        value={language}
                                        options={languageOptions}
                                        onChange={(value) => setLanguage(value as DisplayLanguage)}
                                        compact
                                    />
                                </div>
                                <div className="col-6">
                                    <InlineSelect
                                        label={copy.currencyLabel}
                                        value={currency}
                                        options={currencyOptions}
                                        onChange={(value) => setCurrency(value as DisplayCurrency)}
                                        compact
                                    />
                                </div>
                            </div>

                            <div className="d-flex align-items-center justify-content-between rounded-pill border px-3 py-2">
                                <span className="fw-semibold text-dark">{copy.themeLabel}</span>
                                <button
                                    type="button"
                                    className={`storefront-theme-toggle ${isDark ? 'is-dark' : ''}`}
                                    onClick={toggleTheme}
                                    aria-label={copy.themeLabel}
                                >
                                    <Sun size={14} className="storefront-theme-icon storefront-theme-icon--sun" />
                                    <Moon size={14} className="storefront-theme-icon storefront-theme-icon--moon" />
                                    <motion.span
                                        className="storefront-theme-toggle-thumb"
                                        animate={{ x: isDark ? 18 : 0 }}
                                        transition={{ type: 'spring', stiffness: 420, damping: 28 }}
                                    />
                                </button>
                            </div>

                            {copy.nav.map((link) => (
                                <NavLink
                                    key={link.to}
                                    to={link.to}
                                    className={({ isActive }) => `ttdn-filter-button text-decoration-none ${isActive ? 'active' : ''}`}
                                >
                                    <span>{link.label}</span>
                                    <ChevronDown size={14} style={{ transform: 'rotate(-90deg)' }} />
                                </NavLink>
                            ))}

                            <div className="pt-2 mt-2 border-top border-light-subtle">
                                <p className="text-uppercase text-muted small fw-bold mb-3">{copy.popularCategories}</p>
                                <div className="d-grid gap-2">
                                    {categories.map((category) => (
                                        <button
                                            key={category._id}
                                            type="button"
                                            className="ttdn-filter-button"
                                            onClick={() => handleCategoryClick(category._id)}
                                        >
                                            <span>{category.name}</span>
                                            <ChevronDown size={14} style={{ transform: 'rotate(-90deg)' }} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}

function InlineSelect({
    label,
    value,
    options,
    onChange,
    compact = false,
}: {
    label: string;
    value: string;
    options: Array<{ value: string; label: string }>;
    onChange: (value: string) => void;
    compact?: boolean;
}) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isOpen, setIsOpen] = useState(false);
    const activeOption = options.find((option) => option.value === value) || options[0];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div
            ref={containerRef}
            className={`storefront-inline-select ${compact ? 'is-compact' : ''} ${isOpen ? 'is-open' : ''}`}
        >
            <span className="storefront-inline-select__label">{label}</span>
            <button
                type="button"
                className="storefront-inline-select__trigger"
                onClick={() => setIsOpen((current) => !current)}
                aria-expanded={isOpen}
                aria-label={label}
            >
                <span className="storefront-inline-select__value">{activeOption?.label || value}</span>
                <ChevronDown size={14} />
            </button>

            {isOpen && (
                <div className="storefront-inline-select__menu">
                    {options.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            className={`storefront-inline-select__option ${option.value === value ? 'is-active' : ''}`}
                            onClick={() => {
                                onChange(option.value);
                                setIsOpen(false);
                            }}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
