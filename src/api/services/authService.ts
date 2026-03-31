// src/api/services/authService.ts
import apiClient from "./apiClient";

interface LoginRequest {
  username: string;
  password: string;
}

// ✅ Actual backend response shape (from Postman screenshots)
// No token field — backend uses SESSION cookie
// roles is an array, scopes is an array
export interface LoginResponse {
  username: string;
  roles: string[];   // e.g. ["ROLE_DEVELOPER"]
  scopes: string[];  // e.g. ["platform.read", "platform.write", ...]
}

// ✅ Shape of each entry returned by GET /api/auth/config
export interface SecurityConfigEntry {
  api: string;
  methods: string[];
  isPublic: boolean;
  requiredScopes: string[];
}

export const authService = {
  login: async (payload: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post(
      `/api/auth/login`,
      payload,
      { headers: { "Content-Type": "application/json" } }
    );
    // SESSION + XSRF-TOKEN cookies are automatically set by the browser
    // from the Set-Cookie response headers — no manual handling needed
    return response.data as LoginResponse;
  },

  logout: async (): Promise<void> => {
    // Call backend logout so SESSION cookie is invalidated server-side.
    // 200, 201, 204 — sab valid success responses hain.
    // Error propagate hogi — authSlice ka thunk handle karega.
    await apiClient.post(`/api/auth/logout`);
  },

  /**
   * Fetch the live security config from the backend.
   * Returns the list of API route entries with their required scopes.
   * Called once after login to hydrate the store.
   * Requires scope: auth.config.read + platform.read
   */
  fetchSecurityConfig: async (): Promise<SecurityConfigEntry[]> => {
    const response = await apiClient.get(`/api/auth/config`);
    return response.data as SecurityConfigEntry[];
  },
};