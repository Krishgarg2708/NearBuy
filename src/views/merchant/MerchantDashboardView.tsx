import React, { useState, useMemo } from 'react';
import { useMarketplaceStore } from '../../store/marketplaceStore';
import { useAuthStore } from '../../store/authStore';
import { Order, OrderStatus, Product, MerchantProductOffer } from '../../types';
import {
  DollarSign,
  ShoppingBag,
  Clock,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Plus,
  Search,
  Filter,
  Download,
  Package,
  Layers,
  ArrowUpRight,
  Eye,
  Check,
  X,
  Edit2,
  Store,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

export const MerchantDashboardView: React.FC = () => {
  const {
    stores,
    products,
    offersByProduct,
    orders,
    updateOrderStatus,
    updateProductStock,
    updateProductPrice,
    addProduct,
    exportOrdersCsv,
  } = useMarketplaceStore();
  const { currentUser } = useAuthStore();

  // Active store for merchant: Green Basket Organic (store_1)
  const storeId = currentUser.storeId || 'store_1';
  const store = stores.find((s) => s.id === storeId) || stores[0];

  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'inventory' | 'products'>('overview');
  const [orderViewMode, setOrderViewMode] = useState<'kanban' | 'table'>('table');
  const [inventorySearch, setInventorySearch] = useState('');
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);

  // New product form state
  const [newTitle, setNewTitle] = useState('');
  const [newBrand, setNewBrand] = useState('');
  const [newCategory, setNewCategory] = useState('Grocery & Staples');
  const [newPrice, setNewPrice] = useState(120);
  const [newStock, setNewStock] = useState(30);
  const [newUnit, setNewUnit] = useState('500 g');

  // Filter merchant orders
  const merchantOrders = useMemo(() => {
    return orders.filter((o) => o.merchantId === store.id);
  }, [orders, store.id]);

  // Key KPI metrics
  const totalRevenue = useMemo(() => {
    return merchantOrders
      .filter((o) => o.status !== 'cancelled')
      .reduce((acc, o) => acc + o.total, 0);
  }, [merchantOrders]);

  const pendingOrders = useMemo(() => {
    return merchantOrders.filter(
      (o) => o.status === 'placed' || o.status === 'accepted' || o.status === 'preparing'
    );
  }, [merchantOrders]);

  const completedOrders = useMemo(() => {
    return merchantOrders.filter((o) => o.status === 'delivered');
  }, [merchantOrders]);

  // Merchant product offers
  const merchantProducts = useMemo(() => {
    const list: Array<{ product: Product; offer: MerchantProductOffer }> = [];
    products.forEach((p) => {
      const offers = offersByProduct[p.id] || [];
      const myOffer = offers.find((o) => o.merchantId === store.id);
      if (myOffer) {
        list.push({ product: p, offer: myOffer });
      }
    });
    return list;
  }, [products, offersByProduct, store.id]);

  const lowStockProducts = useMemo(() => {
    return merchantProducts.filter((mp) => mp.offer.stock <= 10);
  }, [merchantProducts]);

  // Chart data: simulated daily sales trends
  const chartData = [
    { day: 'Mon', revenue: 4200, orders: 12 },
    { day: 'Tue', revenue: 5800, orders: 16 },
    { day: 'Wed', revenue: 4900, orders: 14 },
    { day: 'Thu', revenue: 6400, orders: 19 },
    { day: 'Fri', revenue: 8100, orders: 24 },
    { day: 'Sat', revenue: 11500, orders: 36 },
    { day: 'Sun (Today)', revenue: 9800, orders: 28 },
  ];

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newProdId = 'prod_' + Date.now();
    const newProd: Product = {
      id: newProdId,
      title: newTitle.trim(),
      slug: newTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      brand: newBrand.trim() || store.name,
      category: newCategory,
      description: `Locally curated ${newCategory.toLowerCase()} item sourced directly by ${store.name}.`,
      specifications: {
        Packaging: newUnit,
        Fulfillment: 'Immediate Store Dispatch',
      },
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80',
      gallery: ['https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80'],
      unit: newUnit,
      tags: ['New Arrival', 'Local Special'],
      isFeatured: false,
    };

    const offer: MerchantProductOffer = {
      merchantId: store.id,
      storeName: store.name,
      area: store.area,
      distanceKm: 0.6,
      price: Number(newPrice),
      originalPrice: Number(newPrice) + 20,
      stock: Number(newStock),
      isAvailable: Number(newStock) > 0,
      deliveryTimeMin: store.deliveryTimeMin,
      rating: store.rating,
      reviewCount: store.reviewCount,
    };

    addProduct(newProd, [offer]);
    setIsAddProductModalOpen(false);
    setNewTitle('');
    setNewBrand('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Merchant Brand Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200 dark:border-stone-800">
        <div className="flex items-center gap-3.5">
          <img
            src={store.image}
            alt={store.name}
            className="w-14 h-14 rounded-2xl object-cover border-2 border-orange-500 shadow-sm"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-stone-950 dark:text-white">
                {store.name} · Merchant Hub
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 uppercase">
                {store.status}
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              {store.address} · Indiranagar Cluster · Managed by {store.ownerName}
            </p>
          </div>
        </div>

        {/* Top actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={exportOrdersCsv}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-xs font-semibold text-stone-800 dark:text-stone-200 transition-colors"
            title="Download CSV report of orders"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setIsAddProductModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-all shadow-md shadow-orange-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 dark:border-stone-800 pb-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'overview'
              ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-xs'
              : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
          }`}
        >
          Overview & Metrics
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'orders'
              ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-xs'
              : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
          }`}
        >
          <span>Live Orders</span>
          {pendingOrders.length > 0 && (
            <span className="w-5 h-5 rounded-full bg-orange-500 text-white flex items-center justify-center text-[10px] font-bold">
              {pendingOrders.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'inventory'
              ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-xs'
              : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
          }`}
        >
          <span>Inventory & Stocks</span>
          {lowStockProducts.length > 0 && (
            <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] font-bold">
              {lowStockProducts.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'products'
              ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-xs'
              : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
          }`}
        >
          Product Pricing ({merchantProducts.length})
        </button>
      </div>

      {/* 1. Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* KPI Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-stone-900 p-5 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-xs space-y-1.5">
              <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                Total Revenue
              </div>
              <div className="text-2xl font-black text-stone-900 dark:text-stone-100 tabular-nums">
                ₹{totalRevenue.toLocaleString()}
              </div>
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+18.4% this week</span>
              </div>
            </div>

            <div className="bg-white dark:bg-stone-900 p-5 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-xs space-y-1.5">
              <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                Pending Orders
              </div>
              <div className="text-2xl font-black text-orange-600 tabular-nums">
                {pendingOrders.length}
              </div>
              <div className="text-[11px] text-stone-400 font-medium">Needs packing / dispatch</div>
            </div>

            <div className="bg-white dark:bg-stone-900 p-5 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-xs space-y-1.5">
              <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                Active Catalog
              </div>
              <div className="text-2xl font-black text-stone-900 dark:text-stone-100 tabular-nums">
                {merchantProducts.length} items
              </div>
              <div className="text-[11px] text-stone-400 font-medium">Ready for comparison</div>
            </div>

            <div className="bg-white dark:bg-stone-900 p-5 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-xs space-y-1.5">
              <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                Low Stock Warning
              </div>
              <div className="text-2xl font-black text-amber-500 tabular-nums">
                {lowStockProducts.length} items
              </div>
              <div className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">Under 10 units</div>
            </div>
          </div>

          {/* Recharts Analytics Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 bg-white dark:bg-stone-900 p-6 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wider">
                    7-Day Sales Volume
                  </h3>
                  <p className="text-xs text-stone-400">Neighborhood daily revenue generated</p>
                </div>
                <span className="text-xs font-bold text-stone-800 dark:text-stone-200">
                  Peak: ₹11,500
                </span>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F97316" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#F97316" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="day" stroke="#888" fontSize={11} />
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
                      dataKey="revenue"
                      stroke="#F97316"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#colorRev)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="lg:col-span-4 bg-white dark:bg-stone-900 p-6 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-xs space-y-4">
              <div>
                <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wider">
                  Weekly Orders
                </h3>
                <p className="text-xs text-stone-400">Fulfillment counts</p>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <XAxis dataKey="day" stroke="#888" fontSize={10} />
                    <YAxis stroke="#888" fontSize={10} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1C1917',
                        border: 'none',
                        borderRadius: '12px',
                        color: '#fff',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="orders" fill="#7C3AED" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Orders Tab */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">
              Live Order Management ({merchantOrders.length})
            </h2>
            <div className="flex items-center gap-1 p-1 bg-stone-100 dark:bg-stone-800 rounded-xl">
              <button
                onClick={() => setOrderViewMode('table')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                  orderViewMode === 'table' ? 'bg-white dark:bg-stone-900 shadow-xs' : 'text-stone-500'
                }`}
              >
                Table View
              </button>
              <button
                onClick={() => setOrderViewMode('kanban')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                  orderViewMode === 'kanban' ? 'bg-white dark:bg-stone-900 shadow-xs' : 'text-stone-500'
                }`}
              >
                Kanban Pipeline
              </button>
            </div>
          </div>

          {orderViewMode === 'table' ? (
            <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 dark:bg-stone-800/60 border-b border-stone-100 dark:border-stone-800 text-stone-500 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="p-4">Order ID</th>
                      <th className="p-4">Customer</th>
                      <th className="p-4">Items</th>
                      <th className="p-4">Total</th>
                      <th className="p-4">Type</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                    {merchantOrders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/40">
                        <td className="p-4 font-mono font-bold text-stone-900 dark:text-stone-100">
                          {ord.orderNumber}
                        </td>
                        <td className="p-4">
                          <div className="font-semibold text-stone-800 dark:text-stone-200">
                            {ord.customerName}
                          </div>
                          <div className="text-[11px] text-stone-400">{ord.deliveryAddress.area}</div>
                        </td>
                        <td className="p-4">
                          <div className="line-clamp-1 max-w-[200px] text-stone-600 dark:text-stone-300">
                            {ord.items.map((i) => `${i.quantity}x ${i.title}`).join(', ')}
                          </div>
                        </td>
                        <td className="p-4 font-black tabular-nums text-stone-900 dark:text-stone-100">
                          ₹{ord.total}
                        </td>
                        <td className="p-4">
                          <span className="capitalize">{ord.orderType}</span>
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              ord.status === 'delivered'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                : ord.status === 'placed'
                                ? 'bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300'
                                : 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                            }`}
                          >
                            {ord.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {ord.status === 'placed' && (
                              <button
                                onClick={() => updateOrderStatus(ord.id, 'accepted', 'Store accepted order.')}
                                className="px-2.5 py-1 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold"
                              >
                                Accept
                              </button>
                            )}
                            {ord.status === 'accepted' && (
                              <button
                                onClick={() => updateOrderStatus(ord.id, 'preparing', 'Packing items.')}
                                className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold"
                              >
                                Pack Order
                              </button>
                            )}
                            {ord.status === 'preparing' && (
                              <button
                                onClick={() =>
                                  updateOrderStatus(ord.id, 'ready', 'Sealed & ready for pickup.')
                                }
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                              >
                                Mark Ready
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* Kanban Board */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {(['placed', 'accepted', 'preparing', 'ready'] as OrderStatus[]).map((stage) => {
                const stageOrders = merchantOrders.filter((o) => o.status === stage);
                return (
                  <div
                    key={stage}
                    className="bg-stone-100/70 dark:bg-stone-900 rounded-3xl p-4 border border-stone-200/80 dark:border-stone-800 space-y-3"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-stone-200 dark:border-stone-800">
                      <span className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300">
                        {stage.replace('_', ' ')}
                      </span>
                      <span className="w-5 h-5 rounded-full bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-300 flex items-center justify-center text-[10px] font-bold">
                        {stageOrders.length}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {stageOrders.map((ord) => (
                        <div
                          key={ord.id}
                          className="bg-white dark:bg-stone-800/80 p-3.5 rounded-2xl border border-stone-200/60 dark:border-stone-700 space-y-2 shadow-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-bold text-xs">#{ord.orderNumber}</span>
                            <span className="font-bold text-xs tabular-nums">₹{ord.total}</span>
                          </div>
                          <div className="text-[11px] text-stone-500">
                            Customer: {ord.customerName}
                          </div>
                          <div className="text-[11px] text-stone-400 line-clamp-1">
                            {ord.items.map((i) => `${i.quantity}x ${i.title}`).join(', ')}
                          </div>
                          <button
                            onClick={() => {
                              const nextStatus: Record<string, OrderStatus> = {
                                placed: 'accepted',
                                accepted: 'preparing',
                                preparing: 'ready',
                              };
                              if (nextStatus[stage]) {
                                updateOrderStatus(ord.id, nextStatus[stage]);
                              }
                            }}
                            className="w-full py-1.5 rounded-xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-[11px] font-bold"
                          >
                            Advance →
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 3. Inventory & Stocks Tab */}
      {activeTab === 'inventory' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                Local Stock Management
              </h2>
              <p className="text-xs text-stone-400">
                Update stock levels in real time. Changes immediately sync to customer catalog.
              </p>
            </div>
            <div className="relative max-w-xs w-full">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={inventorySearch}
                onChange={(e) => setInventorySearch(e.target.value)}
                placeholder="Search inventory items..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {merchantProducts
              .filter(
                (mp) =>
                  !inventorySearch.trim() ||
                  mp.product.title.toLowerCase().includes(inventorySearch.toLowerCase())
              )
              .map(({ product, offer }) => {
                const isLow = offer.stock <= 10;
                return (
                  <div
                    key={product.id}
                    className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 p-5 shadow-xs space-y-4"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={product.image}
                        alt={product.title}
                        className="w-12 h-12 rounded-xl object-cover bg-stone-100 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="font-bold text-xs text-stone-900 dark:text-stone-100 truncate">
                          {product.title}
                        </div>
                        <div className="text-[11px] text-stone-400">
                          {product.brand} · {product.unit}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-stone-100 dark:border-stone-800 text-xs">
                      <div>
                        <div className="text-[10px] text-stone-400">Current Stock</div>
                        <div className="text-lg font-extrabold tabular-nums">
                          {offer.stock} units
                        </div>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          isLow
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                        }`}
                      >
                        {isLow ? 'Low Stock' : 'Optimal'}
                      </span>
                    </div>

                    {/* Stock Quick Adjustment */}
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() =>
                          updateProductStock(product.id, store.id, Math.max(0, offer.stock - 5))
                        }
                        className="flex-1 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-xs font-semibold"
                      >
                        -5
                      </button>
                      <button
                        onClick={() => updateProductStock(product.id, store.id, offer.stock + 10)}
                        className="flex-1 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-xs"
                      >
                        +10 Units
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* 4. Products Tab (Price Configuration) */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                Price Configuration Engine
              </h2>
              <p className="text-xs text-stone-400">
                Adjust your store's price for each catalog item to win the local price comparison.
              </p>
            </div>
            <button
              onClick={() => setIsAddProductModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-orange-500 text-white text-xs font-bold"
            >
              + Add Catalog Item
            </button>
          </div>

          <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 dark:bg-stone-800/60 border-b border-stone-100 dark:border-stone-800 text-stone-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Product Name</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Your Price (₹)</th>
                    <th className="p-4">Stock</th>
                    <th className="p-4 text-right">Quick Price Update</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                  {merchantProducts.map(({ product, offer }) => (
                    <tr key={product.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/40">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.image}
                            alt=""
                            className="w-10 h-10 rounded-lg object-cover bg-stone-100 shrink-0"
                          />
                          <div>
                            <div className="font-bold text-stone-900 dark:text-stone-100">
                              {product.title}
                            </div>
                            <div className="text-[11px] text-stone-400">{product.brand}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-stone-600 dark:text-stone-300">{product.category}</td>
                      <td className="p-4 font-black text-sm tabular-nums text-stone-900 dark:text-stone-100">
                        ₹{offer.price}
                      </td>
                      <td className="p-4 tabular-nums">{offer.stock} units</td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              const newP = prompt('Enter new price in INR:', String(offer.price));
                              if (newP && !isNaN(Number(newP))) {
                                updateProductPrice(product.id, store.id, Number(newP));
                              }
                            }}
                            className="px-3 py-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-orange-50 dark:hover:bg-orange-950/40 text-stone-700 dark:text-stone-200 font-bold flex items-center gap-1"
                          >
                            <Edit2 className="w-3 h-3 text-orange-500" />
                            <span>Edit Price</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {isAddProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-stone-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 dark:border-stone-800 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-800">
              <h3 className="font-bold text-base text-stone-900 dark:text-stone-100">
                Add Product to {store.name}
              </h3>
              <button
                onClick={() => setIsAddProductModalOpen(false)}
                className="text-stone-400 hover:text-stone-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-3 text-xs">
              <div>
                <label className="text-stone-500 block mb-1">Product Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Organic Multigrain Cookies"
                  required
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-stone-500 block mb-1">Brand</label>
                  <input
                    type="text"
                    value={newBrand}
                    onChange={(e) => setNewBrand(e.target.value)}
                    placeholder="e.g. FreshHarvest"
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700"
                  />
                </div>
                <div>
                  <label className="text-stone-500 block mb-1">Unit / Pack</label>
                  <input
                    type="text"
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    placeholder="e.g. 250 g, 1 Pack"
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-stone-500 block mb-1">Your Price (₹)</label>
                  <input
                    type="number"
                    value={newPrice}
                    onChange={(e) => setNewPrice(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700"
                  />
                </div>
                <div>
                  <label className="text-stone-500 block mb-1">Opening Stock</label>
                  <input
                    type="number"
                    value={newStock}
                    onChange={(e) => setNewStock(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700"
                  />
                </div>
              </div>

              <div>
                <label className="text-stone-500 block mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700"
                >
                  <option value="Grocery & Staples">Grocery & Staples</option>
                  <option value="Fruits & Vegetables">Fruits & Vegetables</option>
                  <option value="Artisan Bakery">Artisan Bakery</option>
                  <option value="Electronics & Audio">Electronics & Audio</option>
                  <option value="Pharmacy & Wellness">Pharmacy & Wellness</option>
                  <option value="Beauty & Skincare">Beauty & Skincare</option>
                </select>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddProductModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-orange-500 text-white font-bold hover:bg-orange-600 shadow-md"
                >
                  Publish to Catalog
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
