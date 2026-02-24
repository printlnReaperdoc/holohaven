import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { axiosInstance } from '../../api/api';
import {
  saveCartToSQLite,
  loadCartFromSQLite,
  clearCartFromSQLite,
  addItemToSQLiteCart,
  removeItemFromSQLiteCart,
} from '../../utils/sqliteDb';

export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/cart');
      // Save to SQLite for offline access
      await saveCartToSQLite(response.data.items || []);
      return response.data;
    } catch (error) {
      console.warn('Failed to fetch cart from server, loading from SQLite:', error);
      // Load from SQLite if server request fails
      const localCart = await loadCartFromSQLite();
      return { items: localCart };
    }
  }
);

export const loadLocalCart = createAsyncThunk(
  'cart/loadLocalCart',
  async () => {
    const items = await loadCartFromSQLite();
    return { items };
  }
);


export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async ({ productId, quantity = 1 }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        '/cart/items',
        { productId, quantity }
      );
      // Save updated cart to SQLite
      await saveCartToSQLite(response.data.items || []);
      return response.data;
    } catch (error) {
      console.warn('Failed to add to server cart, saving to local SQLite');
      // Save to local SQLite if server request fails
      const product = { productId, quantity };
      await addItemToSQLiteCart(product);
      const localCart = await loadCartFromSQLite();
      return { items: localCart };
    }
  }
);

export const updateCartItem = createAsyncThunk(
  'cart/updateCartItem',
  async ({ productId, quantity }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(
        `/cart/items/${productId}`,
        { quantity }
      );
      // Save updated cart to SQLite
      await saveCartToSQLite(response.data.items || []);
      return response.data;
    } catch (error) {
      console.warn('Failed to update server cart, updating local SQLite');
      // Update in local SQLite
      const localCart = await loadCartFromSQLite();
      const updatedCart = localCart.map(item =>
        item.productId === productId ? { ...item, quantity } : item
      );
      await saveCartToSQLite(updatedCart);
      return { items: updatedCart };
    }
  }
);

export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(
        `/cart/items/${productId}`
      );
      // Save updated cart to SQLite
      await saveCartToSQLite(response.data.items || []);
      return response.data;
    } catch (error) {
      console.warn('Failed to remove from server cart, removing from local SQLite');
      // Remove from local SQLite
      await removeItemFromSQLiteCart(productId);
      const localCart = await loadCartFromSQLite();
      return { items: localCart };
    }
  }
);

export const clearCart = createAsyncThunk(
  'cart/clearCart',
  async (_, { rejectWithValue }) => {
    try {
      await axiosInstance.delete('/cart');
      // Clear from SQLite
      await clearCartFromSQLite();
    } catch (error) {
      console.warn('Failed to clear server cart, clearing local SQLite');
      // Clear from local SQLite if server request fails
      await clearCartFromSQLite();
    }
  }
);


const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    totalPrice: 0,
    loading: false,
    error: null,
  },
  reducers: {
    setCartItems: (state, action) => {
      state.items = action.payload;
      state.totalPrice = calculateTotal(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.items = action.payload.items || [];
        state.totalPrice = calculateTotal(state.items);
        state.loading = false;
      })
      .addCase(loadLocalCart.fulfilled, (state, action) => {
        state.items = action.payload.items || [];
        state.totalPrice = calculateTotal(state.items);
        state.loading = false;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.items = action.payload.items || [];
        state.totalPrice = calculateTotal(state.items);
        state.loading = false;
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.items = action.payload.items || [];
        state.totalPrice = calculateTotal(state.items);
        state.loading = false;
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.items = action.payload.items || [];
        state.totalPrice = calculateTotal(state.items);
        state.loading = false;
      })
      .addCase(clearCart.fulfilled, (state) => {
        state.items = [];
        state.totalPrice = 0;
        state.loading = false;
      });
  },
});

function calculateTotal(items) {
  return items.reduce((sum, item) => {
    return sum + Number(item.productId?.price || 0) * item.quantity;
  }, 0);
}

export const { setCartItems } = cartSlice.actions;
export default cartSlice.reducer;
