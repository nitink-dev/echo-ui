import { BASE_URL } from "../../utils/constants";
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
  roles: string[];      // e.g. ["ROLE_DEVELOPER"]
  scopes: string[];     // e.g. ["platform.read", "platform.write", ...]
}

export const authService = {
  login: async (payload: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post(
      `${BASE_URL}/api/auth/login`,
      payload,
      { headers: { "Content-Type": "application/json" } }
    );
    // SESSION + XSRF-TOKEN cookies are automatically set by the browser
    // from the Set-Cookie response headers — no manual handling needed
    return response.data as LoginResponse;
  },

  logout: async (): Promise<void> => {
    // Call backend logout so SESSION cookie is invalidated server-side
    await apiClient.post(`${BASE_URL}/api/auth/logout`).catch(() => {
      // ignore — we clear local state regardless
    });
  },
};