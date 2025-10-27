import { combineReducers } from '@reduxjs/toolkit';
import userSlice from './userSlice';

import authSlice from './authSlice';
import routeSlice from './routeSlice';

// combine reducers
const reducer = combineReducers({
  user: userSlice,
  auth: authSlice,
  routes: routeSlice
});

export default reducer;
