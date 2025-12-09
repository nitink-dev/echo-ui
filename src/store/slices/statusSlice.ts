import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { statusService } from '../../api/services/statusService';

export const fetchCompletedScans = createAsyncThunk(
  'status/fetchCompleted',
  async ({ page, size }: { page: number; size: number }, { rejectWithValue }) => {
    try {
      const res = await statusService.fetchCompletedScans(page, size);
      console.log('Completed scans response:', res);
      return res;
    } catch (err: any) {
      console.error('Completed scans fetch error:', err);
      return rejectWithValue(err.response?.data || 'Fetch failed');
    }
  }
);

export const fetchFailedScans = createAsyncThunk(
  'status/fetchFailed',
  async ({ page, size }: { page: number; size: number }, { rejectWithValue }) => {
    try {
      const res = await statusService.fetchFailedScans(page, size);
      console.log('Failed scans response:', res);
      return res;
    } catch (err: any) {
      console.error('Failed scans fetch error:', err);
      return rejectWithValue(err.response?.data || 'Fetch failed');
    }
  }
);

export const fetchInProgressScans = createAsyncThunk(
  'status/fetchInProgress',
  async ({ page, size }: { page: number; size: number }, { rejectWithValue }) => {
    try {
      const res = await statusService.fetchInProgressScans(page, size);
      console.log('In-progress scans response:', res);
      return res;
    } catch (err: any) {
      console.error('In-progress scans fetch error:', err);
      return rejectWithValue(err.response?.data || 'Fetch failed');
    }
  }
);

interface ScanRecord {
  id: string;
  caseNumber: string;
  slideBarcode: string;
  deviceSerialNumber: string;
  scanStatus: 'completed' | 'failed' | 'in-progress';
  progressPercent: number | null;
  createdAt: string;
  updatedAt: string;
}

interface PaginatedResponse {
  content: ScanRecord[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

interface StatusState {
  completed: PaginatedResponse | null;
  failed: PaginatedResponse | null;
  inProgress: PaginatedResponse | null;
  loading: {
    completed: boolean;
    failed: boolean;
    inProgress: boolean;
  };
  error: {
    completed?: string;
    failed?: string;
    inProgress?: string;
  };
  lastFetched: {
    completed: number | null;
    failed: number | null;
    inProgress: number | null;
  };
}

const initialState: StatusState = {
  completed: null,
  failed: null,
  inProgress: null,
  loading: {
    completed: false,
    failed: false,
    inProgress: false,
  },
  error: {},
  lastFetched: {
    completed: null,
    failed: null,
    inProgress: null,
  },
};

const statusSlice = createSlice({
  name: 'status',
  initialState,
  reducers: {
    clearStatusData: (state) => {
      state.completed = null;
      state.failed = null;
      state.inProgress = null;
      state.error = {};
    },
  },
  extraReducers: (builder) => {
    // Completed scans
    builder
      .addCase(fetchCompletedScans.pending, (state) => {
        state.loading.completed = true;
        state.error.completed = undefined;
      })
      .addCase(fetchCompletedScans.fulfilled, (state, action) => {
        state.completed = action.payload;
        state.lastFetched.completed = Date.now();
        state.loading.completed = false;
      })
      .addCase(fetchCompletedScans.rejected, (state, action) => {
        state.error.completed = action.payload as string || action.error.message;
        state.loading.completed = false;
      });

    // Failed scans
    builder
      .addCase(fetchFailedScans.pending, (state) => {
        state.loading.failed = true;
        state.error.failed = undefined;
      })
      .addCase(fetchFailedScans.fulfilled, (state, action) => {
        state.failed = action.payload;
        state.lastFetched.failed = Date.now();
        state.loading.failed = false;
      })
      .addCase(fetchFailedScans.rejected, (state, action) => {
        state.error.failed = action.payload as string || action.error.message;
        state.loading.failed = false;
      });

    // In-progress scans
    builder
      .addCase(fetchInProgressScans.pending, (state) => {
        state.loading.inProgress = true;
        state.error.inProgress = undefined;
      })
      .addCase(fetchInProgressScans.fulfilled, (state, action) => {
        state.inProgress = action.payload;
        state.lastFetched.inProgress = Date.now();
        state.loading.inProgress = false;
      })
      .addCase(fetchInProgressScans.rejected, (state, action) => {
        state.error.inProgress = action.payload as string || action.error.message;
        state.loading.inProgress = false;
      });
  },
});

export const { clearStatusData } = statusSlice.actions;
export default statusSlice.reducer;