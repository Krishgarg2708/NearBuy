import { create } from 'zustand';
import { OrderStatus } from '../types';

export interface PushNotificationPayload {
  id: string;
  orderId: string;
  orderNumber: string;
  merchantName: string;
  status: OrderStatus;
  title: string;
  message: string;
  timestamp: string;
  actionUrl: string;
}

export interface PushSettings {
  enabled: boolean;
  soundEnabled: boolean;
  autoDismissSeconds: number; // 4, 6, 10, or 0 for manual
  style: 'ios' | 'android';
  subscribedEvents: {
    placed: boolean;
    accepted: boolean;
    preparing: boolean;
    ready: boolean;
    picked_up: boolean;
    out_for_delivery: boolean;
    delivered: boolean;
    cancelled: boolean;
  };
}

interface PushNotificationState {
  settings: PushSettings;
  activePush: PushNotificationPayload | null;
  pushHistory: PushNotificationPayload[];
  isSettingsOpen: boolean;

  // Actions
  triggerPush: (payload: Omit<PushNotificationPayload, 'id' | 'timestamp'>) => void;
  dismissPush: () => void;
  updateSettings: (newSettings: Partial<PushSettings>) => void;
  setSettingsOpen: (isOpen: boolean) => void;
  playChime: () => void;
  testPush: () => void;
}

const SETTINGS_STORAGE_KEY = 'nearbuy_push_settings_v1';

const DEFAULT_SETTINGS: PushSettings = {
  enabled: true,
  soundEnabled: true,
  autoDismissSeconds: 6,
  style: 'ios',
  subscribedEvents: {
    placed: true,
    accepted: true,
    preparing: true,
    ready: true,
    picked_up: true,
    out_for_delivery: true,
    delivered: true,
    cancelled: true,
  },
};

function loadSettings(): PushSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (raw) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.error('Failed to load push settings', e);
  }
  return DEFAULT_SETTINGS;
}

function persistSettings(settings: PushSettings) {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save push settings', e);
  }
}

// Synthesize pleasant mobile push notification chime using Web Audio API
function playPushAudioChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // Harmonic dual chime (880Hz then 1320Hz)
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, now); // A5
    osc1.frequency.exponentialRampToValueAtTime(1174.66, now + 0.12); // D6

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(1320, now + 0.08); // E6
    osc2.frequency.exponentialRampToValueAtTime(1760, now + 0.22); // A6

    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.18, now + 0.04);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now + 0.06);
    osc1.stop(now + 0.45);
    osc2.stop(now + 0.45);
  } catch (err) {
    // AudioContext might be blocked until user gesture, ignore gracefully
  }
}

let dismissTimer: NodeJS.Timeout | null = null;

export const usePushNotificationStore = create<PushNotificationState>((set, get) => ({
  settings: loadSettings(),
  activePush: null,
  pushHistory: [],
  isSettingsOpen: false,

  triggerPush: (payload) => {
    const { settings } = get();
    if (!settings.enabled) return;

    // Check if event is subscribed
    if (!settings.subscribedEvents[payload.status]) return;

    if (dismissTimer) {
      clearTimeout(dismissTimer);
      dismissTimer = null;
    }

    const fullPayload: PushNotificationPayload = {
      ...payload,
      id: 'push_' + Date.now(),
      timestamp: 'Just now',
    };

    if (settings.soundEnabled) {
      playPushAudioChime();
    }

    set((state) => ({
      activePush: fullPayload,
      pushHistory: [fullPayload, ...state.pushHistory.slice(0, 19)],
    }));

    if (settings.autoDismissSeconds > 0) {
      dismissTimer = setTimeout(() => {
        set({ activePush: null });
        dismissTimer = null;
      }, settings.autoDismissSeconds * 1000);
    }
  },

  dismissPush: () => {
    if (dismissTimer) {
      clearTimeout(dismissTimer);
      dismissTimer = null;
    }
    set({ activePush: null });
  },

  updateSettings: (newSettings) => {
    set((state) => {
      const merged = { ...state.settings, ...newSettings };
      persistSettings(merged);
      return { settings: merged };
    });
  },

  setSettingsOpen: (isOpen) => {
    set({ isSettingsOpen: isOpen });
  },

  playChime: () => {
    playPushAudioChime();
  },

  testPush: () => {
    const sampleStatuses: OrderStatus[] = ['accepted', 'out_for_delivery', 'delivered'];
    const randomStatus = sampleStatuses[Math.floor(Math.random() * sampleStatuses.length)];

    const samples: Record<OrderStatus, { title: string; message: string }> = {
      placed: {
        title: '🛍️ Order Placed',
        message: 'Your order #NB-2026-1001 was sent to Green Basket Organic.',
      },
      accepted: {
        title: '🏪 Store Accepted Your Order',
        message: 'Green Basket Organic verified items and is preparing your order.',
      },
      preparing: {
        title: '📦 Order Being Packed',
        message: 'Fresh sourdough and strawberries packaged with insulated cooling.',
      },
      ready: {
        title: '✅ Ready for Dispatch',
        message: 'Order #NB-2026-1001 sealed and handed over to pickup dock.',
      },
      picked_up: {
        title: '🛵 Partner Picked Up Order',
        message: 'Vikram Singh collected your package and started his transit.',
      },
      out_for_delivery: {
        title: '⚡ Out for Delivery — 8 mins away',
        message: 'Vikram Singh is 1.1 km away heading to 12th Main Indiranagar.',
      },
      delivered: {
        title: '🎉 Order Delivered!',
        message: 'Delivered to resident at Indiranagar. Enjoy your local purchase!',
      },
      cancelled: {
        title: '❌ Order Cancelled',
        message: 'Order #NB-2026-1001 was cancelled. Full refund initiated.',
      },
    };

    const chosen = samples[randomStatus];
    get().triggerPush({
      orderId: 'order_1001',
      orderNumber: 'NB-2026-1001',
      merchantName: 'Green Basket Organic',
      status: randomStatus,
      title: chosen.title,
      message: chosen.message,
      actionUrl: '/track/order_1001',
    });
  },
}));
