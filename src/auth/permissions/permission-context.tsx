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
  const engine = useMemo(() => {
    const instance = new PermissionEngine(securityConfig, scopes);
    return instance;
  }, [securityConfig, scopes]);

  return (
    <PermissionContext.Provider value={engine}>
      {children}
    </PermissionContext.Provider>
  );
}