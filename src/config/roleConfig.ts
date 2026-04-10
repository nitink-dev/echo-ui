// src/config/roleConfig.ts
import { SecurityConfigEntry } from "../api/services/authService";

export type Role = "ROLE_ADMIN" | "ROLE_DEVELOPER" | "ROLE_OPERATOR" | "ROLE_VIEWER";

export interface PagePermission {
  read: boolean;
  write: boolean;
}

// ─────────────────────────────────────────────────────────────
// PLATFORM SUPER-SCOPES
// ROLE_DEVELOPER / platform admin
// ─────────────────────────────────────────────────────────────
const PLATFORM_READ_SCOPES  = ["platform.read"];
const PLATFORM_WRITE_SCOPES = ["platform.write", "platform.update", "platform.delete", "platform.create"];

// ─────────────────────────────────────────────────────────────
// PAGE → API ROUTE MAPPING
// Needed to match pageId → API path → securityConfig entry
// ─────────────────────────────────────────────────────────────
export const pageApiMap: Record<string, { read: string; write?: string; writeMethod?: string }> = {
  list:              { read: "/api/scanners",            write: "/api/scanners",            writeMethod: "POST"  },
  add:               { read: "/api/scanners",            write: "/api/scanners",            writeMethod: "POST"  },
  edit:              { read: "/api/scanners/**",         write: "/api/scanners/**",         writeMethod: "PATCH" },
  view:              { read: "/api/scanners/**" },
  lis:               { read: "/api/config/**",           write: "/api/config/**",           writeMethod: "PATCH" },
  synapse:           { read: "/api/config/**",           write: "/api/config/**",           writeMethod: "PATCH" },
  "qa-analysis":     { read: "/api/slides",              write: "/api/slides/**",           writeMethod: "PATCH" },
  "enrichment-tool": { read: "/api/enrichment/tools/**", write: "/api/enrichment/tools/**", writeMethod: "PATCH" },
  "health-status":   { read: "/api/health/status/**" },
  "slide-status":    { read: "/api/slide-scan-status/**" },
};

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

function getRequiredScopes(
  apiPath: string,
  method: string,
  securityConfig: SecurityConfigEntry[]
): { required: string[]; isPublic: boolean } {
  const entry = securityConfig.find((cfg) => {
    if (!cfg.methods.includes(method.toUpperCase())) return false;
    if (cfg.api === apiPath) return true;
    if (cfg.api.endsWith("/**")) {
      const prefix = cfg.api.slice(0, -3);
      return (
        apiPath === prefix ||
        apiPath.startsWith(prefix + "/") ||
        apiPath.startsWith(prefix)
      );
    }
    return false;
  });

  return {
    required: entry?.requiredScopes ?? [],
    isPublic: entry?.isPublic ?? false,
  };
}

function userCanAccess(
  userScopes: string[],
  required: string[],
  isPublic: boolean,
  type: "read" | "write"
): boolean {
  if (isPublic) return true;
  if (required.length === 0) return true;

  const platformScopes = type === "read" ? PLATFORM_READ_SCOPES : PLATFORM_WRITE_SCOPES;
  const hasPlatformScope = platformScopes.some((s) => userScopes.includes(s));
  if (hasPlatformScope) return true;

  return required.every((scope) => userScopes.includes(scope));
}

// ─────────────────────────────────────────────────────────────
// PUBLIC API — used by usePermissions hook
// ─────────────────────────────────────────────────────────────

export function canReadWithScopes(
  pageId: string,
  userScopes: string[],
  securityConfig: SecurityConfigEntry[],
  configLoaded: boolean
): boolean {
  // Config load nahi hua toh safe default: deny
  if (!configLoaded || securityConfig.length === 0) return false;

  const mapping = pageApiMap[pageId];
  if (!mapping) return false;

  const { required, isPublic } = getRequiredScopes(mapping.read, "GET", securityConfig);
  return userCanAccess(userScopes, required, isPublic, "read");
}

export function canWriteWithScopes(
  pageId: string,
  userScopes: string[],
  securityConfig: SecurityConfigEntry[],
  configLoaded: boolean
): boolean {
  if (!configLoaded || securityConfig.length === 0) return false;

  const mapping = pageApiMap[pageId];
  if (!mapping?.write) return false;

  const method = mapping.writeMethod ?? "PATCH";
  const { required, isPublic } = getRequiredScopes(mapping.write, method, securityConfig);
  return userCanAccess(userScopes, required, isPublic, "write");
}