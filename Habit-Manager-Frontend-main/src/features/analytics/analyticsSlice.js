import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  streaks: {},
  weekly: {},
};

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    setStreak: (state, action) => {
      const { habitId, streak } = action.payload;
      state.streaks[habitId] = streak;
    },
    setStreaks: (state, action) => {
      state.streaks = action.payload;
    },
    setWeeklyAnalytics: (state, action) => {
      const { habitId, data } = action.payload;
      state.weekly[habitId] = data;
    },
  },
  extraReducers: (builder) => {
    builder.addCase('auth/logout', () => initialState);
  },
});

export const { setStreak, setStreaks, setWeeklyAnalytics } = analyticsSlice.actions;
export default analyticsSlice.reducer;
