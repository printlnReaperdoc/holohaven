# 🔧 Cloudinary Upload - Diagnostics Guide

## Quick Fix for "Network request failed" Error

If you're getting "Network request failed" when uploading images, use this diagnostic tool to identify the issue.

---

## Step 1: Add Diagnostics to Your Screen

Add this code to your ProfileScreen or AdminProductsScreen temporarily:

```javascript
import { runFullDiagnostics } from '../../utils/cloudinaryDiagnostics';

// Add this button to your screen
<TouchableOpacity 
  onPress={async () => {
    Alert.alert('Running diagnostics...', 'Check console for results');
    const testImageUri = 'file:///path/to/image'; // Replace with actual image path
    await runFullDiagnostics(testImageUri);
  }}
>
  <Text>🔧 Run Diagnostics</Text>
</TouchableOpacity>
```

Or simpler, add to your `useEffect`:

```javascript
import { runFullDiagnostics } from '../../utils/cloudinaryDiagnostics';

useEffect(() => {
  // Run diagnostics on first load (comment out after debugging)
  console.log('\n\n=== STARTING CLOUDINARY DIAGNOSTICS ===\n');
  runFullDiagnostics();
}, []);
```

---

## Step 2: Check Console Output

Open your Expo console and look for the diagnostic results:

```
═══════════════════════════════════════════════════════
  🔧 CLOUDINARY UPLOAD DIAGNOSTICS
═══════════════════════════════════════════════════════

🔍 Testing Internet Connectivity...
✅ Internet is available - HTTP status: 200

🔍 Testing Cloudinary API Connectivity...
📍 Target URL: https://api.cloudinary.com/v1_1/dd7wvydqv/image/upload
✅ Cloudinary API is reachable - HTTP status: 200

... more tests ...

═══════════════════════════════════════════════════════
  📊 RESULTS SUMMARY
═══════════════════════════════════════════════════════
✅ Internet Connectivity
✅ Cloudinary API
✅ FormData Creation
✅ Image URI to Blob
✅ Full Upload Test

✅ All tests passed!
```

---

## Step 3: Troubleshoot Based on Results

### ❌ Internet Connectivity Failed
**Problem:** Your device/emulator has no internet access

**Fixes:**
- **Physical device:** Connect to WiFi (must be same network as PC)
- **Android Emulator:** Check Settings → WiFi → Enable WiFi
- **iOS Simulator:** Should auto-connect (check System Preferences → Network)

**Test:** Can you browse websites on your device?

---

### ❌ Cloudinary API Failed (but internet works)
**Problem:** Can't reach Cloudinary servers

**Possible causes:**
1. Wrong cloud name in code
2. Firewall blocking requests
3. Cloudinary service is down (unlikely)

**Fixes:**
1. Verify cloud name in `frontend/src/utils/cloudinaryUpload.js`:
   ```javascript
   const CLOUDINARY_NAME = 'dd7wvydqv';  // Check this!
   ```

2. Compare with your Cloudinary dashboard:
   - Go to https://cloudinary.com/console
   - Check your **Cloud Name** at the top
   - If different, update the code

---

### ❌ FormData Creation Failed
**Problem:** React Native FormData has issues

**Fix:**
```bash
# Reinstall dependencies
cd frontend
npm install
npx expo start --clear
```

---

### ❌ Image URI to Blob Failed
**Problem:** Can't read the image file

**Possible causes:**
1. File doesn't exist at that path
2. Permission denied
3. Wrong file format

**Fixes:**
1. Verify image path is correct
2. Try a different image
3. Check permissions: `<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />`

---

### ❌ Full Upload Test Failed
**Problem:** Upload itself is failing

**Check the error message:**

**"HTTP 401" or "Authentication failed"**
- Upload preset `holohaven_upload` not found
- Create it: Cloudinary Dashboard → Settings → Upload → Add upload preset
- Set to **Unsigned** mode

**"Timeout" error**
- Network too slow
- Image too large (compress it)
- Server overloaded

**"Error 403" or "Forbidden"**
- Unsigned upload restricted in your account
- Check upload preset settings in Cloudinary

---

## Full Diagnostic Test with Image

To test with an actual image from your gallery:

```javascript
import { runFullDiagnostics } from '../../utils/cloudinaryDiagnostics';
import * as ImagePicker from 'expo-image-picker';

const testUpload = async () => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 0.8,
  });

  if (!result.canceled && result.assets?.[0]) {
    const imageUri = result.assets[0].uri;
    console.log('\n📸 Testing with image:', imageUri);
    
    // Run full diagnostics with this image
    await runFullDiagnostics(imageUri);
  }
};

// Then call: testUpload()
```

---

## Expected Output (Everything Working)

```
✅ Internet is available - HTTP status: 200
✅ Cloudinary API is reachable - HTTP status: 200
✅ FormData creation successful
✅ Blob created successfully
  📍 Size: 250 KB
  📍 Type: image/jpeg
✅ Response received - status: 200
✅ Upload successful!
   URL: https://res.cloudinary.com/...
```

When you see all ✅, your uploads should work!

---

## Common Issues & Quick Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| ❌ Internet | No WiFi | Connect to WiFi |
| ❌ Cloudinary API | Wrong cloud name | Update `cloudinaryUpload.js` |
| ❌ FormData | React Native issue | `npm install && npx expo start --clear` |
| ❌ Image Blob | File not found | Try different image |
| ❌ Upload | No upload preset | Create `holohaven_upload` in Cloudinary |
| ❌ Upload | Slow network | Reduce image quality to 0.6 |
| ❌ Upload | Auth error | Set upload preset to **Unsigned** |

---

## Minimal Test Code

Add to any component:

```javascript
useEffect(() => {
  // Quick connectivity test
  const test = async () => {
    const { testCloudinaryConnectivity } = await import('../../utils/cloudinaryDiagnostics');
    const connected = await testCloudinaryConnectivity();
    console.log('Cloudinary accessible:', connected ? '✅ YES' : '❌ NO');
  };
  test();
}, []);
```

---

## After Fixing Issues

1. Run diagnostics again to confirm ✅
2. Clear app cache: `npx expo start --clear`
3. Try uploading a real image
4. Check console for: `✅ Cloudinary Upload: Success!`

---

## Still Not Working?

1. **Check all 3 things:**
   - ✅ Internet working?
   - ✅ Cloudinary API reachable?
   - ✅ Upload preset created?

2. **Restart everything:**
   ```bash
   # Kill all terminals
   # Terminal 1
   cd backend && npm run dev
   
   # Terminal 2  
   cd frontend && npx expo start --clear
   ```

3. **Review error logs:**
   - Look for the exact error message in console
   - Match it to "Common Issues" table above
   - Apply the fix

4. **Test in browser**:
   - Try `npx expo start` → Web
   - Different platform might work
   - Helps narrow down the issue

---

## Detailed Debugging

If still stuck, add this to `cloudinaryUpload.js`:

```javascript
// Add after each step
console.log('📍 STEP: Image picked');
console.log('📍 STEP: Converting to blob');
console.log('📍 STEP: Creating FormData');
console.log('📍 STEP: Sending request');
console.log('📍 STEP: Got response');
```

Then watch exactly where it stops!

