// store/authSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
type BackendRoute = {
  name?: string;
  path: string;
  hidden?: boolean;
  component?: string;
  meta?: { title?: string; icon?: string | null; link?: string | null };
  children?: BackendRoute[];
};

type AuthState = {
  token: string | null;
};

const initialState: AuthState = {
  token: typeof window !== 'undefined' ? localStorage.getItem('token') : null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setToken(state, action: PayloadAction<string>) {
      state.token = action.payload;
      localStorage.setItem('token', action.payload);
    },
    clearToken(state) {
      state.token = null;
      localStorage.removeItem('token');
    }
  }
});

export const { setToken, clearToken } = authSlice.actions;
export default authSlice.reducer;
