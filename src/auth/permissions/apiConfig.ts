export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface ApiDef {
  path: string;
  method: HttpMethod;
}

export interface DynamicApiDef<T = any> {
  build: (params: T) => string;
  method: HttpMethod;
}

export const api = (path: string, method: HttpMethod): ApiDef => ({
  path,
  method,
});

export const dynamicApi = <T>(
  build: (params: T) => string,
  method: HttpMethod
): DynamicApiDef<T> => ({
  build,
  method,
});

export const API_URLS = {
  enrichment: {
    tools:      api("/api/enrichment/tools", "GET"),
    getTool:    dynamicApi<{ toolKey: string }>(({ toolKey }) => `/api/enrichment/tools/${toolKey}`, "GET"),
    updateTool: dynamicApi<{ toolKey: string }>(({ toolKey }) => `/api/enrichment/tools/${toolKey}`, "PATCH"),
    lis:        api("/api/enrichment/tools/lis", "GET"),
    lisConnector: api("/api/enrichment/tools/eh-lis-connector", "GET"),
    synapse:    api("/api/enrichment/tools/synapse", "GET"),
  },
  scanners: {
    base:       api("/api/scanners", "GET"),
    create:     api("/api/scanners", "POST"),
    dicomStore: api("/api/scanners/datasets/dicomStores", "GET"),
  },
  config: {
    dicomStore: api("/api/config/path-qa/dicom-store", "GET"),
  },
  qaAnalysis: {
    base:   api("/api/slides", "GET"),
    create: api("/api/slides", "POST"),
  },
  slideAnalysis: {
    all: api("/api/slide-analysis", "GET"),
  },
  scanStatus: {
    all:    api("/api/slide-scan-status", "GET"),
    stream: api("/api/slide-scan-status/stream/in-progress", "GET"),
  },
  hospital: {
    all: api("/api/hospital-metadata", "GET"),
  },
  auth: {
    config: api("/api/auth/config", "GET"),
  },
} as const;