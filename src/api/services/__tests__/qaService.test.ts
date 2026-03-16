import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { qaService } from '../qaService';
import { QASlideParameter } from '../../../types';
import { BASE_URL } from '../../../utils/constants';
vi.mock('axios');

const mockedAxios = axios as unknown as {
  get: vi.Mock;
  post: vi.Mock;
  put: vi.Mock;
  delete: vi.Mock;
  patch: vi.Mock;
};

describe('qaService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchParameters', () => {
    it('returns QA parameters from API response', async () => {
      const mockData: QASlideParameter[] = [
        {
          id: '1',
          barcode: 'ABC123',
          activationCode: 'ACT123',
          dicomWebUrl: 'https://dicom.test'
        }
      ];

      mockedAxios.get.mockResolvedValue({
        data: mockData
      });

      const result = await qaService.fetchParameters();

      expect(mockedAxios.get).toHaveBeenCalledWith(
        `${BASE_URL}/api/slides`
      );
      expect(result).toEqual(mockData);
    });
  });

  describe('addParameter', () => {
    it('adds a QA parameter and maps response correctly', async () => {
      const payload = {
        barcode: 'BAR001',
        activationCode: 'ACT001'
      };

      mockedAxios.post.mockResolvedValue({
        data: {
          id: '10',
          barcode: 'BAR001',
          activationCode: 'ACT001',
          dicomWebUrl: 'https://dicom.new'
        }
      });

      const result = await qaService.addParameter(payload);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        `${BASE_URL}/api/slides`,
        payload
      );

      expect(result).toEqual({
        id: '10',
        barcode: 'BAR001',
        activationCode: 'ACT001',
        dicomWebUrl: 'https://dicom.new'
      });
    });
  });

  describe('updateParameter', () => {
    it('updates QA parameter and returns payload', async () => {
      const payload = {
        barcode: 'BAR002',
        activationCode: 'ACT002'
      };

      mockedAxios.put.mockResolvedValue({});

      const result = await qaService.updateParameter(payload);

      expect(mockedAxios.put).toHaveBeenCalledWith(
        `${BASE_URL}/api/slide-scan-status/barcode/BAR002`,
        payload
      );
      expect(result).toEqual(payload);
    });
  });

  describe('deleteParameter', () => {
    it('deletes QA parameter and returns barcode', async () => {
      mockedAxios.delete.mockResolvedValue({});

      const result = await qaService.deleteParameter('BAR003');

      expect(mockedAxios.delete).toHaveBeenCalledWith(
        `${BASE_URL}/api/slides/BAR003`
      );
      expect(result).toBe('BAR003');
    });
  });

  describe('updateDicomStore', () => {
    it('updates dicom store URL after trimming input', async () => {
      const dicomStoreAddress = '  https://dicom.store/path  ';
      const trimmed = 'https://dicom.store/path';

      mockedAxios.patch.mockResolvedValue({});

      const result = await qaService.updateDicomStore(dicomStoreAddress);

      expect(mockedAxios.patch).toHaveBeenCalledWith(
        `${BASE_URL}/api/config/path-qa/dicom-store`,
        {
          'gcp-config.pathqa-store-url': trimmed
        }
      );
      expect(result).toBe(dicomStoreAddress);
    });
  });
});
