import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, User, LogOut, Sun, Moon, Menu, Package, Heart, X } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { useCartStore } from '@/store/cartStore';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { logoutUser } from '@/features/auth/services/authApi';
import { toast } from '@/components/ui';

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// HEADER COMPONENT
// Enhanced with dropdown, cart badge, and animations
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

export const Header = () => {
    const { user, isAuthenticated, logout } = useAuthStore();
    const { isDark, toggleTheme } = useThemeStore();
    const cartItems = useCartStore((state) => state.items);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const location = useLocation();

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setShowUserMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Close menu on route change
    useEffect(() => {
        setShowUserMenu(false);
        setShowMobileMenu(false);
    }, [location.pathname]);

    const handleLogout = async () => {
        try {
            await logoutUser();
            logout();
            toast.success('Đã đăng xuất thành công');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    const navLinks = [
        { to: '/', label: 'Trang chủ' },
        { to: '/products', label: 'Sản phẩm' },
        { to: '/recipes', label: 'Công thức' },
    ];

    const isActive = (path: string) => location.pathname === path;

    return (
        <header className="sticky top-0 z-40 backdrop-blur-md bg-gray-900/80 border-b border-white/10">
            <div className="container mx-auto px-4 py-3">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2.5 group">
                        <span className="text-3xl group-hover:scale-110 transition-transform duration-300">ðŸ›’</span>
                        <span className="text-xl font-bold font-display bg-gradient-to-r from-primary-400 to-accent-orange bg-clip-text text-transparent">
                            Food Market
                        </span>
                    </Link>

                    {/* Navigation (Desktop) */}
                    <nav className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.to}
                                to={link.to}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive(link.to)
                                    ? 'text-white bg-white/10'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>

                    {/* Right Side Actions */}
                    <div className="flex items-center gap-2">
                        {/* Dark Mode Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
                            aria-label="Toggle theme"
                        >
                            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </button>

                        {isAuthenticated ? (
                            <>
                                {/* Cart */}
                                <Link
                                    to="/cart"
                                    className="p-2 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white relative"
                                >
                                    <ShoppingCart className="w-5 h-5" />
                                    {cartItemCount > 0 && (
                                        <motion.span
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-primary-500 rounded-full text-2xs font-bold flex items-center justify-center px-1"
                                        >
                                            {cartItemCount > 99 ? '99+' : cartItemCount}
                                        </motion.span>
                                    )}
                                </Link>

                                {/* User Menu */}
                                <div className="relative" ref={menuRef}>
                                    <button
                                        onClick={() => setShowUserMenu(!showUserMenu)}
                                        className={`flex items-center gap-2 p-1.5 rounded-lg transition-all duration-200 ${showUserMenu ? 'bg-white/10' : 'hover:bg-white/10'
                                            }`}
                                    >
                                        {user?.avatar ? (
                                            <img
                                                src={user.avatar}
                                                alt={user.name}
                                                className="w-8 h-8 rounded-full border-2 border-primary-500/50 object-cover"
                                            />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-emerald-500 flex items-center justify-center text-sm font-bold text-white">
                                                {user?.name?.charAt(0).toUpperCase() || 'U'}
                                            </div>
                                        )}
                                        <span className="text-sm text-gray-300 hidden lg:block max-w-[100px] truncate">
                                            {user?.name}
                                        </span>
                                    </button>

                                    {/* Dropdown Menu */}
                                    <AnimatePresence>
                                        {showUserMenu && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                                transition={{ duration: 0.15 }}
                                                className="absolute right-0 mt-2 w-56 bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-glass-lg py-2 overflow-hidden"
                                            >
                                                {/* User Info */}
                                                <div className="px-4 py-3 border-b border-white/10">
                                                    <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                                                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                                                </div>

                                                {/* Menu Items */}
                                                <div className="py-1">
                                                    <Link
                                                        to="/profile"
                                                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
                                                    >
                                                        <User className="w-4 h-4" />
                                                        Tài khoản
                                                    </Link>
                                                    <Link
                                                        to="/orders"
                                                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
                                                    >
                                                        <Package className="w-4 h-4" />
                                                        Đơn hàng
                                                    </Link>
                                                    <Link
                                                        to="/wishlist"
                                                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
                                                    >
                                                        <Heart className="w-4 h-4" />
                                                        Yêu thích
                                                    </Link>
                                                    {(user?.role === 'admin' || user?.role === 'superadmin') && (
                                                        <Link
                                                            to="/admin"
                                                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-green-400 hover:bg-green-500/10 transition-colors font-medium"
                                                        >
                                                            <span className="text-base">âš™ï¸</span>
                                                            Quản trị Admin
                                                        </Link>
                                                    )}
                                                </div>

                                                {/* Logout */}
                                                <div className="border-t border-white/10 pt-1">
                                                    <button
                                                        onClick={handleLogout}
                                                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                                                    >
                                                        <LogOut className="w-4 h-4" />
                                                        Đăng xuất
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link
                                    to="/login"
                                    className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors"
                                >
                                    Đăng nhập
                                </Link>
                                <Link
                                    to="/register"
                                    className="px-4 py-2 bg-primary-600 hover:bg-primary-500 rounded-lg text-sm text-white font-medium transition-colors"
                                >
                                    Đăng ký
                                </Link>
                            </div>
                        )}

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setShowMobileMenu(!showMobileMenu)}
                            className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
                        >
                            {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                <AnimatePresence>
                    {showMobileMenu && (
                        <motion.nav
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="md:hidden mt-4 overflow-hidden"
                        >
                            <div className="flex flex-col gap-1 pb-2">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.to}
                                        to={link.to}
                                        className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive(link.to)
                                            ? 'text-white bg-white/10'
                                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                                            }`}
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                            </div>
                        </motion.nav>
                    )}
                </AnimatePresence>
            </div>
        </header>
    );
};

