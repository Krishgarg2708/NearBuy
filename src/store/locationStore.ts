import { create } from 'zustand';
import { Address } from '../types';
import { SEED_ADDRESSES } from '../data/seedData';

interface LocationState {
  currentAddress: Address;
  allAddresses: Address[];
  isLocating: boolean;
  setCurrentAddress: (address: Address) => void;
  addAddress: (address: Address) => void;
  simulateGeolocation: () => Promise<void>;
  calculateDistance: (targetLat: number, targetLng: number) => number;
}

// Haversine formula to compute distance in km
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d * 10) / 10; // Round to 1 decimal place
}

export const useLocationStore = create<LocationState>((set, get) => ({
  currentAddress: SEED_ADDRESSES[0],
  allAddresses: SEED_ADDRESSES,
  isLocating: false,

  setCurrentAddress: (address: Address) => {
    set({ currentAddress: address });
  },

  addAddress: (newAddr: Address) => {
    set((state) => ({
      allAddresses: [newAddr, ...state.allAddresses],
      currentAddress: newAddr,
    }));
  },

  simulateGeolocation: async () => {
    set({ isLocating: true });
    await new Promise((resolve) => setTimeout(resolve, 600));
    // Simulate detecting Indiranagar neighborhood
    set({
      currentAddress: {
        id: 'addr_live_' + Date.now(),
        label: 'Home',
        street: '12th Main Road, HAL 2nd Stage',
        area: 'Indiranagar',
        city: 'Bengaluru',
        pincode: '560038',
        lat: 12.9784,
        lng: 77.6408,
      },
      isLocating: false,
    });
  },

  calculateDistance: (targetLat: number, targetLng: number) => {
    const { currentAddress } = get();
    return calculateDistanceKm(currentAddress.lat, currentAddress.lng, targetLat, targetLng);
  },
}));
