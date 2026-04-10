import { BASE_URL } from '../../utils/constants';
import apiClient from './apiClient';

export const metadataService = {
  fetchHospitalMetadata: async () => {
    const res = await apiClient.get(`${BASE_URL}/api/hospital-metadata`);
    return res.data;
  },

  fetchDicomStores: async () => {
    const res = await apiClient.get(`${BASE_URL}/api/scanners/datasets/dicomStores`);
    return res.data;
  },

  fetchAllDicomStores: async () => {
    const res = await apiClient.get(`${BASE_URL}/api/scanners/datasets/dicomStores`);
    const data = res.data;
    const allStores: string[] = Object.values(data).flat();
    return allStores;
  }
};