import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../../api/services/authService', () => ({
  authService: {
    login: vi.fn()
  }
}));

import reducer, {
  loginUser,
  clearAuthState,
  loadStoredSession
} from '../authSlice';

import { configureStore } from '@reduxjs/toolkit';
import { authService } from '../../../api/services/authService';

const mockedAuthService = authService as unknown as {
  login: ReturnType<typeof vi.fn>;
};

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
      user: null,
      role: null,
      scopes: [],
      securityConfig: [],
      securityConfigLoaded: false,
      loading: false,
      error: null,
      displayName: ""
    });
  });

  it('should handle logout', () => {
    const loggedInState = {
      isLoggedIn: true,
      token: 'token123',
      user: 'nitin_mukesh',
      role: 'ROLE_ADMIN',       
      scopes: [],
      securityConfig: [],
      securityConfigLoaded: false,
      loading: false,
      error: null,
      displayName: 'Nitin Mukesh'
    };

    const state = reducer(loggedInState, clearAuthState());

    expect(state.isLoggedIn).toBe(false);
  });

  it('should load stored session from localStorage', () => {
    localStorageMock.setItem('auth_user', 'stored-user');
    localStorageMock.setItem('auth_role', 'ROLE_ADMIN');
    localStorageMock.setItem('auth_scopes', JSON.stringify(['platform.read']));
    localStorageMock.setItem('auth_display', 'Stored User');

    const state = reducer(undefined, loadStoredSession());

    expect(state.isLoggedIn).toBe(true);
    expect(state.user).toBe('stored-user');
    expect(state.role).toBe('ROLE_ADMIN');
  });

  describe('loginUser thunk', () => {
    it('should handle login success', async () => {
      mockedAuthService.login.mockResolvedValue({
        username: 'nitin_mukesh',
        displayName: 'Nitin Mukesh',
        scopes: ['platform.read'],
        roles: ['ROLE_ADMIN']
      });

      const store = configureStore({ reducer });

      await store.dispatch(
        loginUser({ username: 'nitin_mukesh', password: '1234' }) as any
      );

      const state = store.getState();

      expect(state.isLoggedIn).toBe(true); 
      expect(state.user).toBe('nitin_mukesh');
      expect(state.displayName).toBe('Nitin Mukesh');
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