import axios from 'axios';
import { BASE_URL } from '../../utils/constants';

export const healthService = {
  // Fetch complete health status
  fetchHealthStatus: async () => {
    const res = await axios.get(`${BASE_URL}/api/health/status`);
    return res.data;
  }

};