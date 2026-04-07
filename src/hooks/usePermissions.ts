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

    canRead: (pageId: string): boolean =>
      canReadWithScopes(pageId, role, userScopes, securityConfig, configLoaded),

    canWrite: (pageId: string): boolean =>
      canWriteWithScopes(pageId, role, userScopes, securityConfig, configLoaded),

    getPermission: (pageId: string) => getPermission(pageId, role),

    hasScope: (scope: string): boolean => userScopes.includes(scope),

    hasAllScopes: (scopes: string[]): boolean =>
      scopes.every((s) => userScopes.includes(s)),
  };
}