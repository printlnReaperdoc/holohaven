# Network & Image Upload Debugging Guide

## Changes Applied

### 1. ImagePicker API Fix ✅
**Problem**: `mediaTypes: ['image']` caused casting error
```
Cannot cast 'String' to 'expo.modules.imagepicker.JSMediaTypes'
```

**Solution Applied**: Changed to use correct enum
```javascript
// BEFORE - WRONG
mediaTypes: ['image']

// AFTER - CORRECT
mediaTypes: ImagePicker.MediaTypeOptions.Images
```

Also added to camera picker:
```javascript
const result = await ImagePicker.launchCameraAsync({
  mediaTypes: ImagePicker.MediaTypeOptions.Images,
  allowsEditing: true,
  aspect: [1, 1],
  quality: 0.8,
});
```

### 2. Axios Configuration Improvements ✅
- Increased timeout from 20s to 30s for FormData uploads
- Enhanced FormData detection logging
- Better error messages with full URL details

### 3. Backend Configuration Updates ✅
- Explicit CORS configuration with all methods allowed
- Server binds to `0.0.0.0` instead of implicit localhost
- Request logging middleware added
- Backend logs which addresses can access it

---

## Network Error Debugging

### Error Information Received
```
ERROR  ❌ Response error: {
  "baseURL": "http://10.0.2.2:4000",
  "code": "ERR_NETWORK",
  "message": "Network Error"
}
```

### Root Causes (In Priority Order)

#### 1. Android Emulator Cannot Reach Host Machine (Most Common)
**Symptoms**: Network error only from emulator, localhost:4000 works on PC
**Causes**:
- Windows Firewall blocking port 4000
- Virtual network adapter misconfiguration
- 10.0.2.2 address routing issue

**Solutions**:

**Option A: Add Windows Firewall Exception**
```powershell
# Run as Administrator in PowerShell
New-NetFirewallRule -DisplayName "Allow Port 4000" `
  -Direction Inbound -Action Allow -Protocol TCP -LocalPort 4000

# Verify rule
Get-NetFirewallRule -DisplayName "Allow Port 4000" | Get-NetFirewallPortFilter
```

**Option B: Disable Firewall Temporarily (Testing Only)**
```powershell
# Run as Administrator
Set-NetFirewallProfile -Profile Domain,Public,Private -Enabled $false

# Re-enable later
Set-NetFirewallProfile -Profile Domain,Public,Private -Enabled $true
```

**Option C: Use Host Machine IP Instead of 10.0.2.2**
```powershell
# Find your PC's local IP
ipconfig /all

# Look for IPv4 Address (typically 192.168.x.x)
```

Then update `frontend/src/api/api.js`:
```javascript
if (Platform.OS === 'android') {
  // Replace with your actual PC IP
  API_URL = 'http://192.168.1.100:4000'; // Use your actual IP
}
```

#### 2. Backend Not Listening on Correct Interface
**Symptoms**: Connection refused errors

**Check**:
```powershell
netstat -ano | findstr :4000
```

**Expected Output**:
```
TCP    0.0.0.0:4000           0.0.0.0:0              LISTENING       [PID]
```

If showing only `127.0.0.1:4000`, backend is not accessible remotely.

#### 3. Request Timeout (20-30s exceeded)
**Symptoms**: Request hangs then fails with ERR_NETWORK

**Causes**:
- Large file upload (> 5MB)
- Slow Cloudinary upload
- Network latency issues

**Solutions**:
- Ensure image < 5MB
- Check Cloudinary credentials are valid
- Increase timeout further if needed

---

## Testing Procedure

### Step 1: Verify Backend HTTP Response
```powershell
Invoke-WebRequest -Uri "http://localhost:4000/health" -UseBasicParsing
```

**Expected**:
```
StatusCode : 200
Content    : {"status":"OK"}
```

### Step 2: Test from Android Emulator
1. Add a simple product WITHOUT image first
   - This tests basic connectivity
   - If this works, issue is specific to FormData/image upload

2. Then test with image
   - Console logs will show FormData being sent
   - Backend logs will show file reception

### Step 3: Check Console Logs

**Frontend Console** (React Native Debugger):
```
🔗 API_URL configured: http://10.0.2.2:4000 Platform: android
📦 FormData request detected: {
  url: /products,
  method: post,
  timeout: 30000,
  baseURL: http://10.0.2.2:4000
}
```

**Backend Console** (Node.js Terminal):
```
📨 POST /products
🖼️ Upload fileFilter - File received: {
  fieldname: "image",
  originalname: "DSC_1234.jpg",
  mimetype: "image/jpeg",
  size: 2097152
}
✅ Cloudinary connected: ok
```

### Step 4: Validate Image Processing

If FormData is sent but image not saved:
```javascript
// Check backend logs for:
// 1. File received by multer: "🖼️ Upload fileFilter"
// 2. Image extracted: "📸 Product image from file upload"
// 3. Cloudinary response: Check for URL in response
```

---

## Common Issues & Solutions

### Issue: Still Getting "Cannot read property 'Image' of undefined"
**Fix**: Remove and reinstall expo-image-picker
```bash
npm uninstall expo-image-picker
npm install expo-image-picker
```

### Issue: formData.image is Null/Undefined
**Causes**:
- Image picker was cancelled
- Result doesn't have assets array
- Image URI extraction failed

**Debug**:
```javascript
console.log('Image picker result:', {
  canceled: result.canceled,
  assets: result.assets,
  assetsLength: result.assets?.length,
  uri: result.assets?.[0]?.uri,
});
```

### Issue: FormData Still Showing Content-Type: application/json
**Fix**: Clear axios cache
```javascript
// In api.js
delete axiosInstance.defaults.headers['Content-Type'];

// Or override for this request
config.headers['Content-Type'] = undefined;
delete config.headers['Content-Type'];
```

### Issue: Image Uploads But Shows as Default
**Causes**:
1. Product.image field is empty in response
2. ImageWithFallback treats valid URI as falsy
3. Cloudinary URL not being returned

**Debug**:
```javascript
console.log('✅ Product created:', response.data);
console.log('✅ Image field value:', response.data.image);
console.log('✅ Images array:', response.data.images);

// Check if response includes URL:
if (!response.data.image) {
  console.error('❌ Backend not returning image URL!');
}
```

---

## Network Adapter Troubleshooting

### Check Android Emulator Network Settings
```bash
# Connect to emulator console
telnet localhost 5554

# Get network status
network status
```

### Reset Android Emulator Network
```bash
# Full reset often fixes network issues
emulator -avd YourEmulatorName -wipe-data
```

### Alternative: Use Actual Android Device
Physical device on same WiFi network works better:
```javascript
if (Platform.OS === 'android' && !Platform.isVirtualDevice) {
  // Physical device - can use PC's local IP
  API_URL = 'http://192.168.1.100:4000';
}
```

---

## Verification Checklist

- [ ] Backend running: `netstat -ano | findstr :4000` shows LISTENING
- [ ] Backend responds: `Invoke-WebRequest http://localhost:4000/health`
- [ ] Firewall allows port 4000
- [ ] ImagePicker using `ImagePicker.MediaTypeOptions.Images`
- [ ] FormData properly assembled (all fields present)
- [ ] Axios timeout ≥ 30s
- [ ] Cloudinary credentials set in .env
- [ ] CORS headers present: `Access-Control-Allow-Origin: *`
- [ ] Console shows complete flow from image pick to response
- [ ] Product.image field populated in response

---

## Quick Fix Steps

### If Can't Connect via 10.0.2.2:
1. Find PC IP: `ipconfig | findstr IPv4`
2. Update `api.js` to use that IP instead
3. Restart Expo
4. Test again

### If Image Upload Still Fails:
1. Test basic product creation (no image) first
2. Check backend logs for "Upload fileFilter"
3. Verify Cloudinary connection succeeds
4. Check image file size < 5MB

### If FormData Not Being Sent:
1. Verify image URI starts with `file://`
2. Check console for "📦 FormData request detected"
3. Review imageFile object structure
4. Ensure formDataToSend.append() calls work

---

## Performance Tips

1. **Optimize Images Before Upload**:
   - Ensure quality ≤ 0.8 in ImagePicker
   - App already sets this
   - Consider compression if images > 2MB

2. **If Uploads Slow**:
   - Increase timeout further (MAX 60000)
   - Check network speed with: `speedtest-cli`
   - May be Cloudinary processing time

3. **Batch Operations**:
   - Don't upload multiple large files simultaneously
   - Upload one image per product

---

## Still Having Issues?

1. **Capture Full Error Details**:
   ```javascript
   console.log('Full error object:', JSON.stringify(error, null, 2));
   console.log('Error stack:', error.stack);
   console.log('Response data:', error.response?.data);
   console.log('Request config:', error.config);
   ```

2. **Enable Network Logging**:
   ```javascript
   // In api.js after axiosInstance creation
   axiosInstance.interceptors.request.use(config => {
     console.log('REQUEST:', config.method.toUpperCase(), config.url, config.data);
     return config;
   });
   axiosInstance.interceptors.response.use(
     response => {
       console.log('RESPONSE:', response.status, response.data);
       return response;
     },
     error => {
       console.log('ERROR RESPONSE:', error.response?.data);
       throw error;
     }
   );
   ```

3. **Share Full Console Output**:
   - Screenshot from React Native Debugger
   - Backend console output
   - Network error details
   - Include steps to reproduce
