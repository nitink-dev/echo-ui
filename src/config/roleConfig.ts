// src/config/roleConfig.ts
import { SecurityConfigEntry } from "../api/services/authService";

export type Role = "ROLE_ADMIN" | "ROLE_DEVELOPER" | "ROLE_OPERATOR" | "ROLE_VIEWER";
export type Permission = "read" | "write" | "none";

export interface PagePermission {
  read: boolean;
  write: boolean;
}

// ─────────────────────────────────────────────────────────────
// PLATFORM SUPER-SCOPES
// Agar user ke paas in mein se koi bhi scope hai toh woh
// specific feature scope ke bina bhi access paayega.
// ROLE_DEVELOPER / platform admin yahi use karega.
// ─────────────────────────────────────────────────────────────
const PLATFORM_READ_SCOPES  = ["platform.read"];
const PLATFORM_WRITE_SCOPES = ["platform.write", "platform.update", "platform.delete", "platform.create"];

// ─────────────────────────────────────────────────────────────
// PAGE → API ROUTE MAPPING
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
// ROLE-BASED PERMISSION MATRIX (static fallback)
// ─────────────────────────────────────────────────────────────
const permissionMatrix: Record<string, Record<Role, PagePermission>> = {
  list: {
    ROLE_ADMIN:     { read: true,  write: true  },
    ROLE_DEVELOPER: { read: true,  write: true  },
    ROLE_OPERATOR:  { read: true,  write: true  },
    ROLE_VIEWER:    { read: true,  write: false },
  },
  add: {
    ROLE_ADMIN:     { read: true,  write: true  },
    ROLE_DEVELOPER: { read: true,  write: true  },
    ROLE_OPERATOR:  { read: true,  write: true  },
    ROLE_VIEWER:    { read: false, write: false },
  },
  edit: {
    ROLE_ADMIN:     { read: true,  write: true  },
    ROLE_DEVELOPER: { read: true,  write: true  },
    ROLE_OPERATOR:  { read: true,  write: true  },
    ROLE_VIEWER:    { read: false, write: false },
  },
  view: {
    ROLE_ADMIN:     { read: true,  write: false },
    ROLE_DEVELOPER: { read: true,  write: false },
    ROLE_OPERATOR:  { read: true,  write: false },
    ROLE_VIEWER:    { read: true,  write: false },
  },
  lis: {
    ROLE_ADMIN:     { read: true,  write: true  },
    ROLE_DEVELOPER: { read: true,  write: true  },
    ROLE_OPERATOR:  { read: true,  write: false },
    ROLE_VIEWER:    { read: false, write: false },
  },
  synapse: {
    ROLE_ADMIN:     { read: true,  write: true  },
    ROLE_DEVELOPER: { read: true,  write: true  },
    ROLE_OPERATOR:  { read: true,  write: false },
    ROLE_VIEWER:    { read: false, write: false },
  },
  "qa-analysis": {
    ROLE_ADMIN:     { read: true,  write: true  },
    ROLE_DEVELOPER: { read: true,  write: true  },
    ROLE_OPERATOR:  { read: true,  write: false },
    ROLE_VIEWER:    { read: false, write: false },
  },
  "enrichment-tool": {
    ROLE_ADMIN:     { read: true,  write: true  },
    ROLE_DEVELOPER: { read: true,  write: true  },
    ROLE_OPERATOR:  { read: true,  write: false },
    ROLE_VIEWER:    { read: false, write: false },
  },
  "health-status": {
    ROLE_ADMIN:     { read: true,  write: false },
    ROLE_DEVELOPER: { read: true,  write: false },
    ROLE_OPERATOR:  { read: true,  write: false },
    ROLE_VIEWER:    { read: true,  write: false },
  },
  "slide-status": {
    ROLE_ADMIN:     { read: true,  write: false },
    ROLE_DEVELOPER: { read: true,  write: false },
    ROLE_OPERATOR:  { read: true,  write: false },
    ROLE_VIEWER:    { read: true,  write: false },
  },
};

export function getPermission(pageId: string, role: Role | null): PagePermission {
  if (!role) return { read: false, write: false };
  return permissionMatrix[pageId]?.[role] ?? { read: false, write: false };
}

export function canRead(pageId: string, role: Role | null): boolean {
  return getPermission(pageId, role).read;
}

export function canWrite(pageId: string, role: Role | null): boolean {
  return getPermission(pageId, role).write;
}

// ─────────────────────────────────────────────────────────────
// INTERNAL HELPERS
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

/**
 * Core access check with OR logic:
 *
 *   ALLOW if route is public
 *   OR user has platform super-scope  ← platform admin / ROLE_DEVELOPER
 *   OR user has ALL specific feature scopes ← feature-specific role
 *
 * Example:
 *   Required: ["scanners.read", "platform.read"]
 *   User A has: ["platform.read"] → ✅ (platform super-scope)
 *   User B has: ["scanners.read", "platform.read"] → ✅ (all feature scopes)
 *   User C has: ["scanners.read"] only → ✅ (has the feature scope, missing platform.read
 *               but platform.read is also in required — so still passes feature check)
 *   User D has: [] → ❌
 */
function userCanAccess(
  userScopes: string[],
  required: string[],
  isPublic: boolean,
  type: "read" | "write"
): boolean {
  if (isPublic) return true;
  if (required.length === 0) return true;

  // Platform super-scope — OR condition with feature scopes
  const platformScopes = type === "read" ? PLATFORM_READ_SCOPES : PLATFORM_WRITE_SCOPES;
  const hasPlatformScope = platformScopes.some((s) => userScopes.includes(s));
  if (hasPlatformScope) return true;

  // Feature-specific — must have ALL required scopes
  return required.every((scope) => userScopes.includes(scope));
}

// ─────────────────────────────────────────────────────────────
// PUBLIC API — used by usePermissions hook
// ─────────────────────────────────────────────────────────────

export function canReadWithScopes(
  pageId: string,
  role: Role | null,
  userScopes: string[],
  securityConfig: SecurityConfigEntry[],
  configLoaded: boolean
): boolean {
  if (!configLoaded || securityConfig.length === 0) {
    return canRead(pageId, role);
  }
  const mapping = pageApiMap[pageId];
  if (!mapping) return canRead(pageId, role);

  const { required, isPublic } = getRequiredScopes(mapping.read, "GET", securityConfig);
  return userCanAccess(userScopes, required, isPublic, "read");
}

export function canWriteWithScopes(
  pageId: string,
  role: Role | null,
  userScopes: string[],
  securityConfig: SecurityConfigEntry[],
  configLoaded: boolean
): boolean {
  if (!configLoaded || securityConfig.length === 0) {
    return canWrite(pageId, role);
  }
  const mapping = pageApiMap[pageId];
  if (!mapping?.write) return false;

  const method = mapping.writeMethod ?? "PATCH";
  const { required, isPublic } = getRequiredScopes(mapping.write, method, securityConfig);
  return userCanAccess(userScopes, required, isPublic, "write");
}