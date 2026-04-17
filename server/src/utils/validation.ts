import { z } from 'zod';

// ═══════════════════════════════════════════════════════════════
// PASSWORD VALIDATION
// ═══════════════════════════════════════════════════════════════

export const passwordSchema = z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number');

/**
 * Validate password strength
 */
export const validatePassword = (password: string): { valid: boolean; errors: string[] } => {
    const result = passwordSchema.safeParse(password);

    if (result.success) {
        return { valid: true, errors: [] };
    }

    return {
        valid: false,
        errors: result.error.errors.map((e) => e.message),
    };
};

// ═══════════════════════════════════════════════════════════════
// EMAIL VALIDATION
// ═══════════════════════════════════════════════════════════════

export const emailSchema = z.string().email('Invalid email address');

/**
 * Validate email format
 */
export const validateEmail = (email: string): boolean => {
    return emailSchema.safeParse(email).success;
};

// ═══════════════════════════════════════════════════════════════
// AUTH SCHEMAS
// ═══════════════════════════════════════════════════════════════

export const registerSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: emailSchema,
    password: passwordSchema,
});

export const loginSchema = z.object({
    email: emailSchema,
    password: z.string().min(1, 'Password is required'),
});
