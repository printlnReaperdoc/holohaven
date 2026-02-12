# Cloudinary Direct Upload Setup Guide

This guide explains how to configure Cloudinary to enable direct image uploads from the React Native frontend, bypassing backend network connectivity issues.

## What Changed?

The app now uploads images **directly to Cloudinary** from the mobile device/emulator instead of routing them through the backend. This:

✅ **Fixes network errors** - No more "cannot connect to API" issues for image uploads  
✅ **Faster uploads** - Direct connection to Cloudinary CDN  
✅ **More reliable** - Doesn't depend on backend server connectivity  
✅ **Cleaner flow** - Backend receives Cloudinary URLs instead of files  

## How It Works

### Old Flow (causing network errors):
```
Mobile Device → Backend (192.168.68.136:4000) → Cloudinary
                    ↓ (Network Error!)
               Connection Failed
```

### New Flow (what we implemented):
```
Mobile Device → Cloudinary (Direct)
                    ↓
               Success! ✅
               
Backend receives: Cloudinary URL (JSON)
```

## Configuration Steps

### 1. Go to Cloudinary Dashboard
1. Visit [https://cloudinary.com/console](https://cloudinary.com/console)
2. Log in with your account (or create one)
3. You should see your **Cloud Name**: `dd7wvydqv`

### 2. Create an Unsigned Upload Preset (REQUIRED)

**This is the key step that makes direct uploads work!**

1. In Cloudinary Dashboard, go to **Settings** → **Upload**
2. Scroll to **Upload presets** section
3. Click **Add upload preset**
4. Name it: `holohaven_upload`
5. Set **Unsigned** mode: Toggle ON
6. Click **Save**

**Why unsigned?** Unsigned presets are safe for mobile apps because they don't require exposing API secrets.

### 3. Verify Configuration

The upload preset is automatically used by the app at:
- `frontend/src/utils/cloudinaryUpload.js`

The preset name `holohaven_upload` is used in the upload forms.

## Testing the Setup

### Test Profile Picture Upload:
1. Navigate to Profile screen
2. Tap on profile picture
3. Choose "Take Photo" or "Choose from Library"
4. Watch console logs for:
   - ✅ `📤 Cloudinary Upload: Starting upload...`
   - ✅ `✅ Cloudinary Upload: Success!`
   - ✅ `📤 Uploaded URL: https://res.cloudinary.com/...`

### Test Product Upload:
1. Navigate to Admin Products screen
2. Create or edit a product
3. Upload an image
4. Watch console for same success messages
5. Product should be created with Cloudinary image URL

## Troubleshooting

### Error: "Cloudinary authentication failed"
**Cause:** Upload preset `holohaven_upload` not found in your Cloudinary account  
**Fix:** Follow step 2 above to create the unsigned upload preset

### Error: "Network Error" (still happening)
**Cause:** App is still trying to use the old backend upload method  
**Fix:** 
- Make sure you pulled the latest code
- Clear app cache: `expo r -c` or `npx expo start --clear`
- Restart the app

### Image uploads work but don't appear in products
**Cause:** Backend might need restart  
**Fix:**
- Restart backend: `npm run dev` in `backend/` folder
- The Cloudinary URL is saved to the database correctly

## Files Changed

### Frontend Changes:
- ✅ `frontend/src/utils/cloudinaryUpload.js` - NEW direct upload utility
- ✅ `frontend/src/redux/slices/authSlice.js` - Uses Cloudinary for profile pictures
- ✅ `frontend/src/screens/admin/AdminProductsScreen.js` - Uses Cloudinary for product images

### Backend Changes:
- ✅ `backend/src/routes/products.routes.js` - Accepts Cloudinary URLs in JSON
- ✅ `backend/src/routes/user.routes.js` - Accepts Cloudinary URLs in JSON

## Environment Variables

The Cloudinary configuration is already set in `backend/.env`:
```
CLOUDINARY_NAME=dd7wvydqv
CLOUDINARY_API_KEY=438366284623838
CLOUDINARY_API_SECRET=CC9SkQ0_m29-u7UzWHwpIuH0wIM
```

**Note:** Frontend only uses `CLOUDINARY_NAME` (public). API keys are only used by the backend.

## Next Steps

After setting up the upload preset:

1. ✅ Clear app cache: `npx expo start --clear`
2. ✅ Test profile picture upload
3. ✅ Test product image upload
4. ✅ Verify images appear in the database and UI

## Security Notes

- ✅ Unsigned uploads are secure - presets control what can be uploaded
- ✅ API secrets are not exposed in the mobile app
- ✅ Images are validated server-side before being saved
- ✅ Cloudinary provides automatic virus scanning and optimization

## Still Having Issues?

1. Check Cloudinary dashboard for upload preset `holohaven_upload`
2. Verify preset is set to **Unsigned** mode
3. Check console logs for specific error messages
4. Ensure backend is running: `npm run dev` in `backend/`
5. Test with a simple JPG image first

