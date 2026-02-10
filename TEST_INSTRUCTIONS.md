# Testing Instructions

## Prerequisites
1. MongoDB must be running (locally or in the cloud)
2. Backend `.env` has `MONGODB_URI=mongodb://localhost:27017/holohaven` (or your Atlas URI)
3. Frontend `.env` has `REACT_APP_API_URL=http://localhost:4000`

## Step 1: Start Backend
```bash
cd backend
npm run dev
# Wait for: ✅ MongoDB connected
#          🚀 API running on port 4000
```

## Step 2: Seed Products Database
```bash
# In another terminal, in backend folder:
node src/seeders/seedProducts.js
# You should see:
# ✅ Product Tokino Sora Plush created
# ✅ Product Roboco Keychain created
# ... (8 products total)
# Total: 8 products
```

## Step 3: Start Frontend
```bash
cd frontend
npx expo start --clear
# Press 'a' for Android or 'i' for iOS
```

## Step 4: Test Login & User Profile Drawer
1. Click "Register" to create a test account
   - Email: `test@example.com`
   - Username: `testuser`
   - Password: `password123`
2. After login, tap **☰ (hamburger)** in top-left
3. You should see:
   - ✅ User profile picture (or default placeholder)
   - ✅ Username displayed
   - ✅ Email displayed
   - ✅ Red "🚪 Logout" button at bottom
4. Tap Logout and confirm

## Step 5: Test Product Display on Home Screen
1. Login again
2. Go to Home screen
3. You should see:
   - ✅ Inline search bar
   - ✅ Category filter buttons
   - ✅ Price range inputs (Min/Max)
   - ✅ "Apply" button
   - ✅ Products grid with images (8 VTuber merchandise items)
   - ✅ All images have fallback to default-profile-picture.jpg if broken

## Step 6: Test Product Filters
1. On Home screen, try:
   - **Search**: Type "Tokino" → should filter to 1 product
   - **Category**: Tap "Plush" → should show plush products
   - **Price**: Enter Min: `10` Max: `25` → Apply → shows products in range
   - **Remove filters**: Click "All" category or clear search → back to all products

## Step 7: Test Admin Products CRUD (if user is admin)
1. Create an admin account:
   - In MongoDB, update user: `db.users.updateOne({email: "test@example.com"}, {$set: {isAdmin: true}})`
2. Login as that user
3. Tap hamburger ☰ → **Product Management**
4. You should see:
   - ✅ "+ Add Product" button
   - ✅ Table with all 8 products
   - ✅ Edit/Delete buttons per row
   - ✅ Product thumbnails load with fallback

### Add New Product:
1. Click "+ Add Product"
2. Fill form:
   - Name: "Test Merch"
   - Price: "29.99"
   - Category: "Apparel"
   - Description: "Test product"
   - VTuber Tag: "Test VTuber"
   - Image: Paste URL or tap "📷 Upload Image or Use Camera"
3. Click "Save Product"
4. ✅ New product appears in table

### Edit Product:
1. Tap "Edit" on any product
2. Modify the name or price
3. Tap "Save Product"
4. ✅ Product updates in table

### Delete Product:
1. Tap "Delete" on any product
2. Confirm deletion
3. ✅ Product removed from table

## Step 8: Test Categories Screen
1. Tap hamburger ☰ → **Categories**
2. Same products display with filters
3. ✅ Images have fallback
4. ✅ Can search and filter same as Home

## Step 9: Test Product Detail
1. On any screen (Home, Categories, etc.), tap a product card
2. You should see:
   - ✅ Full product image (with fallback)
   - ✅ Product name, price, rating
   - ✅ Category and description
   - ✅ Add to Cart button
   - ✅ Quantity selector

## Troubleshooting

### Products Not Showing
1. Check backend logs: `📦 Found X products`
2. Verify MongoDB has products: `db.products.find().count()`
3. Check Frontend console for API errors
4. Ensure `REACT_APP_API_URL` matches backend port (4000)

### User Profile not showing in Drawer
1. Check Redux store has user data after login
2. Verify backend returns `user` object in response
3. Check if token is being saved to SecureStore

### Image Fallback Not Working
1. Verify `assets/default-profile-picture.jpg` exists
2. Check if image URLs are valid (test in browser)
3. Look for image error logs in React Native console

### Double Drawer Issue
- ✅ Already fixed - AdminProductsScreen no longer calls navigation.setOptions

### Drawer Hamburger Not Opening
1. Verify you're on a screen wrapped in Drawer.Navigator
2. Check that headerLeft is properly configured with toggleDrawer()

---

## Files Modified

### Backend
- `backend/src/routes/auth.routes.js` - Login/Register now return user data
- `backend/src/routes/products.routes.js` - Added logging
- `backend/src/seeders/seedProducts.js` - Clear and seed with logging

### Frontend
- `frontend/src/navigation/CustomDrawer.js` - NEW: Custom drawer component
- `frontend/src/navigation/RootNavigator.js` - Integrated CustomDrawer
- `frontend/src/redux/slices/authSlice.js` - Store user data, fix logout
- `frontend/src/screens/home/HomeScreen.js` - Product filters improvements
- `frontend/src/screens/categories/CategoriesScreen.js` - Added image fallback
- `frontend/src/screens/admin/AdminProductsScreen.js` - CRUD table, image upload UI button
