import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { axiosInstance } from '../../api/api';

export const fetchPromotions = createAsyncThunk(
  'promotions/fetchPromotions',
  async () => {
    const response = await axiosInstance.get('/promotions');
    return response.data;
  }
);

export const fetchPromotionById = createAsyncThunk(
  'promotions/fetchPromotionById',
  async (promotionId) => {
    const response = await axiosInstance.get(
      `/promotions/${promotionId}`
    );
    return response.data;
  }
);

const promotionsSlice = createSlice({
  name: 'promotions',
  initialState: {
    items: [],
    currentPromotion: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPromotions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPromotions.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchPromotions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchPromotionById.fulfilled, (state, action) => {
        state.currentPromotion = action.payload;
      });
  },
});

export default promotionsSlice.reducer;
