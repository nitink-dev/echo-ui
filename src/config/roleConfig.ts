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

/**
 * Platform scopes MUST match HTTP semantics
 */
const PLATFORM_SCOPES_BY_METHOD: Record<string, string[]> = {
  GET: ["platform.read"],
  POST: ["platform.create"],
  PATCH: ["platform.update"],
  PUT: ["platform.update"],
  DELETE: ["platform.delete"],
};

/**
 * Page specific scopes (feature enforcement)
 */
const SPECIFIC_SCOPE_MAP: Record<
  string,
  { write?: string[]; delete?: string[] }
> = {
  list: {
    write: ["scanner.update"],
    delete: ["scanner.delete"],
  },
  add: {
    write: ["scanner.create"],
  },
  edit: {
    write: ["scanner.update"],
    delete: ["scanner.delete"],
  },
  lis: {
    write: ["config.update", "config.path-qa-store.update"],
  },
  synapse: {
    write: ["config.update"],
  },
  "qa-analysis": {
    write: ["qa-slide.update"],
    delete: ["qa-slide.delete"],
  },
  "enrichment-tool": {
    write: ["enrichment.tools.update"],
  },
};

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
  platformScopes: string[],
  featureScopes: string[]
): boolean {
  if (isPublic) return true;

  if (required.length > 0) {
    return required.some((s) => userScopes.includes(s));
  }

  const allowed = [...platformScopes, ...featureScopes];
  return allowed.some((s) => userScopes.includes(s));
}

function checkAccess(
  permission: ApiPermission | undefined,
  userScopes: string[],
  securityConfig: SecurityConfigEntry[],
  featureScopes: string[]
): boolean {
  if (!permission) return false;

  const { api, method } = permission;
  const { required, isPublic } = getRequiredScopes(api, method, securityConfig);
  const platformScopes = PLATFORM_SCOPES_BY_METHOD[method] ?? [];

  return userCanAccess(
    userScopes,
    required,
    isPublic,
    platformScopes,
    featureScopes
  );
}

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
    []
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

  const featureScopes = SPECIFIC_SCOPE_MAP[pageId]?.write ?? [];

  return checkAccess(
    mapping.write,
    userScopes,
    securityConfig,
    featureScopes
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

  const featureScopes = SPECIFIC_SCOPE_MAP[pageId]?.delete ?? [];

  return checkAccess(
    mapping.delete,
    userScopes,
    securityConfig,
    featureScopes
  );
}