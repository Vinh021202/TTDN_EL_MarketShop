import { HTMLAttributes, forwardRef, ReactNode } from 'react';
import { motion, MotionProps } from 'framer-motion';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export type GlassCardVariant = 'light' | 'dark';

export interface GlassCardProps
    extends Omit<HTMLAttributes<HTMLDivElement>, keyof MotionProps> {
    variant?: GlassCardVariant;
    hoverable?: boolean;
    padding?: 'none' | 'sm' | 'md' | 'lg';
    children?: ReactNode;
}

// ═══════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════

const baseStyles = 'rounded-2xl backdrop-blur-md border shadow-xl transition-all duration-200';

const variantStyles: Record<GlassCardVariant, string> = {
    light: 'bg-white/10 border-white/20 shadow-white/5',
    dark: 'bg-gray-900/75 border-white/10 shadow-black/20',
};

const paddingStyles = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
};

// ═══════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
    (
        {
            variant = 'light',
            hoverable = false,
            padding = 'md',
            className = '',
            children,
            ...props
        },
        ref
    ) => {
        const styles = [
            baseStyles,
            variantStyles[variant],
            paddingStyles[padding],
            className,
        ].join(' ');

        const hoverStyles = hoverable
            ? {
                whileHover: { scale: 1.02, y: -4 },
                whileTap: { scale: 0.98 },
            }
            : {};

        return (
            <motion.div
                ref={ref}
                className={styles}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                {...hoverStyles}
                {...props}
            >
                {children}
            </motion.div>
        );
    }
);

GlassCard.displayName = 'GlassCard';
