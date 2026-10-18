import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api } from '../api/client';
import type { TokenResponse } from '../api/types';

const STORAGE_KEY = 'task-dashboard.session';

export interface AuthState {
  token: string | null;
  email: string | null;
  displayName: string | null;
  status: 'idle' | 'loading' | 'failed';
  error: string | null;
}

export function loadSession(): Pick<AuthState, 'token' | 'email' | 'displayName'> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (typeof parsed.token === 'string') {
        return { token: parsed.token, email: parsed.email ?? null, displayName: parsed.displayName ?? null };
      }
    }
  } catch {
    // corrupted storage: start signed out
  }
  return { token: null, email: null, displayName: null };
}

function persist(response: TokenResponse): void {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ token: response.accessToken, email: response.email, displayName: response.displayName }),
  );
}

export const login = createAsyncThunk('auth/login', async (args: { email: string; password: string }) => {
  const response = await api.login(args.email, args.password);
  persist(response);
  return response;
});

export const register = createAsyncThunk(
  'auth/register',
  async (args: { email: string; password: string; displayName: string }) => {
    const response = await api.register(args.email, args.password, args.displayName);
    persist(response);
    return response;
  },
);

const initialState: AuthState = { ...loadSession(), status: 'idle', error: null };

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      localStorage.removeItem(STORAGE_KEY);
      state.token = null;
      state.email = null;
      state.displayName = null;
      state.status = 'idle';
      state.error = null;
    },
    clearAuthError(state) {
      state.error = null;
      state.status = 'idle';
    },
  },
  extraReducers: (builder) => {
    const pending = (state: AuthState) => {
      state.status = 'loading';
      state.error = null;
    };
    const fulfilled = (state: AuthState, action: { payload: TokenResponse }) => {
      state.status = 'idle';
      state.token = action.payload.accessToken;
      state.email = action.payload.email;
      state.displayName = action.payload.displayName;
    };
    const rejected = (state: AuthState, action: { error: { message?: string } }) => {
      state.status = 'failed';
      state.error = action.error.message ?? 'Something went wrong';
    };
    builder
      .addCase(login.pending, pending)
      .addCase(login.fulfilled, fulfilled)
      .addCase(login.rejected, rejected)
      .addCase(register.pending, pending)
      .addCase(register.fulfilled, fulfilled)
      .addCase(register.rejected, rejected);
  },
});

export const { logout, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
