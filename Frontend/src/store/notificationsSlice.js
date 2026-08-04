import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { notificationApi } from '../api/endpoints';

export const fetchNotificationsThunk = createAsyncThunk('notifications/fetch', async () => {
  const res = await notificationApi.list();
  return res.data?.notifications || [];
});

export const fetchUnreadCountThunk = createAsyncThunk('notifications/unread', async () => {
  const res = await notificationApi.unreadCount();
  return res.data?.count || 0;
});

export const readAllThunk = createAsyncThunk('notifications/readAll', async () => {
  await notificationApi.readAll();
});

const slice = createSlice({
  name: 'notifications',
  initialState: { items: [], unread: 0 },
  reducers: {
    addNotification(state, action) {
      state.items.unshift(action.payload);
      state.unread += 1;
    },
  },
  extraReducers: (b) => {
    b.addCase(fetchNotificationsThunk.fulfilled, (s, a) => { s.items = a.payload; })
      .addCase(fetchUnreadCountThunk.fulfilled, (s, a) => { s.unread = a.payload; })
      .addCase(readAllThunk.fulfilled, (s) => {
        s.items = s.items.map((n) => ({ ...n, isRead: true }));
        s.unread = 0;
      });
  },
});

export const { addNotification } = slice.actions;
export default slice.reducer;
