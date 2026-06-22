import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { QAParameterForm } from './QAParameterForm';    
import { beforeEach, describe, expect, test, vi } from 'vitest';

describe('QAParameterForm Component', () => {
  const mockProps = {
    open: true,
    onOpenChange: vi.fn(),
    editingParameter: null,
    formData: { barcode: '', activationCode: '' },
    errors: {},
    onInputChange: vi.fn(),
    onSave: vi.fn()
  };

  test('renders form in add mode', () => {
    render(<QAParameterForm {...mockProps} />);
    expect(screen.getByText('Add New QA Parameter')).toBeInTheDocument();
  });

  test('renders form in edit mode', () => {
    const editProps = {
      ...mockProps,
      editingParameter: { id: '1', barcode: 'QA-001', activationCode: 'ACT-001' }
    };
    render(<QAParameterForm {...editProps} />);
    expect(screen.getByText('Edit QA Parameter')).toBeInTheDocument();
  });

  test('barcode input is disabled in edit mode', () => {
    const editProps = {
      ...mockProps,
      editingParameter: { id: '1', barcode: 'QA-001', activationCode: 'ACT-001' }
    };
    render(<QAParameterForm {...editProps} />);
    const barcodeInput = screen.getByLabelText(/QA Slide Barcode/i);
    expect(barcodeInput).toBeDisabled();
  });

  test('calls onInputChange when barcode is typed', () => {
    render(<QAParameterForm {...mockProps} />);
    const barcodeInput = screen.getByLabelText(/QA Slide Barcode/i);
    fireEvent.change(barcodeInput, { target: { value: 'QA-003' } });
    expect(mockProps.onInputChange).toHaveBeenCalledWith('barcode', 'QA-003');
  });

  test('displays validation errors', () => {
    const errorProps = {
      ...mockProps,
      errors: { barcode: 'Barcode is required', activationCode: 'Code is required' }
    };
    render(<QAParameterForm {...errorProps} />);
    expect(screen.getByText('Barcode is required')).toBeInTheDocument();
    expect(screen.getByText('Code is required')).toBeInTheDocument();
  });

  test('calls onSave when Save button is clicked', () => {
    render(<QAParameterForm {...mockProps} />);
    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);
    expect(mockProps.onSave).toHaveBeenCalled();
  });

  test('calls onOpenChange when Cancel is clicked', () => {
    render(<QAParameterForm {...mockProps} />);
    fireEvent.click(screen.getByText('Cancel'));
    expect(mockProps.onOpenChange).toHaveBeenCalledWith(false);
  });

  test('populates form fields from formData', () => {
    const props = {
      ...mockProps,
      formData: { barcode: 'QA-003', activationCode: 'ACT-003' },
    };
    render(<QAParameterForm {...props} />);
    expect(screen.getByDisplayValue('QA-003')).toBeInTheDocument();
    expect(screen.getByDisplayValue('ACT-003')).toBeInTheDocument();
  });
});