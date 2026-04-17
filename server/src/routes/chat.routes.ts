import { Router, Request, Response, NextFunction } from 'express';
import { sendMessage, getChatHistory } from '../controllers/chat.controller.js';
import { verifyToken } from '../utils/jwt.js';

const router = Router();

/**
 * optionalAuth – Không bắt buộc login.
 * Nếu có Bearer token hợp lệ → gán req.user.
 * Nếu không có hoặc token lỗi → tiếp tục mà không bị block.
 */
const optionalAuth = (req: Request, _res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader?.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            req.user = verifyToken(token);
        }
    } catch {
        // Silent fail – no token or invalid token is fine for chat
    }
    next();
};

// POST /api/chat/message – Public (no auth required)
router.post('/message', optionalAuth, sendMessage);

// GET /api/chat/history/:sessionId
router.get('/history/:sessionId', getChatHistory);

export default router;
