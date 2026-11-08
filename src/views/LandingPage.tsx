import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMarketplaceStore } from '../store/marketplaceStore';
import { useLocationStore } from '../store/locationStore';
import { ProductCard } from '../components/common/ProductCard';
import { StoreCard } from '../components/common/StoreCard';
import { HERO_IMAGE } from '../data/seedData';
import {
  MapPin,
  Search,
  ArrowRight,
  ShieldCheck,
  Zap,
  ShoppingBag,
  Store as StoreIcon,
  Clock,
  Sparkles,
  ChevronRight,
  TrendingDown,
  Percent,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { stores, products, categories, offers } = useMarketplaceStore();
  const { currentAddress, simulateGeolocation, isLocating } = useLocationStore();
  const [searchQuery, setSearchQuery] = useState('');

  const featuredStores = stores.filter((s) => s.status === 'approved').slice(0, 4);
  const featuredProducts = products.filter((p) => p.isFeatured).slice(0, 6);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/explore');
    }
  };

  return (
    <div className="min-h-screen">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-stone-900 text-white pt-12 pb-20 lg:pt-20 lg:pb-28">
        {/* Background glow and subtle mesh */}
        <div className="absolute inset-0 opacity-25 bg-[radial-gradient(#f97316_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-orange-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headlines & Search */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-medium text-orange-400">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Hyperlocal Neighborhood Commerce</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1] text-balance">
                Your Neighbourhood Has <span className="text-orange-500">Everything.</span>
              </h1>

              <p className="text-base sm:text-lg text-stone-300 max-w-xl font-normal leading-relaxed">
                Discover nearby stores, compare real-time local prices across merchants, and get your favourite products delivered in 15–30 minutes or ready for pickup.
              </p>

              {/* Location & Search Capsule */}
              <div className="bg-white dark:bg-stone-900 p-2 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-white max-w-xl">
                <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <div className="flex items-center gap-2 px-3 py-2 sm:border-r border-stone-200 dark:border-stone-800 shrink-0">
                    <MapPin className="w-4 h-4 text-orange-500 shrink-0" />
                    <button
                      type="button"
                      onClick={() => simulateGeolocation()}
                      className="text-xs font-semibold text-stone-800 dark:text-stone-200 truncate max-w-[140px] text-left hover:text-orange-500"
                      title="Click to detect GPS"
                    >
                      {isLocating ? 'Detecting GPS...' : currentAddress.area}
                    </button>
                  </div>

                  <div className="flex-1 relative flex items-center">
                    <Search className="w-4 h-4 text-stone-400 absolute left-3 pointer-events-none" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search milk, sourdough, headphones, stores..."
                      className="w-full pl-9 pr-3 py-2 text-xs bg-transparent focus:outline-hidden text-stone-900 dark:text-white placeholder:text-stone-400 font-medium"
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-all shadow-md shadow-orange-500/25 flex items-center justify-center gap-1.5 shrink-0"
                  >
                    <span>Search</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>

              {/* Quick Pills */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-stone-400">
                <span className="font-medium text-stone-300">Popular searches:</span>
                {['Amul Gold Milk', 'Country Sourdough', 'Sony Headphones', 'Strawberries'].map((kw) => (
                  <button
                    key={kw}
                    onClick={() => navigate(`/products?search=${encodeURIComponent(kw)}`)}
                    className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-stone-300 transition-colors"
                  >
                    {kw}
                  </button>
                ))}
              </div>
            </div>

            {/* Right Column: Hero Visual Showcase */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/10 aspect-4/3 sm:aspect-16/10 lg:aspect-4/3">
                <img
                  src={HERO_IMAGE}
                  alt="Vibrant neighborhood shopping street"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent" />

                {/* Floating Interactive Micro-Card */}
                <div className="absolute bottom-4 left-4 right-4 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md rounded-2xl p-3.5 border border-white/20 dark:border-stone-800 shadow-xl text-stone-900 dark:text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center font-bold">
                        <TrendingDown className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold">Local Price Comparison Engine</div>
                        <div className="text-[11px] text-stone-500">Same product, compared across 3+ local shops</div>
                      </div>
                    </div>
                    <Link
                      to="/compare/prod_amul_gold_1l"
                      className="px-3 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-bold hover:bg-orange-600 transition-all shrink-0"
                    >
                      Compare
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Value Proposition Grid */}
      <section className="py-12 border-b border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">15–30 Minute Delivery</h2>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 leading-relaxed">
                  Orders come directly from merchants in your 2 km radius, ensuring blazing fast fulfillment and zero warehouse delays.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">Real-Time Price Comparison</h2>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 leading-relaxed">
                  Compare prices for identical branded products across nearby shops and pick the cheapest, nearest, or fastest option.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">Support Neighborhood Stores</h2>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 leading-relaxed">
                  Keep commerce vibrant in your local community. 100% genuine products directly from trusted physical merchants.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Featured Categories */}
      <section className="py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider">
              Browse by Department
            </div>
            <h2 className="text-2xl font-extrabold text-stone-950 dark:text-white mt-1">
              Shop Your Local Neighborhood
            </h2>
          </div>
          <Link
            to="/explore"
            className="text-xs font-bold text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1"
          >
            <span>View All Categories</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {categories.slice(0, 10).map((cat) => (
            <Link
              key={cat.id}
              to={`/products?category=${encodeURIComponent(cat.name)}`}
              className="group relative bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/80 dark:border-stone-800 p-3.5 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between"
            >
              <div className="aspect-square w-full rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-800 mb-3">
                <img
                  src={cat.image}
                  alt={cat.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div>
                <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100 group-hover:text-orange-600 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-[11px] text-stone-400 mt-0.5">
                  {cat.productCount} products
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. Active Promotional Offers Banner */}
      <section className="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold mb-3">
              <Percent className="w-3.5 h-3.5" />
              <span>Limited Neighborhood Deals</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Get Flat ₹50 OFF + Free Delivery on First Order
            </h2>
            <p className="text-xs sm:text-sm text-orange-100 mt-2 font-medium">
              Use code <strong className="bg-white/20 px-2 py-0.5 rounded font-mono">NEARBUY50</strong> at checkout on orders above ₹299.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Link
                to="/explore"
                className="px-5 py-2.5 rounded-xl bg-white text-stone-900 text-xs font-extrabold hover:bg-stone-100 transition-all shadow-md"
              >
                Shop Neighborhood Deals
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Featured Trending Products with Price Comparison */}
      <section className="py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider">
              Popular in {currentAddress.area}
            </div>
            <h2 className="text-2xl font-extrabold text-stone-950 dark:text-white mt-1">
              Trending Daily Essentials
            </h2>
          </div>
          <Link
            to="/products"
            className="text-xs font-bold text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1"
          >
            <span>Explore All</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
          {featuredProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* 6. Featured Nearby Stores */}
      <section className="py-14 bg-stone-100/60 dark:bg-stone-900/40 border-y border-stone-200 dark:border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider">
                Neighborhood Merchants
              </div>
              <h2 className="text-2xl font-extrabold text-stone-950 dark:text-white mt-1">
                Top Rated Local Stores
              </h2>
            </div>
            <Link
              to="/stores"
              className="text-xs font-bold text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1"
            >
              <span>Explore All Stores on Map</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredStores.map((s) => (
              <StoreCard key={s.id} store={s} />
            ))}
          </div>
        </div>
      </section>

      {/* 7. How It Works Section */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider">
            Simplicity & Speed
          </div>
          <h2 className="text-3xl font-extrabold text-stone-950 dark:text-white mt-1">
            How NearBuy Powers Local Shopping
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center font-bold text-sm">
              01
            </div>
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
              Pinpoint Your Neighborhood
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
              Select your street or let browser geolocation detect local stores, bakeries, pharmacies, and specialty grocers within 2 km.
            </p>
          </div>

          <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-sm">
              02
            </div>
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
              Compare Prices Across Merchants
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
              See which nearby merchant offers the lowest price, quickest delivery, or has immediate stock for the exact same branded item.
            </p>
          </div>

          <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
              03
            </div>
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
              Get Fast Delivery or Store Pickup
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
              Track your dedicated delivery partner on the live map in real time, or walk into the shop for instant express counter pickup.
            </p>
          </div>
        </div>
      </section>

      {/* 8. Merchant CTA Section */}
      <section className="py-14 bg-stone-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-tr from-stone-950 to-stone-800 rounded-3xl p-8 sm:p-12 border border-stone-700 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-3 max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 text-xs font-semibold">
                <StoreIcon className="w-3.5 h-3.5" />
                <span>For Physical Shop Owners</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                Bring Your Physical Store Online in 5 Minutes
              </h2>
              <p className="text-xs sm:text-sm text-stone-400 leading-relaxed">
                Reach thousands of neighborhood customers, manage real-time inventory, and get orders delivered through NearBuy’s partner fleet.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
              <Link
                to="/merchant/dashboard"
                className="px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-all shadow-lg shadow-orange-500/25"
              >
                Open Merchant Dashboard
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 py-12 text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-orange-500 flex items-center justify-center text-white font-bold text-xs">
              NB
            </div>
            <span className="font-extrabold text-stone-900 dark:text-white text-sm">
              NearBuy
            </span>
            <span className="text-stone-400">· Premium Hyperlocal Shopping Marketplace</span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/explore" className="hover:text-stone-900 dark:hover:text-stone-200">Marketplace</Link>
            <Link to="/stores" className="hover:text-stone-900 dark:hover:text-stone-200">Nearby Stores</Link>
            <Link to="/merchant/dashboard" className="hover:text-stone-900 dark:hover:text-stone-200">Merchant Portal</Link>
            <Link to="/delivery/dashboard" className="hover:text-stone-900 dark:hover:text-stone-200">Delivery Partner</Link>
            <Link to="/admin/dashboard" className="hover:text-stone-900 dark:hover:text-stone-200">Admin Console</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
