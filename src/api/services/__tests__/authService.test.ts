import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../apiClient', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

import { authService } from '../authService';
import apiClient from '../apiClient';

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('login', () => {
    it('calls login API with correct payload and headers', async () => {
      const payload = {
        username: 'nitin_mukesh',
        password: 'neil@nitin@mukesh',
      };

      const mockResponse = {
        username: 'nitin_mukesh',
        displayName: 'Nitin Mukesh',
        scopes: ['platform.read'],
        roles: ['ROLE_ADMIN'],
      };

      vi.mocked(apiClient.post).mockResolvedValue({ data: mockResponse });

      const result = await authService.login(payload);

      expect(apiClient.post).toHaveBeenCalledWith(
        '/api/auth/login',
        payload,
        { headers: { 'Content-Type': 'application/json' } }
      );

      expect(result).toEqual(mockResponse);
    });
  });

  describe('logout', () => {
    it('calls logout API endpoint', async () => {
      vi.mocked(apiClient.post).mockResolvedValue({});

      await authService.logout();

      expect(apiClient.post).toHaveBeenCalledWith('/api/auth/logout');
    });
  });

  describe('fetchSecurityConfig', () => {
    it('returns security config from API', async () => {
      const mockConfig = [
        {
          api: '/api/scanners',
          methods: ['GET'],
          requiredScopes: ['platform.read'],
          isPublic: false,
        },
      ];

      vi.mocked(apiClient.get).mockResolvedValue({ data: mockConfig });

      const result = await authService.fetchSecurityConfig();

      expect(apiClient.get).toHaveBeenCalledWith('/api/auth/config');
      expect(result).toEqual(mockConfig);
    });
  });
});

describe('extractApiErrorMessage', async () => {
  const { extractApiErrorMessage } = await vi.importActual<typeof import('../apiClient')>('../apiClient');

  it('returns string errors directly', () => {
    expect(extractApiErrorMessage('Custom error')).toBe('Custom error');
  });

  it('extracts message from axios error response', () => {
    const error = {
      isAxiosError: true,
      response: { status: 400, data: { message: 'Bad input' } },
    };
    expect(extractApiErrorMessage(error)).toBe('Bad input');
  });

  it('returns HTTP status message when no server message', () => {
    const error = {
      isAxiosError: true,
      response: { status: 404, data: {} },
    };
    expect(extractApiErrorMessage(error)).toBe('Requested resource not found.');
  });

  it('returns Error message for generic errors', () => {
    expect(extractApiErrorMessage(new Error('Something broke'))).toBe('Something broke');
  });

  it('returns network error message for axios request without response', () => {
    const error = {
      isAxiosError: true,
      request: {},
      response: undefined,
    };
    expect(extractApiErrorMessage(error)).toBe('Network error. Server unreachable.');
  });

  it('returns timeout message for ECONNABORTED', () => {
    const error = {
      isAxiosError: true,
      code: 'ECONNABORTED',
    };
    expect(extractApiErrorMessage(error)).toBe('Request timed out. Please try again.');
  });
});
