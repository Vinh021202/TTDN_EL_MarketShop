import { apiClient } from '@/features/shared/api/apiClient';

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// USER API FUNCTIONS
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

export interface UpdateProfileData {
    name?: string;
    phone?: string;
    avatar?: string;
}

export interface ChangePasswordData {
    currentPassword: string;
    newPassword: string;
}

export interface UserProfile {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
    role: string;
    addresses: any[];
    wishlist: string[];
    isActive: boolean;
}

/**
 * Update user profile
 */
export const updateProfile = async (data: UpdateProfileData): Promise<{ message: string; user: UserProfile }> => {
    const response = await apiClient.put<{ message: string; user: UserProfile }>('/auth/profile', data);
    return response.data;
};

/**
 * Change user password
 */
export const changePassword = async (data: ChangePasswordData): Promise<{ message: string }> => {
    const response = await apiClient.put<{ message: string }>('/auth/password', data);
    return response.data;
};

/**
 * Get current user info
 */
export const getCurrentUser = async (): Promise<{ user: UserProfile }> => {
    const response = await apiClient.get<{ user: UserProfile }>('/auth/me');
    return response.data;
};

