import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

interface AdminRouteProps {
    children: React.ReactNode;
}

/**
 * AdminRoute ??" B?o v?? route ch?? cho admin/superadmin
 * N?u chua ?'?fng nh?p ??' /login
 * N?u kh?ng ph?i admin ??' /
 */
export function AdminRoute({ children }: AdminRouteProps) {
    const { user, isAuthenticated, checkAuth } = useAuthStore();

    if (!isAuthenticated || !checkAuth()) {
        return <Navigate to="/login" replace />;
    }

    if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
}

