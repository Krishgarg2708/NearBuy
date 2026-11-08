import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../../types';
import { useMarketplaceStore } from '../../store/marketplaceStore';
import { useCartStore } from '../../store/cartStore';
import { Heart, Scale, ShoppingBag, Store } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onOpenCompare?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onOpenCompare }) => {
  const { offersByProduct, wishlistProductIds, toggleWishlist } = useMarketplaceStore();
  const { addItem } = useCartStore();

  const offers = offersByProduct[product.id] || [];
  const isWishlisted = wishlistProductIds.includes(product.id);

  // Find lowest price offer
  const lowestOffer = offers.length > 0 ? [...offers].sort((a, b) => a.price - b.price)[0] : null;

  return (
    <div className="group relative bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/80 dark:border-stone-800 p-3 flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-stone-200/50 dark:hover:shadow-stone-950/50">
      {/* Top Media Frame */}
      <div className="relative aspect-4/3 w-full rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-800">
        <img
          src={product.image}
          alt={product.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className={`absolute top-2 right-2 p-2 rounded-full backdrop-blur-md transition-all ${
            isWishlisted
              ? 'bg-rose-500 text-white'
              : 'bg-white/80 dark:bg-stone-900/80 text-stone-600 dark:text-stone-300 hover:text-rose-500'
          }`}
          title={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
        >
          <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>

        {/* Merchant Count Badge */}
        {offers.length > 1 && (
          <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-stone-900/80 dark:bg-stone-900/90 backdrop-blur-sm text-[11px] font-semibold text-white flex items-center gap-1">
            <Store className="w-3 h-3 text-orange-400" />
            <span>{offers.length} nearby stores</span>
          </div>
        )}
      </div>

      {/* Body Information */}
      <div className="pt-3 pb-2 flex-1 flex flex-col justify-between">
        <div>
          <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
            {product.brand} · {product.unit}
          </div>
          <Link
            to={`/products/${product.id}`}
            className="block mt-1 font-semibold text-sm text-stone-900 dark:text-stone-100 hover:text-orange-600 dark:hover:text-orange-400 line-clamp-2 leading-snug"
          >
            {product.title}
          </Link>
        </div>

        {/* Price & Merchant Best Deal */}
        <div className="mt-3 pt-2.5 border-t border-stone-100 dark:border-stone-800 flex items-end justify-between">
          <div>
            <div className="text-[10px] text-stone-400">
              {offers.length > 1 ? 'Best price from' : 'Local price'}
            </div>
            {lowestOffer ? (
              <div className="flex items-baseline gap-1.5">
                <span className="text-base font-extrabold text-stone-900 dark:text-stone-100 tabular-nums">
                  ₹{lowestOffer.price}
                </span>
                {lowestOffer.originalPrice > lowestOffer.price && (
                  <span className="text-xs text-stone-400 line-through tabular-nums">
                    ₹{lowestOffer.originalPrice}
                  </span>
                )}
              </div>
            ) : (
              <span className="text-xs text-stone-400 font-medium">Out of stock</span>
            )}
          </div>

          {/* Quick Actions: Compare or Quick Add */}
          <div className="flex items-center gap-1.5">
            <Link
              to={`/compare/${product.id}`}
              className="p-2 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-orange-50 dark:hover:bg-orange-950/40 text-stone-700 dark:text-stone-300 hover:text-orange-600 transition-colors"
              title="Compare prices across local stores"
            >
              <Scale className="w-3.5 h-3.5" />
            </Link>

            {lowestOffer && (
              <button
                onClick={() => addItem(product, lowestOffer, 1)}
                className="px-3 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold flex items-center gap-1 transition-all shadow-xs"
                title={`Add best price from ${lowestOffer.storeName}`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
