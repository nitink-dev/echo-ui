import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { authService } from '../authService';
import { BASE_URL } from '../../../utils/constants';

vi.mock('axios');

const mockedAxios = axios as unknown as {
  post: vi.Mock;
};

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('login', () => {
    it('calls login API with correct payload and headers and returns token', async () => {
      const payload = {
        username: 'shishir',
        password: 'secret123'
      };

      const mockToken = 'jwt-token-123';

      mockedAxios.post.mockResolvedValue({
        data: mockToken
      });

      const result = await authService.login(payload);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        `${BASE_URL}/api/auth/login`,
        payload,
        {
          headers: { 'Content-Type': 'application/json' }
        }
      );

      expect(result).toBe(mockToken);
    });
  });
});
