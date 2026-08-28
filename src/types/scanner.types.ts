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
  researchDicomStore?: string;
  lastSeen?: string;
  status?: 'online' | 'offline' | 'maintenance';
  research: boolean;
  connected: boolean;
  storageStrategy?: string;
}

export interface ScannerFormData {
  name: string;
  aeTitle: string;
  model: string;
  hospitalName: string;
  department: string;
  location: string;
  deviceSerialNumber: string;
  ipAddress: string;
  port: string;
  vendor: string;
  dicomStore: string;
  researchDicomStore?: string;
  otherIdentifier: string;
  research: boolean;
  connected: boolean;
  storageStrategy: string;
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