import axios from 'axios';

const apiClient = {
  interceptors: {
    response: { use: vi.fn() },
    request: { use: vi.fn() },
  },
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
};

export default apiClient;