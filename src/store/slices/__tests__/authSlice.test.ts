import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../../api/services/authService', () => ({
  authService: {
    login: vi.fn()
  }
}));

import reducer, {
  loginUser,
  logout,
  loadStoredSession
} from '../authSlice';

import { configureStore } from '@reduxjs/toolkit';
import { authService } from '../../../api/services/authService';

const mockedAuthService = authService as unknown as {
  login: ReturnType<typeof vi.fn>;
};

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    })
  };
})();

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock
});

describe('authSlice', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
  });

  it('should return the initial state', () => {
    const state = reducer(undefined, { type: 'unknown' });

    expect(state).toEqual({
      isLoggedIn: false,
      token: null,
      user: null,
      role: null,       // ← added
      loading: false,
      error: null
    });
  });

  it('should handle logout', () => {
    const loggedInState = {
      isLoggedIn: true,
      token: 'token123',
      user: 'nitin_mukesh',
      role: null,       // ← added
      loading: false,
      error: null
    };

    const state = reducer(loggedInState, logout());

    expect(state.isLoggedIn).toBe(false);
    expect(localStorage.removeItem).toHaveBeenCalledWith('auth_token');
    expect(localStorage.removeItem).toHaveBeenCalledWith('auth_user');
  });

  it('should load stored session from localStorage', () => {
    localStorageMock.setItem('auth_token', 'stored-token');
    localStorageMock.setItem('auth_user', 'stored-user');

    const state = reducer(undefined, loadStoredSession());

    expect(state.isLoggedIn).toBe(true);
    expect(state.token).toBe('stored-token');
    expect(state.user).toBe('stored-user');
  });

  describe('loginUser thunk', () => {
    it('should handle login success', async () => {
      mockedAuthService.login.mockResolvedValue({
        token: 'jwt-token',
        username: 'nitin_mukesh'
      });

      const store = configureStore({ reducer });

      await store.dispatch(
        loginUser({ username: 'nitin_mukesh', password: '1234' }) as any
      );

      const state = store.getState();

      expect(state.isLoggedIn).toBe(true);  // ← fixed: was false
      expect(state.token).toBe('jwt-token');
      expect(state.user).toBe('nitin_mukesh');
      expect(state.error).toBeNull();
    });

    it('should handle login failure', async () => {
      mockedAuthService.login.mockRejectedValue({
        response: {
          data: { message: 'Invalid credentials' }
        }
      });

      const store = configureStore({ reducer });

      await store.dispatch(
        loginUser({ username: 'wrong', password: 'wrong' }) as any
      );

      const state = store.getState();

      expect(state.isLoggedIn).toBe(false);
      expect(state.error).toBe('Invalid credentials');
    });
  });
});