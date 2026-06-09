import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import apiClient from '../../api/services/apiClient';
import { SlideScanner } from '../../types';
import { scannerService } from '../../api/services/scannerService';
import { BASE_URL } from '../../utils/constants';

interface ScannerState {
  items: SlideScanner[];
  loading: boolean;
  error: string | null;
}

const initialState: ScannerState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchScanners = createAsyncThunk<SlideScanner[]>(
  'scanners/fetchScanners',
  async (_, { rejectWithValue }) => {
    try {
      const response = await scannerService.fetchAll();
      console.log('Fetched scanners:', response);
      if (!Array.isArray(response)) throw new Error("Invalid API response: Expected array");
      return response;
    } catch (err: any) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
      return rejectWithValue(errorMessage);
    }
  }
);

export const addScanner = createAsyncThunk<SlideScanner, Omit<SlideScanner, 'id'>>(
  'scanners/addScanner',
  async (scanner, { rejectWithValue }) => {
    try {
      const response = await scannerService.create(scanner); 
      return response;
    } catch (err: any) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
      return rejectWithValue(errorMessage);
    }
  }
);

export const updateScanner = createAsyncThunk<SlideScanner, Partial<SlideScanner> & { deviceSerialNumber: string }>(
  'scanners/updateScanner',
  async (scannerUpdate, { rejectWithValue }) => {
    try {
      const { deviceSerialNumber, ...updateFields } = scannerUpdate;
      
      const response = await apiClient.patch(
        BASE_URL + `/api/scanners/${deviceSerialNumber}`,
        updateFields
      );
      
      return response.data;
    } catch (err: any) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
      return rejectWithValue(errorMessage);
    }
  }
);

export const deleteScanner = createAsyncThunk<string, string>(
  'scanners/deleteScanner',
  async (serialNumber, { rejectWithValue }) => {
    try {
      await scannerService.delete(serialNumber);
      return serialNumber; 
    } catch (err: any) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
      return rejectWithValue(errorMessage);
    }
  }
);

export const checkScannerExists = createAsyncThunk<boolean, string>(
  'scanners/checkExists',
  async (serialNumber, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(BASE_URL + `/api/scanners/${serialNumber}`);
      return !!response.data; 
    } catch (err: any) {
      if (err.response?.status === 404) {
        return false;
      }
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
      return rejectWithValue(errorMessage);
    }
  }
);

const scannerSlice = createSlice({
  name: 'scanners',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchScanners.pending, (state) => {
        state.loading = true;
        state.error = null;
        console.log("🔄 Fetching scanners...");
      })
      .addCase(fetchScanners.fulfilled, (state, action: PayloadAction<SlideScanner[]>) => {
        console.log("✅ Scanners fetched:", action.payload);
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchScanners.rejected, (state, action) => {
        state.loading = false;
        state.items = [];
        state.error = action.payload as string;
      })

      .addCase(addScanner.fulfilled, (state, action: PayloadAction<SlideScanner>) => {
        console.log("➕ Scanner added:", action.payload);
        state.items.push(action.payload);
      })

      .addCase(updateScanner.fulfilled, (state, action: PayloadAction<SlideScanner>) => {
        const index = state.items.findIndex(
          (s) => s.deviceSerialNumber === action.payload.deviceSerialNumber
        );
        if (index !== -1) {
          state.items[index] = action.payload;
          console.log("✏️ Scanner updated (PATCH):", action.payload);
        }
      })

      .addCase(deleteScanner.fulfilled, (state, action: PayloadAction<string>) => {
        const deletedSerial = action.payload;
        state.items = state.items.filter(
          (scanner) => scanner.deviceSerialNumber !== deletedSerial
        );
        console.log("🗑️ Scanner deleted:", deletedSerial);
      });
  },
});

export default scannerSlice.reducer;