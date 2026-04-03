import { BASE_URL } from '../../utils/constants';
import apiClient from './apiClient';

export const healthService = {
  // Fetch complete health status
  fetchHealthStatus: async () => {
    const res = await apiClient.get(`${BASE_URL}/api/health/status`);
    return res.data;
  }

};