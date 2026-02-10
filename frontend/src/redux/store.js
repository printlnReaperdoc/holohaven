import { configureStore } from '@reduxjs/toolkit';
import productsReducer from './slices/productsSlice';
import ordersReducer from './slices/ordersSlice';
import reviewsReducer from './slices/reviewsSlice';
import cartReducer from './slices/cartSlice';
import authReducer from './slices/authSlice';
import promotionsReducer from './slices/promotionsSlice';
import notificationsReducer from './slices/notificationsSlice';

const store = configureStore({
  reducer: {
    products: productsReducer,
    orders: ordersReducer,
    reviews: reviewsReducer,
    cart: cartReducer,
    auth: authReducer,
    promotions: promotionsReducer,
    notifications: notificationsReducer,
  },
});

export default store;
