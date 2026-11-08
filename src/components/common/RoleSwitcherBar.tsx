import React from 'react';
import { useAuthStore } from '../../store/authStore';
import { useMarketplaceStore } from '../../store/marketplaceStore';
import { UserRole } from '../../types';
import { useNavigate, useLocation } from 'react-router-dom';
import { RotateCcw, Shield, Store as StoreIcon, Bike, ShoppingBag } from 'lucide-react';

export const RoleSwitcherBar: React.FC = () => {
  const { currentUser, switchRole } = useAuthStore();
  const { resetToSeedData } = useMarketplaceStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleRoleSelect = (role: UserRole) => {
    switchRole(role);
    if (role === 'customer') {
      if (location.pathname.startsWith('/merchant') || location.pathname.startsWith('/delivery') || location.pathname.startsWith('/admin')) {
        navigate('/explore');
      }
    } else if (role === 'merchant') {
      navigate('/merchant/dashboard');
    } else if (role === 'delivery') {
      navigate('/delivery/dashboard');
    } else if (role === 'admin') {
      navigate('/admin/dashboard');
    }
  };

  const roles: { role: UserRole; label: string; icon: React.ReactNode; path: string }[] = [
    { role: 'customer', label: 'Customer View', icon: <ShoppingBag className="w-3.5 h-3.5" />, path: '/explore' },
    { role: 'merchant', label: 'Merchant Hub', icon: <StoreIcon className="w-3.5 h-3.5" />, path: '/merchant/dashboard' },
    { role: 'delivery', label: 'Delivery Partner', icon: <Bike className="w-3.5 h-3.5" />, path: '/delivery/dashboard' },
    { role: 'admin', label: 'Super Admin', icon: <Shield className="w-3.5 h-3.5" />, path: '/admin/dashboard' },
  ];

  return (
    <aside aria-label="Demo mode switcher" className="bg-stone-900 text-stone-200 text-xs border-b border-stone-800 px-4 py-1.5 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-50">
      <div className="flex items-center gap-2">
        <span className="text-stone-400 font-medium">Hyperlocal Simulation Mode:</span>
        <div className="flex items-center gap-1 bg-stone-800/80 p-0.5 rounded-lg border border-stone-700/60">
          {roles.map((item) => {
            const isActive = currentUser.role === item.role;
            return (
              <button
                key={item.role}
                onClick={() => handleRoleSelect(item.role)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition-all ${
                  isActive
                    ? 'bg-orange-500 text-white shadow-xs'
                    : 'text-stone-400 hover:text-white hover:bg-stone-700/60'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-stone-400 hidden sm:inline">
          Active: <strong className="text-stone-200">{currentUser.name}</strong> ({currentUser.role})
        </span>
        <button
          onClick={() => {
            if (confirm('Reset all demo orders, stock inventory, and stores to initial seed state?')) {
              resetToSeedData();
              window.location.reload();
            }
          }}
          className="flex items-center gap-1.5 text-stone-300 hover:text-white px-2 py-0.5 rounded-md hover:bg-stone-800 transition-colors"
          title="Reset orders, inventory, and stores to seed state"
        >
          <RotateCcw className="w-3 h-3 text-orange-400" />
          <span>Reset Demo Data</span>
        </button>
      </div>
    </aside>
  );
};
