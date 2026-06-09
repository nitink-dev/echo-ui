// import { useSelector } from "react-redux";
// import {
//   canReadWithScopes,
//   canWriteWithScopes,
//   canDeleteWithScopes,
// } from "../config/roleConfig";
// import { SecurityConfigEntry } from "../api/services/authService";

// export function usePermissions() {
//   const userScopes     = useSelector((state: any) => state.auth.scopes)               as string[];
//   const securityConfig = useSelector((state: any) => state.auth.securityConfig)        as SecurityConfigEntry[];
//   const configLoaded   = useSelector((state: any) => state.auth.securityConfigLoaded)  as boolean;

//   return {
//     userScopes,
//     securityConfig,
//     configLoaded,

//     canRead: (pageId: string): boolean =>
//       canReadWithScopes(pageId, userScopes, securityConfig, configLoaded),

//     canWrite: (pageId: string): boolean =>
//       canWriteWithScopes(pageId, userScopes, securityConfig, configLoaded),

//     canDelete: (pageId: string): boolean =>
//       canDeleteWithScopes(pageId, userScopes, securityConfig, configLoaded),

//     hasScope: (scope: string): boolean =>
//       userScopes.includes(scope),

//     hasAllScopes: (scopes: string[]): boolean =>
//       scopes.every((s) => userScopes.includes(s)),
//   };
// }
