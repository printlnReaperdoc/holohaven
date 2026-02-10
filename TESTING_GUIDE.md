# Feature Testing Guide

## Quick Start Testing

### Prerequisites
1. Backend running: `npm run dev` (from backend folder)
2. Frontend running: `npm start` (from frontend folder)
3. Have test accounts ready

---

## 1. SQLite Cart Persistence Testing

### Test Case 1: Cart Persists After App Restart
```
Steps:
1. Open app
2. Go to home/products screen
3. Add 3-4 items to cart
4. Note down the items
5. Force close the app completely
6. Reopen the app
7. Go to Cart screen

Expected: All items are still in cart
Verify: Items match what was added before close
```

### Test Case 2: Cart Syncs with Server
```
Steps:
1. Make sure device has internet
2. Add items to cart
3. Go to checkout
4. Complete order successfully
5. Reopen app
6. Go to cart

Expected: Cart is empty (cleared after checkout)
Verify: New order appears in Orders screen
```

### Test Case 3: Offline Mode
```
Steps:
1. Turn on airplane mode
2. Add items to cart
3. Items appear locally
4. Turn off airplane mode
5. Sync with server

Expected: Changes sync with server when online
```

---

## 2. Product Reviews & Ratings Testing

### Test Case 1: Create Review (Verified Buyer Only)
```
Steps:
1. Complete a purchase
2. Go to Orders
3. View order details
4. Find product → View Details
5. Scroll to Reviews section
6. Click "Leave Review"
7. Enter 5-star rating and comment

Expected: Review posted successfully
Verify: See your review in the list
Note: Only verified buyers (who purchased) can review
```

### Test Case 2: Update Review
```
Steps:
1. Find your existing review
2. Click "Edit"
3. Change rating to 3 stars
4. Update comment
5. Save

Expected: Review updated
Verify: New rating and comment visible
```

### Test Case 3: Delete Review
```
Steps:
1. Find your review
2. Click "Delete"
3. Confirm deletion

Expected: Review removed
Verify: Product review count decreases
```

---

## 3. Redux State Management Testing

### Test Case 1: Monitor Redux State
```
Using Redux DevTools (if installed):
1. Open Redux DevTools
2. Perform actions in app
3. Watch state changes
4. Check loading states during API calls

Expected: All state updates visible
Verify: products, orders, reviews, cart, auth, notifications slices work
```

### Test Case 2: Error Handling
```
Steps:
1. Turn off internet
2. Try to get products
3. Watch Redux error state
4. Display error to user

Expected: Error handled gracefully
```

---

## 4. JWT Token Logging Testing

### Test Case 1: Check Login Token
```
Steps:
1. Open browser console (or React Native debugger)
2. Go to login screen
3. Enter credentials
4. Click "Login"
5. Watch console

Expected Output: 
  "JWT Token received on login: eyJhbGciOiJIUzI1NiIs..."

This confirms token logging is working
```

### Test Case 2: Check Registration Token
```
Steps:
1. Go to registration screen
2. Enter new credentials
3. Click "Register"
4. Watch console

Expected: See JWT token in console logs
```

---

## 5. Push Notifications Testing

### Test Case 1: Register Push Token
```
The app automatically:
1. Requests notification permissions
2. Gets push token from Expo
3. Registers token with backend

Verify in console:
  "Push token received: ExponentPushToken[...]"
  "Registering push token: ExponentPushToken[...]"
```

### Test Case 2: Send Test Notification
```
Backend API Call:
curl -X POST http://localhost:4000/notifications/send-shiranui-promo \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"

Expected: Notification appears on device
Content: "Limited Time: Shiranui Flare Hoodie - $35.00"
```

### Test Case 3: Notification Interaction
```
Steps:
1. Receive promotion notification
2. Tap the notification
3. Should navigate/show product details
4. Can view:
   - Product name: Shiranui Flare Hoodie
   - Price: $35.00
   - Image and other details
```

### Test Case 4: Send Custom Promotion
```
Create test product first:
1. Admin creates product or use existing

Backend API Call:
curl -X POST http://localhost:4000/notifications/send-promotion \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "PRODUCT_ID_HERE",
    "title": "Special Offer!",
    "message": "50% off limited time"
  }'

Expected: Custom notification sent to all users
```

---

## 6. Google Login Testing

### Test Case 1: Google OAuth Flow
```
Steps:
1. Go to Login screen
2. Click "Login with Google" button
3. Google OAuth screen opens
4. Enter Google credentials
5. Grant app permissions
6. Redirected back to app

Expected: Logged in successfully
Verify: See JWT token in console logs
```

### Test Case 2: Create Account via Google
```
Steps:
1. Use new Google account (not previously used)
2. Click "Login with Google"
3. Complete OAuth flow

Expected: New account created
Verify: Can access home screen
```

### Test Case 3: Link Existing Account
```
Steps:
1. Email already registered
2. Use Google with same email
3. Complete OAuth flow

Expected: Existing account linked to Google
Verify: Can log in with either email/password or Google
```

---

## 7. Cart + Checkout Integration

### Test Case 1: Full Checkout Flow
```
Steps:
1. Add items to cart
2. Go to Cart screen
3. Click "Checkout"
4. Enter shipping info
5. Complete payment
6. Order confirmation

Expected Results:
  ✓ Order created
  ✓ Cart cleared from SQLite
  ✓ Order appears in Orders screen
  ✓ Can now leave reviews on products
```

---

## Testing Checklist

### SQLite
- [ ] Items persist after restart
- [ ] Cart emptied after checkout
- [ ] Offline mode works

### Reviews
- [ ] Can leave review only after purchase
- [ ] Can update own review
- [ ] Can delete own review
- [ ] Rating updates product average

### Redux
- [ ] All async operations show loading
- [ ] Errors displayed on failure
- [ ] Success callbacks work

### JWT Logging
- [ ] Token logged on login
- [ ] Token logged on register
- [ ] Token logged on Google login

### Notifications
- [ ] Token registered on app start
- [ ] Notifications received on foreground
- [ ] Tap notification shows product
- [ ] Custom promotions sent successfully

### Google Login
- [ ] OAuth flow works
- [ ] New accounts created
- [ ] Existing accounts linked
- [ ] Token logged in console

---

## Debugging Tips

### View SQLite Data
```javascript
// In debugger console
import { loadCartFromSQLite } from './src/utils/sqliteDb';
loadCartFromSQLite().then(items => console.log('Cart items:', items));
```

### Check Redux State
```javascript
// In debugger
// Redux DevTools or manual inspection
store.getState()
```

### Monitor Network Requests
```javascript
// Network tab in debugger
// Check all API calls to /cart, /reviews, /orders, /notifications
```

### Check Push Tokens
```javascript
// In console after app load
// Look for: "Push token received: ExponentPushToken[...]"
```

---

## Common Issues & Solutions

### Issue: Cart not persisting
- **Solution**: Check SQLite initialization in App.js
- Verify expo-sqlite is installed
- Check device storage permissions

### Issue: Can't create review
- **Solution**: Ensure you purchased the product
- Check order status is not "cancelled"
- Verify you haven't already reviewed it

### Issue: Notifications not received
- **Solution**: Check notification permissions are granted
- Verify push token is registered
- Check backend has valid push tokens

### Issue: Google login fails
- **Solution**: Check Google OAuth credentials in .env.local
- Verify redirect URL matches setup
- Check mobile device has Google Play Services

---

## Performance Testing

### Recommended Load Tests
1. Add 50+ items to cart → check SQLite performance
2. Load 100+ reviews for product → check Redux state
3. Send notifications to 1000+ users → check backend performance

---

**Last Updated**: February 8, 2026
