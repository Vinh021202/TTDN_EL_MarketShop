import { Router } from 'express';
import {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
} from '../controllers/category.controller.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';

const router = Router();

// ═══════════════════════════════════════════════════════════════
// PUBLIC ROUTES
// ═══════════════════════════════════════════════════════════════

router.get('/', getAllCategories);
router.get('/:id', getCategoryById);

// ═══════════════════════════════════════════════════════════════
// ADMIN ROUTES
// ═══════════════════════════════════════════════════════════════

router.post('/', authenticate, authorize('admin' as any, 'superadmin' as any), createCategory);
router.put('/:id', authenticate, authorize('admin' as any, 'superadmin' as any), updateCategory);
router.delete('/:id', authenticate, authorize('admin' as any, 'superadmin' as any), deleteCategory);

export default router;
