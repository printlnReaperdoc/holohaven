import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { axiosInstance } from '../../api/api';
import * as Notifications from 'expo-notifications';

/**
 * Register device push token with backend
 */
export const registerPushToken = createAsyncThunk(
  'notifications/registerPushToken',
  async (pushToken, { rejectWithValue }) => {
    try {
      await axiosInstance.post(
        '/notifications/register-token',
        { token: pushToken }
      );
      return pushToken;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: error.message });
    }
  }
);

/**
 * Send promotion notification
 */
export const sendPromotionNotification = createAsyncThunk(
  'notifications/sendPromotionNotification',
  async ({ productId, title, message }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        '/notifications/send-promotion',
        { productId, title, message }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: error.message });
    }
  }
);

/**
 * Send Shiranui Flare Hoodie promotion
 */
export const sendShiranuiPromo = createAsyncThunk(
  'notifications/sendShiranuiPromo',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        '/notifications/send-shiranui-promo',
        {}
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: error.message });
    }
  }
);

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: {
    pushToken: null,
    notifications: [],
    loading: false,
    error: null,
    success: false,
    currentNotification: null,
  },
  reducers: {
    addNotification: (state, action) => {
      state.notifications.push(action.payload);
      state.currentNotification = action.payload;
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        (n) => n.id !== action.payload
      );
    },
    clearNotifications: (state) => {
      state.notifications = [];
      state.currentNotification = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Register push token
      .addCase(registerPushToken.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerPushToken.fulfilled, (state, action) => {
        state.loading = false;
        state.pushToken = action.payload;
      })
      .addCase(registerPushToken.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      // Send promotion
      .addCase(sendPromotionNotification.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(sendPromotionNotification.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(sendPromotionNotification.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      // Send Shiranui promo
      .addCase(sendShiranuiPromo.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(sendShiranuiPromo.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(sendShiranuiPromo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      });
  },
});

export const {
  addNotification,
  removeNotification,
  clearNotifications,
  clearError,
  clearSuccess,
} = notificationsSlice.actions;

export default notificationsSlice.reducer;
