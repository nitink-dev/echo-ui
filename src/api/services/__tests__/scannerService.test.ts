import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';

vi.mock('../apiClient', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
  extractApiErrorMessage: vi.fn(),
  setUnauthorizedHandler: vi.fn(),
}));

import { scannerService } from '../scannerService';
import scannerReducer, {
  fetchScanners,
  addScanner,
  updateScanner,
  deleteScanner,
  checkScannerExists,
} from '../../../store/slices/scannerSlice';
import { BASE_URL } from '../../../utils/constants';
import apiClient from '../apiClient';
import { configureStore } from '@reduxjs/toolkit';

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

describe('scannerService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetchAll should return scanner list when API returns array', async () => {
    const mockData = [{ deviceSerialNumber: 'ABC123', name: 'Scanner 1' }];
    vi.mocked(apiClient.get).mockResolvedValue({ data: mockData });

    const result = await scannerService.fetchAll();

    expect(apiClient.get).toHaveBeenCalledWith(`${BASE_URL}/api/scanners`);
    expect(result).toEqual(mockData);
  });

  it('fetchAll should throw error if API response is not array', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: { invalid: true } });

    await expect(scannerService.fetchAll()).rejects.toThrow('Invalid API response: Expected array');
  });

  it('create should post scanner and return created scanner', async () => {
    const input = { deviceSerialNumber: 'XYZ123', name: 'New Scanner' };
    const responseData = { ...input, id: '1' };
    vi.mocked(apiClient.post).mockResolvedValue({ data: responseData });

    const result = await scannerService.create(input as any);

    expect(apiClient.post).toHaveBeenCalledWith(`${BASE_URL}/api/scanners`, input);
    expect(result).toEqual(responseData);
  });

  it('update should put scanner and return updated scanner', async () => {
    const scanner = { deviceSerialNumber: 'UPD123', name: 'Updated Scanner' };
    vi.mocked(apiClient.put).mockResolvedValue({ data: scanner });

    const result = await scannerService.update(scanner as any);

    expect(apiClient.put).toHaveBeenCalledWith(`${BASE_URL}/api/scanners/${scanner.deviceSerialNumber}`, scanner);
    expect(result).toEqual(scanner);
  });

  it('delete should call delete endpoint with serial number', async () => {
    vi.mocked(apiClient.delete).mockResolvedValue({});

    await scannerService.delete('DEL123');

    expect(apiClient.delete).toHaveBeenCalledWith(`${BASE_URL}/api/scanners/DEL123`);
  });

  it('fetchReports should return scanner reports', async () => {
    const reports = [{ id: 1, status: 'OK' }];
    vi.mocked(apiClient.get).mockResolvedValue({ data: reports });

    const result = await scannerService.fetchReports('REP123');

    expect(apiClient.get).toHaveBeenCalledWith(`${BASE_URL}/api/scanners/REP123/reports`);
    expect(result).toEqual(reports);
  });
});

describe('scannerSlice', () => {
  const createStore = () =>
    configureStore({
      reducer: { scanners: scannerReducer },
    });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return initial scanner state', () => {
    const store = createStore();
    expect(store.getState().scanners).toEqual({
      items: [],
      loading: false,
      error: null,
    });
  });

  it('should handle fetchScanners success', async () => {
    const scanners = [{ deviceSerialNumber: 'SN1', name: 'Scanner 1' }];
    vi.mocked(apiClient.get).mockResolvedValue({ data: scanners });

    const store = createStore();
    await store.dispatch(fetchScanners() as any);

    expect(store.getState().scanners.items).toEqual(scanners);
    expect(store.getState().scanners.loading).toBe(false);
  });

  it('should handle fetchScanners failure', async () => {
    vi.mocked(apiClient.get).mockRejectedValue(new Error('Fetch failed'));

    const store = createStore();
    await store.dispatch(fetchScanners() as any);

    const state = store.getState().scanners;
    expect(state.loading).toBe(false);
    expect(state.items).toEqual([]);
    expect(state.error).toBe('Fetch failed');
  });

  it('should add scanner on addScanner fulfilled', async () => {
    const scanner = { deviceSerialNumber: 'NEW1', name: 'New Scanner' };
    vi.mocked(apiClient.post).mockResolvedValue({ data: scanner });

    const store = createStore();
    await store.dispatch(addScanner(scanner as any) as any);

    expect(store.getState().scanners.items).toHaveLength(1);
    expect(store.getState().scanners.items[0].name).toBe('New Scanner');
  });

  it('should update scanner on updateScanner fulfilled', async () => {
    const store = createStore();
    store.dispatch({
      type: fetchScanners.fulfilled.type,
      payload: [{ deviceSerialNumber: 'SN1', name: 'Old Name' }],
    });

    vi.mocked(apiClient.patch).mockResolvedValue({
      data: { deviceSerialNumber: 'SN1', name: 'Updated Name' },
    });

    await store.dispatch(
      updateScanner({ deviceSerialNumber: 'SN1', name: 'Updated Name' } as any) as any
    );

    expect(store.getState().scanners.items[0].name).toBe('Updated Name');
  });

  it('should remove scanner on deleteScanner fulfilled', async () => {
    const store = createStore();
    store.dispatch({
      type: fetchScanners.fulfilled.type,
      payload: [
        { deviceSerialNumber: 'SN1', name: 'Scanner 1' },
        { deviceSerialNumber: 'SN2', name: 'Scanner 2' },
      ],
    });

    vi.mocked(apiClient.delete).mockResolvedValue({});

    await store.dispatch(deleteScanner('SN1') as any);

    expect(store.getState().scanners.items).toHaveLength(1);
    expect(store.getState().scanners.items[0].deviceSerialNumber).toBe('SN2');
  });

  it('should return false when scanner does not exist', async () => {
    vi.mocked(apiClient.get).mockRejectedValue({ response: { status: 404 } });

    const store = createStore();
    const result = await store.dispatch(checkScannerExists('MISSING') as any);

    expect(result.payload).toBe(false);
  });

  it('should return true when scanner exists', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: { deviceSerialNumber: 'SN1' } });

    const store = createStore();
    const result = await store.dispatch(checkScannerExists('SN1') as any);

    expect(result.payload).toBe(true);
  });
});