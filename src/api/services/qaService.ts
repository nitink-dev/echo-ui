import { BASE_URL } from '../../utils/constants';
import { QASlideParameter } from '../../types/qa.types';
import apiClient from './apiClient';

export const qaService = {
  // Fetch QA parameters
  fetchParameters: async () => {
    const res = await apiClient.get(`${BASE_URL}/api/slides`);
    return res.data;      
  },

  // Add QA parameter
  addParameter: async (payload: { barcode: string; activationCode: string }) => {
    const res = await apiClient.post(`${BASE_URL}/api/slides`, payload);
    return {
      id: res.data.id,
      barcode: res.data.barcode,
      activationCode: res.data.activationCode,
      dicomWebUrl: res.data.dicomWebUrl,
    } as QASlideParameter;
  },

  // Update QA parameter
  updateParameter: async (payload: { barcode: string; activationCode: string }) => {
    await apiClient.put(`${BASE_URL}/api/slides/${payload.barcode}`, payload);
    return payload;
  },

  // Delete QA parameter
  deleteParameter: async (barcode: string) => {
    await apiClient.delete(`${BASE_URL}/api/slides/${barcode}`);
    return barcode;
  },

  // Update DICOM store
  updateDicomStore: async (dicomStoreAddress: string) => {
    const payload = { "gcp-config.pathqa-store-url": dicomStoreAddress.trim() };
    await apiClient.patch(`${BASE_URL}/api/config/path-qa/dicom-store`, payload);
    return dicomStoreAddress;
  }
};