import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useMarketplaceStore } from '../store/marketplaceStore';
import { useLocationStore } from '../store/locationStore';
import { useCartStore } from '../store/cartStore';
import { ProductCard } from '../components/common/ProductCard';
import { LeafletMap } from '../components/common/LeafletMap';
import {
  MapPin,
  Clock,
  Phone,
  Mail,
  Star,
  CheckCircle2,
  Heart,
  Share2,
  ShoppingBag,
  ArrowLeft,
  MessageSquare,
  QrCode,
  X,
  Camera,
} from 'lucide-react';
import QRCode from 'qrcode';
import { useQRScannerStore } from '../store/qrScannerStore';

export const StoreDetailView: React.FC = () => {
  const { storeId } = useParams<{ storeId: string }>();
  const { stores, products, offersByProduct, reviews, addReview, favoriteStoreIds, toggleFavoriteStore } =
    useMarketplaceStore();
  const { calculateDistance } = useLocationStore();
  const { addItem } = useCartStore();
  const { openScanner } = useQRScannerStore();

  const [newReviewComment, setNewReviewComment] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [activeTab, setActiveTab] = useState<'products' | 'reviews' | 'about'>('products');
  const [showQrModal, setShowQrModal] = useState(false);
  const [storeQrUrl, setStoreQrUrl] = useState<string>('');

  const store = stores.find((s) => s.id === storeId);

  // Store's products that this merchant actually offers
  const storeProducts = useMemo(() => {
    if (!store) return [];
    return products.filter((p) => {
      const offers = offersByProduct[p.id] || [];
      return offers.some((off) => off.merchantId === store.id && off.stock > 0);
    });
  }, [products, offersByProduct, store]);

  // Store reviews
  const storeReviews = useMemo(() => {
    if (!store) return [];
    return reviews.filter((r) => r.targetType === 'store' && r.targetId === store.id);
  }, [reviews, store]);

  const isFavorite = store ? favoriteStoreIds.includes(store.id) : false;

  React.useEffect(() => {
    if (store) {
      QRCode.toDataURL(`nearbuy://store/${store.id}`, {
        width: 260,
        margin: 2,
        color: {
          dark: '#171717',
          light: '#FFFFFF',
        },
      })
        .then((url) => setStoreQrUrl(url))
        .catch((err) => console.error('Failed to create store QR', err));
    }
  }, [store]);

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!store || !newReviewComment.trim()) return;

    addReview({
      id: 'rev_' + Date.now(),
      targetType: 'store',
      targetId: store.id,
      customerId: 'user_cust_1',
      customerName: 'Priya Sharma',
      rating: newReviewRating,
      comment: newReviewComment.trim(),
      createdAt: new Date().toISOString(),
    });

    setNewReviewComment('');
  };

  if (!store) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold">Store not found</h2>
        <Link to="/stores" className="text-orange-500 font-semibold hover:underline">
          ← Back to all nearby stores
        </Link>
      </div>
    );
  }

  const distance = calculateDistance(store.lat, store.lng);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back Button */}
      <Link
        to="/stores"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-900 dark:hover:text-stone-200 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Nearby Stores</span>
      </Link>

      {/* Store Header Banner Card */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 overflow-hidden shadow-xs">
        <div className="relative h-48 sm:h-64 w-full bg-stone-800 overflow-hidden">
          <img
            src={store.bannerImage}
            alt={store.name}
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent" />

          {/* Action buttons */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button
              onClick={() => setShowQrModal(true)}
              className="px-3 py-2 rounded-full backdrop-blur-md bg-white/90 dark:bg-stone-900/90 text-stone-800 dark:text-stone-200 hover:text-orange-500 text-xs font-bold transition-all flex items-center gap-1.5 shadow-md hover:scale-105 active:scale-95"
              title="View In-Store QR Standee"
            >
              <QrCode className="w-4 h-4 text-orange-500" />
              <span className="hidden sm:inline">In-Store QR Standee</span>
            </button>
            <button
              onClick={() => toggleFavoriteStore(store.id)}
              className={`p-2.5 rounded-full backdrop-blur-md transition-all shadow-md ${
                isFavorite
                  ? 'bg-rose-500 text-white'
                  : 'bg-white/80 dark:bg-stone-900/80 text-stone-800 dark:text-stone-200 hover:text-rose-500'
              }`}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* Store Profile Info */}
        <div className="p-6 sm:p-8 -mt-16 sm:-mt-20 relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 pb-6 border-b border-stone-100 dark:border-stone-800">
            <div className="flex items-end gap-4">
              <img
                src={store.image}
                alt={store.name}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-4 border-white dark:border-stone-900 shadow-xl"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-extrabold text-stone-950 dark:text-white">
                    {store.name}
                  </h1>
                  {store.isVerified && (
                    <span title="Verified Merchant">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    </span>
                  )}
                </div>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 max-w-lg">
                  {store.tagline}
                </p>
                <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500 mt-2">
                  <span className="font-semibold text-orange-600 dark:text-orange-400">
                    {store.category}
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1 font-bold text-stone-800 dark:text-stone-200">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span>{store.rating}</span>
                    <span className="text-stone-400 font-normal">({store.reviewCount} reviews)</span>
                  </span>
                  <span>·</span>
                  <span>{distance} km away</span>
                </div>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="flex items-center gap-4 bg-stone-50 dark:bg-stone-800/60 p-3 rounded-2xl border border-stone-100 dark:border-stone-700/60">
              <div>
                <div className="text-[10px] text-stone-400">Delivery ETA</div>
                <div className="text-xs font-bold text-stone-900 dark:text-stone-100 tabular-nums">
                  ~{store.deliveryTimeMin} mins
                </div>
              </div>
              <div className="h-6 w-px bg-stone-200 dark:bg-stone-700" />
              <div>
                <div className="text-[10px] text-stone-400">Min Order</div>
                <div className="text-xs font-bold text-stone-900 dark:text-stone-100 tabular-nums">
                  ₹{store.minOrderValue}
                </div>
              </div>
              <div className="h-6 w-px bg-stone-200 dark:bg-stone-700" />
              <div>
                <div className="text-[10px] text-stone-400">Status</div>
                <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  {store.isOpen ? 'Open Now' : 'Closed'}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 pt-6">
            <button
              onClick={() => setActiveTab('products')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'products'
                  ? 'bg-orange-500 text-white shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
            >
              Available Products ({storeProducts.length})
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'reviews'
                  ? 'bg-orange-500 text-white shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
            >
              Customer Reviews ({storeReviews.length})
            </button>
            <button
              onClick={() => setActiveTab('about')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'about'
                  ? 'bg-orange-500 text-white shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
            >
              Store Info & Location
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-stone-950 dark:text-white">
              Catalog from {store.name}
            </h2>
            <span className="text-xs text-stone-400">{storeProducts.length} items in stock</span>
          </div>

          {storeProducts.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800">
              <p className="text-xs text-stone-500">No active products listed for this store at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {storeProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'reviews' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Review List */}
          <div className="lg:col-span-7 space-y-4">
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
              Recent Reviews from Neighborhood Customers
            </h3>
            {storeReviews.length === 0 ? (
              <p className="text-xs text-stone-500">No reviews yet. Be the first to review this store!</p>
            ) : (
              <div className="space-y-3">
                {storeReviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-xs text-stone-900 dark:text-stone-100">
                        {rev.customerName}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-amber-500">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span className="font-bold">{rev.rating}</span>
                      </div>
                    </div>
                    <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                      {rev.comment}
                    </p>
                    {rev.merchantReply && (
                      <div className="mt-2 pl-3 border-l-2 border-orange-500 text-[11px] text-stone-500 dark:text-stone-400 bg-stone-50 dark:bg-stone-800/50 p-2 rounded-r-xl">
                        <strong className="text-stone-700 dark:text-stone-300">Merchant reply:</strong> {rev.merchantReply}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add Review Form */}
          <div className="lg:col-span-5 bg-white dark:bg-stone-900 p-6 rounded-3xl border border-stone-200/80 dark:border-stone-800 h-fit space-y-4">
            <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100">Leave a Review</h3>
            <form onSubmit={handleReviewSubmit} className="space-y-3">
              <div>
                <label className="text-xs text-stone-500 block mb-1">Rating</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewReviewRating(star)}
                      className="p-1 text-amber-500"
                    >
                      <Star className={`w-5 h-5 ${newReviewRating >= star ? 'fill-current' : ''}`} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-stone-500 block mb-1">Your Feedback</label>
                <textarea
                  rows={3}
                  value={newReviewComment}
                  onChange={(e) => setNewReviewComment(e.target.value)}
                  placeholder="Share details of delivery speed, product freshness, or packaging..."
                  className="w-full p-3 rounded-xl text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-hidden focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-all shadow-xs"
              >
                Submit Review
              </button>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'about' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-white dark:bg-stone-900 p-6 sm:p-8 rounded-3xl border border-stone-200/80 dark:border-stone-800">
          <div className="lg:col-span-6 space-y-4">
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">About {store.name}</h3>
            <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
              {store.description}
            </p>
            <div className="space-y-2 pt-2 text-xs text-stone-600 dark:text-stone-400">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-orange-500 shrink-0" />
                <span>{store.address}, {store.city} - {store.pincode}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-500 shrink-0" />
                <span>Hours: {store.openingTime} - {store.closingTime}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-orange-500 shrink-0" />
                <span>{store.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-orange-500 shrink-0" />
                <span>{store.email}</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 h-64 rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-700">
            <LeafletMap
              center={[store.lat, store.lng]}
              zoom={15}
              markers={[
                {
                  id: store.id,
                  lat: store.lat,
                  lng: store.lng,
                  title: store.name,
                  subtitle: store.address,
                  type: 'store',
                },
              ]}
              className="h-full w-full"
            />
          </div>
        </div>
      )}

      {/* Store QR Standee Modal Dialog */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl shadow-2xl max-w-sm w-full p-6 text-center space-y-4 relative">
            <button
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border border-orange-200/80 dark:border-orange-800/80 text-xs font-bold">
              <QrCode className="w-3.5 h-3.5" />
              <span>Official Merchant Standee</span>
            </div>

            <div>
              <h3 className="text-lg font-black text-stone-900 dark:text-white">
                {store.name}
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                Scan with NearBuy mobile app to view live aisle products & in-store coupons
              </p>
            </div>

            {/* QR Image Frame */}
            <div className="p-4 bg-white rounded-2xl border-2 border-stone-200 dark:border-stone-700 shadow-inner w-56 h-56 mx-auto flex items-center justify-center">
              {storeQrUrl ? (
                <img
                  src={storeQrUrl}
                  alt={`${store.name} QR Code`}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-xs text-stone-400 animate-pulse">Generating Standee QR...</div>
              )}
            </div>

            <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 text-[11px] font-mono text-stone-600 dark:text-stone-300 break-all select-all">
              nearbuy://store/{store.id}
            </div>

            <div className="space-y-2 pt-1">
              <button
                onClick={() => {
                  setShowQrModal(false);
                  openScanner('camera');
                }}
                className="w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Test Live QR Scanner</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

