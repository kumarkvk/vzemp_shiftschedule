import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { User } from '@/types';

interface AuthState {
  isHydrated: boolean;
  isAuthenticated: boolean;
  user: User | null;
}

const initialState: AuthState = {
  isHydrated: false,
  isAuthenticated: false,
  user: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    hydrateAuthState(state, action: PayloadAction<User | null>) {
      state.user = action.payload;
      state.isAuthenticated = Boolean(action.payload);
      state.isHydrated = true;
    },
    setAuthUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.isHydrated = true;
    },
    clearAuthState(state) {
      state.user = null;
      state.isAuthenticated = false;
      state.isHydrated = true;
    },
  },
});

export const { hydrateAuthState, setAuthUser, clearAuthState } = authSlice.actions;
export default authSlice.reducer;
