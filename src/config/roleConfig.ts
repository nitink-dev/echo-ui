import { SecurityConfigEntry } from "../api/services/authService";
import { PAGE_API_MAP, ApiPermission } from "./pageApiMap";

export type Role =
  | "ROLE_ADMIN"
  | "ROLE_DEVELOPER"
  | "ROLE_OPERATOR"
  | "ROLE_VIEWER";

export interface PagePermission {
  read: boolean;
  write: boolean;
}

// ─────────────────────────────────────────────────────────────
// PLATFORM SUPER-SCOPES
// ─────────────────────────────────────────────────────────────
const PLATFORM_READ_SCOPES = ["platform.read"];
const PLATFORM_WRITE_SCOPES = ["platform.write", "platform.update", "platform.create"];
const PLATFORM_DELETE_SCOPES = ["platform.delete"];

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

function matchApi(pattern: string, apiPath: string): boolean {
  if (pattern === apiPath) return true;

  if (pattern.endsWith("/**")) {
    const prefix = pattern.slice(0, -3);
    return apiPath.startsWith(prefix);
  }

  return false;
}

function getRequiredScopes(
  apiPath: string,
  method: string,
  securityConfig: SecurityConfigEntry[]
): { required: string[]; isPublic: boolean } {
  const entry = securityConfig.find((cfg) => {
    if (!cfg.methods.includes(method.toUpperCase())) return false;
    return matchApi(cfg.api, apiPath);
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
  platformScopes: string[]
): boolean {
  if (isPublic) return true;
  if (!required || required.length === 0) return true;

  const hasPlatformScope = platformScopes.some((s) =>
    userScopes.includes(s)
  );
  if (hasPlatformScope) return true;

  return required.every((scope) => userScopes.includes(scope));
}

// 🔥 NEW COMMON ACCESS CHECK (clean abstraction)
function checkAccess(
  permission: ApiPermission | undefined,
  userScopes: string[],
  securityConfig: SecurityConfigEntry[],
  platformScopes: string[]
): boolean {
  if (!permission) return false;

  const { api, method } = permission;

  const { required, isPublic } = getRequiredScopes(
    api,
    method,
    securityConfig
  );

  return userCanAccess(userScopes, required, isPublic, platformScopes);
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
  if (!configLoaded || !securityConfig?.length) return false;

  const mapping = PAGE_API_MAP[pageId];
  if (!mapping) return false;

  return checkAccess(
    mapping.read,
    userScopes,
    securityConfig,
    PLATFORM_READ_SCOPES
  );
}

export function canWriteWithScopes(
  pageId: string,
  userScopes: string[],
  securityConfig: SecurityConfigEntry[],
  configLoaded: boolean
): boolean {
  if (!configLoaded || !securityConfig?.length) return false;

  const mapping = PAGE_API_MAP[pageId];
  if (!mapping?.write) return false;

  return checkAccess(
    mapping.write,
    userScopes,
    securityConfig,
    PLATFORM_WRITE_SCOPES
  );
}

export function canDeleteWithScopes(
  pageId: string,
  userScopes: string[],
  securityConfig: SecurityConfigEntry[],
  configLoaded: boolean
): boolean {
  if (!configLoaded || !securityConfig?.length) return false;

  const mapping = PAGE_API_MAP[pageId];
  if (!mapping?.delete) return false;

  return checkAccess(
    mapping.delete,
    userScopes,
    securityConfig,
    PLATFORM_DELETE_SCOPES
  );
}