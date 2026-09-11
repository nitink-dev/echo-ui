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
  research: boolean;
  connected: boolean;
  storageStrategy: string;
  remoteAeTitle: string;
  remoteHost: string;
  remotePort: string;
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
  research: false,
  connected: false,
  storageStrategy: 'STOW-RS',
  remoteAeTitle: '',
  remoteHost: '',
  remotePort: ''
};

const requiredFields = ['name', 'aeTitle', 'hospitalName', 'department', 'location', 'deviceSerialNumber','dicomStore'];
const CSTORE_REQUIRED_FIELDS = ['remoteAeTitle', 'remoteHost', 'remotePort'];

export function useScannerForm(scanner?: SlideScanner) {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [originalData, setOriginalData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (scanner) {
      const initialData: FormData = {
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
        research: scanner.research || false,
        connected: scanner.connected || false,
        storageStrategy: scanner.storageStrategy || 'STOW-RS',
        remoteAeTitle: scanner.remoteAeTitle || '',
        remoteHost: scanner.remoteHost || '',
        remotePort: scanner.remotePort != null ? String(scanner.remotePort) : ''
      };
      setFormData(initialData);
      setOriginalData(initialData);
    }
  }, [scanner]);

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => {
      const updated = {
        ...prev,
        [field]: value,
        ...(field === 'department' ? { dicomStore: '' } : {}), 
       
      };
      return updated;
    });
    setIsDirty(true);

    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const setFieldError = (field: string, error: string) => {
    if (error) {
      setErrors(prev => ({ ...prev, [field]: error }));
    } else {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const getChangedFields = (): Partial<FormData> => {
    const changed: Partial<FormData> = {};
    
    (Object.keys(formData) as Array<keyof FormData>).forEach(key => {
      if (formData[key] !== originalData[key]) {
        changed[key] = formData[key];
      }
    });
    
    return changed;
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

    if (formData.storageStrategy === 'C-STORE') {
      CSTORE_REQUIRED_FIELDS.forEach((field) => {
        const value = formData[field as keyof FormData];
        if (typeof value === 'string' && !value.trim()) {
          newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')} is required`;
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    if (scanner) {
      const resetData: FormData = {
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
        research: scanner.research || false,
        connected: scanner.connected || false,
        storageStrategy: scanner.storageStrategy || 'STOW-RS',
        remoteAeTitle: scanner.remoteAeTitle || '',
        remoteHost: scanner.remoteHost || '',
        remotePort: scanner.remotePort != null ? String(scanner.remotePort) : ''
      };
      setFormData(resetData);
      setOriginalData(resetData);
    } else {
      setFormData(initialFormData);
      setOriginalData(initialFormData);
    }
    setErrors({});
    setIsDirty(false);
  };

  const isFormValid = useMemo(() => {
    const allRequiredFieldsValid = requiredFields.every(field => {
      const value = formData[field as keyof FormData];
      return typeof value === 'string' && value.trim();
    });
    const cstoreFieldsValid =
      formData.storageStrategy !== 'C-STORE' ||
      CSTORE_REQUIRED_FIELDS.every(field => {
        const value = formData[field as keyof FormData];
        return typeof value === 'string' && value.trim();
      });
    return allRequiredFieldsValid && cstoreFieldsValid && Object.keys(errors).length === 0;
  }, [formData, errors]);

  return {
    formData,
    originalData,
    errors,
    isDirty,
    isFormValid,
    handleInputChange,
    validateForm,
    resetForm,
    setFieldError,
    getChangedFields
  };
}