# 🌸 HoloHaven  
### VTuber Merchandise Mobile App  

![HoloHaven Logo](https://imgur.com/rK3stlI.png)

**HoloHaven** is a full-stack **React Native (Expo) e-commerce mobile application** dedicated to VTuber merchandise.  
It combines a modern mobile shopping experience with a scalable backend, real-time notifications, and admin tooling—built specifically with fandom culture, digital goods, and creator-centric commerce in mind.

This project is designed for **educational, portfolio, and capstone use**, demonstrating real-world mobile commerce architecture.

---

## 🧭 Project Overview

HoloHaven allows users to:
- Discover VTuber merchandise
- Purchase products securely
- Track orders in real time
- Receive push notifications
- Engage with products via reviews and ratings  

Admins can:
- Manage products, orders, and promotions
- Upload media assets
- Trigger notifications automatically
- Oversee platform operations from a centralized API

---

## 🏗️ System Architecture

HoloHaven follows a **client–server architecture**:

- **Frontend:** React Native (Expo)
- **Backend:** Node.js + Express.js
- **Database:** MongoDB (Mongoose ODM)
- **Authentication:** JWT + Secure Storage
- **Media Storage:** Cloudinary
- **Notifications:** Expo Notifications + Firebase Cloud Messaging (FCM)

---

## 📁 Project Structure

```

holohaven_reactnative/
├── backend/                     # Express REST API
│   ├── src/
│   │   ├── config/              # Environment & service configs
│   │   ├── middleware/          # Auth, role checks, uploads
│   │   ├── models/              # MongoDB schemas
│   │   ├── routes/              # REST endpoints
│   │   ├── utils/               # Helpers (JWT, Cloudinary)
│   │   └── server.js            # API entry point
│   ├── .env
│   └── package.json
│
└── frontend/                    # Expo React Native App
├── src/
│   ├── api/                 # Axios instance & services
│   ├── auth/                # Auth helpers & guards
│   ├── navigation/          # Stack & Drawer navigators
│   ├── notifications/       # Push notification logic
│   ├── redux/               # Redux Toolkit store
│   │   ├── slices/
│   │   └── store.js
│   └── screens/             # UI Screens
│       ├── auth/
│       ├── home/
│       ├── products/
│       ├── cart/
│       ├── checkout/
│       ├── orders/
│       ├── profile/
│       └── promotions/
├── App.js
├── app.json
└── package.json

````

---

## ✨ Feature Breakdown

### 👤 User Features

- Email & password authentication
- Google Sign-In (OAuth)
- Secure session handling with JWT
- Editable user profile (avatar, bio, contact info)
- Browse products by category
- Search with price & category filters
- Detailed product pages with image galleries
- Shopping cart with quantity control
- Secure checkout flow
- Order tracking with live status updates
- Verified purchase reviews & ratings
- Promotional banners & discounts
- Push notifications for:
  - Order updates
  - Promotions
  - Status changes

---

### 🛠️ Admin Features

- Product creation, update, and deletion
- Image uploads via Cloudinary
- Category & promotion management
- Full order management dashboard
- Order status updates (auto-notify users)
- Role-based admin authorization
- Seller/admin account control

---

## 🧠 Technical Highlights

- **Redux Toolkit** for predictable state management
- **Axios API layer** with interceptors
- **JWT authentication** with refresh validation
- **Expo SecureStore** for sensitive data
- **Cloudinary** for optimized image delivery
- **Expo Notifications + FCM**
- **Drawer + Stack navigation**
- **AsyncStorage** for persistence
- **RESTful API design**
- **Scalable MongoDB schemas**

---

## 🔐 Security Design

- Password hashing with bcrypt
- JWT expiration & verification
- Role-based route protection
- Secure token storage (mobile-safe)
- Image validation on upload
- CORS configuration
- Production-ready rate-limit support

---

## 🧩 Redux State Architecture

```js
state = {
  auth: {
    user,
    token,
    isAuthenticated,
    loading,
    error
  },
  products: {
    items,
    categories,
    featured,
    currentProduct,
    filters,
    loading
  },
  cart: {
    items,
    totalPrice,
    loading
  },
  orders: {
    items,
    currentOrder,
    loading
  },
  reviews: {
    productReviews,
    userReviews,
    loading
  },
  promotions: {
    items,
    currentPromotion,
    loading
  }
}
````

---

## 📱 Notifications System

* Push tokens are registered on app launch
* Tokens are stored per user profile
* Order status updates trigger automatic pushes
* Promotions can broadcast to all users
* Firebase Cloud Messaging handles delivery

---

## 🚀 Setup & Installation

### Requirements

* Node.js 14+
* MongoDB (local or cloud)
* Expo CLI
* Cloudinary account
* Firebase project (for Google Auth & FCM)

### Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm start
```

---

## 🌈 UI & UX Design

* VTuber-inspired color palette

  * Primary: `#8B5CF6`
* Card-based layouts
* Promotional hero carousel
* Smooth navigation transitions
* Status timeline for orders
* Floating action buttons
* Mobile-first responsive design

---

## 📦 Production Deployment

* Environment-based configuration
* HTTPS enforced
* EAS Build for Android/iOS
* Secure API endpoints
* Optimized image delivery
* Scalable MongoDB hosting

---

## 📚 Educational Value

This project demonstrates:

* Full-stack mobile development
* Secure authentication flows
* Scalable REST APIs
* State management at scale
* Push notification infrastructure
* Real-world e-commerce logic

---

## 📄 License

Provided **as-is** for **educational and portfolio purposes**.

---

Built with ❤️ for VTuber fans worldwide 🎌
