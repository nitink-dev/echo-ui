import { describe, it, expect, vi, beforeEach } from 'vitest';
import { scannerService } from '../scannerService';
import { BASE_URL } from '../../../utils/constants';

vi.mock('../apiClient'); 
import apiClient from '../apiClient';

describe('scannerService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetchAll should return scanner list when API returns array', async () => {
    const mockData = [{ deviceSerialNumber: 'ABC123', name: 'Scanner 1' }];
    vi.mocked(apiClient.get).mockResolvedValue({ data: mockData });

    const result = await scannerService.fetchAll();

    expect(apiClient.get).toHaveBeenCalledWith(`${BASE_URL}/api/scanners`);
    expect(result).toEqual(mockData);
  });

  it('fetchAll should throw error if API response is not array', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: { invalid: true } });

    await expect(scannerService.fetchAll()).rejects.toThrow('Invalid API response: Expected array');
  });

  it('create should post scanner and return created scanner', async () => {
    const input = { deviceSerialNumber: 'XYZ123', name: 'New Scanner' };
    const responseData = { ...input, id: '1' };
    vi.mocked(apiClient.post).mockResolvedValue({ data: responseData });

    const result = await scannerService.create(input as any);

    expect(apiClient.post).toHaveBeenCalledWith(`${BASE_URL}/api/scanners`, input);
    expect(result).toEqual(responseData);
  });

  it('update should put scanner and return updated scanner', async () => {
    const scanner = { deviceSerialNumber: 'UPD123', name: 'Updated Scanner' };
    vi.mocked(apiClient.put).mockResolvedValue({ data: scanner });

    const result = await scannerService.update(scanner as any);

    expect(apiClient.put).toHaveBeenCalledWith(`${BASE_URL}/api/scanners/${scanner.deviceSerialNumber}`, scanner);
    expect(result).toEqual(scanner);
  });

  it('delete should call delete endpoint with serial number', async () => {
    vi.mocked(apiClient.delete).mockResolvedValue({});

    await scannerService.delete('DEL123');

    expect(apiClient.delete).toHaveBeenCalledWith(`${BASE_URL}/api/scanners/DEL123`);
  });

  it('fetchReports should return scanner reports', async () => {
    const reports = [{ id: 1, status: 'OK' }];
    vi.mocked(apiClient.get).mockResolvedValue({ data: reports });

    const result = await scannerService.fetchReports('REP123');

    expect(apiClient.get).toHaveBeenCalledWith(`${BASE_URL}/api/scanners/REP123/reports`);
    expect(result).toEqual(reports);
  });
});