import axios from 'axios';
import { BASE_URL } from '../../utils/constants';

export const metadataService = {
  // Fetch hospital metadata
  fetchHospitalMetadata: async () => {
    const res = await axios.get(`${BASE_URL}/api/hospital-metadata`);
    return res.data;
  },

  // Fetch DICOM stores
  fetchDicomStores: async () => {
    const res = await axios.get(`${BASE_URL}/api/scanners/datasets/dicomStores`);
    return res.data;
  },

  // Fetch all DICOM stores (flattened)
  fetchAllDicomStores: async () => {
    const res = await axios.get(`${BASE_URL}/api/scanners/datasets/dicomStores`);
    const data = res.data;
    const allStores: string[] = Object.values(data).flat();
    return allStores;
  }
};