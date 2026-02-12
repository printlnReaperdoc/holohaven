import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { getToken } from '../../auth/token';

const ENV_API = process.env.REACT_APP_API_URL;
const PLATFORM_DEFAULT = Platform.OS === 'android' ? 'http://10.0.2.2:4000' : 'http://localhost:4000';
let API_URL = ENV_API || PLATFORM_DEFAULT || 'http://192.168.1.100:4000';

// If running on Android and API_URL points to localhost, use emulator host alias
if (Platform.OS === 'android' && typeof API_URL === 'string' && API_URL.includes('localhost')) {
  API_URL = API_URL.replace('localhost', '10.0.2.2');
  console.log('Adjusted API_URL for Android emulator:', API_URL);
}
const AXIOS_TIMEOUT = 10000; // 10s timeout to avoid hanging requests

export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_URL}/auth/login`,
        { email, password },
        { timeout: AXIOS_TIMEOUT }
      );
      await SecureStore.setItemAsync('jwt', response.data.token);
      console.log('JWT Token received on login:', response.data.token);
      return response.data;
    } catch (error) {
      // Detailed logging for debugging network/server errors
      if (error.response) {
        // Server responded with a status outside 2xx
        console.error('Login error - server response:', error.response.status, error.response.data);
        return rejectWithValue({ message: `Server error: ${error.response.status}`, details: error.response.data });
      } else if (error.request) {
        // Request made but no response received
        console.error('Login error - no response received:', error.request);
        return rejectWithValue({ message: 'Network error: no response from server', details: error.message });
      } else {
        // Something happened setting up the request
        console.error('Login error - request setup:', error.message);
        return rejectWithValue({ message: `Request error: ${error.message}` });
      }
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async ({ email, username, password }) => {
    const response = await axios.post(
      `${API_URL}/auth/register`,
      { email, username, password },
      { timeout: AXIOS_TIMEOUT }
    );
    await SecureStore.setItemAsync('jwt', response.data.token);
    // Log the JWT token for debugging
    console.log('JWT Token received on registration:', response.data.token);
    return response.data;
  }
);

export const googleLogin = createAsyncThunk(
  'auth/googleLogin',
  async ({ googleId, email, fullName, profilePicture }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_URL}/auth/google`,
        { googleId, email, fullName, profilePicture },
        { timeout: AXIOS_TIMEOUT }
      );
      await SecureStore.setItemAsync('jwt', response.data.token);
      // Log the JWT token for debugging
      console.log('JWT Token received on Google login:', response.data.token);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: error.message });
    }
  }
);

export const verifyToken = createAsyncThunk(
  'auth/verifyToken',
  async () => {
    const token = await getToken();
    if (!token) {
      throw new Error('No token found');
    }
    const response = await axios.post(
      `${API_URL}/auth/verify`,
      {},
      { headers: { Authorization: `Bearer ${token}` }, timeout: AXIOS_TIMEOUT }
    );
    return response.data;
  }
);

export const fetchProfile = createAsyncThunk(
  'auth/fetchProfile',
  async () => {
    const token = await getToken();
    const response = await axios.get(`${API_URL}/users/profile`, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: AXIOS_TIMEOUT,
    });
    return response.data;
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const token = await getToken();
      const response = await axios.put(`${API_URL}/users/profile`, profileData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: error.message });
    }
  }
);

export const uploadProfilePicture = createAsyncThunk(
  'auth/uploadProfilePicture',
  async (imageUri, { rejectWithValue }) => {
    try {
      const token = await getToken();
      
      console.log('uploadProfilePicture: Starting upload for URI:', imageUri);
      
      // Create FormData with the image URI directly
      const formData = new FormData();
      
      // For React Native, we pass the URI directly
      formData.append('profilePicture', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'profile.jpg',
      });

      console.log('uploadProfilePicture: FormData created, sending to server');
      
      // Upload to backend with proper timeout
      const uploadResponse = await Promise.race([
        fetch(`${API_URL}/users/profile-picture`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Upload timeout after 30s')), 30000)
        ),
      ]);

      console.log('uploadProfilePicture: Response received, status:', uploadResponse.status);

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error('uploadProfilePicture: Error response:', errorText);
        try {
          const errorData = JSON.parse(errorText);
          return rejectWithValue(errorData || { error: 'Upload failed with status ' + uploadResponse.status });
        } catch (e) {
          return rejectWithValue({ error: errorText || ('Upload failed with status ' + uploadResponse.status) });
        }
      }

      const data = await uploadResponse.json();
      console.log('uploadProfilePicture: Upload successful, new URL:', data.profilePicture);
      return data;
    } catch (error) {
      console.error('uploadProfilePicture: Error caught:', error.message);
      return rejectWithValue({ error: 'Upload error: ' + error.message });
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: null,
    loading: false,
    error: null,
    isAuthenticated: false,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      SecureStore.deleteItemAsync('jwt').catch((err) =>
        console.log('Error clearing token:', err)
      );
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(googleLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(googleLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(googleLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || action.error.message;
      })
      .addCase(verifyToken.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Failed to update profile';
      })
      .addCase(uploadProfilePicture.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadProfilePicture.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(uploadProfilePicture.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Failed to upload profile picture';
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
