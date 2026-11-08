import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '../../store/cartStore';
import { useLocationStore } from '../../store/locationStore';
import { useThemeStore } from '../../store/themeStore';
import { useNotificationStore } from '../../store/notificationStore';
import { usePushNotificationStore } from '../../store/pushNotificationStore';
import { useQRScannerStore } from '../../store/qrScannerStore';
import {
  MapPin,
  ShoppingBag,
  Bell,
  Sun,
  Moon,
  Search,
  ChevronDown,
  X,
  Menu,
  Heart,
  Store,
  Navigation,
  CheckCircle2,
  Smartphone,
  Sparkles,
  QrCode,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { getItemCount } = useCartStore();
  const { currentAddress, allAddresses, setCurrentAddress, simulateGeolocation, isLocating } =
    useLocationStore();
  const { theme, toggleTheme } = useThemeStore();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotificationStore();
  const { settings: pushSettings, setSettingsOpen, testPush } = usePushNotificationStore();
  const { openScanner } = useQRScannerStore();

  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const cartCount = getItemCount();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-[33px] z-40 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 transition-colors">
      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4 md:gap-8">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
              {/* Location Pin + Shopping Bag Hybrid Icon */}
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7z" />
                <circle cx="12" cy="9" r="2.5" fill="currentColor" />
              </svg>
            </div>
            <span className="text-xl font-extrabold tracking-tight text-stone-950 dark:text-white whitespace-nowrap">
              Near<span className="text-orange-500">Buy</span>
            </span>
          </Link>

          {/* Hyperlocal Location Pill */}
          <div className="relative hidden lg:block">
            <button
              onClick={() => setIsLocationOpen(!isLocationOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-100 hover:bg-stone-200/80 dark:bg-stone-800 dark:hover:bg-stone-700/80 text-stone-800 dark:text-stone-200 text-xs font-semibold transition-all max-w-[200px]"
            >
              <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0" />
              <span className="truncate">{currentAddress.area || 'Select Location'}</span>
              <ChevronDown className="w-3 h-3 text-stone-400 shrink-0" />
            </button>

            {/* Location Selector Dropdown */}
            {isLocationOpen && (
              <div className="absolute left-0 mt-2 w-80 bg-white dark:bg-stone-900 rounded-2xl shadow-xl border border-stone-200 dark:border-stone-800 p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-800">
                  <span className="text-xs font-semibold text-stone-900 dark:text-stone-100">
                    Your Neighborhood
                  </span>
                  <button
                    onClick={() => setIsLocationOpen(false)}
                    className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="py-2">
                  <button
                    onClick={async () => {
                      await simulateGeolocation();
                      setIsLocationOpen(false);
                    }}
                    disabled={isLocating}
                    className="w-full flex items-center gap-2.5 p-2 rounded-xl text-left text-xs font-medium text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40 hover:bg-orange-100/80 transition-colors"
                  >
                    <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
                    <span>{isLocating ? 'Detecting neighborhood GPS...' : 'Use current location'}</span>
                  </button>
                </div>

                <div className="space-y-1 max-h-48 overflow-y-auto">
                  <div className="text-[11px] font-medium text-stone-400 px-2 py-1">Saved Addresses</div>
                  {allAddresses.map((addr) => {
                    const isSelected = addr.id === currentAddress.id;
                    return (
                      <button
                        key={addr.id}
                        onClick={() => {
                          setCurrentAddress(addr);
                          setIsLocationOpen(false);
                        }}
                        className={`w-full text-left p-2 rounded-xl text-xs transition-colors flex items-start justify-between ${
                          isSelected
                            ? 'bg-stone-100 dark:bg-stone-800 text-stone-950 dark:text-white font-medium'
                            : 'hover:bg-stone-50 dark:hover:bg-stone-800/50 text-stone-600 dark:text-stone-300'
                        }`}
                      >
                        <div>
                          <div className="font-semibold flex items-center gap-1.5">
                            <span>{addr.label}</span>
                            <span className="text-stone-400 text-[11px] font-normal">({addr.area})</span>
                          </div>
                          <div className="text-[11px] text-stone-400 truncate max-w-[220px]">
                            {addr.street}
                          </div>
                        </div>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Global Search Bar */}
        <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-md relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search milk, sourdough, headphones, stores..."
            className="w-full pl-9 pr-4 py-2 rounded-full text-xs bg-stone-100/80 dark:bg-stone-800 border border-stone-200/80 dark:border-stone-700/80 focus:outline-hidden focus:ring-2 focus:ring-orange-500 text-stone-900 dark:text-white placeholder:text-stone-400 transition-all"
          />
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5 pointer-events-none" />
        </form>

        {/* Zone 2: Navigation Links (Clean Single-Line Typography) */}
        <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-stone-600 dark:text-stone-300">
          <Link to="/explore" className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors whitespace-nowrap">
            Marketplace
          </Link>
          <Link to="/stores" className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors whitespace-nowrap">
            Nearby Stores
          </Link>
          <Link to="/products" className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors whitespace-nowrap">
            Products & Compare
          </Link>
          <Link to="/track/order_1001" className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors whitespace-nowrap">
            Live Tracking
          </Link>
          <Link to="/customer/orders" className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors whitespace-nowrap">
            Orders & Insights
          </Link>
        </nav>

        {/* Zone 3: Actions (QR Scanner, Theme, Notifications, Wishlist, Cart Drawer) */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* QR Code Scanner Overlay Button */}
          <button
            onClick={() => openScanner('camera')}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-orange-50 hover:bg-orange-100/80 dark:bg-orange-950/40 dark:hover:bg-orange-900/50 text-orange-600 dark:text-orange-400 text-xs font-bold border border-orange-200/80 dark:border-orange-800/80 transition-all hover:scale-105 active:scale-95 shadow-xs"
            title="Scan In-Store QR or Redeem Coupon"
          >
            <QrCode className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-500 shrink-0" />
            <span className="hidden sm:inline">Scan QR</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Simulated Mobile Push Quick Settings Button */}
          <button
            onClick={() => setSettingsOpen(true)}
            className="p-2 rounded-full text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors relative"
            title="Configure Simulated Mobile Push Notifications"
          >
            <Smartphone className="w-4 h-4 text-orange-500" />
            {pushSettings.enabled && (
              <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-emerald-500" />
            )}
          </button>

          {/* In-App Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="p-2 rounded-full text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors relative"
              title="In-App Notifications History"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-orange-500 ring-2 ring-white dark:ring-stone-900" />
              )}
            </button>

            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-84 bg-white dark:bg-stone-900 rounded-3xl shadow-xl border border-stone-200 dark:border-stone-800 p-4 z-50">
                <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-800">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wider">
                      In-App Inbox
                    </span>
                    {unreadCount > 0 && (
                      <span className="text-[11px] text-orange-600 dark:text-orange-400 font-bold">
                        ({unreadCount} new)
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-[11px] text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                    >
                      Mark read
                    </button>
                  )}
                </div>

                {/* Clear distinction banner: Mobile Push vs In-App */}
                <div className="my-2.5 p-2.5 rounded-2xl bg-orange-50 dark:bg-orange-950/30 border border-orange-200/80 dark:border-orange-900/60 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-stone-800 dark:text-stone-200">
                    <Smartphone className="w-4 h-4 text-orange-500 shrink-0" />
                    <div>
                      <div className="font-bold text-[11px]">Mobile Push Simulator</div>
                      <div className="text-[10px] text-stone-500">
                        {pushSettings.enabled ? `Active (${pushSettings.style.toUpperCase()})` : 'Disabled'}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setIsNotifOpen(false);
                      setSettingsOpen(true);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-[10px] font-bold"
                  >
                    Configure
                  </button>
                </div>

                <div className="py-1 space-y-2 max-h-56 overflow-y-auto">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        markAsRead(n.id);
                        if (n.actionUrl) {
                          setIsNotifOpen(false);
                          navigate(n.actionUrl);
                        }
                      }}
                      className={`p-2.5 rounded-xl text-xs cursor-pointer transition-colors ${
                        n.read
                          ? 'bg-stone-50/50 dark:bg-stone-800/40 text-stone-500'
                          : 'bg-orange-50/40 dark:bg-orange-950/20 text-stone-800 dark:text-stone-200 font-medium'
                      }`}
                    >
                      <div className="font-semibold text-stone-900 dark:text-stone-100">{n.title}</div>
                      <div className="text-[11px] mt-0.5 line-clamp-2">{n.message}</div>
                      <div className="text-[10px] text-stone-400 mt-1">{n.createdAt}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Wishlist Link */}
          <Link
            to="/customer/wishlist"
            className="p-2 rounded-full text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors hidden sm:flex"
            title="Wishlist"
          >
            <Heart className="w-4 h-4" />
          </Link>

          {/* Primary Action: Shopping Cart Button */}
          <Link
            to="/cart"
            className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold shadow-sm transition-all hover:shadow-orange-500/25 shrink-0"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline">Bag</span>
            <span className="w-5 h-5 rounded-full bg-white text-orange-600 flex items-center justify-center text-[11px] font-bold">
              {cartCount}
            </span>
          </Link>

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-xl text-stone-600 dark:text-stone-300 lg:hidden hover:bg-stone-100 dark:hover:bg-stone-800"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 px-4 pt-3 pb-6 space-y-3">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search local stores & products..."
              className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
          </form>

          <div className="flex flex-col gap-2 pt-2">
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                openScanner('camera');
              }}
              className="w-full flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-orange-500/5 border border-orange-500/25 text-orange-600 dark:text-orange-400 font-bold text-xs shadow-xs"
            >
              <span className="flex items-center gap-2">
                <QrCode className="w-4 h-4 text-orange-500" />
                <span>Scan In-Store QR / Redeem Coupon</span>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-orange-500 text-white text-[10px] font-extrabold uppercase">
                Scan
              </span>
            </button>

            <Link
              to="/explore"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-sm font-medium hover:bg-stone-100 dark:hover:bg-stone-800"
            >
              Marketplace Explore
            </Link>
            <Link
              to="/stores"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-sm font-medium hover:bg-stone-100 dark:hover:bg-stone-800"
            >
              Nearby Stores & Map
            </Link>
            <Link
              to="/products"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-sm font-medium hover:bg-stone-100 dark:hover:bg-stone-800"
            >
              Product Catalog & Compare
            </Link>
            <Link
              to="/track/order_1001"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-sm font-medium hover:bg-stone-100 dark:hover:bg-stone-800"
            >
              Live Order Tracking
            </Link>
            <Link
              to="/customer/orders"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-sm font-medium hover:bg-stone-100 dark:hover:bg-stone-800"
            >
              My Orders & Account
            </Link>
            <Link
              to="/customer/wishlist"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-sm font-medium hover:bg-stone-100 dark:hover:bg-stone-800"
            >
              Saved Items
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
