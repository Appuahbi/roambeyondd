import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authApi } from '../api/endpoints';

/*
The auth token now lives in an httpOnly cookie (set by the backend) and is
NOT persisted in localStorage, so an XSS cannot exfiltrate it. The `token`
field below is only an in-memory presence marker for the current SPA session;
after a full page reload the app restores the session via /auth/me.
*/
const initialState = {
  user: null,
  token: null,
  loading: false,
  initialized: false,
};

export const loginThunk = createAsyncThunk(
  'auth/login',
  async (payload, { rejectWithValue }) => {
    try {
      const res = await authApi.login(payload);
      return res.data;
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

export const registerThunk = createAsyncThunk(
  'auth/register',
  async (payload, { rejectWithValue }) => {
    try {
      const res = await authApi.register(payload);
      return res.data;
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

export const phoneLoginThunk = createAsyncThunk(
  'auth/phoneLogin',
  async (payload, { rejectWithValue }) => {
    try {
      const res = await authApi.phoneLogin(payload);
      return res.data;
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

export const fetchMeThunk = createAsyncThunk(
  'auth/me',
  async (_, { rejectWithValue }) => {
    try {
      const res = await authApi.me();
      return res.data.user;
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

export const logoutThunk = createAsyncThunk('auth/logout', async () => {
  try { await authApi.logout(); } catch { /* noop */ }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setToken(state, action) {
      state.token = action.payload;
    },
    clearAuth(state) {
      state.user = null;
      state.token = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.pending, (s) => { s.loading = true; })
      .addCase(loginThunk.fulfilled, (s, a) => {
        s.loading = false;
        s.user = a.payload.user;
        s.token = a.payload.token;
      })
      .addCase(loginThunk.rejected, (s) => { s.loading = false; })
      .addCase(phoneLoginThunk.pending, (s) => { s.loading = true; })
      .addCase(phoneLoginThunk.fulfilled, (s, a) => {
        s.loading = false;
        s.user = a.payload.user;
        s.token = a.payload.token;
      })
      .addCase(phoneLoginThunk.rejected, (s) => { s.loading = false; })
      .addCase(registerThunk.fulfilled, (s, a) => {
        s.user = a.payload.user;
        s.token = a.payload.token;
      })
      .addCase(fetchMeThunk.fulfilled, (s, a) => {
        s.user = a.payload;
        s.initialized = true;
      })
      .addCase(fetchMeThunk.rejected, (s) => {
        s.user = null;
        s.initialized = true;
      })
      .addCase(logoutThunk.fulfilled, (s) => {
        s.user = null;
        s.token = null;
      });
  },
});

export const { setToken, clearAuth } = authSlice.actions;
export default authSlice.reducer;
