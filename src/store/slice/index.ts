import { combineReducers } from '@reduxjs/toolkit';
import userReducer from './userReducer';

// combine reducers
const reducer = combineReducers({
  user: userReducer
});

export default reducer;
