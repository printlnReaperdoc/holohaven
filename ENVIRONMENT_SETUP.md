# Environment Setup & Configuration Guide

## Backend Setup (.env)

Create `.env` file in the `backend/` directory:

```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/holohaven

# Server
PORT=4000
NODE_ENV=development

# Cloudinary (Image Storage)
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# JWT
JWT_SECRET=your_jwt_secret_key_here_minimum_32_characters

# Expo Push Notifications (optional, already configured in package.json)
```

### Get Credentials

#### MongoDB
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Get connection string
4. Replace `username:password@cluster` with your credentials

#### Cloudinary
1. Sign up at https://cloudinary.com
2. Go to API Keys
3. Copy Name, API Key, and API Secret

#### JWT Secret
Generate a secure random string:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'));"
```

---

## Frontend Setup (.env.local)

Create `.env.local` file in the `frontend/` directory:

```env
# API Configuration
REACT_APP_API_URL=http://192.168.1.100:4000
# or for Android emulator:
# REACT_APP_API_URL=http://10.0.2.2:4000
# or for iOS simulator:
# REACT_APP_API_URL=http://localhost:4000

# Google OAuth Configuration
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_REDIRECT_URL=exp://192.168.1.100:19000/+expo-auth-session

# Expo Project ID (for push notifications)
EXPO_PUBLIC_PROJECT_ID=your_expo_project_id
```

### Get Credentials

#### API URL
- **For Physical Device**: Use your machine's IP address (e.g., `192.168.1.100`)
- **For Android Emulator**: Use `10.0.2.2:4000`
- **For iOS Simulator**: Use `localhost:4000`

To find your IP:
```bash
# Windows (PowerShell)
ipconfig

# macOS/Linux
ifconfig
```

#### Google OAuth
1. Go to https://console.cloud.google.com
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 Credentials (type: Web application)
5. Add redirect URI: `exp://192.168.1.100:19000/+expo-auth-session`
6. Get Client ID

#### Expo Project ID
1. Go to https://expo.dev
2. Sign in or create account
3. Create new project
4. Copy Project ID from project settings

---

## Installation & Dependencies

### Backend Dependencies
```bash
cd backend
npm install
```

Already includes:
- express (web framework)
- mongoose (MongoDB ODM)
- bcrypt (password hashing)
- jsonwebtoken (JWT)
- cors (cross-origin)
- cloudinary (image storage)
- expo-server-sdk (push notifications)
- multer (file upload)

### Frontend Dependencies
```bash
cd frontend
npm install
```

Newly added:
- `expo-sqlite` - Local database
- `expo-auth-session` - Google OAuth
- `@react-native-firebase/app` - Firebase base
- `@react-native-firebase/auth` - Firebase Auth

### Install Node Modules
```bash
# Backend
cd backend && npm install

# Frontend  
cd frontend && npm install
```

---

## Running the Application

### Start Backend Server
```bash
cd backend
npm run dev
# or
npm start
```

Expected output:
```
✅ MongoDB connected
✅ Cloudinary connected
🚀 API running on port 4000
```

### Start Frontend Development
```bash
cd frontend
npm start
```

Then choose:
- `i` for iOS simulator
- `a` for Android emulator
- `w` for web browser
- `j` to open debugger

---

## Database Setup

### Seed Initial Data (Optional)
```bash
cd backend
npm run seed
# Creates sample products and users
```

### MongoDB Collections
The following collections are automatically created:

1. **users** - User accounts and profiles
2. **products** - Product listings
3. **orders** - User orders and purchases
4. **reviews** - Product reviews and ratings
5. **cart** - Current cart items (per user)
6. **promotions** - Promotion/discount information

---

## Troubleshooting

### Issue: Can't connect to MongoDB
```
Error: connect ECONNREFUSED
Solution:
1. Verify MongoDB is running
2. Check connection string in .env
3. Verify IP whitelisting on MongoDB Atlas
4. Check username and password
```

### Issue: API URL not working
```
Error: Network Error
Solution:
1. Verify backend is running on :4000
2. Check REACT_APP_API_URL is correct IP
3. Test with: curl http://192.168.1.100:4000/health
4. Check firewall isn't blocking port 4000
```

### Issue: Google login not working
```
Error: Auth session failed
Solution:
1. Verify GOOGLE_CLIENT_ID is correct
2. Check redirect URL matches Google Console settings
3. Verify sign_in_with_globs package is installed
4. Clear Expo cache: expo cache --clear
```

### Issue: Push notifications not received
```
Error: No notifications
Solution:
1. Check notification permissions granted
2. Verify push token registered (check console logs)
3. Verify backend can reach Expo servers
4. Check notification is being sent: curl ...
5. Try on physical device (simulator may not receive)
```

### Issue: SQLite not working
```
Error: SQLite database error
Solution:
1. Verify expo-sqlite installed
2. Check app has storage permissions
3. Clear app cache
4. Reinstall: npm install expo-sqlite@latest
```

---

## Port Configuration

### Default Ports
- **Backend API**: 4000
- **Frontend (Expo)**: 19000 (Expo server), 19001 (Bundler)
- **MongoDB**: 27017 (local) or cloud

### Change Backend Port
Edit `.env`:
```env
PORT=5000
```

Update Frontend `.env.local`:
```env
REACT_APP_API_URL=http://192.168.1.100:5000
```

---

## Production Deployment

### Backend (Heroku/Render/AWS)
1. Set environment variables on hosting platform
2. Deploy (git push heroku main or similar)
3. Verify MongoDB URI is production database
4. Update API URL in frontend

### Frontend (Expo/EAS)
1. Build for production: `eas build --platform android|ios`
2. Upload to Play Store and/or App Store
3. Update REACT_APP_API_URL to production API
4. Update Google OAuth redirect URL for production

---

## Security Checklist

- [ ] JWT_SECRET is strong and random
- [ ] API keys (Cloudinary, Google) are in .env, not committed
- [ ] HTTPS is used in production
- [ ] CORS is properly configured
- [ ] Rate limiting is enabled (add to backend if needed)
- [ ] Input validation on all endpoints
- [ ] Password hashing verified (bcrypt)
- [ ] No sensitive data in logs
- [ ] Database backups configured

---

## Performance Optimization

### Frontend
- Enable bundle analyzer: `expo build:web -t web`
- Enable code splitting for large screens
- Implement lazy loading for product lists
- Use React.memo for expensive components

### Backend
- Add database indexes for frequently queried fields
- Implement request caching
- Use pagination for large results
- Optimize image uploads with compression

---

## Monitoring & Logging

### Backend Logging
Add to `backend/src/server.js`:
```javascript
// Log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});
```

### Frontend Debugging
- Use Expo DevTools (shake device)
- Redux DevTools for state inspection
- Network tab for API calls
- Console for logs and errors

---

## Next Steps

1. **Setup Environment Variables** (.env and .env.local)
2. **Install Dependencies** (npm install in both folders)
3. **Start Backend** (npm run dev)
4. **Start Frontend** (npm start)
5. **Test Features** (refer to TESTING_GUIDE.md)
6. **Deploy** when ready

---

## Support & Resources

- **Expo Docs**: https://docs.expo.dev
- **React Navigation**: https://reactnavigation.org
- **Redux**: https://redux.js.org
- **MongoDB**: https://docs.mongodb.com
- **Cloudinary**: https://cloudinary.com/documentation

---

**Last Updated**: February 8, 2026
**Version**: 1.0.0
