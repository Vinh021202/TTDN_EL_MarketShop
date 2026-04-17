import mongoose, { Document, Schema } from 'mongoose';

export enum VoucherType {
    PERCENTAGE = 'percentage',
    FREESHIP = 'freeship',
}

export interface IVoucher extends Document {
    code: string;
    type: VoucherType;
    discountPercent?: number;
    quantity: number;
    usedCount: number;
    description?: string;
    isActive: boolean;
    isFixed: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const voucherSchema = new Schema<IVoucher>(
    {
        code: {
            type: String,
            required: [true, 'Voucher code is required'],
            unique: true,
            trim: true,
            uppercase: true,
            maxlength: [40, 'Voucher code cannot exceed 40 characters'],
        },
        type: {
            type: String,
            enum: Object.values(VoucherType),
            default: VoucherType.PERCENTAGE,
        },
        discountPercent: {
            type: Number,
            min: [1, 'Discount percent must be at least 1'],
            max: [100, 'Discount percent cannot exceed 100'],
        },
        quantity: {
            type: Number,
            required: [true, 'Voucher quantity is required'],
            min: [1, 'Voucher quantity must be at least 1'],
        },
        usedCount: {
            type: Number,
            default: 0,
            min: [0, 'Used count cannot be negative'],
        },
        description: {
            type: String,
            trim: true,
            maxlength: [300, 'Description cannot exceed 300 characters'],
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        isFixed: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

voucherSchema.virtual('remainingQuantity').get(function () {
    return Math.max(0, (this.quantity || 0) - (this.usedCount || 0));
});

voucherSchema.pre('validate', function (next) {
    if (typeof this.code === 'string') {
        this.code = this.code.trim().toUpperCase();
    }

    if (this.type === VoucherType.FREESHIP) {
        this.discountPercent = undefined;
    }

    next();
});

voucherSchema.index({ code: 1 }, { unique: true });
voucherSchema.index({ isActive: 1, isFixed: -1 });

export const Voucher = mongoose.model<IVoucher>('Voucher', voucherSchema);
