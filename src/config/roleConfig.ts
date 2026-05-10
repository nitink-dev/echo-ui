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

  console.groupCollapsed(`[findBestMatch] "${apiPath}" ${method}`);
  console.log("Security config entries to scan:", securityConfig.length);

  for (const entry of securityConfig) {
    if (!entry.methods.includes(method.toUpperCase())) {
      console.log(`  SKIP  "${entry.api}" [${entry.methods.join(",")}] — method mismatch`);
      continue;
    }

    const pattern = entry.api;
    let score = -1;

    if (pattern === apiPath) {
      score = 1000;
      console.log(`  EXACT "${pattern}" → score 1000`);
    } else if (pattern.endsWith("/**")) {
      const prefix = pattern.slice(0, -3);
      if (apiPath.startsWith(prefix)) {
        score = prefix.length;
        console.log(`  WILD  "${pattern}" prefix="${prefix}" → score ${score}`);
      } else {
        console.log(`  MISS  "${pattern}" prefix="${prefix}" — does not match`);
      }
    } else {
      console.log(`  MISS  "${pattern}" — no match`);
    }

    if (score > bestScore) {
      bestScore = score;
      best = entry;
      console.log(`  ✓ New best: "${pattern}" (score ${score})`);
    }
  }

  if (best) {
    console.log(`Result → "${best.api}" [${best.methods.join(",")}] scopes: [${best.requiredScopes.join(", ")}] isPublic: ${best.isPublic}`);
  } else {
    console.warn(`Result → NO MATCH FOUND for "${apiPath}" ${method}`);
  }

  console.groupEnd();
  return best;
}

function getRequiredScopes(
  apiPath: string,
  method: string,
  securityConfig: SecurityConfigEntry[]
): { required: string[]; isPublic: boolean } {
  const entry = findBestMatch(apiPath, method, securityConfig);

  const result = {
    required: entry?.requiredScopes ?? [],
    isPublic: entry?.isPublic ?? false,
  };

  if (!entry) {
    console.warn(`[getRequiredScopes] No config entry found for "${apiPath}" ${method} → defaulting to DENY`);
  } else {
    console.log(`[getRequiredScopes] "${apiPath}" ${method} → required: [${result.required.join(", ")}] isPublic: ${result.isPublic}`);
  }

  return result;
}

function userCanAccess(
  userScopes: string[],
  required: string[],
  isPublic: boolean,
  context: string
): boolean {
  console.groupCollapsed(`[userCanAccess] ${context}`);
  console.log("User scopes:    ", userScopes);
  console.log("Required scopes:", required);
  console.log("isPublic:       ", isPublic);

  let result: boolean;

  if (isPublic) {
    result = true;
    console.log("Decision: ✓ ALLOW — API is public");
  } else if (required.length === 0) {
    result = false;
    console.warn("Decision: ✗ DENY — no required scopes defined (no config = deny)");
  } else {
    const matchedScope = required.find((scope) => userScopes.includes(scope));
    result = !!matchedScope;
    if (result) {
      console.log(`Decision: ✓ ALLOW — matched scope "${matchedScope}"`);
    } else {
      console.warn(`Decision: ✗ DENY — user holds none of [${required.join(", ")}]`);
      console.warn(`User has: [${userScopes.join(", ")}]`);
    }
  }

  console.groupEnd();
  return result;
}

function checkAccess(
  permission: ApiPermission,
  userScopes: string[],
  securityConfig: SecurityConfigEntry[]
): boolean {
  const { api, method } = permission;
  console.log(`[checkAccess] Checking "${api}" ${method}`);
  const { required, isPublic } = getRequiredScopes(api, method, securityConfig);
  return userCanAccess(userScopes, required, isPublic, `${api} ${method}`);
}

function checkAnyAccess(
  permissions: ApiPermission[],
  userScopes: string[],
  securityConfig: SecurityConfigEntry[],
  label: string
): boolean {
  console.groupCollapsed(`[checkAnyAccess] ${label} — checking ${permissions.length} permission(s)`);

  let result = false;
  for (const permission of permissions) {
    const allowed = checkAccess(permission, userScopes, securityConfig);
    if (allowed) {
      console.log(`  ✓ Passed on "${permission.api}" ${permission.method} — stopping early`);
      result = true;
      break;
    } else {
      console.log(`  ✗ Failed "${permission.api}" ${permission.method}`);
    }
  }

  if (!result) {
    console.warn(`  ✗ ALL permissions failed for ${label}`);
  }

  console.groupEnd();
  return result;
}

function isPagePublicByMap(pageId: string): boolean {
  const mapping = PAGE_API_MAP[pageId];
  if (!mapping) {
    console.warn(`[isPagePublicByMap] "${pageId}" not found in PAGE_API_MAP`);
    return false;
  }
  const isPublic = mapping.read.some(({ api }) =>
    ALWAYS_PUBLIC_API_PREFIXES.some(
      (prefix) => api === prefix || api.startsWith(prefix)
    )
  );
  console.log(`[isPagePublicByMap] "${pageId}" → ${isPublic ? "PUBLIC (allow before config loads)" : "not public"}`);
  return isPublic;
}

export function canReadWithScopes(
  pageId: string,
  userScopes: string[],
  securityConfig: SecurityConfigEntry[],
  configLoaded: boolean
): boolean {
  console.group(`[canRead] page="${pageId}"`);
  console.log("configLoaded:", configLoaded, "| securityConfig entries:", securityConfig?.length ?? 0);

  const mapping = PAGE_API_MAP[pageId];
  if (!mapping) {
    console.warn(`  ✗ "${pageId}" not found in PAGE_API_MAP → DENY`);
    console.groupEnd();
    return false;
  }

  if (!configLoaded || !securityConfig?.length) {
    const pub = isPagePublicByMap(pageId);
    console.log(`  Config not loaded → ${pub ? "✓ ALLOW (public page)" : "✗ DENY (waiting for config)"}`);
    console.groupEnd();
    return pub;
  }

  const result = checkAnyAccess(mapping.read, userScopes, securityConfig, `canRead("${pageId}")`);
  console.log(`[canRead] "${pageId}" → ${result ? "✓ ALLOW" : "✗ DENY"}`);
  console.groupEnd();
  return result;
}

export function canWriteWithScopes(
  pageId: string,
  userScopes: string[],
  securityConfig: SecurityConfigEntry[],
  configLoaded: boolean
): boolean {
  console.group(`[canWrite] page="${pageId}"`);
  console.log("configLoaded:", configLoaded, "| securityConfig entries:", securityConfig?.length ?? 0);

  if (!configLoaded || !securityConfig?.length) {
    console.warn("  Config not loaded → ✗ DENY");
    console.groupEnd();
    return false;
  }

  const mapping = PAGE_API_MAP[pageId];
  if (!mapping?.write?.length) {
    console.warn(`  "${pageId}" has no write permissions defined in PAGE_API_MAP → ✗ DENY`);
    console.groupEnd();
    return false;
  }

  const result = checkAnyAccess(mapping.write, userScopes, securityConfig, `canWrite("${pageId}")`);
  console.log(`[canWrite] "${pageId}" → ${result ? "✓ ALLOW" : "✗ DENY"}`);
  console.groupEnd();
  return result;
}

export function canDeleteWithScopes(
  pageId: string,
  userScopes: string[],
  securityConfig: SecurityConfigEntry[],
  configLoaded: boolean
): boolean {
  console.group(`[canDelete] page="${pageId}"`);
  console.log("configLoaded:", configLoaded, "| securityConfig entries:", securityConfig?.length ?? 0);

  if (!configLoaded || !securityConfig?.length) {
    console.warn("  Config not loaded → ✗ DENY");
    console.groupEnd();
    return false;
  }

  const mapping = PAGE_API_MAP[pageId];
  if (!mapping?.delete?.length) {
    console.warn(`  "${pageId}" has no delete permissions defined in PAGE_API_MAP → ✗ DENY`);
    console.groupEnd();
    return false;
  }

  const result = checkAnyAccess(mapping.delete, userScopes, securityConfig, `canDelete("${pageId}")`);
  console.log(`[canDelete] "${pageId}" → ${result ? "✓ ALLOW" : "✗ DENY"}`);
  console.groupEnd();
  return result;
}