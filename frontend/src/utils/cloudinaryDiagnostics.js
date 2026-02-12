/**
 * Cloudinary Upload Diagnostic Utility
 * Use this to test and debug upload issues
 */

const CLOUDINARY_NAME = 'dd7wvydqv';
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_NAME}/image/upload`;

/**
 * Test internet connectivity
 */
export const testInternetConnectivity = async () => {
  console.log('\n🔍 Testing Internet Connectivity...');
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch('https://www.google.com', {
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    console.log('✅ Internet is available - HTTP status:', response.status);
    return true;
  } catch (error) {
    console.error('❌ No internet connection:', error.message);
    return false;
  }
};

/**
 * Test Cloudinary API connectivity
 */
export const testCloudinaryConnectivity = async () => {
  console.log('\n🔍 Testing Cloudinary API Connectivity...');
  console.log('📍 Target URL:', CLOUDINARY_UPLOAD_URL);
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    const response = await fetch(CLOUDINARY_UPLOAD_URL, {
      method: 'OPTIONS',
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    console.log('✅ Cloudinary API is reachable - HTTP status:', response.status);
    return true;
  } catch (error) {
    console.error('❌ Cannot reach Cloudinary API:', error.message);
    console.error('💡 Possible causes:');
    console.error('   - No internet connection');
    console.error('   - Cloud name is incorrect');
    console.error('   - Cloudinary service is down');
    return false;
  }
};

/**
 * Test FormData creation and logging
 */
export const testFormDataCreation = async () => {
  console.log('\n🔍 Testing FormData Creation...');
  
  try {
    // Create a test FormData
    const formData = new FormData();
    
    // Test adding string values
    formData.append('folder', 'test');
    formData.append('resource_type', 'auto');
    console.log('✅ FormData string append works');
    
    // Test adding blob (create a dummy one)
    const testBlob = new Blob(['test'], { type: 'text/plain' });
    formData.append('file', testBlob, 'test.txt');
    console.log('✅ FormData blob append works');
    
    console.log('✅ FormData creation successful');
    return true;
  } catch (error) {
    console.error('❌ FormData error:', error.message);
    return false;
  }
};

/**
 * Test image URI to blob conversion
 */
export const testImageUriToBlob = async (imageUri) => {
  console.log('\n🔍 Testing Image URI to Blob Conversion...');
  console.log('📍 URI:', imageUri.substring(0, 50) + '...');
  
  try {
    console.log('  📍 Fetching from URI...');
    const response = await fetch(imageUri);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    console.log('✅ Fetch successful - status:', response.status);
    console.log('  📍 Creating blob...');
    
    const blob = await response.blob();
    
    console.log('✅ Blob created successfully');
    console.log('  📍 Size:', Math.round(blob.size / 1024), 'KB');
    console.log('  📍 Type:', blob.type);
    
    return blob;
  } catch (error) {
    console.error('❌ Image conversion error:', error.message);
    console.error('💡 Possible causes:');
    console.error('   - Image file does not exist');
    console.error('   - Invalid file:// URI');
    console.error('   - Permission denied');
    return null;
  }
};

/**
 * Test complete upload without preset (raw test)
 */
export const testRawCloudinaryUpload = async (imageUri) => {
  console.log('\n🔍 Testing Raw Cloudinary Upload...');
  
  try {
    // Step 1: Convert image to blob
    console.log('  [1/3] Converting image to blob...');
    const blob = await testImageUriToBlob(imageUri);
    if (!blob) throw new Error('Failed to create blob');
    
    // Step 2: Create FormData
    console.log('  [2/3] Creating FormData...');
    const formData = new FormData();
    formData.append('file', blob, 'image.jpg');
    formData.append('folder', 'test');
    formData.append('resource_type', 'auto');
    formData.append('tags', 'diagnostic');
    console.log('✅ FormData created');
    
    // Step 3: Send to Cloudinary
    console.log('  [3/3] Sending to Cloudinary...');
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    
    const response = await fetch(CLOUDINARY_UPLOAD_URL, {
      method: 'POST',
      body: formData,
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
      },
    });
    
    clearTimeout(timeoutId);
    
    console.log('✅ Response received - status:', response.status);
    
    if (!response.ok) {
      const text = await response.text();
      console.error('❌ Upload failed - HTTP', response.status);
      console.error('Response:', text.substring(0, 200));
      
      try {
        const data = JSON.parse(text);
        if (data.error) {
          console.error('Error:', data.error);
        }
      } catch (e) {}
      
      return false;
    }
    
    const data = await response.json();
    console.log('✅ Upload successful!');
    console.log('   URL:', data.secure_url);
    console.log('   Public ID:', data.public_id);
    
    return true;
  } catch (error) {
    console.error('❌ Upload test failed:', error.message);
    if (error.name === 'AbortError') {
      console.error('   Reason: Request timeout (internet too slow?)');
    }
    return false;
  }
};

/**
 * Run all diagnostics
 */
export const runFullDiagnostics = async (testImageUri) => {
  console.log('\n');
  console.log('═══════════════════════════════════════════════════════');
  console.log('  🔧 CLOUDINARY UPLOAD DIAGNOSTICS');
  console.log('═══════════════════════════════════════════════════════');
  
  const results = [];
  
  // Test 1: Internet
  const internet = await testInternetConnectivity();
  results.push({ name: 'Internet Connectivity', passed: internet });
  
  if (!internet) {
    console.log('\n⚠️  Tests stopped - fix internet connection first');
    return results;
  }
  
  // Test 2: Cloudinary API
  const cloudinary = await testCloudinaryConnectivity();
  results.push({ name: 'Cloudinary API', passed: cloudinary });
  
  if (!cloudinary) {
    console.log('\n⚠️  Tests stopped - cannot reach Cloudinary');
    return results;
  }
  
  // Test 3: FormData
  const formdata = await testFormDataCreation();
  results.push({ name: 'FormData Creation', passed: formdata });
  
  // Test 4: Image conversion (if URI provided)
  if (testImageUri) {
    const imageOk = await testImageUriToBlob(testImageUri);
    results.push({ name: 'Image URI to Blob', passed: !!imageOk });
    
    // Test 5: Full upload (if image is OK)
    if (imageOk) {
      const uploadOk = await testRawCloudinaryUpload(testImageUri);
      results.push({ name: 'Full Upload Test', passed: uploadOk });
    }
  }
  
  // Print summary
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('  📊 RESULTS SUMMARY');
  console.log('═══════════════════════════════════════════════════════');
  
  results.forEach((result) => {
    const icon = result.passed ? '✅' : '❌';
    console.log(`${icon} ${result.name}`);
  });
  
  const allPassed = results.every(r => r.passed);
  console.log('\n' + (allPassed ? '✅ All tests passed!' : '❌ Some tests failed'));
  console.log('═══════════════════════════════════════════════════════\n');
  
  return results;
};

export default {
  testInternetConnectivity,
  testCloudinaryConnectivity,
  testFormDataCreation,
  testImageUriToBlob,
  testRawCloudinaryUpload,
  runFullDiagnostics,
};
