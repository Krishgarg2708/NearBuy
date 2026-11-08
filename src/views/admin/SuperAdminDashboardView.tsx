import React, { useState, useMemo } from 'react';
import { useMarketplaceStore } from '../../store/marketplaceStore';
import { useAuthStore } from '../../store/authStore';
import { Store } from '../../types';
import {
  Shield,
  Store as StoreIcon,
  Users,
  ShoppingBag,
  TrendingUp,
  CheckCircle2,
  XCircle,
  AlertOctagon,
  Download,
  RotateCcw,
  Search,
  Filter,
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

export const SuperAdminDashboardView: React.FC = () => {
  const { stores, orders, products, updateStoreStatus, resetToSeedData, exportOrdersCsv } =
    useMarketplaceStore();
  const { currentUser } = useAuthStore();

  const [activeTab, setActiveTab] = useState<'merchants' | 'analytics' | 'orders'>('merchants');
  const [storeFilter, setStoreFilter] = useState<'all' | 'pending' | 'approved' | 'suspended'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Metrics
  const totalGMV = useMemo(() => {
    return orders.reduce((sum, o) => sum + o.total, 0);
  }, [orders]);

  const platformRevenue = Math.round(totalGMV * 0.1); // 10% marketplace commission

  const pendingStores = stores.filter((s) => s.status === 'pending');
  const approvedStores = stores.filter((s) => s.status === 'approved');

  const filteredStores = useMemo(() => {
    return stores.filter((s) => {
      const matchesStatus = storeFilter === 'all' || s.status === storeFilter;
      const matchesSearch =
        !searchQuery.trim() ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.area.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [stores, storeFilter, searchQuery]);

  // Analytics Chart Data
  const platformGrowthData = [
    { month: 'Jun', gmv: 125000, orders: 340, merchants: 8 },
    { month: 'Jul', gmv: 198000, orders: 520, merchants: 11 },
    { month: 'Aug', gmv: 285000, orders: 740, merchants: 13 },
    { month: 'Sep', gmv: 410000, orders: 1050, merchants: 14 },
    { month: 'Oct', gmv: 590000, orders: 1480, merchants: 15 },
    { month: 'Nov', gmv: 820000, orders: 2100, merchants: 16 },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200 dark:border-stone-800">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-orange-500 text-white flex items-center justify-center font-bold shadow-md shadow-orange-500/20">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-stone-950 dark:text-white">
              NearBuy Super Admin Console
            </h1>
            <p className="text-xs text-stone-500 mt-0.5">
              Platform governance, merchant onboarding approvals, and revenue analytics.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={exportOrdersCsv}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-xs font-semibold text-stone-800 dark:text-stone-200 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => {
              if (confirm('Reset entire platform database back to initial seeds?')) {
                resetToSeedData();
                window.location.reload();
              }
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white dark:bg-stone-100 dark:text-stone-900 text-xs font-bold transition-all shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5 text-orange-400" />
            <span>Reset Demo DB</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-stone-900 p-5 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-xs space-y-1.5">
          <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
            Total GMV (Gross Value)
          </div>
          <div className="text-2xl font-black text-stone-900 dark:text-stone-100 tabular-nums">
            ₹{totalGMV.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Across 4 neighborhoods</span>
          </div>
        </div>

        <div className="bg-white dark:bg-stone-900 p-5 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-xs space-y-1.5">
          <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
            Platform Commission (10%)
          </div>
          <div className="text-2xl font-black text-orange-600 tabular-nums">
            ₹{platformRevenue.toLocaleString()}
          </div>
          <div className="text-[11px] text-stone-400 font-medium">Net platform revenue</div>
        </div>

        <div className="bg-white dark:bg-stone-900 p-5 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-xs space-y-1.5">
          <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
            Active Stores
          </div>
          <div className="text-2xl font-black text-stone-900 dark:text-stone-100 tabular-nums">
            {approvedStores.length} Stores
          </div>
          <div className="text-[11px] text-stone-400 font-medium">
            {pendingStores.length} pending onboarding
          </div>
        </div>

        <div className="bg-white dark:bg-stone-900 p-5 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-xs space-y-1.5">
          <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
            Total Orders
          </div>
          <div className="text-2xl font-black text-purple-600 tabular-nums">
            {orders.length} Orders
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold">98.2% on-time fulfillment</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 dark:border-stone-800 pb-2">
        <button
          onClick={() => setActiveTab('merchants')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'merchants'
              ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-xs'
              : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
          }`}
        >
          <span>Merchant Applications & Verification</span>
          {pendingStores.length > 0 && (
            <span className="w-5 h-5 rounded-full bg-orange-500 text-white flex items-center justify-center text-[10px] font-bold">
              {pendingStores.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'analytics'
              ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-xs'
              : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
          }`}
        >
          Platform Analytics
        </button>
      </div>

      {/* 1. Merchant Management Tab */}
      {activeTab === 'merchants' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 p-1 bg-stone-100 dark:bg-stone-800 rounded-xl self-start sm:self-auto">
              <button
                onClick={() => setStoreFilter('all')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg ${
                  storeFilter === 'all' ? 'bg-white dark:bg-stone-900 shadow-xs' : 'text-stone-500'
                }`}
              >
                All ({stores.length})
              </button>
              <button
                onClick={() => setStoreFilter('pending')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg ${
                  storeFilter === 'pending' ? 'bg-white dark:bg-stone-900 shadow-xs text-orange-600' : 'text-stone-500'
                }`}
              >
                Pending Review ({pendingStores.length})
              </button>
              <button
                onClick={() => setStoreFilter('approved')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg ${
                  storeFilter === 'approved' ? 'bg-white dark:bg-stone-900 shadow-xs text-emerald-600' : 'text-stone-500'
                }`}
              >
                Approved ({approvedStores.length})
              </button>
            </div>

            <div className="relative max-w-xs w-full">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search stores or owners..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700"
              />
            </div>
          </div>

          <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 dark:bg-stone-800/60 border-b border-stone-100 dark:border-stone-800 text-stone-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Store Name</th>
                    <th className="p-4">Owner & Contact</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Location</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Approval Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                  {filteredStores.map((st) => (
                    <tr key={st.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/40">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={st.image}
                            alt=""
                            className="w-10 h-10 rounded-xl object-cover bg-stone-100 shrink-0"
                          />
                          <div>
                            <div className="font-bold text-stone-900 dark:text-stone-100">
                              {st.name}
                            </div>
                            <div className="text-[11px] text-stone-400">
                              Min Order: ₹{st.minOrderValue}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-semibold text-stone-800 dark:text-stone-200">
                          {st.ownerName}
                        </div>
                        <div className="text-[11px] text-stone-400">{st.phone}</div>
                      </td>
                      <td className="p-4 text-stone-600 dark:text-stone-300">{st.category}</td>
                      <td className="p-4 text-stone-500">{st.area}, {st.city}</td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            st.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : st.status === 'pending'
                              ? 'bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                          }`}
                        >
                          {st.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {st.status !== 'approved' && (
                            <button
                              onClick={() => updateStoreStatus(st.id, 'approved')}
                              className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                            >
                              Approve
                            </button>
                          )}
                          {st.status === 'approved' && (
                            <button
                              onClick={() => updateStoreStatus(st.id, 'suspended')}
                              className="px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold"
                            >
                              Suspend
                            </button>
                          )}
                          {st.status === 'pending' && (
                            <button
                              onClick={() => updateStoreStatus(st.id, 'rejected')}
                              className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold"
                            >
                              Reject
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
        </div>
      )}

      {/* 2. Platform Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 bg-white dark:bg-stone-900 p-6 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wider">
              Monthly Platform GMV Growth (INR)
            </h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={platformGrowthData}>
                  <defs>
                    <linearGradient id="colorGmv" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" stroke="#888" fontSize={11} />
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
                    dataKey="gmv"
                    stroke="#7C3AED"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorGmv)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="lg:col-span-4 bg-white dark:bg-stone-900 p-6 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wider">
              Monthly Orders Volume
            </h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={platformGrowthData}>
                  <XAxis dataKey="month" stroke="#888" fontSize={11} />
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
                  <Bar dataKey="orders" fill="#F97316" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
