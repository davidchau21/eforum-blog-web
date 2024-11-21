import globalReducer from "@/redux/globalSlice";
import { configureStore } from "@reduxjs/toolkit";

export const store = configureStore({
  reducer: {
    global: globalReducer,
  },
});
