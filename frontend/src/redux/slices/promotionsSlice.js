import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { getToken } from '../../auth/token';

const API_URL = process.env.REACT_APP_API_URL || 'http://192.168.1.100:4000';

export const fetchPromotions = createAsyncThunk(
  'promotions/fetchPromotions',
  async () => {
    const token = await getToken();
    const response = await axios.get(`${API_URL}/promotions`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  }
);

export const fetchPromotionById = createAsyncThunk(
  'promotions/fetchPromotionById',
  async (promotionId) => {
    const token = await getToken();
    const response = await axios.get(
      `${API_URL}/promotions/${promotionId}`,
      { headers: { Authorization: `Bearer ${token}` } }
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
