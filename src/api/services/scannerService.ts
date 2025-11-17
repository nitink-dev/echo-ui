import axios from 'axios';
import { BASE_URL } from '../../utils/constants';
import { SlideScanner } from '../../types/scanner.types';

export const scannerService = {
  // Fetch all scanners
  fetchAll: async (): Promise<SlideScanner[]> => {
    const response = await axios.get(`${BASE_URL}/api/scanners`);
    if (!Array.isArray(response.data)) {
      throw new Error("Invalid API response: Expected array");
    }
    return response.data;
  },

  // Add new scanner
  create: async (scanner: Omit<SlideScanner, 'id'>): Promise<SlideScanner> => {
    const response = await axios.post(`${BASE_URL}/api/scanners`, scanner);
    return response.data;
  },

  // Update scanner
  update: async (scanner: SlideScanner): Promise<SlideScanner> => {
    const response = await axios.put(
      `${BASE_URL}/api/scanners/${scanner.deviceSerialNumber}`,
      scanner
    );
    return response.data;
  },

  // Delete scanner
  delete: async (serialNumber: string): Promise<void> => {
    await axios.delete(`${BASE_URL}/api/scanners/${serialNumber}`);
  },

  // Fetch analysis reports for a scanner
  fetchReports: async (deviceSerialNumber: string) => {
    const response = await axios.get(
      `${BASE_URL}/api/scanners/${deviceSerialNumber}/reports`
    );
    return response.data;
  }
};