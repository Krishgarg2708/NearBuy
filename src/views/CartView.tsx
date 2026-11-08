import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { useMarketplaceStore } from '../store/marketplaceStore';
import { useLocationStore } from '../store/locationStore';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Store,
  Tag,
  Check,
  X,
  Clock,
  MapPin,
  ShieldCheck,
} from 'lucide-react';

export const CartView: React.FC = () => {
  const navigate = useNavigate();
  const {
    items,
    getItemsByMerchant,
    updateQuantity,
    removeItem,
    clearCart,
    orderType,
    setOrderType,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    couponError,
    getSubtotal,
    getDeliveryFee,
    getDiscount,
    getTaxes,
    getTotal,
  } = useCartStore();

  const { currentAddress } = useLocationStore();
  const [couponInput, setCouponInput] = useState('');

  const groupedItems = getItemsByMerchant();
  const merchantCount = Object.keys(groupedItems).length;
  const subtotal = getSubtotal();
  const deliveryFee = getDeliveryFee();
  const discount = getDiscount();
  const taxes = getTaxes();
  const total = getTotal();

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const success = applyCoupon(couponInput);
    if (success) {
      setCouponInput('');
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-400 flex items-center justify-center mx-auto">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
          Your shopping bag is empty
        </h2>
        <p className="text-xs text-stone-500 max-w-sm mx-auto">
          Explore nearby fresh stores, bakeries, and electronic merchants to add items to your cart.
        </p>
        <Link
          to="/explore"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-orange-500 text-white text-xs font-bold hover:bg-orange-600 transition-all shadow-md"
        >
          <span>Explore Local Marketplace</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title & Clear Cart */}
      <div className="flex items-center justify-between pb-4 border-b border-stone-200 dark:border-stone-800">
        <div>
          <h1 className="text-2xl font-extrabold text-stone-950 dark:text-white">
            Shopping Bag ({items.reduce((s, i) => s + i.quantity, 0)} items)
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Grouped by {merchantCount} neighborhood merchant{merchantCount > 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs text-rose-500 hover:text-rose-600 font-semibold flex items-center gap-1"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear All</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Multi-Merchant Grouped Cart Items */}
        <div className="lg:col-span-8 space-y-6">
          {Object.entries(groupedItems).map(([merchantId, group]) => (
            <div
              key={merchantId}
              className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 overflow-hidden shadow-xs"
            >
              {/* Merchant Sub-Header */}
              <div className="p-4 sm:p-5 border-b border-stone-100 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-800/40 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center">
                    <Store className="w-4 h-4" />
                  </div>
                  <div>
                    <Link
                      to={`/stores/${merchantId}`}
                      className="font-bold text-sm text-stone-900 dark:text-stone-100 hover:underline"
                    >
                      {group.merchantName}
                    </Link>
                    <div className="text-[11px] text-stone-400">
                      Neighborhood Partner · Fulfilled directly
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] text-stone-500">
                    {orderType === 'delivery' ? `Delivery fee: ₹${group.deliveryFee}` : 'Store Pickup (Free)'}
                  </span>
                </div>
              </div>

              {/* Items from this merchant */}
              <div className="divide-y divide-stone-100 dark:divide-stone-800 p-2">
                {group.items.map((item) => (
                  <div
                    key={`${item.productId}_${item.merchantId}`}
                    className="p-3 sm:p-4 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-14 h-14 rounded-xl object-cover bg-stone-100 shrink-0"
                      />
                      <div className="min-w-0">
                        <Link
                          to={`/products/${item.productId}`}
                          className="font-semibold text-xs sm:text-sm text-stone-900 dark:text-stone-100 hover:text-orange-600 line-clamp-1 truncate"
                        >
                          {item.title}
                        </Link>
                        <div className="text-[11px] text-stone-400">
                          {item.brand} · {item.unit}
                        </div>
                        <div className="text-xs font-bold text-stone-900 dark:text-stone-100 mt-1 tabular-nums">
                          ₹{item.price}
                        </div>
                      </div>
                    </div>

                    {/* Quantity Stepper & Subtotal */}
                    <div className="flex items-center gap-4 shrink-0">
                      <div className="flex items-center gap-2 bg-stone-100 dark:bg-stone-800 p-1 rounded-xl">
                        <button
                          onClick={() => updateQuantity(item.productId, item.merchantId, item.quantity - 1)}
                          className="p-1 rounded-lg hover:bg-white dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300"
                          title="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs font-bold px-1 tabular-nums min-w-[16px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.merchantId, item.quantity + 1)}
                          className="p-1 rounded-lg hover:bg-white dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300"
                          title="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-right min-w-[65px]">
                        <div className="text-sm font-extrabold text-stone-900 dark:text-stone-100 tabular-nums">
                          ₹{item.price * item.quantity}
                        </div>
                        <button
                          onClick={() => removeItem(item.productId, item.merchantId)}
                          className="text-[10px] text-stone-400 hover:text-rose-500 mt-0.5"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Right Column: Order Summary & Checkout Action */}
        <div className="lg:col-span-4 space-y-6 sticky top-24">
          <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 p-6 shadow-xs space-y-5">
            {/* Delivery vs Pickup Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-800 dark:text-stone-200 uppercase tracking-wider block">
                Fulfillment Mode
              </label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-stone-100 dark:bg-stone-800 rounded-xl">
                <button
                  type="button"
                  onClick={() => setOrderType('delivery')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                    orderType === 'delivery'
                      ? 'bg-white dark:bg-stone-900 text-stone-950 dark:text-white shadow-xs'
                      : 'text-stone-500 hover:text-stone-900'
                  }`}
                >
                  Home Delivery
                </button>
                <button
                  type="button"
                  onClick={() => setOrderType('pickup')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                    orderType === 'pickup'
                      ? 'bg-white dark:bg-stone-900 text-stone-950 dark:text-white shadow-xs'
                      : 'text-stone-500 hover:text-stone-900'
                  }`}
                >
                  Store Pickup
                </button>
              </div>
            </div>

            {/* Destination Preview */}
            <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-100 dark:border-stone-700/60 text-xs text-stone-600 dark:text-stone-300 flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-stone-900 dark:text-stone-100">
                  {orderType === 'delivery' ? 'Deliver to:' : 'Pickup Area:'}
                </div>
                <div className="text-[11px] text-stone-400 mt-0.5">
                  {currentAddress.street}, {currentAddress.area}
                </div>
              </div>
            </div>

            {/* Coupon Code Input */}
            <div className="space-y-2 pt-2 border-t border-stone-100 dark:border-stone-800">
              <label className="text-xs font-bold text-stone-800 dark:text-stone-200 uppercase tracking-wider block">
                Promo Code
              </label>

              {appliedCoupon ? (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs">
                  <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold">
                    <Check className="w-4 h-4" />
                    <span>{appliedCoupon.code} applied</span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-stone-400 hover:text-rose-500 text-xs"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="NEARBUY50, FREEDEL..."
                    className="flex-1 px-3 py-2 rounded-xl text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 uppercase font-mono"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-bold hover:bg-stone-800"
                  >
                    Apply
                  </button>
                </form>
              )}

              {couponError && (
                <p className="text-[11px] text-rose-500 font-medium">{couponError}</p>
              )}
            </div>

            {/* Bill Breakdown */}
            <div className="space-y-2 pt-3 border-t border-stone-100 dark:border-stone-800 text-xs">
              <div className="flex justify-between text-stone-500">
                <span>Items Subtotal</span>
                <span className="font-semibold text-stone-800 dark:text-stone-200 tabular-nums">
                  ₹{subtotal}
                </span>
              </div>
              <div className="flex justify-between text-stone-500">
                <span>Delivery Charges ({merchantCount} store{merchantCount > 1 ? 's' : ''})</span>
                <span className="font-semibold text-stone-800 dark:text-stone-200 tabular-nums">
                  {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                </span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                  <span>Coupon Discount</span>
                  <span className="tabular-nums">-₹{discount}</span>
                </div>
              )}
              <div className="flex justify-between text-stone-500">
                <span>Taxes & GST (5%)</span>
                <span className="font-semibold text-stone-800 dark:text-stone-200 tabular-nums">
                  ₹{taxes}
                </span>
              </div>

              <div className="pt-3 border-t border-stone-200 dark:border-stone-800 flex justify-between items-baseline">
                <div>
                  <div className="text-sm font-extrabold text-stone-950 dark:text-white">
                    Grand Total
                  </div>
                  <div className="text-[10px] text-stone-400">Inclusive of all local taxes</div>
                </div>
                <div className="text-xl font-black text-stone-950 dark:text-white tabular-nums">
                  ₹{total}
                </div>
              </div>
            </div>

            {/* Proceed to Checkout Button */}
            <button
              onClick={() => navigate('/checkout')}
              className="w-full py-3.5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-extrabold flex items-center justify-center gap-2 transition-all shadow-lg shadow-orange-500/25"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
