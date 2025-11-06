import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { SlideScanner } from '../types/slideScanner';

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

//
// ✅ Async Thunks
//

// Fetch all scanners
export const fetchScanners = createAsyncThunk<SlideScanner[]>(
  'scanners/fetchScanners',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/scanners');
      console.log('Fetched scanners:', response.data);
      if (!Array.isArray(response.data)) throw new Error("Invalid API response: Expected array");
      return response.data;
    } catch (err: any) {
      console.error("Fetch scanners failed:", err);
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch scanners');
    }
  }
);

// Add new scanner
export const addScanner = createAsyncThunk<SlideScanner, Omit<SlideScanner, 'id'>>(
  'scanners/addScanner',
  async (scanner, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/scanners', scanner);
      return response.data;
    } catch (err: any) {
      console.error("Add scanner failed:", err);
      return rejectWithValue(err.response?.data?.message || 'Failed to add scanner');
    }
  }
);

// Update existing scanner
export const updateScanner = createAsyncThunk<SlideScanner, SlideScanner>(
  'scanners/updateScanner',
  async (scanner, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/api/scanners/${scanner.deviceSerialNumber}`, scanner);
      return response.data;
    } catch (err: any) {
      console.error("Update scanner failed:", err);
      return rejectWithValue(err.response?.data?.message || 'Failed to update scanner');
    }
  }
);

// Delete a scanner
export const deleteScanner = createAsyncThunk<string, string>(
  'scanners/deleteScanner',
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`/api/scanners/${id}`);
      return id;
    } catch (err: any) {
      console.error("Delete scanner failed:", err);
      return rejectWithValue(err.response?.data?.message || 'Failed to delete scanner');
    }
  }
);

//
// 🧩 Slice
//
const scannerSlice = createSlice({
  name: 'scanners',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch
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
        state.error = action.payload as string;
        console.error("❌ Fetch scanners failed:", action.payload);
      })

      // Add
      .addCase(addScanner.fulfilled, (state, action: PayloadAction<SlideScanner>) => {
        console.log("➕ Scanner added:", action.payload);
        state.items.push(action.payload);
      })

      // Update
      .addCase(updateScanner.fulfilled, (state, action: PayloadAction<SlideScanner>) => {
        const index = state.items.findIndex(s => s.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
          console.log("✏️ Scanner updated:", action.payload);
        }
      })

      // Delete
      .addCase(deleteScanner.fulfilled, (state, action: PayloadAction<string>) => {
        state.items = state.items.filter(scanner => scanner.id !== action.payload);
        console.log("🗑️ Scanner deleted:", action.payload);
      });
  },
});

export default scannerSlice.reducer;
