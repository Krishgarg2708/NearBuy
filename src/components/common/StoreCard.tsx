import React from 'react';
import { Link } from 'react-router-dom';
import { Store } from '../../types';
import { useLocationStore } from '../../store/locationStore';
import { useMarketplaceStore } from '../../store/marketplaceStore';
import { MapPin, Clock, Star, Heart, CheckCircle2 } from 'lucide-react';

interface StoreCardProps {
  store: Store;
}

export const StoreCard: React.FC<StoreCardProps> = ({ store }) => {
  const { calculateDistance } = useLocationStore();
  const { favoriteStoreIds, toggleFavoriteStore } = useMarketplaceStore();

  const distance = calculateDistance(store.lat, store.lng);
  const isFavorite = favoriteStoreIds.includes(store.id);

  return (
    <div className="group relative bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/80 dark:border-stone-800 overflow-hidden shadow-xs hover:shadow-lg hover:shadow-stone-200/50 dark:hover:shadow-stone-950/50 hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between">
      {/* Media Header */}
      <div className="relative aspect-16/9 w-full bg-stone-100 dark:bg-stone-800 overflow-hidden">
        <img
          src={store.image}
          alt={store.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Favorite Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleFavoriteStore(store.id);
          }}
          className={`absolute top-2.5 right-2.5 p-2 rounded-full backdrop-blur-md transition-all ${
            isFavorite
              ? 'bg-rose-500 text-white'
              : 'bg-white/80 dark:bg-stone-900/80 text-stone-700 dark:text-stone-300 hover:text-rose-500'
          }`}
          title={isFavorite ? 'Remove from favorites' : 'Save favorite store'}
        >
          <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current' : ''}`} />
        </button>

        {/* Delivery ETA Pill */}
        <div className="absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-stone-900/85 backdrop-blur-sm text-white text-[11px] font-semibold flex items-center gap-1.5 shadow-xs">
          <Clock className="w-3 h-3 text-orange-400" />
          <span>{store.deliveryTimeMin} mins</span>
        </div>

        {/* Distance Badge */}
        <div className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-white/90 dark:bg-stone-900/90 backdrop-blur-sm text-stone-800 dark:text-stone-200 text-[11px] font-semibold flex items-center gap-1 shadow-xs">
          <MapPin className="w-3 h-3 text-orange-500" />
          <span>{distance} km</span>
        </div>
      </div>

      {/* Store Information */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider">
              {store.category}
            </span>
            <div className="flex items-center gap-1 text-xs font-bold text-stone-800 dark:text-stone-200">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>{store.rating > 0 ? store.rating : 'New'}</span>
              {store.reviewCount > 0 && (
                <span className="text-stone-400 font-normal">({store.reviewCount})</span>
              )}
            </div>
          </div>

          <Link
            to={`/stores/${store.id}`}
            className="block mt-1 font-bold text-base text-stone-900 dark:text-stone-100 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
          >
            <div className="flex items-center gap-1.5">
              <span>{store.name}</span>
              {store.isVerified && (
                <span title="Verified Neighborhood Merchant">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                </span>
              )}
            </div>
          </Link>

          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 line-clamp-2">
            {store.tagline}
          </p>
        </div>

        {/* Bottom Details */}
        <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs text-stone-500">
          <div>
            <span>Min Order: </span>
            <strong className="text-stone-800 dark:text-stone-200 tabular-nums">₹{store.minOrderValue}</strong>
          </div>
          <Link
            to={`/stores/${store.id}`}
            className="font-bold text-orange-600 dark:text-orange-400 hover:underline"
          >
            Visit Store →
          </Link>
        </div>
      </div>
    </div>
  );
};
