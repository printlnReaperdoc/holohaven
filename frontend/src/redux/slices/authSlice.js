import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as SecureStore from 'expo-secure-store';
import { getToken } from '../../auth/token';
import { axiosInstance } from '../../api/api';

export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        '/auth/login',
        { email, password }
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
    const response = await axiosInstance.post(
      '/auth/register',
      { email, username, password }
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
      const response = await axiosInstance.post(
        '/auth/google',
        { googleId, email, fullName, profilePicture }
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
    const response = await axiosInstance.post(
      '/auth/verify',
      {}
    );
    return response.data;
  }
);

export const fetchProfile = createAsyncThunk(
  'auth/fetchProfile',
  async () => {
    const response = await axiosInstance.get('/users/profile');
    return response.data;
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put('/users/profile', profileData);
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
      console.log('uploadProfilePicture: Starting upload for URI:', imageUri);
      
      // Create FormData with the image URI
      const formData = new FormData();
      formData.append('profilePicture', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'profile.jpg',
      });

      console.log('uploadProfilePicture: FormData created, sending to server');
      
      const response = await axiosInstance.post(
        '/users/profile-picture',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 30000,
        }
      );

      console.log('uploadProfilePicture: Upload successful, new URL:', response.data.profilePicture);
      return response.data;
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
