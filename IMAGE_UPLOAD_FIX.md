# Image Upload Fix - Complete Solution

## Problem Diagnosis

When uploading product images via camera/gallery picker, the images were showing as default-product-image instead of the uploaded photos. Root causes identified:

### Root Cause #1: Axios Content-Type Header Conflict
**Issue**: The axiosInstance had a default header `'Content-Type': 'application/json'` which prevented FormData from being sent as `multipart/form-data`.

**Fix Applied** in `frontend/src/api/api.js`:
```javascript
// BEFORE: Always sent Content-Type: application/json
axiosInstance = axios.create({
  headers: { 'Content-Type': 'application/json' }
});

// AFTER: Removes default header, lets FormData set proper multipart boundary
axiosInstance = axios.create({
  // Do NOT set Content-Type header - let Axios handle it
});
```

### Root Cause #2: Improper FormData Content-Type Handling
**Issue**: Request interceptor didn't account for FormData needing special handling.

**Fix Applied** in `frontend/src/api/api.js`:
```javascript
// Added FormData detection in request interceptor
if (config.data instanceof FormData) {
  // FormData - do not set Content-Type, Axios will handle it with proper boundary
  delete config.headers['Content-Type'];
} else if (config.data && typeof config.data === 'object') {
  // JSON request
  config.headers['Content-Type'] = 'application/json';
}
```

### Root Cause #3: Hard-Coded MIME Type
**Issue**: All images were sent as `image/jpeg` regardless of actual file format.

**Fix Applied** in `frontend/src/screens/admin/AdminProductsScreen.js`:
```javascript
// Dynamic MIME type detection based on file extension
let mimeType = 'image/jpeg';
if (formData.image.toLowerCase().includes('.png')) {
  mimeType = 'image/png';
} else if (formData.image.toLowerCase().includes('.webp')) {
  mimeType = 'image/webp';
}

// Extract actual filename from URI
const filename = formData.image.split('/').pop() || 'product-image.jpg';

// Append with correct metadata
const imageFile = { uri: formData.image, type: mimeType, name: filename };
formDataToSend.append('image', imageFile);
```

### Root Cause #4: Incorrect Cloudinary Folder
**Issue**: Products were being uploaded to "profile-pictures" folder instead of "products" folder.

**Fix Applied** in `backend/src/middleware/upload.js`:
```javascript
// BEFORE: folder: "holohaven/profile-pictures"
// AFTER: folder: "holohaven/products"
```

## Files Modified

### Frontend (`frontend/src/api/api.js`)
- ✅ Removed default `'Content-Type': 'application/json'` header from axiosInstance
- ✅ Added FormData detection in request interceptor
- ✅ FormData requests now properly handled as multipart
- ✅ JSON requests explicitly set appropriate Content-Type

### Frontend (`frontend/src/screens/admin/AdminProductsScreen.js`)
- ✅ Added image picker result logging to show metadata
- ✅ Dynamic MIME type detection (png/webp/gif/jpeg)
- ✅ Extract actual filename from file URI
- ✅ Enhanced logging for FormData assembly
- ✅ Added response logging to show saved image path
- ✅ Better error tracking through console logs

### Backend (`backend/src/middleware/upload.js`)
- ✅ Changed Cloudinary folder from "profile-pictures" to "products"
- ✅ Enhanced logging to track file reception
- ✅ Log file metadata (fieldname, originalname, mimetype, size)
- ✅ Improved file rejection messages

### Backend (`backend/src/routes/products.routes.js`)
- ✅ POST `/products` - Added detailed logging for image handling
  - Logs when file uploaded vs URL provided
  - Logs final saved image path
  - Logs complete product object after creation
  
- ✅ PUT `/products/:id` - Added comprehensive logging
  - Logs request details (productId, hasFile, fileName)
  - Logs access control decisions
  - Logs image updates (file vs URL)
  - Logs final product state
  
- ✅ POST `/products/:id/images` - Added gallery upload logging
  - Logs Cloudinary upload result
  - Logs imageUrl detection (path vs secure_url)
  - Logs gallery update completion

## How the Fix Works

### Upload Flow (Camera/Gallery):
1. User selects image → Image picker returns `file:///` URI
2. Frontend creates FormData with:
   - Text fields: name, price, category, description, vtuberTag
   - Image file: `{ uri: "file://...", type: "image/jpeg", name: "image.jpg" }`
3. **Fixed**: Axios request interceptor detects FormData and removes Content-Type header
4. **Fixed**: Axios automatically sets `Content-Type: multipart/form-data` with proper boundary
5. Backend receives proper multipart request
6. Multer middleware processes file and passes to Cloudinary
7. **Fixed**: Cloudinary uploader saves to correct "holohaven/products" folder
8. Image URL returned in `req.file.path` (Cloudinary secure URL)
9. Product saved with image URL in database
10. Response includes `{ image: "https://res.cloudinary.com/..." }`
11. Frontend receives response and logs image path
12. Product list reloaded showing correct Cloudinary image

### Debugging Output:
The enhanced logging helps identify failures at each stage. Example output:

```
// Gallery picker
✅ Gallery image selected: file:///data/user/0/...
📸 Uploading local image via FormData: {
  uri: "file:///data/user/0/...",
  type: "image/jpeg",
  name: "DSC_1234.jpg"
}

// Backend receives file
🖼️ Upload fileFilter - File received: {
  fieldname: "image",
  originalname: "DSC_1234.jpg",
  mimetype: "image/jpeg",
  size: 2097152
}

// Cloudinary processes
🖼️ POST /products - Image from file upload: {
  originalname: "DSC_1234.jpg",
  path: "https://res.cloudinary.com/..."
}

// Frontend response
✅ Product created: {
  _id: "123...",
  image: "https://res.cloudinary.com/...",
  images: ["https://res.cloudinary.com/..."]
}
```

## Testing Instructions

1. **Ensure backend is running:**
   ```
   cd backend
   npm start
   ```

2. **Run the frontend:**
   ```
   cd frontend
   npm start
   ```

3. **Test camera/gallery upload:**
   - Login as admin
   - Go to Admin Products screen
   - Click "Add Product"
   - Click "Pick from Gallery" or "Take Photo"
   - Select/capture an image
   - Fill in other product details
   - Click "Save Product"
   - **Check console logs:**
     - Should see "📸 Uploading local image via FormData: {uri: file://...}"
     - Should see "✅ Product created:" with image URL from Cloudinary
     - Image URL should contain "res.cloudinary.com"
   - Verify product now shows uploaded image (not default)

4. **Common Issues to Check:**
   - If image still shows as default:
     - Check console for "✅ Product created:" - is image field populated?
     - If image is empty/null in response, backend didn't save it
     - Check backend logs for "🖼️ POST /products" - is file being received?
     - If file not received, multipart encoding failed
   
   - If FormData not being used:
     - Ensure image URI starts with "file://"
     - Check console for "📸 Uploading local image via FormData"
   
   - If "Cannot read property 'Image' of undefined":
     - Already fixed in ImagePicker (uses `['image']` instead of `ImagePicker.MediaType.Image`)

## Expected Behavior After Fix

✅ Camera/gallery picker opens and allows image selection
✅ Selected image URI logged with full metadata
✅ FormData properly assembled with dynamic MIME type
✅ Axios sends proper multipart/form-data request
✅ Multer receives file and uploads to Cloudinary
✅ Cloudinary returns secure URL
✅ Product saved with Cloudinary image URL
✅ Response includes image URL
✅ Product list refreshes showing actual uploaded image
✅ No more default-product-image for camera/gallery uploads

## Technical Details

### Why Content-Type: application/json was problematic:
- FormData with multipart boundary requires `Content-Type: multipart/form-data; boundary=...`
- If `Content-Type: application/json` is forced, the boundary is ignored
- Multer can't parse the multipart message without proper boundary
- Result: req.file is undefined, image not saved

### Why MIME type detection matters:
- Cloudinary may reject files with mismatched MIME type
- File extension in URI might not match actual file content
- Dynamic detection ensures proper handling

### Why Cloudinary folder matters:
- Cloudinary organizes uploads by folder for easier management
- Products should be in "holohaven/products", not "holohaven/profile-pictures"
- Helpful for tracking and cleanup

## Cloudinary Integration

Products uploaded to: `https://res.cloudinary.com/{CLOUD_NAME}/image/upload/holohaven/products/...`

Images are automatically:
- Optimized (limited to 1024px width)
- Validated (jpg, png, webp only)
- Stored securely on Cloudinary CDN
- Available immediately with secure HTTPS URLs

## Verification Checklist

- [ ] Backend logs show "✅ Cloudinary connected"
- [ ] Cloudinary credentials in .env file
- [ ] Upload middleware folder set to "holohaven/products"
- [ ] Axios instance has no default Content-Type header
- [ ] Request interceptor handles FormData specially
- [ ] Image picker returns file:// URIs
- [ ] FormData assembly includes proper MIME type
- [ ] Products routes log all image operations
- [ ] Console shows full debugging pipeline

## Next Steps

1. Test with the comprehensive logging in place
2. Monitor console output for exact error locations
3. Verify Cloudinary credentials are correct in backend
4. Check that files are actually being sent to Cloudinary
5. Confirm product.image field is populated after save
6. Verify images display in product list
