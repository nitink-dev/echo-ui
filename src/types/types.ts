export type PageType =
  | 'list'               // generic list page
  | 'add'                // generic add form
  | 'edit'               // generic edit form
  | 'view'               // generic detail view
  | 'qa-analysis'
  | 'google-dicom-temp'
  | 'google-dicom-final'
  | 'hl7-store'
  | 'lis'
  | 'synapse';
 // | 'dicom-receiver';