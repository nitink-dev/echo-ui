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
    dicomStore?: string;
    lastSeen?: string;
    status?: string;
  }
  