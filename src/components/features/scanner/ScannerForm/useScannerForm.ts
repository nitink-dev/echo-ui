import { useState, useEffect } from 'react';
import { SlideScanner } from '../../../../types/scanner.types';
import { FormErrors } from '../../../../types/common.types';
import { REQUIRED_SCANNER_FIELDS } from '../../../../utils/constants';
import { validateRequiredFields, validateScannerForm } from '../../../../utils/validation';

interface ScannerFormData {
  name: string;
  aeTitle: string;
  model: string;
  hospitalName: string;
  department: string;
  location: string;
  deviceSerialNumber: string;
  dicomStore: string;
  ipAddress: string;
  port: string;
  vendor: string;
  otherIdentifier: string;
}

const initialFormData: ScannerFormData = {
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
  otherIdentifier: ''
};

export const useScannerForm = (scanner?: SlideScanner) => {
  const [formData, setFormData] = useState<ScannerFormData>(initialFormData);
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
        otherIdentifier: scanner.otherIdentifier || ''
      });
    }
  }, [scanner]);

  const handleInputChange = (field: keyof ScannerFormData, value: string) => {
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
    const requiredErrors = validateRequiredFields(formData, REQUIRED_SCANNER_FIELDS);
    const validationErrors = validateScannerForm(formData);
    
    const allErrors = { ...requiredErrors, ...validationErrors };
    setErrors(allErrors);
    
    return Object.keys(allErrors).length === 0;
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
        otherIdentifier: scanner.otherIdentifier || ''
      });
    } else {
      setFormData(initialFormData);
    }
    setErrors({});
    setIsDirty(false);
  };

  const isFormValid = REQUIRED_SCANNER_FIELDS.every(
    field => formData[field as keyof ScannerFormData].trim()
  ) && Object.keys(errors).length === 0;

  return {
    formData,
    errors,
    isDirty,
    isFormValid,
    handleInputChange,
    validateForm,
    resetForm
  };
};