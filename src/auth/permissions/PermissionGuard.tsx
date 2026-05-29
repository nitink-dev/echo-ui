import { ReactNode } from "react";

interface Props {
  allowed: boolean;
  fallback?: ReactNode;
  children: ReactNode;
}

export function PermissionGuard({ allowed, fallback = null, children }: Props) {
  return allowed ? <>{children}</> : <>{fallback}</>;
}