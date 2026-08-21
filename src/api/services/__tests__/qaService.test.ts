import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';

vi.mock('../apiClient', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  }
}));

import { qaService } from '../qaService';
import { QASlideParameter } from '../../../types';
import { BASE_URL } from '../../../utils/constants';
import apiClient from '../apiClient';

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

      vi.mocked(apiClient.get).mockResolvedValue({
        data: mockData
      });

      const result = await qaService.fetchParameters();

      expect(vi.mocked(apiClient.get)).toHaveBeenCalledWith(
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

      vi.mocked(apiClient.post).mockResolvedValue({
        data: {
          id: '10',
          barcode: 'BAR001',
          activationCode: 'ACT001',
          dicomWebUrl: 'https://dicom.new'
        }
      });

      const result = await qaService.addParameter(payload);

      expect(vi.mocked(apiClient.post)).toHaveBeenCalledWith(
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
    it('updates QA parameter and returns the server response', async () => {
      const payload = {
        barcode: 'BAR002',
        activationCode: 'ACT002'
      };

      vi.mocked(apiClient.put).mockResolvedValue({
        data: {
          barcode: 'BAR002',
          activationCode: 'ENCRYPTED002'
        }
      });

      const result = await qaService.updateParameter(payload);

      expect(vi.mocked(apiClient.put)).toHaveBeenCalledWith(
        `${BASE_URL}/api/slides/BAR002`,
        payload
      );
      expect(result).toEqual({
        barcode: 'BAR002',
        activationCode: 'ENCRYPTED002'
      });
    });
  });

  describe('deleteParameter', () => {
    it('deletes QA parameter and returns barcode', async () => {
      vi.mocked(apiClient.delete).mockResolvedValue({});

      const result = await qaService.deleteParameter('BAR003');

      expect(vi.mocked(apiClient.delete)).toHaveBeenCalledWith(
        `${BASE_URL}/api/slides/BAR003`
      );
      expect(result).toBe('BAR003');
    });
  });

  describe('updateDicomStore', () => {
    it('updates dicom store URL after trimming input', async () => {
      const dicomStoreAddress = '  https://dicom.store/path  ';
      const trimmed = 'https://dicom.store/path';

      vi.mocked(apiClient.patch).mockResolvedValue({});

      const result = await qaService.updateDicomStore(dicomStoreAddress);

      expect(vi.mocked(apiClient.patch)).toHaveBeenCalledWith(
        `${BASE_URL}/api/config/path-qa/dicom-store`,
        {
          'gcp-config.pathqa-store-url': trimmed
        }
      );
      expect(result).toBe(dicomStoreAddress);
    });
  });
});