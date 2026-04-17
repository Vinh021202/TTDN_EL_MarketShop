import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from '../utils/jwt.js';
import { UserRole } from '../models/index.js';

// ═══════════════════════════════════════════════════════════════
// EXTEND EXPRESS REQUEST TYPE
// ═══════════════════════════════════════════════════════════════

declare global {
    namespace Express {
        interface Request {
            user?: TokenPayload;
        }
    }
}

// ═══════════════════════════════════════════════════════════════
// AUTHENTICATE MIDDLEWARE
// ═══════════════════════════════════════════════════════════════

/**
 * Verify JWT token from Authorization header
 */
export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        const payload = verifyToken(token);
        req.user = payload;

        next();
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Invalid token';
        res.status(401).json({ error: message });
    }
};

// ═══════════════════════════════════════════════════════════════
// AUTHORIZE MIDDLEWARE
// ═══════════════════════════════════════════════════════════════

/**
 * Check if user has required role(s)
 */
export const authorize = (...allowedRoles: UserRole[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }

        if (!allowedRoles.includes(req.user.role)) {
            res.status(403).json({
                error: 'Forbidden',
                message: 'You do not have permission to access this resource'
            });
            return;
        }

        next();
    };
};
