import { apiClient } from '@/features/shared/api/apiClient';

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// TYPES
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

export interface ProductImage {
    url: string;
    publicId?: string;
    alt?: string;
    isPrimary: boolean;
}

export interface Product {
    _id: string;
    name: string;
    slug: string;
    description: string;
    price: number;
    stockQuantity: number; // Changed from 'stock'
    unit: string;
    sku?: string;
    category: {
        _id: string;
        name: string;
        slug: string;
    };
    images: ProductImage[]; // Changed from string[]
    tags?: string[];
    origin?: string;
    storageType?: string;
    expiryDate?: string;
    manufacturingDate?: string;
    isNearExpiry?: boolean;
    isFeatured?: boolean;
    isActive?: boolean;
    soldCount?: number;
    viewCount?: number;
    createdAt: string;
    updatedAt?: string;
}

export interface ProductsResponse {
    products: Product[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export interface ProductFilters {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    unit?: string;
    tags?: string;
    search?: string;
    sort?: 'price_asc' | 'price_desc' | 'name' | 'newest';
    page?: number;
    limit?: number;
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// API FUNCTIONS
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

/**
 * Get products with filters
 */
export const getProducts = async (filters?: ProductFilters): Promise<ProductsResponse> => {
    const response = await apiClient.get<ProductsResponse>('/products', {
        params: filters,
    });
    return response.data;
};

/**
 * Get product by ID
 */
export const getProductById = async (id: string): Promise<{ product: Product }> => {
    const response = await apiClient.get<{ product: Product }>(`/products/${id}`);
    return response.data;
};

/**
 * Search products
 */
export const searchProducts = async (query: string): Promise<ProductsResponse> => {
    return getProducts({ search: query });
};

