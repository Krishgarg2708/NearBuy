import { create } from 'zustand';
import { CartItem, Offer, Product, MerchantProductOffer } from '../types';
import { SEED_OFFERS } from '../data/seedData';

interface CartState {
  items: CartItem[];
  appliedCoupon: Offer | null;
  orderType: 'delivery' | 'pickup';
  couponError: string | null;

  // Actions
  addItem: (product: Product, offer: MerchantProductOffer, quantity?: number) => void;
  removeItem: (productId: string, merchantId: string) => void;
  updateQuantity: (productId: string, merchantId: string, quantity: number) => void;
  clearCart: () => void;
  clearMerchantItems: (merchantId: string) => void;
  setOrderType: (type: 'delivery' | 'pickup') => void;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;

  // Computed helper getters
  getItemCount: () => number;
  getSubtotal: () => number;
  getDeliveryFee: () => number;
  getDiscount: () => number;
  getTaxes: () => number;
  getTotal: () => number;
  getItemsByMerchant: () => Record<string, { merchantName: string; deliveryFee: number; items: CartItem[] }>;
}

const STORAGE_KEY = 'nearbuy_cart_items_v1';

function getInitialCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse cart items', e);
  }
  return [];
}

function persistCart(items: CartItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to persist cart items', e);
  }
}

export const useCartStore = create<CartState>((set, get) => ({
  items: getInitialCart(),
  appliedCoupon: null,
  orderType: 'delivery',
  couponError: null,

  addItem: (product, offer, quantity = 1) => {
    set((state) => {
      const existingIndex = state.items.findIndex(
        (it) => it.productId === product.id && it.merchantId === offer.merchantId
      );

      let updatedItems: CartItem[];
      if (existingIndex > -1) {
        updatedItems = [...state.items];
        updatedItems[existingIndex].quantity += quantity;
      } else {
        const newItem: CartItem = {
          productId: product.id,
          merchantId: offer.merchantId,
          title: product.title,
          brand: product.brand,
          image: product.image,
          unit: product.unit,
          price: offer.price,
          originalPrice: offer.originalPrice,
          quantity,
          storeName: offer.storeName,
          deliveryTimeMin: offer.deliveryTimeMin,
          deliveryFee: 25, // default local delivery fee per merchant
        };
        updatedItems = [...state.items, newItem];
      }

      persistCart(updatedItems);
      return { items: updatedItems };
    });
  },

  removeItem: (productId, merchantId) => {
    set((state) => {
      const updated = state.items.filter(
        (it) => !(it.productId === productId && it.merchantId === merchantId)
      );
      persistCart(updated);
      return { items: updated };
    });
  },

  updateQuantity: (productId, merchantId, quantity) => {
    set((state) => {
      let updated: CartItem[];
      if (quantity <= 0) {
        updated = state.items.filter(
          (it) => !(it.productId === productId && it.merchantId === merchantId)
        );
      } else {
        updated = state.items.map((it) =>
          it.productId === productId && it.merchantId === merchantId
            ? { ...it, quantity }
            : it
        );
      }
      persistCart(updated);
      return { items: updated };
    });
  },

  clearCart: () => {
    persistCart([]);
    set({ items: [], appliedCoupon: null, couponError: null });
  },

  clearMerchantItems: (merchantId: string) => {
    set((state) => {
      const updated = state.items.filter((it) => it.merchantId !== merchantId);
      persistCart(updated);
      return { items: updated };
    });
  },

  setOrderType: (type) => {
    set({ orderType: type });
  },

  applyCoupon: (code: string) => {
    const cleanCode = code.trim().toUpperCase();
    const found = SEED_OFFERS.find((o) => o.code === cleanCode && o.isActive);
    const subtotal = get().getSubtotal();

    if (!found) {
      set({ couponError: 'Invalid coupon code. Try NEARBUY50 or FREEDEL.' });
      return false;
    }

    if (subtotal < found.minOrderValue) {
      set({
        couponError: `Minimum order amount of ₹${found.minOrderValue} required for this coupon.`,
      });
      return false;
    }

    set({ appliedCoupon: found, couponError: null });
    return true;
  },

  removeCoupon: () => {
    set({ appliedCoupon: null, couponError: null });
  },

  getItemCount: () => {
    return get().items.reduce((sum, item) => sum + item.quantity, 0);
  },

  getSubtotal: () => {
    return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  },

  getDeliveryFee: () => {
    const { orderType, items, appliedCoupon } = get();
    if (orderType === 'pickup' || items.length === 0) return 0;
    if (appliedCoupon && appliedCoupon.discountType === 'free_delivery') return 0;

    // Delivery fee is calculated per unique merchant (e.g. ₹25 each store)
    const uniqueMerchants = new Set(items.map((it) => it.merchantId));
    return uniqueMerchants.size * 25;
  },

  getDiscount: () => {
    const { appliedCoupon } = get();
    const subtotal = get().getSubtotal();
    if (!appliedCoupon) return 0;

    if (appliedCoupon.discountType === 'fixed') {
      return Math.min(appliedCoupon.discountValue, subtotal);
    }
    if (appliedCoupon.discountType === 'percentage') {
      const disc = Math.round((subtotal * appliedCoupon.discountValue) / 100);
      return appliedCoupon.maxDiscount ? Math.min(disc, appliedCoupon.maxDiscount) : disc;
    }
    return 0;
  },

  getTaxes: () => {
    const subtotal = get().getSubtotal();
    return Math.round(subtotal * 0.05); // 5% GST
  },

  getTotal: () => {
    const subtotal = get().getSubtotal();
    const delivery = get().getDeliveryFee();
    const discount = get().getDiscount();
    const taxes = get().getTaxes();
    return Math.max(0, subtotal + delivery + taxes - discount);
  },

  getItemsByMerchant: () => {
    const { items } = get();
    const grouped: Record<string, { merchantName: string; deliveryFee: number; items: CartItem[] }> = {};

    items.forEach((item) => {
      if (!grouped[item.merchantId]) {
        grouped[item.merchantId] = {
          merchantName: item.storeName,
          deliveryFee: item.deliveryFee,
          items: [],
        };
      }
      grouped[item.merchantId].items.push(item);
    });

    return grouped;
  },
}));
