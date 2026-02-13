import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  selectedCountry: null,
  selectedCity: null,
  selectedCurrency: null,
};

const constantSlice = createSlice({
  name: 'constant',
  initialState,
  reducers: {
    setSelection: (state, action) => {
      const { key, value } = action.payload; // key: 'selectedCountry', value: ID
      state[key] = value;
      // Reset city if country changes
      if (key === 'selectedCountry') state.selectedCity = null;
    },
    clearConstants: () => initialState,
  },
});

export const { setSelection, clearConstants } = constantSlice.actions;
export default constantSlice.reducer;