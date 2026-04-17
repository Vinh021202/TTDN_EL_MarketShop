import { Router } from 'express';
import {
    reserveStock,
    releaseStock,
    getMyReservations,
    validateCart,
} from '../controllers/cart.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

// ═══════════════════════════════════════════════════════════════
// ALL ROUTES REQUIRE AUTHENTICATION
// ═══════════════════════════════════════════════════════════════

router.use(authenticate);

router.post('/reserve', reserveStock);
router.delete('/reserve/:productId', releaseStock);
router.get('/reservations', getMyReservations);
router.post('/validate', validateCart);

export default router;
