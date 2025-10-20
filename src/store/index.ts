import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch as useAppDispatch, useSelector as useAppSelector } from 'react-redux';
import rootReducer from './slice';

// 配置 Redux store
const store = configureStore({
  reducer: rootReducer
});

// 定义 RootState 类型
export type RootState = ReturnType<typeof rootReducer>;
// 定义 AppDispatch 类型
export type AppDispatch = typeof store.dispatch;

// 从 store 中解构 dispatch
const { dispatch } = store;

// 创建自定义的 useDispatch 和 useSelector 钩子
const useDispatch = () => useAppDispatch<AppDispatch>();
const useSelector: TypedUseSelectorHook<RootState> = useAppSelector;

// 导出 store、dispatch、自定义钩子
export { dispatch, store, useDispatch, useSelector };
