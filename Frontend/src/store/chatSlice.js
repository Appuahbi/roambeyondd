import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { chatApi } from '../api/endpoints';

export const sendMessageThunk = createAsyncThunk(
  'chat/send',
  async (text, { getState, rejectWithValue }) => {
    const history = getState().chat.messages
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .slice(-14)
      .map((m) => ({ role: m.role, content: m.content }));

    try {
      const res = await chatApi.send([...history, { role: 'user', content: text }]);
      return { reply: res.data?.message || '' };
    } catch (e) {
      return rejectWithValue(e.message || 'Something went wrong.');
    }
  }
);

const initialState = {
  open: false,
  messages: [],
  sending: false,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    toggleChat(state) {
      state.open = !state.open;
    },
    closeChat(state) {
      state.open = false;
    },
    clearChat(state) {
      state.messages = [];
    },
    addUserMessage(state, action) {
      state.messages.push({ role: 'user', content: action.payload });
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendMessageThunk.pending, (s) => { s.sending = true; })
      .addCase(sendMessageThunk.fulfilled, (s, a) => {
        s.sending = false;
        if (a.payload?.reply) {
          s.messages.push({ role: 'assistant', content: a.payload.reply });
        } else {
          s.messages.push({ role: 'error', content: 'No response received. Please try again.' });
        }
      })
      .addCase(sendMessageThunk.rejected, (s, a) => {
        s.sending = false;
        s.messages.push({ role: 'error', content: a.payload || 'Something went wrong.' });
      });
  },
});

export const { toggleChat, closeChat, clearChat, addUserMessage } = chatSlice.actions;
export default chatSlice.reducer;
