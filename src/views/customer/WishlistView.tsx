import React from 'react';
import { Link } from 'react-router-dom';
import { useMarketplaceStore } from '../../store/marketplaceStore';
import { ProductCard } from '../../components/common/ProductCard';
import { Heart, ArrowLeft, ArrowRight } from 'lucide-react';

export const WishlistView: React.FC = () => {
  const { products, wishlistProductIds } = useMarketplaceStore();

  const wishlistedProducts = products.filter((p) => wishlistProductIds.includes(p.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-stone-200 dark:border-stone-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-950 dark:text-white">
            Saved Wishlist ({wishlistedProducts.length})
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Products you bookmarked for quick neighborhood reordering.
          </p>
        </div>
        <Link
          to="/products"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-all shadow-xs"
        >
          <span>Browse Products</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {wishlistedProducts.length === 0 ? (
        <div className="p-16 text-center bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 space-y-4">
          <Heart className="w-10 h-10 text-stone-300 mx-auto" />
          <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
            Your wishlist is empty
          </h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Click the heart icon on any product card or detail page to save it here.
          </p>
          <Link
            to="/explore"
            className="inline-block px-5 py-2.5 rounded-xl bg-orange-500 text-white text-xs font-bold"
          >
            Explore Items
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {wishlistedProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
};
