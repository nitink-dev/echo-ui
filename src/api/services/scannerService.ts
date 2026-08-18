import { BASE_URL } from '../../utils/constants';
import { SlideScanner } from '../../types/scanner.types';
import apiClient from './apiClient';
import { API_URLS } from '../../auth/permissions/apiConfig';

export const scannerService = {
  fetchAll: async (): Promise<SlideScanner[]> => {
    const response = await apiClient.get(`${BASE_URL}${API_URLS.scanners.base.path}`);
    if (!Array.isArray(response.data)) {
      throw new Error("Invalid API response: Expected array");
    }
    return response.data;
  },

  create: async (scanner: Omit<SlideScanner, 'id'>): Promise<SlideScanner> => {
    const response = await apiClient.post(`${BASE_URL}${API_URLS.scanners.create.path}`, scanner);
    return response.data;
  },

  update: async (scanner: SlideScanner): Promise<SlideScanner> => {
    const response = await apiClient.put(
      `${BASE_URL}${API_URLS.scanners.base.path}/${scanner.deviceSerialNumber}`,
      scanner
    );
    return response.data;
  },

  delete: async (serialNumber: string): Promise<void> => {
    await apiClient.delete(`${BASE_URL}${API_URLS.scanners.base.path}/${serialNumber}`);
  },

  fetchReports: async (deviceSerialNumber: string) => {
    const response = await apiClient.get(
      `${BASE_URL}${API_URLS.scanners.base.path}/${deviceSerialNumber}/reports`
    );
    return response.data;
  }
};