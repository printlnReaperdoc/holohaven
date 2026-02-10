import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { getToken } from '../../auth/token';
import { Platform } from 'react-native';

const ENV_API = process.env.REACT_APP_API_URL;
const PLATFORM_DEFAULT = Platform.OS === 'android' ? 'http://10.0.2.2:4000' : 'http://localhost:4000';
let API_URL = ENV_API || PLATFORM_DEFAULT || 'http://192.168.1.100:4000';

if (Platform.OS === 'android' && typeof API_URL === 'string' && API_URL.includes('localhost')) {
  API_URL = API_URL.replace('localhost', '10.0.2.2');
  console.log('Adjusted products API_URL for Android emulator:', API_URL);
}
const AXIOS_TIMEOUT = 10000;

export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (params = {}, { rejectWithValue }) => {
    try {
      const token = await getToken();
      const response = await axios.get(`${API_URL}/products`, {
        params,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        timeout: AXIOS_TIMEOUT,
      });
      return response.data;
    } catch (error) {
      if (error.response) {
        console.error('fetchProducts - server response:', error.response.status, error.response.data);
        return rejectWithValue({ message: `Server error: ${error.response.status}`, details: error.response.data });
      } else if (error.request) {
        console.error('fetchProducts - no response:', error.request);
        return rejectWithValue({ message: 'Network error: no response from server', details: error.message });
      } else {
        console.error('fetchProducts - request error:', error.message);
        return rejectWithValue({ message: `Request error: ${error.message}` });
      }
    }
  }
);

export const fetchProductById = createAsyncThunk(
  'products/fetchProductById',
  async (productId) => {
    const token = await getToken();
    const response = await axios.get(`${API_URL}/products/${productId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      timeout: AXIOS_TIMEOUT,
    });
    return response.data;
  }
);

export const createProduct = createAsyncThunk(
  'products/createProduct',
  async (formData, { rejectWithValue }) => {
    try {
      const token = await getToken();
      const response = await axios.post(`${API_URL}/products`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: error.message });
    }
  }
);

export const fetchCategories = createAsyncThunk(
  'products/fetchCategories',
  async () => {
    const token = await getToken();
    const response = await axios.get(`${API_URL}/products/categories/list`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      timeout: AXIOS_TIMEOUT,
    });
    return response.data;
  }
);

export const fetchFeaturedProducts = createAsyncThunk(
  'products/fetchFeaturedProducts',
  async () => {
    const token = await getToken();
    const response = await axios.get(`${API_URL}/products/featured/trending`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      timeout: AXIOS_TIMEOUT,
    });
    return response.data;
  }
);

const productsSlice = createSlice({
  name: 'products',
  initialState: {
    items: [],
    currentProduct: null,
    categories: [],
    featured: [],
    loading: false,
    error: null,
    filters: {
      search: '',
      category: '',
      minPrice: 0,
      maxPrice: 999999,
    },
  },
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        search: '',
        category: '',
        minPrice: 0,
        maxPrice: 999999,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(fetchProductById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.currentProduct = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProduct = action.payload;
        state.error = null;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.loading = false;
        state.currentProduct = null;
        state.error = action.payload || action.error.message;
      })
      .addCase(createProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.items.unshift(action.payload);
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(fetchFeaturedProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchFeaturedProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.featured = action.payload;
      })
      .addCase(fetchFeaturedProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      });
  },
});

export const { setFilters, clearFilters } = productsSlice.actions;
export default productsSlice.reducer;
