import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useMarketplaceStore } from '../store/marketplaceStore';
import { useCartStore } from '../store/cartStore';
import { PriceComparisonMatrix } from '../components/common/PriceComparisonMatrix';
import { ProductCard } from '../components/common/ProductCard';
import {
  ArrowLeft,
  Heart,
  Share2,
  CheckCircle2,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

export const ProductDetailView: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { products, wishlistProductIds, toggleWishlist, offersByProduct } = useMarketplaceStore();
  const { addItem } = useCartStore();

  const product = products.find((p) => p.id === productId);
  const offers = product ? offersByProduct[product.id] || [] : [];
  const lowestOffer = offers.length > 0 ? [...offers].sort((a, b) => a.price - b.price)[0] : null;

  const [selectedImage, setSelectedImage] = useState<string>(product?.image || '');
  const [activeTab, setActiveTab] = useState<'comparison' | 'specs' | 'reviews'>('comparison');

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold">Product not found</h2>
        <Link to="/products" className="text-orange-500 font-semibold hover:underline">
          ← Back to all products
        </Link>
      </div>
    );
  }

  const isWishlisted = wishlistProductIds.includes(product.id);
  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Back Button */}
      <Link
        to="/products"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-900 dark:hover:text-stone-200 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Products</span>
      </Link>

      {/* Main PDP Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Image Gallery (Contiguous Sticky Gallery) */}
        <div className="lg:col-span-6 space-y-4 sticky top-24">
          <div className="aspect-4/3 w-full rounded-3xl overflow-hidden bg-stone-100 dark:bg-stone-800 border border-stone-200/80 dark:border-stone-800 relative shadow-sm">
            <img
              src={selectedImage || product.image}
              alt={product.title}
              className="w-full h-full object-cover transition-all duration-300"
            />
            <button
              onClick={() => toggleWishlist(product.id)}
              className={`absolute top-4 right-4 p-3 rounded-full backdrop-blur-md transition-all shadow-md ${
                isWishlisted
                  ? 'bg-rose-500 text-white'
                  : 'bg-white/80 dark:bg-stone-900/80 text-stone-700 dark:text-stone-300 hover:text-rose-500'
              }`}
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Gallery Thumbnails */}
          {product.gallery && product.gallery.length > 1 && (
            <div className="flex items-center gap-3">
              {product.gallery.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all ${
                    (selectedImage || product.image) === img
                      ? 'border-orange-500 shadow-md scale-105'
                      : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Hyperlocal Trust Signals */}
          <div className="grid grid-cols-3 gap-3 pt-3">
            <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-100 dark:border-stone-700/60 text-center space-y-1">
              <Truck className="w-4 h-4 text-orange-500 mx-auto" />
              <div className="text-[11px] font-bold text-stone-800 dark:text-stone-200">15–30m Delivery</div>
              <div className="text-[10px] text-stone-400">From local neighborhood</div>
            </div>
            <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-100 dark:border-stone-700/60 text-center space-y-1">
              <ShieldCheck className="w-4 h-4 text-emerald-500 mx-auto" />
              <div className="text-[11px] font-bold text-stone-800 dark:text-stone-200">100% Genuine</div>
              <div className="text-[10px] text-stone-400">Verified physical stores</div>
            </div>
            <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-100 dark:border-stone-700/60 text-center space-y-1">
              <RotateCcw className="w-4 h-4 text-purple-500 mx-auto" />
              <div className="text-[11px] font-bold text-stone-800 dark:text-stone-200">Easy Exchange</div>
              <div className="text-[10px] text-stone-400">Direct store return</div>
            </div>
          </div>
        </div>

        {/* Right Column: Contiguous Purchase Module & Comparison */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            <div className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider">
              {product.brand} · {product.category}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-950 dark:text-white mt-1 leading-snug">
              {product.title}
            </h1>
            <div className="text-xs text-stone-500 mt-1">Pack/Unit: {product.unit}</div>
          </div>

          {/* Best Offer Snapshot Bar */}
          {lowestOffer && (
            <div className="p-4 rounded-2xl bg-orange-50/70 dark:bg-orange-950/20 border border-orange-200/80 dark:border-orange-800/60 flex items-center justify-between">
              <div>
                <div className="text-[11px] font-bold text-orange-600 dark:text-orange-400 uppercase">
                  Best Local Price
                </div>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-2xl font-black text-stone-900 dark:text-stone-100 tabular-nums">
                    ₹{lowestOffer.price}
                  </span>
                  {lowestOffer.originalPrice > lowestOffer.price && (
                    <span className="text-sm text-stone-400 line-through tabular-nums">
                      ₹{lowestOffer.originalPrice}
                    </span>
                  )}
                </div>
                <div className="text-xs text-stone-600 dark:text-stone-300">
                  Offered by <strong>{lowestOffer.storeName}</strong> ({lowestOffer.distanceKm} km away)
                </div>
              </div>

              <button
                onClick={() => {
                  addItem(product, lowestOffer, 1);
                  navigate('/cart');
                }}
                className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-all shadow-md shadow-orange-500/20"
              >
                Buy Now
              </button>
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wider">
              Product Overview
            </h3>
            <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Signature Feature: Embedded Price Comparison Matrix */}
          <div className="space-y-3 pt-2">
            <PriceComparisonMatrix product={product} />
          </div>

          {/* Specifications Table */}
          {product.specifications && (
            <div className="space-y-3 pt-4 border-t border-stone-200 dark:border-stone-800">
              <h3 className="text-xs font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wider">
                Key Specifications
              </h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {Object.entries(product.specifications).map(([key, val]) => (
                  <div
                    key={key}
                    className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/40 border border-stone-100 dark:border-stone-800"
                  >
                    <div className="text-[10px] text-stone-400">{key}</div>
                    <div className="font-semibold text-stone-800 dark:text-stone-200 mt-0.5">{String(val)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Products from Neighborhood */}
      {relatedProducts.length > 0 && (
        <div className="pt-12 border-t border-stone-200 dark:border-stone-800 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider">
                Related Items
              </div>
              <h2 className="text-xl font-bold text-stone-950 dark:text-white mt-0.5">
                More in {product.category}
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
