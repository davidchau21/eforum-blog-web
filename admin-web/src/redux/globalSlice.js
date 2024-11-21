import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  loading: 0,
  accessToken: undefined,
  profile: undefined,
};

export const globalSlice = createSlice({
  name: "global",
  initialState,
  reducers: {
    incrementLoading: (state) => {
      state.loading += 1;
    },
    decrementLoading: (state) => {
      if (state.loading) {
        state.loading -= 1;
      }
    },
    setAccessToken: (state, action) => {
      state.accessToken = action.payload;
    },
    setProfile: (state, action) => {
      state.profile = action.payload;
    },
  },
});

export const {
  incrementLoading,
  decrementLoading,
  setAccessToken,
  setProfile,
} = globalSlice.actions;

export default globalSlice.reducer;
