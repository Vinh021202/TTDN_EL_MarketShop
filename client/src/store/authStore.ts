import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { IUser } from '../../../shared/types';

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

/**
 * Decode JWT payload and check if token is expired
 */
const isTokenExpired = (token: string): boolean => {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        // exp is in seconds, Date.now() is in ms
        return payload.exp * 1000 < Date.now();
    } catch {
        return true;
    }
};

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

interface AuthState {
    user: IUser | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}

interface AuthActions {
    setAuth: (user: IUser, token: string) => void;
    updateUser: (userData: Partial<IUser>) => void;
    logout: () => void;
    setLoading: (loading: boolean) => void;
    checkAuth: () => boolean;
}

export type AuthStore = AuthState & AuthActions;

// ═══════════════════════════════════════════════════════════════
// STORE
// ═══════════════════════════════════════════════════════════════

export const useAuthStore = create<AuthStore>()(
    persist(
        (set, get) => ({
            // State
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,

            // Actions
            setAuth: (user, token) => {
                set({
                    user,
                    token,
                    isAuthenticated: true,
                    isLoading: false,
                });
            },

            updateUser: (userData) => {
                const currentUser = get().user;
                if (currentUser) {
                    set({ user: { ...currentUser, ...userData } as IUser });
                }
            },

            logout: () => {
                set({
                    user: null,
                    token: null,
                    isAuthenticated: false,
                    isLoading: false,
                });
            },

            setLoading: (loading) => {
                set({ isLoading: loading });
            },

            checkAuth: () => {
                const { token, user } = get();
                if (!token || !user) return false;

                // Check token expiry
                if (isTokenExpired(token)) {
                    get().logout();
                    return false;
                }

                return true;
            },
        }),
        {
            name: 'auth-storage', // LocalStorage key
            partialize: (state) => ({
                user: state.user,
                token: state.token,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);
