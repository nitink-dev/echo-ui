import { describe, it, expect, vi, beforeEach } from 'vitest';
import reducer, {
  fetchScanners,
  addScanner,
  updateScanner,
  deleteScanner,
  checkScannerExists,
} from '../scannerSlice';
import { scannerService } from '../../../api/services/scannerService';
import { SlideScanner } from '../../../types';

vi.mock('../../../api/services/scannerService', () => ({
  scannerService: {
    fetchAll: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('../../../api/services/apiClient');
import apiClient from '../../../api/services/apiClient';

const mockScanner: SlideScanner = {
  deviceSerialNumber: 'ABC123',
  name: 'Test Scanner',
} as SlideScanner;

describe('scannerSlice', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  //
  // 🔹 Reducer tests
  //
  it('should return initial state', () => {
    const state = reducer(undefined, { type: 'unknown' });
    expect(state).toEqual({
      items: [],
      loading: false,
      error: null,
    });
  });

  it('should handle fetchScanners.pending', () => {
    const state = reducer(undefined, fetchScanners.pending('', undefined));
    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  it('should handle fetchScanners.fulfilled', () => {
    const state = reducer(undefined, fetchScanners.fulfilled([mockScanner], '', undefined));
    expect(state.loading).toBe(false);
    expect(state.items.length).toBe(1);
  });

  it('should handle fetchScanners.rejected', () => {
    const state = reducer(
      undefined,
      fetchScanners.rejected(null, '', undefined, 'Failed')
    );
    expect(state.loading).toBe(false);
    expect(state.error).toBe('Failed');
  });

  it('should add scanner on addScanner.fulfilled', () => {
    const state = reducer(
      { items: [], loading: false, error: null },
      addScanner.fulfilled(mockScanner, '', mockScanner)
    );
    expect(state.items[0].deviceSerialNumber).toBe('ABC123');
  });

  it('should update scanner on updateScanner.fulfilled', () => {
    const state = reducer(
      { items: [mockScanner], loading: false, error: null },
      updateScanner.fulfilled(
        { ...mockScanner, name: 'Updated' },
        '',
        { deviceSerialNumber: 'ABC123' }
      )
    );
    expect(state.items[0].name).toBe('Updated');
  });

  it('should delete scanner on deleteScanner.fulfilled', () => {
    const state = reducer(
      { items: [mockScanner], loading: false, error: null },
      deleteScanner.fulfilled('ABC123', '', 'ABC123')
    );
    expect(state.items.length).toBe(0);
  });

  //
  // 🔹 Thunk tests
  //
  it('fetchScanners success', async () => {
    (scannerService.fetchAll as any).mockResolvedValue([mockScanner]);

    const dispatch = vi.fn();
    const getState = vi.fn();

    const result = await fetchScanners()(dispatch, getState, undefined);

    expect(scannerService.fetchAll).toHaveBeenCalled();
    expect(result.type).toBe('scanners/fetchScanners/fulfilled');
  });

  it('fetchScanners failure', async () => {
    (scannerService.fetchAll as any).mockRejectedValue(new Error('API error'));

    const dispatch = vi.fn();
    const getState = vi.fn();

    const result = await fetchScanners()(dispatch, getState, undefined);

    expect(result.type).toBe('scanners/fetchScanners/rejected');
  });

  it('addScanner success', async () => {
    (scannerService.create as any).mockResolvedValue(mockScanner);

    const result = await addScanner(mockScanner)(
      vi.fn(),
      vi.fn(),
      undefined
    );

    expect(result.type).toBe('scanners/addScanner/fulfilled');
  });

  it('updateScanner success', async () => {
    (vi.mocked(apiClient.patch) as any).mockResolvedValue({ data: mockScanner });

    const result = await updateScanner({
      deviceSerialNumber: 'ABC123',
      name: 'Updated',
    })(vi.fn(), vi.fn(), undefined);

    expect(vi.mocked(apiClient.patch)).toHaveBeenCalled();
    expect(result.type).toBe('scanners/updateScanner/fulfilled');
  });

  it('deleteScanner success', async () => {
    (scannerService.delete as any).mockResolvedValue(undefined);

    const result = await deleteScanner('ABC123')(
      vi.fn(),
      vi.fn(),
      undefined
    );

    expect(result.type).toBe('scanners/deleteScanner/fulfilled');
  });

  it('checkScannerExists true', async () => {
    (vi.mocked(apiClient.get) as any).mockResolvedValue({ data: { id: 1 } });

    const result = await checkScannerExists('ABC123')(
      vi.fn(),
      vi.fn(),
      undefined
    );

    expect(result.payload).toBe(true);
  });

  it('checkScannerExists false on 404', async () => {
    (vi.mocked(apiClient.get) as any).mockRejectedValue({
      response: { status: 404 },
    });
  
    const result = await checkScannerExists('ABC123')(
      vi.fn(),
      vi.fn(),
      undefined
    );
  
    expect(result.payload).toBe(false);
  });
});