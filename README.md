# NearBuy — Premium Hyperlocal Marketplace

<p align="center">
  <strong>Discover Local. Compare Prices. Shop Smarter.</strong>
</p>

<p align="center">
  A next-generation hyperlocal shopping marketplace connecting customers with nearby stores through intelligent product discovery, real-time price comparison, seamless ordering, and delivery tracking.
</p>

<p align="center">
  <b>React.js</b> · <b>TypeScript</b> · <b>Vite</b> · <b>Tailwind CSS</b> · <b>Framer Motion</b>
</p>

---

## 1. Overview

**NearBuy** is a premium hyperlocal commerce platform designed to transform how people discover and purchase products from local businesses.

The platform bridges the gap between traditional neighbourhood stores and modern digital commerce by allowing customers to explore nearby merchants, compare prices for identical products, check availability, place orders, and track deliveries.

Unlike conventional e-commerce platforms that primarily rely on centralized warehouses, NearBuy focuses on local availability, merchant accessibility, and faster fulfilment.

It creates a unified digital ecosystem where customers can shop locally, merchants can manage their businesses, and delivery partners can coordinate fulfilment.

### Our Vision

To make every neighbourhood digitally accessible by connecting local businesses with customers through a smarter, faster, and more transparent shopping experience.

### Core Objectives

- Digitize neighbourhood shopping experiences.
- Connect customers with nearby physical stores.
- Enable transparent local product price comparisons.
- Improve visibility and accessibility for local merchants.
- Simplify online ordering and delivery management.
- Empower small businesses with digital commerce tools.

---

## 2. Key Features

### 2.1 Intelligent Nearby Store Discovery

Discover local businesses based on location, distance, and shopping preferences.

- Location-based store discovery.
- Interactive map integration.
- Nearby merchant listings.
- Distance-based filtering.
- Store ratings and reviews.
- Opening and closing status.
- Estimated delivery times.
- Category-based discovery.
- Store availability indicators.

### 2.2 Smart Product Price Comparison

One of NearBuy's core capabilities is enabling customers to compare identical products across multiple nearby merchants.

- Compare product prices across stores.
- Identify the lowest-priced available offer.
- View merchant ratings.
- Compare delivery estimates.
- Check product availability.
- Calculate potential savings.
- Sort by price, distance, rating, and delivery speed.
- Select preferred merchants.

**Example: Local Product Comparison**

| Merchant | Product Price | Distance | Availability |
|---|---:|---:|---|
| Local Store A | ₹72 | 0.8 km | In Stock |
| Local Store B | ₹70 | 1.4 km | In Stock |
| Local Store C | ₹75 | 0.5 km | Limited Stock |

Customers can choose the merchant offering the best combination of price, proximity, and convenience.

### 2.3 Seamless Online Shopping

A complete customer-facing shopping experience.

- Browse products and categories.
- Search products and brands.
- View detailed product information.
- Add products to cart.
- Modify quantities.
- Manage wishlists.
- Apply promotional coupons.
- Select home delivery or store pickup.
- Review order summaries.
- Access order history.

### 2.4 Real-Time Order Tracking Experience

A structured order tracking interface that allows customers to follow the progress of their purchases.

**Order Lifecycle:**

1. Order Placed.
2. Merchant Accepted.
3. Preparing Order.
4. Ready for Dispatch.
5. Picked Up.
6. Out for Delivery.
7. Delivered.

Additional capabilities:

- Visual order timeline.
- Delivery status updates.
- Estimated arrival time.
- Merchant information.
- Delivery partner information.
- Order history.
- Delivery map interface.

### 2.5 Merchant Management Dashboard

A dedicated business management portal for local retailers.

- Merchant dashboard.
- Store profile management.
- Product management.
- Inventory management.
- Order processing.
- Price management.
- Promotional offers.
- Customer insights.
- Revenue analytics.
- Sales reports.

### 2.6 Inventory Management

Enable merchants to monitor product availability and maintain accurate stock information.

- Stock quantity management.
- Low-stock alerts.
- Out-of-stock indicators.
- Stock adjustments.
- Inventory history.
- Reorder levels.
- Product availability management.
- Inventory valuation.

### 2.7 Delivery Partner Dashboard

A dedicated interface for delivery operations.

- Available delivery requests.
- Active deliveries.
- Delivery acceptance.
- Pickup confirmation.
- Delivery completion.
- Delivery history.
- Earnings overview.
- Interactive delivery maps.

### 2.8 Offers and Promotions

A promotional management system designed to improve customer engagement.

- Percentage-based discounts.
- Fixed-value discounts.
- Free delivery offers.
- Store-specific promotions.
- Category-based deals.
- Flash sales.
- Promotional banners.
- Coupon expiry and usage limits.

### 2.9 Customer Ratings and Reviews

- Product ratings.
- Merchant reviews.
- Customer feedback.
- Review history.
- Merchant responses.

### 2.10 Business Analytics

Provide actionable business insights for merchants and platform administrators.

- Total revenue.
- Total orders.
- Average order value.
- Best-selling products.
- Customer growth.
- Sales by category.
- Merchant performance.
- Platform-wide statistics.

---

## 3. Platform Architecture and User Roles

NearBuy is structured around four distinct user experiences.

| User Role | Primary Responsibilities |
|---|---|
| Customer | Discover stores, compare prices, purchase products, and track orders |
| Merchant | Manage stores, products, inventory, orders, and analytics |
| Delivery Partner | Accept delivery requests and manage fulfilment |
| Super Admin | Manage merchants, customers, deliveries, and marketplace operations |

Each role has its own dedicated interface, navigation structure, and application workflows.

---

## 4. Technology Stack

NearBuy is built using a modern frontend technology ecosystem.

### Frontend Technologies

| Technology | Purpose |
|---|---|
| React.js | Component-based user interface development |
| TypeScript | Static typing and maintainable code |
| Vite | Development server and build tooling |
| Tailwind CSS | Responsive utility-first styling |
| shadcn/ui | Reusable UI components |
| Framer Motion | Animations and transitions |
| Lucide React | Icon system |
| React Router DOM | Client-side navigation |
| Zustand | Global state management |
| Recharts | Analytics and data visualization |
| React Hook Form | Form management |
| Zod | Input and form validation |
| Sonner | Toast notifications |

### Maps and Location

- Leaflet.
- React Leaflet.
- OpenStreetMap.

### Data Management

- Centralized mock datasets.
- LocalStorage persistence.
- Simulated frontend services.
- Shared application state.

**Implementation Note:** The current version is a frontend-only implementation. Authentication, order processing, payments, inventory operations, and delivery tracking use mock services and local application state. A production backend and persistent database are not included.

---

## 5. Design System and User Experience

NearBuy follows a premium, modern, and responsive design philosophy.

### Visual Identity

| Design Element | Specification |
|---|---|
| Primary Color | Vibrant Orange |
| Secondary Color | Deep Violet |
| Light Background | Warm White |
| Dark Background | Charcoal |
| Typography | Inter / Plus Jakarta Sans |
| Design Style | Modern Minimal SaaS |
| Animation | Framer Motion |

### UI/UX Highlights

- Premium landing page.
- Fluid cursor interactions on supported desktop devices.
- Smooth page transitions.
- Interactive product cards.
- Modern merchant dashboards.
- Interactive maps.
- Dark and light themes.
- Responsive navigation.
- Loading skeletons.
- Animated modal interactions.
- Toast notifications.
- Consistent visual hierarchy.

The interface is designed to provide a seamless experience across desktop, tablet, and mobile devices.

---

## 6. Project Structure

NearBuy follows a modular and reusable frontend architecture.

```text
NearBuy/
│
├── public/
│
├── src/
│   ├── assets/
│   │
│   ├── components/
│   │   ├── common/
│   │   ├── ui/
│   │   ├── charts/
│   │   ├── layout/
│   │   └── animations/
│   │
│   ├── pages/
│   │   ├── landing/
│   │   ├── auth/
│   │   ├── customer/
│   │   ├── merchant/
│   │   ├── delivery/
│   │   └── admin/
│   │
│   ├── modules/
│   │   ├── products/
│   │   ├── stores/
│   │   ├── orders/
│   │   ├── cart/
│   │   ├── inventory/
│   │   ├── tracking/
│   │   ├── offers/
│   │   ├── reviews/
│   │   └── analytics/
│   │
│   ├── data/
│   ├── services/
│   ├── store/
│   ├── hooks/
│   ├── types/
│   ├── utils/
│   ├── routes/
│   └── styles/
│
├── App.tsx
├── main.tsx
├── package.json
├── tsconfig.json
├── vite.config.ts
├── index.html
└── README.md
```

---

## 7. Installation and Setup

Follow the instructions below to run NearBuy locally.

### Prerequisites

Ensure that the following are installed:

- Node.js (LTS version recommended).
- npm.
- Git.
- Visual Studio Code (recommended).

### Step 1: Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/NearBuy.git
```

### Step 2: Navigate to the Project Directory

```bash
cd NearBuy
```

### Step 3: Install Dependencies

```bash
npm install
```

### Step 4: Start the Development Server

```bash
npm run dev
```

### Step 5: Open the Application

Visit the following address in your browser:

```text
http://localhost:5173
```

NearBuy should now be running locally.

### Production Build

To generate an optimized production build:

```bash
npm run build
```

To preview the production build:

```bash
npm run preview
```

---

## 8. Application Routes

### Public Routes

| Route | Description |
|---|---|
| `/` | Landing page |
| `/explore` | Marketplace discovery |
| `/stores` | Nearby stores |
| `/stores/:storeId` | Store details |
| `/products` | Product listing |
| `/products/:productId` | Product details |
| `/compare/:productId` | Product comparison |
| `/cart` | Shopping cart |
| `/checkout` | Checkout |
| `/track/:orderId` | Order tracking |

### Customer Routes

| Route | Description |
|---|---|
| `/customer/dashboard` | Customer overview |
| `/customer/orders` | Order history |
| `/customer/wishlist` | Saved products |
| `/customer/addresses` | Saved addresses |
| `/customer/profile` | Customer profile |
| `/customer/notifications` | Notifications |

### Merchant Routes

| Route | Description |
|---|---|
| `/merchant/dashboard` | Merchant overview |
| `/merchant/store` | Store management |
| `/merchant/products` | Product management |
| `/merchant/inventory` | Inventory management |
| `/merchant/orders` | Order management |
| `/merchant/offers` | Promotions |
| `/merchant/customers` | Customer management |
| `/merchant/analytics` | Sales analytics |
| `/merchant/settings` | Merchant settings |

### Delivery Partner Routes

| Route | Description |
|---|---|
| `/delivery/dashboard` | Delivery overview |
| `/delivery/available` | Available deliveries |
| `/delivery/active` | Active deliveries |
| `/delivery/history` | Delivery history |
| `/delivery/earnings` | Earnings |

### Super Admin Routes

| Route | Description |
|---|---|
| `/admin/dashboard` | Platform overview |
| `/admin/merchants` | Merchant management |
| `/admin/customers` | Customer management |
| `/admin/deliveries` | Delivery management |
| `/admin/orders` | Platform orders |
| `/admin/categories` | Category management |
| `/admin/analytics` | Platform analytics |
| `/admin/settings` | Platform settings |

---

## 9. Demo Functionality and Data Persistence

NearBuy currently operates as a frontend demonstration powered by realistic mock datasets.

### Available Demo Functionality

- Simulated role-based authentication.
- Customer product browsing.
- Nearby store discovery using seeded locations.
- Product price comparison.
- Shopping cart management.
- Simulated checkout.
- Order status updates.
- Merchant product management.
- Inventory updates.
- Delivery tracking simulation.
- Admin dashboard interactions.

### Local Data Persistence

LocalStorage is used to preserve supported frontend state, including:

- Demo authentication.
- Shopping cart.
- Wishlist.
- Saved addresses.
- User preferences.
- Merchant changes.
- Order updates.

**Limitations:** Payments are simulated and do not process real financial transactions. Delivery tracking is simulated and does not provide verified live GPS information.

---

## 10. Future Scope and Enhancements

NearBuy is designed with an architecture that can be extended into a complete production-ready hyperlocal commerce platform.

| Enhancement | Description |
|---|---|
| FastAPI Backend | Production REST API infrastructure |
| PostgreSQL | Persistent relational database |
| Live Delivery Tracking | Real-time delivery partner location |
| Advanced Geolocation | Improved location-based discovery |
| Razorpay Integration | Real online payment processing |
| Push Notifications | Live order notifications |
| AI Recommendations | Personalized product discovery |
| Smart Price Intelligence | Advanced price comparison and insights |
| Merchant Verification | Business identity verification |
| Multi-Store Checkout | Coordinated multi-merchant purchases |
| Cloud Deployment | Production hosting and scaling |

---

## 11. Security Considerations

Before production deployment, the following security mechanisms should be implemented:

- Secure authentication and authorization.
- Role-based access control.
- Merchant verification.
- Secure payment processing.
- API authorization.
- Input validation.
- Customer data protection.
- Secure location handling.
- Rate limiting.
- Audit logging.

Frontend-only authentication and LocalStorage must not be considered production-grade security mechanisms.

---

## 12. Why NearBuy?

Local businesses are an important part of every neighbourhood, but many lack the digital infrastructure required to compete effectively in modern commerce.

NearBuy addresses this gap by providing a unified marketplace where customers can discover local products, compare merchant prices, and order conveniently.

For merchants, it provides an opportunity to expand their digital presence, manage operations, and reach more customers without depending entirely on large centralized marketplaces.

**NearBuy is built around one simple idea:**

Make local shopping more accessible, transparent, and convenient for everyone.

---

## 13. Contribution Guidelines

Contributions, feature suggestions, and improvements are welcome.

To contribute:

1. Fork the repository.
2. Create a new feature branch.
3. Implement your changes.
4. Test your implementation.
5. Submit a pull request.

---

## 14. License

This project is intended for educational, development, and demonstration purposes.

An appropriate open-source license should be added before publishing the repository for public reuse.

---

## 15. Project Information

| Attribute | Details |
|---|---|
| Project Name | NearBuy |
| Project Type | Hyperlocal E-Commerce Marketplace |
| Architecture | Frontend-Only |
| Frontend Framework | React.js |
| Language | TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS |
| State Management | Zustand |
| Maps | Leaflet + OpenStreetMap |
| Status | Development / Demonstration |

---

<p align="center">
  <strong>NearBuy — Premium Hyperlocal Marketplace</strong>
  <br/>
  Discover Local. Compare Prices. Shop Smarter.
  <br/><br/>
  Empowering local businesses through technology.
</p>
