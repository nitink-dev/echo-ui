import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { ScannerForm } from './ScannerForm';
import { beforeEach, describe, expect, test, vi } from 'vitest';


describe('ScannerForm Component', () => {
  let store: any;
  const mockOnSave = vi.fn();
  const mockOnCancel = vi.fn();

  const mockMetadataState = {
    metadata: {
      hospitals: ['Hospital A', 'Hospital B'],
      locations: ['Location 1', 'Location 2'],
      departments: ['Pathology', 'Radiology'],
      dicomStores: {
        'Pathology': ['store1', 'store2']
      },
      loading: false
    }
  };

  beforeEach(() => {
    store = configureStore({
      reducer: {
        metadata: (state = mockMetadataState.metadata) => state
      }
    });
    vi.clearAllMocks();
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
      deviceSerialNumber: 'SN-001'
    };
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
      location: 'Location 1'
    };
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
    renderWithProvider(
      <ScannerForm onSave={mockOnSave} onCancel={mockOnCancel} />
    );
    
    const saveButton = screen.getByText('Save Scanner');
    expect(saveButton).toBeDisabled();
  });

  test('shows cancel confirmation dialog when form is dirty', async () => {
    renderWithProvider(
      <ScannerForm onSave={mockOnSave} onCancel={mockOnCancel} />
    );
    
    const nameInput = screen.getByLabelText(/Name of Scanner/i);
    fireEvent.change(nameInput, { target: { value: 'Test Scanner' } });
    
    const cancelButton = screen.getAllByText('Cancel')[0];
    fireEvent.click(cancelButton);
    
    await waitFor(() => {
      expect(screen.getByText('Unsaved Changes')).toBeInTheDocument();
    });
  });

  test('Reset button clears form', () => {
    renderWithProvider(
      <ScannerForm onSave={mockOnSave} onCancel={mockOnCancel} />
    );
    
    const nameInput = screen.getByLabelText(/Name of Scanner/i);
    fireEvent.change(nameInput, { target: { value: 'Test Scanner' } });
    
    const resetButton = screen.getByText('Reset');
    fireEvent.click(resetButton);
    
    expect(nameInput).toHaveValue('');
  });
});