export type PageType =
  | 'list'
  | 'add'
  | 'edit'
  | 'view'
  | 'qa-analysis'
  | 'google-dicom-temp'
  | 'google-dicom-final'
  | 'hl7-store'
  | 'lis'
  | 'synapse'
  | 'enrichment-tool'
  | 'health-status';

export interface Breadcrumb {
  label: string;
  href?: string;
}

export interface FormErrors {
  [key: string]: string;
}