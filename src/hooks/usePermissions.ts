// src/hooks/usePermissions.ts
import { useSelector } from "react-redux";
import { canRead, canWrite, getPermission, Role } from "../config/roleConfig";

export function usePermissions() {
  const role = useSelector((state: any) => state.auth.role) as Role | null;

  return {
    role,
    canRead:  (pageId: string) => canRead(pageId, role),
    canWrite: (pageId: string) => canWrite(pageId, role),
    getPermission: (pageId: string) => getPermission(pageId, role),
  };
}