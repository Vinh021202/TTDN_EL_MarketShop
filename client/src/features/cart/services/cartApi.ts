import { apiClient } from '@/features/shared/api/apiClient';

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// TYPES
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

interface ReserveStockRequest {
    productId: string;
    quantity: number;
}

interface ReserveStockResponse {
    reservation: {
        userId: string;
        productId: string;
        quantity: number;
        expiresAt: string;
    };
    expiresAt: string;
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// API FUNCTIONS
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

/**
 * Reserve stock for a product (15 minutes)
 */
export const reserveStock = async (data: ReserveStockRequest): Promise<ReserveStockResponse> => {
    const response = await apiClient.post<ReserveStockResponse>('/cart/reserve', data);
    return response.data;
};

/**
 * Release stock for a product
 */
export const releaseStock = async (productId: string): Promise<void> => {
    await apiClient.delete(`/cart/reserve/${productId}`);
};

/**
 * Get my cart reservations
 */
export const getMyReservations = async (): Promise<any> => {
    const response = await apiClient.get('/cart/reservations');
    return response.data;
};

/**
 * Validate cart before checkout
 */
export const validateCart = async (): Promise<any> => {
    const response = await apiClient.post('/cart/validate');
    return response.data;
};

