export const API_URLS = {
    enrichment: {
      tools:        "/api/enrichment/tools/**",
      lis:          "/api/enrichment/tools/lis",
      lisConnector: "/api/enrichment/tools/eh-lis-connector",
      synapse:      "/api/enrichment/tools/synapse",
    },
    scanners: {
      base:       "/api/scanners",
      detail:     "/api/scanners/**",
      dicomStore: "/api/scanners/datasets/dicomStores",
    },
    config: {
      all:        "/api/config/**",
      dicomStore: "/api/config/path-qa/dicom-store",
    },
    qaAnalysis: {
      base:   "/api/slides",
      detail: "/api/slides/**",
    },
    slideAnalysis: {
      all:    "/api/slide-analysis/**",
      device: "/api/slide-analysis/device/**",
    },
    scanStatus: {
      all:     "/api/slide-scan-status/**",
      stream:  "/api/slide-scan-status/stream/in-progress",
      barcode: "/api/slide-scan-status/barcode/**",
    },
    hospital: {
      all: "/api/hospital-metadata/**",
    },
    auth: {
      config: "/api/auth/config",
    },
  } as const;