// src/hooks/usePermissions.ts
import { useSelector } from "react-redux";
import {
  canRead,
  canWrite,
  canReadWithScopes,
  canWriteWithScopes,
  getPermission,
  Role,
} from "../config/roleConfig";
import { SecurityConfigEntry } from "../api/services/authService";

export function usePermissions() {
  const role          = useSelector((state: any) => state.auth.role)                as Role | null;
  const userScopes    = useSelector((state: any) => state.auth.scopes)              as string[];
  const securityConfig = useSelector((state: any) => state.auth.securityConfig)     as SecurityConfigEntry[];
  const configLoaded  = useSelector((state: any) => state.auth.securityConfigLoaded) as boolean;

  return {
    role,
    userScopes,
    securityConfig,
    configLoaded,

    /**
     * Returns true if the user can navigate to / view this page.
     * Uses live scope check when config is loaded, role matrix as fallback.
     */
    canRead: (pageId: string): boolean =>
      canReadWithScopes(pageId, role, userScopes, securityConfig, configLoaded),

    /**
     * Returns true if the user can create / edit / delete on this page.
     * Uses live scope check when config is loaded, role matrix as fallback.
     */
    canWrite: (pageId: string): boolean =>
      canWriteWithScopes(pageId, role, userScopes, securityConfig, configLoaded),

    /**
     * Returns the static role-based PagePermission.
     * Useful for components that need both read + write in one call.
     */
    getPermission: (pageId: string) => getPermission(pageId, role),

    /**
     * Returns true if the user has a specific scope string.
     * e.g. hasScope("scanner.create")
     */
    hasScope: (scope: string): boolean => userScopes.includes(scope),

    /**
     * Returns true if the user has ALL of the provided scopes.
     */
    hasAllScopes: (scopes: string[]): boolean =>
      scopes.every((s) => userScopes.includes(s)),
  };
}