import { createSlice } from "@reduxjs/toolkit";

const asteroidSlice = createSlice({
  name: "asteroid",
  initialState: {
    watchlist: [],
  },
  reducers: {
    setWatchlist: (state, action) => {
      state.watchlist = action.payload;
    },
    addToWatchlist: (state, action) => {
      const exists = state.watchlist.find(
        (a) => a.neoReferenceId === action.payload.neoReferenceId
      );
      if (!exists) {
        state.watchlist.unshift(action.payload); // Adds new items to the top
      }
    },
    removeFromWatchlist: (state, action) => {
      state.watchlist = state.watchlist.filter(
        (a) => a.neoReferenceId !== action.payload
      );
    },
  },
});

export const { setWatchlist, addToWatchlist, removeFromWatchlist } = asteroidSlice.actions;
export default asteroidSlice.reducer;