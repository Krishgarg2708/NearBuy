import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useMarketplaceStore } from '../store/marketplaceStore';
import { PriceComparisonMatrix } from '../components/common/PriceComparisonMatrix';
import { ArrowLeft, Sparkles, Scale } from 'lucide-react';

export const CompareView: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const { products } = useMarketplaceStore();

  const product = products.find((p) => p.id === productId);

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold">Product not found</h2>
        <Link to="/products" className="text-orange-500 font-semibold hover:underline">
          ← Back to all products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back Link */}
      <Link
        to={`/products/${product.id}`}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-900 dark:hover:text-stone-200 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Product Details</span>
      </Link>

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-stone-900 text-white shadow-xl">
        <div className="flex items-center gap-4">
          <img
            src={product.image}
            alt={product.title}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover bg-stone-800 border-2 border-white/20"
          />
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-400 text-[11px] font-semibold">
              <Scale className="w-3 h-3" />
              <span>Real-Time Hyperlocal Comparison</span>
            </div>
            <h1 className="text-lg sm:text-2xl font-extrabold text-white mt-1">
              {product.title}
            </h1>
            <p className="text-xs text-stone-300">
              {product.brand} · {product.unit} · {product.category}
            </p>
          </div>
        </div>
      </div>

      {/* Comparison Engine */}
      <div className="space-y-4">
        <PriceComparisonMatrix product={product} />
      </div>
    </div>
  );
};
