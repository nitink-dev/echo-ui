import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { QAConfig } from './QAConfig';
import { beforeEach, describe, expect, test } from 'vitest';
const mockQAState = {
  qa: {
    qaParameters: [
      { id: '1', barcode: 'QA-001', activationCode: 'ACT-001' },
      { id: '2', barcode: 'QA-002', activationCode: 'ACT-002' }
    ],
    dicomStores: ['store1', 'store2'],
    dicomStoreAddress: 'store1'
  }
};

describe('QAConfig Component', () => {
  let store: any;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        qa: (state = mockQAState.qa) => state
      }
    });
  });

  const renderWithProvider = (component: React.ReactElement) => {
    return render(<Provider store={store} children={undefined}>{component}</Provider>);
  };

  test('renders QA configuration page', () => {
    renderWithProvider(<QAConfig />);
    expect(screen.getByText('Slide Image Analysis')).toBeInTheDocument();
  });

  test('displays QA parameters in table', () => {
    renderWithProvider(<QAConfig />);
    expect(screen.getByText('QA-001')).toBeInTheDocument();
    expect(screen.getByText('QA-002')).toBeInTheDocument();
  });

  test('shows Add New button', () => {
    renderWithProvider(<QAConfig />);
    expect(screen.getByText('Add New')).toBeInTheDocument();
  });

  test('opens parameter form when Add New is clicked', () => {
    renderWithProvider(<QAConfig />);
    const addButton = screen.getByText('Add New');
    fireEvent.click(addButton);
    
    waitFor(() => {
      expect(screen.getByText('Add New QA Parameter')).toBeInTheDocument();
    });
  });

  test('displays DICOM store configuration', () => {
    renderWithProvider(<QAConfig />);
    expect(screen.getByText('DICOM Store for QA')).toBeInTheDocument();
  });
});