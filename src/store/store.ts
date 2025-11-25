import { configureStore } from '@reduxjs/toolkit';
import scannersReducer from './slices/scannerSlice';
import metadataReducer from "./slices/metadataSlice";
import qaReducer from './slices/qaSlice';
import ehToolsReducer from "./slices/ehToolsSlice";
import authReducer from "./slices/authSlice";
import healthReducer from './slices/healthSlice';

// Configure the Redux store with all slices

export const store = configureStore({
  reducer: {
    scanners: scannersReducer,
    metadata: metadataReducer,
    qa: qaReducer,
    ehTools: ehToolsReducer,
    auth: authReducer,
    health: healthReducer,
  },
});

// Types for use in hooks
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
