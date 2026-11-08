export type UserRole = 'customer' | 'merchant' | 'delivery' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  storeId?: string; // If merchant
  createdAt: string;
}

export interface Address {
  id: string;
  label: 'Home' | 'Work' | 'Other';
  street: string;
  area: string;
  landmark?: string;
  city: string;
  pincode: string;
  lat: number;
  lng: number;
  isDefault?: boolean;
}

export interface StoreCategory {
  id: string;
  name: string;
  slug: string;
  iconName: string;
  image: string;
  productCount: number;
  description: string;
}

export interface Store {
  id: string;
  name: string;
  tagline: string;
  description: string;
  category: string;
  address: string;
  area: string;
  city: string;
  pincode: string;
  lat: number;
  lng: number;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  status: 'approved' | 'pending' | 'rejected' | 'suspended';
  openingTime: string;
  closingTime: string;
  isOpen: boolean;
  deliveryTimeMin: number;
  deliveryFee: number;
  minOrderValue: number;
  image: string;
  bannerImage: string;
  phone: string;
  email: string;
  ownerName: string;
  featuredTags: string[];
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  brand: string;
  category: string;
  description: string;
  specifications: Record<string, string>;
  image: string;
  gallery: string[];
  unit: string; // e.g. "1 L", "500 g", "1 unit", "Pack of 4"
  tags: string[];
  isFeatured?: boolean;
}

export interface MerchantProductOffer {
  merchantId: string;
  storeName: string;
  area: string;
  distanceKm: number;
  price: number;
  originalPrice: number;
  stock: number;
  isAvailable: boolean;
  deliveryTimeMin: number;
  rating: number;
  reviewCount: number;
}

export interface CartItem {
  productId: string;
  merchantId: string;
  title: string;
  brand: string;
  image: string;
  unit: string;
  price: number;
  originalPrice: number;
  quantity: number;
  storeName: string;
  deliveryTimeMin: number;
  deliveryFee: number;
}

export type OrderStatus =
  | 'placed'
  | 'accepted'
  | 'preparing'
  | 'ready'
  | 'picked_up'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export interface OrderTimelineEvent {
  status: OrderStatus;
  title: string;
  description: string;
  timestamp: string;
}

export interface OrderItem {
  productId: string;
  title: string;
  brand: string;
  price: number;
  quantity: number;
  unit: string;
  image: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: Address;
  merchantId: string;
  merchantName: string;
  merchantAddress: string;
  merchantPhone: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  taxes: number;
  total: number;
  couponCode?: string;
  paymentMethod: 'upi' | 'cod' | 'card' | 'online';
  paymentStatus: 'paid' | 'pending';
  orderType: 'delivery' | 'pickup';
  status: OrderStatus;
  deliveryPartnerId?: string;
  deliveryPartnerName?: string;
  deliveryPartnerPhone?: string;
  createdAt: string;
  estimatedDeliveryTime: string;
  timeline: OrderTimelineEvent[];
  notes?: string;
  cancellationReason?: string;
}

export interface DeliveryPartner {
  id: string;
  name: string;
  phone: string;
  vehicleType: 'Electric Scooter' | 'Bike' | 'Cycle';
  vehicleNumber: string;
  rating: number;
  totalDeliveries: number;
  activeOrderId?: string;
  earningsToday: number;
  status: 'available' | 'busy' | 'offline';
  currentLat: number;
  currentLng: number;
  avatar?: string;
}

export interface Offer {
  id: string;
  code: string;
  title: string;
  description: string;
  discountType: 'percentage' | 'fixed' | 'free_delivery';
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number;
  validUntil: string;
  category?: string;
  storeId?: string;
  usageCount: number;
  isActive: boolean;
}

export interface Review {
  id: string;
  targetType: 'store' | 'product';
  targetId: string;
  customerId: string;
  customerName: string;
  customerAvatar?: string;
  rating: number;
  comment: string;
  createdAt: string;
  merchantReply?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'order' | 'promo' | 'system' | 'inventory';
  createdAt: string;
  read: boolean;
  actionUrl?: string;
}

export type QRScanType = 'store' | 'coupon' | 'product' | 'external';

export interface QRScanResult {
  raw: string;
  type: QRScanType;
  storeId?: string;
  storeName?: string;
  couponCode?: string;
  discountSummary?: string;
  productId?: string;
  title: string;
  description: string;
  metadata?: Record<string, any>;
  scannedAt: string;
}

export interface InStoreRedemptionToken {
  token: string;
  couponCode: string;
  pin: string;
  expiresAt: string;
  remainingSeconds: number;
  status: 'active' | 'redeemed' | 'expired';
}

