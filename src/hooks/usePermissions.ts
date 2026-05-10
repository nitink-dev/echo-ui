import { useSelector } from "react-redux";
import {
  canReadWithScopes,
  canWriteWithScopes,
  canDeleteWithScopes,
} from "../config/roleConfig";
import { SecurityConfigEntry } from "../api/services/authService";

export function usePermissions() {
  const userScopes     = useSelector((state: any) => state.auth.scopes)              as string[];
  const securityConfig = useSelector((state: any) => state.auth.securityConfig)       as SecurityConfigEntry[];
  const configLoaded   = useSelector((state: any) => state.auth.securityConfigLoaded) as boolean;

  console.group("[usePermissions] Hook evaluated");
  console.log("configLoaded :", configLoaded);
  console.log("userScopes   :", userScopes);
  console.log("securityConfig entries:", securityConfig?.length ?? 0);
  console.groupEnd();

  return {
    userScopes,
    securityConfig,
    configLoaded,

    canRead: (pageId: string): boolean => {
      console.group(`[usePermissions.canRead] called for "${pageId}"`);
      const result = canReadWithScopes(pageId, userScopes, securityConfig, configLoaded);
      console.log(`→ final result: ${result ? "✓ ALLOW" : "✗ DENY"}`);
      console.groupEnd();
      return result;
    },

    canWrite: (pageId: string): boolean => {
      console.group(`[usePermissions.canWrite] called for "${pageId}"`);
      const result = canWriteWithScopes(pageId, userScopes, securityConfig, configLoaded);
      console.log(`→ final result: ${result ? "✓ ALLOW" : "✗ DENY"}`);
      console.groupEnd();
      return result;
    },

    canDelete: (pageId: string): boolean => {
      console.group(`[usePermissions.canDelete] called for "${pageId}"`);
      const result = canDeleteWithScopes(pageId, userScopes, securityConfig, configLoaded);
      console.log(`→ final result: ${result ? "✓ ALLOW" : "✗ DENY"}`);
      console.groupEnd();
      return result;
    },

    hasScope: (scope: string): boolean => {
      const result = userScopes.includes(scope);
      console.log(`[usePermissions.hasScope] "${scope}" → ${result ? "✓ found" : "✗ not found"}`);
      return result;
    },

    hasAllScopes: (scopes: string[]): boolean => {
      const missing = scopes.filter((s) => !userScopes.includes(s));
      const result = missing.length === 0;
      if (!result) {
        console.warn(`[usePermissions.hasAllScopes] Missing scopes: [${missing.join(", ")}]`);
      } else {
        console.log(`[usePermissions.hasAllScopes] ✓ All scopes present: [${scopes.join(", ")}]`);
      }
      return result;
    },
  };
}