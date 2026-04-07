import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { enrichmentService } from "../../api/services/enrichmentService";

// --- Async Thunks --------------------------------------------------

export const fetchEhTool = createAsyncThunk<
  { toolKey: string; data: any },
  { toolKey: string },
  { rejectValue: string }
>("ehTools/fetchEhTool", async ({ toolKey }, { rejectWithValue }) => {
  try {
    const res = await enrichmentService.fetchTool(toolKey);
    const data = res.data?.data || res.data?.[toolKey] || res.data;
    return { toolKey, data };
  } catch (err: any) {
    return rejectWithValue(err.response?.data || err.message);
  }
});

export const patchEhTool = createAsyncThunk<
  { toolKey: string; data: any },
  { toolKey: string; body: any },
  { rejectValue: string }
>("ehTools/patchEhTool", async ({ toolKey, body }, { rejectWithValue }) => {
  try {
    const res = await enrichmentService.patchTool(toolKey, body);
    const data = res.data?.data || res.data?.[toolKey] || res.data;
    return { toolKey, data };
  } catch (err: any) {
    return rejectWithValue(err.response?.data || err.message);
  }
});

// --- Helpers -------------------------------------------------------

const TOOL_KEY_TO_STATE: Record<string, keyof EhToolsState> = {
  "eh-dicom-receiver": "dicomReceiver",
  "eh-lis-connector":  "lisConnector",
  "eh-dicom-enricher": "enrichmentService",
  "eh-export-service": "exportService",
  "eh-hl7-connector":  "hl7Connector",
  "eh-email-service":  "emailService",
};

/**
 * Returns true only if `data` looks like a real config object.
 * Guards against servers returning { success: true } or {} on PATCH.
 */
const isValidConfigData = (data: any): boolean => {
  if (!data || typeof data !== "object" || Array.isArray(data)) return false;
  const JUNK_KEYS = new Set(["success", "message", "status", "ok", "statusCode"]);
  return Object.keys(data).some((k) => !JUNK_KEYS.has(k));
};

// --- State ---------------------------------------------------------
interface EhToolsState {
  dicomReceiver:     any;
  lisConnector:      any;
  enrichmentService: any;
  exportService:     any;
  hl7Connector:      any;
  emailService:      any;
  loading:           boolean;
  error:             string | null;
}

const initialState: EhToolsState = {
  dicomReceiver:     null,
  lisConnector:      null,
  enrichmentService: null,
  exportService:     null,
  hl7Connector:      null,
  emailService:      null,
  loading:           false,
  error:             null,
};

// --- Slice ---------------------------------------------------------
const ehToolsSlice = createSlice({
  name: "ehTools",
  initialState,
  reducers: {
    /**
     * Call this after a successful PATCH when the server returns no config data
     * (e.g. just { message: "configuration updated successfully" }).
     *
     * Merges the form values that were just saved directly into the Redux store
     * so that navigating away and back always shows the correct saved data —
     * without needing a re-fetch and without relying on the PATCH response body.
     *
     * Usage in component after patchEhTool succeeds:
     *   dispatch(updateToolState({ toolKey: "eh-dicom-receiver", data: serverFormatSnapshot }));
     */
    updateToolState: (
      state,
      action: PayloadAction<{ toolKey: string; data: any }>
    ) => {
      const { toolKey, data } = action.payload;
      const stateKey = TOOL_KEY_TO_STATE[toolKey];
      if (!stateKey) return;
      state[stateKey] = { ...(state[stateKey] || {}), ...data };
    },
  },
  extraReducers: (builder) => {

    // ===== FETCH =====
    builder.addCase(fetchEhTool.pending, (state) => {
      state.loading = true;
      state.error   = null;
    });

    builder.addCase(
      fetchEhTool.fulfilled,
      (state, action: PayloadAction<{ toolKey: string; data: any }>) => {
        state.loading = false;
        const { toolKey, data } = action.payload;
        const stateKey = TOOL_KEY_TO_STATE[toolKey];
        if (!stateKey) return;
        // GET always returns the full object — replace unconditionally.
        state[stateKey] = data;
      }
    );

    builder.addCase(fetchEhTool.rejected, (state, action) => {
      state.loading = false;
      state.error   = action.payload as string;
    });

    // ===== PATCH =====
    builder.addCase(patchEhTool.pending, (state) => {
      state.loading = true;
      state.error   = null;
    });

    builder.addCase(
      patchEhTool.fulfilled,
      (state, action: PayloadAction<{ toolKey: string; data: any }>) => {
        state.loading = false;
        const { toolKey, data } = action.payload;
        const stateKey = TOOL_KEY_TO_STATE[toolKey];
        if (!stateKey) return;

        if (!isValidConfigData(data)) {
          // Server returned no config data (e.g. { message: "updated" }).
          // Leave the store untouched — the component calls updateToolState
          // with the correct form values to keep the store in sync.
          return;
        }

        // Server returned real config data — merge to preserve untouched fields.
        state[stateKey] = { ...(state[stateKey] || {}), ...data };
      }
    );

    builder.addCase(patchEhTool.rejected, (state, action) => {
      state.loading = false;
      state.error   = action.payload as string;
    });
  },
});

export const { updateToolState } = ehToolsSlice.actions;
export default ehToolsSlice.reducer;