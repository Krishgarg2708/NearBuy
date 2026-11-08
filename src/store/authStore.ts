import { create } from 'zustand';
import { User, UserRole } from '../types';
import { SEED_USERS } from '../data/seedData';

interface AuthState {
  currentUser: User;
  isAuthenticated: boolean;
  switchRole: (role: UserRole) => void;
  setUser: (user: User) => void;
  logout: () => void;
}

const STORAGE_KEY = 'nearbuy_auth_user';

function getInitialUser(): User {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Error reading auth user from localStorage', e);
  }
  return SEED_USERS[0]; // Priya Sharma (Customer)
}

export const useAuthStore = create<AuthState>((set) => ({
  currentUser: getInitialUser(),
  isAuthenticated: true,

  switchRole: (role: UserRole) => {
    const targetUser = SEED_USERS.find((u) => u.role === role) || SEED_USERS[0];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(targetUser));
    set({ currentUser: targetUser, isAuthenticated: true });
  },

  setUser: (user: User) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    set({ currentUser: user, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEY);
    // Fallback to customer
    set({ currentUser: SEED_USERS[0], isAuthenticated: false });
  },
}));
