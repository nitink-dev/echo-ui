
export type EnrichmentSection =
  | 'dicom'
  | 'lis'
  | 'enrichment'
  | 'export'
  | 'hl7'
  | 'email';

// 2️⃣ Each section’s data structure

export interface DicomReceiverConfig {
  aet: string;
  ipAddress: string;
  port: string;
  networkDrive: string;
}

export interface LisConnectorConfig {
  applicationName: string;
  ipAddress: string;
  receivingPort: string;
  incomingPort: string;
  receivingFacility: string;
  receivingAppName: string;
  sendingFacility: string;
}

export interface EnrichmentServiceConfig {
  messageType: string;
}

export interface ExportServiceConfig {
  synapseServerFolder: string;
  synapseEnabled: boolean;
  visioPharmEnabled: boolean;
  ibexEnabled: boolean;
}

export interface Hl7MessagingConfig {
  applicationName: string;
  ipAddress: string;
  receivingPort: string;
  outputPort: string;
  receivingFacility: string;
  receivingAppName: string;
  sendingFacility: string;
}

export interface EmailServiceConfig {
  emailFrom: string;
  emailTo: string[];
  emailIbexTo: string[];
}

// 3️⃣ Combined structure for the form data

export interface EnrichmentFormData {
  dicomReceiver: DicomReceiverConfig;
  lisConnector: LisConnectorConfig;
  enrichmentService: EnrichmentServiceConfig;
  exportService: ExportServiceConfig;
  hl7Messaging: Hl7MessagingConfig;
  emailService: EmailServiceConfig;
}
