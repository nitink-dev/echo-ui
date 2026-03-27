// src/config/roleConfig.ts

export type Role = "ROLE_ADMIN" | "ROLE_DEVELOPER" | "ROLE_OPERATOR" | "ROLE_VIEWER";
export type Permission = "read" | "write" | "none";

export interface PagePermission {
  read: boolean;
  write: boolean;
}

// Permission matrix
// ROLE_DEVELOPER = same as ROLE_ADMIN (full access, used in dev/staging)
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
 * Get permission for a specific page and role.
 * Returns { read: false, write: false } if page/role not found.
 */
export function getPermission(pageId: string, role: Role | null): PagePermission {
  if (!role) return { read: false, write: false };
  return permissionMatrix[pageId]?.[role] ?? { read: false, write: false };
}

/** Check if a role can navigate to a page */
export function canRead(pageId: string, role: Role | null): boolean {
  return getPermission(pageId, role).read;
}

/** Check if a role can create/edit/delete on a page */
export function canWrite(pageId: string, role: Role | null): boolean {
  return getPermission(pageId, role).write;
}