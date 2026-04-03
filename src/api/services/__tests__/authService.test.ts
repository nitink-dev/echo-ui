import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authService } from '../authService';
import { BASE_URL } from '../../../utils/constants';

// Mock apiClient directly — NOT axios
vi.mock('../apiClient');

// Import AFTER vi.mock so we get the mocked version
import apiClient from '../apiClient';

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('login', () => {
    it('calls login API with correct payload and headers and returns token', async () => {
      const payload = {
        username: 'nitin_mukesh',
        password: 'neil@nitin@mukesh',
      };

      const mockToken = 'jwt-token-123';

      // apiClient.post is already a vi.fn() from the mock
      vi.mocked(apiClient.post).mockResolvedValue({ data: mockToken });

      const result = await authService.login(payload);

      expect(apiClient.post).toHaveBeenCalledWith(
        `${BASE_URL}/api/auth/login`,
        payload,
        { headers: { 'Content-Type': 'application/json' } }
      );

      expect(result).toBe(mockToken);
    });
  });
});