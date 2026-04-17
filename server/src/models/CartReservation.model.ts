import mongoose, { Schema, Document } from 'mongoose';

// ═══════════════════════════════════════════════════════════════
// TYPESCRIPT INTERFACE
// ═══════════════════════════════════════════════════════════════

export interface ICartReservation extends Document {
    userId: mongoose.Types.ObjectId;
    productId: mongoose.Types.ObjectId;
    quantity: number;
    expiresAt: Date;
    createdAt: Date;
}

// ═══════════════════════════════════════════════════════════════
// MONGOOSE SCHEMA
// ═══════════════════════════════════════════════════════════════

const CartReservationSchema = new Schema<ICartReservation>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        productId: {
            type: Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
            index: true,
        },
        quantity: {
            type: Number,
            required: true,
            min: 1,
        },
        expiresAt: {
            type: Date,
            required: true,
            index: true, // TTL index
        },
    },
    {
        timestamps: true,
    }
);

// ═══════════════════════════════════════════════════════════════
// INDEXES
// ═══════════════════════════════════════════════════════════════

// TTL index: Auto-delete documents after expiresAt
CartReservationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Compound index for user + product queries
CartReservationSchema.index({ userId: 1, productId: 1 });

// ═══════════════════════════════════════════════════════════════
// MODEL
// ═══════════════════════════════════════════════════════════════

export const CartReservation = mongoose.model<ICartReservation>(
    'CartReservation',
    CartReservationSchema
);
