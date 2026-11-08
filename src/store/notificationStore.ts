import { create } from 'zustand';
import { NotificationItem } from '../types';

interface NotificationState {
  notifications: NotificationItem[];
  unreadCount: number;
  addNotification: (title: string, message: string, type?: NotificationItem['type'], actionUrl?: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif_1',
    title: 'Order Out for Delivery',
    message: 'Vikram Singh is 1.1 km away with your order #NB-2026-1001 from Green Basket Organic.',
    type: 'order',
    createdAt: 'Just now',
    read: false,
    actionUrl: '/track/order_1001',
  },
  {
    id: 'notif_2',
    title: 'Neighborhood Offer Live',
    message: 'Use code NEARBUY50 to get flat ₹50 OFF on orders above ₹299.',
    type: 'promo',
    createdAt: '1 hour ago',
    read: false,
    actionUrl: '/explore',
  },
  {
    id: 'notif_3',
    title: 'Price Drop Alert',
    message: 'Rustic Country Sourdough Loaf is now ₹220 at Artisan Sourdough Co. (Save ₹30).',
    type: 'inventory',
    createdAt: '3 hours ago',
    read: true,
    actionUrl: '/compare/prod_artisan_sourdough',
  },
];

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: INITIAL_NOTIFICATIONS,
  unreadCount: INITIAL_NOTIFICATIONS.filter((n) => !n.read).length,

  addNotification: (title, message, type = 'system', actionUrl) => {
    const newNotif: NotificationItem = {
      id: 'notif_' + Date.now(),
      title,
      message,
      type,
      createdAt: 'Just now',
      read: false,
      actionUrl,
    };
    set((state) => {
      const updated = [newNotif, ...state.notifications];
      return {
        notifications: updated,
        unreadCount: updated.filter((n) => !n.read).length,
      };
    });
  },

  markAsRead: (id) => {
    set((state) => {
      const updated = state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
      return {
        notifications: updated,
        unreadCount: updated.filter((n) => !n.read).length,
      };
    });
  },

  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    }));
  },

  clearAll: () => {
    set({ notifications: [], unreadCount: 0 });
  },
}));
