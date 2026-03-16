// src/store/slices/authSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { authService } from "../../api/services/authService";
import { Role } from "../../config/roleConfig";

// ─────────────────────────────────────────────────────────────
// 🔧 DEV ONLY: Static role for local testing (no backend needed).
//    Change this value to switch roles:
//      "ROLE_ADMIN"    → full access (RW everything)
//      "ROLE_OPERATOR" → RW scanner + Read-only apps
//      "ROLE_VIEWER"   → Read-only scanner, no LIS/Synapse/QA/Enrichment
//    Set to null to use the real role returned by backend login.
// ─────────────────────────────────────────────────────────────
const DEV_STATIC_ROLE: Role | null = "ROLE_ADMIN"; // ← change to test

interface AuthState {
  isLoggedIn: boolean;
  token: string | null;
  user: string | null;
  role: Role | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  isLoggedIn: false,
  token: null,
  user: null,
  role: null,
  loading: false,
  error: null,
};

// ✅ Thunk: Login User using authService
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (
    payload: { username: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const data = await authService.login(payload);
      // Expected response: { token: "...", username: "...", role: "ROLE_ADMIN" | ... }
      return data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Login failed. Please try again."
      );
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // ✅ Logout Action
    logout(state) {
      state.isLoggedIn = false;
      state.token = null;
      state.user = null;
      state.role = null;
      state.error = null;

      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
      localStorage.removeItem("auth_role");
    },

    // ✅ Load stored session on app start
    loadStoredSession(state) {
      const token      = localStorage.getItem("auth_token");
      const user       = localStorage.getItem("auth_user");
      const storedRole = localStorage.getItem("auth_role") as Role | null;

      if (token) {
        state.isLoggedIn = true;
        state.token = token;
        state.user  = user;
        // 🔧 DEV: override with static role if set, else use stored role
        state.role  = DEV_STATIC_ROLE ?? storedRole;
      }
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(loginUser.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;

        if (action.payload === "Login successful" || action.payload.token) {
          state.isLoggedIn = true;
        }

        state.token = action.payload.token;
        state.user  = action.payload.username;

        // 🔧 DEV: if DEV_STATIC_ROLE is set, use it — else use backend role
        state.role  = DEV_STATIC_ROLE ?? (action.payload.role ?? null);

        // Persist session
        localStorage.setItem("auth_token", action.payload.token);
        localStorage.setItem("auth_user",  action.payload.username);
        if (action.payload.role) {
          localStorage.setItem("auth_role", action.payload.role);
        }
      })

      .addCase(loginUser.rejected, (state, action) => {
        state.loading    = false;
        state.error      = action.payload as string;
        state.isLoggedIn = false;
      });
  },
});

export const { logout, loadStoredSession } = authSlice.actions;
export default authSlice.reducer;