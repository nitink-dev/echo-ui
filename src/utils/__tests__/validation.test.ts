import { describe, it, expect } from 'vitest';
import {
  validateIPAddress,
  validatePort,
  validateAETitle,
  validateRequiredFields,
  validateScannerForm,
  validateQAParameter
} from '../validation';

describe('validation.ts', () => {
  describe('validateIPAddress', () => {
    it('should accept valid IPv4 addresses', () => {
      expect(validateIPAddress('192.168.1.1')).toBe(true);
      expect(validateIPAddress('10.0.0.1')).toBe(true);
      expect(validateIPAddress('255.255.255.255')).toBe(true);
      expect(validateIPAddress('0.0.0.0')).toBe(true);
    });

    it('should reject invalid IPv4 addresses', () => {
      expect(validateIPAddress('256.1.1.1')).toBe(false);
      expect(validateIPAddress('192.168.1')).toBe(false);
      expect(validateIPAddress('192.168.1.1.1')).toBe(false);
      expect(validateIPAddress('abc.def.ghi.jkl')).toBe(false);
      expect(validateIPAddress('192.168.-1.1')).toBe(false);
    });

    it('should reject empty string', () => {
      expect(validateIPAddress('')).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(validateIPAddress('1.1.1.1')).toBe(true);
      expect(validateIPAddress('999.999.999.999')).toBe(false);
    });
  });

  describe('validatePort', () => {
    it('should accept valid ports', () => {
      expect(validatePort('1')).toBe(true);
      expect(validatePort('80')).toBe(true);
      expect(validatePort('443')).toBe(true);
      expect(validatePort('8080')).toBe(true);
      expect(validatePort('65535')).toBe(true);
    });

    it('should reject invalid ports', () => {
      expect(validatePort('0')).toBe(false);
      expect(validatePort('65536')).toBe(false);
      expect(validatePort('-1')).toBe(false);
      expect(validatePort('abc')).toBe(false);
      expect(validatePort('')).toBe(false);
    });

    it('should handle boundary values', () => {
      expect(validatePort('1')).toBe(true);
      expect(validatePort('65535')).toBe(true);
      expect(validatePort('65536')).toBe(false);
    });

    it('should handle non-numeric input', () => {
      expect(validatePort('port80')).toBe(false);
      expect(validatePort('80.5')).toBe(true); // parseInt extracts the integer part
    });
  });

  describe('validateAETitle', () => {
    it('should accept valid AE titles', () => {
      expect(validateAETitle('AETITLE')).toBe(true);
      expect(validateAETitle('AE_TITLE')).toBe(true);
      expect(validateAETitle('AE123')).toBe(true);
      expect(validateAETitle('A')).toBe(true);
      expect(validateAETitle('AE_123_TITLE')).toBe(true);
    });

    it('should reject lowercase letters', () => {
      expect(validateAETitle('aetitle')).toBe(false);
      expect(validateAETitle('AEtitle')).toBe(false);
      expect(validateAETitle('Ae')).toBe(false);
    });

    it('should reject special characters', () => {
      expect(validateAETitle('AE-TITLE')).toBe(false);
      expect(validateAETitle('AE.TITLE')).toBe(false);
      expect(validateAETitle('AE@TITLE')).toBe(false);
      expect(validateAETitle('AE TITLE')).toBe(false);
    });

    it('should reject empty string', () => {
      expect(validateAETitle('')).toBe(false);
    });

    it('should accept underscore and numbers', () => {
      expect(validateAETitle('AE_123')).toBe(true);
      expect(validateAETitle('_123_AE')).toBe(true);
      expect(validateAETitle('123')).toBe(true);
    });
  });

  describe('validateRequiredFields', () => {
    it('should return empty object when all required fields are present', () => {
      const formData = { name: 'John', age: '30', email: 'john@example.com' };
      const errors = validateRequiredFields(formData, ['name', 'age', 'email']);
      expect(errors).toEqual({});
    });

    it('should report missing required fields', () => {
      const formData = { name: '', age: null, email: 'john@example.com' };
      const errors = validateRequiredFields(formData, ['name', 'age', 'email']);
      expect(errors).toHaveProperty('name');
      expect(errors).toHaveProperty('age');
      expect(errors).not.toHaveProperty('email');
    });

    it('should handle whitespace-only values as empty', () => {
      const formData = { name: '   ', email: 'john@example.com' };
      const errors = validateRequiredFields(formData, ['name', 'email']);
      expect(errors).toHaveProperty('name');
      expect(errors.name).toContain('Name');
    });

    it('should generate correct error messages', () => {
      const formData = { firstName: '', lastName: '' };
      const errors = validateRequiredFields(formData, ['firstName', 'lastName']);
      expect(errors.firstName).toContain('required');
      expect(errors.lastName).toContain('required');
    });

    it('should format field names properly', () => {
      const formData = { deviceSerialNumber: '' };
      const errors = validateRequiredFields(formData, ['deviceSerialNumber']);
      expect(errors.deviceSerialNumber).toContain('Device');
      expect(errors.deviceSerialNumber).toContain('Serial');
      expect(errors.deviceSerialNumber).toContain('Number');
    });

    it('should handle single field validation', () => {
      const formData = { username: 'john' };
      const errors = validateRequiredFields(formData, ['username']);
      expect(errors).toEqual({});
    });

    it('should handle undefined fields', () => {
      const formData = { name: undefined };
      const errors = validateRequiredFields(formData, ['name']);
      expect(errors).toHaveProperty('name');
    });
  });

  describe('validateScannerForm', () => {
    it('should return no errors for valid form data', () => {
      const formData = {
        aeTitle: 'AETITLE',
        deviceSerialNumber: '12345'
      };
      const errors = validateScannerForm(formData);
      expect(errors).toEqual({});
    });

    it('should validate AE title format', () => {
      const formData = { aeTitle: 'invalid-title' };
      const errors = validateScannerForm(formData);
      expect(errors).toHaveProperty('aeTitle');
      expect(errors.aeTitle).toContain('uppercase letters, numbers, and underscores');
    });

    it('should validate device serial number length', () => {
      const formData = { deviceSerialNumber: 'ab' };
      const errors = validateScannerForm(formData);
      expect(errors).toHaveProperty('deviceSerialNumber');
      expect(errors.deviceSerialNumber).toContain('at least 3 characters');
    });

    it('should allow valid device serial numbers', () => {
      const formData = { deviceSerialNumber: 'abc' };
      const errors = validateScannerForm(formData);
      expect(errors).not.toHaveProperty('deviceSerialNumber');
    });

    it('should handle missing optional fields', () => {
      const formData = {};
      const errors = validateScannerForm(formData);
      expect(errors).toEqual({});
    });

    it('should validate both fields together', () => {
      const formData = {
        aeTitle: 'invalid-ae',
        deviceSerialNumber: 'a'
      };
      const errors = validateScannerForm(formData);
      expect(errors).toHaveProperty('aeTitle');
      expect(errors).toHaveProperty('deviceSerialNumber');
    });
  });

  describe('validateQAParameter', () => {
    it('should return no errors for valid QA parameter', () => {
      const formData = { barcode: 'BARCODE123', activationCode: '123456' };
      const errors = validateQAParameter(formData, []);
      expect(errors).toEqual({});
    });

    it('should require barcode', () => {
      const formData = { barcode: '', activationCode: '123456' };
      const errors = validateQAParameter(formData, []);
      expect(errors).toHaveProperty('barcode');
      expect(errors.barcode).toContain('required');
    });

    it('should require activation code', () => {
      const formData = { barcode: 'BARCODE123', activationCode: '' };
      const errors = validateQAParameter(formData, []);
      expect(errors).toHaveProperty('activationCode');
      expect(errors.activationCode).toContain('required');
    });

    it('should validate barcode minimum length', () => {
      const formData = { barcode: 'BC', activationCode: '123456' };
      const errors = validateQAParameter(formData, []);
      expect(errors).toHaveProperty('barcode');
      expect(errors.barcode).toContain('at least 5 characters');
    });

    it('should validate activation code minimum length', () => {
      const formData = { barcode: 'BARCODE123', activationCode: '123' };
      const errors = validateQAParameter(formData, []);
      expect(errors).toHaveProperty('activationCode');
      expect(errors.activationCode).toContain('at least 6 characters');
    });

    it('should detect duplicate barcodes', () => {
      const existingBarcodes = ['BARCODE1', 'BARCODE2'];
      const formData = { barcode: 'BARCODE1', activationCode: '123456' };
      const errors = validateQAParameter(formData, existingBarcodes);
      expect(errors).toHaveProperty('barcode');
      expect(errors.barcode).toContain('already exists');
    });

    it('should allow same barcode when editing (with editingId)', () => {
      const existingBarcodes = ['BARCODE1', 'BARCODE2'];
      const formData = { barcode: 'BARCODE1', activationCode: '123456' };
      const errors = validateQAParameter(formData, existingBarcodes, 'BARCODE1');
      expect(errors).not.toHaveProperty('barcode');
    });

    it('should detect duplicate when editingId differs', () => {
      const existingBarcodes = ['BARCODE1', 'BARCODE2'];
      const formData = { barcode: 'BARCODE1', activationCode: '123456' };
      const errors = validateQAParameter(formData, existingBarcodes, 'BARCODE3');
      expect(errors).toHaveProperty('barcode');
      expect(errors.barcode).toContain('already exists');
    });

    it('should handle whitespace in barcode', () => {
      const formData = { barcode: '  ', activationCode: '123456' };
      const errors = validateQAParameter(formData, []);
      expect(errors).toHaveProperty('barcode');
    });

    it('should handle multiple validation errors', () => {
      const existingBarcodes = ['BARCODE1'];
      const formData = { barcode: 'BARCODE1', activationCode: '12' };
      const errors = validateQAParameter(formData, existingBarcodes);
      expect(errors).toHaveProperty('barcode');
      expect(errors).toHaveProperty('activationCode');
    });

    it('should allow valid barcodes and activation codes', () => {
      const formData = { 
        barcode: 'VALIDBARCODE123', 
        activationCode: 'VALIDACTIVATIONCODE123' 
      };
      const errors = validateQAParameter(formData, ['OTHER_BARCODE']);
      expect(errors).toEqual({});
    });
  });
});
