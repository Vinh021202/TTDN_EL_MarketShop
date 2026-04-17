import { apiClient } from '@/features/shared/api/apiClient';
import { IUser, IAuthResponse } from '../../../../../shared/types';

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// TYPES
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

export interface RegisterData {
    name: string;
    email: string;
    password: string;
}

export interface LoginData {
    email: string;
    password: string;
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// AUTH API
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

/**
 * Register new user
 */
export const registerUser = async (data: RegisterData): Promise<IAuthResponse> => {
    const response = await apiClient.post<IAuthResponse>('/auth/register', data);
    return response.data;
};

/**
 * Login user
 */
export const loginUser = async (data: LoginData): Promise<IAuthResponse> => {
    const response = await apiClient.post<IAuthResponse>('/auth/login', data);
    return response.data;
};

/**
 * Get current user
 */
export const getCurrentUser = async (): Promise<{ user: IUser }> => {
    const response = await apiClient.get<{ user: IUser }>('/auth/me');
    return response.data;
};

/**
 * Logout user
 */
export const logoutUser = async (): Promise<void> => {
    await apiClient.post('/auth/logout');
};

