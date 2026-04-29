import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import resumeReducer from "./resumeSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    resume: resumeReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
