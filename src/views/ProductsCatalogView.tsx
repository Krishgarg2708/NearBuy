import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMarketplaceStore } from '../store/marketplaceStore';
import { ProductCard } from '../components/common/ProductCard';
import { PriceComparisonMatrix } from '../components/common/PriceComparisonMatrix';
import { Product } from '../types';
import { Search, Filter, X, ArrowUpDown } from 'lucide-react';

export const ProductsCatalogView: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'All';
  const initialSearch = searchParams.get('search') || '';

  const { products, categories, offersByProduct } = useMarketplaceStore();

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState<'featured' | 'price_asc' | 'price_desc' | 'name'>('featured');
  const [comparingProduct, setComparingProduct] = useState<Product | null>(null);

  const filteredProducts = useMemo(() => {
    let list = products.filter((p) => {
      const matchesCat =
        selectedCategory === 'All' || p.category.toLowerCase().includes(selectedCategory.toLowerCase());
      const matchesQuery =
        !searchQuery.trim() ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesCat && matchesQuery;
    });

    switch (sortBy) {
      case 'price_asc':
        return list.sort((a, b) => {
          const minA = Math.min(...(offersByProduct[a.id]?.map((o) => o.price) || [9999]));
          const minB = Math.min(...(offersByProduct[b.id]?.map((o) => o.price) || [9999]));
          return minA - minB;
        });
      case 'price_desc':
        return list.sort((a, b) => {
          const minA = Math.min(...(offersByProduct[a.id]?.map((o) => o.price) || [0]));
          const minB = Math.min(...(offersByProduct[b.id]?.map((o) => o.price) || [0]));
          return minB - minA;
        });
      case 'name':
        return list.sort((a, b) => a.title.localeCompare(b.title));
      default:
        return list;
    }
  }, [products, selectedCategory, searchQuery, sortBy, offersByProduct]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200 dark:border-stone-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-950 dark:text-white">
            Neighborhood Products Catalog
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Compare prices for identical items across physical stores nearby.
          </p>
        </div>
      </div>

      {/* Filter and Sort Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white dark:bg-stone-900 p-3 rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-xs">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search milk, sourdough, headphones, face serum..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            aria-label="Filter products by department"
            className="py-2 px-3 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700"
          >
            <option value="All">All Departments</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            aria-label="Sort products by criteria"
            className="py-2 px-3 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 font-medium"
          >
            <option value="featured">Featured First</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="name">Product Name (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="p-16 text-center bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 space-y-3">
          <Search className="w-8 h-8 text-stone-300 mx-auto" />
          <h3 className="font-bold text-stone-900 dark:text-stone-100">No matching products found</h3>
          <p className="text-xs text-stone-500">Try adjusting your filters or searching for another keyword.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
            }}
            className="px-4 py-2 rounded-xl bg-orange-500 text-white text-xs font-bold"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              onOpenCompare={(item) => setComparingProduct(item)}
            />
          ))}
        </div>
      )}

      {/* Comparison Modal */}
      {comparingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
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
                setTimeout(() => setComparingProduct(null), 800);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
