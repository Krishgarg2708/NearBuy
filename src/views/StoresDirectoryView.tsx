import React, { useState, useMemo } from 'react';
import { useMarketplaceStore } from '../store/marketplaceStore';
import { useLocationStore } from '../store/locationStore';
import { StoreCard } from '../components/common/StoreCard';
import { LeafletMap, MapMarker } from '../components/common/LeafletMap';
import {
  MapPin,
  List,
  Map as MapIcon,
  Search,
  Filter,
  Navigation,
  Clock,
  Star,
  CheckCircle2,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const StoresDirectoryView: React.FC = () => {
  const { stores, categories } = useMarketplaceStore();
  const { currentAddress, simulateGeolocation, isLocating, calculateDistance } = useLocationStore();

  const [viewMode, setViewMode] = useState<'split' | 'map' | 'list'>('split');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [maxDistanceKm, setMaxDistanceKm] = useState<number>(5);
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);

  // Filter approved stores
  const filteredStores = useMemo(() => {
    return stores
      .filter((s) => s.status === 'approved')
      .filter((s) => {
        const matchesCategory =
          selectedCategory === 'All' || s.category.toLowerCase().includes(selectedCategory.toLowerCase());
        const matchesSearch =
          !searchQuery.trim() ||
          s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.area.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.category.toLowerCase().includes(searchQuery.toLowerCase());
        const distance = calculateDistance(s.lat, s.lng);
        const matchesDistance = distance <= maxDistanceKm;

        return matchesCategory && matchesSearch && matchesDistance;
      })
      .sort((a, b) => calculateDistance(a.lat, a.lng) - calculateDistance(b.lat, b.lng));
  }, [stores, selectedCategory, searchQuery, maxDistanceKm, calculateDistance]);

  // Leaflet Map Markers
  const mapMarkers: MapMarker[] = useMemo(() => {
    const list: MapMarker[] = [
      // Current user location marker
      {
        id: 'user_loc',
        lat: currentAddress.lat,
        lng: currentAddress.lng,
        title: `Your Location (${currentAddress.area})`,
        subtitle: currentAddress.street,
        type: 'user',
      },
    ];

    filteredStores.forEach((s) => {
      list.push({
        id: s.id,
        lat: s.lat,
        lng: s.lng,
        title: s.name,
        subtitle: `${s.category} · ${s.deliveryTimeMin}m delivery · ${calculateDistance(s.lat, s.lng)}km`,
        type: 'store',
        onClick: () => setSelectedStoreId(s.id),
      });
    });

    return list;
  }, [currentAddress, filteredStores, calculateDistance]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header & Location Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-200 dark:border-stone-800">
        <div>
          <div className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5" />
            <span>Hyperlocal Store Discovery</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-stone-100 mt-1">
            Nearby Stores in {currentAddress.area}
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Discover {filteredStores.length} verified physical merchants ready for delivery and express pickup.
          </p>
        </div>

        {/* View Switcher & GPS Simulate */}
        <div className="flex items-center gap-3 self-start md:self-auto">
          <button
            onClick={() => simulateGeolocation()}
            disabled={isLocating}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 text-xs font-semibold hover:bg-orange-100 transition-colors"
          >
            <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
            <span>{isLocating ? 'Detecting GPS...' : 'Simulate GPS'}</span>
          </button>

          <div className="flex items-center gap-1 p-1 bg-stone-100 dark:bg-stone-800 rounded-xl">
            <button
              onClick={() => setViewMode('split')}
              className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                viewMode === 'split'
                  ? 'bg-white dark:bg-stone-900 text-stone-950 dark:text-white shadow-xs'
                  : 'text-stone-500'
              }`}
              title="Split Map & List View"
            >
              <span className="hidden sm:inline">Split</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                viewMode === 'map'
                  ? 'bg-white dark:bg-stone-900 text-stone-950 dark:text-white shadow-xs'
                  : 'text-stone-500'
              }`}
              title="Full Map View"
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Map</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-stone-900 text-stone-950 dark:text-white shadow-xs'
                  : 'text-stone-500'
              }`}
              title="Grid List View"
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">List</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-white dark:bg-stone-900 p-3 rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-xs">
        <div className="md:col-span-5 relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search stores by name, street, or specialty..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200/80 dark:border-stone-700 text-stone-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <div className="md:col-span-4 flex items-center gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            aria-label="Filter stores by category"
            className="w-full py-2 px-3 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200/80 dark:border-stone-700 text-stone-800 dark:text-stone-200 focus:outline-hidden"
          >
            <option value="All">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-3 flex items-center gap-2 px-2">
          <span className="text-[11px] text-stone-500 whitespace-nowrap">Radius:</span>
          <input
            type="range"
            min="1"
            max="10"
            step="0.5"
            value={maxDistanceKm}
            onChange={(e) => setMaxDistanceKm(parseFloat(e.target.value))}
            aria-label="Filter radius in kilometers"
            className="w-full accent-orange-500"
          />
          <span className="text-xs font-bold text-stone-800 dark:text-stone-200 tabular-nums whitespace-nowrap">
            {maxDistanceKm}km
          </span>
        </div>
      </div>

      {/* Main Content Area based on ViewMode */}
      {viewMode === 'map' ? (
        <div className="h-[650px] rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-800 shadow-sm relative">
          <LeafletMap
            center={[currentAddress.lat, currentAddress.lng]}
            zoom={14}
            markers={mapMarkers}
            className="h-full w-full"
          />
        </div>
      ) : viewMode === 'list' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredStores.map((s) => (
            <StoreCard key={s.id} store={s} />
          ))}
        </div>
      ) : (
        /* Split Screen (Desktop map side-by-side with store listings) */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Store Cards Scroll */}
          <div className="lg:col-span-7 space-y-4 max-h-[700px] overflow-y-auto pr-1">
            {filteredStores.length === 0 ? (
              <div className="p-12 text-center bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800">
                <p className="text-xs text-stone-500">No stores found within {maxDistanceKm} km. Try increasing the search radius.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredStores.map((store) => (
                  <StoreCard key={store.id} store={store} />
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Sticky Interactive Leaflet Map */}
          <div className="lg:col-span-5 sticky top-24">
            <div className="h-[620px] rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-800 shadow-sm relative">
              <LeafletMap
                center={[currentAddress.lat, currentAddress.lng]}
                zoom={14}
                markers={mapMarkers}
                className="h-full w-full"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
