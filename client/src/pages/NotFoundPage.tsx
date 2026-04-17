import { Link } from 'react-router-dom';
import { ROUTE_PATHS } from '@/constant/routePaths';
import { translate } from '@/features/shared/utils/displayPreferences';
import { useThemeStore } from '@/store/themeStore';

export function NotFoundPage() {
    const language = useThemeStore((state) => state.language);

    return (
        <div className="min-h-screen d-flex align-items-center justify-content-center px-4">
            <div className="ttdn-empty-state text-center" style={{ maxWidth: 520 }}>
                <h1 className="display-5 fw-bold text-dark mb-3">404</h1>
                <p className="text-muted mb-4">
                    {translate(
                        {
                            vi: 'Trang ban can hien khong ton tai hoac duong dan da thay doi.',
                            en: 'The page you are looking for no longer exists or the link has changed.',
                        },
                        language
                    )}
                </p>
                <Link
                    to={ROUTE_PATHS.home}
                    className="btn theme-bg-color text-white rounded-pill px-4"
                >
                    {translate({ vi: 'Ve trang chu', en: 'Back to home' }, language)}
                </Link>
            </div>
        </div>
    );
}
