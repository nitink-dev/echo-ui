import { FormErrors } from '../types/common.types';

export const validateIPAddress = (ip: string): boolean => {
  const ipRegex = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  return ipRegex.test(ip);
};

export const validatePort = (port: string): boolean => {
  const portNum = parseInt(port);
  return !isNaN(portNum) && portNum >= 1 && portNum <= 65535;
};

export const validateAETitle = (aeTitle: string): boolean => {
  return /^[A-Z0-9_]+$/.test(aeTitle);
};

export const validateRequiredFields = (
  formData: Record<string, any>,
  requiredFields: string[]
): FormErrors => {
  const errors: FormErrors = {};
  
  requiredFields.forEach((field) => {
    if (!formData[field]?.trim()) {
      const fieldName = field
        .charAt(0)
        .toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1');
      errors[field] = `${fieldName} is required`;
    }
  });
  
  return errors;
};

export const validateScannerForm = (formData: any): FormErrors => {
  const errors: FormErrors = {};

  if (formData.aeTitle && !validateAETitle(formData.aeTitle)) {
    errors.aeTitle = 'AE Title must contain only uppercase letters, numbers, and underscores';
  }

  if (formData.deviceSerialNumber && formData.deviceSerialNumber.length < 3) {
    errors.deviceSerialNumber = 'Device Serial Number must be at least 3 characters long';
  }

  return errors;
};

export const validateQAParameter = (formData: any, existingBarcodes: string[], editingId?: string): FormErrors => {
  const errors: FormErrors = {};

  if (!formData.barcode.trim()) {
    errors.barcode = 'QA Slide Barcode is required';
  } else if (formData.barcode.length < 5) {
    errors.barcode = 'Barcode must be at least 5 characters long';
  }

  if (!formData.activationCode.trim()) {
    errors.activationCode = 'Activation Code is required';
  } else if (formData.activationCode.length < 6) {
    errors.activationCode = 'Activation Code must be at least 6 characters long';
  }

  const isDuplicate = existingBarcodes.some(
    barcode => barcode === formData.barcode && barcode !== editingId
  );

  if (isDuplicate) {
    errors.barcode = 'This barcode already exists';
  }

  return errors;
};