export type HttpMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

export interface ApiPermission {
  api: string;
  method: HttpMethod;
}

export interface PageApiConfig {
  read: ApiPermission;
  write?: ApiPermission;
  delete?: ApiPermission;
}

export const PAGE_API_MAP: Record<string, PageApiConfig> = {
  list: {
    read: { api: "/api/scanners", method: "GET" },
    write: { api: "/api/scanners", method: "POST" },
    delete: { api: "/api/scanners/**", method: "DELETE" },
  },

  add: {
    read: { api: "/api/scanners", method: "GET" },
    write: { api: "/api/scanners", method: "POST" },
  },

  edit: {
    read: { api: "/api/scanners/**", method: "GET" },
    write: { api: "/api/scanners/**", method: "PATCH" },
    delete: { api: "/api/scanners/**", method: "DELETE" },
  },

  view: {
    read: { api: "/api/scanners/**", method: "GET" },
  },

  lis: {
    read: { api: "/api/config/**", method: "GET" },
    write: { api: "/api/config/**", method: "PATCH" },
  },

  synapse: {
    read: { api: "/api/config/**", method: "GET" },
    write: { api: "/api/config/**", method: "PATCH" },
  },

  "qa-analysis": {
    read: { api: "/api/slides", method: "GET" },
    write: { api: "/api/slides/**", method: "PATCH" },
    delete: { api: "/api/slides/**", method: "DELETE" },
  },

  "enrichment-tool": {
    read: { api: "/api/enrichment/tools/**", method: "GET" },
    write: { api: "/api/enrichment/tools/**", method: "PATCH" },
  },

  "health-status": {
    read: { api: "/api/health/status/**", method: "GET" },
  },

  "slide-status": {
    read: { api: "/api/slide-scan-status/**", method: "GET" },
  },
};