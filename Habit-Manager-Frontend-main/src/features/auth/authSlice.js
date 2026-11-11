import { createSlice } from '@reduxjs/toolkit';

const readStoredUser = () => {
  try {
    return JSON.parse(sessionStorage.getItem('user')) || null;
  } catch {
    sessionStorage.removeItem('user');
    return null;
  }
};

const storedToken = sessionStorage.getItem('token');
const initialState = {
  user: readStoredUser(),
  token: storedToken,
  isAuthenticated: Boolean(storedToken),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      sessionStorage.setItem('user', JSON.stringify(action.payload.user));
      sessionStorage.setItem('token', action.payload.token);
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('token');
    },
    updateAccount: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      sessionStorage.setItem('user', JSON.stringify(state.user));
    },
  },
});

export const { loginSuccess, logout, updateAccount } = authSlice.actions;
export default authSlice.reducer;
