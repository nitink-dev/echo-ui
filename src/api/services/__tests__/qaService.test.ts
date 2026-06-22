import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';

vi.mock('../apiClient', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  }
}));

import { qaService } from '../qaService';
import qaReducer, {
  fetchQAParameters,
  fetchDicomStores,
  addQAParameter,
  updateQAParameter,
  deleteQAParameter,
  updateDicomStore,
} from '../../../store/slices/qaSlice';
import { QASlideParameter } from '../../../types';
import { BASE_URL } from '../../../utils/constants';
import apiClient from '../apiClient';
import { configureStore } from '@reduxjs/toolkit';

describe('qaService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchParameters', () => {
    it('returns QA parameters from API response', async () => {
      const mockData: QASlideParameter[] = [
        {
          id: '1',
          barcode: 'ABC123',
          activationCode: 'ACT123',
          dicomWebUrl: 'https://dicom.test'
        }
      ];

      vi.mocked(apiClient.get).mockResolvedValue({
        data: mockData
      });

      const result = await qaService.fetchParameters();

      expect(vi.mocked(apiClient.get)).toHaveBeenCalledWith(
        `${BASE_URL}/api/slides`
      );
      expect(result).toEqual(mockData);
    });
  });

  describe('addParameter', () => {
    it('adds a QA parameter and maps response correctly', async () => {
      const payload = {
        barcode: 'BAR001',
        activationCode: 'ACT001'
      };

      vi.mocked(apiClient.post).mockResolvedValue({
        data: {
          id: '10',
          barcode: 'BAR001',
          activationCode: 'ACT001',
          dicomWebUrl: 'https://dicom.new'
        }
      });

      const result = await qaService.addParameter(payload);

      expect(vi.mocked(apiClient.post)).toHaveBeenCalledWith(
        `${BASE_URL}/api/slides`,
        payload
      );

      expect(result).toEqual({
        id: '10',
        barcode: 'BAR001',
        activationCode: 'ACT001',
        dicomWebUrl: 'https://dicom.new'
      });
    });
  });

  describe('updateParameter', () => {
    it('updates QA parameter and returns payload', async () => {
      const payload = {
        barcode: 'BAR002',
        activationCode: 'ACT002'
      };

      vi.mocked(apiClient.put).mockResolvedValue({});

      const result = await qaService.updateParameter(payload);

      expect(vi.mocked(apiClient.put)).toHaveBeenCalledWith(
        `${BASE_URL}/api/slides/BAR002`,
        payload
      );
      expect(result).toEqual(payload);
    });
  });

  describe('deleteParameter', () => {
    it('deletes QA parameter and returns barcode', async () => {
      vi.mocked(apiClient.delete).mockResolvedValue({});

      const result = await qaService.deleteParameter('BAR003');

      expect(vi.mocked(apiClient.delete)).toHaveBeenCalledWith(
        `${BASE_URL}/api/slides/BAR003`
      );
      expect(result).toBe('BAR003');
    });
  });

  describe('updateDicomStore', () => {
    it('updates dicom store URL after trimming input', async () => {
      const dicomStoreAddress = '  https://dicom.store/path  ';
      const trimmed = 'https://dicom.store/path';

      vi.mocked(apiClient.patch).mockResolvedValue({});

      const result = await qaService.updateDicomStore(dicomStoreAddress);

      expect(vi.mocked(apiClient.patch)).toHaveBeenCalledWith(
        `${BASE_URL}/api/config/path-qa/dicom-store`,
        {
          'gcp-config.pathqa-store-url': trimmed
        }
      );
      expect(result).toBe(dicomStoreAddress);
    });
  });

  describe('error handling', () => {
    it('propagates errors from fetchParameters', async () => {
      vi.mocked(apiClient.get).mockRejectedValue(new Error('Network error'));
      await expect(qaService.fetchParameters()).rejects.toThrow('Network error');
    });
  });
});

describe('qaSlice', () => {
  const createStore = () =>
    configureStore({
      reducer: { qa: qaReducer },
    });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return initial qa state', () => {
    const store = createStore();
    expect(store.getState().qa).toEqual({
      qaParameters: [],
      dicomStoreAddress: '',
      dicomStores: [],
      loading: false,
      error: null,
    });
  });

  it('should handle fetchQAParameters with qaSlides wrapper', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: {
        qaSlides: [{ id: '1', barcode: 'BC1', activationCode: 'AC1' }],
        dicomUrl: 'https://dicom.store',
      },
    });

    const store = createStore();
    await store.dispatch(fetchQAParameters() as any);

    const state = store.getState().qa;
    expect(state.qaParameters).toHaveLength(1);
    expect(state.qaParameters[0].dicomWebUrl).toBe('https://dicom.store');
    expect(state.dicomStoreAddress).toBe('https://dicom.store');
  });

  it('should handle fetchQAParameters with array response', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: [{ id: '1', barcode: 'BC1', activationCode: 'AC1' }],
    });

    const store = createStore();
    await store.dispatch(fetchQAParameters() as any);

    expect(store.getState().qa.qaParameters).toHaveLength(1);
  });

  it('should handle fetchQAParameters failure', async () => {
    vi.mocked(apiClient.get).mockRejectedValue(new Error('Server error'));

    const store = createStore();
    await store.dispatch(fetchQAParameters() as any);

    expect(store.getState().qa.error).toBe('Server error');
    expect(store.getState().qa.loading).toBe(false);
  });

  it('should fetch dicom stores into state', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: { Radiology: ['store1', 'store2'], Pathology: ['store3'] },
    });

    const store = createStore();
    await store.dispatch(fetchDicomStores() as any);

    expect(store.getState().qa.dicomStores).toEqual(['store1', 'store2', 'store3']);
  });

  it('should add QA parameter on addQAParameter fulfilled', async () => {
    const param = { id: '1', barcode: 'BC1', activationCode: 'AC1' };
    vi.mocked(apiClient.post).mockResolvedValue({ data: param });

    const store = createStore();
    await store.dispatch(addQAParameter({ barcode: 'BC1', activationCode: 'AC1' }) as any);

    expect(store.getState().qa.qaParameters).toHaveLength(1);
  });

  it('should update QA parameter activation code', async () => {
    const store = createStore();
    store.dispatch({
      type: fetchQAParameters.fulfilled.type,
      payload: {
        slides: [{ id: '1', barcode: 'BC1', activationCode: 'OLD' }],
        dicomUrl: '',
      },
    });

    vi.mocked(apiClient.put).mockResolvedValue({});

    await store.dispatch(
      updateQAParameter({ barcode: 'BC1', activationCode: 'NEW' }) as any
    );

    expect(store.getState().qa.qaParameters[0].activationCode).toBe('NEW');
  });

  it('should delete QA parameter', async () => {
    const store = createStore();
    store.dispatch({
      type: fetchQAParameters.fulfilled.type,
      payload: {
        slides: [
          { id: '1', barcode: 'BC1', activationCode: 'AC1' },
          { id: '2', barcode: 'BC2', activationCode: 'AC2' },
        ],
        dicomUrl: '',
      },
    });

    vi.mocked(apiClient.delete).mockResolvedValue({});

    await store.dispatch(deleteQAParameter('BC1') as any);

    expect(store.getState().qa.qaParameters).toHaveLength(1);
    expect(store.getState().qa.qaParameters[0].barcode).toBe('BC2');
  });

  it('should update dicom store address', async () => {
    vi.mocked(apiClient.patch).mockResolvedValue({});

    const store = createStore();
    await store.dispatch(updateDicomStore('  store-url  ') as any);

    expect(store.getState().qa.dicomStoreAddress).toBe('  store-url  ');
  });
});
