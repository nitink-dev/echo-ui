import apiClient from "./apiClient";
interface LoginRequest {
  username: string;
  password: string;
}
export interface LoginResponse {
  username: string;
  roles: string[];   
  scopes: string[]; 
  displayName: string; 
  sessionTimeoutMinutes: number;
}


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
    const data = response.data as LoginResponse;
    // For testing purposes, we can override the sessionTimeoutMinutes here if needed
    // data.sessionTimeoutMinutes = 6;
    return data;
  },

  logout: async (): Promise<void> => {

    await apiClient.post(`/api/auth/logout`);
  },

  fetchSecurityConfig: async (): Promise<SecurityConfigEntry[]> => {
    const response = await apiClient.get(`/api/auth/config`);
    return response.data as SecurityConfigEntry[];
  },
};