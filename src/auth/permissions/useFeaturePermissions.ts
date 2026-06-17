// import { usePermissions } from "./usePermissions";

// export function useFeaturePermissions() {
//   const { canGet, canPost, canPatch, canPut, canDelete, canUpdate } = usePermissions();

//   return {
//     enrichment: {
//       canRead:           canGet("/api/enrichment/tools/**"),
//       canEditLis:        canUpdate("/api/enrichment/tools/lis"),
//       canEditLisConn:    canUpdate("/api/enrichment/tools/eh-lis-connector"),
//       canEditSynapse:    canUpdate("/api/enrichment/tools/synapse"),
//       canEditAny:        canUpdate("/api/enrichment/tools/**"),
//     },
//     scanners: {
//       canRead:       canGet("/api/scanners"),
//       canReadDetail: canGet("/api/scanners/**"),
//       canReadDicom:  canGet("/api/scanners/datasets/dicomStores"),
//       canCreate:     canPost("/api/scanners"),
//       canUpdate:     canUpdate("/api/scanners/**"),
//       canDelete:     canDelete("/api/scanners/**"),
//     },
//     config: {
//       canRead:          canGet("/api/config/**"),
//       canUpdate:        canPatch("/api/config/**"),
//       canUpdateDicomStore: canUpdate("/api/config/path-qa/dicom-store"),
//     },
//     qaAnalysis: {
//       canRead:       canGet("/api/slides"),
//       canReadDetail: canGet("/api/slides/**"),
//       canCreate:     canPost("/api/slides/**"),
//       canUpdate:     canUpdate("/api/slides/**"),
//       canDelete:     canDelete("/api/slides/**"),
//     },
//     slideAnalysis: {
//       canRead:       canGet("/api/slide-analysis/**"),
//       canReadDevice: canGet("/api/slide-analysis/device/**"),
//     },
//     scanStatus: {
//       canReadStatus:  canGet("/api/slide-scan-status/**"),
//       canReadStream:  canGet("/api/slide-scan-status/stream/in-progress"),
//       canReadBarcode: canGet("/api/slide-scan-status/barcode/**"),
//     },
//     hospital: {
//       canRead: canGet("/api/hospital-metadata/**"),
//     },
//     auth: {
//       canReadConfig: canGet("/api/auth/config"),
//     },
//   };
// }