import { Link } from 'react-router-dom';
import { translate } from '@/features/shared/utils/displayPreferences';
import { useThemeStore } from '@/store/themeStore';

export function StorefrontFooter() {
    const language = useThemeStore((state) => state.language);

    const quickLinks = [
        { to: '/', label: translate({ vi: 'Trang chủ', en: 'Home' }, language) },
        { to: '/products', label: translate({ vi: 'Sản phẩm', en: 'Products' }, language) },
        { to: '/recipes', label: translate({ vi: 'Công thức', en: 'Recipes' }, language) },
        { to: '/login', label: translate({ vi: 'Đăng nhập', en: 'Sign in' }, language) },
    ];

    const serviceLinks = [
        { to: '/cart', label: translate({ vi: 'Giỏ hàng', en: 'Cart' }, language) },
        { to: '/orders', label: translate({ vi: 'Theo dõi đơn', en: 'Track orders' }, language) },
        { to: '/profile', label: translate({ vi: 'Tài khoản', en: 'Account' }, language) },
        { to: '/admin', label: 'Admin' },
    ];

    return (
        <footer className="storefront-footer">
            <div className="container-fluid-lg">
                <div className="ttdn-newsletter mb-5">
                    <div className="row align-items-center g-4">
                        <div className="col-lg-7">
                            <p className="text-uppercase small fw-bold mb-2 text-white-50">TTDN Market</p>
                            <h2 className="mb-3 text-white">
                                {translate(
                                    {
                                        vi: 'Chọn thực phẩm tươi, nguyên liệu nấu ăn và theo dõi đơn hàng trong một nơi.',
                                        en: 'Choose fresh food, cooking ingredients, and order tracking in one place.',
                                    },
                                    language
                                )}
                            </h2>
                            <p className="mb-0 text-white-50">
                                {translate(
                                    {
                                        vi: 'Từ danh mục, giỏ hàng đến công thức nấu ăn, mọi khu vực đều được sắp xếp để bạn mua sắm thuận tiện hơn.',
                                        en: 'From categories and cart flow to recipe browsing, each area is arranged to make shopping smoother.',
                                    },
                                    language
                                )}
                            </p>
                        </div>
                        <div className="col-lg-5">
                            <div className="row g-3">
                                <div className="col-sm-6">
                                    <div className="ttdn-hero-stats h-100">
                                        <p className="mb-1 fw-semibold">
                                            {translate({ vi: 'Khung giờ giao', en: 'Delivery slots' }, language)}
                                        </p>
                                        <h4 className="mb-0 text-white">
                                            {translate({ vi: 'Sáng hoặc chiều', en: 'Morning or afternoon' }, language)}
                                        </h4>
                                    </div>
                                </div>
                                <div className="col-sm-6">
                                    <div className="ttdn-hero-stats h-100">
                                        <p className="mb-1 fw-semibold">
                                            {translate({ vi: 'Hỗ trợ đơn hàng', en: 'Order support' }, language)}
                                        </p>
                                        <h4 className="mb-0 text-white">
                                            {translate({ vi: 'Theo dõi dễ dàng', en: 'Easy tracking' }, language)}
                                        </h4>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row g-4 align-items-start">
                    <div className="col-lg-4">
                        <img src="/fastkart/assets/images/logo/1.png" alt="TTDN Market" style={{ height: 48 }} />
                        <p className="text-muted mt-3 mb-4">
                            {translate(
                                {
                                    vi: 'TTDN Market kết hợp bán thực phẩm tươi với trải nghiệm shopping thông minh, recipe assistance và quy trình vận hành rõ ràng hơn.',
                                    en: 'TTDN Market combines fresh food shopping with smarter discovery, recipe assistance, and a clearer customer journey.',
                                },
                                language
                            )}
                        </p>
                        <img
                            src="/fastkart/assets/images/secure_payments.png"
                            alt={translate({ vi: 'Thanh toán an toàn', en: 'Secure payments' }, language)}
                            className="img-fluid"
                            style={{ maxWidth: 220 }}
                        />
                    </div>

                    <div className="col-sm-6 col-lg-2">
                        <h5 className="fw-bold text-dark mb-3">
                            {translate({ vi: 'Đi nhanh', en: 'Quick links' }, language)}
                        </h5>
                        <div className="d-grid gap-2">
                            {quickLinks.map((link) => (
                                <Link key={link.to} to={link.to} className="text-decoration-none text-muted">
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div className="col-sm-6 col-lg-2">
                        <h5 className="fw-bold text-dark mb-3">
                            {translate({ vi: 'Dịch vụ', en: 'Services' }, language)}
                        </h5>
                        <div className="d-grid gap-2">
                            {serviceLinks.map((link) => (
                                <Link key={link.to} to={link.to} className="text-decoration-none text-muted">
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div className="col-lg-4">
                        <h5 className="fw-bold text-dark mb-3">
                            {translate({ vi: 'Cam kết mua sắm', en: 'Shopping promise' }, language)}
                        </h5>
                        <div className="ttdn-panel">
                            <p className="mb-2 fw-semibold text-dark">
                                {translate({ vi: 'Dành cho mỗi đơn hàng', en: 'For every order' }, language)}
                            </p>
                            <ul className="mb-0 text-muted ps-3">
                                <li>
                                    {translate(
                                        {
                                            vi: 'Thực phẩm tươi và dễ tìm theo danh mục',
                                            en: 'Fresh food grouped into easy-to-browse categories',
                                        },
                                        language
                                    )}
                                </li>
                                <li>
                                    {translate(
                                        {
                                            vi: 'Chọn khung giờ giao phù hợp trong ngày',
                                            en: 'Flexible delivery slots throughout the day',
                                        },
                                        language
                                    )}
                                </li>
                                <li>
                                    {translate(
                                        {
                                            vi: 'Theo dõi đơn hàng ngay trên tài khoản cá nhân',
                                            en: 'Track your order directly from your account',
                                        },
                                        language
                                    )}
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="border-top border-light-subtle mt-5 pt-4 d-flex flex-column flex-md-row justify-content-between gap-2 text-muted small">
                    <span>
                        {translate(
                            {
                                vi: 'TTDN Market kết nối mua sắm, đơn hàng và công thức trên cùng một hệ thống.',
                                en: 'TTDN Market connects shopping, orders, and recipes in one system.',
                            },
                            language
                        )}
                    </span>
                    <span>
                        {translate(
                            {
                                vi: 'Mua sắm thuận tiện trên cả máy tính và điện thoại.',
                                en: 'A smooth shopping experience on desktop and mobile.',
                            },
                            language
                        )}
                    </span>
                </div>
            </div>
        </footer>
    );
}
