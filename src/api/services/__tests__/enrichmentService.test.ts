import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { enrichmentService } from '../enrichmentService';

vi.mock('axios');

const mockedAxios = axios as unknown as {
  get: vi.Mock;
  patch: vi.Mock;
};

describe('enrichmentService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchTool', () => {
    it('returns data from res.data.data when present', async () => {
      mockedAxios.get.mockResolvedValue({
        data: {
          data: { enabled: true }
        }
      });

      const result = await enrichmentService.fetchTool('dicom');

      expect(mockedAxios.get).toHaveBeenCalledWith(
        '/api/enrichment/tools/dicom'
      );
      expect(result).toEqual({
        toolKey: 'dicom',
        data: { enabled: true }
      });
    });

    it('returns data from res.data[toolKey] when data wrapper not present', async () => {
      mockedAxios.get.mockResolvedValue({
        data: {
          dicom: { enabled: false }
        }
      });

      const result = await enrichmentService.fetchTool('dicom');

      expect(result).toEqual({
        toolKey: 'dicom',
        data: { enabled: false }
      });
    });

    it('returns raw res.data as fallback', async () => {
      mockedAxios.get.mockResolvedValue({
        data: { raw: true }
      });

      const result = await enrichmentService.fetchTool('dicom');

      expect(result).toEqual({
        toolKey: 'dicom',
        data: { raw: true }
      });
    });
  });

  describe('patchTool', () => {
    it('returns data from res.data.data when present', async () => {
      mockedAxios.patch.mockResolvedValue({
        data: {
          data: { threshold: 10 }
        }
      });

      const result = await enrichmentService.patchTool('qa', { threshold: 10 });

      expect(mockedAxios.patch).toHaveBeenCalledWith(
        '/api/enrichment/tools/qa',
        { threshold: 10 }
      );
      expect(result).toEqual({
        toolKey: 'qa',
        data: { threshold: 10 }
      });
    });

    it('returns data from res.data[toolKey] when present', async () => {
      mockedAxios.patch.mockResolvedValue({
        data: {
          qa: { threshold: 20 }
        }
      });

      const result = await enrichmentService.patchTool('qa', { threshold: 20 });

      expect(result).toEqual({
        toolKey: 'qa',
        data: { threshold: 20 }
      });
    });

    it('returns raw res.data as fallback', async () => {
      mockedAxios.patch.mockResolvedValue({
        data: { updated: true }
      });

      const result = await enrichmentService.patchTool('qa', { updated: true });

      expect(result).toEqual({
        toolKey: 'qa',
        data: { updated: true }
      });
    });
  });
});
