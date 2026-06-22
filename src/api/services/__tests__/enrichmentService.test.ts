import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../apiClient', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  }
}));

import { enrichmentService } from '../enrichmentService';
import apiClient from '../apiClient';

describe('enrichmentService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchTool', () => {
    it('returns data from res.data.data when present', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: { data: { enabled: true } } });

      const result = await enrichmentService.fetchTool('dicom');

      expect(apiClient.get).toHaveBeenCalledWith('/api/enrichment/tools/dicom');
      expect(result).toEqual({ toolKey: 'dicom', data: { enabled: true } });
    });

    it('returns data from res.data[toolKey] when data wrapper not present', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: { dicom: { enabled: false } } });

      const result = await enrichmentService.fetchTool('dicom');
      expect(result).toEqual({ toolKey: 'dicom', data: { enabled: false } });
    });

    it('returns raw res.data as fallback', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: { raw: true } });

      const result = await enrichmentService.fetchTool('dicom');
      expect(result).toEqual({ toolKey: 'dicom', data: { raw: true } });
    });
  });

  describe('patchTool', () => {
    it('returns data from res.data.data when present', async () => {
      vi.mocked(apiClient.patch).mockResolvedValue({ data: { data: { threshold: 10 } } });

      const result = await enrichmentService.patchTool('qa', { threshold: 10 });

      expect(apiClient.patch).toHaveBeenCalledWith('/api/enrichment/tools/qa', { threshold: 10 });
      expect(result).toEqual({ toolKey: 'qa', data: { threshold: 10 } });
    });

    it('returns data from res.data[toolKey] when present', async () => {
      vi.mocked(apiClient.patch).mockResolvedValue({ data: { qa: { threshold: 20 } } });

      const result = await enrichmentService.patchTool('qa', { threshold: 20 });
      expect(result).toEqual({ toolKey: 'qa', data: { threshold: 20 } });
    });

    it('returns raw res.data as fallback', async () => {
      vi.mocked(apiClient.patch).mockResolvedValue({ data: { updated: true } });

      const result = await enrichmentService.patchTool('qa', { updated: true });
      expect(result).toEqual({ toolKey: 'qa', data: { updated: true } });
    });

    it('propagates errors from patchTool', async () => {
      vi.mocked(apiClient.patch).mockRejectedValue(new Error('Patch failed'));
      await expect(enrichmentService.patchTool('qa', {})).rejects.toThrow('Patch failed');
    });
  });

  describe('fetchTool errors', () => {
    it('propagates errors from fetchTool', async () => {
      vi.mocked(apiClient.get).mockRejectedValue(new Error('Not found'));
      await expect(enrichmentService.fetchTool('missing')).rejects.toThrow('Not found');
    });
  });
});