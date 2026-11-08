import React from 'react';
import { Link } from 'react-router-dom';
import { useMarketplaceStore } from '../../store/marketplaceStore';
import { useAuthStore } from '../../store/authStore';
import { Package, Clock, ChevronRight, Store, ArrowRight, ExternalLink } from 'lucide-react';
import { OrderInsightsCard } from '../../components/customer/OrderInsightsCard';

export const CustomerOrdersView: React.FC = () => {
  const { orders } = useMarketplaceStore();
  const { currentUser } = useAuthStore();

  const userOrders = orders.filter(
    (o) => o.customerId === currentUser.id || o.customerName === currentUser.name || o.id === 'order_1001'
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200 dark:border-stone-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-950 dark:text-white">
            My Orders
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Track active neighborhood deliveries, view past receipts and store pickups.
          </p>
        </div>
        <Link
          to="/explore"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-all shadow-xs shrink-0 self-start sm:self-auto"
        >
          <span>Explore Marketplace</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Customer Spending Habits & Savings Insights Card */}
      <OrderInsightsCard />

      {userOrders.length === 0 ? (
        <div className="p-16 text-center bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 space-y-4">
          <Package className="w-10 h-10 text-stone-300 mx-auto" />
          <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">No orders yet</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Place your first hyperlocal order with code NEARBUY50 for flat ₹50 OFF!
          </p>
          <Link
            to="/explore"
            className="inline-block px-5 py-2.5 rounded-xl bg-orange-500 text-white text-xs font-bold"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {userOrders.map((order) => {
            const isDelivered = order.status === 'delivered';
            const isCancelled = order.status === 'cancelled';
            const isActive = !isDelivered && !isCancelled;

            return (
              <div
                key={order.id}
                className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 p-6 shadow-xs space-y-4 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100 dark:border-stone-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-orange-600 flex items-center justify-center font-bold">
                      <Store className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-extrabold text-sm text-stone-900 dark:text-stone-100 flex items-center gap-2">
                        <span>{order.merchantName}</span>
                        <span className="text-xs font-mono text-stone-400">#{order.orderNumber}</span>
                      </div>
                      <div className="text-[11px] text-stone-400">
                        Placed on {new Date(order.createdAt).toLocaleDateString()} at{' '}
                        {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-start sm:self-auto">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        isDelivered
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : isCancelled
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                          : 'bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300'
                      }`}
                    >
                      {order.status.replace('_', ' ')}
                    </span>
                    <Link
                      to={`/track/${order.id}`}
                      className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white dark:bg-stone-100 dark:text-stone-900 text-xs font-bold flex items-center gap-1.5 transition-all"
                    >
                      <span>{isActive ? 'Track Live' : 'View Details'}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                {/* Items in order */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {order.items.map((it, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-100 dark:border-stone-800 flex items-center gap-3 text-xs"
                    >
                      <img
                        src={it.image}
                        alt={it.title}
                        className="w-12 h-12 rounded-xl object-cover bg-stone-200 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="font-semibold text-stone-900 dark:text-stone-100 truncate">
                          {it.title}
                        </div>
                        <div className="text-[11px] text-stone-400">
                          Qty: {it.quantity} · ₹{it.price} each
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2 flex items-center justify-between text-xs text-stone-500">
                  <div>
                    Payment: <strong className="text-stone-800 dark:text-stone-200 uppercase">{order.paymentMethod}</strong> (
                    {order.paymentStatus})
                  </div>
                  <div className="text-sm font-extrabold text-stone-950 dark:text-white tabular-nums">
                    Total: ₹{order.total}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
