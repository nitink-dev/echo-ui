import { describe, it, expect } from 'vitest';
import {
  BASE_URL,
  REQUIRED_SCANNER_FIELDS,
  REQUIRED_QA_FIELDS,
  ENRICHMENT_TOOLS,
  STATUS_COLORS
} from '../constants';

describe('constants.ts', () => {
  describe('BASE_URL', () => {
    it('should be defined', () => {
      expect(BASE_URL).toBeDefined();
    });

    it('should be a string', () => {
      expect(typeof BASE_URL).toBe('string');
    });

    it('should be set from environment variable', () => {
      // BASE_URL comes from VITE_API_URL env var
      expect(BASE_URL).toBeTruthy();
    });
  });

  describe('REQUIRED_SCANNER_FIELDS', () => {
    it('should be an array', () => {
      expect(Array.isArray(REQUIRED_SCANNER_FIELDS)).toBe(true);
    });

    it('should contain all required scanner fields', () => {
      expect(REQUIRED_SCANNER_FIELDS).toContain('name');
      expect(REQUIRED_SCANNER_FIELDS).toContain('aeTitle');
      expect(REQUIRED_SCANNER_FIELDS).toContain('hospitalName');
      expect(REQUIRED_SCANNER_FIELDS).toContain('department');
      expect(REQUIRED_SCANNER_FIELDS).toContain('location');
      expect(REQUIRED_SCANNER_FIELDS).toContain('deviceSerialNumber');
      expect(REQUIRED_SCANNER_FIELDS).toContain('dicomStore');
    });

    it('should have correct number of fields', () => {
      expect(REQUIRED_SCANNER_FIELDS.length).toBe(7);
    });

    it('should be an array with valid fields', () => {
      expect(Array.isArray(REQUIRED_SCANNER_FIELDS)).toBe(true);
      expect(REQUIRED_SCANNER_FIELDS.length).toBeGreaterThan(0);
      REQUIRED_SCANNER_FIELDS.forEach(field => {
        expect(typeof field).toBe('string');
      });
    });

    it('should only contain string values', () => {
      REQUIRED_SCANNER_FIELDS.forEach(field => {
        expect(typeof field).toBe('string');
      });
    });

    it('should not contain empty strings', () => {
      REQUIRED_SCANNER_FIELDS.forEach(field => {
        expect(field.length).toBeGreaterThan(0);
      });
    });
  });

  describe('REQUIRED_QA_FIELDS', () => {
    it('should be an array', () => {
      expect(Array.isArray(REQUIRED_QA_FIELDS)).toBe(true);
    });

    it('should contain all required QA fields', () => {
      expect(REQUIRED_QA_FIELDS).toContain('barcode');
      expect(REQUIRED_QA_FIELDS).toContain('activationCode');
    });

    it('should have correct number of fields', () => {
      expect(REQUIRED_QA_FIELDS.length).toBe(2);
    });

    it('should be an array with valid fields', () => {
      expect(Array.isArray(REQUIRED_QA_FIELDS)).toBe(true);
      expect(REQUIRED_QA_FIELDS.length).toBeGreaterThan(0);
      REQUIRED_QA_FIELDS.forEach(field => {
        expect(typeof field).toBe('string');
      });
    });

    it('should only contain string values', () => {
      REQUIRED_QA_FIELDS.forEach(field => {
        expect(typeof field).toBe('string');
      });
    });
  });

  describe('ENRICHMENT_TOOLS', () => {
    it('should be an object', () => {
      expect(typeof ENRICHMENT_TOOLS).toBe('object');
    });

    it('should contain all enrichment tool definitions', () => {
      expect(ENRICHMENT_TOOLS).toHaveProperty('LIS');
      expect(ENRICHMENT_TOOLS).toHaveProperty('SYNAPSE');
      expect(ENRICHMENT_TOOLS).toHaveProperty('DICOM_RECEIVER');
      expect(ENRICHMENT_TOOLS).toHaveProperty('LIS_CONNECTOR');
      expect(ENRICHMENT_TOOLS).toHaveProperty('ENRICHMENT_SERVICE');
      expect(ENRICHMENT_TOOLS).toHaveProperty('EXPORT_SERVICE');
      expect(ENRICHMENT_TOOLS).toHaveProperty('HL7_CONNECTOR');
      expect(ENRICHMENT_TOOLS).toHaveProperty('EMAIL_SERVICE');
    });

    it('should have correct values for each tool', () => {
      expect(ENRICHMENT_TOOLS.LIS).toBe('lis');
      expect(ENRICHMENT_TOOLS.SYNAPSE).toBe('synapse');
      expect(ENRICHMENT_TOOLS.DICOM_RECEIVER).toBe('eh-dicom-receiver');
      expect(ENRICHMENT_TOOLS.LIS_CONNECTOR).toBe('eh-lis-connector');
      expect(ENRICHMENT_TOOLS.ENRICHMENT_SERVICE).toBe('eh-dicom-enricher');
      expect(ENRICHMENT_TOOLS.EXPORT_SERVICE).toBe('eh-export-service');
      expect(ENRICHMENT_TOOLS.HL7_CONNECTOR).toBe('eh-hl7-connector');
      expect(ENRICHMENT_TOOLS.EMAIL_SERVICE).toBe('eh-email-service');
    });

    it('should have string values', () => {
      Object.values(ENRICHMENT_TOOLS).forEach(value => {
        expect(typeof value).toBe('string');
      });
    });

    it('should have non-empty values', () => {
      Object.values(ENRICHMENT_TOOLS).forEach(value => {
        expect(value.length).toBeGreaterThan(0);
      });
    });

    it('should have correct number of tools', () => {
      expect(Object.keys(ENRICHMENT_TOOLS).length).toBe(8);
    });

    it('should follow naming convention for eh-prefixed tools', () => {
      const ehTools = [
        ENRICHMENT_TOOLS.DICOM_RECEIVER,
        ENRICHMENT_TOOLS.LIS_CONNECTOR,
        ENRICHMENT_TOOLS.ENRICHMENT_SERVICE,
        ENRICHMENT_TOOLS.EXPORT_SERVICE,
        ENRICHMENT_TOOLS.HL7_CONNECTOR,
        ENRICHMENT_TOOLS.EMAIL_SERVICE,
      ];
      ehTools.forEach(value => {
        expect(value).toMatch(/^eh-/);
        expect(value).toMatch(/[a-z-]+$/);
      });
    });

    it('should use short names for LIS and SYNAPSE', () => {
      expect(ENRICHMENT_TOOLS.LIS).toMatch(/^[a-z]+$/);
      expect(ENRICHMENT_TOOLS.SYNAPSE).toMatch(/^[a-z]+$/);
    });
  });

  describe('STATUS_COLORS', () => {
    it('should be an object', () => {
      expect(typeof STATUS_COLORS).toBe('object');
    });

    it('should contain all status types', () => {
      expect(STATUS_COLORS).toHaveProperty('online');
      expect(STATUS_COLORS).toHaveProperty('offline');
      expect(STATUS_COLORS).toHaveProperty('maintenance');
    });

    it('should have color properties for each status', () => {
      Object.values(STATUS_COLORS).forEach(status => {
        expect(status).toHaveProperty('bg');
        expect(status).toHaveProperty('text');
        expect(status).toHaveProperty('dot');
      });
    });

    it('should have tailwind class names for online status', () => {
      expect(STATUS_COLORS.online.bg).toBe('bg-green-100');
      expect(STATUS_COLORS.online.text).toBe('text-green-800');
      expect(STATUS_COLORS.online.dot).toBe('bg-green-500');
    });

    it('should have tailwind class names for offline status', () => {
      expect(STATUS_COLORS.offline.bg).toBe('bg-gray-100');
      expect(STATUS_COLORS.offline.text).toBe('text-gray-800');
      expect(STATUS_COLORS.offline.dot).toBe('bg-gray-500');
    });

    it('should have tailwind class names for maintenance status', () => {
      expect(STATUS_COLORS.maintenance.bg).toBe('bg-orange-100');
      expect(STATUS_COLORS.maintenance.text).toBe('text-orange-800');
      expect(STATUS_COLORS.maintenance.dot).toBe('bg-orange-500');
    });

    it('should have consistent color scheme for each status', () => {
      Object.values(STATUS_COLORS).forEach(status => {
        // Each status should have 3 string values
        expect(typeof status.bg).toBe('string');
        expect(typeof status.text).toBe('string');
        expect(typeof status.dot).toBe('string');

        // Each should follow Tailwind naming
        expect(status.bg).toMatch(/^bg-/);
        expect(status.text).toMatch(/^text-/);
        expect(status.dot).toMatch(/^bg-/);
      });
    });

    it('should use consistent color palettes', () => {
      // Verify color shades are reasonable
      const bgClasses = Object.values(STATUS_COLORS).map(s => s.bg);
      const textClasses = Object.values(STATUS_COLORS).map(s => s.text);
      const dotClasses = Object.values(STATUS_COLORS).map(s => s.dot);

      expect(bgClasses.every(c => c.includes('-100'))).toBe(true);
      expect(textClasses.every(c => c.includes('-800'))).toBe(true);
      expect(dotClasses.every(c => c.includes('-500'))).toBe(true);
    });

    it('should have correct number of statuses', () => {
      expect(Object.keys(STATUS_COLORS).length).toBe(3);
    });
  });

  describe('integration', () => {
    it('should have all required constants defined', () => {
      expect(BASE_URL).toBeDefined();
      expect(REQUIRED_SCANNER_FIELDS).toBeDefined();
      expect(REQUIRED_QA_FIELDS).toBeDefined();
      expect(ENRICHMENT_TOOLS).toBeDefined();
      expect(STATUS_COLORS).toBeDefined();
    });

    it('should maintain consistency between field definitions', () => {
      // REQUIRED_SCANNER_FIELDS and REQUIRED_QA_FIELDS should be separate
      REQUIRED_SCANNER_FIELDS.forEach(field => {
        // Check that field names are consistent (camelCase)
        expect(field).toMatch(/^[a-z][a-zA-Z]*$/);
      });

      REQUIRED_QA_FIELDS.forEach(field => {
        expect(field).toMatch(/^[a-z][a-zA-Z]*$/);
      });
    });

    it('should support UI rendering with defined colors', () => {
      // Verify colors can be used in rendering
      Object.keys(STATUS_COLORS).forEach(status => {
        const colorSet = STATUS_COLORS[status as keyof typeof STATUS_COLORS];
        expect(colorSet.bg).toMatch(/^[a-z\-0-9]+$/);
        expect(colorSet.text).toMatch(/^[a-z\-0-9]+$/);
        expect(colorSet.dot).toMatch(/^[a-z\-0-9]+$/);
      });
    });
  });
});
