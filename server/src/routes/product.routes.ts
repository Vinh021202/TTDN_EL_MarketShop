import { Router } from 'express';
import {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
} from '../controllers/product.controller.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';

const router = Router();

// ═══════════════════════════════════════════════════════════════
// PUBLIC ROUTES
// ═══════════════════════════════════════════════════════════════

router.get('/', getAllProducts);
router.get('/:id', getProductById);

// ═══════════════════════════════════════════════════════════════
// ADMIN ROUTES
// ═══════════════════════════════════════════════════════════════
// Create product (Admin only)
router.post('/', authenticate, authorize('admin' as any, 'superadmin' as any), createProduct);
// Update product (Admin only)
router.put('/:id', authenticate, authorize('admin' as any, 'superadmin' as any), updateProduct);
// Delete product (Admin only)
router.delete('/:id', authenticate, authorize('admin' as any, 'superadmin' as any), deleteProduct);

export default router;
