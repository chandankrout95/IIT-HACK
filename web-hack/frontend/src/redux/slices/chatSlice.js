import { createSlice } from "@reduxjs/toolkit";

const chatSlice = createSlice({
  name: "chat",
  initialState: {
    messages: [],
    onlineUsers: 0,
  },
  reducers: {
    // Replace entire chat history
    setChatHistory: (state, action) => {
      state.messages = action.payload;
    },

    // Add a single new message
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },

    updateMessage: (state, action) => {
      const index = state.messages.findIndex(
        (msg) => msg._id === action.payload._id,
      );
      if (index !== -1) state.messages[index] = action.payload;
    },

    // Remove a message (for deletion)
    removeMessage: (state, action) => {
      state.messages = state.messages.filter(
        (msg) => msg._id !== action.payload,
      );
    },

    // Update online users count
    setOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload;
    },
  },
});

export const {
  setChatHistory,
  addMessage,
  updateMessage,
  removeMessage,
  setOnlineUsers,
} = chatSlice.actions;
export default chatSlice.reducer;
