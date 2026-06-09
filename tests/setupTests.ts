import '@testing-library/jest-dom';
import { vi } from 'vitest';

global.fetch = vi.fn((url: string) => {
    if (url.endsWith('/hospital-metadata')) {
      return Promise.resolve({
        ok: true,
        json: async () => ({ locations: ['Hospital A'] }),
      });
    }
    return Promise.reject(new Error('Unknown endpoint'));
  }) as unknown as typeof fetch;

vi.mock('sonner@2.0.3', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));
