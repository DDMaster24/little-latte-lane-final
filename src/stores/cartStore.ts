import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'sonner';

interface CartItemCustomization {
  // Legacy customization format
  variant?: {
    name: string;
    price: number;
    size: string;
  };
  addons?: {
    name: string;
    price: number;
  }[];
  // Pizza customization format
  pizzaType?: string;
  size?: string;
  toppings?: string[];
  basePrice?: number;
  toppingsPrice?: number;
  // General customization
  selectedToppings?: string[];
  toppingsTotal?: number;
  // Flag to identify customized items
  isCustomized?: boolean;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  description?: string;
  customization?: CartItemCustomization;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  updateQuantity: (id: string, quantity: number) => void;
  total: () => number;
  loadOrderToCart: (orderItems: CartItem[]) => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) =>
        set((state) => {
          // For customized items, always add as new item (don't merge)
          if (item.customization) {
            toast.success(`${item.name} added to cart!`, {
              description: item.customization.isCustomized ? 'With custom options' : undefined,
              duration: 2000,
            });
            return { items: [...state.items, item] };
          }

          // For regular items, merge if same ID
          const existing = state.items.find(
            (i) => i.id === item.id && !i.customization
          );
          if (existing) {
            toast.success(`${item.name} quantity updated!`, {
              description: `Now ${existing.quantity + item.quantity} in cart`,
              duration: 2000,
            });
            return {
              items: state.items.map((i) =>
                i.id === item.id && !i.customization
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              ),
            };
          }
          
          toast.success(`${item.name} added to cart!`, {
            description: `R${item.price.toFixed(2)}`,
            duration: 2000,
          });
          return { items: [...state.items, item] };
        }),

      removeItem: (id) =>
        set((state) => {
          const item = state.items.find(i => i.id === id);
          if (item) {
            toast.info(`${item.name} removed from cart`, {
              duration: 2000,
            });
          }
          return {
            items: state.items.filter((i) => i.id !== id),
          };
        }),

      clearCart: () => {
        const itemCount = get().items.length;
        if (itemCount > 0) {
          toast.success(`Cart cleared! ${itemCount} items removed`, {
            duration: 2000,
          });
        }
        set({ items: [] });
      },

      updateQuantity: (id, quantity) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id ? { ...i, quantity: Math.max(1, quantity) } : i
          ),
        })),

      total: () => {
        return get().items.reduce(
          (acc, item) => acc + item.price * item.quantity,
          0
        );
      },

      loadOrderToCart: (orderItems) => {
        const itemCount = orderItems.length;
        toast.success(`Order loaded to cart! ${itemCount} items added`, {
          duration: 3000,
        });
        set({ items: orderItems });
      },
    }),
    {
      name: 'little-latte-cart',
      // Only persist essential cart data, exclude functions
      partialize: (state) => ({ items: state.items }),
      // Version for cache invalidation if needed
      version: 1,
    }
  )
);

export type { CartItem, CartItemCustomization };
