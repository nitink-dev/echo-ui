import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { metadataService } from '../../api/services/metadataService';
import { BASE_URL } from '../../utils/constants';


export const fetchHospitalMetadata = createAsyncThunk(
  "metadata/fetchHospitalMetadata",
  async (_, { rejectWithValue }) => {
    try {
      const res = await metadataService.fetchHospitalMetadata();
      console.log("Hospital metadata response:", res);
      return res;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
      return rejectWithValue(errorMessage);
    }
  }
);


export const fetchDicomStores = createAsyncThunk(
  'metadata/fetchDicomStores',
  async () => {
    const res = await metadataService.fetchDicomStores();
    return res;
  }
);

interface MetadataState {
  hospitals: string[];
  locations: string[];
  departments: string[];
  dicomStores: Record<string, string[]>;
  loading: boolean;
  error?: string;
}

const initialState: MetadataState = {
  hospitals: [],
  locations: [],
  departments: [],
  dicomStores: {},
  loading: false,
};

const metadataSlice = createSlice({
  name: 'metadata',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchHospitalMetadata.pending, (state) => { state.loading = true; })
      .addCase(fetchHospitalMetadata.fulfilled, (state, action) => {
        console.log("Fetched hospital metadata:", action.payload);
        state.hospitals = action.payload.names || [];
        state.locations = action.payload.locations || [];
        state.loading = false;
      })
      .addCase(fetchHospitalMetadata.rejected, (state, action) => {
        state.error = action.error.message;
        state.loading = false;
      })
      .addCase(fetchDicomStores.pending, (state) => { state.loading = true; })
      .addCase(fetchDicomStores.fulfilled, (state, action) => {
        state.departments = Object.keys(action.payload);
        state.dicomStores = action.payload;
        state.loading = false;
      })
      .addCase(fetchDicomStores.rejected, (state, action) => {
        state.error = action.error.message;
        state.loading = false;
      });
  },
});

export default metadataSlice.reducer;
