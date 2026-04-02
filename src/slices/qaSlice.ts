import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { BASE_URL } from "../util/util";
import apiClient from "../api/services/apiClient";

export interface QASlideParameter {
  id: string;
  barcode: string;
  activationCode: string;
  dicomWebUrl?: string;
}

interface QAState {
  qaParameters: QASlideParameter[];
  dicomStoreAddress: string;
  dicomStores: string[];
  loading: boolean;
  error: string | null;
}

const initialState: QAState = {
  qaParameters: [],
  dicomStoreAddress: "",
  dicomStores: [],
  loading: false,
  error: null,
};

// --- Async Thunks ---

export const fetchQAParameters = createAsyncThunk<
  { slides: QASlideParameter[]; dicomUrl: string }
>("qa/fetchQAParameters", async (_, { rejectWithValue }) => {
  try {
    const res = await apiClient.get(`${BASE_URL}/api/slides`);
    const data = res.data;

    console.log("📥 API /api/slides response:", data);

    // ✅ Case 1: { dicomUrl, qaSlides: [...] }
    if (data?.qaSlides && data?.dicomUrl) {
      const slides = data.qaSlides.map((slide: any) => ({
        ...slide,
        dicomWebUrl: data.dicomUrl,
      }));
      return { slides, dicomUrl: data.dicomUrl };
    }

    // ✅ Case 2: API returns only an array
    if (Array.isArray(data)) {
      return { slides: data, dicomUrl: "" };
    }

    // ✅ Fallback
    return { slides: [], dicomUrl: "" };
  } catch (err: any) {
    console.error("❌ Fetch QA parameters failed:", err);
    return rejectWithValue(
      err.response?.data?.message || "Failed to fetch QA parameters"
    );
  }
});

export const fetchDicomStores = createAsyncThunk(
  "qa/fetchDicomStores",
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiClient.get(`${BASE_URL}/api/scanners/datasets/dicomStores`);
      const data = await res.data;
      const allStores: string[] = Object.values(data).flat();
      return allStores;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateDicomStore = createAsyncThunk(
  "qa/updateDicomStore",
  async (dicomStoreAddress: string, { rejectWithValue }) => {
    try {
      const payload = { "gcp-config.pathqa-store-url": dicomStoreAddress.trim() };
      await apiClient.patch(`${BASE_URL}/api/config/path-qa/dicom-store`, payload);
      return dicomStoreAddress;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const addQAParameter = createAsyncThunk(
  "qa/addQAParameter",
  async (
    payload: { barcode: string; activationCode: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await apiClient.post(`${BASE_URL}/api/slides`, payload);
      return {
        id: res.data.id,
        barcode: res.data.barcode,
        activationCode: res.data.activationCode,
        dicomWebUrl: res.data.dicomWebUrl,
      } as QASlideParameter;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateQAParameter = createAsyncThunk(
  "qa/updateQAParameter",
  async (
    payload: { barcode: string; activationCode: string },
    { rejectWithValue }
  ) => {
    try {
      await apiClient.put(`${BASE_URL}/api/slides/${payload.barcode}`, payload);
      return payload;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const deleteQAParameter = createAsyncThunk(
  "qa/deleteQAParameter",
  async (barcode: string, { rejectWithValue }) => {
    try {
      await apiClient.delete(`${BASE_URL}/api/slides/${barcode}`);
      return barcode;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

// --- Slice ---
const qaSlice = createSlice({
  name: "qa",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch QA Parameters
      .addCase(fetchQAParameters.pending, (state) => {
        state.loading = true;
      })
      .addCase(
        fetchQAParameters.fulfilled,
        (state, action: PayloadAction<{ slides: QASlideParameter[]; dicomUrl: string }>) => {
          state.loading = false;
          state.qaParameters = action.payload.slides;
          state.dicomStoreAddress = action.payload.dicomUrl;
        }
      )
      .addCase(fetchQAParameters.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch DICOM Stores
      .addCase(fetchDicomStores.fulfilled, (state, action) => {
        state.dicomStores = action.payload;
      })

      // Update DICOM Store
      .addCase(updateDicomStore.fulfilled, (state, action) => {
        state.dicomStoreAddress = action.payload;
      })

      // Add
      .addCase(addQAParameter.fulfilled, (state, action) => {
        state.qaParameters.push(action.payload);
      })

      // Update
      .addCase(updateQAParameter.fulfilled, (state, action) => {
        const index = state.qaParameters.findIndex(
          (q) => q.barcode === action.payload.barcode
        );
        if (index >= 0) {
          state.qaParameters[index].activationCode = action.payload.activationCode;
        }
      })

      // Delete
      .addCase(deleteQAParameter.fulfilled, (state, action) => {
        state.qaParameters = state.qaParameters.filter(
          (q) => q.barcode !== action.payload
        );
      });
  },
});

export default qaSlice.reducer;
