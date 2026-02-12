import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { axiosInstance } from '../../api/api';

export const fetchReviews = createAsyncThunk(
  'reviews/fetchReviews',
  async (productId) => {
    const response = await axiosInstance.get(
      `/reviews/product/${productId}`
    );
    return response.data;
  }
);

export const fetchUserReviews = createAsyncThunk(
  'reviews/fetchUserReviews',
  async () => {
    const response = await axiosInstance.get('/reviews/user/my-reviews');
    return response.data;
  }
);

export const createReview = createAsyncThunk(
  'reviews/createReview',
  async (reviewData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/reviews', reviewData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: error.message });
    }
  }
);

export const updateReview = createAsyncThunk(
  'reviews/updateReview',
  async ({ reviewId, ...reviewData }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(
        `/reviews/${reviewId}`,
        reviewData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: error.message });
    }
  }
);

export const deleteReview = createAsyncThunk(
  'reviews/deleteReview',
  async (reviewId, { rejectWithValue }) => {
    try {
      const token = await getToken();
      await axios.delete(`${API_URL}/reviews/${reviewId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return reviewId;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: error.message });
    }
  }
);

const reviewsSlice = createSlice({
  name: 'reviews',
  initialState: {
    productReviews: [],
    userReviews: [],
    loading: false,
    error: null,
    success: false,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.productReviews = action.payload;
      })
      .addCase(fetchReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchUserReviews.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.userReviews = action.payload;
      })
      .addCase(fetchUserReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(createReview.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createReview.fulfilled, (state, action) => {
        state.loading = false;
        state.productReviews.unshift(action.payload);
        state.userReviews.push(action.payload);
        state.success = true;
      })
      .addCase(createReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(updateReview.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateReview.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.productReviews.findIndex(
          (r) => r._id === action.payload._id
        );
        if (index >= 0) {
          state.productReviews[index] = action.payload;
        }
        const userIndex = state.userReviews.findIndex(
          (r) => r._id === action.payload._id
        );
        if (userIndex >= 0) {
          state.userReviews[userIndex] = action.payload;
        }
        state.success = true;
      })
      .addCase(updateReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(deleteReview.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(deleteReview.fulfilled, (state, action) => {
        state.loading = false;
        state.productReviews = state.productReviews.filter(
          (r) => r._id !== action.payload
        );
        state.userReviews = state.userReviews.filter(
          (r) => r._id !== action.payload
        );
        state.success = true;
      })
      .addCase(deleteReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      });
  },
});

export const { clearError, clearSuccess } = reviewsSlice.actions;
export default reviewsSlice.reducer;
