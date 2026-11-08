# NearBuy — Premium Hyperlocal Shopping Marketplace

**Discover Local. Shop Nearby. Get It Faster.**

NearBuy is a modern, fully interactive hyperlocal shopping marketplace that connects customers with nearby physical stores. Customers can discover nearby stores, explore local products, compare prices across local merchants in real time, check stock availability, purchase products, select delivery or store pickup, and track orders.

The platform provides four independent, interconnected application experiences:
1. **Customer Marketplace** (`/explore`, `/stores`, `/products`, `/cart`, `/checkout`, `/track/:orderId`)
2. **Merchant Dashboard** (`/merchant/dashboard`)
3. **Delivery Partner Dashboard** (`/delivery/dashboard`)
4. **Super Admin Console** (`/admin/dashboard`)

---

## 🌟 Key Features

### 1. Local Price Comparison Engine (Signature Feature)
- When viewing a product, customers see real-time offers for the exact same branded product across nearby physical merchants.
- Sort and compare by:
  - **Cheapest**: Highlights the lowest price offer and savings percentage.
  - **Nearest**: Sorts by physical distance in kilometers based on customer neighborhood coordinates.
  - **Fastest**: Highlights the shortest delivery estimated time (15–20 minutes).
  - **Highest Rated**: Highlights the most trusted merchant rating.
- Customers can select an offer from any merchant directly and add it to their bag.

### 2. Location & Nearby Store Discovery
- Interactive **Leaflet map with OpenStreetMap** showcasing nearby verified merchants.
- Filter by distance radius (1–10 km), department categories, and search keywords.
- Support for simulated neighborhood GPS detection or manual neighborhood address selection (Indiranagar, Koramangala, Domlur, HSR Layout).

### 3. Multi-Merchant Cart & Checkout
- **Strict multi-merchant grouping**: Products from different stores are displayed in clean merchant groupings with itemized subtotals and fulfillment fees.
- **Fulfillment flexibility**: Switch between **Home Delivery** and **Store Pickup** (waives delivery fee).
- **Coupons**: Working promo codes (`NEARBUY50`, `FREEDEL`, `LOCAL15`, `SUPER100`).
- **Simulated checkout**: Supports UPI (GPay/PhonePe), Credit/Debit Card, NetBanking, and Cash on Delivery with confetti celebrations.

### 4. Real-Time Order Tracking & Simulated Push Notifications
- Complete 7-step simulated lifecycle:
  1. *Order Placed*
  2. *Merchant Accepted*
  3. *Preparing Order*
  4. *Ready for Dispatch*
  5. *Picked Up*
  6. *Out for Delivery*
  7. *Delivered*
- **Simulated Mobile Push Notification System**:
  - Clearly distinct from the in-app notification inbox.
  - Floating top mobile banner mimicking **iOS Dynamic Frosted Glass** or **Android Material 3** notification card.
  - Automatically triggered on all order state transitions (*Store Accepted*, *Packing*, *Picked Up*, *Out for Delivery*, *Delivered*).
  - Synthesized Web Audio API harmonic chime (`playChime`) on arrival.
  - Direct **"Track Order"** button navigating directly to live tracking view.
  - **Full User Configuration**:
    - Master Push Toggle (Enable / Disable)
    - Sound Chime (On / Off with test chime preview)
    - Visual skin switch (iOS Dynamic Island vs. Android Material)
    - Auto-dismiss duration (4s, 6s, 10s, or manual dismiss)
    - Granular event subscriptions
    - **"Send Test Push Now"** button for immediate verification.
- Live driver route on Leaflet map with simulated delivery partner marker.
- Interactive **"Simulate Next Step"** button for evaluators to test order progression instantly without waiting.
- In-app chat simulation with the delivery partner.

### 5. Merchant Management Portal
- Real-time revenue metrics, daily sales volume charts (Recharts), and low-stock warnings.
- **Order Management**: Table & Kanban pipeline with 1-click order state updates (*Accept*, *Pack*, *Mark Ready*).
- **Inventory Management**: Immediate stock level adjustments (+10 units, -5 units) that instantly synchronize with the customer price comparison matrix.
- **Price Configuration**: Edit product prices to compete in the neighborhood comparison engine.
- **Add Product Modal**: Create and list new items with instant publishing.
- **CSV Export**: Export order transaction reports.

### 6. Delivery Partner Experience
- View available ready orders in the neighborhood and accept delivery.
- Active delivery routing with store pickup and customer drop directions.
- "Mark Delivered" action that immediately updates the customer's live tracking view.
- Real-time earnings tracker.

### 7. Super Admin Console
- Platform GMV, commission metrics (10% platform fee), active merchants, and growth charts.
- **Merchant Onboarding & Verification**: Review, approve, reject, or suspend physical store applications (e.g. approve *Metro Daily Mart*).
- Platform-wide CSV report downloads.
- 1-click **Reset Demo Data** button to restore seed state anytime.

### 8. Fluid Cursor & Dual Theme
- Spring-physics fluid trailing cursor with magnetic button interactions (automatically disabled on touch devices or `prefers-reduced-motion`).
- Light / Dark mode toggle with persistent Tailwind v4 `@custom-variant dark` support.

---

## 🛠️ Technology Stack

- **Framework**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS v4, Plus Jakarta Sans, JetBrains Mono
- **Animations & Motion**: Framer Motion (`motion/react`), Canvas Confetti
- **State Management**: Zustand with `localStorage` persistence
- **Mapping**: Leaflet with OpenStreetMap vector tiles & custom SVG markers
- **Icons**: Lucide React
- **Data Visualization**: Recharts (Area charts, Bar charts)
- **Routing**: React Router DOM (v7)

---

## 🚀 Instant Persona Switcher

Use the top ribbon bar to instantly switch personas during evaluation:
- 🛒 **Customer View**: Browse marketplace, compare prices, order products.
- 🏪 **Merchant Hub**: Manage Green Basket Organic's orders, pricing, and stock.
- 🛵 **Delivery Partner**: Accept delivery orders and complete fulfillment runs.
- 🛡️ **Super Admin**: Audit platform GMV and approve/reject merchants.
- 🔄 **Reset Demo Data**: Restore all initial seeds anytime.
