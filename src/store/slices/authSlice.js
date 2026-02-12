// authSlice.js
import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
  },
  reducers: {
    setCredentials: (state, { payload }) => {
      state.user = payload; 
      state.token = payload.token;

      localStorage.setItem('user', JSON.stringify(payload));
      localStorage.setItem('token', payload.token);
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    },
  },
});

// ✅ CHANGE THIS LINE: Add ".actions"
export const { setCredentials, logout } = authSlice.actions; 

export default authSlice.reducer;