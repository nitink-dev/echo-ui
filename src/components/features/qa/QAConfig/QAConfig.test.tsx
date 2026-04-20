import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { QAConfig } from './QAConfig';

/* =========================================================
   MOCK: usePermissions
   REQUIRED because:
   - QAConfig uses canWrite
   - QAParameterTable uses canWrite + canDelete
========================================================= */
vi.mock('../../../../hooks/usePermissions', () => ({
  usePermissions: () => ({
    canWrite: () => true,
    canDelete: () => true,
  }),
}));

/* =========================================================
   MOCK: useQAConfig
   QAConfig DOES NOT read Redux directly
========================================================= */
const mockHandleAddParameter = vi.fn();

vi.mock('./useQAConfig', () => ({
  useQAConfig: () => ({
    qaParameters: [
      { id: '1', barcode: 'QA-001', activationCode: 'ACT-001' },
      { id: '2', barcode: 'QA-002', activationCode: 'ACT-002' },
    ],
    dicomStores: ['store1', 'store2'],
    dicomStoreAddress: 'store1',

    parameterModalOpen: false,
    editingParameter: null,
    parameterFormData: {},
    parameterErrors: {},
    deleteDialogOpen: false,
    parameterToDelete: null,
    visibleActivationCodes: {},

    setParameterModalOpen: vi.fn(),
    setDeleteDialogOpen: vi.fn(),

    handleAddParameter: mockHandleAddParameter,
    handleEditParameter: vi.fn(),
    handleParameterInputChange: vi.fn(),
    handleSaveParameter: vi.fn(),
    handleDeleteClick: vi.fn(),
    handleDeleteCancel: vi.fn(),
    handleDeleteConfirm: vi.fn(),
    toggleActivationCodeVisibility: vi.fn(),
    handleSaveDicomStore: vi.fn(),
  }),
}));

/* =========================================================
   TESTS
========================================================= */
describe('QAConfig Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders QA configuration page heading', () => {
    render(<QAConfig />);
    expect(
      screen.getByText('Slide Image Analysis')
    ).toBeInTheDocument();
  });

  test('renders QA parameters in table', () => {
    render(<QAConfig />);
    expect(screen.getByText('QA-001')).toBeInTheDocument();
    expect(screen.getByText('QA-002')).toBeInTheDocument();
  });

  test('shows Add New button when user has permission', () => {
    render(<QAConfig />);
    expect(screen.getByText('Add New')).toBeInTheDocument();
  });

  test('calls handleAddParameter when Add New is clicked', async () => {
    render(<QAConfig />);

    fireEvent.click(screen.getByText('Add New'));

    await waitFor(() => {
      expect(mockHandleAddParameter).toHaveBeenCalled();
    });
  });

  test('renders DICOM store configuration section', () => {
    render(<QAConfig />);
    expect(
      screen.getByText('DICOM Store for QA')
    ).toBeInTheDocument();
  });
});
``