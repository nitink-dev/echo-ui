import { SecurityConfigEntry } from "../api/services/authService";
import { PAGE_API_MAP, ApiPermission } from "./pageApiMap";

export type Role =
  | "ROLE_ADMIN"
  | "ROLE_DEVELOPER"
  | "ROLE_OPERATOR"
  | "ROLE_VIEWER";

const ALWAYS_PUBLIC_API_PREFIXES: string[] = [
  "/api/health/status",
];

function findBestMatch(
  apiPath: string,
  method: string,
  securityConfig: SecurityConfigEntry[]
): SecurityConfigEntry | undefined {
  let best: SecurityConfigEntry | undefined;
  let bestScore = -1;

  for (const entry of securityConfig) {
    if (!entry.methods.includes(method.toUpperCase())) continue;

    const pattern = entry.api;
    let score = -1;

    if (pattern === apiPath) {
      score = 1000;
    } else if (pattern.endsWith("/**")) {
      const prefix = pattern.slice(0, -3);
      if (apiPath.startsWith(prefix)) {
        score = prefix.length;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      best = entry;
    }
  }

  return best;
}

function getRequiredScopes(
  apiPath: string,
  method: string,
  securityConfig: SecurityConfigEntry[]
): { required: string[]; isPublic: boolean } {
  const entry = findBestMatch(apiPath, method, securityConfig);
  return {
    required: entry?.requiredScopes ?? [],
    isPublic: entry?.isPublic ?? false,
  };
}

function userCanAccess(
  userScopes: string[],
  required: string[],
  isPublic: boolean
): boolean {
  if (isPublic) return true;
  if (required.length === 0) return false;
  return required.some((scope) => userScopes.includes(scope));
}

function checkAccess(
  permission: ApiPermission,
  userScopes: string[],
  securityConfig: SecurityConfigEntry[]
): boolean {
  const { api, method } = permission;
  const { required, isPublic } = getRequiredScopes(api, method, securityConfig);
  return userCanAccess(userScopes, required, isPublic);
}

function checkAnyAccess(
  permissions: ApiPermission[],
  userScopes: string[],
  securityConfig: SecurityConfigEntry[]
): boolean {
  return permissions.some((permission) =>
    checkAccess(permission, userScopes, securityConfig)
  );
}

function isPagePublicByMap(pageId: string): boolean {
  const mapping = PAGE_API_MAP[pageId];
  if (!mapping) return false;
  return mapping.read.some(({ api }) =>
    ALWAYS_PUBLIC_API_PREFIXES.some(
      (prefix) => api === prefix || api.startsWith(prefix)
    )
  );
}

export function canReadWithScopes(
  pageId: string,
  userScopes: string[],
  securityConfig: SecurityConfigEntry[],
  configLoaded: boolean
): boolean {
  const mapping = PAGE_API_MAP[pageId];
  if (!mapping) return false;
  if (!configLoaded || !securityConfig?.length) {
    return isPagePublicByMap(pageId);
  }
  return checkAnyAccess(mapping.read, userScopes, securityConfig);
}

export function canWriteWithScopes(
  pageId: string,
  userScopes: string[],
  securityConfig: SecurityConfigEntry[],
  configLoaded: boolean
): boolean {
  if (!configLoaded || !securityConfig?.length) return false;
  const mapping = PAGE_API_MAP[pageId];
  if (!mapping?.write?.length) return false;
  return checkAnyAccess(mapping.write, userScopes, securityConfig);
}

export function canDeleteWithScopes(
  pageId: string,
  userScopes: string[],
  securityConfig: SecurityConfigEntry[],
  configLoaded: boolean
): boolean {
  if (!configLoaded || !securityConfig?.length) return false;
  const mapping = PAGE_API_MAP[pageId];
  if (!mapping?.delete?.length) return false;
  return checkAnyAccess(mapping.delete, userScopes, securityConfig);
}