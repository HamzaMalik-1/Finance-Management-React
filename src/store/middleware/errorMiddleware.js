import { isRejectedWithValue } from '@reduxjs/toolkit';
import { logout } from '../slices/authSlice'; // Adjust path to your auth slice

export const rtkQueryErrorLogger = (api) => (next) => (action) => {
  if (isRejectedWithValue(action)) {
    // Check if the error status is 401
    if (action.payload.status === 401) {
      console.warn('Session expired. Logging out...');
      
      // 1. Clear Redux Auth State
      api.dispatch(logout());

      // 2. Optional: Clear localStorage if not handled in logout action
      localStorage.removeItem('token');

      // 3. Redirect to login (if not using a logic-based router)
      window.location.href = '/login'; 
    }
  }

  return next(action);
};