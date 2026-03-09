import { configureStore } from '@reduxjs/toolkit';
import { authApi } from './api/authApi';
import { rtkQueryCustomLogger } from './middleware/rtkQueryErrorLogger';
import { userApi } from './api/userApi';
import { constantApi } from './api/constantApi';
import authReducer from './slices/authSlice';
import accountReducer from './slices/accountSlice';
import constantReducer from './slices/constantSlice';
import { accountApi } from './api/accountApi';
import { categoryApi } from './api/categoryApi';
import { debtApi } from './api/debtApi';
import { contactApi } from './api/contactApi';
import { budgetApi } from './api/budgetApi';
import { transactionApi } from './api/transactionApi';
import { notificationApi } from './api/notificationApi';
import { dashboardApi } from './api/dashboardApi';
export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [userApi.reducerPath]: userApi.reducer, // ✅ Correct
    [constantApi.reducerPath]: constantApi.reducer, // ✅ Correct
    [accountApi.reducerPath]: accountApi.reducer, 
    [categoryApi.reducerPath]: categoryApi.reducer,
    [debtApi.reducerPath]: debtApi.reducer, // ✅ Add Debt Reducer
    [contactApi.reducerPath]: contactApi.reducer, // ✅ Add Contact Reducer
    [budgetApi.reducerPath]: budgetApi.reducer,
    [transactionApi.reducerPath]: transactionApi.reducer,
    [notificationApi.reducerPath]: notificationApi.reducer,
    [dashboardApi.reducerPath]: dashboardApi.reducer,
    auth: authReducer,
    constant: constantReducer,
    account:accountReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat([
      authApi.middleware, 
      userApi.middleware, 
      constantApi.middleware,
      accountApi.middleware,
      categoryApi.middleware,
      debtApi.middleware,
      contactApi.middleware,
      budgetApi.middleware,
      transactionApi.middleware,
      notificationApi.middleware,
      dashboardApi.middleware,
      rtkQueryCustomLogger
    ]),
}); 