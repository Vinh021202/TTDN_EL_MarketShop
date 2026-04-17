import { useMemo, useState } from 'react';
import { Lock, Save, ShieldCheck, UserCircle } from 'lucide-react';
import { toast } from '@/components/ui';
import { translate } from '@/features/shared/utils/displayPreferences';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { changePassword, updateProfile } from '@/features/auth/services/userApi';
import { StorefrontBreadcrumb } from '@/features/storefront/components/StorefrontBreadcrumb';
import { StorefrontAccountSidebar } from '@/features/storefront/components/StorefrontAccountSidebar';

const getRoleLabel = (role?: string, language: 'vi' | 'en' = 'vi') => {
    if (role === 'admin') return language === 'vi' ? 'Quản trị viên' : 'Administrator';
    if (role === 'superadmin') return language === 'vi' ? 'Quản trị cấp cao' : 'Super administrator';
    return language === 'vi' ? 'Người dùng' : 'Customer';
};

interface ProfileFieldProps {
    id: string;
    label: string;
    value: string;
    type?: string;
    placeholder?: string;
    readOnly?: boolean;
    autoComplete?: string;
    onChange?: (value: string) => void;
}

function ProfileField({
    id,
    label,
    value,
    type = 'text',
    placeholder,
    readOnly = false,
    autoComplete,
    onChange,
}: ProfileFieldProps) {
    return (
        <div className="ttdn-profile-field">
            <label htmlFor={id} className="ttdn-profile-field__label">
                {label}
            </label>
            <input
                id={id}
                type={type}
                className={`form-control ttdn-profile-field__input${readOnly ? ' is-readonly' : ''}`}
                value={value}
                placeholder={placeholder || label}
                readOnly={readOnly}
                autoComplete={autoComplete}
                onChange={onChange ? (event) => onChange(event.target.value) : undefined}
            />
        </div>
    );
}

export const ProfilePage = () => {
    const { user, setAuth, token } = useAuthStore();
    const language = useThemeStore((state) => state.language);
    const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');
    const [name, setName] = useState(user?.name || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [isUpdating, setIsUpdating] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    const copy = useMemo(
        () => ({
            title: translate({ vi: 'Tài khoản', en: 'Account' }, language),
            subtitle: translate(
                { vi: 'Quản lý hồ sơ cá nhân và bảo mật tài khoản của bạn.', en: 'Manage your personal profile and account security.' },
                language
            ),
            emptySubtitle: translate(
                { vi: 'Không tìm thấy dữ liệu người dùng trong phiên hiện tại.', en: 'No user data was found in the current session.' },
                language
            ),
            emptyTitle: translate({ vi: 'Chưa có dữ liệu tài khoản', en: 'No account data available' }, language),
            emptyDescription: translate(
                { vi: 'Vui lòng đăng nhập lại để xem và chỉnh sửa hồ sơ cá nhân.', en: 'Please sign in again to view and edit your profile.' },
                language
            ),
            sidebarTitle: translate({ vi: 'Tài khoản của tôi', en: 'My account' }, language),
            sidebarDescription: translate(
                { vi: 'Cập nhật thông tin liên hệ và đổi mật khẩu ngay trong trang tài khoản.', en: 'Update your contact details and change your password directly from this account page.' },
                language
            ),
            personalProfile: translate({ vi: 'Hồ sơ cá nhân', en: 'Personal profile' }, language),
            accountStatus: translate({ vi: 'Trạng thái tài khoản', en: 'Account status' }, language),
            active: translate({ vi: 'Hoạt động', en: 'Active' }, language),
            inactive: translate({ vi: 'Tạm khóa', en: 'Inactive' }, language),
            profileTab: translate({ vi: 'Thông tin cá nhân', en: 'Profile details' }, language),
            securityTab: translate({ vi: 'Bảo mật tài khoản', en: 'Account security' }, language),
            updateTitle: translate({ vi: 'Cập nhật thông tin cá nhân', en: 'Update personal details' }, language),
            loginEmail: translate({ vi: 'Email đăng nhập', en: 'Login email' }, language),
            role: translate({ vi: 'Vai trò hiện tại', en: 'Current role' }, language),
            fullName: translate({ vi: 'Họ và tên', en: 'Full name' }, language),
            phone: translate({ vi: 'Số điện thoại', en: 'Phone number' }, language),
            profileNote: translate(
                { vi: 'Thay đổi ở đây sẽ cập nhật trực tiếp vào hồ sơ tài khoản đang lưu trong hệ thống.', en: 'Changes here will update the profile stored in your account immediately.' },
                language
            ),
            saveChanges: translate({ vi: 'Lưu thay đổi', en: 'Save changes' }, language),
            saving: translate({ vi: 'Đang lưu...', en: 'Saving...' }, language),
            passwordTitle: translate({ vi: 'Đổi mật khẩu', en: 'Change password' }, language),
            currentPassword: translate({ vi: 'Mật khẩu hiện tại', en: 'Current password' }, language),
            newPassword: translate({ vi: 'Mật khẩu mới', en: 'New password' }, language),
            confirmPassword: translate({ vi: 'Xác nhận mật khẩu', en: 'Confirm password' }, language),
            passwordNote: translate(
                { vi: 'Mật khẩu mới cần ít nhất 8 ký tự. Sau khi đổi thành công, phiên hiện tại vẫn được giữ nguyên.', en: 'Your new password must be at least 8 characters. After a successful change, your current session will remain active.' },
                language
            ),
            updatePassword: translate({ vi: 'Đổi mật khẩu', en: 'Update password' }, language),
            updatingPassword: translate({ vi: 'Đang cập nhật...', en: 'Updating...' }, language),
            roleStat: translate({ vi: 'Vai trò', en: 'Role' }, language),
            wishlistStat: translate({ vi: 'Yêu thích', en: 'Wishlist' }, language),
            addressStat: translate({ vi: 'Địa chỉ', en: 'Addresses' }, language),
            statusStat: translate({ vi: 'Trạng thái', en: 'Status' }, language),
            nameValidation: translate({ vi: 'Tên phải có ít nhất 2 ký tự.', en: 'Name must be at least 2 characters.' }, language),
            passwordFieldsRequired: translate({ vi: 'Vui lòng nhập đầy đủ thông tin đổi mật khẩu.', en: 'Please fill in all password fields.' }, language),
            passwordLength: translate({ vi: 'Mật khẩu mới phải có ít nhất 8 ký tự.', en: 'New password must be at least 8 characters.' }, language),
            passwordMismatch: translate({ vi: 'Xác nhận mật khẩu chưa khớp.', en: 'Password confirmation does not match.' }, language),
            updateFailed: translate({ vi: 'Cập nhật thất bại', en: 'Update failed' }, language),
            changePasswordFailed: translate({ vi: 'Đổi mật khẩu thất bại', en: 'Failed to change password' }, language),
        }),
        [language]
    );

    const stats = useMemo(
        () => [
            { label: copy.roleStat, value: getRoleLabel(user?.role, language) },
            { label: copy.wishlistStat, value: String(user?.wishlist?.length || 0) },
            { label: copy.addressStat, value: String(user?.addresses?.length || 0) },
            { label: copy.statusStat, value: user?.isActive ? copy.active : copy.inactive },
        ],
        [user, language, copy]
    );

    if (!user) {
        return (
            <>
                <StorefrontBreadcrumb title={copy.title} items={[{ label: copy.title }]} subtitle={copy.emptySubtitle} />
                <section className="section-b-space">
                    <div className="container-fluid-lg">
                        <div className="ttdn-empty-state text-center">
                            <h3 className="fw-bold text-dark mb-2">{copy.emptyTitle}</h3>
                            <p className="text-content mb-0">{copy.emptyDescription}</p>
                        </div>
                    </div>
                </section>
            </>
        );
    }

    const handleUpdateProfile = async () => {
        if (!name.trim() || name.trim().length < 2) {
            toast.error(copy.nameValidation);
            return;
        }

        setIsUpdating(true);

        try {
            const result = await updateProfile({ name: name.trim(), phone: phone.trim() });

            if (token) {
                setAuth(result.user as any, token);
            }

            toast.success(result.message);
        } catch (error: any) {
            const message = error.response?.data?.error || copy.updateFailed;
            toast.error(message);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleChangePassword = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            toast.error(copy.passwordFieldsRequired);
            return;
        }

        if (newPassword.length < 8) {
            toast.error(copy.passwordLength);
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error(copy.passwordMismatch);
            return;
        }

        setIsChangingPassword(true);

        try {
            const result = await changePassword({ currentPassword, newPassword });
            toast.success(result.message);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            const message = error.response?.data?.error || copy.changePasswordFailed;
            toast.error(message);
        } finally {
            setIsChangingPassword(false);
        }
    };

    return (
        <>
            <StorefrontBreadcrumb title={copy.title} items={[{ label: copy.title }]} subtitle={copy.subtitle} />

            <section className="user-dashboard-section section-b-space">
                <div className="container-fluid-lg">
                    <div className="row g-4">
                        <div className="col-xl-4 col-xxl-3">
                            <StorefrontAccountSidebar title={copy.sidebarTitle} description={copy.sidebarDescription} stats={stats} />
                        </div>

                        <div className="col-xl-8 col-xxl-9">
                            <div className="ttdn-page-hero mb-4">
                                <div className="d-flex flex-wrap justify-content-between align-items-start gap-3">
                                    <div>
                                        <p className="text-uppercase small fw-bold text-white-50 mb-2">{copy.personalProfile}</p>
                                        <h2 className="text-white fw-bold mb-2">{user.name}</h2>
                                        <p className="text-white-50 mb-0">{copy.loginEmail}: {user.email}</p>
                                    </div>

                                    <div className="ttdn-hero-stats">
                                        <p className="mb-1 text-white-50">{copy.accountStatus}</p>
                                        <h3 className="mb-0 text-white">{user.isActive ? copy.active : copy.inactive}</h3>
                                    </div>
                                </div>
                            </div>

                            <div className="d-flex flex-wrap gap-2 mb-4">
                                <button
                                    type="button"
                                    className={`btn rounded-pill px-4 ${activeTab === 'profile' ? 'theme-bg-color text-white' : 'btn-light text-dark'}`}
                                    onClick={() => setActiveTab('profile')}
                                >
                                    <UserCircle size={16} className="me-2" />
                                    {copy.profileTab}
                                </button>
                                <button
                                    type="button"
                                    className={`btn rounded-pill px-4 ${activeTab === 'password' ? 'theme-bg-color text-white' : 'btn-light text-dark'}`}
                                    onClick={() => setActiveTab('password')}
                                >
                                    <ShieldCheck size={16} className="me-2" />
                                    {copy.securityTab}
                                </button>
                            </div>

                            {activeTab === 'profile' ? (
                                <div className="ttdn-panel ttdn-profile-panel">
                                    <div className="d-flex align-items-center gap-2 mb-4">
                                        <UserCircle size={20} className="text-success" />
                                        <h3 className="fw-bold text-dark mb-0">{copy.updateTitle}</h3>
                                    </div>

                                    <div className="row g-4">
                                        <div className="col-md-6">
                                            <ProfileField
                                                id="profileEmail"
                                                label={copy.loginEmail}
                                                value={user.email}
                                                readOnly
                                                autoComplete="email"
                                            />
                                        </div>

                                        <div className="col-md-6">
                                            <ProfileField
                                                id="profileRole"
                                                label={copy.role}
                                                value={getRoleLabel(user.role, language)}
                                                readOnly
                                            />
                                        </div>

                                        <div className="col-md-6">
                                            <ProfileField
                                                id="profileName"
                                                label={copy.fullName}
                                                value={name}
                                                placeholder={copy.fullName}
                                                autoComplete="name"
                                                onChange={setName}
                                            />
                                        </div>

                                        <div className="col-md-6">
                                            <ProfileField
                                                id="profilePhone"
                                                label={copy.phone}
                                                value={phone}
                                                type="tel"
                                                placeholder={copy.phone}
                                                autoComplete="tel"
                                                onChange={setPhone}
                                            />
                                        </div>
                                    </div>

                                    <div className="ttdn-inline-note mt-4">{copy.profileNote}</div>

                                    <div className="d-flex justify-content-end mt-4">
                                        <button
                                            type="button"
                                            className="btn theme-bg-color text-white rounded-pill px-4 py-3 ttdn-profile-submit"
                                            onClick={handleUpdateProfile}
                                            disabled={isUpdating}
                                        >
                                            <Save size={16} className="me-2" />
                                            {isUpdating ? copy.saving : copy.saveChanges}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="ttdn-panel ttdn-profile-panel">
                                    <div className="d-flex align-items-center gap-2 mb-4">
                                        <Lock size={20} className="text-success" />
                                        <h3 className="fw-bold text-dark mb-0">{copy.passwordTitle}</h3>
                                    </div>

                                    <div className="row g-4">
                                        <div className="col-12">
                                            <ProfileField
                                                id="currentPassword"
                                                type="password"
                                                label={copy.currentPassword}
                                                value={currentPassword}
                                                placeholder={copy.currentPassword}
                                                autoComplete="current-password"
                                                onChange={setCurrentPassword}
                                            />
                                        </div>

                                        <div className="col-md-6">
                                            <ProfileField
                                                id="newPassword"
                                                type="password"
                                                label={copy.newPassword}
                                                value={newPassword}
                                                placeholder={copy.newPassword}
                                                autoComplete="new-password"
                                                onChange={setNewPassword}
                                            />
                                        </div>

                                        <div className="col-md-6">
                                            <ProfileField
                                                id="confirmPassword"
                                                type="password"
                                                label={copy.confirmPassword}
                                                value={confirmPassword}
                                                placeholder={copy.confirmPassword}
                                                autoComplete="new-password"
                                                onChange={setConfirmPassword}
                                            />
                                        </div>
                                    </div>

                                    <div className="ttdn-inline-note mt-4">{copy.passwordNote}</div>

                                    <div className="d-flex justify-content-end mt-4">
                                        <button
                                            type="button"
                                            className="btn theme-bg-color text-white rounded-pill px-4 py-3 ttdn-profile-submit"
                                            onClick={handleChangePassword}
                                            disabled={isChangingPassword}
                                        >
                                            <ShieldCheck size={16} className="me-2" />
                                            {isChangingPassword ? copy.updatingPassword : copy.updatePassword}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};
