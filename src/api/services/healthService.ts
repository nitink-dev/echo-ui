import { API_URLS } from '../../auth/permissions/apiConfig';
import { BASE_URL } from '../../utils/constants';
import apiClient from './apiClient';

export const healthService = {
  fetchHealthStatus: async () => {
    const res = await apiClient.get(`${BASE_URL}${API_URLS.health.all.path}`);
    return res.data;
  }

};