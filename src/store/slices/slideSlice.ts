// store/slideSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { slideService, PaginatedResponse, SlideRecord } from '../../api/services/slideService';

interface FilterState {
  barcode: string;
  deviceId: string;
}

interface SlideState {
  completed: PaginatedResponse | null;
  failed: PaginatedResponse | null;
  inProgress: PaginatedResponse | null;
  loading: {
    completed: boolean;
    failed: boolean;
    inProgress: boolean;
  };
  error: {
    completed: string | null;
    failed: string | null;
    inProgress: string | null;
  };
  lastFetched: {
    completed: number | null;
    failed: number | null;
    inProgress: number | null;
  };
  filters: FilterState;
  barcodes: string[];
  deviceIds: string[];
  barcodesLoading: boolean;
  deviceIdsLoading: boolean;
}

const initialState: SlideState = {
  completed: null,
  failed: null,
  inProgress: null,
  loading: {
    completed: false,
    failed: false,
    inProgress: false,
  },
  error: {
    completed: null,
    failed: null,
    inProgress: null,
  },
  lastFetched: {
    completed: null,
    failed: null,
    inProgress: null,
  },
  filters: {
    barcode: '',
    deviceId: '',
  },
  barcodes: [],
  deviceIds: [],
  barcodesLoading: false,
  deviceIdsLoading: false,
};

// Async thunks
export const fetchScanStatus = createAsyncThunk(
  'slides/fetchScanStatus',
  async (
    {
      status,
      page,
      size,
      filters,
    }: {
      status: 'completed' | 'failed' | 'inProgress';
      page: number;
      size: number;
      filters?: { barcode?: string; deviceId?: string };
    },
    { rejectWithValue }
  ) => {
    try {
      const data = await slideService.fetchScanStatus(status, page, size, filters);
      return { status, data };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchBarcodes = createAsyncThunk(
  'slides/fetchBarcodes',
  async (_, { rejectWithValue }) => {
    try {
      return await slideService.fetchAllBarcodes();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// export const fetchDeviceIds = createAsyncThunk(
//   'slides/fetchDeviceIds',
//   async (_, { rejectWithValue }) => {
//     try {
//       return await slideService.fetchAllDeviceIds();
//     } catch (error: any) {
//       return rejectWithValue(error.message);
//     }
//   }
// );

const slideSlice = createSlice({
  name: 'slides',
  initialState,
  reducers: {
    setFilter: (state, action: PayloadAction<Partial<FilterState>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = { barcode: '', deviceId: '' };
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch scan status
      .addCase(fetchScanStatus.pending, (state, action) => {
        const status = action.meta.arg.status;
        state.loading[status] = true;
        state.error[status] = null;
      })
      .addCase(fetchScanStatus.fulfilled, (state, action) => {
        const { status, data } = action.payload;
        state[status] = data;
        state.loading[status] = false;
        state.lastFetched[status] = Date.now();
      })
      .addCase(fetchScanStatus.rejected, (state, action) => {
        const status = action.meta.arg.status;
        state.loading[status] = false;
        state.error[status] = action.payload as string;
      })
      // Fetch barcodes
      .addCase(fetchBarcodes.pending, (state) => {
        state.barcodesLoading = true;
      })
      .addCase(fetchBarcodes.fulfilled, (state, action) => {
        state.barcodes = action.payload;
        state.barcodesLoading = false;
      })
      .addCase(fetchBarcodes.rejected, (state) => {
        state.barcodesLoading = false;
      })
      // Fetch device IDs
      .addCase(fetchDeviceIds.pending, (state) => {
        state.deviceIdsLoading = true;
      })
      .addCase(fetchDeviceIds.fulfilled, (state, action) => {
        state.deviceIds = action.payload;
        state.deviceIdsLoading = false;
      })
      .addCase(fetchDeviceIds.rejected, (state) => {
        state.deviceIdsLoading = false;
      });
  },
});

export const { setFilter, clearFilters } = slideSlice.actions;
export default slideSlice.reducer;