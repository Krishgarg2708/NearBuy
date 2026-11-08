import React, { useState, useMemo } from 'react';
import { useMarketplaceStore } from '../../store/marketplaceStore';
import { useAuthStore } from '../../store/authStore';
import {
  TrendingUp,
  PiggyBank,
  ShoppingBag,
  Store,
  Sparkles,
  ArrowUpRight,
  PieChart as PieChartIcon,
  Calendar,
  ChevronDown,
  ChevronUp,
  Tag,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
} from 'recharts';

export const OrderInsightsCard: React.FC = () => {
  const { orders, stores } = useMarketplaceStore();
  const { currentUser } = useAuthStore();

  const [timeframe, setTimeframe] = useState<'month' | 'quarter' | 'year'>('month');
  const [activeMetricTab, setActiveMetricTab] = useState<'spending' | 'categories' | 'savings'>('spending');
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  // Filter orders for active customer
  const customerOrders = useMemo(() => {
    return orders.filter(
      (o) =>
        o.customerId === currentUser.id ||
        o.customerName === currentUser.name ||
        o.id === 'order_1001'
    );
  }, [orders, currentUser]);

  // Total amount spent
  const totalSpent = useMemo(() => {
    return customerOrders
      .filter((o) => o.status !== 'cancelled')
      .reduce((sum, o) => sum + o.total, 0);
  }, [customerOrders]);

  // Realized savings from orders (discounts + price comparison advantage)
  const totalSavings = useMemo(() => {
    return customerOrders
      .filter((o) => o.status !== 'cancelled')
      .reduce((sum, o) => {
        const couponDisc = o.discount || 0;
        const compareBonus = Math.round(o.subtotal * 0.12); // ~12% saved over supermarket MRP via local price comparison
        const deliverySaved = o.deliveryFee === 0 ? 25 : 0;
        return sum + couponDisc + compareBonus + deliverySaved;
      }, 0);
  }, [customerOrders]);

  // Projected monthly savings based on order frequency
  const projectedMonthlySavings = useMemo(() => {
    const orderCount = Math.max(1, customerOrders.length);
    const avgSavingsPerOrder = totalSavings / orderCount;
    // Estimated 4 orders per month
    return Math.round(avgSavingsPerOrder * 4 + 180);
  }, [customerOrders, totalSavings]);

  // Spending habits timeline data
  const spendingTrendData = useMemo(() => {
    if (timeframe === 'month') {
      return [
        { period: 'Week 1', spend: 640, savings: 110, orders: 2 },
        { period: 'Week 2', spend: 890, savings: 165, orders: 3 },
        { period: 'Week 3', spend: 520, savings: 95, orders: 1 },
        { period: 'Week 4 (Now)', spend: totalSpent > 0 ? totalSpent : 796, savings: totalSavings > 0 ? totalSavings : 155, orders: customerOrders.length },
      ];
    } else if (timeframe === 'quarter') {
      return [
        { period: 'Sep 2026', spend: 2840, savings: 480, orders: 9 },
        { period: 'Oct 2026', spend: 3450, savings: 620, orders: 12 },
        { period: 'Nov 2026', spend: 2190 + totalSpent, savings: 410 + totalSavings, orders: 7 + customerOrders.length },
      ];
    } else {
      return [
        { period: 'Q1', spend: 7600, savings: 1280, orders: 24 },
        { period: 'Q2', spend: 9400, savings: 1650, orders: 31 },
        { period: 'Q3', spend: 11200, savings: 2040, orders: 38 },
        { period: 'Q4 (Est.)', spend: 12800, savings: 2450, orders: 42 },
      ];
    }
  }, [timeframe, totalSpent, totalSavings, customerOrders]);

  // Favorite merchant categories
  const categoryData = useMemo(() => {
    return [
      { name: 'Grocery & Staples', spend: 1420, percentage: 42, color: '#F97316' },
      { name: 'Artisan Bakery', spend: 670, percentage: 20, color: '#F59E0B' },
      { name: 'Fruits & Veggies', spend: 550, percentage: 16, color: '#10B981' },
      { name: 'Electronics & Audio', spend: 450, percentage: 13, color: '#8B5CF6' },
      { name: 'Pharmacy & Care', spend: 310, percentage: 9, color: '#EC4899' },
    ];
  }, []);

  // Favorite merchants
  const favoriteMerchants = useMemo(() => {
    return [
      { name: 'Green Basket Organic', ordersCount: 3, spend: 1063, area: 'Indiranagar' },
      { name: 'The Daily Loaf Bakery', ordersCount: 2, spend: 691, area: 'Indiranagar' },
      { name: 'Apex Mobiles & Audio', ordersCount: 1, spend: 1876, area: 'Indiranagar' },
    ];
  }, []);

  return (
    <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-sm overflow-hidden transition-all">
      {/* Header Bar */}
      <div className="p-5 sm:p-6 border-b border-stone-100 dark:border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-extrabold text-stone-950 dark:text-white">
                Hyperlocal Order Insights
              </h2>
              <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/50 px-2 py-0.5 rounded-md">
                Smart Analytics
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Personalized neighborhood spending habits, favorite categories & projected savings
            </p>
          </div>
        </div>

        {/* Timeframe selector & expand toggle */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center gap-1 p-1 bg-stone-100 dark:bg-stone-800 rounded-xl text-xs">
            <button
              onClick={() => setTimeframe('month')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                timeframe === 'month'
                  ? 'bg-white dark:bg-stone-900 text-stone-950 dark:text-white shadow-xs'
                  : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              This Month
            </button>
            <button
              onClick={() => setTimeframe('quarter')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                timeframe === 'quarter'
                  ? 'bg-white dark:bg-stone-900 text-stone-950 dark:text-white shadow-xs'
                  : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              Last 3 Months
            </button>
            <button
              onClick={() => setTimeframe('year')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                timeframe === 'year'
                  ? 'bg-white dark:bg-stone-900 text-stone-950 dark:text-white shadow-xs'
                  : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              2026 YTD
            </button>
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            title={isExpanded ? 'Collapse card' : 'Expand card'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Content Body */}
      {isExpanded && (
        <div className="p-5 sm:p-6 space-y-6 animate-in fade-in duration-200">
          {/* Top KPI Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* 1. Total Spending */}
            <div className="p-4 rounded-2xl bg-stone-50/80 dark:bg-stone-800/40 border border-stone-200/60 dark:border-stone-800 space-y-1">
              <div className="flex items-center justify-between text-xs text-stone-500">
                <span className="font-semibold uppercase tracking-wider text-[10px]">
                  Local Spending
                </span>
                <ShoppingBag className="w-3.5 h-3.5 text-stone-400" />
              </div>
              <div className="text-2xl font-black text-stone-900 dark:text-stone-100 tabular-nums">
                ₹{totalSpent.toLocaleString()}
              </div>
              <div className="text-[11px] text-stone-400">
                Across {customerOrders.length} completed local orders
              </div>
            </div>

            {/* 2. Realized Savings */}
            <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 space-y-1">
              <div className="flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-400">
                <span className="font-semibold uppercase tracking-wider text-[10px]">
                  Realized Local Savings
                </span>
                <PiggyBank className="w-3.5 h-3.5 text-emerald-500" />
              </div>
              <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400 tabular-nums">
                ₹{totalSavings.toLocaleString()}
              </div>
              <div className="text-[11px] text-emerald-600 dark:text-emerald-500 font-medium">
                ~17% saved vs supermarket retail MRP
              </div>
            </div>

            {/* 3. Projected Monthly Savings */}
            <div className="p-4 rounded-2xl bg-orange-50/60 dark:bg-orange-950/20 border border-orange-200/60 dark:border-orange-900/40 space-y-1">
              <div className="flex items-center justify-between text-xs text-orange-700 dark:text-orange-400">
                <span className="font-semibold uppercase tracking-wider text-[10px]">
                  Projected Monthly Savings
                </span>
                <Sparkles className="w-3.5 h-3.5 text-orange-500" />
              </div>
              <div className="text-2xl font-black text-orange-600 dark:text-orange-400 tabular-nums">
                ₹{projectedMonthlySavings.toLocaleString()}
                <span className="text-xs font-normal text-stone-500 ml-1">/ mo</span>
              </div>
              <div className="text-[11px] text-orange-700/80 dark:text-orange-300 font-medium">
                ≈ ₹{(projectedMonthlySavings * 12).toLocaleString()}/year with NearBuy Price Engine
              </div>
            </div>
          </div>

          {/* Metric Sub-Tabs */}
          <div className="flex items-center gap-2 border-b border-stone-100 dark:border-stone-800 pb-2">
            <button
              onClick={() => setActiveMetricTab('spending')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeMetricTab === 'spending'
                  ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
            >
              Spending Habits & Trajectory
            </button>
            <button
              onClick={() => setActiveMetricTab('categories')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeMetricTab === 'categories'
                  ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
            >
              Favorite Merchant Categories
            </button>
            <button
              onClick={() => setActiveMetricTab('savings')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeMetricTab === 'savings'
                  ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
            >
              Savings Breakdown & Projection
            </button>
          </div>

          {/* Sub-Tab 1: Spending Habits Chart */}
          {activeMetricTab === 'spending' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-8 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-stone-700 dark:text-stone-300">
                    Expenditure vs. Realized Savings (INR)
                  </span>
                  <span className="text-stone-400 text-[11px]">
                    Orange: Spending · Purple: Savings
                  </span>
                </div>
                <div className="h-60 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={spendingTrendData}>
                      <defs>
                        <linearGradient id="spendColor" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#F97316" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="#F97316" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="saveColor" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="period" stroke="#888" fontSize={11} />
                      <YAxis stroke="#888" fontSize={11} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1C1917',
                          border: 'none',
                          borderRadius: '12px',
                          color: '#fff',
                          fontSize: '12px',
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="spend"
                        name="Amount Spent"
                        stroke="#F97316"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#spendColor)"
                      />
                      <Area
                        type="monotone"
                        dataKey="savings"
                        name="Savings"
                        stroke="#7C3AED"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#saveColor)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Habit Highlights */}
              <div className="lg:col-span-4 bg-stone-50 dark:bg-stone-800/40 p-4 rounded-2xl border border-stone-200/60 dark:border-stone-800 space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  Spending Insights
                </div>
                <div className="space-y-2.5 text-xs">
                  <div className="flex items-start gap-2">
                    <Zap className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-stone-800 dark:text-stone-200">
                        Peak Shopping Days
                      </div>
                      <div className="text-[11px] text-stone-500">
                        Friday evenings & Saturday mornings for weekend fresh groceries.
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-stone-800 dark:text-stone-200">
                        Average Basket Value
                      </div>
                      <div className="text-[11px] text-stone-500">
                        ₹{customerOrders.length > 0 ? Math.round(totalSpent / customerOrders.length) : 480} per neighborhood order.
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Store className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-stone-800 dark:text-stone-200">
                        Preferred Merchant
                      </div>
                      <div className="text-[11px] text-stone-500">
                        {favoriteMerchants[0].name} (Indiranagar)
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sub-Tab 2: Favorite Merchant Categories */}
          {activeMetricTab === 'categories' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              {/* Category Breakdown Bars */}
              <div className="lg:col-span-7 space-y-3">
                <div className="text-xs font-bold text-stone-700 dark:text-stone-300">
                  Category Share of Wallet
                </div>
                <div className="space-y-2.5">
                  {categoryData.map((cat) => (
                    <div key={cat.name} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-stone-800 dark:text-stone-200 flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: cat.color }}
                          />
                          <span>{cat.name}</span>
                        </span>
                        <span className="tabular-nums text-stone-500">
                          ₹{cat.spend} ({cat.percentage}%)
                        </span>
                      </div>
                      {/* Clean Progress Bar */}
                      <div className="w-full h-2 rounded-full bg-stone-100 dark:bg-stone-800 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${cat.percentage}%`, backgroundColor: cat.color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Favorite Local Stores list */}
              <div className="lg:col-span-5 bg-stone-50 dark:bg-stone-800/40 p-4 rounded-2xl border border-stone-200/60 dark:border-stone-800 space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  Most Frequent Local Merchants
                </div>
                <div className="space-y-2">
                  {favoriteMerchants.map((m, idx) => (
                    <div
                      key={m.name}
                      className="p-2.5 rounded-xl bg-white dark:bg-stone-800 border border-stone-100 dark:border-stone-700 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-lg bg-orange-500 text-white font-bold text-[10px] flex items-center justify-center">
                          #{idx + 1}
                        </div>
                        <div>
                          <div className="font-bold text-stone-900 dark:text-stone-100">{m.name}</div>
                          <div className="text-[10px] text-stone-400">{m.area} · {m.ordersCount} orders</div>
                        </div>
                      </div>
                      <div className="font-black tabular-nums text-stone-800 dark:text-stone-200">
                        ₹{m.spend}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Sub-Tab 3: Projected Monthly Savings Breakdown */}
          {activeMetricTab === 'savings' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200/60 dark:border-stone-800 space-y-2">
                <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                  01. Comparison Engine Advantage
                </div>
                <div className="text-lg font-black text-stone-900 dark:text-stone-100 tabular-nums">
                  ~₹620 / month
                </div>
                <p className="text-[11px] text-stone-500 leading-relaxed">
                  Saved automatically by selecting the lowest priced local merchant for identical brand items.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200/60 dark:border-stone-800 space-y-2">
                <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                  02. Coupon & Promo Savings
                </div>
                <div className="text-lg font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                  ~₹450 / month
                </div>
                <p className="text-[11px] text-stone-500 leading-relaxed">
                  Generated through valid neighborhood promo codes (NEARBUY50, LOCAL15, FREEDEL).
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200/60 dark:border-stone-800 space-y-2">
                <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                  03. Annual Projection
                </div>
                <div className="text-lg font-black text-orange-600 dark:text-orange-400 tabular-nums">
                  ₹{(projectedMonthlySavings * 12).toLocaleString()} / year
                </div>
                <p className="text-[11px] text-stone-500 leading-relaxed">
                  Projected total household savings keeping shopping within your 2 km neighborhood radius.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
