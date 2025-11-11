import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { BASE_URL } from '../util/util';


export const fetchHospitalMetadata = createAsyncThunk(
  'metadata/fetchHospitalMetadata',
  async () => {
    const res = await fetch(`${BASE_URL}/api/hospital-metadata`);
    return res.json();
  }
);

export const fetchDicomStores = createAsyncThunk(
  'metadata/fetchDicomStores',
  async () => {
    const res = await fetch(`${BASE_URL}/api/scanners/datasets/dicomStores`);
    return res.json();
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
        state.hospitals = action.payload.locations || [];
        state.locations = action.payload.names || [];
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
