import { apiClient } from '@/features/shared/api/apiClient';

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// TYPES
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

export interface CreateOrderRequest {
    items: {
        product: string;
        quantity: number;
        price: number;
    }[];
    shippingAddress: {
        fullName: string;
        phone: string;
        address: string;
        ward: string;
        district: string;
        province: string;
    };
    deliverySlot: '08:00-12:00' | '14:00-18:00';
    paymentMethod: 'COD' | 'BANK_TRANSFER';
}

export interface Order {
    _id: string;
    orderNumber: string;
    user: string;
    items: {
        product: any;
        name: string;
        quantity: number;
        price: number;
        subtotal: number;
    }[];
    shippingAddress: {
        fullName: string;
        phone: string;
        street: string;
        ward?: string;
        district: string;
        city: string;
    };
    deliverySlot: string;
    paymentMethod: string;
    orderStatus: string;
    paymentStatus: string;
    subtotal: number;
    shippingFee: number;
    total: number;
    timeline: {
        status: string;
        timestamp: string;
        note?: string;
    }[];
    createdAt: string;
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// API FUNCTIONS
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

/**
 * Create new order
 */
export const createOrder = async (data: CreateOrderRequest): Promise<{ order: Order; checkoutUrl?: string }> => {
    const response = await apiClient.post<{ order: Order; checkoutUrl?: string }>('/orders', data);
    return response.data;
};

/**
 * Get my orders
 */
export const getMyOrders = async (): Promise<{ orders: Order[] }> => {
    const response = await apiClient.get<{ orders: Order[] }>('/orders');
    return response.data;
};

/**
 * Get order by ID
 */
export const getOrderById = async (id: string): Promise<{ order: Order }> => {
    const response = await apiClient.get<{ order: Order }>(`/orders/${id}`);
    return response.data;
};

/**
 * Cancel order
 */
export const cancelOrder = async (id: string): Promise<{ message: string; order: Order }> => {
    const response = await apiClient.post<{ message: string; order: Order }>(`/orders/${id}/cancel`);
    return response.data;
};

