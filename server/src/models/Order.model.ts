import mongoose, { Schema, Document } from 'mongoose';

// ═══════════════════════════════════════════════════════════════
// ENUMS
// ═══════════════════════════════════════════════════════════════

export enum OrderStatus {
    PENDING = 'pending', // Chờ xác nhận
    CONFIRMED = 'confirmed', // Đã xác nhận
    PREPARING = 'preparing', // Đang nhặt hàng/chuẩn bị
    SHIPPING = 'shipping', // Đang giao
    COMPLETED = 'completed', // Giao thành công
    CANCELLED = 'cancelled', // Hủy
}

export enum PaymentMethod {
    COD = 'cod', // Cash on Delivery
    BANK_TRANSFER = 'bank_transfer', // SePay
}

export enum PaymentStatus {
    PENDING = 'pending',
    PAID = 'paid',
    FAILED = 'failed',
    REFUNDED = 'refunded',
}

// ═══════════════════════════════════════════════════════════════
// INTERFACES
// ═══════════════════════════════════════════════════════════════

export interface IOrderItem {
    product: mongoose.Types.ObjectId;
    name: string; // Snapshot
    price: number; // Snapshot
    quantity: number;
    subtotal: number;
}

export interface IOrderAddress {
    fullName: string;
    phone: string;
    street: string;
    ward?: string;
    district: string;
    city: string;
}

export interface IOrderTimeline {
    status: OrderStatus;
    timestamp: Date;
    note?: string;
}

export interface IOrder extends Document {
    orderNumber: string;
    user: mongoose.Types.ObjectId;
    items: IOrderItem[];
    shippingAddress: IOrderAddress;
    deliverySlot: string;
    paymentMethod: PaymentMethod;
    paymentStatus: PaymentStatus;
    orderStatus: OrderStatus;
    subtotal: number;
    shippingFee: number;
    discount: number;
    total: number;
    notes?: string;
    sepayTransactionId?: string;
    timeline: IOrderTimeline[];
    reservationExpiresAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

// ═══════════════════════════════════════════════════════════════
// SCHEMA
// ═══════════════════════════════════════════════════════════════

const orderItemSchema = new Schema<IOrderItem>(
    {
        product: {
            type: Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
        quantity: {
            type: Number,
            required: true,
            min: [1, 'Quantity must be at least 1'],
        },
        subtotal: {
            type: Number,
            required: true,
        },
    },
    { _id: false }
);

const orderAddressSchema = new Schema<IOrderAddress>(
    {
        fullName: { type: String, required: true },
        phone: { type: String, required: true },
        street: { type: String, required: true },
        ward: { type: String },
        district: { type: String, required: true },
        city: { type: String, required: true },
    },
    { _id: false }
);

const orderTimelineSchema = new Schema<IOrderTimeline>(
    {
        status: {
            type: String,
            enum: Object.values(OrderStatus),
            required: true,
        },
        timestamp: {
            type: Date,
            default: Date.now,
        },
        note: {
            type: String,
        },
    },
    { _id: false }
);

const orderSchema = new Schema<IOrder>(
    {
        orderNumber: {
            type: String,
            required: true,
            unique: true,
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        items: [orderItemSchema],
        shippingAddress: {
            type: orderAddressSchema,
            required: true,
        },
        deliverySlot: {
            type: String,
            enum: ['08:00-12:00', '14:00-18:00'],
            required: true,
        },
        paymentMethod: {
            type: String,
            enum: Object.values(PaymentMethod),
            required: true,
        },
        paymentStatus: {
            type: String,
            enum: Object.values(PaymentStatus),
            default: PaymentStatus.PENDING,
        },
        orderStatus: {
            type: String,
            enum: Object.values(OrderStatus),
            default: OrderStatus.PENDING,
        },
        // All monetary values stored as INTEGER (VND)
        subtotal: {
            type: Number,
            required: true,
            validate: {
                validator: Number.isInteger,
                message: 'Subtotal must be an integer (VND)',
            },
        },
        shippingFee: {
            type: Number,
            default: 0,
            validate: {
                validator: Number.isInteger,
                message: 'Shipping fee must be an integer (VND)',
            },
        },
        discount: {
            type: Number,
            default: 0,
            validate: {
                validator: Number.isInteger,
                message: 'Discount must be an integer (VND)',
            },
        },
        total: {
            type: Number,
            required: true,
            validate: {
                validator: Number.isInteger,
                message: 'Total must be an integer (VND)',
            },
        },
        notes: {
            type: String,
            maxlength: [500, 'Notes cannot exceed 500 characters'],
        },
        sepayTransactionId: {
            type: String,
        },
        timeline: [orderTimelineSchema],
        // Cart reservation expires after 15 minutes (ECOMMERCE-SPECS rule)
        reservationExpiresAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

// ═══════════════════════════════════════════════════════════════
// MIDDLEWARE
// ═══════════════════════════════════════════════════════════════

// Generate order number before validation
orderSchema.pre('validate', async function (next) {
    if (!this.orderNumber) {
        const date = new Date();
        const datePart = date.toISOString().slice(0, 10).replace(/-/g, '');
        const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
        this.orderNumber = `DH${datePart}${randomPart}`;
    }

    // Add initial timeline entry
    if (this.timeline.length === 0) {
        this.timeline.push({
            status: OrderStatus.PENDING,
            timestamp: new Date(),
        });
    }

    next();
});

// ═══════════════════════════════════════════════════════════════
// INDEXES
// ═══════════════════════════════════════════════════════════════

orderSchema.index({ orderNumber: 1 });
orderSchema.index({ user: 1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ reservationExpiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

// ═══════════════════════════════════════════════════════════════
// MODEL
// ═══════════════════════════════════════════════════════════════

export const Order = mongoose.model<IOrder>('Order', orderSchema);
