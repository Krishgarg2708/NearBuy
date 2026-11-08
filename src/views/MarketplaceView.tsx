import React, { useState, useMemo } from 'react';
import { useMarketplaceStore } from '../store/marketplaceStore';
import { useLocationStore } from '../store/locationStore';
import { ProductCard } from '../components/common/ProductCard';
import { StoreCard } from '../components/common/StoreCard';
import { PriceComparisonMatrix } from '../components/common/PriceComparisonMatrix';
import { Product } from '../types';
import {
  Sparkles,
  Search,
  Filter,
  MapPin,
  Clock,
  Tag,
  Star,
  ChevronRight,
  X,
  Store,
  QrCode,
  Camera,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQRScannerStore } from '../store/qrScannerStore';

export const MarketplaceView: React.FC = () => {
  const { stores, products, categories, offers } = useMarketplaceStore();
  const { currentAddress } = useLocationStore();
  const { openScanner } = useQRScannerStore();

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterMode, setFilterMode] = useState<'all' | 'fast_delivery' | 'top_rated' | 'deals'>('all');
  const [comparingProduct, setComparingProduct] = useState<Product | null>(null);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory =
        selectedCategory === 'All' || p.category.toLowerCase().includes(selectedCategory.toLowerCase());
      const matchesSearch =
        !searchQuery.trim() ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  // Nearby approved stores
  const approvedStores = useMemo(() => {
    return stores.filter((s) => s.status === 'approved');
  }, [stores]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* 1. Location Greeting & Search Strip */}
      <div className="bg-gradient-to-r from-stone-900 to-stone-800 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="flex items-center gap-2 text-orange-400 text-xs font-semibold">
            <MapPin className="w-3.5 h-3.5" />
            <span>Delivering to {currentAddress.street}, {currentAddress.area}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Good day, neighbour! What do you need today?
          </h1>
          <p className="text-xs text-stone-300">
            Compare prices across {approvedStores.length} stores nearby and get instant delivery or store pickup.
          </p>

          {/* Quick Search */}
          <div className="pt-2 relative max-w-lg">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by product name, brand (e.g. Amul, Sony, Sourdough)..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-xs bg-white/10 dark:bg-stone-900/60 border border-white/20 text-white placeholder:text-stone-400 focus:outline-hidden focus:ring-2 focus:ring-orange-500 backdrop-blur-md"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-5 text-stone-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Category Filter Bar (Interactive Buttons) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wider">
            Filter by Category
          </h2>
          {selectedCategory !== 'All' && (
            <button
              onClick={() => setSelectedCategory('All')}
              className="text-xs text-orange-600 dark:text-orange-400 hover:underline font-semibold"
            >
              Clear Filter
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
              selectedCategory === 'All'
                ? 'bg-orange-500 text-white shadow-xs'
                : 'bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 border border-stone-200/80 dark:border-stone-800 hover:bg-stone-50'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.name)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                selectedCategory === cat.name
                  ? 'bg-orange-500 text-white shadow-xs'
                  : 'bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 border border-stone-200/80 dark:border-stone-800 hover:bg-stone-50'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Hyperlocal In-Store QR Discovery Banner */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-stone-900/5 dark:from-orange-950/30 dark:via-purple-950/20 dark:to-stone-900 border border-orange-500/20 dark:border-orange-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0 border border-orange-500/30">
            <QrCode className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider">
                In-Store Shopping Companion
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold">
                Cashier Ready
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-extrabold text-stone-900 dark:text-white mt-0.5">
              Visiting a neighborhood shop? Scan in-store QR codes
            </h3>
            <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5">
              Explore live aisle inventory, compare prices against nearby stores, or redeem digital coupons at the counter.
            </p>
          </div>
        </div>
        <button
          onClick={() => openScanner('camera')}
          className="px-4 py-2.5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-md shadow-orange-500/20 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 shrink-0 cursor-pointer"
        >
          <Camera className="w-4 h-4" />
          <span>Launch QR Scanner</span>
        </button>
      </div>

      {/* 3. Nearby Stores Row */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider">
              Local Merchants
            </div>
            <h2 className="text-xl font-bold text-stone-950 dark:text-white mt-0.5">
              Stores Nearest to You in {currentAddress.area}
            </h2>
          </div>
          <Link
            to="/stores"
            className="text-xs font-bold text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1"
          >
            <span>View All ({approvedStores.length})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {approvedStores.slice(0, 4).map((s) => (
            <StoreCard key={s.id} store={s} />
          ))}
        </div>
      </div>

      {/* 4. Products Grid */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider">
              Local Product Catalog
            </div>
            <h2 className="text-xl font-bold text-stone-950 dark:text-white mt-0.5">
              Compare Prices & Shop Products ({filteredProducts.length})
            </h2>
          </div>

          {/* Quick Filter Tabs */}
          <div className="flex items-center gap-1 p-1 bg-stone-100 dark:bg-stone-800 rounded-xl self-start sm:self-auto">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                filterMode === 'all'
                  ? 'bg-white dark:bg-stone-900 text-stone-950 dark:text-white shadow-xs'
                  : 'text-stone-600 dark:text-stone-400'
              }`}
            >
              All Items
            </button>
            <button
              onClick={() => setFilterMode('fast_delivery')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                filterMode === 'fast_delivery'
                  ? 'bg-white dark:bg-stone-900 text-stone-950 dark:text-white shadow-xs'
                  : 'text-stone-600 dark:text-stone-400'
              }`}
            >
              Fastest (≤20m)
            </button>
            <button
              onClick={() => setFilterMode('top_rated')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                filterMode === 'top_rated'
                  ? 'bg-white dark:bg-stone-900 text-stone-950 dark:text-white shadow-xs'
                  : 'text-stone-600 dark:text-stone-400'
              }`}
            >
              Top Rated
            </button>
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-3">
            <Search className="w-8 h-8 text-stone-300 mx-auto" />
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">No products found</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              We couldn't find any products matching "{searchQuery}". Try searching for milk, sourdough, coffee, or electronics.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
              className="px-4 py-2 rounded-xl bg-orange-500 text-white text-xs font-bold hover:bg-orange-600"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filteredProducts.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onOpenCompare={(item) => setComparingProduct(item)}
              />
            ))}
          </div>
        )}
      </div>

      {/* 5. Instant Price Comparison Modal */}
      {comparingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-stone-900 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-stone-200 dark:border-stone-800 p-6 space-y-4">
            <div className="flex items-start justify-between pb-2 border-b border-stone-100 dark:border-stone-800">
              <div className="flex items-center gap-3">
                <img
                  src={comparingProduct.image}
                  alt={comparingProduct.title}
                  className="w-12 h-12 rounded-xl object-cover"
                />
                <div>
                  <h3 className="font-bold text-base text-stone-900 dark:text-stone-100">
                    {comparingProduct.title}
                  </h3>
                  <div className="text-xs text-stone-400">
                    {comparingProduct.brand} · {comparingProduct.unit}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setComparingProduct(null)}
                className="p-1.5 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 hover:text-stone-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <PriceComparisonMatrix
              product={comparingProduct}
              onAddedToCart={() => {
                // Auto dismiss after adding
                setTimeout(() => setComparingProduct(null), 800);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
