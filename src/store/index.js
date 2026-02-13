import { configureStore } from '@reduxjs/toolkit';
import { authApi } from './api/authApi';
import authReducer from './slices/authSlice';
import { rtkQueryCustomLogger } from './middleware/rtkQueryErrorLogger';
import { userApi } from './api/userApi';
import { constantApi } from './api/constantApi';

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [userApi.reducerPath]: userApi.reducer, // ✅ Correct
    [constantApi.reducerPath]: constantApi.reducer, // ✅ Correct
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat([
      authApi.middleware, 
      userApi.middleware, // ✅ CRITICAL: Fixes the white page error
      constantApi.middleware,
      rtkQueryCustomLogger
    ]),
}); 