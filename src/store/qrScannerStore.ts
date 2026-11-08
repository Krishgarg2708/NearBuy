import { create } from 'zustand';
import { QRScanResult, InStoreRedemptionToken, QRScanType } from '../types';
import { SEED_STORES, SEED_OFFERS, SEED_PRODUCTS } from '../data/seedData';

interface QRScannerState {
  isOpen: boolean;
  activeTab: 'camera' | 'upload' | 'demo';
  result: QRScanResult | null;
  redemptionToken: InStoreRedemptionToken | null;
  soundEnabled: boolean;
  history: QRScanResult[];

  // Actions
  openScanner: (initialTab?: 'camera' | 'upload' | 'demo') => void;
  closeScanner: () => void;
  setTab: (tab: 'camera' | 'upload' | 'demo') => void;
  processDecodedText: (text: string) => QRScanResult;
  clearResult: () => void;
  generateRedemptionToken: (couponCode: string) => InStoreRedemptionToken;
  markTokenRedeemed: () => void;
  toggleSound: () => void;
  playScanBeep: () => void;
  clearHistory: () => void;
}

const HISTORY_STORAGE_KEY = 'nearbuy_qr_scan_history_v1';
const SOUND_STORAGE_KEY = 'nearbuy_qr_sound_enabled_v1';

function loadHistory(): QRScanResult[] {
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load QR history', e);
  }
  return [];
}

function persistHistory(history: QRScanResult[]) {
  try {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history.slice(0, 25)));
  } catch (e) {
    console.error('Failed to save QR history', e);
  }
}

function loadSoundPref(): boolean {
  try {
    const raw = localStorage.getItem(SOUND_STORAGE_KEY);
    if (raw !== null) return raw === 'true';
  } catch (e) {
    // fallback
  }
  return true;
}

// Synthesize pleasant scanner beep using Web Audio API
function playScannerAudioBeep() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    // Cash register / barcode dual blip: 1046Hz (C6) -> 1318Hz (E6)
    osc.frequency.setValueAtTime(1046.5, now);
    osc.frequency.setValueAtTime(1318.5, now + 0.06);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.2, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.2);
  } catch (err) {
    // ignore gesture block
  }
}

export const useQRScannerStore = create<QRScannerState>((set, get) => ({
  isOpen: false,
  activeTab: 'camera',
  result: null,
  redemptionToken: null,
  soundEnabled: loadSoundPref(),
  history: loadHistory(),

  openScanner: (initialTab = 'camera') => {
    set({
      isOpen: true,
      activeTab: initialTab,
      result: null,
      redemptionToken: null,
    });
  },

  closeScanner: () => {
    set({ isOpen: false });
  },

  setTab: (tab) => {
    set({ activeTab: tab });
  },

  processDecodedText: (text: string) => {
    const raw = text.trim();
    let type: QRScanType = 'external';
    let storeId: string | undefined;
    let storeName: string | undefined;
    let couponCode: string | undefined;
    let discountSummary: string | undefined;
    let productId: string | undefined;
    let title = 'Scanned Code';
    let description = raw;
    let metadata: Record<string, any> = {};

    // 1. Try parsing JSON payload if present
    try {
      if (raw.startsWith('{') && raw.endsWith('}')) {
        const parsed = JSON.parse(raw);
        if (parsed.type === 'store' && parsed.storeId) {
          type = 'store';
          storeId = parsed.storeId;
        } else if (parsed.type === 'coupon' && parsed.code) {
          type = 'coupon';
          couponCode = parsed.code.toUpperCase();
        } else if (parsed.type === 'product' && parsed.productId) {
          type = 'product';
          productId = parsed.productId;
        }
      }
    } catch {
      // not json, continue string parsing
    }

    // 2. Check store patterns
    if (type === 'external') {
      const storeMatch = raw.match(/(?:nearbuy:\/\/store\/|https?:\/\/.*\/stores\/|store:|^)(store_\w+)/i);
      if (storeMatch) {
        type = 'store';
        storeId = storeMatch[1];
      }
    }

    // 3. Check coupon patterns
    if (type === 'external') {
      const couponMatch = raw.match(/(?:nearbuy:\/\/coupon\/|coupon:|^)(NEARBUY\d+|INSTORE\d+|FREEDEL|LOCAL\d+|SUPER\d+|STOREPASS\d+)/i);
      if (couponMatch) {
        type = 'coupon';
        couponCode = couponMatch[1].toUpperCase();
      }
    }

    // 4. Check product patterns
    if (type === 'external') {
      const productMatch = raw.match(/(?:nearbuy:\/\/product\/|https?:\/\/.*\/products\/|product:|^)(prod_\w+)/i);
      if (productMatch) {
        type = 'product';
        productId = productMatch[1];
      }
    }

    // Enhance based on matched type
    if (type === 'store' && storeId) {
      const foundStore = SEED_STORES.find((s) => s.id.toLowerCase() === storeId!.toLowerCase());
      if (foundStore) {
        title = foundStore.name;
        storeName = foundStore.name;
        description = `${foundStore.category} • ${foundStore.area} • ★ ${foundStore.rating}`;
        metadata = {
          address: foundStore.address,
          isOpen: foundStore.isOpen,
          deliveryTimeMin: foundStore.deliveryTimeMin,
          rating: foundStore.rating,
          image: foundStore.image,
          minOrderValue: foundStore.minOrderValue,
        };
      } else {
        title = `Store #${storeId}`;
        description = 'Neighborhood Merchant on NearBuy';
      }
    } else if (type === 'coupon' && couponCode) {
      const foundOffer = SEED_OFFERS.find((o) => o.code.toUpperCase() === couponCode!.toUpperCase());
      if (foundOffer) {
        title = foundOffer.title;
        discountSummary =
          foundOffer.discountType === 'percentage'
            ? `${foundOffer.discountValue}% OFF`
            : foundOffer.discountType === 'free_delivery'
            ? 'FREE DELIVERY'
            : `₹${foundOffer.discountValue} OFF`;
        description = foundOffer.description;
        metadata = {
          discountType: foundOffer.discountType,
          discountValue: foundOffer.discountValue,
          minOrderValue: foundOffer.minOrderValue,
          maxDiscount: foundOffer.maxDiscount,
          validUntil: foundOffer.validUntil,
        };
      } else {
        title = `Coupon ${couponCode}`;
        description = 'Special In-Store Promotional Discount';
      }
    } else if (type === 'product' && productId) {
      const foundProduct = SEED_PRODUCTS.find((p) => p.id === productId);
      if (foundProduct) {
        title = foundProduct.title;
        description = `${foundProduct.brand} • ${foundProduct.category}`;
        metadata = {
          image: foundProduct.image,
          unit: foundProduct.unit,
        };
      }
    }

    const scanResult: QRScanResult = {
      raw,
      type,
      storeId,
      storeName,
      couponCode,
      discountSummary,
      productId,
      title,
      description,
      metadata,
      scannedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    if (get().soundEnabled) {
      playScannerAudioBeep();
    }

    const newHistory = [scanResult, ...get().history.filter((h) => h.raw !== scanResult.raw).slice(0, 24)];
    persistHistory(newHistory);

    set({
      result: scanResult,
      history: newHistory,
      redemptionToken: null,
    });

    return scanResult;
  },

  clearResult: () => {
    set({ result: null, redemptionToken: null });
  },

  generateRedemptionToken: (couponCode: string) => {
    // Generate an in-store dynamic security token and 4-digit PIN for cashier counter validation
    const pin = Math.floor(1000 + Math.random() * 9000).toString();
    const token = `NB-${couponCode}-${Date.now().toString().slice(-4)}`;
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    const redemptionToken: InStoreRedemptionToken = {
      token,
      couponCode,
      pin,
      expiresAt,
      remainingSeconds: 300,
      status: 'active',
    };

    set({ redemptionToken });
    return redemptionToken;
  },

  markTokenRedeemed: () => {
    const current = get().redemptionToken;
    if (current) {
      set({
        redemptionToken: { ...current, status: 'redeemed' },
      });
    }
  },

  toggleSound: () => {
    const next = !get().soundEnabled;
    try {
      localStorage.setItem(SOUND_STORAGE_KEY, String(next));
    } catch {
      // ignore
    }
    set({ soundEnabled: next });
  },

  playScanBeep: () => {
    playScannerAudioBeep();
  },

  clearHistory: () => {
    persistHistory([]);
    set({ history: [] });
  },
}));
