// src/config/roleConfig.ts
import { SecurityConfigEntry } from "../api/services/authService";

export type Role = "ROLE_ADMIN" | "ROLE_DEVELOPER" | "ROLE_OPERATOR" | "ROLE_VIEWER";
export type Permission = "read" | "write" | "none";

export interface PagePermission {
  read: boolean;
  write: boolean;
}

// ─────────────────────────────────────────────────────────────
// PAGE → API ROUTE MAPPING
// Maps each frontend page ID to the backend API routes it uses.
// This lets us cross-reference the live security config to derive
// whether the current user's scopes grant read/write access.
// ─────────────────────────────────────────────────────────────
export const pageApiMap: Record<string, { read: string; write?: string }> = {
  // Devices & Adapters
  list:    { read: "/api/scanners",    write: "/api/scanners" },
  add:     { read: "/api/scanners",    write: "/api/scanners" },
  edit:    { read: "/api/scanners/**", write: "/api/scanners/**" },
  view:    { read: "/api/scanners/**" },

  // Applications
  lis:                { read: "/api/config/**",           write: "/api/config/**" },
  synapse:            { read: "/api/config/**",           write: "/api/config/**" },
  "qa-analysis":      { read: "/api/slides",              write: "/api/slides/**" },
  "enrichment-tool":  { read: "/api/enrichment/tools/**", write: "/api/enrichment/tools/**" },
  "health-status":    { read: "/api/health/status/**" },
  "slide-status":     { read: "/api/slide-scan-status/**" },
};

// ─────────────────────────────────────────────────────────────
// ROLE-BASED PERMISSION MATRIX  (static fallback)
// Used when the live security config hasn't loaded yet, or when
// the config fetch failed.
// ROLE_DEVELOPER = same as ROLE_ADMIN (full access, used in dev/staging)
// ─────────────────────────────────────────────────────────────
const permissionMatrix: Record<string, Record<Role, PagePermission>> = {
  // ── Devices & Adapters ──────────────────────────────────────
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
    ROLE_ADMIN:     { read: true,  write: true  },
    ROLE_DEVELOPER: { read: true,  write: true  },
    ROLE_OPERATOR:  { read: true,  write: true  },
    ROLE_VIEWER:    { read: true,  write: false },
  },

  // ── Applications ────────────────────────────────────────────
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

/**
 * Get role-based permission for a page (static fallback).
 * Returns { read: false, write: false } if page/role not found.
 */
export function getPermission(pageId: string, role: Role | null): PagePermission {
  if (!role) return { read: false, write: false };
  return permissionMatrix[pageId]?.[role] ?? { read: false, write: false };
}

/** Role-based read check (static fallback) */
export function canRead(pageId: string, role: Role | null): boolean {
  return getPermission(pageId, role).read;
}

/** Role-based write check (static fallback) */
export function canWrite(pageId: string, role: Role | null): boolean {
  return getPermission(pageId, role).write;
}

// ─────────────────────────────────────────────────────────────
// SCOPE-BASED PERMISSION HELPERS
// These use the live security config fetched from the backend.
// They check whether the user's scopes satisfy the required scopes
// for the API route(s) mapped to the given page.
// ─────────────────────────────────────────────────────────────

/**
 * Find the required scopes for a given API path + HTTP method
 * from the live security config.
 *
 * Supports wildcard patterns like /api/scanners/** by checking
 * if the config entry's path (with ** replaced) is a prefix match.
 */
function getRequiredScopes(
  apiPath: string,
  method: string,
  securityConfig: SecurityConfigEntry[]
): string[] {
  // Exact match first, then wildcard match
  const entry = securityConfig.find((cfg) => {
    const methodMatch = cfg.methods.includes(method.toUpperCase());
    if (!methodMatch) return false;

    if (cfg.api === apiPath) return true;

    // Wildcard: /api/scanners/** matches /api/scanners or /api/scanners/anything
    if (cfg.api.endsWith("/**")) {
      const prefix = cfg.api.slice(0, -3); // strip /**
      return apiPath === prefix || apiPath.startsWith(prefix + "/") || apiPath.startsWith(prefix);
    }

    return false;
  });

  return entry?.requiredScopes ?? [];
}

/**
 * Check if the user's scopes satisfy ALL required scopes for an API entry.
 */
function userHasScopes(userScopes: string[], requiredScopes: string[]): boolean {
  if (requiredScopes.length === 0) return true; // public or no restriction
  return requiredScopes.every((scope) => userScopes.includes(scope));
}

/**
 * Scope-aware read permission check.
 *
 * Priority:
 *   1. If securityConfig is loaded → use scope check against live config.
 *   2. Fallback → use static role-based matrix.
 *
 * A page is "readable" if the user's scopes cover the required scopes
 * for the GET request on the page's mapped API route.
 */
export function canReadWithScopes(
  pageId: string,
  role: Role | null,
  userScopes: string[],
  securityConfig: SecurityConfigEntry[],
  configLoaded: boolean
): boolean {
  if (!configLoaded || securityConfig.length === 0) {
    return canRead(pageId, role); // fallback
  }

  const mapping = pageApiMap[pageId];
  if (!mapping) return canRead(pageId, role); // unknown page → fallback

  const required = getRequiredScopes(mapping.read, "GET", securityConfig);

  // If the route is marked public, allow unconditionally
  const entry = securityConfig.find(
    (cfg) =>
      cfg.api === mapping.read ||
      (cfg.api.endsWith("/**") &&
        mapping.read.startsWith(cfg.api.slice(0, -3)))
  );
  if (entry?.isPublic) return true;

  return userHasScopes(userScopes, required);
}

/**
 * Scope-aware write permission check.
 *
 * Checks PATCH/PUT for the page's mapped write API route.
 * Falls back to role-based matrix if config not loaded.
 */
export function canWriteWithScopes(
  pageId: string,
  role: Role | null,
  userScopes: string[],
  securityConfig: SecurityConfigEntry[],
  configLoaded: boolean
): boolean {
  if (!configLoaded || securityConfig.length === 0) {
    return canWrite(pageId, role); // fallback
  }

  const mapping = pageApiMap[pageId];
  if (!mapping?.write) return false; // no write route defined

  // Check PATCH (most common mutating method in this API)
  const required = getRequiredScopes(mapping.write, "PATCH", securityConfig);

  if (required.length === 0) {
    // Try POST as fallback (for create-only routes like /api/scanners POST)
    const postRequired = getRequiredScopes(mapping.write, "POST", securityConfig);
    return userHasScopes(userScopes, postRequired);
  }

  return userHasScopes(userScopes, required);
}