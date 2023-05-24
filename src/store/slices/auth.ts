import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  username: "Guest",
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    updateUsername: (state, action) => {
      state.username = action.payload || initialState.username;
    },
  },
});

export const { updateUsername } = authSlice.actions;

export const selectUsername = (state: { auth: { username: string } }) =>
  state.auth.username;

export const authReducer = authSlice.reducer;
