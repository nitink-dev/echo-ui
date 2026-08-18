
export const BASE_URL = import.meta.env.VITE_API_URL ;

if (!BASE_URL) {
  console.warn('BASE_URL is empty. Check .env variables.');
}


export const REQUIRED_SCANNER_FIELDS = [
  'name',
  'aeTitle',
  'hospitalName',
  'department',
  'location',
  'deviceSerialNumber',
  'dicomStore'
];

export const REQUIRED_QA_FIELDS = ['barcode', 'activationCode'];

export const ENRICHMENT_TOOLS = {
  LIS: 'lis',
  SYNAPSE: 'synapse',
  DICOM_RECEIVER: 'eh-dicom-receiver',
  LIS_CONNECTOR: 'eh-lis-connector',
  ENRICHMENT_SERVICE: 'eh-dicom-enricher',
  EXPORT_SERVICE: 'eh-export-service',
  HL7_CONNECTOR: 'eh-hl7-connector',
  EMAIL_SERVICE: 'eh-email-service'
} as const;


export const STATUS_COLORS = {
  online: { bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-500' },
  offline: { bg: 'bg-gray-100', text: 'text-gray-800', dot: 'bg-gray-500' },
  maintenance: { bg: 'bg-orange-100', text: 'text-orange-800', dot: 'bg-orange-500' }
};