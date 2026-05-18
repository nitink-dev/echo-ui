import { BASE_URL } from '../../utils/constants';
import { SlideScanner } from '../../types/scanner.types';
import apiClient from './apiClient';

export const SCANNER_SERVICE_URL = `/api/scanners`;

export const scannerService = {
  fetchAll: async (): Promise<SlideScanner[]> => {
    const response = await apiClient.get(`${BASE_URL}${SCANNER_SERVICE_URL}`);
    if (!Array.isArray(response.data)) {
      throw new Error("Invalid API response: Expected array");
    }
    return response.data;
  },

  create: async (scanner: Omit<SlideScanner, 'id'>): Promise<SlideScanner> => {
    const response = await apiClient.post(`${BASE_URL}${SCANNER_SERVICE_URL}`, scanner);
    return response.data;
  },

  update: async (scanner: SlideScanner): Promise<SlideScanner> => {
    const response = await apiClient.put(
      `${BASE_URL}${SCANNER_SERVICE_URL}/${scanner.deviceSerialNumber}`,
      scanner
    );
    return response.data;
  },

  delete: async (serialNumber: string): Promise<void> => {
    await apiClient.delete(`${BASE_URL}${SCANNER_SERVICE_URL}/${serialNumber}`);
  },

  fetchReports: async (deviceSerialNumber: string) => {
    const response = await apiClient.get(
      `${BASE_URL}${SCANNER_SERVICE_URL}/${deviceSerialNumber}/reports`
    );
    return response.data;
  }
};