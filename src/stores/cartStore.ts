import { create } from 'zustand';

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
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],

  addItem: (item) =>
    set((state) => {
      // For customized items, always add as new item (don't merge)
      if (item.customization) {
        return { items: [...state.items, item] };
      }

      // For regular items, merge if same ID
      const existing = state.items.find(
        (i) => i.id === item.id && !i.customization
      );
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.id === item.id && !i.customization
              ? { ...i, quantity: i.quantity + item.quantity }
              : i
          ),
        };
      }
      return { items: [...state.items, item] };
    }),

  removeItem: (id) =>
    set((state) => ({
      items: state.items.filter((i) => i.id !== id),
    })),

  clearCart: () => set({ items: [] }),

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
}));

export type { CartItem, CartItemCustomization };
