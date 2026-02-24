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
      console.log('[ACTION] Registering push token');
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
 * Fetch notifications for current user
 */
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (_, { rejectWithValue }) => {
    try {
      console.log('[ACTION] Fetching notifications');
      const response = await axiosInstance.get('/notifications');
      console.log(`[ACTION] Fetched ${response.data.length} notifications`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: error.message });
    }
  }
);

/**
 * Mark notification as read
 */
export const markNotificationRead = createAsyncThunk(
  'notifications/markNotificationRead',
  async (notificationId, { rejectWithValue }) => {
    try {
      console.log(`[ACTION] Marking notification ${notificationId} as read`);
      const response = await axiosInstance.patch(`/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: error.message });
    }
  }
);

/**
 * Send promotion notification for a specific product
 */
export const sendPromotionNotification = createAsyncThunk(
  'notifications/sendPromotionNotification',
  async ({ productId, title, message }, { rejectWithValue }) => {
    try {
      console.log(`[ACTION] Sending promotion notification for product ${productId}`);
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
 * Send random product promotion notification
 */
export const sendRandomPromotion = createAsyncThunk(
  'notifications/sendRandomPromotion',
  async (_, { rejectWithValue }) => {
    try {
      console.log('[ACTION] Sending random product promotion notification');
      const response = await axiosInstance.post('/notifications/send-random-promotion');
      console.log(`[ACTION] Random promotion sent for: ${response.data.product?.name}`);
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
    unreadCount: 0,
  },
  reducers: {
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload);
      state.currentNotification = action.payload;
      state.unreadCount += 1;
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        (n) => n._id !== action.payload
      );
    },
    clearNotifications: (state) => {
      state.notifications = [];
      state.currentNotification = null;
      state.unreadCount = 0;
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
      // Fetch notifications
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload;
        state.unreadCount = action.payload.filter((n) => !n.read).length;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      // Mark as read
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        const notification = state.notifications.find(
          (n) => n._id === action.payload._id
        );
        if (notification) {
          notification.read = true;
          state.unreadCount = state.notifications.filter((n) => !n.read).length;
        }
      })
      // Send promotion
      .addCase(sendPromotionNotification.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(sendPromotionNotification.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(sendPromotionNotification.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      // Send random promotion
      .addCase(sendRandomPromotion.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(sendRandomPromotion.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(sendRandomPromotion.rejected, (state, action) => {
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
