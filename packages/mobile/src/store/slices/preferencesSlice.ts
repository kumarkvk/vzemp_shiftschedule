import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface PreferencesState {
  themeMode: 'system' | 'light' | 'dark';
  hapticsEnabled: boolean;
  analyticsEnabled: boolean;
}

const initialState: PreferencesState = {
  themeMode: 'system',
  hapticsEnabled: true,
  analyticsEnabled: true,
};

const preferencesSlice = createSlice({
  name: 'preferences',
  initialState,
  reducers: {
    updatePreferences(state, action: PayloadAction<Partial<PreferencesState>>) {
      return { ...state, ...action.payload };
    },
  },
});

export const { updatePreferences } = preferencesSlice.actions;
export default preferencesSlice.reducer;
