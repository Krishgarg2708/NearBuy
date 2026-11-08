import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useMarketplaceStore } from '../store/marketplaceStore';
import { usePushNotificationStore } from '../store/pushNotificationStore';
import { LeafletMap, MapMarker } from '../components/common/LeafletMap';
import { OrderStatus } from '../types';
import {
  Clock,
  MapPin,
  CheckCircle2,
  Phone,
  MessageCircle,
  ShieldCheck,
  ChevronRight,
  ArrowLeft,
  Store,
  Bike,
  Package,
  RotateCcw,
  AlertCircle,
  X,
  Smartphone,
  Bell,
} from 'lucide-react';

export const OrderTrackingView: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { orders, updateOrderStatus, cancelOrder, stores, deliveryPartners } = useMarketplaceStore();

  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [messages, setMessages] = useState<Array<{ sender: 'partner' | 'user'; text: string; time: string }>>([
    {
      sender: 'partner',
      text: 'Namaste! I have picked up your order from the store and am heading your way.',
      time: 'Just now',
    },
  ]);

  const order = orders.find((o) => o.id === orderId) || orders[0];
  const merchantStore = stores.find((s) => s.id === order?.merchantId);
  const partner = deliveryPartners.find((dp) => dp.id === order?.deliveryPartnerId) || deliveryPartners[0];

  const statusSteps: { key: OrderStatus; label: string; desc: string }[] = [
    { key: 'placed', label: 'Order Placed', desc: 'Received & authorized' },
    { key: 'accepted', label: 'Store Accepted', desc: 'Inventory confirmed' },
    { key: 'preparing', label: 'Packing Order', desc: 'Fresh item packaging' },
    { key: 'ready', label: 'Ready for Dispatch', desc: 'Sealed & waiting' },
    { key: 'picked_up', label: 'Picked Up', desc: 'Delivery partner in transit' },
    { key: 'out_for_delivery', label: 'Out for Delivery', desc: 'Arriving in ~8 mins' },
    { key: 'delivered', label: 'Delivered', desc: 'Handed over to customer' },
  ];

  const currentStepIndex = statusSteps.findIndex((s) => s.key === order.status);

  // Map route between store and customer location
  const storeCoord: [number, number] = merchantStore ? [merchantStore.lat, merchantStore.lng] : [12.9716, 77.6412];
  const customerCoord: [number, number] = [order.deliveryAddress.lat, order.deliveryAddress.lng];

  // Simulated intermediate driver position based on status
  const driverLat =
    order.status === 'out_for_delivery'
      ? (storeCoord[0] + customerCoord[0]) / 2 + 0.001
      : storeCoord[0];
  const driverLng =
    order.status === 'out_for_delivery'
      ? (storeCoord[1] + customerCoord[1]) / 2 + 0.001
      : storeCoord[1];

  const mapMarkers: MapMarker[] = useMemo(() => {
    return [
      {
        id: 'store_marker',
        lat: storeCoord[0],
        lng: storeCoord[1],
        title: order.merchantName,
        subtitle: 'Pickup Merchant Location',
        type: 'store',
      },
      {
        id: 'customer_marker',
        lat: customerCoord[0],
        lng: customerCoord[1],
        title: order.customerName,
        subtitle: order.deliveryAddress.street,
        type: 'user',
      },
      ...(order.status === 'out_for_delivery' || order.status === 'picked_up'
        ? [
            {
              id: 'driver_marker',
              lat: driverLat,
              lng: driverLng,
              title: `${partner.name} (Partner)`,
              subtitle: `${partner.vehicleType} · En route`,
              type: 'driver' as const,
            },
          ]
        : []),
    ];
  }, [storeCoord, customerCoord, driverLat, driverLng, order, partner]);

  // Step progression simulator
  const handleAdvanceStep = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < statusSteps.length) {
      const nextStatus = statusSteps[nextIndex].key;
      updateOrderStatus(order.id, nextStatus, `Live simulation advanced to ${statusSteps[nextIndex].label}`);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    const userText = chatMessage.trim();
    setMessages((prev) => [...prev, { sender: 'user', text: userText, time: 'Just now' }]);
    setChatMessage('');

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'partner',
          text: 'Got it! I will follow your instructions upon arrival. Thank you!',
          time: 'Just now',
        },
      ]);
    }, 1000);
  };

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold">Order not found</h2>
        <Link to="/customer/orders" className="text-orange-500 font-semibold hover:underline">
          View All Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner & Demo Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200 dark:border-stone-800">
        <div>
          <Link
            to="/customer/orders"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-900 dark:hover:text-stone-200 mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to My Orders</span>
          </Link>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-stone-950 dark:text-white">
              Tracking Order #{order.orderNumber}
            </h1>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                order.status === 'delivered'
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                  : order.status === 'cancelled'
                  ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                  : 'bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300'
              }`}
            >
              {order.status.replace('_', ' ')}
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Placed from <strong>{order.merchantName}</strong> · Estimated Delivery in ~15 mins
          </p>
        </div>

        {/* Demo Fast-Forward & Push Notification Controls */}
        <div className="flex flex-wrap items-center gap-2 shrink-0 self-start sm:self-auto">
          <button
            onClick={() => usePushNotificationStore.getState().setSettingsOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 text-xs font-semibold transition-colors"
            title="Configure Push Notification alerts & style"
          >
            <Smartphone className="w-3.5 h-3.5 text-orange-500" />
            <span>Push Settings</span>
          </button>

          {order.status !== 'delivered' && order.status !== 'cancelled' && (
            <button
              onClick={handleAdvanceStep}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-all shadow-md shadow-orange-500/20 cursor-pointer"
              title="Fast forward simulation to test next status step and trigger push notification"
            >
              <span>Simulate Next Step</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Interactive Map & Driver Card */}
        <div className="lg:col-span-7 space-y-6">
          {/* Leaflet Delivery Map */}
          <div className="h-96 rounded-3xl overflow-hidden border border-stone-200 dark:border-stone-800 shadow-sm relative">
            <LeafletMap
              center={[(storeCoord[0] + customerCoord[0]) / 2, (storeCoord[1] + customerCoord[1]) / 2]}
              zoom={14}
              markers={mapMarkers}
              routePath={[storeCoord, [driverLat, driverLng], customerCoord]}
              className="h-full w-full"
            />
          </div>

          {/* Delivery Partner Contact Card */}
          <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <img
                src={partner.avatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120'}
                alt={partner.name}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-orange-500"
              />
              <div>
                <div className="flex items-center gap-2">
                  <div className="font-extrabold text-sm text-stone-950 dark:text-white">
                    {partner.name}
                  </div>
                  <span className="text-[11px] font-bold text-amber-500">★ {partner.rating}</span>
                </div>
                <div className="text-xs text-stone-500 mt-0.5">
                  Assigned Delivery Partner · {partner.vehicleType} ({partner.vehicleNumber})
                </div>
                <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                  {partner.totalDeliveries}+ deliveries in your neighborhood
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => setChatOpen(!chatOpen)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-xs font-bold transition-colors text-stone-800 dark:text-stone-200"
              >
                <MessageCircle className="w-3.5 h-3.5 text-orange-500" />
                <span>Chat</span>
              </button>
              <a
                href={`tel:${partner.phone}`}
                onClick={(e) => {
                  e.preventDefault();
                  alert(`Calling ${partner.name} at ${partner.phone} (Simulated)`);
                }}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-all shadow-xs"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call</span>
              </a>
            </div>
          </div>

          {/* Chat Drawer Box */}
          {chatOpen && (
            <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 p-4 shadow-lg space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-800">
                <span className="text-xs font-bold">Chat with {partner.name}</span>
                <button onClick={() => setChatOpen(false)} className="text-stone-400 hover:text-stone-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto p-1">
                {messages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-2xl text-xs max-w-[80%] ${
                      m.sender === 'user'
                        ? 'ml-auto bg-orange-500 text-white'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200'
                    }`}
                  >
                    <div>{m.text}</div>
                    <div className="text-[9px] opacity-70 text-right mt-0.5">{m.time}</div>
                  </div>
                ))}
              </div>
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder="Send a quick note (e.g. at gate)..."
                  className="flex-1 px-3 py-2 rounded-xl text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-orange-500 text-white text-xs font-bold"
                >
                  Send
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Right Column: Timeline & Order Summary */}
        <div className="lg:col-span-5 space-y-6">
          {/* Order Status Timeline */}
          <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 p-6 shadow-xs space-y-5">
            <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wider">
              Live Order Progress
            </h2>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-200 dark:before:bg-stone-800">
              {statusSteps.map((step, idx) => {
                const isPassed = idx <= currentStepIndex;
                const isCurrent = idx === currentStepIndex;

                return (
                  <div key={step.key} className="relative flex items-start gap-3">
                    {/* Step Icon */}
                    <div
                      className={`absolute -left-6 mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] transition-all ${
                        isCurrent
                          ? 'bg-orange-500 text-white ring-4 ring-orange-500/20'
                          : isPassed
                          ? 'bg-emerald-500 text-white'
                          : 'bg-stone-200 dark:bg-stone-800 text-stone-400'
                      }`}
                    >
                      {isPassed ? <CheckCircle2 className="w-3.5 h-3.5" /> : idx + 1}
                    </div>

                    <div>
                      <div
                        className={`text-xs font-bold ${
                          isCurrent
                            ? 'text-orange-600 dark:text-orange-400'
                            : isPassed
                            ? 'text-stone-900 dark:text-stone-100'
                            : 'text-stone-400'
                        }`}
                      >
                        {step.label}
                      </div>
                      <div className="text-[11px] text-stone-500">{step.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Cancel Button if early stage */}
            {currentStepIndex <= 2 && order.status !== 'cancelled' && (
              <div className="pt-4 border-t border-stone-100 dark:border-stone-800">
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to cancel this order?')) {
                      cancelOrder(order.id, 'Cancelled by customer before dispatch.');
                    }
                  }}
                  className="w-full py-2.5 rounded-xl border border-rose-200 dark:border-rose-900 text-rose-600 text-xs font-semibold hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
                >
                  Cancel Order
                </button>
              </div>
            )}
          </div>

          {/* Order Details & Receipt */}
          <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wider">
              Items from {order.merchantName}
            </h2>

            <div className="divide-y divide-stone-100 dark:divide-stone-800">
              {order.items.map((item, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-stone-900 dark:text-stone-100">
                      {item.title}
                    </div>
                    <div className="text-[11px] text-stone-400">
                      Qty: {item.quantity} · {item.unit}
                    </div>
                  </div>
                  <div className="font-bold tabular-nums">
                    ₹{item.price * item.quantity}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-stone-200 dark:border-stone-800 flex justify-between items-baseline text-xs">
              <span className="font-bold text-stone-900 dark:text-stone-100">Total Paid</span>
              <span className="text-base font-black text-stone-900 dark:text-white tabular-nums">
                ₹{order.total}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
