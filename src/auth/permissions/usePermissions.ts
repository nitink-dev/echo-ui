import { useContext } from "react";

import { PermissionContext } from "./permission-context";

export function usePermissions() {
  const engine = useContext(PermissionContext);

  if (!engine) {
    return {
      configLoaded: false,

      canGet: () => false,
      canPost: () => false,
      canPut: () => false,
      canPatch: () => false,
      canDelete: () => false,

      canUpdate: () => false,
    };
  }

  return {
    configLoaded: true,

    canGet: (api: string) =>
      engine.canCall(api, "GET"),

    canPost: (api: string) =>
      engine.canCall(api, "POST"),

    canPut: (api: string) =>
      engine.canCall(api, "PUT"),

    canPatch: (api: string) =>
      engine.canCall(api, "PATCH"),

    canDelete: (api: string) =>
      engine.canCall(api, "DELETE"),

    canUpdate: (api: string) =>
      engine.canCall(api, "PUT") ||
      engine.canCall(api, "PATCH"),
  };
}