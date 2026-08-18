import { BASE_URL } from '../../utils/constants';
import { QASlideParameter } from '../../types/qa.types';
import apiClient from './apiClient';
import { API_URLS } from '../../auth/permissions/apiConfig';

export const qaService = {
  fetchParameters: async () => {
    const res = await apiClient.get(`${BASE_URL}${API_URLS.qaAnalysis.base.path}`);
    return res.data;      
  },

  addParameter: async (payload: { barcode: string; activationCode: string }) => {
    const res = await apiClient.post(`${BASE_URL}${API_URLS.qaAnalysis.create.path}`, payload);
    return {
      id: res.data.id,
      barcode: res.data.barcode,
      activationCode: res.data.activationCode,
      dicomWebUrl: res.data.dicomWebUrl,
    } as QASlideParameter;
  },

  updateParameter: async (payload: { barcode: string; activationCode: string }) => {
    await apiClient.put(`${BASE_URL}${API_URLS.qaAnalysis.base.path}/${payload.barcode}`, payload);
    return payload;
  },

  deleteParameter: async (barcode: string) => {
    await apiClient.delete(`${BASE_URL}${API_URLS.qaAnalysis.base.path}/${barcode}`);
    return barcode;
  },

  updateDicomStore: async (dicomStoreAddress: string) => {
    const payload = { "gcp-config.pathqa-store-url": dicomStoreAddress.trim() };
    await apiClient.patch(`${BASE_URL}${API_URLS.config.dicomStore.path}`, payload);
    return dicomStoreAddress;
  }
};