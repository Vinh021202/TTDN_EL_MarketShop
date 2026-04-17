import { FormEvent, useMemo, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Lock, Mail, ShieldCheck, Sparkles, User } from 'lucide-react';
import { registerUser } from '@/features/auth/services/authApi';
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

const getPasswordStrength = (password: string) => {
    if (!password) {
        return { strength: 0, color: '#e8ecef' };
    }

    let strength = 0;

    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;

    const colors = ['#ef4444', '#f97316', '#f59e0b', '#0ea5e9', '#0da487'];

    return {
        strength,
        color: colors[strength - 1] || '#e8ecef',
    };
};

export const RegisterPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const language = useThemeStore((state) => state.language);
    const setAuth = useAuthStore((state) => state.setAuth);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    const redirectTo = useMemo(() => resolveRedirectTarget(location.state), [location.state]);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const passwordStrength = getPasswordStrength(formData.password);

    const copy = useMemo(
        () => ({
            eyebrow: translate({ vi: 'Tài khoản mới', en: 'New account' }, language),
            heroTitle: translate(
                {
                    vi: 'Tạo tài khoản để lưu giỏ hàng, đặt đơn và quay lại nhanh ở những lần mua sau.',
                    en: 'Create an account to save your cart, place orders, and come back faster next time.',
                },
                language
            ),
            heroDescription: translate(
                {
                    vi: 'Tạo tài khoản để lưu thông tin mua sắm, theo dõi đơn và quay lại giỏ hàng nhanh hơn.',
                    en: 'Create an account to save shopping details, track orders, and get back to your cart quickly.',
                },
                language
            ),
            personalAccount: translate({ vi: 'Tài khoản cá nhân', en: 'Personal account' }, language),
            personalAccountDescription: translate(
                {
                    vi: 'Theo dõi đơn hàng và tiếp tục các phiên mua đang dở.',
                    en: 'Track orders and resume shopping sessions you have not finished yet.',
                },
                language
            ),
            quickOnboarding: translate({ vi: 'Onboarding gọn', en: 'Fast onboarding' }, language),
            quickOnboardingDescription: translate(
                {
                    vi: 'Tạo xong là có thể mua sắm ngay hoặc quay lại bước thanh toán trước đó.',
                    en: 'Once created, you can start shopping immediately or return to the previous checkout step.',
                },
                language
            ),
            welcome: translate({ vi: 'Chào mừng đến với TTDN Market', en: 'Welcome to TTDN Market' }, language),
            title: translate({ vi: 'Tạo tài khoản mới', en: 'Create a new account' }, language),
            note: translate(
                {
                    vi: 'Dùng email thật để sau này nhận cập nhật đơn hàng và giao hàng.',
                    en: 'Use a real email address so you can receive delivery and order updates later.',
                },
                language
            ),
            fullName: translate({ vi: 'Họ và tên', en: 'Full name' }, language),
            email: 'Email',
            password: translate({ vi: 'Mật khẩu', en: 'Password' }, language),
            confirmPassword: translate({ vi: 'Xác nhận mật khẩu', en: 'Confirm password' }, language),
            submit: translate({ vi: 'Tạo tài khoản', en: 'Create account' }, language),
            submitting: translate({ vi: 'Đang tạo tài khoản...', en: 'Creating account...' }, language),
            or: translate({ vi: 'hoặc', en: 'or' }, language),
            googleSoon: translate({ vi: 'Google (sắp có)', en: 'Google (coming soon)' }, language),
            facebookSoon: translate({ vi: 'Facebook (sắp có)', en: 'Facebook (coming soon)' }, language),
            alreadyHaveAccount: translate({ vi: 'Đã có tài khoản?', en: 'Already have an account?' }, language),
            signIn: translate({ vi: 'Đăng nhập', en: 'Sign in' }, language),
            passwordStrength: translate({ vi: 'Độ mạnh mật khẩu', en: 'Password strength' }, language),
            strengthLabels: [
                translate({ vi: 'Rất yếu', en: 'Very weak' }, language),
                translate({ vi: 'Yếu', en: 'Weak' }, language),
                translate({ vi: 'Tạm ổn', en: 'Fair' }, language),
                translate({ vi: 'Tốt', en: 'Good' }, language),
                translate({ vi: 'Mạnh', en: 'Strong' }, language),
            ],
            notRated: translate({ vi: 'Chưa đánh giá', en: 'Not rated yet' }, language),
            validationNameRequired: translate({ vi: 'Vui lòng nhập họ tên.', en: 'Please enter your full name.' }, language),
            validationNameShort: translate({ vi: 'Họ tên cần ít nhất 2 ký tự.', en: 'Full name must be at least 2 characters.' }, language),
            validationEmailRequired: translate({ vi: 'Vui lòng nhập email.', en: 'Please enter your email.' }, language),
            validationEmailInvalid: translate({ vi: 'Email chưa đúng định dạng.', en: 'Email format is invalid.' }, language),
            validationPasswordRequired: translate({ vi: 'Vui lòng nhập mật khẩu.', en: 'Please enter a password.' }, language),
            validationPasswordLength: translate({ vi: 'Mật khẩu cần ít nhất 8 ký tự.', en: 'Password must be at least 8 characters.' }, language),
            validationPasswordUpper: translate({ vi: 'Mật khẩu cần có ít nhất 1 chữ in hoa.', en: 'Password must include at least 1 uppercase letter.' }, language),
            validationPasswordLower: translate({ vi: 'Mật khẩu cần có ít nhất 1 chữ thường.', en: 'Password must include at least 1 lowercase letter.' }, language),
            validationPasswordNumber: translate({ vi: 'Mật khẩu cần có ít nhất 1 chữ số.', en: 'Password must include at least 1 number.' }, language),
            validationConfirmRequired: translate({ vi: 'Vui lòng xác nhận mật khẩu.', en: 'Please confirm your password.' }, language),
            validationConfirmMismatch: translate({ vi: 'Mật khẩu xác nhận chưa khớp.', en: 'Confirmation password does not match.' }, language),
            registerSuccess: translate({ vi: 'Tạo tài khoản thành công!', en: 'Account created successfully!' }, language),
            registerFailed: translate({ vi: 'Đăng ký thất bại', en: 'Registration failed' }, language),
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

        if (!formData.name.trim()) {
            nextErrors.name = copy.validationNameRequired;
        } else if (formData.name.trim().length < 2) {
            nextErrors.name = copy.validationNameShort;
        }

        if (!formData.email.trim()) {
            nextErrors.email = copy.validationEmailRequired;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            nextErrors.email = copy.validationEmailInvalid;
        }

        if (!formData.password) {
            nextErrors.password = copy.validationPasswordRequired;
        } else if (formData.password.length < 8) {
            nextErrors.password = copy.validationPasswordLength;
        } else if (!/[A-Z]/.test(formData.password)) {
            nextErrors.password = copy.validationPasswordUpper;
        } else if (!/[a-z]/.test(formData.password)) {
            nextErrors.password = copy.validationPasswordLower;
        } else if (!/[0-9]/.test(formData.password)) {
            nextErrors.password = copy.validationPasswordNumber;
        }

        if (!formData.confirmPassword) {
            nextErrors.confirmPassword = copy.validationConfirmRequired;
        } else if (formData.password !== formData.confirmPassword) {
            nextErrors.confirmPassword = copy.validationConfirmMismatch;
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
            const response = await registerUser({
                name: formData.name.trim(),
                email: formData.email,
                password: formData.password,
            });

            setAuth(response.user, response.token);
            toast.success(copy.registerSuccess);
            navigate(redirectTo, { replace: true });
        } catch (error: any) {
            const message = error.response?.data?.error || copy.registerFailed;
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    if (isAuthenticated) {
        return <Navigate to={redirectTo} replace />;
    }

    return (
        <section className="log-in-section section-b-space pt-4 pt-lg-5">
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
                                        <ShieldCheck size={22} className="mb-3" />
                                        <h5 className="text-white fw-bold mb-2">{copy.personalAccount}</h5>
                                        <p className="text-white-50 mb-0">{copy.personalAccountDescription}</p>
                                    </div>
                                </div>
                                <div className="col-sm-6">
                                    <div className="ttdn-auth-side-card">
                                        <User size={22} className="mb-3" />
                                        <h5 className="text-white fw-bold mb-2">{copy.quickOnboarding}</h5>
                                        <p className="text-white-50 mb-0">{copy.quickOnboardingDescription}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-xxl-4 col-xl-5 col-lg-6 col-sm-10 mx-auto ms-lg-auto">
                        <div className="log-in-box">
                            <div className="log-in-title">
                                <h3>{copy.welcome}</h3>
                                <h4>{copy.title}</h4>
                                <p className="ttdn-inline-note mt-3 mb-0">{copy.note}</p>
                            </div>

                            <div className="input-box">
                                <form className="row g-4" onSubmit={handleSubmit}>
                                    <div className="col-12">
                                        <div className="form-floating theme-form-floating">
                                            <input
                                                id="fullname"
                                                name="name"
                                                type="text"
                                                className="form-control"
                                                placeholder={copy.fullName}
                                                value={formData.name}
                                                onChange={handleChange}
                                                autoComplete="name"
                                                disabled={loading}
                                            />
                                            <label htmlFor="fullname">
                                                <User size={16} className="me-2" />
                                                {copy.fullName}
                                            </label>
                                        </div>
                                        {errors.name ? <p className="ttdn-field-error">{errors.name}</p> : null}
                                    </div>

                                    <div className="col-12">
                                        <div className="form-floating theme-form-floating">
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
                                        <div className="form-floating theme-form-floating">
                                            <input
                                                id="password"
                                                name="password"
                                                type="password"
                                                className="form-control"
                                                placeholder={copy.password}
                                                value={formData.password}
                                                onChange={handleChange}
                                                autoComplete="new-password"
                                                disabled={loading}
                                            />
                                            <label htmlFor="password">
                                                <Lock size={16} className="me-2" />
                                                {copy.password}
                                            </label>
                                        </div>
                                        {errors.password ? <p className="ttdn-field-error">{errors.password}</p> : null}

                                        {formData.password ? (
                                            <div>
                                                <div className="ttdn-password-meter">
                                                    {[1, 2, 3, 4, 5].map((level) => (
                                                        <span
                                                            key={level}
                                                            style={{
                                                                background: level <= passwordStrength.strength ? passwordStrength.color : '#e8ecef',
                                                            }}
                                                        />
                                                    ))}
                                                </div>
                                                <p className="text-content small mt-2 mb-0">
                                                    {copy.passwordStrength}:{' '}
                                                    <strong>{copy.strengthLabels[passwordStrength.strength - 1] || copy.notRated}</strong>
                                                </p>
                                            </div>
                                        ) : null}
                                    </div>

                                    <div className="col-12">
                                        <div className="form-floating theme-form-floating">
                                            <input
                                                id="confirmPassword"
                                                name="confirmPassword"
                                                type="password"
                                                className="form-control"
                                                placeholder={copy.confirmPassword}
                                                value={formData.confirmPassword}
                                                onChange={handleChange}
                                                autoComplete="new-password"
                                                disabled={loading}
                                            />
                                            <label htmlFor="confirmPassword">
                                                <Lock size={16} className="me-2" />
                                                {copy.confirmPassword}
                                            </label>
                                        </div>
                                        {errors.confirmPassword ? <p className="ttdn-field-error">{errors.confirmPassword}</p> : null}
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
                                <h4>{copy.alreadyHaveAccount}</h4>
                                <Link to="/login" state={location.state}>
                                    {copy.signIn}
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
