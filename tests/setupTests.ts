// tests/setupTests.ts
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// ✅ Mock fetch globally with different responses per endpoint

// Mock global fetch
// Must mock fetch before importing your component!
global.fetch = vi.fn((url: string) => {
    if (url.endsWith('/hospital-metadata')) {
      return Promise.resolve({
        ok: true,
        json: async () => ({ locations: ['Hospital A'] }),
      });
    }
    return Promise.reject(new Error('Unknown endpoint'));
  }) as unknown as typeof fetch;

// ✅ Mock toast from sonner
vi.mock('sonner@2.0.3', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));
