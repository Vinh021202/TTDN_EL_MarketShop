import axios from 'axios';
import crypto from 'crypto';

// ═══════════════════════════════════════════════════════════════
// SEPAY PAYMENT GATEWAY UTILITY
// ═══════════════════════════════════════════════════════════════

const SEPAY_CONFIG = {
    merchantId: process.env.SEPAY_MERCHANT_ID || '',
    secretKey: process.env.SEPAY_SECRET_KEY || '',
    apiUrl: process.env.SEPAY_API_URL || 'https://sandbox.sepay.vn/v1',
    ipnUrl: process.env.SEPAY_IPN_URL || '',
};

interface CreatePaymentParams {
    orderInvoiceNumber: string;
    amount: number;
    currency: string;
    buyerName: string;
    buyerEmail?: string;
    buyerPhone?: string;
    buyerAddress?: string;
    returnUrl: string;
    cancelUrl: string;
    notificationUrl?: string;
}

interface PaymentResponse {
    success: boolean;
    data?: {
        checkout_url: string;
        order_id: string;
    };
    error?: string;
}

/**
 * Generate signature for SePay API request
 */
function generateSignature(params: Record<string, any>): string {
    // Sort params alphabetically
    const sortedKeys = Object.keys(params).sort();
    const signatureString = sortedKeys
        .map((key) => `${key}=${params[key]}`)
        .join('&');

    // Hash with secret key
    return crypto
        .createHmac('sha256', SEPAY_CONFIG.secretKey)
        .update(signatureString)
        .digest('hex');
}

/**
 * Create SePay payment session
 */
export async function createPaymentSession(
    params: CreatePaymentParams
): Promise<PaymentResponse> {
    try {
        const payload = {
            merchant_id: SEPAY_CONFIG.merchantId,
            order_invoice_number: params.orderInvoiceNumber,
            amount: params.amount,
            currency: params.currency,
            buyer_name: params.buyerName,
            buyer_email: params.buyerEmail || '',
            buyer_phone: params.buyerPhone || '',
            buyer_address: params.buyerAddress || '',
            return_url: params.returnUrl,
            cancel_url: params.cancelUrl,
            notification_url: params.notificationUrl || SEPAY_CONFIG.ipnUrl,
        };

        // Generate signature
        const signature = generateSignature(payload);

        // Make API request
        const response = await axios.post(
            `${SEPAY_CONFIG.apiUrl}/checkout/init`,
            payload,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'X-Signature': signature,
                },
            }
        );

        return {
            success: true,
            data: response.data,
        };
    } catch (error: any) {
        console.error('SePay create payment error:', error.response?.data || error.message);
        return {
            success: false,
            error: error.response?.data?.message || 'Payment session creation failed',
        };
    }
}

/**
 * Verify webhook signature from SePay
 */
export function verifyWebhookSignature(
    payload: any,
    receivedSignature: string
): boolean {
    try {
        const calculatedSignature = generateSignature(payload);
        return calculatedSignature === receivedSignature;
    } catch (error) {
        console.error('Signature verification error:', error);
        return false;
    }
}

/**
 * Process SePay IPN notification
 */
export interface SePayIPNData {
    notification_type: string;
    order: {
        order_id: string;
        order_invoice_number: string;
        amount: number;
        currency: string;
        status: string;
        paid_at?: string;
    };
    transaction?: {
        transaction_id: string;
        bank_code: string;
        amount: number;
    };
}

export function parseIPNData(body: any): SePayIPNData | null {
    try {
        // Validate required fields
        if (!body.notification_type || !body.order) {
            return null;
        }

        return {
            notification_type: body.notification_type,
            order: body.order,
            transaction: body.transaction,
        };
    } catch (error) {
        console.error('Parse IPN data error:', error);
        return null;
    }
}
