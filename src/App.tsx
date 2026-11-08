import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { RoleSwitcherBar } from './components/common/RoleSwitcherBar';
import { Navbar } from './components/common/Navbar';
import { FluidCursor } from './components/common/FluidCursor';
import { LandingPage } from './views/LandingPage';
import { MarketplaceView } from './views/MarketplaceView';
import { StoresDirectoryView } from './views/StoresDirectoryView';
import { StoreDetailView } from './views/StoreDetailView';
import { ProductsCatalogView } from './views/ProductsCatalogView';
import { ProductDetailView } from './views/ProductDetailView';
import { CompareView } from './views/CompareView';
import { CartView } from './views/CartView';
import { CheckoutView } from './views/CheckoutView';
import { OrderTrackingView } from './views/OrderTrackingView';
import { CustomerOrdersView } from './views/customer/CustomerOrdersView';
import { WishlistView } from './views/customer/WishlistView';
import { MerchantDashboardView } from './views/merchant/MerchantDashboardView';
import { DeliveryDashboardView } from './views/delivery/DeliveryDashboardView';
import { SuperAdminDashboardView } from './views/admin/SuperAdminDashboardView';
import { SimulatedPushNotification } from './components/common/SimulatedPushNotification';
import { PushNotificationSettingsModal } from './components/common/PushNotificationSettingsModal';
import { QRScannerModal } from './components/common/QRScannerModal';
import { useThemeStore } from './store/themeStore';

const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

export default function App() {
  const { theme } = useThemeStore();

  return (
    <Router>
      <ScrollToTop />
      <FluidCursor />
      {/* Floating Simulated Mobile Push Notification Overlay */}
      <SimulatedPushNotification />
      {/* Push Notification Configuration Modal */}
      <PushNotificationSettingsModal />
      {/* Hyperlocal QR Code Scanner Overlay */}
      <QRScannerModal />

      <div className="min-h-screen flex flex-col bg-[#FAFAF9] text-[#171717] dark:bg-[#0A0A0A] dark:text-[#F5F5F5] transition-colors">
        {/* Hyperlocal Simulation Role Switcher */}
        <RoleSwitcherBar />

        {/* Top Navbar */}
        <Navbar />

        {/* Main Application Routes */}
        <main className="flex-1">
          <Routes>
            {/* Public & Customer Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/explore" element={<MarketplaceView />} />
            <Route path="/stores" element={<StoresDirectoryView />} />
            <Route path="/stores/:storeId" element={<StoreDetailView />} />
            <Route path="/products" element={<ProductsCatalogView />} />
            <Route path="/products/:productId" element={<ProductDetailView />} />
            <Route path="/compare/:productId" element={<CompareView />} />
            <Route path="/cart" element={<CartView />} />
            <Route path="/checkout" element={<CheckoutView />} />
            <Route path="/track/:orderId" element={<OrderTrackingView />} />

            {/* Customer Account */}
            <Route path="/customer/dashboard" element={<CustomerOrdersView />} />
            <Route path="/customer/orders" element={<CustomerOrdersView />} />
            <Route path="/customer/wishlist" element={<WishlistView />} />

            {/* Merchant Experience */}
            <Route path="/merchant/dashboard" element={<MerchantDashboardView />} />
            <Route path="/merchant/*" element={<MerchantDashboardView />} />

            {/* Delivery Partner Experience */}
            <Route path="/delivery/dashboard" element={<DeliveryDashboardView />} />
            <Route path="/delivery/*" element={<DeliveryDashboardView />} />

            {/* Super Admin Experience */}
            <Route path="/admin/dashboard" element={<SuperAdminDashboardView />} />
            <Route path="/admin/*" element={<SuperAdminDashboardView />} />

            {/* Fallback */}
            <Route path="*" element={<MarketplaceView />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
