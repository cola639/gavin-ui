import { createSlice } from '@reduxjs/toolkit';
import { getUserInfoApi, loginApi, logoutApi } from 'apis/user';
import { getToken, removeToken, setToken } from 'utils/auth';
import { dispatch } from '../index';

interface UserProps {
  token?: string;
  roles?: string[];
  userInfo?: {};
  permissions?: string[];
}

const initialState: UserProps = {
  token: getToken(),
  userInfo: {},
  roles: [],
  permissions: []
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser(state, action) {
      // 更新用户token的逻辑
      state.token = action.payload;
      setToken(action.payload);
    },
    setUserInfo(state, action) {
      console.log('🚀 >> setUserInfo >> action:', action);
      // 设置用户信息
      state.userInfo = action.payload;
    },

    logout(state) {
      // 清空用户token的逻辑
      state.token = undefined;
      removeToken();
    }
  }
});

/**
 * async actions
 */
export function loginUser(data) {
  return new Promise<void>((resolve, reject) => {
    loginApi(data)
      .then((res) => {
        console.log('🚀 >> .then >> res:', res);
        const { token } = res as any;
        dispatch(setUser(token));
        resolve();
      })
      .catch((error) => {
        reject(error);
      });
  });
}

/** async await 写法 */
// export async function loginUser(data: any): Promise<void> {
//   try {
//     const res = await loginApi(data);
//     console.log('🚀 >> .then >> res:', res);
//     const { token } = res as any;
//     dispatch(setUser(token));
//   } catch (error) {
//     return Promise.reject(error);
//   }
// }

export function getUserInfo() {
  return new Promise<void>((resolve, reject) => {
    getUserInfoApi()
      .then((res) => {
        const { user } = res as any;
        dispatch(setUserInfo(user));
        resolve();
      })
      .catch((error) => {
        reject(error);
      });
  });
}

export function logoutUser() {
  return new Promise<void>((resolve, reject) => {
    logoutApi()
      .then(() => {
        dispatch(logout());
        resolve();
      })
      .catch((error) => {
        reject(error);
      });
  });
}

export default userSlice.reducer;
export const { setUser, setUserInfo, logout } = userSlice.actions;
