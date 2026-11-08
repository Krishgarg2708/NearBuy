import React, { useState, useMemo } from 'react';
import { Product, MerchantProductOffer } from '../../types';
import { useCartStore } from '../../store/cartStore';
import { useMarketplaceStore } from '../../store/marketplaceStore';
import {
  Tag,
  Clock,
  MapPin,
  Star,
  Check,
  TrendingDown,
  Zap,
  ShoppingBag,
  ExternalLink,
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface PriceComparisonMatrixProps {
  product: Product;
  onAddedToCart?: () => void;
}

type SortFilter = 'cheapest' | 'nearest' | 'fastest' | 'highest_rated';

export const PriceComparisonMatrix: React.FC<PriceComparisonMatrixProps> = ({
  product,
  onAddedToCart,
}) => {
  const { offersByProduct } = useMarketplaceStore();
  const { addItem, items } = useCartStore();
  const [activeSort, setActiveSort] = useState<SortFilter>('cheapest');
  const [justAddedMerchantId, setJustAddedMerchantId] = useState<string | null>(null);

  const rawOffers: MerchantProductOffer[] = useMemo(() => {
    return offersByProduct[product.id] || [];
  }, [offersByProduct, product.id]);

  // Find baseline stats for badge highlights
  const minPrice = useMemo(() => {
    if (!rawOffers.length) return 0;
    return Math.min(...rawOffers.map((o) => o.price));
  }, [rawOffers]);

  const maxPrice = useMemo(() => {
    if (!rawOffers.length) return 0;
    return Math.max(...rawOffers.map((o) => o.price));
  }, [rawOffers]);

  const minDistance = useMemo(() => {
    if (!rawOffers.length) return 0;
    return Math.min(...rawOffers.map((o) => o.distanceKm));
  }, [rawOffers]);

  const minDeliveryTime = useMemo(() => {
    if (!rawOffers.length) return 0;
    return Math.min(...rawOffers.map((o) => o.deliveryTimeMin));
  }, [rawOffers]);

  const maxRating = useMemo(() => {
    if (!rawOffers.length) return 0;
    return Math.max(...rawOffers.map((o) => o.rating));
  }, [rawOffers]);

  const sortedOffers = useMemo(() => {
    const list = [...rawOffers];
    switch (activeSort) {
      case 'cheapest':
        return list.sort((a, b) => a.price - b.price);
      case 'nearest':
        return list.sort((a, b) => a.distanceKm - b.distanceKm);
      case 'fastest':
        return list.sort((a, b) => a.deliveryTimeMin - b.deliveryTimeMin);
      case 'highest_rated':
        return list.sort((a, b) => b.rating - a.rating);
      default:
        return list;
    }
  }, [rawOffers, activeSort]);

  const handleAddToCart = (offer: MerchantProductOffer) => {
    addItem(product, offer, 1);
    setJustAddedMerchantId(offer.merchantId);
    if (onAddedToCart) onAddedToCart();
    setTimeout(() => setJustAddedMerchantId(null), 1800);
  };

  if (!rawOffers.length) {
    return (
      <div className="p-8 text-center bg-stone-50 dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800">
        <p className="text-sm text-stone-500">No merchant offers currently available for this item in your area.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 overflow-hidden shadow-xs">
      {/* Header bar with summary */}
      <div className="p-4 sm:p-5 border-b border-stone-100 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" />
              <span>Hyperlocal Price Comparison</span>
            </div>
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 mt-0.5">
              Available from {rawOffers.length} nearby merchants
            </h3>
            {maxPrice > minPrice && (
              <p className="text-xs text-stone-500 mt-0.5">
                Prices vary from <span className="font-semibold text-stone-900 dark:text-stone-100 tabular-nums">₹{minPrice}</span> to <span className="font-semibold text-stone-900 dark:text-stone-100 tabular-nums">₹{maxPrice}</span> · Save up to{' '}
                <span className="font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
                  ₹{maxPrice - minPrice} ({Math.round(((maxPrice - minPrice) / maxPrice) * 100)}%)
                </span>
              </p>
            )}
          </div>

          {/* Sort Filter Tabs (Segmented Control) */}
          <div className="flex items-center gap-1 p-1 bg-stone-200/70 dark:bg-stone-800 rounded-xl self-start sm:self-auto overflow-x-auto max-w-full">
            <button
              onClick={() => setActiveSort('cheapest')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                activeSort === 'cheapest'
                  ? 'bg-white dark:bg-stone-900 text-stone-950 dark:text-white shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              Cheapest
            </button>
            <button
              onClick={() => setActiveSort('nearest')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                activeSort === 'nearest'
                  ? 'bg-white dark:bg-stone-900 text-stone-950 dark:text-white shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              Nearest
            </button>
            <button
              onClick={() => setActiveSort('fastest')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                activeSort === 'fastest'
                  ? 'bg-white dark:bg-stone-900 text-stone-950 dark:text-white shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              Fastest
            </button>
            <button
              onClick={() => setActiveSort('highest_rated')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                activeSort === 'highest_rated'
                  ? 'bg-white dark:bg-stone-900 text-stone-950 dark:text-white shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              Top Rated
            </button>
          </div>
        </div>
      </div>

      {/* Offers List */}
      <div className="divide-y divide-stone-100 dark:divide-stone-800">
        {sortedOffers.map((offer) => {
          const isCheapest = offer.price === minPrice && rawOffers.length > 1;
          const isNearest = offer.distanceKm === minDistance;
          const isFastest = offer.deliveryTimeMin === minDeliveryTime;
          const isTopRated = offer.rating === maxRating;
          const savings = offer.originalPrice > offer.price ? offer.originalPrice - offer.price : 0;
          const isJustAdded = justAddedMerchantId === offer.merchantId;
          const inCartCount = items
            .filter((i) => i.productId === product.id && i.merchantId === offer.merchantId)
            .reduce((sum, i) => sum + i.quantity, 0);

          return (
            <div
              key={offer.merchantId}
              className={`p-4 sm:p-5 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                isCheapest
                  ? 'bg-emerald-50/20 dark:bg-emerald-950/10'
                  : 'hover:bg-stone-50/60 dark:hover:bg-stone-800/30'
              }`}
            >
              {/* Store & Location Details */}
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    to={`/stores/${offer.merchantId}`}
                    className="font-bold text-sm text-stone-900 dark:text-stone-100 hover:text-orange-600 dark:hover:text-orange-400 flex items-center gap-1 group"
                  >
                    <span>{offer.storeName}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-stone-400 group-hover:text-orange-500 shrink-0" />
                  </Link>

                  {/* Highlights (clean unboxed text or soft subtle pill) */}
                  {isCheapest && (
                    <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
                      Best Price
                    </span>
                  )}
                  {isNearest && (
                    <span className="text-[11px] font-bold text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-950/60 px-2 py-0.5 rounded-md">
                      Closest Store
                    </span>
                  )}
                  {isFastest && (
                    <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 rounded-md">
                      Fastest: {offer.deliveryTimeMin}m
                    </span>
                  )}
                </div>

                {/* Subtitle metadata */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-stone-400" />
                    <span>{offer.area} ({offer.distanceKm} km away)</span>
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-stone-400" />
                    <span>~{offer.deliveryTimeMin} min delivery</span>
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="flex items-center gap-1 font-semibold text-stone-700 dark:text-stone-300">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span>{offer.rating}</span>
                    <span className="text-stone-400 font-normal">({offer.reviewCount})</span>
                  </span>
                </div>

                {/* Stock Status */}
                <div className="text-xs text-stone-500">
                  {offer.stock > 10 ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">In Stock</span>
                  ) : offer.stock > 0 ? (
                    <span className="text-amber-600 dark:text-amber-400 font-medium">
                      Only {offer.stock} left in stock
                    </span>
                  ) : (
                    <span className="text-red-500 font-medium">Out of Stock</span>
                  )}
                </div>
              </div>

              {/* Price & Add to Cart Action */}
              <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100 dark:border-stone-800">
                <div className="text-right">
                  <div className="flex items-baseline gap-1.5 justify-end">
                    <span className="text-lg sm:text-xl font-extrabold text-stone-900 dark:text-stone-100 tabular-nums">
                      ₹{offer.price}
                    </span>
                    {offer.originalPrice > offer.price && (
                      <span className="text-xs text-stone-400 line-through tabular-nums">
                        ₹{offer.originalPrice}
                      </span>
                    )}
                  </div>
                  {savings > 0 && (
                    <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                      Save ₹{savings}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleAddToCart(offer)}
                  disabled={offer.stock <= 0}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs shrink-0 ${
                    isJustAdded
                      ? 'bg-emerald-600 text-white'
                      : offer.stock <= 0
                      ? 'bg-stone-200 dark:bg-stone-800 text-stone-400 cursor-not-allowed'
                      : isCheapest
                      ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-orange-500/20'
                      : 'bg-stone-900 hover:bg-stone-800 text-white dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white'
                  }`}
                >
                  {isJustAdded ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Added!</span>
                    </>
                  ) : inCartCount > 0 ? (
                    <>
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Add Another ({inCartCount})</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Select Merchant</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
