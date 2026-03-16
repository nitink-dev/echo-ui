import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { metadataService } from '../metadataService';
import { BASE_URL } from '../../../utils/constants';


vi.mock('axios');

const mockedAxios = axios as unknown as {
  get: vi.Mock;
};

describe('metadataService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchHospitalMetadata', () => {
    it('returns hospital metadata from API response', async () => {
      const mockData = {
        name: 'City Hospital',
        location: 'Delhi',
        departments: ['Radiology', 'Cardiology']
      };

      mockedAxios.get.mockResolvedValue({
        data: mockData
      });

      const result = await metadataService.fetchHospitalMetadata();

      expect(mockedAxios.get).toHaveBeenCalledWith(
        `${BASE_URL}/api/hospital-metadata`
      );
      expect(result).toEqual(mockData);
    });
  });

  describe('fetchDicomStores', () => {
    it('returns dicom stores grouped by dataset', async () => {
      const mockData = {
        dataset1: ['storeA', 'storeB'],
        dataset2: ['storeC']
      };

      mockedAxios.get.mockResolvedValue({
        data: mockData
      });

      const result = await metadataService.fetchDicomStores();

      expect(mockedAxios.get).toHaveBeenCalledWith(
        `${BASE_URL}/api/scanners/datasets/dicomStores`
      );
      expect(result).toEqual(mockData);
    });
  });

  describe('fetchAllDicomStores', () => {
    it('returns flattened list of all dicom stores', async () => {
      const mockData = {
        dataset1: ['storeA', 'storeB'],
        dataset2: ['storeC', 'storeD']
      };

      mockedAxios.get.mockResolvedValue({
        data: mockData
      });

      const result = await metadataService.fetchAllDicomStores();

      expect(mockedAxios.get).toHaveBeenCalledWith(
        `${BASE_URL}/api/scanners/datasets/dicomStores`
      );
      expect(result).toEqual(['storeA', 'storeB', 'storeC', 'storeD']);
    });

    it('returns empty array when no dicom stores exist', async () => {
      mockedAxios.get.mockResolvedValue({
        data: {}
      });

      const result = await metadataService.fetchAllDicomStores();

      expect(result).toEqual([]);
    });
  });
});
