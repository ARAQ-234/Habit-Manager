import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchHabits = createAsyncThunk('habits/fetch', async () => {
  const res = await api.get('/habits');
  return res.data;
});

export const createHabit = createAsyncThunk('habits/create', async (habitData) => {
  const res = await api.post('/habits', habitData);
  return res.data;
});

export const updateHabit = createAsyncThunk('habits/update', async ({ id, ...habitData }) => {
  const res = await api.put(`/habits/${id}`, habitData);
  return res.data;
});

export const archiveHabit = createAsyncThunk('habits/archive', async (id) => {
  const res = await api.patch(`/habits/${id}/archive`);
  return res.data;
});

export const restoreHabit = createAsyncThunk('habits/restore', async (id) => {
  const res = await api.patch(`/habits/${id}/restore`);
  return res.data;
});

export const deleteHabit = createAsyncThunk('habits/delete', async (id) => {
  await api.delete(`/habits/${id}`);
  return id;
});

const habitSlice = createSlice({
  name: 'habits',
  initialState: { list: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase('auth/logout', () => ({ list: [], loading: false, error: null }))
      .addCase(fetchHabits.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHabits.fulfilled, (state, action) => {
        state.list = action.payload;
        state.loading = false;
      })
      .addCase(fetchHabits.rejected, (state) => {
        state.loading = false;
        state.error = 'Could not load habits.';
      })
      .addCase(createHabit.fulfilled, (state, action) => {
        state.list.push(action.payload);
      })
      .addCase(updateHabit.fulfilled, (state, action) => {
        state.list = state.list.map((habit) => habit.id === action.payload.id ? action.payload : habit);
      })
      .addCase(archiveHabit.fulfilled, (state, action) => {
        state.list = state.list.filter((habit) => habit.id !== action.payload.id);
      })
      .addCase(restoreHabit.fulfilled, (state, action) => {
        state.list.push(action.payload);
      })
      .addCase(deleteHabit.fulfilled, (state, action) => {
        state.list = state.list.filter(h => h.id !== action.payload);
      });
  },
});

export default habitSlice.reducer;
