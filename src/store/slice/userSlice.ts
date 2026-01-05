import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { getInfoApi } from 'apis/auth';
import { loginApi, logoutApi } from 'apis/user';
import { getToken, removeToken, setToken } from 'utils/auth';

/** ===== Types ===== */
export interface Role {
  roleId: number;
  roleName: string;
  roleKey: string;
  permissions?: string[];
  admin?: boolean;
}

export interface UserInfo {
  userId: number;
  userName: string;
  nickName?: string;
  avatar?: string;
  roles?: Role[];
  admin?: boolean;
  // add more fields if you need
}

export interface UserState {
  token: string | null;
  userInfo: UserInfo | null;
  roles: string[];
  permissions: string[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: UserState = {
  token: getToken() ?? null,
  userInfo: null,
  roles: [],
  permissions: [],
  status: 'idle',
  error: null
};

/** ===== Async Thunks ===== */
export const loginUser = createAsyncThunk<string, any>('user/login', async (data, { rejectWithValue }) => {
  try {
    const res: any = await loginApi(data);
    return res.token as string;
  } catch (err: any) {
    return rejectWithValue(err?.message ?? 'Login failed');
  }
});

export const fetchUserInfo = createAsyncThunk<UserInfo>('user/fetchUserInfo', async (_, { rejectWithValue }) => {
  try {
    const res: any = await getInfoApi();
    return res.user as UserInfo;
  } catch (err: any) {
    return rejectWithValue(err?.message ?? 'Fetch user info failed');
  }
});

export const logoutUser = createAsyncThunk<void>('user/logout', async (_, { rejectWithValue }) => {
  try {
    await logoutApi();
  } catch (err: any) {
    // even if backend fails, you might still want to clear local auth
    return rejectWithValue(err?.message ?? 'Logout failed');
  }
});

/** ===== Helpers ===== */
function deriveAuth(userInfo: UserInfo | null) {
  const roles = userInfo?.roles?.map((r) => r.roleKey) ?? [];
  const permissions = userInfo?.roles?.flatMap((r) => r.permissions ?? []) ?? [];
  return { roles, permissions };
}

/** ===== Slice ===== */
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    /** optional: sync set user info (e.g. edit profile in UI) */
    setUserInfo(state, action: PayloadAction<UserInfo | null>) {
      state.userInfo = action.payload;
      const { roles, permissions } = deriveAuth(action.payload);
      state.roles = roles;
      state.permissions = permissions;
    },

    /** optional: hard reset without calling API */
    resetAuth(state) {
      state.token = null;
      state.userInfo = null;
      state.roles = [];
      state.permissions = [];
      state.status = 'idle';
      state.error = null;
      removeToken();
    }
  },
  extraReducers: (builder) => {
    builder
      // login
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.token = action.payload;
        setToken(action.payload);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = (action.payload as string) ?? action.error.message ?? 'Login failed';
      })

      // fetch user info
      .addCase(fetchUserInfo.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchUserInfo.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.userInfo = action.payload;

        const { roles, permissions } = deriveAuth(action.payload);
        state.roles = roles;
        state.permissions = permissions;
      })
      .addCase(fetchUserInfo.rejected, (state, action) => {
        state.status = 'failed';
        state.error = (action.payload as string) ?? action.error.message ?? 'Fetch user info failed';
      })

      // logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.token = null;
        state.userInfo = null;
        state.roles = [];
        state.permissions = [];
        state.status = 'idle';
        state.error = null;
        removeToken();
      })
      .addCase(logoutUser.rejected, (state) => {
        // still clear local state for safety (optional but common)
        state.token = null;
        state.userInfo = null;
        state.roles = [];
        state.permissions = [];
        state.status = 'idle';
        state.error = null;
        removeToken();
      });
  }
});

export default userSlice.reducer;
export const { setUserInfo, resetAuth } = userSlice.actions;
