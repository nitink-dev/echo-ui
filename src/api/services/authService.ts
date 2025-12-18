import axios from "axios";
import { BASE_URL } from "../../utils/constants";

interface LoginRequest {
  username: string;
  password: string;
}

interface LoginResponse {
  token: string;
  username: string;
}

export const authService = {
  login: async (payload: LoginRequest): Promise<string> => {
    const response = await axios.post(`${BASE_URL}/api/auth/login`, payload, {
      headers: { "Content-Type": "application/json" },
    });

    return response.data;
  },
};
