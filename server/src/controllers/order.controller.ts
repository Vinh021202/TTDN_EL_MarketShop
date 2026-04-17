import { Request, Response } from 'express';
import { Order } from '../models/Order.model.js';
import { CartReservation } from '../models/CartReservation.model.js';
import { Product } from '../models/Product.model.js';
import { z } from 'zod';
import { createPaymentSession, verifyWebhookSignature, parseIPNData } from '../utils/sepay.js';

// ═══════════════════════════════════════════════════════════════
// VALIDATION SCHEMAS
// ═══════════════════════════════════════════════════════════════

const createOrderSchema = z.object({
    items: z.array(
        z.object({
            product: z.string(),
            quantity: z.number().int().positive(),
            price: z.number().int().positive(),
        })
    ),
    shippingAddress: z.object({
        fullName: z.string(),
        phone: z.string(),
        address: z.string(),
        ward: z.string(),
        district: z.string(),
        province: z.string(),
    }),
    deliverySlot: z.enum(['08:00-12:00', '14:00-18:00']),
    paymentMethod: z.enum(['COD', 'BANK_TRANSFER']),
});

// ═══════════════════════════════════════════════════════════════
// CONTROLLERS
// ═══════════════════════════════════════════════════════════════

/**
 * POST /api/orders
 * Create new order
 */
export const createOrder = async (req: Request, res: Response) => {
    try {
        const validated = createOrderSchema.parse(req.body);
        const userId = req.user!.userId;

        // Map payment method to lowercase enum (model uses 'cod' / 'bank_transfer')
        const paymentMethodMap: Record<string, string> = {
            'COD': 'cod',
            'BANK_TRANSFER': 'bank_transfer',
        };
        const mappedPaymentMethod = paymentMethodMap[validated.paymentMethod] || validated.paymentMethod.toLowerCase();

        // Build order items with required fields (name, subtotal)
        const orderItems = [];
        for (const item of validated.items) {
            const product = await Product.findById(item.product);
            if (!product || !product.isActive) {
                return res.status(400).json({
                    error: `Sản phẩm không khả dụng`,
                });
            }

            if (product.stockQuantity < item.quantity) {
                return res.status(400).json({
                    error: `Không đủ tồn kho cho ${product.name}. Còn: ${product.stockQuantity}`,
                });
            }

            orderItems.push({
                product: item.product,
                name: product.name,
                price: item.price,
                quantity: item.quantity,
                subtotal: item.price * item.quantity,
            });
        }

        // Calculate totals
        const subtotal = orderItems.reduce((sum, item) => sum + item.subtotal, 0);
        const shippingFee = 30000; // Fixed 30k VND for now
        const total = subtotal + shippingFee;

        if (mappedPaymentMethod === 'cod' && total > 2000000) {
            return res.status(400).json({ error: 'Đơn hàng trên 2.000.000 VNĐ không hỗ trợ thanh toán COD. Vui lòng chọn chuyển khoản.' });
        }

        // Map shipping address fields (frontend: address/province → model: street/city)
        const shippingAddress = {
            fullName: validated.shippingAddress.fullName,
            phone: validated.shippingAddress.phone,
            street: validated.shippingAddress.address,
            ward: validated.shippingAddress.ward,
            district: validated.shippingAddress.district,
            city: validated.shippingAddress.province,
        };

        // Create order with correct field names matching Order.model.ts
        const order = await Order.create({
            user: userId,
            items: orderItems,
            shippingAddress,
            deliverySlot: validated.deliverySlot,
            paymentMethod: mappedPaymentMethod,
            subtotal,
            shippingFee,
            total,
            orderStatus: mappedPaymentMethod === 'cod' ? 'confirmed' : 'pending',
            paymentStatus: 'pending',
            timeline: [
                {
                    status: mappedPaymentMethod === 'cod' ? 'confirmed' : 'pending',
                    timestamp: new Date(),
                    note: mappedPaymentMethod === 'cod' ? 'Đơn hàng COD đã xác nhận' : 'Chờ thanh toán',
                },
            ],
        });

        // Deduct stock
        for (const item of orderItems) {
            await Product.findByIdAndUpdate(item.product, {
                $inc: { stockQuantity: -item.quantity },
            });
        }

        // Clear user's cart reservations
        await CartReservation.deleteMany({ userId });

        // If bank_transfer, create SePay payment session
        if (mappedPaymentMethod === 'bank_transfer') {
            try {
                const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

                const paymentResult = await createPaymentSession({
                    orderInvoiceNumber: order._id.toString(),
                    amount: total,
                    currency: 'VND',
                    buyerName: shippingAddress.fullName,
                    buyerPhone: shippingAddress.phone,
                    buyerAddress: `${shippingAddress.street}, ${shippingAddress.ward}, ${shippingAddress.district}, ${shippingAddress.city}`,
                    returnUrl: `${CLIENT_URL}/orders/${order._id}?payment_status=success`,
                    cancelUrl: `${CLIENT_URL}/orders/${order._id}?payment_status=cancelled`,
                });

                if (paymentResult.success && paymentResult.data) {
                    order.sepayTransactionId = paymentResult.data.order_id;
                    await order.save();

                    return res.status(201).json({
                        order,
                        checkoutUrl: paymentResult.data.checkout_url,
                    });
                }
            } catch (sepayError) {
                console.warn('SePay payment session failed, order created as pending:', sepayError);
            }

            // SePay failed but order still created — return order without checkoutUrl
            return res.status(201).json({ order });
        }

        // COD: Return order directly
        res.status(201).json({ order });
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors[0].message });
        }
        console.error('Create order error:', error);
        res.status(500).json({ error: 'Failed to create order' });
    }
};

/**
 * GET /api/orders
 * Get current user's orders
 */
export const getMyOrders = async (req: Request, res: Response) => {
    try {
        const userId = req.user!.userId;

        const orders = await Order.find({ user: userId })
            .populate('items.product', 'name images unit')
            .sort({ createdAt: -1 });

        res.json({ orders });
    } catch (error: any) {
        console.error('Get orders error:', error);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
};

/**
 * GET /api/orders/:id
 * Get order by ID
 */
export const getOrderById = async (req: Request, res: Response) => {
    try {
        const userId = req.user!.userId;

        const order = await Order.findOne({
            _id: req.params.id,
            user: userId,
        }).populate('items.product', 'name images unit');

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        res.json({ order });
    } catch (error: any) {
        console.error('Get order error:', error);
        res.status(500).json({ error: 'Failed to fetch order' });
    }
};

/**
 * POST /api/orders/sepay-ipn
 * SePay IPN Webhook Handler
 */
export const handleSePayIPN = async (req: Request, res: Response) => {
    try {
        // Parse IPN data
        const ipnData = parseIPNData(req.body);
        if (!ipnData) {
            return res.status(400).json({ error: 'Invalid IPN data' });
        }

        // Verify signature (if provided in headers)
        const signature = req.headers['x-signature'] as string;
        if (signature && !verifyWebhookSignature(req.body, signature)) {
            console.error('Invalid webhook signature');
            return res.status(400).json({ error: 'Invalid signature' });
        }

        // Handle ORDER_PAID notification
        if (ipnData.notification_type === 'ORDER_PAID') {
            const order = await Order.findById(ipnData.order.order_invoice_number);

            if (!order) {
                console.error(`Order not found: ${ipnData.order.order_invoice_number}`);
                return res.status(404).json({ error: 'Order not found' });
            }

            // Update order status
            order.orderStatus = 'confirmed' as any;
            order.paymentStatus = 'paid' as any;
            order.sepayTransactionId = ipnData.transaction?.transaction_id || ipnData.order?.order_id || 'unknown';

            order.timeline.push({
                status: 'confirmed' as any,
                timestamp: new Date(),
                note: `Payment confirmed via SePay (${ipnData.transaction?.bank_code || 'Bank Transfer'})`,
            });

            await order.save();

            console.log(`Order ${order._id} payment confirmed`);
        }

        // Return 200 to acknowledge receipt
        res.status(200).json({ success: true });
    } catch (error: any) {
        console.error('SePay IPN error:', error);
        // Still return 200 to prevent SePay from retrying
        res.status(200).json({ success: false, error: error.message });
    }
};

/**
 * POST /api/orders/:id/cancel
 * Cancel order (only if status is PENDING or CONFIRMED, not PREPARING+)
 */
export const cancelOrder = async (req: Request, res: Response) => {
    try {
        const userId = req.user!.userId;

        const order = await Order.findOne({
            _id: req.params.id,
            user: userId,
        });

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Check if cancellation is allowed
        if (!['pending', 'confirmed'].includes(order.orderStatus)) {
            return res.status(400).json({
                error: 'Không thể hủy đơn sau khi đã chuẩn bị hàng',
            });
        }

        // Update order status
        order.orderStatus = 'cancelled' as any;
        order.timeline.push({
            status: 'cancelled' as any,
            timestamp: new Date(),
            note: 'Người dùng hủy đơn',
        });
        await order.save();

        // Restore stock
        for (const item of order.items) {
            await Product.findByIdAndUpdate(item.product, {
                $inc: { stockQuantity: item.quantity },
            });
        }

        res.json({ message: 'Order cancelled successfully', order });
    } catch (error: any) {
        console.error('Cancel order error:', error);
        res.status(500).json({ error: 'Failed to cancel order' });
    }
};
