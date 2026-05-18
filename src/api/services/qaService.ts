import { BASE_URL } from '../../utils/constants';
import { QASlideParameter } from '../../types/qa.types';
import apiClient from './apiClient';

export const QA_SERVICE_URL = `/api/slides`;
export const DICOM_STORE_CONFIG_URL = `/api/config/path-qa/dicom-store`;

export const qaService = {
  fetchParameters: async () => {
    const res = await apiClient.get(`${BASE_URL}${QA_SERVICE_URL}`);
    return res.data;      
  },

  addParameter: async (payload: { barcode: string; activationCode: string }) => {
    const res = await apiClient.post(`${BASE_URL}${QA_SERVICE_URL}`, payload);
    return {
      id: res.data.id,
      barcode: res.data.barcode,
      activationCode: res.data.activationCode,
      dicomWebUrl: res.data.dicomWebUrl,
    } as QASlideParameter;
  },

  updateParameter: async (payload: { barcode: string; activationCode: string }) => {
    await apiClient.put(`${BASE_URL}${QA_SERVICE_URL}/${payload.barcode}`, payload);
    return payload;
  },

  deleteParameter: async (barcode: string) => {
    await apiClient.delete(`${BASE_URL}${QA_SERVICE_URL}/${barcode}`);
    return barcode;
  },

  updateDicomStore: async (dicomStoreAddress: string) => {
    const payload = { "gcp-config.pathqa-store-url": dicomStoreAddress.trim() };
    await apiClient.patch(`${BASE_URL}${DICOM_STORE_CONFIG_URL}`, payload);
    return dicomStoreAddress;
  }
};