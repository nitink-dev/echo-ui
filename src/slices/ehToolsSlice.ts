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
    // normalize structure: unwrap { data: {...} } or { [toolKey]: {...} }
    const data = res.data?.data || res.data?.[toolKey] || res.data;
    return { toolKey, data };
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
    const data = res.data?.data || res.data?.[toolKey] || res.data;
    return { toolKey, data };
  } catch (err: any) {
    return rejectWithValue(err.response?.data || err.message);
  }
});

// --- State ----------------------------------------------------------
interface EhToolsState {
  dicomReceiver: any;
  lisConnector: any;
  enrichmentService: any;
  exportService: any;
  hl7Connector: any;
  emailService: any;
  loading: boolean;
  error: string | null;
}

const initialState: EhToolsState = {
  dicomReceiver: null,
  lisConnector: null,
  enrichmentService: null,
  exportService: null,
  hl7Connector: null,
  emailService: null,
  loading: false,
  error: null,
};

// --- Slice ----------------------------------------------------------
const ehToolsSlice = createSlice({
  name: "ehTools",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // ===== FETCH =====
    builder.addCase(fetchEhTool.pending, (state) => {
      state.loading = true;
      state.error = null;
    });

    builder.addCase(
      fetchEhTool.fulfilled,
      (state, action: PayloadAction<{ toolKey: string; data: any }>) => {
        state.loading = false;
        const { toolKey, data } = action.payload;

        if (toolKey === "eh-dicom-receiver") state.dicomReceiver = data;
        else if (toolKey === "eh-lis-connector") state.lisConnector = data;
        else if (toolKey === "eh-enrichment-service") state.enrichmentService = data;
        else if (toolKey === "eh-export-service") state.exportService = data;
        else if (toolKey === "eh-hl7-connector") state.hl7Connector = data;
        else if (toolKey === "eh-email-service") state.emailService = data;
      }
    );

    builder.addCase(fetchEhTool.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // ===== PATCH =====
    builder.addCase(patchEhTool.pending, (state) => {
      state.loading = true;
      state.error = null;
    });

    builder.addCase(
      patchEhTool.fulfilled,
      (state, action: PayloadAction<{ toolKey: string; data: any }>) => {
        state.loading = false;
        const { toolKey, data } = action.payload;

        if (toolKey === "eh-dicom-receiver") state.dicomReceiver = data;
        else if (toolKey === "eh-lis-connector") state.lisConnector = data;
        else if (toolKey === "eh-enrichment-service") state.enrichmentService = data;
        else if (toolKey === "eh-export-service") state.exportService = data;
        else if (toolKey === "eh-hl7-connector") state.hl7Connector = data;
        else if (toolKey === "eh-email-service") state.emailService = data;
      }
    );

    builder.addCase(patchEhTool.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export default ehToolsSlice.reducer;
