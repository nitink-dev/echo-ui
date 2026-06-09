import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { healthService } from '../../api/services/healthService';

export const fetchHealthStatus = createAsyncThunk(
  'health/fetchHealthStatus',
  async (_, { rejectWithValue }) => {
    try {
      const res = await healthService.fetchHealthStatus();
      console.log('Health status response:', res);
      return res;
    } catch (err: any) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
      return rejectWithValue(errorMessage);
    }
  }
);

interface ServiceHealth {
  name: string;
  url: string;
  status: 'UP' | 'DOWN';
  httpStatus: number | null;
  latencyMs: number;
  error: string | null;
}

interface Dependencies {
  kafka: 'UP' | 'DOWN';
  mongodb: 'UP' | 'DOWN';
  redis: 'UP' | 'DOWN';
}

interface HealthState {
  thirdParties: ServiceHealth[];
  microservices: ServiceHealth[];
  dependencies: Dependencies | null;
  timestamp: string | null;
  loading: boolean;
  error?: string;
  lastFetched: number | null;
}

const initialState: HealthState = {
  thirdParties: [],
  microservices: [],
  dependencies: null,
  timestamp: null,
  loading: false,
  lastFetched: null,
};

const healthSlice = createSlice({
  name: 'health',
  initialState,
  reducers: {
    clearHealthData: (state) => {
      state.thirdParties = [];
      state.microservices = [];
      state.dependencies = null;
      state.timestamp = null;
      state.error = undefined;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHealthStatus.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(fetchHealthStatus.fulfilled, (state, action) => {
        console.log('Fetched health status:', action.payload);
      
        const blockList = ['Database Service', 'Delete Service'];
      
        state.thirdParties = (action.payload.thirdParties || []).filter(
          (svc: ServiceHealth) => !blockList.includes(svc.name)
        );
      
        state.microservices = (action.payload.microservices || []).filter(
          (svc: ServiceHealth) => !blockList.includes(svc.name)
        );
      
        state.dependencies = action.payload.dependencies || null;
        state.timestamp = action.payload.timestamp || null;
        state.lastFetched = Date.now();
        state.loading = false;
      })
      
      .addCase(fetchHealthStatus.rejected, (state, action) => {
        state.error = action.payload as string || action.error.message;
        state.loading = false;
      });
  },
});

export const { clearHealthData } = healthSlice.actions;
export default healthSlice.reducer;