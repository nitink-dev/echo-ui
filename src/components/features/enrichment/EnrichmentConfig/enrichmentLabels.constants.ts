export const DICOM_RECEIVER_FIELD_LABELS: Record<string, string> = {
  aet: 'AET',
  samIpAddress: 'SAM Server Address',
  port: 'Port',
  networkDrive: 'Network Drive',
  serviceIpAddress: 'IP Address',
  watcherActive: 'Enable directory watcher',
};

export const LIS_CONNECTOR_FIELD_LABELS: Record<string, string> = {
  applicationName: 'Application Name',
  receivingPort: 'Port',
  sendingFacility: 'Application Facility',
  serviceIpAddress: 'IP Address',
};

export const DICOM_ENRICHER_FIELD_LABELS: Record<string, string> = {
  messageType: 'Message Type',
  serviceIpAddress: 'IP Address',
};

export const EXPORT_SERVICE_FIELD_LABELS: Record<string, string> = {
  synapseEnabled: 'Synapse Enabled',
  visioPharmEnabled: 'VisioPharm Enabled',
  ibexEnabled: 'IBEX Enabled',
  serviceIpAddress: 'IP Address',
};

export const HL7_CONNECTOR_FIELD_LABELS: Record<string, string> = {
  applicationName: 'Application Name',
  receivingPort: 'Port',
  sendingFacility: 'Application Facility',
  serviceIpAddress: 'IP Address',
};

export const EMAIL_SERVICE_FIELD_LABELS: Record<string, string> = {
  emailFrom: 'Email From',
  serviceIpAddress: 'IP Address',
  emailTo: 'Registered Email Ids for Enrichment Service Notifications',
  emailIbexTo: 'Email for IBEX Slide Analysis Event',
};
