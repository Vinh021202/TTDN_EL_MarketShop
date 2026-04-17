import { Router } from 'express';
import {
    createOrder,
    getMyOrders,
    getOrderById,
    cancelOrder,
    handleSePayIPN,
} from '../controllers/order.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

// ═══════════════════════════════════════════════════════════════
// PUBLIC ROUTES (Webhooks)
// ═══════════════════════════════════════════════════════════════

// SePay IPN Webhook (no authentication required)
router.post('/sepay-ipn', handleSePayIPN);

// ═══════════════════════════════════════════════════════════════
// ALL ROUTES BELOW REQUIRE AUTHENTICATION
// ═══════════════════════════════════════════════════════════════

router.use(authenticate);

router.post('/', createOrder);
router.get('/', getMyOrders);
router.get('/:id', getOrderById);
router.post('/:id/cancel', cancelOrder);

export default router;
