# Quick Start Guide

## ⚡ 5-Minute Setup

### Step 1: Clone & Install

```bash
# Navigate to backend
cd backend
npm install
```

```bash
# In another terminal, navigate to frontend
cd frontend
npm install
```

### Step 2: Configure Environment

**Backend (.env):**
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```
PORT=4000
MONGODB_URI=mongodb://localhost:27017/holohaven
JWT_SECRET=your_secret_key_123
CLOUDINARY_NAME=your_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
```

**Frontend (.env):**
```bash
cd ../frontend
cp .env.example .env
```

Edit `frontend/.env`:
```
REACT_APP_API_URL=http://192.168.1.YOUR_IP:4000
```

### Step 3: Start MongoDB

```bash
# Windows
mongod

# Mac (if using Homebrew)
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

### Step 4: Start Backend

```bash
cd backend
npm run dev
```

You should see: `🚀 API running on port 4000`

### Step 5: Start Frontend

In a new terminal:
```bash
cd frontend
npm start
```

Then press `a` for Android, `i` for iOS, or `w` for web.

## 🗄️ Database Seeding

To add sample data:

```bash
cd backend
node src/seeders/seedProducts.js
node src/seeders/seedUsers.js
```

## 🧪 Test Credentials

After seeding:
- **Email:** user@example.com
- **Password:** password123

## 📝 First Time Setup Checklist

- [ ] MongoDB running locally or cloud instance
- [ ] `.env` files configured for both backend and frontend
- [ ] Backend running on http://localhost:4000
- [ ] Frontend IP configured correctly
- [ ] Cloudinary account created and credentials added
- [ ] (Optional) Firebase account for Google login
- [ ] Tested API with Postman or similar

## 🔗 Service URLs

- **Backend API:** http://localhost:4000
- **Frontend (Expo):** http://YOUR_IP:8081
- **MongoDB:** mongodb://localhost:27017

## 🆘 Common Issues

### Port 4000 already in use
```bash
# Find and kill process
lsof -i :4000
kill -9 <PID>
```

### MongoDB connection error
- Ensure MongoDB is running
- Check MONGODB_URI in `.env`
- Verify MongoDB daemon started successfully

### Frontend can't connect to backend
- Ping backend from frontend device
- Check firewall settings
- Ensure same network connection
- Use correct IP in REACT_APP_API_URL

## 📱 Testing

Test the following flows:

1. **Authentication**
   - Register new account
   - Login/logout
   - View profile

2. **Shopping**
   - Browse products
   - Search & filter
   - Add to cart
   - Checkout

3. **Orders**
   - View past orders
   - Track order status
   - See order details

4. **Reviews**
   - Add review to purchased item
   - View product reviews
   - Edit/delete own reviews

5. **Notifications**
   - Receive order updates
   - See promotions

## 📚 Next Steps

- [ ] Deploy backend to cloud (Heroku, Railway, etc.)
- [ ] Set up production database
- [ ] Configure Google OAuth properly
- [ ] Build Android/iOS APK with EAS
- [ ] Set up error tracking (Sentry)
- [ ] Configure analytics

---

For detailed docs, see [README.md](./README.md)
