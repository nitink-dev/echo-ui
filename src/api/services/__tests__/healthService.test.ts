import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { healthService } from '../healthService';
import { BASE_URL } from '../../../utils/constants';
vi.mock('axios');

const mockedAxios = axios as unknown as {
  get: vi.Mock;
};

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

      mockedAxios.get.mockResolvedValue({
        data: mockResponse
      });

      const result = await healthService.fetchHealthStatus();

      expect(mockedAxios.get).toHaveBeenCalledWith(
        `${BASE_URL}/api/health/status`
      );

      expect(result).toEqual(mockResponse);
    });
  });
});
