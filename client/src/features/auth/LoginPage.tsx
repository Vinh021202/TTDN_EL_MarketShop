import { FormEvent, useMemo, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Lock, Mail, ShieldCheck, ShoppingBag, Sparkles } from 'lucide-react';
import { loginUser } from '@/features/auth/services/authApi';
import { toast } from '@/components/ui';
import { translate } from '@/features/shared/utils/displayPreferences';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';

const resolveRedirectTarget = (state: unknown) => {
    if (!state || typeof state !== 'object' || !('from' in state)) {
        return '/';
    }

    const from = state.from;
    return typeof from === 'string' && from !== '/login' && from !== '/register' ? from : '/';
};

export const LoginPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const language = useThemeStore((state) => state.language);
    const setAuth = useAuthStore((state) => state.setAuth);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    const redirectTo = useMemo(() => resolveRedirectTarget(location.state), [location.state]);

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [rememberMe, setRememberMe] = useState(true);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const copy = useMemo(
        () => ({
            eyebrow: translate({ vi: 'Tài khoản mua sắm', en: 'Shopping account' }, language),
            heroTitle: translate(
                {
                    vi: 'Đăng nhập để tiếp tục với giỏ hàng, checkout và theo dõi đơn mua.',
                    en: 'Sign in to continue with your cart, checkout, and order tracking.',
                },
                language
            ),
            heroDescription: translate(
                {
                    vi: 'Quay lại nhanh với sản phẩm đã chọn, đơn hàng đang theo dõi và thông tin tài khoản của bạn.',
                    en: 'Return quickly to saved products, order progress, and your account details.',
                },
                language
            ),
            seamlessCheckout: translate({ vi: 'Checkout liền mạch', en: 'Seamless checkout' }, language),
            seamlessCheckoutDescription: translate(
                {
                    vi: 'Quay lại đúng bước mua hàng trước đó sau khi xác thực.',
                    en: 'Return to the exact shopping step you were on after authentication.',
                },
                language
            ),
            secureSession: translate({ vi: 'Phiên an toàn', en: 'Secure session' }, language),
            secureSessionDescription: translate(
                {
                    vi: 'Thông tin đăng nhập được giữ ổn định để bạn mua sắm liền mạch hơn.',
                    en: 'Your sign-in stays stable so the rest of your shopping flow feels smoother.',
                },
                language
            ),
            welcome: translate({ vi: 'Chào mừng đến với TTDN Market', en: 'Welcome to TTDN Market' }, language),
            loginTitle: translate({ vi: 'Đăng nhập tài khoản', en: 'Sign in to your account' }, language),
            resumeNote: translate(
                {
                    vi: 'Đăng nhập để tiếp tục phiên mua sắm hoặc bước checkout vừa rồi.',
                    en: 'Sign in to continue your shopping session or the checkout step you just left.',
                },
                language
            ),
            email: 'Email',
            password: translate({ vi: 'Mật khẩu', en: 'Password' }, language),
            rememberMe: translate({ vi: 'Giữ đăng nhập', en: 'Keep me signed in' }, language),
            forgotPassword: translate(
                { vi: 'Khôi phục mật khẩu sẽ được bổ sung sau', en: 'Password recovery will be added later' },
                language
            ),
            submit: translate({ vi: 'Đăng nhập', en: 'Sign in' }, language),
            submitting: translate({ vi: 'Đang đăng nhập...', en: 'Signing in...' }, language),
            or: translate({ vi: 'hoặc', en: 'or' }, language),
            googleSoon: translate({ vi: 'Google (sắp có)', en: 'Google (coming soon)' }, language),
            facebookSoon: translate({ vi: 'Facebook (sắp có)', en: 'Facebook (coming soon)' }, language),
            noAccount: translate({ vi: 'Chưa có tài khoản?', en: "Don't have an account?" }, language),
            createAccount: translate({ vi: 'Tạo tài khoản', en: 'Create account' }, language),
            validationEmailRequired: translate({ vi: 'Vui lòng nhập email.', en: 'Please enter your email.' }, language),
            validationEmailInvalid: translate({ vi: 'Email chưa đúng định dạng.', en: 'Email format is invalid.' }, language),
            validationPasswordRequired: translate({ vi: 'Vui lòng nhập mật khẩu.', en: 'Please enter your password.' }, language),
            loginFailed: translate({ vi: 'Đăng nhập thất bại', en: 'Sign-in failed' }, language),
            welcomeBack: (name: string) =>
                translate(
                    {
                        vi: `Chào mừng quay lại, ${name}!`,
                        en: `Welcome back, ${name}!`,
                    },
                    language
                ),
        }),
        [language]
    );

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const validate = () => {
        const nextErrors: Record<string, string> = {};

        if (!formData.email.trim()) {
            nextErrors.email = copy.validationEmailRequired;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            nextErrors.email = copy.validationEmailInvalid;
        }

        if (!formData.password) {
            nextErrors.password = copy.validationPasswordRequired;
        }

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();

        if (!validate()) {
            return;
        }

        setLoading(true);

        try {
            const response = await loginUser({
                email: formData.email,
                password: formData.password,
            });

            setAuth(response.user, response.token);
            toast.success(copy.welcomeBack(response.user.name));
            navigate(redirectTo, { replace: true });
        } catch (error: any) {
            const message = error.response?.data?.error || copy.loginFailed;
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    if (isAuthenticated) {
        return <Navigate to={redirectTo} replace />;
    }

    return (
        <section className="log-in-section background-image-2 section-b-space pt-4 pt-lg-5">
            <div className="container-fluid-lg w-100">
                <div className="row g-4 align-items-center">
                    <div className="col-xxl-6 col-xl-6 col-lg-6 d-lg-block d-none">
                        <div className="ttdn-page-hero h-100">
                            <p className="ttdn-hero-eyebrow mb-4">
                                <Sparkles size={16} />
                                {copy.eyebrow}
                            </p>
                            <h2 className="display-6 fw-bold text-white mb-3">{copy.heroTitle}</h2>
                            <p className="text-white-50 mb-4">{copy.heroDescription}</p>

                            <div className="row g-3">
                                <div className="col-sm-6">
                                    <div className="ttdn-auth-side-card">
                                        <ShoppingBag size={22} className="mb-3" />
                                        <h5 className="text-white fw-bold mb-2">{copy.seamlessCheckout}</h5>
                                        <p className="text-white-50 mb-0">{copy.seamlessCheckoutDescription}</p>
                                    </div>
                                </div>
                                <div className="col-sm-6">
                                    <div className="ttdn-auth-side-card">
                                        <ShieldCheck size={22} className="mb-3" />
                                        <h5 className="text-white fw-bold mb-2">{copy.secureSession}</h5>
                                        <p className="text-white-50 mb-0">{copy.secureSessionDescription}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-xxl-4 col-xl-5 col-lg-6 col-sm-10 mx-auto ms-lg-auto">
                        <div className="log-in-box">
                            <div className="log-in-title">
                                <h3>{copy.welcome}</h3>
                                <h4>{copy.loginTitle}</h4>
                                {redirectTo !== '/' ? (
                                    <p className="ttdn-inline-note mt-3 mb-0">{copy.resumeNote}</p>
                                ) : null}
                            </div>

                            <div className="input-box">
                                <form className="row g-4" onSubmit={handleSubmit}>
                                    <div className="col-12">
                                        <div className="form-floating theme-form-floating log-in-form">
                                            <input
                                                id="email"
                                                name="email"
                                                type="email"
                                                className="form-control"
                                                placeholder={copy.email}
                                                value={formData.email}
                                                onChange={handleChange}
                                                autoComplete="email"
                                                disabled={loading}
                                            />
                                            <label htmlFor="email">
                                                <Mail size={16} className="me-2" />
                                                {copy.email}
                                            </label>
                                        </div>
                                        {errors.email ? <p className="ttdn-field-error">{errors.email}</p> : null}
                                    </div>

                                    <div className="col-12">
                                        <div className="form-floating theme-form-floating log-in-form">
                                            <input
                                                id="password"
                                                name="password"
                                                type="password"
                                                className="form-control"
                                                placeholder={copy.password}
                                                value={formData.password}
                                                onChange={handleChange}
                                                autoComplete="current-password"
                                                disabled={loading}
                                            />
                                            <label htmlFor="password">
                                                <Lock size={16} className="me-2" />
                                                {copy.password}
                                            </label>
                                        </div>
                                        {errors.password ? <p className="ttdn-field-error">{errors.password}</p> : null}
                                    </div>

                                    <div className="col-12">
                                        <div className="forgot-box justify-content-between">
                                            <div className="form-check ps-0 m-0 remember-box">
                                                <input
                                                    id="rememberMe"
                                                    type="checkbox"
                                                    className="checkbox_animated check-box"
                                                    checked={rememberMe}
                                                    onChange={(event) => setRememberMe(event.target.checked)}
                                                />
                                                <label className="form-check-label" htmlFor="rememberMe">
                                                    {copy.rememberMe}
                                                </label>
                                            </div>
                                            <span className="forgot-password">{copy.forgotPassword}</span>
                                        </div>
                                    </div>

                                    <div className="col-12">
                                        <button className="btn btn-animation w-100 justify-content-center" type="submit" disabled={loading}>
                                            {loading ? copy.submitting : copy.submit}
                                        </button>
                                    </div>
                                </form>
                            </div>

                            <div className="other-log-in">
                                <h6>{copy.or}</h6>
                            </div>

                            <div className="log-in-button">
                                <ul>
                                    <li>
                                        <button type="button" className="btn google-button w-100 ttdn-social-button" disabled>
                                            <img src="/fastkart/assets/images/inner-page/google.png" alt="Google" width="20" height="20" />
                                            {copy.googleSoon}
                                        </button>
                                    </li>
                                    <li>
                                        <button type="button" className="btn google-button w-100 ttdn-social-button" disabled>
                                            <img src="/fastkart/assets/images/inner-page/facebook.png" alt="Facebook" width="20" height="20" />
                                            {copy.facebookSoon}
                                        </button>
                                    </li>
                                </ul>
                            </div>

                            <div className="other-log-in">
                                <h6></h6>
                            </div>

                            <div className="sign-up-box">
                                <h4>{copy.noAccount}</h4>
                                <Link to="/register" state={location.state}>
                                    {copy.createAccount}
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
