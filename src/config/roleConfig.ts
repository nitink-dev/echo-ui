// roleConfig.ts
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

const PLATFORM_READ_SCOPES = ["platform.read"];
const PLATFORM_WRITE_SCOPES = ["platform.create", "platform.update"];
const PLATFORM_DELETE_SCOPES = ["platform.delete"];

const SPECIFIC_SCOPE_MAP: Record<string, { write?: string[]; delete?: string[] }> = {
  list: {
    write: ["scanner.update"],
    delete: ["scanner.update"],
  },
  add: {
    write: ["scanner.update"],
  },
  edit: {
    write: ["scanner.update"],
    delete: ["scanner.update"],
  },
  lis: {
    write: ["config.update", "config.path-qa-store.update"],
  },
  synapse: {
    write: ["config.update"],
  },
  "qa-analysis": {
    write: ["qa-slide.update"],
    delete: ["qa-slide.update"],
  },
  "enrichment-tool": {
    write: ["config.update"],
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
  platformBypassScopes: string[],
  specificBypassScopes: string[]
): boolean {
  if (isPublic) return true;

  const allBypassScopes = [...platformBypassScopes, ...specificBypassScopes];

  if (!required || required.length === 0) {
    return allBypassScopes.some((s) => userScopes.includes(s));
  }

  if (allBypassScopes.some((s) => userScopes.includes(s))) {
    return true;
  }

  return required.every((scope) => userScopes.includes(scope));
}

function checkAccess(
  permission: ApiPermission | undefined,
  userScopes: string[],
  securityConfig: SecurityConfigEntry[],
  platformBypassScopes: string[],
  specificBypassScopes: string[]
): boolean {
  if (!permission) return false;

  const { api, method } = permission;
  const { required, isPublic } = getRequiredScopes(api, method, securityConfig);

  return userCanAccess(userScopes, required, isPublic, platformBypassScopes, specificBypassScopes);
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
    PLATFORM_READ_SCOPES,
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

  const specificScopes = SPECIFIC_SCOPE_MAP[pageId]?.write ?? [];

  return checkAccess(
    mapping.write,
    userScopes,
    securityConfig,
    PLATFORM_WRITE_SCOPES,
    specificScopes
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

  const specificScopes = SPECIFIC_SCOPE_MAP[pageId]?.delete ?? [];

  return checkAccess(
    mapping.delete,
    userScopes,
    securityConfig,
    PLATFORM_DELETE_SCOPES,
    specificScopes
  );
}