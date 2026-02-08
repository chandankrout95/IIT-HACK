import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  asteroids: [],
  watchlist: [],
  selectedDate: new Date().toISOString().split('T')[0],
  loading: false,
  error: null,
};

const asteroidSlice = createSlice({
  name: 'nasa',
  initialState,
  reducers: {
    setAsteroids: (state, action) => {
      state.asteroids = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setTargetDate: (state, action) => {
      state.selectedDate = action.payload;
    },
    addToWatchlist: (state, action) => {
      // Check if already in watchlist to prevent duplicates
      const exists = state.watchlist.find(a => a.id === action.payload.id);
      if (!exists) {
        state.watchlist.push(action.payload);
      }
    },
    removeFromWatchlist: (state, action) => {
      state.watchlist = state.watchlist.filter(a => a.id !== action.payload);
    },
  },
});

export const { 
  setAsteroids, 
  setLoading, 
  setTargetDate, 
  addToWatchlist, 
  removeFromWatchlist 
} = asteroidSlice.actions;

export default asteroidSlice.reducer;