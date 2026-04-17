import { Request, Response } from 'express';
import { CartReservation } from '../models/CartReservation.model.js';
import { Product } from '../models/Product.model.js';
import { z } from 'zod';

// ═══════════════════════════════════════════════════════════════
// VALIDATION SCHEMAS
// ═══════════════════════════════════════════════════════════════

const reserveStockSchema = z.object({
    productId: z.string(),
    quantity: z.number().int().positive('Quantity must be positive'),
});

const RESERVATION_TTL_MS = 15 * 60 * 1000; // 15 minutes

// ═══════════════════════════════════════════════════════════════
// CONTROLLERS
// ═══════════════════════════════════════════════════════════════

/**
 * POST /api/cart/reserve
 * Reserve stock for a product (15 minutes)
 */
export const reserveStock = async (req: Request, res: Response) => {
    try {
        const validated = reserveStockSchema.parse(req.body);
        const userId = req.user!.userId;

        // Check if product exists and has enough stock
        const product = await Product.findById(validated.productId);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Calculate total reserved quantity for this product
        const existingReservations = await CartReservation.find({
            productId: validated.productId,
        });
        const totalReserved = existingReservations.reduce(
            (sum, r) => sum + r.quantity,
            0
        );

        // Check if enough stock available
        const availableStock = product.stockQuantity - totalReserved;
        if (availableStock < validated.quantity) {
            return res.status(400).json({
                error: `Not enough stock. Available: ${availableStock}, Requested: ${validated.quantity}`,
            });
        }

        // Check if user already has a reservation for this product
        const existingUserReservation = await CartReservation.findOne({
            userId,
            productId: validated.productId,
        });

        if (existingUserReservation) {
            // Update existing reservation (extend time + update quantity)
            existingUserReservation.quantity = validated.quantity;
            existingUserReservation.expiresAt = new Date(Date.now() + RESERVATION_TTL_MS);
            await existingUserReservation.save();

            return res.json({
                reservation: existingUserReservation,
                expiresAt: existingUserReservation.expiresAt,
            });
        }

        // Create new reservation
        const reservation = await CartReservation.create({
            userId,
            productId: validated.productId,
            quantity: validated.quantity,
            expiresAt: new Date(Date.now() + RESERVATION_TTL_MS),
        });

        res.status(201).json({
            reservation,
            expiresAt: reservation.expiresAt,
        });
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors[0].message });
        }
        console.error('Reserve stock error:', error);
        res.status(500).json({ error: 'Failed to reserve stock' });
    }
};

/**
 * DELETE /api/cart/reserve/:productId
 * Release stock for a product
 */
export const releaseStock = async (req: Request, res: Response) => {
    try {
        const userId = req.user!.userId;

        const result = await CartReservation.findOneAndDelete({
            userId,
            productId: req.params.productId,
        });

        if (!result) {
            return res.status(404).json({ error: 'Reservation not found' });
        }

        res.json({ message: 'Stock released successfully' });
    } catch (error: any) {
        console.error('Release stock error:', error);
        res.status(500).json({ error: 'Failed to release stock' });
    }
};

/**
 * GET /api/cart/reservations
 * Get current user's cart reservations
 */
export const getMyReservations = async (req: Request, res: Response) => {
    try {
        const userId = req.user!.userId;

        const reservations = await CartReservation.find({ userId }).populate(
            'productId',
            'name price images unit'
        );

        res.json({ reservations });
    } catch (error: any) {
        console.error('Get reservations error:', error);
        res.status(500).json({ error: 'Failed to fetch reservations' });
    }
};

/**
 * POST /api/cart/validate
 * Validate cart before checkout (final stock check)
 */
export const validateCart = async (req: Request, res: Response) => {
    try {
        const userId = req.user!.userId;

        const reservations = await CartReservation.find({ userId }).populate('productId');

        const errors: any[] = [];
        let totalPerishableWeight = 0;

        for (const reservation of reservations) {
            const product: any = reservation.productId;

            if (!product || !product.isActive) {
                errors.push({
                    productId: reservation.productId,
                    error: 'Product not available',
                });
                continue;
            }

            // Calculate perishable weight
            if (product.storageType === 'ngăn mát' || product.storageType === 'ngăn đông') {
                let itemWeightKg = 0;
                if (product.unit === 'kg') {
                    itemWeightKg = (product.weightValue || 1) * reservation.quantity;
                } else if (product.unit === 'gram') {
                    itemWeightKg = ((product.weightValue || 100) / 1000) * reservation.quantity;
                } else {
                    itemWeightKg = (product.weightValue || 0) * reservation.quantity;
                }
                totalPerishableWeight += itemWeightKg;
            }

            // Calculate total reserved for this product (excluding current user)
            const otherReservations = await CartReservation.find({
                productId: product._id,
                userId: { $ne: userId },
            });
            const otherReserved = otherReservations.reduce((sum, r) => sum + r.quantity, 0);

            const availableForUser = product.stockQuantity - otherReserved;

            if (availableForUser < reservation.quantity) {
                errors.push({
                    productId: product._id,
                    productName: product.name,
                    requested: reservation.quantity,
                    available: availableForUser,
                    error: 'Insufficient stock',
                });
            }
        }

        if (errors.length > 0) {
            return res.status(400).json({
                error: 'Cart validation failed',
                errors,
            });
        }

        const requiresWholesaleContact = totalPerishableWeight > 50;

        res.json({ 
            message: 'Cart is valid', 
            reservations, 
            requiresWholesaleContact,
            totalPerishableWeight
        });
    } catch (error: any) {
        console.error('Validate cart error:', error);
        res.status(500).json({ error: 'Failed to validate cart' });
    }
};
