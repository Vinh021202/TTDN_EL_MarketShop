import axios from 'axios';
import { API_BASE_URL } from '@/features/shared/api/apiBaseUrl';

const getAuthHeader = () => {
    const stored = localStorage.getItem('auth-storage');
    if (!stored) return {};

    try {
        const parsed = JSON.parse(stored);
        const token = parsed?.state?.token;
        return token ? { Authorization: `Bearer ${token}` } : {};
    } catch {
        return {};
    }
};

export interface AdminRecipeProductOption {
    _id: string;
    name: string;
    unit?: string;
    images?: any[];
    price?: number;
}

export interface AdminRecipeIngredient {
    product: string | AdminRecipeProductOption;
    quantity: number;
    unit: string;
    isOptional: boolean;
    notes?: string;
}

export interface AdminRecipeStep {
    order: number;
    instruction: string;
    duration?: number;
    image?: string;
    tips?: string;
}

export interface AdminRecipe {
    _id: string;
    name: string;
    slug: string;
    description?: string;
    thumbnail?: string;
    video?: string;
    prepTime: number;
    cookTime: number;
    servings: number;
    difficulty: string;
    ingredients: AdminRecipeIngredient[];
    steps: AdminRecipeStep[];
    tags: string[];
    estimatedCost?: number;
    calories?: number;
    isActive: boolean;
    isFeatured: boolean;
    viewCount: number;
    saveCount: number;
    createdAt: string;
    updatedAt: string;
}

export interface AdminRecipeFilters {
    page?: number;
    limit?: number;
    search?: string;
    difficulty?: string;
    active?: boolean;
    featured?: boolean;
}

export interface AdminRecipePayload {
    name: string;
    slug?: string;
    description?: string;
    thumbnail?: string;
    video?: string;
    prepTime: number;
    cookTime: number;
    servings: number;
    difficulty: string;
    ingredients: Array<{
        product: string;
        quantity: number;
        unit: string;
        isOptional: boolean;
        notes?: string;
    }>;
    steps: Array<{
        order: number;
        instruction: string;
        duration?: number;
        image?: string;
        tips?: string;
    }>;
    tags?: string[];
    estimatedCost?: number;
    calories?: number;
    isActive: boolean;
    isFeatured: boolean;
}

export interface AdminVoucher {
    _id: string;
    code: string;
    type: 'percentage' | 'freeship';
    discountPercent?: number;
    quantity: number;
    usedCount: number;
    remainingQuantity: number;
    description?: string;
    isActive: boolean;
    isFixed: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface AdminVoucherPayload {
    code: string;
    quantity: number;
    discountPercent: number;
    description?: string;
    isActive: boolean;
}

export const getDashboardStats = async () => {
    const res = await axios.get(`${API_BASE_URL}/admin/dashboard`, {
        headers: getAuthHeader(),
    });
    return res.data;
};

export const adminGetAllProducts = async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
}) => {
    const res = await axios.get(`${API_BASE_URL}/products`, {
        params: { ...params, limit: params?.limit || 20 },
        headers: getAuthHeader(),
    });
    return res.data;
};

export const adminGetProductById = async (id: string) => {
    const res = await axios.get(`${API_BASE_URL}/products/${id}`, {
        headers: getAuthHeader(),
    });
    return res.data;
};

export const adminCreateProduct = async (data: Record<string, any>) => {
    const res = await axios.post(`${API_BASE_URL}/products`, data, {
        headers: getAuthHeader(),
    });
    return res.data;
};

export const adminUpdateProduct = async (id: string, data: Record<string, any>) => {
    const res = await axios.put(`${API_BASE_URL}/products/${id}`, data, {
        headers: getAuthHeader(),
    });
    return res.data;
};

export const adminDeleteProduct = async (id: string) => {
    const res = await axios.delete(`${API_BASE_URL}/products/${id}`, {
        headers: getAuthHeader(),
    });
    return res.data;
};

export const uploadImage = async (base64: string) => {
    const res = await axios.post(
        `${API_BASE_URL}/admin/upload`,
        { image: base64 },
        { headers: getAuthHeader() }
    );
    return res.data;
};

export const adminGetAllRecipes = async (params?: AdminRecipeFilters) => {
    const res = await axios.get(`${API_BASE_URL}/admin/recipes`, {
        params,
        headers: getAuthHeader(),
    });
    return res.data;
};

export const adminGetRecipeById = async (id: string) => {
    const res = await axios.get(`${API_BASE_URL}/admin/recipes/${id}`, {
        headers: getAuthHeader(),
    });
    return res.data;
};

export const adminCreateRecipe = async (data: AdminRecipePayload) => {
    const res = await axios.post(`${API_BASE_URL}/admin/recipes`, data, {
        headers: getAuthHeader(),
    });
    return res.data;
};

export const adminUpdateRecipe = async (id: string, data: AdminRecipePayload) => {
    const res = await axios.put(`${API_BASE_URL}/admin/recipes/${id}`, data, {
        headers: getAuthHeader(),
    });
    return res.data;
};

export const adminDeleteRecipe = async (id: string) => {
    const res = await axios.delete(`${API_BASE_URL}/admin/recipes/${id}`, {
        headers: getAuthHeader(),
    });
    return res.data;
};

export const adminGetAllVouchers = async () => {
    const res = await axios.get(`${API_BASE_URL}/admin/vouchers`, {
        headers: getAuthHeader(),
    });
    return res.data;
};

export const adminCreateVoucher = async (data: AdminVoucherPayload) => {
    const res = await axios.post(`${API_BASE_URL}/admin/vouchers`, data, {
        headers: getAuthHeader(),
    });
    return res.data;
};

export const adminUpdateVoucher = async (id: string, data: AdminVoucherPayload) => {
    const res = await axios.put(`${API_BASE_URL}/admin/vouchers/${id}`, data, {
        headers: getAuthHeader(),
    });
    return res.data;
};

export const adminDeleteVoucher = async (id: string) => {
    const res = await axios.delete(`${API_BASE_URL}/admin/vouchers/${id}`, {
        headers: getAuthHeader(),
    });
    return res.data;
};

export const adminGetAllOrders = async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
}) => {
    const res = await axios.get(`${API_BASE_URL}/admin/orders`, {
        params,
        headers: getAuthHeader(),
    });
    return res.data;
};

export const adminGetOrderDetail = async (id: string) => {
    const res = await axios.get(`${API_BASE_URL}/admin/orders/${id}`, {
        headers: getAuthHeader(),
    });
    return res.data;
};

export const adminUpdateOrderStatus = async (id: string, status: string, note?: string) => {
    const res = await axios.put(
        `${API_BASE_URL}/admin/orders/${id}/status`,
        { status, note },
        { headers: getAuthHeader() }
    );
    return res.data;
};

export const adminGetAllUsers = async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
}) => {
    const res = await axios.get(`${API_BASE_URL}/admin/users`, {
        params,
        headers: getAuthHeader(),
    });
    return res.data;
};

export const adminToggleUserActive = async (id: string) => {
    const res = await axios.put(
        `${API_BASE_URL}/admin/users/${id}/toggle`,
        {},
        {
            headers: getAuthHeader(),
        }
    );
    return res.data;
};

export const getCategories = async () => {
    const res = await axios.get(`${API_BASE_URL}/categories`, {
        headers: getAuthHeader(),
    });
    return res.data;
};
