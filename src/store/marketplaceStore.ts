import { create } from 'zustand';
import {
  Store,
  Product,
  StoreCategory,
  MerchantProductOffer,
  Order,
  OrderStatus,
  DeliveryPartner,
  Offer,
  Review,
} from '../types';
import {
  SEED_STORES,
  SEED_PRODUCTS,
  SEED_CATEGORIES,
  SEED_OFFERS_BY_PRODUCT,
  SEED_ORDERS,
  SEED_OFFERS,
  SEED_REVIEWS,
  SEED_DELIVERY_PARTNERS,
} from '../data/seedData';
import { usePushNotificationStore } from './pushNotificationStore';

interface MarketplaceState {
  stores: Store[];
  products: Product[];
  categories: StoreCategory[];
  offersByProduct: Record<string, MerchantProductOffer[]>;
  orders: Order[];
  offers: Offer[];
  reviews: Review[];
  deliveryPartners: DeliveryPartner[];
  wishlistProductIds: string[];
  favoriteStoreIds: string[];

  // Actions
  toggleWishlist: (productId: string) => void;
  toggleFavoriteStore: (storeId: string) => void;
  addOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus, note?: string) => void;
  cancelOrder: (orderId: string, reason: string) => void;
  addReview: (review: Review) => void;
  updateStoreStatus: (storeId: string, status: 'approved' | 'pending' | 'rejected' | 'suspended') => void;
  addStore: (newStore: Store) => void;
  updateStore: (storeId: string, updates: Partial<Store>) => void;
  updateProductStock: (productId: string, merchantId: string, newStock: number) => void;
  updateProductPrice: (productId: string, merchantId: string, newPrice: number, originalPrice?: number) => void;
  addProduct: (product: Product, offers: MerchantProductOffer[]) => void;
  addOffer: (offer: Offer) => void;
  updateDeliveryPartnerStatus: (partnerId: string, status: 'available' | 'busy' | 'offline', orderId?: string) => void;
  resetToSeedData: () => void;
  exportOrdersCsv: () => void;
}

const STORAGE_KEY = 'nearbuy_marketplace_data_v2';

interface PersistedData {
  stores: Store[];
  products: Product[];
  categories: StoreCategory[];
  offersByProduct: Record<string, MerchantProductOffer[]>;
  orders: Order[];
  offers: Offer[];
  reviews: Review[];
  deliveryPartners: DeliveryPartner[];
  wishlistProductIds: string[];
  favoriteStoreIds: string[];
}

function loadInitialData(): PersistedData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.stores && parsed.products && parsed.orders) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to parse persisted data', err);
  }

  return {
    stores: SEED_STORES,
    products: SEED_PRODUCTS,
    categories: SEED_CATEGORIES,
    offersByProduct: SEED_OFFERS_BY_PRODUCT,
    orders: SEED_ORDERS,
    offers: SEED_OFFERS,
    reviews: SEED_REVIEWS,
    deliveryPartners: SEED_DELIVERY_PARTNERS,
    wishlistProductIds: ['prod_artisan_sourdough', 'prod_strawberries_box'],
    favoriteStoreIds: ['store_1', 'store_3'],
  };
}

function persistState(state: PersistedData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to persist to localStorage', e);
  }
}

export const useMarketplaceStore = create<MarketplaceState>((set, get) => {
  const initial = loadInitialData();

  return {
    ...initial,

    toggleWishlist: (productId: string) => {
      set((state) => {
        const exists = state.wishlistProductIds.includes(productId);
        const wishlistProductIds = exists
          ? state.wishlistProductIds.filter((id) => id !== productId)
          : [...state.wishlistProductIds, productId];
        const next = { ...state, wishlistProductIds };
        persistState(next);
        return { wishlistProductIds };
      });
    },

    toggleFavoriteStore: (storeId: string) => {
      set((state) => {
        const exists = state.favoriteStoreIds.includes(storeId);
        const favoriteStoreIds = exists
          ? state.favoriteStoreIds.filter((id) => id !== storeId)
          : [...state.favoriteStoreIds, storeId];
        const next = { ...state, favoriteStoreIds };
        persistState(next);
        return { favoriteStoreIds };
      });
    },

    addOrder: (order: Order) => {
      set((state) => {
        // Decrease stock in offersByProduct for each purchased item
        const updatedOffers = { ...state.offersByProduct };
        order.items.forEach((item) => {
          if (updatedOffers[item.productId]) {
            updatedOffers[item.productId] = updatedOffers[item.productId].map((off) => {
              if (off.merchantId === order.merchantId) {
                const remainingStock = Math.max(0, off.stock - item.quantity);
                return {
                  ...off,
                  stock: remainingStock,
                  isAvailable: remainingStock > 0,
                };
              }
              return off;
            });
          }
        });

        const orders = [order, ...state.orders];
        const next = { ...state, orders, offersByProduct: updatedOffers };
        persistState(next);

        // Trigger simulated mobile push notification for customer
        try {
          usePushNotificationStore.getState().triggerPush({
            orderId: order.id,
            orderNumber: order.orderNumber,
            merchantName: order.merchantName,
            status: 'placed',
            title: '🛍️ Order Placed Successfully',
            message: `Order #${order.orderNumber} sent to ${order.merchantName}. ETA: ~25 mins.`,
            actionUrl: `/track/${order.id}`,
          });
        } catch (e) {
          console.error(e);
        }

        return { orders, offersByProduct: updatedOffers };
      });
    },

    updateOrderStatus: (orderId: string, status: OrderStatus, note?: string) => {
      set((state) => {
        const orderIndex = state.orders.findIndex((o) => o.id === orderId);
        if (orderIndex === -1) return state;

        const currentOrder = state.orders[orderIndex];
        const statusTitles: Record<OrderStatus, string> = {
          placed: 'Order Placed',
          accepted: 'Merchant Accepted Order',
          preparing: 'Order Being Packed',
          ready: 'Ready for Dispatch / Pickup',
          picked_up: 'Order Picked Up by Partner',
          out_for_delivery: 'Out for Delivery',
          delivered: 'Delivered to Customer',
          cancelled: 'Order Cancelled',
        };

        const timelineEvent = {
          status,
          title: statusTitles[status] || 'Status Updated',
          description: note || `Order updated to ${status.replace('_', ' ')}.`,
          timestamp: new Date().toISOString(),
        };

        const updatedOrder: Order = {
          ...currentOrder,
          status,
          timeline: [...currentOrder.timeline, timelineEvent],
        };

        const updatedOrders = [...state.orders];
        updatedOrders[orderIndex] = updatedOrder;

        const next = { ...state, orders: updatedOrders };
        persistState(next);

        // Trigger simulated mobile push notification for order status update
        try {
          const pushMessages: Record<OrderStatus, { title: string; message: string }> = {
            placed: {
              title: '🛍️ Order Placed',
              message: `Order #${currentOrder.orderNumber} received by ${currentOrder.merchantName}.`,
            },
            accepted: {
              title: '🏪 Store Accepted Your Order',
              message: `${currentOrder.merchantName} verified items & confirmed order #${currentOrder.orderNumber}.`,
            },
            preparing: {
              title: '📦 Order Being Packed',
              message: `Fresh items for #${currentOrder.orderNumber} are being packaged right now.`,
            },
            ready: {
              title: '✅ Order Ready for Dispatch',
              message: `Package sealed and waiting at ${currentOrder.merchantName} pickup dock.`,
            },
            picked_up: {
              title: '🛵 Partner Picked Up Order',
              message: `Delivery partner collected #${currentOrder.orderNumber} and is starting transit.`,
            },
            out_for_delivery: {
              title: '⚡ Out for Delivery (Arriving Soon)',
              message: `Partner is ~8 mins away heading to ${currentOrder.deliveryAddress.area}!`,
            },
            delivered: {
              title: '🎉 Order Delivered Successfully!',
              message: `Delivered to ${currentOrder.customerName}. Enjoy your fresh neighborhood goods!`,
            },
            cancelled: {
              title: '❌ Order Cancelled',
              message: note || `Order #${currentOrder.orderNumber} was cancelled.`,
            },
          };

          const pushContent = pushMessages[status];
          if (pushContent) {
            usePushNotificationStore.getState().triggerPush({
              orderId: currentOrder.id,
              orderNumber: currentOrder.orderNumber,
              merchantName: currentOrder.merchantName,
              status,
              title: pushContent.title,
              message: note || pushContent.message,
              actionUrl: `/track/${currentOrder.id}`,
            });
          }
        } catch (e) {
          console.error(e);
        }

        return { orders: updatedOrders };
      });
    },

    cancelOrder: (orderId: string, reason: string) => {
      set((state) => {
        const order = state.orders.find((o) => o.id === orderId);
        if (!order) return state;

        // Restore stock for cancelled order items
        const updatedOffers = { ...state.offersByProduct };
        order.items.forEach((item) => {
          if (updatedOffers[item.productId]) {
            updatedOffers[item.productId] = updatedOffers[item.productId].map((off) => {
              if (off.merchantId === order.merchantId) {
                return {
                  ...off,
                  stock: off.stock + item.quantity,
                  isAvailable: true,
                };
              }
              return off;
            });
          }
        });

        const updatedOrders = state.orders.map((o) =>
          o.id === orderId
            ? {
                ...o,
                status: 'cancelled' as OrderStatus,
                cancellationReason: reason,
                timeline: [
                  ...o.timeline,
                  {
                    status: 'cancelled' as OrderStatus,
                    title: 'Order Cancelled',
                    description: reason || 'Cancelled by user or merchant.',
                    timestamp: new Date().toISOString(),
                  },
                ],
              }
            : o
        );

        const next = { ...state, orders: updatedOrders, offersByProduct: updatedOffers };
        persistState(next);
        return { orders: updatedOrders, offersByProduct: updatedOffers };
      });
    },

    addReview: (review: Review) => {
      set((state) => {
        const reviews = [review, ...state.reviews];
        const next = { ...state, reviews };
        persistState(next);
        return { reviews };
      });
    },

    updateStoreStatus: (storeId: string, status: Store['status']) => {
      set((state) => {
        const stores = state.stores.map((s) => (s.id === storeId ? { ...s, status } : s));
        const next = { ...state, stores };
        persistState(next);
        return { stores };
      });
    },

    addStore: (newStore: Store) => {
      set((state) => {
        const stores = [newStore, ...state.stores];
        const next = { ...state, stores };
        persistState(next);
        return { stores };
      });
    },

    updateStore: (storeId: string, updates: Partial<Store>) => {
      set((state) => {
        const stores = state.stores.map((s) => (s.id === storeId ? { ...s, ...updates } : s));
        const next = { ...state, stores };
        persistState(next);
        return { stores };
      });
    },

    updateProductStock: (productId: string, merchantId: string, newStock: number) => {
      set((state) => {
        const productOffers = state.offersByProduct[productId] || [];
        const updated = productOffers.map((off) =>
          off.merchantId === merchantId
            ? { ...off, stock: newStock, isAvailable: newStock > 0 }
            : off
        );
        const offersByProduct = {
          ...state.offersByProduct,
          [productId]: updated,
        };
        const next = { ...state, offersByProduct };
        persistState(next);
        return { offersByProduct };
      });
    },

    updateProductPrice: (productId: string, merchantId: string, newPrice: number, originalPrice?: number) => {
      set((state) => {
        const productOffers = state.offersByProduct[productId] || [];
        const updated = productOffers.map((off) =>
          off.merchantId === merchantId
            ? {
                ...off,
                price: newPrice,
                originalPrice: originalPrice ?? off.originalPrice,
              }
            : off
        );
        const offersByProduct = {
          ...state.offersByProduct,
          [productId]: updated,
        };
        const next = { ...state, offersByProduct };
        persistState(next);
        return { offersByProduct };
      });
    },

    addProduct: (product: Product, offers: MerchantProductOffer[]) => {
      set((state) => {
        const products = [product, ...state.products];
        const offersByProduct = {
          ...state.offersByProduct,
          [product.id]: offers,
        };
        const next = { ...state, products, offersByProduct };
        persistState(next);
        return { products, offersByProduct };
      });
    },

    addOffer: (offer: Offer) => {
      set((state) => {
        const offers = [offer, ...state.offers];
        const next = { ...state, offers };
        persistState(next);
        return { offers };
      });
    },

    updateDeliveryPartnerStatus: (partnerId: string, status: DeliveryPartner['status'], orderId?: string) => {
      set((state) => {
        const deliveryPartners = state.deliveryPartners.map((dp) =>
          dp.id === partnerId ? { ...dp, status, activeOrderId: orderId } : dp
        );
        const next = { ...state, deliveryPartners };
        persistState(next);
        return { deliveryPartners };
      });
    },

    resetToSeedData: () => {
      const resetState: PersistedData = {
        stores: SEED_STORES,
        products: SEED_PRODUCTS,
        categories: SEED_CATEGORIES,
        offersByProduct: SEED_OFFERS_BY_PRODUCT,
        orders: SEED_ORDERS,
        offers: SEED_OFFERS,
        reviews: SEED_REVIEWS,
        deliveryPartners: SEED_DELIVERY_PARTNERS,
        wishlistProductIds: ['prod_artisan_sourdough', 'prod_strawberries_box'],
        favoriteStoreIds: ['store_1', 'store_3'],
      };
      persistState(resetState);
      set(resetState);
    },

    exportOrdersCsv: () => {
      const { orders } = get();
      const headers = ['Order Number', 'Date', 'Customer', 'Merchant', 'Items Count', 'Status', 'Total (INR)', 'Payment Method'];
      const rows = orders.map((o) => [
        o.orderNumber,
        new Date(o.createdAt).toLocaleDateString(),
        `"${o.customerName}"`,
        `"${o.merchantName}"`,
        o.items.reduce((acc, it) => acc + it.quantity, 0),
        o.status,
        o.total,
        o.paymentMethod.toUpperCase(),
      ]);

      const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `NearBuy_Orders_Report_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
  };
});
