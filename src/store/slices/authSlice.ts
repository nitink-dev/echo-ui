
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { authService, SecurityConfigEntry } from "../../api/services/authService";
import { Role } from "../../config/roleConfig";

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
  displayName: string | null;
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
  displayName: ""
};

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (payload: { username: string; password: string }, { rejectWithValue, dispatch }) => {
    try {
      const data = await authService.login(payload);
      dispatch(fetchSecurityConfig());
      return data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Login failed. Please try again."
      );
    }
  }
);

export const fetchSecurityConfig = createAsyncThunk(
  "auth/fetchSecurityConfig",
  async (_, { rejectWithValue }) => {
    try {
      return await authService.fetchSecurityConfig();
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Could not load security config."
      );
    }
  }
);


export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { dispatch }) => {
    try {
      await authService.logout();
    } catch {

    } finally {
      dispatch(clearAuthState());
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {


    clearAuthState(state) {
      state.isLoggedIn          = false;
      state.user                = null;
      state.role                = null;
      state.scopes              = [];
      state.securityConfig      = [];
      state.securityConfigLoaded = false;
      state.error               = null;
      state.displayName         = "";

      localStorage.removeItem("auth_user");
      localStorage.removeItem("auth_role");
      localStorage.removeItem("auth_scopes");
      localStorage.removeItem("auth_display")
    },


    loadStoredSession(state) {
      const user         = localStorage.getItem("auth_user");
      const storedRole   = localStorage.getItem("auth_role") as Role | null;
      const storedScopes = localStorage.getItem("auth_scopes");
      const display      = localStorage.getItem("auth_display");

      if (user && storedRole) {
        state.isLoggedIn = true;
        state.user       = user;
        state.role       = DEV_STATIC_ROLE ?? storedRole;
        state.scopes     = storedScopes ? JSON.parse(storedScopes) : [];
        state.displayName = display;
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
        state.displayName= action.payload.displayName;


        const backendRole = (action.payload.roles?.[0] as Role) ?? null;
        state.role =  backendRole;

        localStorage.setItem("auth_user", action.payload.username);
        localStorage.setItem("auth_display", action.payload.displayName);
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

      .addCase(fetchSecurityConfig.fulfilled, (state, action: PayloadAction<SecurityConfigEntry[]>) => {
        state.securityConfig       = action.payload;
        state.securityConfigLoaded = true;
      })

      .addCase(fetchSecurityConfig.rejected, (state) => {

        state.securityConfigLoaded = true;
      })

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