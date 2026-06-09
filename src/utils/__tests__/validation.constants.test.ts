import { describe, it, expect } from 'vitest';
import {
  IP_ALLOWED_PATTERN,
  isValidIP,
  IP_ERROR_MESSAGE,
  PORT_ALLOWED_PATTERN,
  PORT_VALID_PATTERN,
  isValidPort,
  PORT_ERROR_MESSAGE,
  EMAIL_REGEX,
  isValidEmail,
  EMAIL_ERROR_MESSAGE,
  sanitizeByPattern
} from '../validation.constants';

describe('validation.constants.ts', () => {
  describe('IP validation', () => {
    describe('isValidIP', () => {
      it('should accept valid IPv4 addresses', () => {
        expect(isValidIP('192.168.1.1')).toBe(true);
        expect(isValidIP('10.0.0.1')).toBe(true);
        expect(isValidIP('255.255.255.255')).toBe(true);
        expect(isValidIP('127.0.0.1')).toBe(true);
      });

      it('should accept valid IPv6 addresses', () => {
        expect(isValidIP('2001:db8::1')).toBe(true);
        expect(isValidIP('::1')).toBe(true);
        expect(isValidIP('fe80::1')).toBe(true);
      });

      it('should reject invalid IP addresses', () => {
        expect(isValidIP('256.256.256.256')).toBe(false);
        expect(isValidIP('abc.def.ghi.jkl')).toBe(false);
        expect(isValidIP('192.168.1')).toBe(false);
        expect(isValidIP('')).toBe(false);
      });

      it('should handle non-string input', () => {
        expect(isValidIP(null)).toBe(false);
        expect(isValidIP(undefined)).toBe(false);
        expect(isValidIP(123)).toBe(false);
      });
    });

    describe('IP_ALLOWED_PATTERN', () => {
      it('should allow digits and IPv4/IPv6 characters', () => {
        expect(IP_ALLOWED_PATTERN.test('1')).toBe(true);
        expect(IP_ALLOWED_PATTERN.test('.')).toBe(true);
        expect(IP_ALLOWED_PATTERN.test(':')).toBe(true);
        expect(IP_ALLOWED_PATTERN.test('f')).toBe(true);
        expect(IP_ALLOWED_PATTERN.test('F')).toBe(true);
      });

      it('should reject invalid characters', () => {
        expect(IP_ALLOWED_PATTERN.test('g')).toBe(false);
        expect(IP_ALLOWED_PATTERN.test(' ')).toBe(false);
        expect(IP_ALLOWED_PATTERN.test('-')).toBe(false);
      });
    });

    it('should have IP_ERROR_MESSAGE defined', () => {
      expect(IP_ERROR_MESSAGE).toBeDefined();
      expect(IP_ERROR_MESSAGE.length).toBeGreaterThan(0);
    });
  });

  describe('Port validation', () => {
    describe('isValidPort', () => {
      it('should accept valid ports', () => {
        expect(isValidPort('1')).toBe(true);
        expect(isValidPort('80')).toBe(true);
        expect(isValidPort('443')).toBe(true);
        expect(isValidPort('8080')).toBe(true);
        expect(isValidPort('65535')).toBe(true);
      });

      it('should reject invalid ports', () => {
        expect(isValidPort('-1')).toBeFalsy();
        expect(isValidPort('')).toBeFalsy();
        expect(isValidPort(null)).toBeFalsy();
      });

      it('should handle non-string input', () => {
        expect(isValidPort(null)).toBe(false);
        expect(isValidPort(undefined)).toBe(false);
        expect(isValidPort(80)).toBe(true); // Should work as number gets converted to string
      });

      it('should handle leading zeros', () => {
        expect(isValidPort('0080')).toBe(false);
        expect(isValidPort('00001')).toBe(false);
        // Leading zeros are not standard for port numbers
      });
    });

    describe('PORT_ALLOWED_PATTERN', () => {
      it('should allow only digits', () => {
        expect(PORT_ALLOWED_PATTERN.test('0')).toBe(true);
        expect(PORT_ALLOWED_PATTERN.test('1')).toBe(true);
        expect(PORT_ALLOWED_PATTERN.test('9')).toBe(true);
      });

      it('should reject non-digit characters', () => {
        expect(PORT_ALLOWED_PATTERN.test('a')).toBe(false);
        expect(PORT_ALLOWED_PATTERN.test(' ')).toBe(false);
        expect(PORT_ALLOWED_PATTERN.test('-')).toBe(false);
        expect(PORT_ALLOWED_PATTERN.test('.')).toBe(false);
      });
    });

    describe('PORT_VALID_PATTERN', () => {
      it('should match valid port ranges', () => {
        expect(PORT_VALID_PATTERN.test('1')).toBe(true);
        expect(PORT_VALID_PATTERN.test('1024')).toBe(true);
        expect(PORT_VALID_PATTERN.test('65535')).toBe(true);
      });

      it('should not match invalid ports', () => {
        expect(PORT_VALID_PATTERN.test('-1')).toBeFalsy();
        expect(PORT_VALID_PATTERN.test('')).toBeFalsy();
        expect(PORT_VALID_PATTERN.test('abc')).toBeFalsy();
      });
    });

    it('should have PORT_ERROR_MESSAGE defined', () => {
      expect(PORT_ERROR_MESSAGE).toBeDefined();
      expect(PORT_ERROR_MESSAGE.length).toBeGreaterThan(0);
    });
  });

  describe('Email validation', () => {
    describe('isValidEmail', () => {
      it('should accept valid email addresses', () => {
        expect(isValidEmail('test@example.com')).toBe(true);
        expect(isValidEmail('user.name@example.co.uk')).toBe(true);
        expect(isValidEmail('user+tag@example.com')).toBe(true);
        expect(isValidEmail('test123@test-domain.com')).toBe(true);
      });

      it('should reject invalid email addresses', () => {
        expect(isValidEmail('invalid')).toBe(false);
        expect(isValidEmail('invalid@')).toBe(false);
        expect(isValidEmail('@example.com')).toBe(false);
        expect(isValidEmail('invalid@.com')).toBe(false);
        expect(isValidEmail('invalid@domain')).toBe(false);
        expect(isValidEmail('')).toBe(false);
      });

      it('should handle non-string input', () => {
        expect(isValidEmail(null)).toBe(false);
        expect(isValidEmail(undefined)).toBe(false);
        expect(isValidEmail(123)).toBe(false);
      });

      it('should accept emails with hyphens and underscores', () => {
        expect(isValidEmail('user-name@example.com')).toBe(true);
        expect(isValidEmail('user_name@example.com')).toBe(true);
      });
    });

    describe('EMAIL_REGEX', () => {
      it('should match valid email patterns', () => {
        expect(EMAIL_REGEX.test('simple@example.com')).toBe(true);
        expect(EMAIL_REGEX.test('user.name+tag@example.co.uk')).toBe(true);
      });

      it('should not match invalid patterns', () => {
        expect(EMAIL_REGEX.test('no-at-sign')).toBe(false);
        expect(EMAIL_REGEX.test('double@@sign.com')).toBe(false);
      });
    });

    it('should have EMAIL_ERROR_MESSAGE defined', () => {
      expect(EMAIL_ERROR_MESSAGE).toBeDefined();
      expect(EMAIL_ERROR_MESSAGE.length).toBeGreaterThan(0);
    });
  });

  describe('sanitizeByPattern', () => {
    it('should filter characters that match the pattern', () => {
      const pattern = /[0-9]/;
      expect(sanitizeByPattern('abc123def456', pattern)).toBe('123456');
    });

    it('should handle empty string', () => {
      expect(sanitizeByPattern('', /[0-9]/)).toBe('');
    });

    it('should return empty string if no characters match', () => {
      const pattern = /[0-9]/;
      expect(sanitizeByPattern('abcdef', pattern)).toBe('');
    });

    it('should work with IP allowed pattern', () => {
      // sanitizeByPattern filters characters not matching the pattern
      // The regex test() on individual characters with anchors causes filtering
      const result1 = sanitizeByPattern('192.168.1.1', IP_ALLOWED_PATTERN);
      expect(result1).toContain('1');
      expect(result1).toContain('9');
      
      const result2 = sanitizeByPattern('192@168#1$1', IP_ALLOWED_PATTERN);
      // Should remove @ # $ but keep digits and valid IP chars
      expect(result2).not.toContain('@');
      expect(result2).not.toContain('#');
      expect(result2).not.toContain('$');
    });

    it('should work with port allowed pattern', () => {
      expect(sanitizeByPattern('8080', PORT_ALLOWED_PATTERN)).toBe('8080');
      expect(sanitizeByPattern('80a8b0', PORT_ALLOWED_PATTERN)).toBe('8080');
    });

    it('should handle non-string input', () => {
      expect(sanitizeByPattern(null, /[0-9]/)).toBe('');
      expect(sanitizeByPattern(undefined, /[0-9]/)).toBe('');
      expect(sanitizeByPattern(123, /[0-9]/)).toBe('123');
    });

    it('should trim whitespace from input', () => {
      const pattern = /[0-9]/;
      expect(sanitizeByPattern('  123  ', pattern)).toBe('123');
    });

    it('should preserve order of characters', () => {
      const pattern = /[0-9]/;
      expect(sanitizeByPattern('a1b2c3', pattern)).toBe('123');
    });

    it('should work with complex patterns', () => {
      const pattern = /[a-z]/;
      expect(sanitizeByPattern('aB1cD2eF3', pattern)).toBe('ace');
    });
  });

  describe('Pattern constants', () => {
    it('should have all pattern constants defined', () => {
      expect(IP_ALLOWED_PATTERN).toBeDefined();
      expect(PORT_ALLOWED_PATTERN).toBeDefined();
      expect(EMAIL_REGEX).toBeDefined();
    });

    it('should have all error messages defined', () => {
      expect(IP_ERROR_MESSAGE).toBeDefined();
      expect(PORT_ERROR_MESSAGE).toBeDefined();
      expect(EMAIL_ERROR_MESSAGE).toBeDefined();
    });
  });
});
