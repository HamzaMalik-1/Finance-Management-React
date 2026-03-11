import { isRejectedWithValue, isFulfilled } from '@reduxjs/toolkit';
import { toast } from 'react-hot-toast';
import { logout } from '../slices/authSlice'; // Adjust to your actual path

export const rtkQueryCustomLogger = (api) => (next) => (action) => {
  // 1. Handle Global Success (Only for Mutations)
  if (isFulfilled(action)) {
    // Check if it's a mutation (POST, PUT, DELETE) and not a query (GET)
    // Most backends send a 201 or a specific success message for changes
    if (action.meta?.arg?.type === 'mutation' && action.payload?.message) {
      toast.success(action.payload.message);
    }
  }

  // 2. Handle Global Error Messages
  if (isRejectedWithValue(action)) {
    const status = action.payload?.status;
    const errorMessage = action.payload?.data?.message || 'Something went wrong';

    // ✅ SPECIAL CASE: Session Expired (401)
    if (status === 401) {
      toast.error("Session expired. Please login again.");
      api.dispatch(logout());
      // Optional: window.location.href = '/login';
    } else {
      // Regular errors (400, 500, etc.)
      toast.error(errorMessage);
    }
  }

  return next(action);
};