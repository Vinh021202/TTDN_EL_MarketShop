import { ReactNode, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { create } from 'zustand';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
    id: string;
    type: ToastType;
    message: string;
    duration?: number;
}

interface ToastStore {
    toasts: Toast[];
    addToast: (toast: Omit<Toast, 'id'>) => void;
    removeToast: (id: string) => void;
}

// ═══════════════════════════════════════════════════════════════
// STORE
// ═══════════════════════════════════════════════════════════════

export const useToastStore = create<ToastStore>((set) => ({
    toasts: [],
    addToast: (toast) => {
        const id = Math.random().toString(36).substring(7);
        set((state) => ({
            toasts: [...state.toasts, { ...toast, id }],
        }));
    },
    removeToast: (id) =>
        set((state) => ({
            toasts: state.toasts.filter((t) => t.id !== id),
        })),
}));

// Helper function to easily show toasts
export const toast = {
    success: (message: string, duration?: number) =>
        useToastStore.getState().addToast({ type: 'success', message, duration }),
    error: (message: string, duration?: number) =>
        useToastStore.getState().addToast({ type: 'error', message, duration }),
    warning: (message: string, duration?: number) =>
        useToastStore.getState().addToast({ type: 'warning', message, duration }),
    info: (message: string, duration?: number) =>
        useToastStore.getState().addToast({ type: 'info', message, duration }),
};

// ═══════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════

const typeStyles: Record<ToastType, { bg: string; border: string; icon: ReactNode }> = {
    success: {
        bg: 'bg-green-500/20',
        border: 'border-green-500',
        icon: <CheckCircle className="w-5 h-5 text-green-500" />,
    },
    error: {
        bg: 'bg-red-500/20',
        border: 'border-red-500',
        icon: <AlertCircle className="w-5 h-5 text-red-500" />,
    },
    warning: {
        bg: 'bg-yellow-500/20',
        border: 'border-yellow-500',
        icon: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
    },
    info: {
        bg: 'bg-blue-500/20',
        border: 'border-blue-500',
        icon: <Info className="w-5 h-5 text-blue-500" />,
    },
};

// ═══════════════════════════════════════════════════════════════
// TOAST ITEM COMPONENT
// ═══════════════════════════════════════════════════════════════

const ToastItem = ({ toast: t }: { toast: Toast }) => {
    const removeToast = useToastStore((state) => state.removeToast);
    const styles = typeStyles[t.type];

    useEffect(() => {
        const timer = setTimeout(() => {
            removeToast(t.id);
        }, t.duration || 5000);

        return () => clearTimeout(timer);
    }, [t.id, t.duration, removeToast]);

    return (
        <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg backdrop-blur-md border-l-4 ${styles.bg} ${styles.border} shadow-lg min-w-[300px] max-w-md`}
        >
            {styles.icon}
            <p className="flex-1 text-sm text-white">{t.message}</p>
            <button
                onClick={() => removeToast(t.id)}
                className="p-1 rounded hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
            >
                <X className="w-4 h-4" />
            </button>
        </motion.div>
    );
};

// ═══════════════════════════════════════════════════════════════
// TOAST CONTAINER COMPONENT
// ═══════════════════════════════════════════════════════════════

export const ToastContainer = () => {
    const toasts = useToastStore((state) => state.toasts);

    return (
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
            <AnimatePresence>
                {toasts.map((t) => (
                    <ToastItem key={t.id} toast={t} />
                ))}
            </AnimatePresence>
        </div>
    );
};
