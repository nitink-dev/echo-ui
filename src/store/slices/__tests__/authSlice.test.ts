import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../../api/services/authService', () => ({
  authService: {
    login: vi.fn(),
    logout: vi.fn(),
    fetchSecurityConfig: vi.fn(),
  },
}));

vi.mock('../../../hooks/useCrossTabAuth', () => ({
  broadcastUserLogin: vi.fn(),
}));

import reducer, {
  loginUser,
  clearAuthState,
  loadStoredSession,
  logoutUser,
  restoreSession,
  fetchSecurityConfig,
} from '../authSlice';

import { configureStore } from '@reduxjs/toolkit';
import { authService } from '../../../api/services/authService';

const mockedAuthService = authService as unknown as {
  login: ReturnType<typeof vi.fn>;
  logout: ReturnType<typeof vi.fn>;
  fetchSecurityConfig: ReturnType<typeof vi.fn>;
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
    }),
  };
})();

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
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
      displayName: '',
    });
  });

  it('should handle logout via clearAuthState', () => {
    const loggedInState = {
      isLoggedIn: true,
      token: 'token123',
      user: 'nitin_mukesh',
      role: 'ROLE_ADMIN' as const,
      scopes: ['platform.read'],
      securityConfig: [],
      securityConfigLoaded: true,
      loading: false,
      error: null,
      displayName: 'Nitin Mukesh',
    };

    localStorageMock.setItem('auth_user', 'nitin_mukesh');
    localStorageMock.setItem('auth_role', 'ROLE_ADMIN');

    const state = reducer(loggedInState, clearAuthState());

    expect(state.isLoggedIn).toBe(false);
    expect(state.user).toBeNull();
    expect(state.role).toBeNull();
    expect(state.scopes).toEqual([]);
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_user');
  });

  it('should restore session from restoreSession action', () => {
    const state = reducer(
      undefined,
      restoreSession({
        user: 'stored-user',
        role: 'ROLE_ADMIN',
        scopes: ['platform.read'],
        displayName: 'Stored User',
      })
    );

    expect(state.isLoggedIn).toBe(true);
    expect(state.user).toBe('stored-user');
    expect(state.role).toBe('ROLE_ADMIN');
    expect(state.scopes).toEqual(['platform.read']);
    expect(state.displayName).toBe('Stored User');
  });

  it('should load stored session from localStorage via async thunk', async () => {
    localStorageMock.setItem('auth_user', 'stored-user');
    localStorageMock.setItem('auth_role', 'ROLE_ADMIN');
    localStorageMock.setItem('auth_scopes', JSON.stringify(['platform.read']));
    localStorageMock.setItem('auth_display', 'Stored User');

    mockedAuthService.fetchSecurityConfig.mockResolvedValue([
      { api: '/api/scanners', methods: ['GET'], requiredScopes: ['platform.read'], isPublic: false },
    ]);

    const store = configureStore({ reducer });
    await store.dispatch(loadStoredSession() as any);

    const state = store.getState();
    expect(state.isLoggedIn).toBe(true);
    expect(state.user).toBe('stored-user');
    expect(state.role).toBe('ROLE_ADMIN');
    expect(state.securityConfigLoaded).toBe(true);
    expect(mockedAuthService.fetchSecurityConfig).toHaveBeenCalled();
  });

  it('should not restore session when localStorage is empty', async () => {
    const store = configureStore({ reducer });
    await store.dispatch(loadStoredSession() as any);

    const state = store.getState();
    expect(state.isLoggedIn).toBe(false);
    expect(mockedAuthService.fetchSecurityConfig).not.toHaveBeenCalled();
  });

  describe('loginUser thunk', () => {
    it('should handle login success', async () => {
      mockedAuthService.login.mockResolvedValue({
        username: 'nitin_mukesh',
        displayName: 'Nitin Mukesh',
        scopes: ['platform.read'],
        roles: ['ROLE_ADMIN'],
      });
      mockedAuthService.fetchSecurityConfig.mockResolvedValue([]);

      const store = configureStore({ reducer });

      await store.dispatch(
        loginUser({ username: 'nitin_mukesh', password: '1234' }) as any
      );

      const state = store.getState();

      expect(state.isLoggedIn).toBe(true);
      expect(state.user).toBe('nitin_mukesh');
      expect(state.displayName).toBe('Nitin Mukesh');
      expect(state.error).toBeNull();
      expect(localStorageMock.setItem).toHaveBeenCalledWith('auth_user', 'nitin_mukesh');
    });

    it('should handle login failure', async () => {
      mockedAuthService.login.mockRejectedValue({
        response: {
          data: { message: 'Invalid credentials' },
        },
      });

      const store = configureStore({ reducer });

      await store.dispatch(
        loginUser({ username: 'wrong', password: 'wrong' }) as any
      );

      const state = store.getState();

      expect(state.isLoggedIn).toBe(false);
      expect(state.error).toBe('Invalid credentials');
    });

    it('should set loading state during login', async () => {
      let resolveLogin: (value: unknown) => void;
      const loginPromise = new Promise((resolve) => {
        resolveLogin = resolve;
      });
      mockedAuthService.login.mockReturnValue(loginPromise);

      const store = configureStore({ reducer });
      const dispatchPromise = store.dispatch(
        loginUser({ username: 'user', password: 'pass' }) as any
      );

      expect(store.getState().loading).toBe(true);

      resolveLogin!({
        username: 'user',
        displayName: 'User',
        scopes: [],
        roles: ['ROLE_VIEWER'],
      });
      mockedAuthService.fetchSecurityConfig.mockResolvedValue([]);
      await dispatchPromise;

      expect(store.getState().loading).toBe(false);
    });
  });

  describe('fetchSecurityConfig thunk', () => {
    it('should load security config on success', async () => {
      const config = [
        { api: '/api/scanners', methods: ['GET'], requiredScopes: ['platform.read'], isPublic: false },
      ];
      mockedAuthService.fetchSecurityConfig.mockResolvedValue(config);

      const store = configureStore({ reducer });
      await store.dispatch(fetchSecurityConfig() as any);

      const state = store.getState();
      expect(state.securityConfig).toEqual(config);
      expect(state.securityConfigLoaded).toBe(true);
    });

    it('should mark config loaded on failure', async () => {
      mockedAuthService.fetchSecurityConfig.mockRejectedValue(new Error('Network error'));

      const store = configureStore({ reducer });
      await store.dispatch(fetchSecurityConfig() as any);

      expect(store.getState().securityConfigLoaded).toBe(true);
    });
  });

  describe('logoutUser thunk', () => {
    it('should clear auth state after logout', async () => {
      mockedAuthService.logout.mockResolvedValue(undefined);

      const store = configureStore({
        reducer,
        preloadedState: {
          isLoggedIn: true,
          user: 'user',
          role: 'ROLE_ADMIN',
          scopes: [],
          securityConfig: [],
          securityConfigLoaded: true,
          loading: false,
          error: null,
          displayName: 'User',
        },
      });

      await store.dispatch(logoutUser() as any);

      const state = store.getState();
      expect(state.isLoggedIn).toBe(false);
      expect(mockedAuthService.logout).toHaveBeenCalled();
    });

    it('should clear auth state even when logout API fails', async () => {
      mockedAuthService.logout.mockRejectedValue(new Error('Logout failed'));

      const store = configureStore({
        reducer,
        preloadedState: {
          isLoggedIn: true,
          user: 'user',
          role: 'ROLE_ADMIN',
          scopes: [],
          securityConfig: [],
          securityConfigLoaded: true,
          loading: false,
          error: null,
          displayName: 'User',
        },
      });

      await store.dispatch(logoutUser() as any);

      expect(store.getState().isLoggedIn).toBe(false);
    });
  });
});
