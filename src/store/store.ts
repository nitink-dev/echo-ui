import { configureStore } from '@reduxjs/toolkit';
import scannersReducer from './slices/scannerSlice';
import metadataReducer from "./slices/metadataSlice";
import qaReducer from './slices/qaSlice';
import ehToolsReducer from "./slices/ehToolsSlice";



export const store = configureStore({
  reducer: {
    scanners: scannersReducer,
    metadata: metadataReducer,
    qa: qaReducer,
    ehTools: ehToolsReducer,
  },
});

// Types for use in hooks
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
