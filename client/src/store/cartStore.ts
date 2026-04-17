import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface CartItem {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    unit: string;
    image: string;
}

interface CartState {
    items: CartItem[];
    reservationExpiresAt: Date | null;
    subtotal: number;
}

interface CartActions {
    addItem: (item: CartItem) => void;
    removeItem: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
    setReservationExpiry: (expiresAt: Date) => void;
    calculateSubtotal: () => void;
}

export type CartStore = CartState & CartActions;

// ═══════════════════════════════════════════════════════════════
// STORE
// ═══════════════════════════════════════════════════════════════

export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            // State
            items: [],
            reservationExpiresAt: null,
            subtotal: 0,

            // Actions
            addItem: (item) => {
                const existingItem = get().items.find((i) => i.productId === item.productId);

                if (existingItem) {
                    // Update quantity
                    set({
                        items: get().items.map((i) =>
                            i.productId === item.productId ? { ...i, quantity: item.quantity } : i
                        ),
                    });
                } else {
                    // Add new item
                    set({ items: [...get().items, item] });
                }

                get().calculateSubtotal();
            },

            removeItem: (productId) => {
                set({
                    items: get().items.filter((i) => i.productId !== productId),
                });
                get().calculateSubtotal();
            },

            updateQuantity: (productId, quantity) => {
                if (quantity <= 0) {
                    get().removeItem(productId);
                    return;
                }

                set({
                    items: get().items.map((i) =>
                        i.productId === productId ? { ...i, quantity } : i
                    ),
                });
                get().calculateSubtotal();
            },

            clearCart: () => {
                set({
                    items: [],
                    reservationExpiresAt: null,
                    subtotal: 0,
                });
            },

            setReservationExpiry: (expiresAt) => {
                set({ reservationExpiresAt: expiresAt });
            },

            calculateSubtotal: () => {
                const subtotal = get().items.reduce(
                    (sum, item) => sum + item.price * item.quantity,
                    0
                );
                set({ subtotal });
            },
        }),
        {
            name: 'cart-storage',
            partialize: (state) => ({
                items: state.items,
                reservationExpiresAt: state.reservationExpiresAt,
                subtotal: state.subtotal,
            }),
        }
    )
);
