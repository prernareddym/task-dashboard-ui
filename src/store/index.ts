import { combineReducers, configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import tasksReducer from './tasksSlice';

export const rootReducer = combineReducers({ auth: authReducer, tasks: tasksReducer });

export function createStore(preloadedState?: Partial<ReturnType<typeof rootReducer>>) {
  return configureStore({ reducer: rootReducer, preloadedState });
}

export type AppStore = ReturnType<typeof createStore>;
export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = AppStore['dispatch'];
