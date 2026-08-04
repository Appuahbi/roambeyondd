import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import wishlistReducer from './wishlistSlice';
import notificationsReducer from './notificationsSlice';
import chatReducer from './chatSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    wishlist: wishlistReducer,
    notifications: notificationsReducer,
    chat: chatReducer,
  },
});
