# 🚀 Quick Reference Guide

## Start Here

### Quick Setup (5 minutes)
```bash
# 1. Backend
cd backend
npm install
npm run dev

# 2. Frontend
cd frontend
npm install
npm start

# 3. Select: i (iOS) or a (Android) or w (Web)
```

### Environment Setup
1. Copy `.env.example` to `.env` (backend)
2. Copy `.env.local.example` to `.env.local` (frontend)
3. Fill in your credentials (MongoDB, Cloudinary, Google OAuth)
4. See `ENVIRONMENT_SETUP.md` for detailed instructions

---

## Feature Checklist

- ✅ **SQLite Cart** - Offline cart persistence
- ✅ **Reviews** - Leave, update, delete product reviews
- ✅ **Redux** - State management for orders, products, reviews
- ✅ **JWT Logging** - Track JWT tokens in console
- ✅ **Push Notifications** - Product promotion notifications
- ✅ **Google Login** - OAuth authentication

---

## Common Commands

```bash
# Backend
npm run dev         # Start dev server with hot reload
npm start          # Start production server
npm run seed       # Seed sample data

# Frontend
npm start          # Start Expo
npm run web        # Run in web browser
npm run android    # Run on Android
npm run ios        # Run on iOS
```

---

## Redux State Quick Access

```javascript
// In React Component
import { useSelector } from 'react-redux';

// Cart
const { items, totalPrice } = useSelector(state => state.cart);

// Auth
const { user, token, isAuthenticated } = useSelector(state => state.auth);

// Orders
const { items: orders } = useSelector(state => state.orders);

// Reviews
const { userReviews, productReviews } = useSelector(state => state.reviews);

// Products
const { items: products } = useSelector(state => state.products);

// Notifications
const { pushToken, notifications } = useSelector(state => state.notifications);
```

---

## Redux Dispatch Quick Reference

```javascript
import { useDispatch } from 'react-redux';

const dispatch = useDispatch();

// Cart
dispatch(fetchCart());
dispatch(addToCart({ productId, quantity }));
dispatch(updateCartItem({ productId, quantity }));
dispatch(removeFromCart(productId));
dispatch(clearCart());

// Reviews
dispatch(fetchProductReviews(productId));
dispatch(fetchUserReviews());
dispatch(createReview({ productId, orderId, rating, comment }));
dispatch(updateReview({ reviewId, rating, comment }));
dispatch(deleteReview(reviewId));

// Orders
dispatch(fetchOrders());
dispatch(fetchOrderById(orderId));
dispatch(createOrder(orderData));
dispatch(updateOrderStatus({ orderId, status }));

// Auth
dispatch(login({ email, password }));
dispatch(register({ email, username, password }));
dispatch(googleLogin({ googleId, email, fullName, profilePicture }));
dispatch(logout());
```

---

## SQLite Quick Reference

```javascript
import {
  initializeSQLite,
  saveCartToSQLite,
  loadCartFromSQLite,
  clearCartFromSQLite,
  addItemToSQLiteCart,
  removeItemFromSQLiteCart,
} from '@/utils/sqliteDb';

// Initialize (called in App.js automatically)
await initializeSQLite();

// Save entire cart
await saveCartToSQLite(cartItems);

// Load cart
const cart = await loadCartFromSQLite();

// Add single item
await addItemToSQLiteCart(item);

// Remove single item
await removeItemFromSQLiteCart(productId);

// Clear all
await clearCartFromSQLite();
```

---

## API Endpoints Quick Reference

### Notifications
```
POST /notifications/register-token
  Body: { token: "ExponentPushToken[...]" }

POST /notifications/send-promotion
  Body: { productId, title, message }

POST /notifications/send-shiranui-promo
  Body: {}
```

### Reviews
```
GET /reviews/product/:productId

GET /reviews/user/my-reviews

POST /reviews
  Body: { productId, orderId, rating, comment }

PUT /reviews/:id
  Body: { rating, comment }

DELETE /reviews/:id
```

---

## Testing Shortcuts

```bash
# Test Cart
1. Add item → Close app → Reopen → Verify item exists

# Test Reviews
1. Purchase product → Leave review → Edit → Delete

# Test Notifications
curl -X POST http://localhost:4000/notifications/send-shiranui-promo \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Test Google Login
1. Tap "Login with Google" → Enter credentials → Login

# Test Redux
1. Open Redux DevTools → Action replay → State inspection
```

---

## File Locations

```
Backend:
- Routes: backend/src/routes/
- Models: backend/src/models/
- Middleware: backend/src/middleware/
- Utils: backend/src/utils/

Frontend:
- Redux: frontend/src/redux/slices/
- Screens: frontend/src/screens/
- Navigation: frontend/src/navigation/
- Utils: frontend/src/utils/
- Notifications: frontend/src/notifications/
```

---

## Debug Console Logs

```
// Look for these in console:

// JWT Token Logging (Login/Register/Google)
✅ "JWT Token received on login:"
✅ "JWT Token received on registration:"
✅ "JWT Token received on Google login:"

// Push Notifications
✅ "Push token received: ExponentPushToken[...]"
✅ "Registering push token:"

// SQLite
✅ "SQLite initialized successfully"
✅ "Cart saved to SQLite successfully"
✅ "Cart loaded from SQLite:"

// Redux State Changes
✅ Action dispatched: "cart/addToCart/fulfilled"
✅ Action dispatched: "reviews/createReview/fulfilled"
```

---

## Common Errors & Quick Fixes

| Error | Quick Fix |
|-------|-----------|
| Network Error | Check backend running on port 4000 |
| Can't create review | Must have purchased product first |
| No notifications | Check permissions granted + token registered |
| Google login fails | Verify CLIENT_ID in .env.local |
| SQLite not working | Check expo-sqlite installed |
| MongoDB connection | Verify URI in .env, check whitelist |
| CORS error | Backend CORS already configured |

---

## Performance Tips

- ✅ Cart uses SQLite for fast local access
- ✅ Reviews cached in Redux state
- ✅ Products loaded with pagination
- ✅ Notifications async (non-blocking)
- ✅ Images optimized via Cloudinary

---

## Security Reminders

- 🔒 JWT tokens stored in SecureStore (not AsyncStorage)
- 🔒 Passwords hashed with bcrypt
- 🔒 Never commit .env files
- 🔒 Enable HTTPS in production
- 🔒 Verify purchase before allowing review

---

## Documentation Quick Links

| Document | Purpose |
|----------|---------|
| `IMPLEMENTATION_COMPLETE.md` | Overview of all features |
| `IMPLEMENTATION_FEATURES.md` | Detailed implementation |
| `TESTING_GUIDE.md` | How to test each feature |
| `ENVIRONMENT_SETUP.md` | Setup & configuration |

---

## Useful Commands

```bash
# Generate JWT Secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'));"

# Check API Health
curl http://localhost:4000/health

# View MongoDB Data
# Use MongoDB Compass or Atlas UI

# Clear Expo Cache
expo cache --clear

# Reinstall Dependencies
rm -rf node_modules package-lock.json
npm install
```

---

## Redux DevTools

If you have Redux DevTools installed:

```javascript
# In browser/debugger:
1. Open Redux DevTools
2. See all actions dispatched
3. Time travel through state changes
4. Replay actions
5. Export/import state
```

---

## Deployment Checklist

- [ ] All .env files configured
- [ ] Backend running successfully
- [ ] Frontend app working
- [ ] All notifications tested
- [ ] Reviews working (purchased product)
- [ ] Google login tested
- [ ] Cart persistence verified
- [ ] JWT logging confirmed

---

## Quick Test Scenarios

### Scenario 1: Full User Journey
```
1. Register with email/password
2. Browse products
3. Add to cart
4. Checkout and purchase
5. Leave review on product
6. Update review
7. Receive promotion notification
```

### Scenario 2: Google Login Journey
```
1. Click "Login with Google"
2. Complete OAuth flow
3. New account created
4. Can shop immediately
5. Cannot review yet (no purchases)
```

### Scenario 3: Offline Journey
```
1. Add items to cart (online)
2. Turn on airplane mode
3. Items still visible in cart
4. Go back online
5. Cart syncs with server
```

---

## Support Resources

- **Expo Docs**: https://docs.expo.dev
- **React Native**: https://reactnative.dev
- **Redux**: https://redux.js.org
- **MongoDB**: https://docs.mongodb.com

---

**Last Updated**: February 8, 2026  
**Version**: 1.0.0

*Print this guide for quick reference on your wall! 📌*
