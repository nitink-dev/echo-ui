import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";



// --- Async Thunks --------------------------------------------------

// GET Tool Config
export const fetchEhTool = createAsyncThunk<
  { toolKey: string; data: any },
  { toolKey: string },
  { rejectValue: string }
>("ehTools/fetchEhTool", async ({ toolKey }, { rejectWithValue }) => {
  try {
    const res = await axios.get(`/api/enrichment/tools/${toolKey}`);
    return { toolKey, data: res.data[toolKey] || res.data };
  } catch (err: any) {
    return rejectWithValue(err.response?.data || err.message);
  }
});

// PATCH Tool Config (partial update)
export const patchEhTool = createAsyncThunk<
  { toolKey: string; data: any },
  { toolKey: string; body: any },
  { rejectValue: string }
>("ehTools/patchEhTool", async ({ toolKey, body }, { rejectWithValue }) => {
  try {
    const res = await axios.patch(`/api/enrichment/tools/${toolKey}`, body);
    return { toolKey, data: res.data[toolKey] || res.data };
  } catch (err: any) {
    return rejectWithValue(err.response?.data || err.message);
  }
});

const initialState: EhToolsState = {
  dicomReceiver: null,
  lisConnector: null,
  loading: false,
  error: null,
};

const ehToolsSlice = createSlice({
  name: "ehTools",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // FETCH
    builder.addCase(fetchEhTool.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchEhTool.fulfilled, (state, action: PayloadAction<{ toolKey: string; data: any }>) => {
      state.loading = false;
      const { toolKey, data } = action.payload;
      if (toolKey === "eh-dicom-receiver") state.dicomReceiver = data;
      else if (toolKey === "eh-lis-connector") state.lisConnector = data;
    });
    builder.addCase(fetchEhTool.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // PATCH
    builder.addCase(patchEhTool.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(patchEhTool.fulfilled, (state, action: PayloadAction<{ toolKey: string; data: any }>) => {
      state.loading = false;
      const { toolKey, data } = action.payload;
      if (toolKey === "eh-dicom-receiver") state.dicomReceiver = data;
      else if (toolKey === "eh-lis-connector") state.lisConnector = data;
    });
    builder.addCase(patchEhTool.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export default ehToolsSlice.reducer;
