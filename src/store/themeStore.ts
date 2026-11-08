import { create } from 'zustand';

interface ThemeState {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

const THEME_KEY = 'nearbuy_theme';

function getInitialTheme(): 'light' | 'dark' {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'dark' || saved === 'light') return saved;
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
  } catch (e) {
    console.error(e);
  }
  return 'light';
}

export const useThemeStore = create<ThemeState>((set, get) => {
  const initialTheme = getInitialTheme();
  if (typeof document !== 'undefined') {
    if (initialTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  return {
    theme: initialTheme,
    toggleTheme: () => {
      const nextTheme = get().theme === 'light' ? 'dark' : 'light';
      if (typeof document !== 'undefined') {
        if (nextTheme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
      localStorage.setItem(THEME_KEY, nextTheme);
      set({ theme: nextTheme });
    },
    setTheme: (theme: 'light' | 'dark') => {
      if (typeof document !== 'undefined') {
        if (theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
      localStorage.setItem(THEME_KEY, theme);
      set({ theme });
    },
  };
});
