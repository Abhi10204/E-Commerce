// src/redux/authSlice.js
import { createSlice } from '@reduxjs/toolkit';

const userData = JSON.parse(localStorage.getItem('user')) || null;
const token = localStorage.getItem('authToken') || null;

const initialState = {
  user: userData,
  token: token,
  isAuthenticated: !!token,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login(state, action) {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      localStorage.setItem('authToken', action.payload.token);
      localStorage.setItem('user', JSON.stringify(action.payload.user));
    },
    logout(state) {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    },
    updateUser(state, action) {
      // Merge updated fields into current user
      state.user = {
        ...state.user,
        ...action.payload,
      };
      localStorage.setItem('user', JSON.stringify(state.user));
    },
  },
});

export const { login, logout, updateUser } = authSlice.actions;
export default authSlice.reducer;
