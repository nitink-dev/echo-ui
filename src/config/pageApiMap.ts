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

// 🔥 Strict + backend aligned map
export const PAGE_API_MAP: Record<string, PageApiConfig> = {
  // ─────────────────────────────
  // SCANNERS
  // ─────────────────────────────
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

  // ─────────────────────────────
  // CONFIG
  // ─────────────────────────────
  lis: {
    read: { api: "/api/config/**", method: "GET" },
    write: { api: "/api/config/**", method: "PATCH" },
  },

  synapse: {
    read: { api: "/api/config/**", method: "GET" },
    write: { api: "/api/config/**", method: "PATCH" },
  },

  // ─────────────────────────────
  // QA / SLIDES
  // ─────────────────────────────
  "qa-analysis": {
    read: { api: "/api/slides", method: "GET" },
    write: { api: "/api/slides/**", method: "PATCH" },
    delete: { api: "/api/slides/**", method: "DELETE" },
  },

  // ─────────────────────────────
  // ENRICHMENT
  // ─────────────────────────────
  "enrichment-tool": {
    read: { api: "/api/enrichment/tools/**", method: "GET" },
    write: { api: "/api/enrichment/tools/**", method: "PATCH" },
  },

  // ─────────────────────────────
  // HEALTH
  // ─────────────────────────────
  "health-status": {
    read: { api: "/api/health/status/**", method: "GET" },
  },

  // ─────────────────────────────
  // SLIDE STATUS
  // ─────────────────────────────
  "slide-status": {
    read: { api: "/api/slide-scan-status/**", method: "GET" },
  },
};