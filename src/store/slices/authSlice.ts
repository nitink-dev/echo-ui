import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { authService } from "../../api/services/authService";
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
  role: Role | null;        // primary role (first in roles array)
  scopes: string[];         // e.g. ["platform.read", "platform.write"]
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  isLoggedIn: false,
  user: null,
  role: null,
  scopes: [],
  loading: false,
  error: null,
};

// ✅ Thunk: Login — backend sets SESSION cookie, we store role + scopes
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (payload: { username: string; password: string }, { rejectWithValue }) => {
    try {
      const data = await authService.login(payload);
      return data; // { username, roles: [...], scopes: [...] }
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

    // ✅ Logout — clear state + let backend invalidate SESSION cookie
    logout(state) {
      state.isLoggedIn = false;
      state.user  = null;
      state.role  = null;
      state.scopes = [];
      state.error = null;

      // No token in localStorage to remove for cookie-based sessions.
      // We still persist role/user for UX — clear them on logout.
      localStorage.removeItem("auth_user");
      localStorage.removeItem("auth_role");
      localStorage.removeItem("auth_scopes");

      // Fire-and-forget backend logout so SESSION is invalidated server-side
      authService.logout();
    },

    // ✅ Restore session on page reload
    // SESSION cookie is sent automatically by the browser — we just restore
    // the role + user we saved so the UI renders without a fresh login call.
    loadStoredSession(state) {
      const user       = localStorage.getItem("auth_user");
      const storedRole = localStorage.getItem("auth_role") as Role | null;
      const storedScopes = localStorage.getItem("auth_scopes");

      // We check for stored user as the indicator that a session exists.
      // The actual SESSION cookie validity is enforced by the backend — any
      // API call with an expired cookie will return 401 and the interceptor
      // should redirect to login.
      if (user && storedRole) {
        state.isLoggedIn = true;
        state.user  = user;
        state.role  = DEV_STATIC_ROLE ?? storedRole;
        state.scopes = storedScopes ? JSON.parse(storedScopes) : [];
      }
    },
  },

  extraReducers: (builder) => {
    builder
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
        localStorage.setItem("auth_user",   action.payload.username);
        if (state.role) {
          localStorage.setItem("auth_role", state.role);
        }
        localStorage.setItem("auth_scopes", JSON.stringify(state.scopes));
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