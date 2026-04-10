import { renderHook, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import * as qaSlice from '../../../../store/slices/qaSlice';
import { useQAConfig } from './useQAConfig';
import { beforeEach, describe, expect, test, vi } from 'vitest';

vi.mock('../../../../store/slices/qaSlice');

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('useQAConfig Hook', () => {
  let store: any;

  const mockQAState = {
    qa: {
      qaParameters: [
        { id: '1', barcode: 'QA-001', activationCode: 'ACT-001' },
      ],
      dicomStores: ['store1', 'store2'],
      dicomStoreAddress: 'store1',
    },
  };

  beforeEach(() => {
    store = configureStore({
      reducer: {
        qa: (state = mockQAState.qa) => state,
      },
    });

    (qaSlice.fetchQAParameters as vi.Mock).mockReturnValue({
      type: 'fetchQAParameters',
    });
    (qaSlice.fetchDicomStores as vi.Mock).mockReturnValue({
      type: 'fetchDicomStores',
    });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );

  test('fetches QA parameters and DICOM stores on mount', () => {
    renderHook(() => useQAConfig(), { wrapper });

    expect(qaSlice.fetchQAParameters).toHaveBeenCalled();
    expect(qaSlice.fetchDicomStores).toHaveBeenCalled();
  });

  test('handleAddParameter opens modal with empty form', () => {
    const { result } = renderHook(() => useQAConfig(), { wrapper });

    act(() => {
      result.current.handleAddParameter();
    });

    expect(result.current.parameterModalOpen).toBe(true);
    expect(result.current.editingParameter).toBeNull();
    expect(result.current.parameterFormData.barcode).toBe('');
  });

  test('handleEditParameter opens modal with parameter data', () => {
    const { result } = renderHook(() => useQAConfig(), { wrapper });

    const parameter = {
      id: '1',
      barcode: 'QA-001',
      activationCode: 'ACT-001',
    };

    act(() => {
      result.current.handleEditParameter(parameter);
    });

    expect(result.current.parameterModalOpen).toBe(true);
    expect(result.current.editingParameter).toEqual(parameter);
    expect(result.current.parameterFormData.barcode).toBe('QA-001');
  });

  test('toggleActivationCodeVisibility toggles visibility', () => {
    const { result } = renderHook(() => useQAConfig(), { wrapper });

    act(() => {
      result.current.toggleActivationCodeVisibility('1');
    });

    expect(result.current.visibleActivationCodes['1']).toBe(true);

    act(() => {
      result.current.toggleActivationCodeVisibility('1');
    });

    expect(result.current.visibleActivationCodes['1']).toBe(false);
  });
});
