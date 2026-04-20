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

    return response.data as LoginResponse;
  },

  logout: async (): Promise<void> => {

    await apiClient.post(`/api/auth/logout`);
  },

  fetchSecurityConfig: async (): Promise<SecurityConfigEntry[]> => {
    const response = await apiClient.get(`/api/auth/config`);
    return response.data as SecurityConfigEntry[];
  },
};