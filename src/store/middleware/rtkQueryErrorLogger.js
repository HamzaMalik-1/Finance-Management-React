import { isRejectedWithValue, isFulfilled } from '@reduxjs/toolkit';
import { toast } from 'react-hot-toast';

export const rtkQueryCustomLogger = (api) => (next) => (action) => {
  // 1. Handle Global Success Messages
  if (isFulfilled(action)) {
    // Check if your backend sent a "message" in the JSON response
    if (action.payload?.message) {
      toast.success(action.payload.message);
    }
  }

  // 2. Handle Global Error Messages
  if (isRejectedWithValue(action)) {
    // This catches your BadRequestError, UnauthorizedError, etc.
    const errorMessage = action.payload?.data?.message || 'Something went wrong';
    toast.error(errorMessage);
  }

  return next(action);
};