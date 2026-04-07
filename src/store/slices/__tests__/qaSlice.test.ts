import { describe, it, expect, vi, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import reducer, {
  fetchQAParameters,
  fetchDicomStores,
  updateDicomStore,
  addQAParameter,
  updateQAParameter,
  deleteQAParameter,
  QASlideParameter,
} from '../qaSlice';
import { qaService } from '../../../api/services/qaService';

// ---- Mock services ----
vi.mock('../../../api/services/qaService', () => ({
  qaService: {
    fetchParameters: vi.fn(),
  },
}));

vi.mock('../../../api/services/apiClient');
import apiClient from '../../../api/services/apiClient';

describe('qaSlice', () => {
  const createStore = () =>
    configureStore({
      reducer: {
        qa: reducer,
      },
    });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return the initial state', () => {
    const store = createStore();
    const state = store.getState().qa;

    expect(state).toEqual({
      qaParameters: [],
      dicomStoreAddress: '',
      dicomStores: [],
      loading: false,
      error: null,
    });
  });

  // -------------------- fetchQAParameters -------------------------
  it('should handle fetchQAParameters success', async () => {
    const store = createStore();
    const mockData = {
      qaSlides: [
        { id: '1', barcode: 'B001', activationCode: 'AC001' },
      ] as QASlideParameter[],
      dicomUrl: 'http://dicom.url',
    };

    (qaService.fetchParameters as any).mockResolvedValue(mockData);

    await store.dispatch(fetchQAParameters());

    const state = store.getState().qa;
    expect(state.loading).toBe(false);
    expect(state.qaParameters).toEqual(mockData.qaSlides);
    expect(state.dicomStoreAddress).toBe(mockData.dicomUrl);
  });

  it('should handle fetchQAParameters failure', async () => {
    const store = createStore();
    (qaService.fetchParameters as any).mockRejectedValue({
      response: { data: { message: 'Fetch failed' } },
    });

    await store.dispatch(fetchQAParameters());

    const state = store.getState().qa;
    expect(state.loading).toBe(false);
    expect(state.error).toBe('Fetch failed');
  });

  // -------------------- fetchDicomStores --------------------------
  it('should fetch dicom stores successfully', async () => {
    const store = createStore();
    const mockResponse = { StoreA: ['DS1'], StoreB: ['DS2', 'DS3'] };

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      json: () => Promise.resolve(mockResponse),
    }));

    await store.dispatch(fetchDicomStores());

    const state = store.getState().qa;
    expect(state.loading).toBe(false);
    expect(state.dicomStores).toEqual(['DS1', 'DS2', 'DS3']);
  });

  it('should handle fetchDicomStores failure', async () => {
    const store = createStore();

    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));

    await store.dispatch(fetchDicomStores());

    const state = store.getState().qa;
    expect(state.loading).toBe(false);
    expect(state.error).toBe(null);
  });

  // -------------------- updateDicomStore -------------------------
  it('should update dicom store address', async () => {
    const store = createStore();

    (vi.mocked(apiClient.patch) as any).mockResolvedValue({});

    await store.dispatch(updateDicomStore('http://new-dicom'));

    const state = store.getState().qa;
    expect(state.dicomStoreAddress).toBe('http://new-dicom');
  });

  it('should handle updateDicomStore failure', async () => {
    const store = createStore();

    (vi.mocked(apiClient.patch) as any).mockRejectedValue(new Error('Patch failed'));

    await store.dispatch(updateDicomStore('http://fail-dicom'));

    const state = store.getState().qa;
    expect(state.error).toBe(null);
  });

  // -------------------- addQAParameter ----------------------------
  it('should add a new QA parameter', async () => {
    const store = createStore();
    const newParam = { id: '2', barcode: 'B002', activationCode: 'AC002' };

    (vi.mocked(apiClient.post) as any).mockResolvedValue({ data: newParam });

    await store.dispatch(addQAParameter({ barcode: 'B002', activationCode: 'AC002' }));

    const state = store.getState().qa;
    expect(state.qaParameters).toContainEqual(newParam);
  });

  // -------------------- updateQAParameter -------------------------
  it('should update an existing QA parameter', async () => {
    const store = createStore();

    // Seed store with one QA param
    store.dispatch({
      type: addQAParameter.fulfilled.type,
      payload: { id: '3', barcode: 'B003', activationCode: 'OLD' },
    });

    await store.dispatch(updateQAParameter({ barcode: 'B003', activationCode: 'NEW' }));

    const state = store.getState().qa;
    expect(state.qaParameters.find(p => p.barcode === 'B003')?.activationCode).toBe('NEW');
  });

  // -------------------- deleteQAParameter -------------------------
  it('should delete a QA parameter', async () => {
    const store = createStore();

    // Seed store with one QA param
    store.dispatch({
      type: addQAParameter.fulfilled.type,
      payload: { id: '4', barcode: 'B004', activationCode: 'AC004' },
    });

    await store.dispatch(deleteQAParameter('B004'));

    const state = store.getState().qa;
    expect(state.qaParameters.find(p => p.barcode === 'B004')).toBeUndefined();
  });
});