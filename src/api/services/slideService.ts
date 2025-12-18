// services/slideService.ts

import { BASE_URL } from "../../utils/constants";

export interface SlideRecord {
    _id: { $oid: string };
    caseNumber: string;
    slideBarcode: string;
    deviceSerialNumber: string;
    scanStatus: 'completed' | 'failed' | 'in-progress';
    createdAt: { $date: string };
    updatedAt: { $date: string };
  }
  
  export interface PaginatedResponse {
    content: SlideRecord[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  }
  
  export interface FilterParams {
    barcode?: string;
    deviceId?: string;
    status?: 'completed' | 'failed' | 'in-progress';
    page?: number;
    size?: number;
  }
  
  class SlideService {
  
    async fetchScanStatus(
      status: 'completed' | 'failed' | 'inProgress',
      page: number = 0,
      size: number = 10,
      filters?: { barcode?: string; deviceId?: string }
    ): Promise<PaginatedResponse> {
      try {
        let url = `${BASE_URL}/slide-scan-status/${status}?page=${page}&size=${size}`;
        
        if (filters?.barcode) {
          url += `&barcode=${encodeURIComponent(filters.barcode)}`;
        }
        
        if (filters?.deviceId) {
          url += `&deviceId=${encodeURIComponent(filters.deviceId)}`;
        }
  
        const response = await fetch(url);
        const data = await response.json();
        return data;
      } catch (error) {
        console.error('Error fetching scan status:', error);
        throw error;
      }
    }
  
    async fetchAllBarcodes(): Promise<string[]> {
      try {
        const response = await fetch(`${BASE_URL}/barcodes`);
        const data = await response.json();
        return data.map((item: { slideBarcode: string }) => item.slideBarcode);
      } catch (error) {
        console.error('Error fetching barcodes:', error);
        throw error;
      }
    }
  
    async fetchAllDeviceIds(): Promise<string[]> {
      try {
        const response = await fetch(`${BASE_URL}/device-ids`);
        const data = await response.json();
        return data.map((item: { deviceSerialNumber: string }) => item.deviceSerialNumber);
      } catch (error) {
        console.error('Error fetching device IDs:', error);
        throw error;
      }
    }
  }
  
  export const slideService = new SlideService();