import { configureStore } from '@reduxjs/toolkit';
import reducer, {
  fetchHealthStatus,
  clearHealthData,
} from '../healthSlice';
import { healthService } from '../../../api/services/healthService';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ---- Mock healthService -------------------------------------------
vi.mock('../../../api/services/healthService', () => ({
  healthService: {
    fetchHealthStatus: vi.fn(),
  },
}));

describe('healthSlice', () => {
  const createStore = () =>
    configureStore({
      reducer: {
        health: reducer,
      },
    });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return the initial state', () => {
    const store = createStore();
    const state = store.getState().health;

    expect(state).toEqual({
      thirdParties: [],
      microservices: [],
      dependencies: null,
      timestamp: null,
      loading: false,
      lastFetched: null,
    });
  });

  it('should handle fetchHealthStatus pending state', async () => {
    const store = createStore();

    (healthService.fetchHealthStatus as any).mockResolvedValue({
      thirdParties: [],
      microservices: [],
    });

    const promise = store.dispatch(fetchHealthStatus());

    const stateWhilePending = store.getState().health;
    expect(stateWhilePending.loading).toBe(true);
    expect(stateWhilePending.error).toBeUndefined();

    await promise;
  });

  it('should handle fetchHealthStatus success and filter blocked services', async () => {
    const store = createStore();

    (healthService.fetchHealthStatus as any).mockResolvedValue({
      thirdParties: [
        { name: 'Auth Service', status: 'UP' },
        { name: 'Database Service', status: 'DOWN' }, // blocked
      ],
      microservices: [
        { name: 'Order Service', status: 'UP' },
        { name: 'Delete Service', status: 'DOWN' }, // blocked
      ],
      dependencies: {
        kafka: 'UP',
        mongodb: 'DOWN',
        redis: 'UP',
      },
      timestamp: '2026-01-26T10:00:00Z',
    });

    await store.dispatch(fetchHealthStatus());

    const state = store.getState().health;

    expect(state.loading).toBe(false);
    expect(state.error).toBeUndefined();

    // blocked services filtered out
    expect(state.thirdParties).toHaveLength(1);
    expect(state.thirdParties[0].name).toBe('Auth Service');

    expect(state.microservices).toHaveLength(1);
    expect(state.microservices[0].name).toBe('Order Service');

    expect(state.dependencies).toEqual({
      kafka: 'UP',
      mongodb: 'DOWN',
      redis: 'UP',
    });

    expect(state.timestamp).toBe('2026-01-26T10:00:00Z');
    expect(state.lastFetched).toBeTypeOf('number');
  });

  it('should handle fetchHealthStatus failure', async () => {
    const store = createStore();

    (healthService.fetchHealthStatus as any).mockRejectedValue({
      response: { data: 'Service unavailable' },
    });

    await store.dispatch(fetchHealthStatus());

    const state = store.getState().health;

    expect(state.loading).toBe(false);
    expect(state.error).toBe('Service unavailable');
  });

  it('should clear health data', async () => {
    const store = createStore();

    store.dispatch(clearHealthData());

    const state = store.getState().health;

    expect(state.thirdParties).toEqual([]);
    expect(state.microservices).toEqual([]);
    expect(state.dependencies).toBeNull();
    expect(state.timestamp).toBeNull();
    expect(state.error).toBeUndefined();
  });
});
