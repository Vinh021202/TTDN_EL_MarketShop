import { forwardRef, ButtonHTMLAttributes, ReactNode } from 'react';
import { motion, MotionProps } from 'framer-motion';
import { Loader2 } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps
    extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof MotionProps> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    loading?: boolean;
    fullWidth?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    children?: ReactNode;
}

// ═══════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════

const baseStyles = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';

const variantStyles: Record<ButtonVariant, string> = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 shadow-lg shadow-primary-500/30',
    secondary: 'bg-gray-700 text-white hover:bg-gray-600 active:bg-gray-800',
    outline: 'border-2 border-primary-500 text-primary-500 hover:bg-primary-500/10 active:bg-primary-500/20',
    ghost: 'text-gray-300 hover:bg-white/10 active:bg-white/20',
    danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-lg shadow-red-500/30',
};

const sizeStyles: Record<ButtonSize, string> = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
};

// ═══════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            variant = 'primary',
            size = 'md',
            loading = false,
            fullWidth = false,
            leftIcon,
            rightIcon,
            children,
            disabled,
            className = '',
            ...props
        },
        ref
    ) => {
        const styles = [
            baseStyles,
            variantStyles[variant],
            sizeStyles[size],
            fullWidth ? 'w-full' : '',
            className,
        ].join(' ');

        return (
            <motion.button
                ref={ref}
                disabled={disabled || loading}
                className={styles}
                whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
                whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
                {...props}
            >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {!loading && leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
                {children}
                {!loading && rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
            </motion.button>
        );
    }
);

Button.displayName = 'Button';
