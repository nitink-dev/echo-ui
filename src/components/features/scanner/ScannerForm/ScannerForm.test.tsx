import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { ScannerForm } from './ScannerForm';
import { beforeEach, describe, expect, test, vi } from 'vitest';

vi.mock('../../../../store/slices/metadataSlice', () => ({
  fetchDicomStores: vi.fn(() => ({ type: 'metadata/fetchDicomStores' })),
  fetchHospitalMetadata: vi.fn(() => ({ type: 'metadata/fetchHospitalMetadata' })),
}));

vi.mock('../../../../store/slices/scannerSlice', () => ({
  checkScannerExists: vi.fn(() => ({ type: 'scanner/checkScannerExists' })),
}));

vi.mock('../../../../api/services/apiClient');

const mockUseScannerForm = vi.fn();
vi.mock('./useScannerForm', () => ({
  useScannerForm: (...args: any[]) => mockUseScannerForm(...args),
}));

const makeFormHook = (overrides = {}) => ({
  formData: {
    name: '',
    aeTitle: '',
    model: '',
    hospitalName: '',
    department: '',
    location: '',
    deviceSerialNumber: '',
    dicomStore: '',
    ipAddress: '',
    port: '',
    vendor: '',
    otherIdentifier: '',
    research: false,
    connected: false,
  },
  originalData: {},
  errors: {},
  isDirty: false,
  isFormValid: false,
  handleInputChange: vi.fn(),
  validateForm: vi.fn(() => true),
  resetForm: vi.fn(),
  setFieldError: vi.fn(),
  getChangedFields: vi.fn(() => ({})),
  ...overrides,
});

describe('ScannerForm Component', () => {
  let store: any;
  const mockOnSave = vi.fn();
  const mockOnCancel = vi.fn();

  const mockMetadataState = {
    hospitals: ['Hospital A', 'Hospital B'],
    locations: ['Location 1', 'Location 2'],
    departments: ['Pathology', 'Radiology'],
    dicomStores: {
      Pathology: ['store1', 'store2'],
    },
    loading: false,
  };

  const mockScannerState = {
    scanners: [],
    loading: false,
    error: null,
  };

  beforeEach(() => {
    store = configureStore({
      reducer: {
        metadata: (state = mockMetadataState) => state,
        scanner: (state = mockScannerState) => state,
      },
    });
    vi.clearAllMocks();
    mockUseScannerForm.mockReturnValue(makeFormHook());
  });

  const renderWithProvider = (component: React.ReactElement) => {
    return render(<Provider store={store}>{component}</Provider>);
  };

  test('renders form header in add mode', () => {
    renderWithProvider(
      <ScannerForm onSave={mockOnSave} onCancel={mockOnCancel} />
    );
    expect(screen.getByText('Add New Scanner')).toBeInTheDocument();
  });

  test('renders form header in edit mode', () => {
    const scanner = {
      id: '1',
      name: 'Scanner 1',
      aeTitle: 'SCAN1',
      deviceSerialNumber: 'SN-001',
    };
    mockUseScannerForm.mockReturnValue(
      makeFormHook({
        formData: {
          name: 'Scanner 1',
          aeTitle: 'SCAN1',
          deviceSerialNumber: 'SN-001',
          model: '',
          hospitalName: '',
          department: '',
          location: '',
          dicomStore: '',
          ipAddress: '',
          port: '',
          vendor: '',
          otherIdentifier: '',
          research: false,
          connected: false,
        },
      })
    );
    renderWithProvider(
      <ScannerForm
        scanner={scanner}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
        isEdit={true}
      />
    );
    expect(screen.getByText('Edit Scanner')).toBeInTheDocument();
  });

  test('populates form fields with scanner data in edit mode', () => {
    const scanner = {
      id: '1',
      name: 'Scanner 1',
      aeTitle: 'SCAN1',
      deviceSerialNumber: 'SN-001',
      hospitalName: 'Hospital A',
      department: 'Pathology',
      location: 'Location 1',
    };
    mockUseScannerForm.mockReturnValue(
      makeFormHook({
        formData: {
          name: 'Scanner 1',
          aeTitle: 'SCAN1',
          deviceSerialNumber: 'SN-001',
          model: '',
          hospitalName: 'Hospital A',
          department: 'Pathology',
          location: 'Location 1',
          dicomStore: '',
          ipAddress: '',
          port: '',
          vendor: '',
          otherIdentifier: '',
          research: false,
          connected: false,
        },
      })
    );
    renderWithProvider(
      <ScannerForm
        scanner={scanner}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
        isEdit={true}
      />
    );

    expect(screen.getByDisplayValue('Scanner 1')).toBeInTheDocument();
    expect(screen.getByDisplayValue('SCAN1')).toBeInTheDocument();
  });

  test('Save button is disabled when form is invalid', () => {
    mockUseScannerForm.mockReturnValue(makeFormHook({ isFormValid: false }));
    renderWithProvider(
      <ScannerForm onSave={mockOnSave} onCancel={mockOnCancel} />
    );

    const saveButton = screen.getByText('Save Scanner');
    expect(saveButton).toBeDisabled();
  });

  test('shows cancel confirmation dialog when form is dirty', async () => {
    mockUseScannerForm.mockReturnValue(makeFormHook({ isDirty: true }));

    renderWithProvider(
      <ScannerForm onSave={mockOnSave} onCancel={mockOnCancel} />
    );

    const cancelButtons = screen.getAllByText('Cancel');
    fireEvent.click(cancelButtons[cancelButtons.length - 1]);

    await waitFor(() => {
      expect(screen.getByText('Unsaved Changes')).toBeInTheDocument();
    });
  });

  test('Reset button clears form', () => {
    const resetForm = vi.fn();
    mockUseScannerForm.mockReturnValue(makeFormHook({ resetForm }));

    renderWithProvider(
      <ScannerForm onSave={mockOnSave} onCancel={mockOnCancel} />
    );

    const resetButton = screen.getByText('Reset');
    fireEvent.click(resetButton);

    expect(resetForm).toHaveBeenCalled();
  });
});