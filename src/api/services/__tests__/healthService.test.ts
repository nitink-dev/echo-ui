import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { healthService } from '../healthService';
import { BASE_URL } from '../../../utils/constants';

vi.mock('../apiClient');
import apiClient from '../apiClient';

describe('healthService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchHealthStatus', () => {
    it('returns health status data from API response', async () => {
      const mockResponse = {
        status: 'UP',
        services: {
          db: 'UP',
          redis: 'UP'
        }
      };

      vi.mocked(apiClient.get).mockResolvedValue({
        data: mockResponse
      });

      const result = await healthService.fetchHealthStatus();

      expect(vi.mocked(apiClient.get)).toHaveBeenCalledWith(
        `${BASE_URL}/api/health/status`
      );

      expect(result).toEqual(mockResponse);
    });
  });
});
