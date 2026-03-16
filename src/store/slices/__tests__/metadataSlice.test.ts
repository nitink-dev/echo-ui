import { configureStore } from '@reduxjs/toolkit';
import reducer, {
  fetchHospitalMetadata,
  fetchDicomStores,
} from '../metadataSlice';
import { metadataService } from '../../../api/services/metadataService';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ---- Mock metadataService ----------------------------------------
vi.mock('../../../api/services/metadataService', () => ({
  metadataService: {
    fetchHospitalMetadata: vi.fn(),
    fetchDicomStores: vi.fn(),
  },
}));

describe('metadataSlice', () => {
  const createStore = () =>
    configureStore({
      reducer: {
        metadata: reducer,
      },
    });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return the initial state', () => {
    const store = createStore();
    const state = store.getState().metadata;

    expect(state).toEqual({
      hospitals: [],
      locations: [],
      departments: [],
      dicomStores: {},
      loading: false,
      error: undefined,
    });
  });

  // ------------------ fetchHospitalMetadata -----------------------
  it('should handle fetchHospitalMetadata pending', async () => {
    const store = createStore();
    (metadataService.fetchHospitalMetadata as any).mockResolvedValue({
      names: [],
      locations: [],
    });

    const promise = store.dispatch(fetchHospitalMetadata());
    const stateWhilePending = store.getState().metadata;

    expect(stateWhilePending.loading).toBe(true);

    await promise;
  });

  it('should handle fetchHospitalMetadata success', async () => {
    const store = createStore();
    (metadataService.fetchHospitalMetadata as any).mockResolvedValue({
      names: ['Hospital A', 'Hospital B'],
      locations: ['City X', 'City Y'],
    });

    await store.dispatch(fetchHospitalMetadata());

    const state = store.getState().metadata;

    expect(state.loading).toBe(false);
    expect(state.hospitals).toEqual(['Hospital A', 'Hospital B']);
    expect(state.locations).toEqual(['City X', 'City Y']);
  });

  it('should handle fetchHospitalMetadata failure', async () => {
    const store = createStore();
    (metadataService.fetchHospitalMetadata as any).mockRejectedValue({
      response: { data: 'Server error' },
    });

    await store.dispatch(fetchHospitalMetadata());

    const state = store.getState().metadata;

    expect(state.loading).toBe(false);
    expect(state.error).toBe('Rejected');
  });

  // ------------------ fetchDicomStores ----------------------------
  it('should handle fetchDicomStores pending', async () => {
    const store = createStore();
    (metadataService.fetchDicomStores as any).mockResolvedValue({});

    const promise = store.dispatch(fetchDicomStores());
    const stateWhilePending = store.getState().metadata;

    expect(stateWhilePending.loading).toBe(true);

    await promise;
  });

  it('should handle fetchDicomStores success', async () => {
    const store = createStore();
    const mockDicomData = {
      'Cardiology': ['Store1', 'Store2'],
      'Radiology': ['Store3'],
    };

    (metadataService.fetchDicomStores as any).mockResolvedValue(mockDicomData);

    await store.dispatch(fetchDicomStores());

    const state = store.getState().metadata;

    expect(state.loading).toBe(false);
    expect(state.departments).toEqual(['Cardiology', 'Radiology']);
    expect(state.dicomStores).toEqual(mockDicomData);
  });

  it('should handle fetchDicomStores failure', async () => {
    const store = createStore();
    (metadataService.fetchDicomStores as any).mockRejectedValue({
      response: { data: 'Fetch failed' },
    });

    await store.dispatch(fetchDicomStores());

    const state = store.getState().metadata;

    expect(state.loading).toBe(false);
    expect(state.error).toBe(undefined);
  });
});
