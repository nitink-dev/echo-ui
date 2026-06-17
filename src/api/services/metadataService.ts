import { API_URLS } from '../../auth/permissions/apiConfig';
import { BASE_URL } from '../../utils/constants';
import apiClient from './apiClient';

export const metadataService = {
  fetchHospitalMetadata: async () => {
    const res = await apiClient.get(`${BASE_URL}${API_URLS.hospital.all.path}`);
    return res.data;
  },

  fetchDicomStores: async () => {
    const res = await apiClient.get(`${BASE_URL}${API_URLS.scanners.dicomStore.path}`);
    return res.data;
  },

  fetchAllDicomStores: async () => {
    const res = await apiClient.get(`${BASE_URL}${API_URLS.scanners.dicomStore.path}`);
    const data = res.data;
    const allStores: string[] = Object.values(data).flat();
    return allStores;
  }
};