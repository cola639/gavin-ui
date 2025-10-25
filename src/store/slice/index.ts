import { combineReducers } from '@reduxjs/toolkit';
import userSlice from './userSlice';

import authSlice from './authSlice';

// combine reducers
const reducer = combineReducers({
  user: userSlice,
  auth: authSlice
});

export default reducer;
