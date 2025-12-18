import axios from 'axios';
import { BASE_URL } from '../../utils/constants';

export const statusService = {
  // Fetch completed scans
  fetchCompletedScans: async (page: number = 0, size: number = 4) => {
    const res = await axios.get(`${BASE_URL}/api/slide-scan-status/completed`, {
      params: { page, size }
    });
    return res.data;
  },

  // Fetch failed scans
  fetchFailedScans: async (page: number = 0, size: number = 4) => {
    const res = await axios.get(`${BASE_URL}/api/slide-scan-status/failed`, {
      params: { page, size }
    });
    return res.data;
  },

  // Fetch in-progress scans
  fetchInProgressScans: async (page: number = 0, size: number = 4) => {
    const res = await axios.get(`${BASE_URL}/api/slide-scan-status/in-progress`, {
      params: { page, size }
    });

    
// Ensure only 4 items are returned
const limitedRes = Array.isArray(res) ? res.slice(0, 4) : [];
return limitedRes;

    //return res.data;
  }
};