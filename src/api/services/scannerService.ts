import { BASE_URL } from '../../utils/constants';
import { SlideScanner } from '../../types/scanner.types';
import apiClient from './apiClient';

export const scannerService = {
  // Fetch all scanners
  fetchAll: async (): Promise<SlideScanner[]> => {
    const response = await apiClient.get(`${BASE_URL}/api/scanners`);
    if (!Array.isArray(response.data)) {
      throw new Error("Invalid API response: Expected array");
    }
    return response.data;
  },

  // Add new scanner
  create: async (scanner: Omit<SlideScanner, 'id'>): Promise<SlideScanner> => {
    const response = await apiClient.post(`${BASE_URL}/api/scanners`, scanner);
    return response.data;
  },

  // Update scanner
  update: async (scanner: SlideScanner): Promise<SlideScanner> => {
    const response = await apiClient.put(
      `${BASE_URL}/api/scanners/${scanner.deviceSerialNumber}`,
      scanner
    );
    return response.data;
  },

  // Delete scanner
  delete: async (serialNumber: string): Promise<void> => {
    await apiClient.delete(BASE_URL + `/api/scanners/${serialNumber}`);
  },

  // Fetch analysis reports for a scanner
  fetchReports: async (deviceSerialNumber: string) => {
    const response = await apiClient.get(
      `${BASE_URL}/api/scanners/${deviceSerialNumber}/reports`
    );
    return response.data;
  }
};