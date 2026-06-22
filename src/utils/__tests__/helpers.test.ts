import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  normalizeToArray,
  getChangedFields,
  sanitizeFormData,
  downloadFile,
  generateCSV,
  downloadCSV,
  toTitleCase,
} from '../helpers';

describe('helpers.ts', () => {
  /* =========================
     normalizeToArray
     ========================= */

  describe('normalizeToArray', () => {
    it('returns empty array for null/undefined/empty', () => {
      expect(normalizeToArray(null)).toEqual([]);
      expect(normalizeToArray(undefined)).toEqual([]);
      expect(normalizeToArray('')).toEqual([]);
    });

    it('returns array as-is', () => {
      const arr = ['a', 'b'];
      expect(normalizeToArray(arr)).toEqual(arr);
    });

    it('splits comma-separated string', () => {
      expect(normalizeToArray('a,b,c')).toEqual(['a', 'b', 'c']);
    });

    it('returns empty array for non-string non-array values', () => {
      expect(normalizeToArray(123)).toEqual([]);
      expect(normalizeToArray({ foo: 'bar' })).toEqual([]);
    });

    it('trims whitespace and filters empty values', () => {
      expect(normalizeToArray(' a , , b , ')).toEqual(['a', 'b']);
    });
  });

  /* =========================
     getChangedFields
     ========================= */

  describe('getChangedFields', () => {
    it('returns empty object when no changes', () => {
      const data = { name: 'John', age: 30 };
      expect(getChangedFields(data, data)).toEqual({});
    });

    it('detects scalar changes', () => {
      const result = getChangedFields(
        { name: 'John', age: 31 },
        { name: 'John', age: 30 }
      );
      expect(result).toEqual({ age: 31 });
    });

    it('handles null and undefined', () => {
      const result = getChangedFields(
        { name: null },
        { name: 'John' }
      );
      expect(result.name).toBeNull();
    });

    it('compares arrays via comma-string', () => {
      const result = getChangedFields(
        { tags: ['a', 'b'] },
        { tags: ['a', 'c'] }
      );
      expect(result.tags).toEqual(['a', 'b']);
    });

    it('treats string and array with same values as equal', () => {
      expect(
        getChangedFields({ tags: ['a', 'b'] }, { tags: 'a,b' })
      ).toEqual({});
    });

    it('trims strings before comparison', () => {
      expect(
        getChangedFields({ name: '  John ' }, { name: 'John' })
      ).toEqual({});
    });
  });

  /* =========================
     sanitizeFormData
     ========================= */

  describe('sanitizeFormData', () => {
    it('converts empty strings to null', () => {
      const result = sanitizeFormData({ a: '', b: 'x' });
      expect(result).toEqual({ a: null, b: 'x' });
    });

    it('keeps numbers and booleans intact', () => {
      const result = sanitizeFormData({ count: 0, active: false });
      expect(result).toEqual({ count: 0, active: false });
    });

    it('does not deep-sanitize nested objects', () => {
      const result = sanitizeFormData({ nested: { v: '' } });
      expect(result).toEqual({ nested: { v: '' } });
    });
  });

  /* =========================
     downloadFile
     ========================= */

  describe('downloadFile', () => {
    let appendSpy: any;
    let removeSpy: any;
    let clickSpy: any;

    beforeEach(() => {
      clickSpy = vi.fn();

      vi.spyOn(document, 'createElement').mockReturnValue({
        href: '',
        click: clickSpy,
        setAttribute: vi.fn(),
      } as any);

      appendSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => null as any);
      removeSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => null as any);
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('creates anchor and triggers click', () => {
      downloadFile('http://example.com/file.txt', 'file.txt');

      expect(clickSpy).toHaveBeenCalled();
      expect(appendSpy).toHaveBeenCalled();
      expect(removeSpy).toHaveBeenCalled();
    });
  });

  /* =========================
     generateCSV
     ========================= */

  describe('generateCSV', () => {
    it('converts data to CSV format', () => {
      const csv = generateCSV([
        ['name', 'John'],
        ['age', '30'],
      ]);

      expect(csv).toBe('name,John\nage,30');
    });

    it('returns empty string for empty input', () => {
      expect(generateCSV([])).toBe('');
    });
  });

  /* =========================
     downloadCSV
     ========================= */

  describe('downloadCSV', () => {
    let createUrlSpy: any;
    let revokeSpy: any;

    beforeEach(() => {
      createUrlSpy = vi
        .spyOn(URL, 'createObjectURL')
        .mockReturnValue('blob:url');

      revokeSpy = vi
        .spyOn(URL, 'revokeObjectURL')
        .mockImplementation(() => {});

      const link = document.createElement('a');
      vi.spyOn(link, 'click').mockImplementation(() => {});
      vi.spyOn(document, 'createElement').mockReturnValue(link);

      vi.stubGlobal(
        'Blob',
        class Blob {
          constructor(public content: any[], public options: any) {}
        }
      );
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('creates object URL and revokes it', () => {
      downloadCSV('a,b\n1,2', 'file.csv');

      expect(createUrlSpy).toHaveBeenCalled();
      expect(revokeSpy).toHaveBeenCalledWith('blob:url');
    });
  });

  describe('toTitleCase', () => {
    it('converts kebab-case to title case', () => {
      expect(toTitleCase('slide-scan-status')).toBe('Slide Scan Status');
    });

    it('handles empty string', () => {
      expect(toTitleCase('')).toBe('');
    });

    it('handles single word', () => {
      expect(toTitleCase('scanners')).toBe('Scanners');
    });
  });
});
