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
  permission: ApiPermission | undefined,
  userScopes: string[],
  securityConfig: SecurityConfigEntry[]
): boolean {
  if (!permission) return false;
  const { api, method } = permission;
  const { required, isPublic } = getRequiredScopes(api, method, securityConfig);
  return userCanAccess(userScopes, required, isPublic);
}

function isPagePublicByMap(pageId: string): boolean {
  const mapping = PAGE_API_MAP[pageId];
  if (!mapping) return false;
  const { api } = mapping.read;
  return ALWAYS_PUBLIC_API_PREFIXES.some((prefix) =>
    api === prefix || api.startsWith(prefix)
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
  return checkAccess(mapping.read, userScopes, securityConfig);
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
  return checkAccess(mapping.write, userScopes, securityConfig);
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
  return checkAccess(mapping.delete, userScopes, securityConfig);
}