import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import habitReducer from '../features/habits/habitSlice';
import analyticsReducer from '../features/analytics/analyticsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    habits: habitReducer,
    analytics: analyticsReducer,
  },
});