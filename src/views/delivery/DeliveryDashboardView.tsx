import React, { useState, useMemo } from 'react';
import { useMarketplaceStore } from '../../store/marketplaceStore';
import { useAuthStore } from '../../store/authStore';
import { LeafletMap, MapMarker } from '../../components/common/LeafletMap';
import { Order, DeliveryPartner } from '../../types';
import {
  Bike,
  MapPin,
  Clock,
  Phone,
  CheckCircle2,
  DollarSign,
  Package,
  Navigation,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const DeliveryDashboardView: React.FC = () => {
  const { orders, deliveryPartners, updateOrderStatus, updateDeliveryPartnerStatus } =
    useMarketplaceStore();
  const { currentUser } = useAuthStore();

  // Vikram Singh (partner deliv_1)
  const currentPartner = deliveryPartners[0];

  // Active delivery for partner
  const activeOrder = useMemo(() => {
    return orders.find(
      (o) =>
        (o.deliveryPartnerId === currentPartner.id || o.id === currentPartner.activeOrderId) &&
        (o.status === 'picked_up' || o.status === 'out_for_delivery')
    );
  }, [orders, currentPartner]);

  // Available ready orders looking for delivery pickup
  const availableOrders = useMemo(() => {
    return orders.filter(
      (o) =>
        o.orderType === 'delivery' &&
        (o.status === 'ready' || (o.status === 'accepted' && !o.deliveryPartnerId))
    );
  }, [orders]);

  // Completed deliveries today
  const completedOrders = useMemo(() => {
    return orders.filter(
      (o) => o.deliveryPartnerId === currentPartner.id && o.status === 'delivered'
    );
  }, [orders, currentPartner]);

  const handleAcceptDelivery = (order: Order) => {
    updateDeliveryPartnerStatus(currentPartner.id, 'busy', order.id);
    updateOrderStatus(order.id, 'picked_up', `${currentPartner.name} accepted and picked up the order.`);
  };

  const handleMarkDelivered = (order: Order) => {
    updateDeliveryPartnerStatus(currentPartner.id, 'available', undefined);
    updateOrderStatus(order.id, 'delivered', `Delivered directly by ${currentPartner.name}.`);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Profile Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-stone-900 text-white shadow-xl">
        <div className="flex items-center gap-4">
          <img
            src={currentPartner.avatar}
            alt={currentPartner.name}
            className="w-14 h-14 rounded-2xl object-cover border-2 border-orange-500 shadow-md"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-white">
                {currentPartner.name}
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-white uppercase">
                {currentPartner.status}
              </span>
            </div>
            <p className="text-xs text-stone-300 mt-0.5">
              {currentPartner.vehicleType} · {currentPartner.vehicleNumber} · ★ {currentPartner.rating}
            </p>
          </div>
        </div>

        {/* Today's Earnings Snapshot */}
        <div className="flex items-center gap-4 bg-stone-800/80 p-3 rounded-2xl border border-stone-700/80">
          <div>
            <div className="text-[10px] text-stone-400">Earnings Today</div>
            <div className="text-lg font-black text-emerald-400 tabular-nums">
              ₹{currentPartner.earningsToday}
            </div>
          </div>
          <div className="h-6 w-px bg-stone-700" />
          <div>
            <div className="text-[10px] text-stone-400">Completed</div>
            <div className="text-lg font-black text-white tabular-nums">
              {completedOrders.length + 6} drops
            </div>
          </div>
        </div>
      </div>

      {/* Active Trip Banner */}
      {activeOrder && (
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-3xl p-6 text-white shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bike className="w-5 h-5 text-white animate-bounce" />
              <span className="text-xs font-bold uppercase tracking-wider">Active Delivery Trip</span>
            </div>
            <span className="text-xs font-mono font-bold bg-white/20 px-2.5 py-0.5 rounded-full">
              #{activeOrder.orderNumber}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
              <div className="text-[10px] uppercase font-bold text-orange-100">Pickup Merchant</div>
              <div className="font-extrabold text-sm text-white mt-0.5">{activeOrder.merchantName}</div>
              <div className="text-xs text-orange-100 mt-1">{activeOrder.merchantAddress}</div>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
              <div className="text-[10px] uppercase font-bold text-orange-100">Drop Address</div>
              <div className="font-extrabold text-sm text-white mt-0.5">{activeOrder.customerName}</div>
              <div className="text-xs text-orange-100 mt-1">
                {activeOrder.deliveryAddress.street}, {activeOrder.deliveryAddress.area}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Link
              to={`/track/${activeOrder.id}`}
              className="px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-xs font-bold transition-colors"
            >
              Open GPS Route
            </Link>
            <button
              onClick={() => handleMarkDelivered(activeOrder)}
              className="px-6 py-2 rounded-xl bg-white text-orange-600 text-xs font-black hover:bg-stone-100 transition-all shadow-md"
            >
              ✓ Mark Delivered to Customer
            </button>
          </div>
        </div>
      )}

      {/* Available Ready Deliveries */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">
            Available Deliveries Ready for Pickup ({availableOrders.length})
          </h2>
          <p className="text-xs text-stone-400">
            Accept nearest orders from Indiranagar and Koramangala merchant hubs.
          </p>
        </div>

        {availableOrders.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800">
            <Package className="w-8 h-8 text-stone-300 mx-auto" />
            <p className="text-xs text-stone-500 mt-2">
              No new orders waiting for pickup right now. All current orders are assigned or being packed.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {availableOrders.map((ord) => (
              <div
                key={ord.id}
                className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 p-5 shadow-xs space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-stone-900 dark:text-stone-100">
                      #{ord.orderNumber}
                    </span>
                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                      ₹40 Payout
                    </span>
                  </div>

                  <div>
                    <div className="text-[10px] text-stone-400">Store Pickup</div>
                    <div className="font-bold text-xs text-stone-900 dark:text-stone-100">
                      {ord.merchantName}
                    </div>
                    <div className="text-[11px] text-stone-500">{ord.merchantAddress}</div>
                  </div>

                  <div className="pt-2 border-t border-stone-100 dark:border-stone-800">
                    <div className="text-[10px] text-stone-400">Customer Drop</div>
                    <div className="font-bold text-xs text-stone-900 dark:text-stone-100">
                      {ord.customerName}
                    </div>
                    <div className="text-[11px] text-stone-500">
                      {ord.deliveryAddress.street}, {ord.deliveryAddress.area}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleAcceptDelivery(ord)}
                  className="w-full py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white dark:bg-stone-100 dark:text-stone-900 text-xs font-bold transition-all shadow-xs"
                >
                  Accept Delivery (Pick Up Now)
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
