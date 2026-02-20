// store/slices/accountSlice.js
import { createSlice } from '@reduxjs/toolkit';

const accountSlice = createSlice({
  name: 'account',
  initialState: { activeAccountId: null },
  reducers: {
    setActiveAccount: (state, action) => {
      state.activeAccountId = action.payload;
    },
  },
});

export const { setActiveAccount } = accountSlice.actions;
export default accountSlice.reducer;