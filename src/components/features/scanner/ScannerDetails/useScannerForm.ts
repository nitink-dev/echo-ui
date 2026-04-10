import { useState, useEffect, useMemo } from 'react';
import { SlideScanner } from '../../../../types/scanner.types';
import { FormErrors } from '../../../../types/common.types';

interface FormData {
  name: string;
  aeTitle: string;
  model: string;
  hospitalName: string;
  department: string;
  location: string;
  deviceSerialNumber: string;
  ipAddress: string;
  port: string;
  vendor: string;
  dicomStore: string;
  otherIdentifier: string;
  research: boolean;
  connected: boolean;
}

const initialFormData: FormData = {
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
  connected: false
};

const requiredFields = ['name', 'aeTitle', 'hospitalName', 'department', 'location', 'deviceSerialNumber', 'dicomStore'];

export function useScannerForm(scanner?: SlideScanner) {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (scanner) {
      setFormData({
        name: scanner.name || '',
        aeTitle: scanner.aeTitle || '',
        model: scanner.model || '',
        hospitalName: scanner.hospitalName || '',
        department: scanner.department || '',
        location: scanner.location || '',
        deviceSerialNumber: scanner.deviceSerialNumber || '',
        dicomStore: scanner.dicomStore || '',
        ipAddress: scanner.ipAddress || '',
        port: scanner.port || '',
        vendor: scanner.vendor || '',
        otherIdentifier: scanner.otherIdentifier || '',
        research: scanner.research || false,
        connected: scanner.connected || false
      });
    }
  }, [scanner]);

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
      ...(field === 'department' ? { dicomStore: '' } : {}) 
    }));
    setIsDirty(true);

    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    requiredFields.forEach((field) => {
      const value = formData[field as keyof FormData];
      if (typeof value === 'string' && !value.trim()) {
        newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')} is required`;
      }
    });

    if (formData.aeTitle && !/^[A-Z0-9_]+$/.test(formData.aeTitle)) {
      newErrors.aeTitle = 'AE Title must contain only uppercase letters, numbers, and underscores';
    }

    if (formData.deviceSerialNumber && formData.deviceSerialNumber.length < 3) {
      newErrors.deviceSerialNumber = 'Device Serial Number must be at least 3 characters long';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    if (scanner) {
      setFormData({
        name: scanner.name || '',
        aeTitle: scanner.aeTitle || '',
        model: scanner.model || '',
        hospitalName: scanner.hospitalName || '',
        department: scanner.department || '',
        location: scanner.location || '',
        deviceSerialNumber: scanner.deviceSerialNumber || '',
        dicomStore: scanner.dicomStore || '',
        ipAddress: scanner.ipAddress || '',
        port: scanner.port || '',
        vendor: scanner.vendor || '',
        otherIdentifier: scanner.otherIdentifier || '',
        research: scanner.research || false,
        connected: scanner.connected || false
      });
    } else {
      setFormData(initialFormData);
    }
    setErrors({});
    setIsDirty(false);
  };

  const isFormValid = useMemo(() => {
    return requiredFields.every(field => {
      const value = formData[field as keyof FormData];
      return typeof value === 'string' && value.trim();
    }) && Object.keys(errors).length === 0;
  }, [formData, errors]);

  return {
    formData,
    errors,
    isDirty,
    isFormValid,
    handleInputChange,
    validateForm,
    resetForm
  };
}