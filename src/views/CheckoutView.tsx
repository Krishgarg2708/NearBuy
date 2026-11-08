import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { useMarketplaceStore } from '../store/marketplaceStore';
import { useLocationStore } from '../store/locationStore';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';
import { Order, OrderItem, OrderTimelineEvent } from '../types';
import confetti from 'canvas-confetti';
import {
  MapPin,
  Clock,
  CreditCard,
  Banknote,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  ArrowLeft,
  ChevronRight,
  Store,
} from 'lucide-react';

export const CheckoutView: React.FC = () => {
  const navigate = useNavigate();
  const {
    items,
    getItemsByMerchant,
    orderType,
    appliedCoupon,
    getSubtotal,
    getDeliveryFee,
    getDiscount,
    getTaxes,
    getTotal,
    clearCart,
  } = useCartStore();

  const { currentAddress, allAddresses, setCurrentAddress } = useLocationStore();
  const { currentUser } = useAuthStore();
  const { stores, addOrder } = useMarketplaceStore();
  const { addNotification } = useNotificationStore();

  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'cod' | 'card' | 'online'>('upi');
  const [upiId, setUpiId] = useState('priya.sharma@okhdfcbank');
  const [deliverySlot, setDeliverySlot] = useState('Express (15–25 mins)');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subtotal = getSubtotal();
  const deliveryFee = getDeliveryFee();
  const discount = getDiscount();
  const taxes = getTaxes();
  const total = getTotal();
  const groupedItems = getItemsByMerchant();

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold">Your cart is empty</h2>
        <Link to="/explore" className="text-orange-500 font-semibold hover:underline">
          Return to Marketplace
        </Link>
      </div>
    );
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate payment authorization
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Fire celebration confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#F97316', '#7C3AED', '#16A34A', '#EAB308'],
      });
    } catch (e) {
      // Ignored if canvas not ready
    }

    const orderId = 'order_' + Date.now();
    const orderNumber = 'NB-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);

    // Primary merchant from items (first merchant)
    const firstMerchantId = Object.keys(groupedItems)[0];
    const merchantStore = stores.find((s) => s.id === firstMerchantId);

    const orderItems: OrderItem[] = items.map((it) => ({
      productId: it.productId,
      title: it.title,
      brand: it.brand,
      price: it.price,
      quantity: it.quantity,
      unit: it.unit,
      image: it.image,
    }));

    const timeline: OrderTimelineEvent[] = [
      {
        status: 'placed',
        title: orderType === 'delivery' ? 'Order Placed' : 'Pickup Order Confirmed',
        description: `Order verified via ${paymentMethod.toUpperCase()} simulation.`,
        timestamp: new Date().toISOString(),
      },
    ];

    const newOrder: Order = {
      id: orderId,
      orderNumber,
      customerId: currentUser.id,
      customerName: currentUser.name,
      customerPhone: currentUser.phone,
      deliveryAddress: currentAddress,
      merchantId: firstMerchantId,
      merchantName: merchantStore?.name || 'Neighborhood Merchant',
      merchantAddress: merchantStore?.address || 'Indiranagar, Bengaluru',
      merchantPhone: merchantStore?.phone || '+91 80 4123 4567',
      items: orderItems,
      subtotal,
      deliveryFee,
      discount,
      taxes,
      total,
      couponCode: appliedCoupon?.code,
      paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
      orderType,
      status: 'placed',
      createdAt: new Date().toISOString(),
      estimatedDeliveryTime: new Date(Date.now() + 25 * 60000).toISOString(),
      timeline,
      notes: deliveryInstructions,
    };

    // Save order in centralized store (decreases mock inventory and adds order)
    addOrder(newOrder);

    // Notify customer
    addNotification(
      'Order Confirmed!',
      `Your order #${orderNumber} from ${newOrder.merchantName} has been received.`,
      'order',
      `/track/${orderId}`
    );

    // Clear cart and redirect to live tracking
    clearCart();
    setIsSubmitting(false);
    navigate(`/track/${orderId}`);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <Link
        to="/cart"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-900 dark:hover:text-stone-200 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Return to Shopping Bag</span>
      </Link>

      <div className="pb-4 border-b border-stone-200 dark:border-stone-800">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-950 dark:text-white">
          Secure Hyperlocal Checkout
        </h1>
        <p className="text-xs text-stone-500 mt-0.5">
          Review delivery details, select payment method, and complete simulated order.
        </p>
      </div>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Delivery Address & Payment */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. Address Selection */}
          <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wider flex items-center gap-2">
                <MapPin className="w-4 h-4 text-orange-500" />
                <span>1. {orderType === 'delivery' ? 'Delivery Destination' : 'Pickup Store'}</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {allAddresses.map((addr) => {
                const isSelected = addr.id === currentAddress.id;
                return (
                  <button
                    key={addr.id}
                    type="button"
                    onClick={() => setCurrentAddress(addr)}
                    className={`p-3.5 rounded-2xl text-left border transition-all text-xs ${
                      isSelected
                        ? 'border-orange-500 bg-orange-50/40 dark:bg-orange-950/20 text-stone-900 dark:text-white font-medium ring-2 ring-orange-500/20'
                        : 'border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800/40 text-stone-600 dark:text-stone-400'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold text-stone-900 dark:text-stone-100">
                      <span>{addr.label}</span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-orange-500" />}
                    </div>
                    <div className="text-[11px] text-stone-500 mt-1 line-clamp-2">
                      {addr.street}, {addr.area}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Delivery Instructions */}
            <div>
              <label className="text-xs text-stone-500 block mb-1">
                Delivery Instructions (Optional)
              </label>
              <input
                type="text"
                value={deliveryInstructions}
                onChange={(e) => setDeliveryInstructions(e.target.value)}
                placeholder="e.g. Leave with security guard, don't ring bell..."
                className="w-full px-3 py-2 rounded-xl text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-hidden"
              />
            </div>
          </div>

          {/* 2. Delivery Time Slot */}
          <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-500" />
              <span>2. Delivery Time Window</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { slot: 'Express (15–25 mins)', desc: 'Immediate partner dispatch' },
                { slot: 'Today Evening (6–8 PM)', desc: 'Post-work convenience' },
                { slot: 'Tomorrow Morning', desc: '8 AM – 10 AM fresh drop' },
              ].map((item) => (
                <button
                  key={item.slot}
                  type="button"
                  onClick={() => setDeliverySlot(item.slot)}
                  className={`p-3 rounded-2xl text-left border transition-all text-xs ${
                    deliverySlot === item.slot
                      ? 'border-orange-500 bg-orange-50/40 dark:bg-orange-950/20 text-stone-900 dark:text-white font-medium ring-2 ring-orange-500/20'
                      : 'border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800/40 text-stone-600 dark:text-stone-400'
                  }`}
                >
                  <div className="font-bold text-stone-900 dark:text-stone-100">{item.slot}</div>
                  <div className="text-[10px] text-stone-400 mt-0.5">{item.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 3. Payment Method */}
          <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wider flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-orange-500" />
              <span>3. Payment Method (Simulated)</span>
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('upi')}
                className={`p-3.5 rounded-2xl text-center border transition-all text-xs ${
                  paymentMethod === 'upi'
                    ? 'border-orange-500 bg-orange-50/40 dark:bg-orange-950/20 text-orange-600 font-bold ring-2 ring-orange-500/20'
                    : 'border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-600'
                }`}
              >
                <Smartphone className="w-5 h-5 mx-auto mb-1 text-orange-500" />
                <span>UPI (GPay / PhonePe)</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-3.5 rounded-2xl text-center border transition-all text-xs ${
                  paymentMethod === 'card'
                    ? 'border-orange-500 bg-orange-50/40 dark:bg-orange-950/20 text-orange-600 font-bold ring-2 ring-orange-500/20'
                    : 'border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-600'
                }`}
              >
                <CreditCard className="w-5 h-5 mx-auto mb-1 text-purple-500" />
                <span>Credit / Debit Card</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('cod')}
                className={`p-3.5 rounded-2xl text-center border transition-all text-xs ${
                  paymentMethod === 'cod'
                    ? 'border-orange-500 bg-orange-50/40 dark:bg-orange-950/20 text-orange-600 font-bold ring-2 ring-orange-500/20'
                    : 'border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-600'
                }`}
              >
                <Banknote className="w-5 h-5 mx-auto mb-1 text-emerald-500" />
                <span>Cash on Delivery</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('online')}
                className={`p-3.5 rounded-2xl text-center border transition-all text-xs ${
                  paymentMethod === 'online'
                    ? 'border-orange-500 bg-orange-50/40 dark:bg-orange-950/20 text-orange-600 font-bold ring-2 ring-orange-500/20'
                    : 'border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-600'
                }`}
              >
                <ShieldCheck className="w-5 h-5 mx-auto mb-1 text-blue-500" />
                <span>Net Banking</span>
              </button>
            </div>

            {/* UPI Details Box */}
            {paymentMethod === 'upi' && (
              <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 space-y-2">
                <label className="text-[11px] text-stone-500 block">Verified Virtual UPI ID</label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 font-mono"
                />
                <p className="text-[10px] text-stone-400">
                  Instant authorization simulation. No real money will be charged.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Order Review & Final Submission */}
        <div className="lg:col-span-5 space-y-6 sticky top-24">
          <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 p-6 shadow-xs space-y-5">
            <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wider">
              Order Summary
            </h2>

            {/* Item list snapshot */}
            <div className="max-h-52 overflow-y-auto space-y-3 pr-1">
              {items.map((item) => (
                <div
                  key={`${item.productId}_${item.merchantId}`}
                  className="flex items-center justify-between text-xs gap-3"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-10 h-10 rounded-lg object-cover bg-stone-100 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="font-semibold text-stone-900 dark:text-stone-100 truncate">
                        {item.title}
                      </div>
                      <div className="text-[10px] text-stone-400">
                        Qty: {item.quantity} · {item.storeName}
                      </div>
                    </div>
                  </div>
                  <div className="font-bold text-stone-900 dark:text-stone-100 tabular-nums shrink-0">
                    ₹{item.price * item.quantity}
                  </div>
                </div>
              ))}
            </div>

            {/* Price Calculations */}
            <div className="space-y-2 pt-3 border-t border-stone-100 dark:border-stone-800 text-xs">
              <div className="flex justify-between text-stone-500">
                <span>Subtotal</span>
                <span className="font-semibold text-stone-800 dark:text-stone-200 tabular-nums">
                  ₹{subtotal}
                </span>
              </div>
              <div className="flex justify-between text-stone-500">
                <span>Delivery</span>
                <span className="font-semibold text-stone-800 dark:text-stone-200 tabular-nums">
                  {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                </span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                  <span>Coupon ({appliedCoupon?.code})</span>
                  <span className="tabular-nums">-₹{discount}</span>
                </div>
              )}
              <div className="flex justify-between text-stone-500">
                <span>GST (5%)</span>
                <span className="font-semibold text-stone-800 dark:text-stone-200 tabular-nums">
                  ₹{taxes}
                </span>
              </div>

              <div className="pt-3 border-t border-stone-200 dark:border-stone-800 flex justify-between items-baseline">
                <div>
                  <div className="text-sm font-extrabold text-stone-950 dark:text-white">
                    Total Payable
                  </div>
                  <div className="text-[10px] text-stone-400">Via {paymentMethod.toUpperCase()}</div>
                </div>
                <div className="text-2xl font-black text-stone-950 dark:text-white tabular-nums">
                  ₹{total}
                </div>
              </div>
            </div>

            {/* Place Order CTA */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-2xl bg-orange-500 hover:bg-orange-600 disabled:bg-orange-400 text-white text-xs font-black flex items-center justify-center gap-2 transition-all shadow-lg shadow-orange-500/25 cursor-pointer"
            >
              <span>{isSubmitting ? 'Verifying Order with Store...' : 'Confirm & Place Order'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
