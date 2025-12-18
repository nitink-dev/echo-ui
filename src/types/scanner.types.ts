// src/types/scanner.types.ts
export interface SlideScanner {
  id?: string;
  name: string;
  aeTitle: string;
  model: string;
  deviceSerialNumber: string;
  location: string;
  hospitalName: string;
  department: string;
  ipAddress: string;
  port: string;
  vendor: string;
  otherIdentifier?: string;
  dicomStore?: string;
  lastSeen?: string;
  status?: 'online' | 'offline' | 'maintenance';
}

export interface AnalysisReport {
  id: string;
  analysisId: string;
  slideBarcode: string;
  deviceSerialNumber: string;
  dicomSeriesPath: string;
  status: string;
  result: {
    pdfReportUrl: string;
    csvDataFileUrl: string;
  };
  createdAt: string;
}