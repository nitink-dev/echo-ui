import { renderHook, act } from '@testing-library/react';
import { useScannerForm } from './useScannerForm';
import { beforeEach, describe, expect, test, vi } from 'vitest';


describe('useScannerForm Hook', () => {
  test('initializes with empty form data', () => {
    const { result } = renderHook(() => useScannerForm());
    
    expect(result.current.formData.name).toBe('');
    expect(result.current.formData.aeTitle).toBe('');
    expect(result.current.isDirty).toBe(false);
  });

  test('initializes with scanner data when provided', () => {
    const scanner = {
      id: '1',
      name: 'Scanner 1',
      aeTitle: 'SCAN1',
      deviceSerialNumber: 'SN-001'
    };
    const { result } = renderHook(() => useScannerForm(scanner));
    
    expect(result.current.formData.name).toBe('Scanner 1');
    expect(result.current.formData.aeTitle).toBe('SCAN1');
  });

  test('handleInputChange updates form data and sets dirty flag', () => {
    const { result } = renderHook(() => useScannerForm());
    
    act(() => {
      result.current.handleInputChange('name', 'New Scanner');
    });
    
    expect(result.current.formData.name).toBe('New Scanner');
    expect(result.current.isDirty).toBe(true);
  });

  test('handleInputChange clears error for changed field', () => {
    const { result } = renderHook(() => useScannerForm());
    
    act(() => {
      result.current.validateForm();
    });
    
    expect(Object.keys(result.current.errors).length).toBeGreaterThan(0);
    
    act(() => {
      result.current.handleInputChange('name', 'Scanner Name');
    });
    
    expect(result.current.errors.name).toBe('');

  });

  test('validateForm returns false when required fields are empty', () => {
    const { result } = renderHook(() => useScannerForm());
    
    let isValid = false;
    act(() => {
      isValid = result.current.validateForm();
    });
    
    expect(isValid).toBe(false);
    expect(Object.keys(result.current.errors).length).toBeGreaterThan(0);
  });

  test('resetForm clears all data', () => {
    const { result } = renderHook(() => useScannerForm());
    
    act(() => {
      result.current.handleInputChange('name', 'Test');
      result.current.resetForm();
    });
    
    expect(result.current.formData.name).toBe('');
    expect(result.current.isDirty).toBe(false);
  });

  test('isFormValid returns true when all required fields are filled', () => {
    const scanner = {
        name: 'Scanner A',
        aeTitle: 'SCAN_AE',
        model: 'CT-64',
        hospitalName: 'AIIMS Delhi',
        department: 'Radiology',
        location: 'Wing B - Room 12',
        deviceSerialNumber: 'SERIAL-12345',
        dicomStore: 'store1',
        ipAddress: '10.0.0.12',
        port: '104',
        vendor: 'Siemens',
      };
      
    const { result } = renderHook(() => useScannerForm(scanner));
    
    expect(result.current.isFormValid).toBe(true);
  });

  test('department change clears dicomStore', () => {
    const { result } = renderHook(() => useScannerForm());
    
    act(() => {
      result.current.handleInputChange('department', 'Pathology');
      result.current.handleInputChange('dicomStore', 'store1');
    });
    
    expect(result.current.formData.dicomStore).toBe('store1');
    
    act(() => {
      result.current.handleInputChange('department', 'Radiology');
    });
    
    expect(result.current.formData.dicomStore).toBe('');
  });
});