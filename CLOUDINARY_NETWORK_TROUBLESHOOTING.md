# Cloudinary Upload Network Error - Troubleshooting

## Error: "Network request failed"

This error happens during the fetch to Cloudinary API. Here are the most common causes and fixes:

---

## 🔍 Diagnostic Checklist

### 1. **Check Device/Emulator Internet Connection**
```bash
# In Expo console, look for these logs:
# ✅ 🔄 Converting image URI to blob...
# If you see this, blob creation worked
# If upload fails here, internet is the issue
```

**Fix:** Ensure your device/emulator has working internet:
- Android Emulator: Check internet connectivity in settings
- Physical device: Must be on same WiFi as PC
- iOS Simulator: Should have auto internet access

### 2. **Verify Cloudinary Credentials**
Check that the cloud name is correct in `frontend/src/utils/cloudinaryUpload.js`:
```javascript
const CLOUDINARY_NAME = 'dd7wvydqv';  // ← Check this matches your Cloudinary account
```

To verify:
1. Go to [Cloudinary Dashboard](https://cloudinary.com/console)
2. Check your **Cloud Name** at the top
3. If different, update `cloudinaryUpload.js`

### 3. **Check if Upload Preset is Created**
The app needs an unsigned upload preset named `holohaven_upload`.

**To verify it exists:**
1. Go to Cloudinary Dashboard
2. Settings → Upload → Upload presets
3. Look for `holohaven_upload`
4. If missing, create it:
   - **Name:** `holohaven_upload`
   - **Mode:** Unsigned (toggle ON)
   - **Save**

### 4. **Test Cloudinary Connectivity**
Add this test to your ProfileScreen temporarily:

```javascript
import { testCloudinaryConnection } from '../../utils/cloudinaryUpload';

// In your component:
useEffect(() => {
  testCloudinaryConnection().then(result => {
    console.log('Cloudinary test result:', result);
  });
}, []);
```

---

## 📱 React Native Specific Issues

### Problem: FormData not being sent correctly

**Solution:** The updated code now:
- ✅ Removes invalid `timeout` parameter
- ✅ Uses `AbortController` for timeout handling
- ✅ Doesn't set Content-Type (lets fetch auto-set it)
- ✅ Includes `Accept: application/json` header

### Problem: Blob size too large

**Check:**
```javascript
// You'll see in console: ✅ Blob created successfully, size: XXX KB
// If > 5MB, compress the image before upload
```

**Fix:** Ensure image picker quality is set to 0.8:
```javascript
const result = await ImagePicker.launchImageLibraryAsync({
  quality: 0.8,  // ← This compresses it
  allowsEditing: true,
  aspect: [1, 1],
});
```

---

## 🔧 Step-by-Step Debugging

### 1. Check Image is Being Selected
```javascript
// You should see in console:
// 📤 Image URI: file:///...
```
If not appearing, image picker may have failed.

### 2. Check Blob Conversion
```javascript
// You should see:
// 🔄 Converting image URI to blob...
// ✅ Blob created successfully, size: XXX KB type: image/jpeg
```
If you only see the first line, blob conversion is failing.

### 3. Check Cloudinary Request
```javascript
// You should see:
// 📤 FormData prepared, sending to Cloudinary...
// 📤 Upload URL: https://api.cloudinary.com/v1_1/dd7wvydqv/image/upload
```
If this doesn't appear, the FormData creation failed.

### 4. Check Cloudinary Response
```javascript
// Good response:
// 📤 Got response from Cloudinary: 200 OK
// ✅ Cloudinary Upload: Success!
// 📤 Uploaded URL: https://res.cloudinary.com/...

// Bad response:
// ❌ Cloudinary error response: ...
```

---

## 🌐 Network Connectivity Tests

### Test 1: Verify Internet Access
```javascript
// Add to a test screen
const testInternet = async () => {
  try {
    const response = await fetch('https://api.Cloudinary.com/');
    console.log('Internet test - status:', response.status);
  } catch (error) {
    console.error('No internet:', error.message);
  }
};
```

### Test 2: Test with Simple Fetch
```javascript
const testCloudinary = async () => {
  const formData = new FormData();
  formData.append('file', {
    uri: 'https://via.placeholder.com/150',
    type: 'image/jpg',
    name: 'test.jpg',
  });
  formData.append('folder', 'test');
  formData.append('resource_type', 'auto');

  try {
    const response = await fetch(
      'https://api.cloudinary.com/v1_1/dd7wvydqv/image/upload',
      {
        method: 'POST',
        body: formData,
      }
    );
    console.log('Response:', response.status);
    const data = await response.json();
    console.log('Data:', data);
  } catch (error) {
    console.error('Fetch error:', error.message);
  }
};
```

---

## 🚨 Common Error Messages

### "Network request failed" + No blob logs
**Cause:** Image URI is invalid or file doesn't exist  
**Fix:** Ensure image picker returns valid file:// URI

### "Network request failed" + Blob created logs
**Cause:** Cloudinary URL is unreachable or internet is down  
**Fix:** 
- Verify internet connection
- Check Cloudinary cloud name is correct
- Try upload from web browser first

### "Upload failed with status 401"
**Cause:** Upload preset `holohaven_upload` not found  
**Fix:** Create unsigned upload preset in Cloudinary dashboard

### "Upload timeout"
**Cause:** Network too slow or server taking too long  
**Fix:** 
- Check connection speed
- Reduce image size
- Increase timeout (currently 60 seconds)

---

## ✅ What Works (Expected Logs)

Complete successful upload flow:
```
🔄 Converting image URI to blob...
✅ Blob created successfully, size: 250 KB type: image/jpeg
📤 Cloudinary Upload: Starting upload for folder: holohaven/products
📤 FormData prepared, sending to Cloudinary...
📤 Upload URL: https://api.cloudinary.com/v1_1/dd7wvydqv/image/upload
📤 Got response from Cloudinary: 200 OK
✅ Cloudinary Upload: Success!
📤 Uploaded URL: https://res.cloudinary.com/dd7wvydqv/image/upload/...
```

---

## 🔄 Quick Fix Steps

1. **Clear app cache:**
   ```bash
   npx expo start --clear
   ```

2. **Verify internet:**
   - Physical device: Check WiFi connection
   - Emulator: Check emulator settings

3. **Check Cloudinary preset:**
   - Dashboard → Settings → Upload → Upload presets
   - Create `holohaven_upload` if missing

4. **Test upload:**
   - Profile screen → Pick image
   - Watch console logs
   - Look for success or specific error

5. **If still failing:**
   - Check browser console in Expo web version (if available)
   - Try uploading from web (different platform)
   - Verify Cloudinary account is active

---

## 📋 Advanced: Enable Request Logging

Add to `frontend/src/utils/cloudinaryUpload.js` for detailed logging:

```javascript
// Already in the code - watch for these logs:
console.log('📤 Image URI:', imageUri);
console.log('📤 Blob created, size:', blob.size);
console.log('📤 FormData prepared');
console.log('📤 Got response from Cloudinary:', response.status);
```

---

## Need More Help?

1. **Verify Prerequisites:**
   - Backend running: `npm run dev`
   - Frontend running: `npx expo start --clear`
   - Cloudinary account active
   - Upload preset created

2. **Check Logs Carefully:**
   - Where does process stop?
   - What's the exact error?
   - Copy full error message

3. **Test Different Image:**
   - Try sample image first
   - Try smaller file
   - Try JPG format

4. **Restart Everything:**
   ```bash
   # Terminal 1
   cd backend && npm run dev
   
   # Terminal 2
   cd frontend && npx expo start --clear
   ```

