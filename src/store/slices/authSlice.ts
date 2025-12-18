import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { authService } from "../../api/services/authService";

interface AuthState {
  isLoggedIn: boolean;
  token: string | null;
  user: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  isLoggedIn: false,
  token: null,
  user: null,
  loading: false,
  error: null,
};

//
// ✅ Thunk: Login User using authService
//
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (
    payload: { username: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const data = await authService.login(payload);

      // Expected: { token: "...", username: "..." }
      return data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Login failed. Please try again."
      );
    }
  }
);

//
// Auth Slice
//
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    //
    // ✅ Logout Action
    //
    logout(state) {
      state.isLoggedIn = false;
      state.token = null;
      state.user = null;
      state.error = null;

      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
    },

    //
    // Optional: load token from storage on app start
    //
    loadStoredSession(state) {
      const token = localStorage.getItem("auth_token");
      const user = localStorage.getItem("auth_user");

      if (token) {
        state.isLoggedIn = true;
        state.token = token;
        state.user = user;
      }
    },
  },

  extraReducers: (builder) => {
    builder
      //
      // 🔄 LOGIN PENDING
      //
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      //
      // ✅ LOGIN SUCCESS
      //
      .addCase(
        loginUser.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.loading = false;
          if(action.payload === "Login successful"){
            state.isLoggedIn = true;
          }
          
          state.token = action.payload.token;
          state.user = action.payload.username;

          // Persist session
          localStorage.setItem("auth_token", action.payload.token);
          localStorage.setItem("auth_user", action.payload.username);
        }
      )

     
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isLoggedIn = false;
      });
  },
});

export const { logout, loadStoredSession } = authSlice.actions;
export default authSlice.reducer;
