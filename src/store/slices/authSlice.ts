// src/store/slices/authSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { authService, SecurityConfigEntry } from "../../api/services/authService";
import { Role } from "../../config/roleConfig";

// ─────────────────────────────────────────────────────────────
// 🔧 DEV ONLY: Set a static role for local testing.
//    "ROLE_ADMIN"     → full access
//    "ROLE_DEVELOPER" → full access (same as admin)
//    "ROLE_OPERATOR"  → RW scanner + read-only apps
//    "ROLE_VIEWER"    → read-only scanner, no apps
//    Set to null to use the real role from backend login.
// ─────────────────────────────────────────────────────────────
const DEV_STATIC_ROLE: Role | null = null; // ← set to a Role string to override

interface AuthState {
  isLoggedIn: boolean;
  user: string | null;
  role: Role | null;                       // primary role (first in roles array)
  scopes: string[];                        // e.g. ["platform.read", "platform.write"]
  securityConfig: SecurityConfigEntry[];   // live config from GET /api/auth/config
  securityConfigLoaded: boolean;           // true once config has been fetched
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  isLoggedIn: false,
  user: null,
  role: null,
  scopes: [],
  securityConfig: [],
  securityConfigLoaded: false,
  loading: false,
  error: null,
};

// ✅ Thunk: Login — backend sets SESSION cookie, we store role + scopes
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (payload: { username: string; password: string }, { rejectWithValue, dispatch }) => {
    try {
      const data = await authService.login(payload);
      // After successful login, immediately fetch the security config
      dispatch(fetchSecurityConfig());
      return data; // { username, roles: [...], scopes: [...] }
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Login failed. Please try again."
      );
    }
  }
);

// ✅ Thunk: Fetch live security config from GET /api/auth/config
// Called after login and on session restore so the UI always reflects
// the latest route-level scope requirements from the backend.
export const fetchSecurityConfig = createAsyncThunk(
  "auth/fetchSecurityConfig",
  async (_, { rejectWithValue }) => {
    try {
      return await authService.fetchSecurityConfig();
    } catch (err: any) {
      // Non-fatal — fall back to role-only permission checks
      return rejectWithValue(
        err.response?.data?.message || "Could not load security config."
      );
    }
  }
);

// ✅ Thunk: Logout — backend invalidates SESSION cookie, we clear local state
export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { dispatch }) => {
    try {
      await authService.logout();
    } catch {
      // Backend unreachable / already expired — koi baat nahi.
      // Local state clear karna zaroori hai regardless.
    } finally {
      dispatch(clearAuthState());
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {

    // ✅ Internal reducer — sirf local state + localStorage clear karta hai.
    // Directly dispatch mat karo — logoutUser thunk use karo.
    clearAuthState(state) {
      state.isLoggedIn          = false;
      state.user                = null;
      state.role                = null;
      state.scopes              = [];
      state.securityConfig      = [];
      state.securityConfigLoaded = false;
      state.error               = null;

      localStorage.removeItem("auth_user");
      localStorage.removeItem("auth_role");
      localStorage.removeItem("auth_scopes");
    },

    // ✅ Restore session on page reload.
    // SESSION cookie is sent automatically by the browser — we just restore
    // the role + user we saved so the UI renders without a fresh login call.
    // Also re-fetches the security config so it's always fresh after reload.
    loadStoredSession(state) {
      const user         = localStorage.getItem("auth_user");
      const storedRole   = localStorage.getItem("auth_role") as Role | null;
      const storedScopes = localStorage.getItem("auth_scopes");

      if (user && storedRole) {
        state.isLoggedIn = true;
        state.user       = user;
        state.role       = DEV_STATIC_ROLE ?? storedRole;
        state.scopes     = storedScopes ? JSON.parse(storedScopes) : [];
        // securityConfig will be re-fetched via the effect in App.tsx
      }
    },
  },

  extraReducers: (builder) => {
    builder
      // ── Login ──────────────────────────────────────────────
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })

      .addCase(loginUser.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading    = false;
        state.isLoggedIn = true;
        state.user       = action.payload.username;
        state.scopes     = action.payload.scopes ?? [];

        // Backend returns roles as an array — take the first one as the
        // primary role for permission checks.
        const backendRole = (action.payload.roles?.[0] as Role) ?? null;
        state.role = DEV_STATIC_ROLE ?? backendRole;

        // Persist for session restore on page reload
        localStorage.setItem("auth_user", action.payload.username);
        if (state.role) {
          localStorage.setItem("auth_role", state.role);
        }
        localStorage.setItem("auth_scopes", JSON.stringify(state.scopes));
      })

      .addCase(loginUser.rejected, (state, action) => {
        state.loading    = false;
        state.error      = action.payload as string;
        state.isLoggedIn = false;
      })

      // ── Security Config ────────────────────────────────────
      .addCase(fetchSecurityConfig.fulfilled, (state, action: PayloadAction<SecurityConfigEntry[]>) => {
        state.securityConfig       = action.payload;
        state.securityConfigLoaded = true;
      })

      .addCase(fetchSecurityConfig.rejected, (state) => {
        // Config unavailable — role-based fallback will be used.
        // Mark as loaded so the UI doesn't stay in a loading state.
        state.securityConfigLoaded = true;
      })

      // ── Logout ─────────────────────────────────────────────
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
      })

      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
      })

      .addCase(logoutUser.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const { clearAuthState, loadStoredSession } = authSlice.actions;
export default authSlice.reducer;