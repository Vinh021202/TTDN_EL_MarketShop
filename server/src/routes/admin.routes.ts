import { Router } from 'express';
import {
    getDashboardStats,
    getAllOrders,
    updateOrderStatus,
    getOrderDetail,
    getAllUsers,
    toggleUserActive,
    uploadImage,
} from '../controllers/admin.controller.js';
import {
    createAdminRecipe,
    deleteAdminRecipe,
    getAdminRecipeById,
    getAllAdminRecipes,
    updateAdminRecipe,
} from '../controllers/adminRecipe.controller.js';
import {
    createAdminVoucher,
    deleteAdminVoucher,
    getAllAdminVouchers,
    updateAdminVoucher,
} from '../controllers/adminVoucher.controller.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
import { UserRole } from '../models/index.js';

const router = Router();

// ═══════════════════════════════════════════════════════════════
// ALL ADMIN ROUTES REQUIRE AUTHENTICATION + ADMIN ROLE
// ═══════════════════════════════════════════════════════════════

router.use(authenticate);
router.use(authorize(UserRole.ADMIN, UserRole.SUPERADMIN));

// Dashboard
router.get('/dashboard', getDashboardStats);

// Order management
router.get('/orders', getAllOrders);
router.get('/orders/:id', getOrderDetail);
router.put('/orders/:id/status', updateOrderStatus);

// User management
router.get('/users', getAllUsers);
router.put('/users/:id/toggle', toggleUserActive);

// Recipe management
router.get('/recipes', getAllAdminRecipes);
router.get('/recipes/:id', getAdminRecipeById);
router.post('/recipes', createAdminRecipe);
router.put('/recipes/:id', updateAdminRecipe);
router.delete('/recipes/:id', deleteAdminRecipe);

// Voucher management
router.get('/vouchers', getAllAdminVouchers);
router.post('/vouchers', createAdminVoucher);
router.put('/vouchers/:id', updateAdminVoucher);
router.delete('/vouchers/:id', deleteAdminVoucher);

// Image upload
router.post('/upload', uploadImage);

export default router;
