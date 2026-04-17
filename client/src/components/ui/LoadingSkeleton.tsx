import { motion } from 'framer-motion';

// ═══════════════════════════════════════════════════════════════
// LOADING SKELETON COMPONENT
// Reusable skeleton placeholders for content loading states
// ═══════════════════════════════════════════════════════════════

interface SkeletonProps {
    className?: string;
    animate?: boolean;
}

/**
 * Base skeleton block
 */
export const Skeleton = ({ className = '', animate = true }: SkeletonProps) => (
    <div className={`skeleton ${animate ? '' : 'after:hidden'} ${className}`} />
);

/**
 * Product card skeleton for grid loading state
 */
export const ProductCardSkeleton = () => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden"
    >
        {/* Image placeholder */}
        <div className="skeleton-image" />

        {/* Content */}
        <div className="p-4 space-y-3">
            {/* Category */}
            <Skeleton className="h-3 w-16" />
            {/* Name */}
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-3/4" />
            {/* Price */}
            <Skeleton className="h-7 w-24" />
            {/* Stock */}
            <Skeleton className="h-3 w-20" />
            {/* Button */}
            <Skeleton className="h-10 w-full rounded-xl" />
        </div>
    </motion.div>
);

/**
 * Product grid skeleton - renders multiple card skeletons
 */
export const ProductGridSkeleton = ({ count = 8 }: { count?: number }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: count }).map((_, i) => (
            <ProductCardSkeleton key={i} />
        ))}
    </div>
);

/**
 * Product detail skeleton
 */
export const ProductDetailSkeleton = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image */}
        <div className="skeleton-image rounded-2xl" />

        {/* Info */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 space-y-4">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-10 w-32" />
            <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/6" />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-16 rounded-xl" />
                <Skeleton className="h-16 rounded-xl" />
            </div>
            <Skeleton className="h-12 w-full rounded-xl" />
        </div>
    </div>
);

/**
 * Profile page skeleton
 */
export const ProfileSkeleton = () => (
    <div className="max-w-2xl mx-auto space-y-6">
        {/* Avatar */}
        <div className="flex items-center gap-4">
            <Skeleton className="h-20 w-20 rounded-full" />
            <div className="space-y-2 flex-1">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-56" />
            </div>
        </div>
        {/* Form fields */}
        <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-12 w-full rounded-xl" />
                </div>
            ))}
        </div>
        <Skeleton className="h-12 w-full rounded-xl" />
    </div>
);
