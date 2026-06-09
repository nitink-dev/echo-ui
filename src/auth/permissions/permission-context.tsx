import {
  createContext,
  useMemo,
  type ReactNode,
} from "react";

import {
  PermissionEngine,
  SecurityConfigEntry,
} from "./permission-engine";

export const PermissionContext =
  createContext<PermissionEngine | null>(null);

interface Props {
  securityConfig: SecurityConfigEntry[];
  scopes: string[];
  children: ReactNode;
}

export function PermissionProvider({
  securityConfig,
  scopes,
  children,
}: Props) {
  console.log("[PermissionProvider] Rendering", {
    scopes,
    totalConfigs: securityConfig.length,
    securityConfig,
  });

  const engine = useMemo(() => {
    console.log("[PermissionProvider] useMemo — (re)creating PermissionEngine", {
      reason: "securityConfig or scopes changed",
      scopes,
      totalConfigs: securityConfig.length,
    });

    const instance = new PermissionEngine(securityConfig, scopes);

    console.log("[PermissionProvider] useMemo — PermissionEngine instance created", instance);

    return instance;
  }, [securityConfig, scopes]);

  return (
    <PermissionContext.Provider value={engine}>
      {children}
    </PermissionContext.Provider>
  );
}