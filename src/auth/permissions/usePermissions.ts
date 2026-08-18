import { useContext } from "react";
import { PermissionContext } from "./permission-context";
import { ApiDef, DynamicApiDef } from "./apiConfig";

type ApiInput = ApiDef | DynamicApiDef<any> | string;

function resolvePath(api: ApiInput, params?: any): string {
  if (typeof api === "string") return api;
  if ("path" in api) return api.path;
  if ("build" in api) return api.build(params ?? {});
  return "";
}

function resolveMethod(api: ApiInput): string | undefined {
  if (typeof api === "string") return undefined;
  return api.method;
}

export function usePermissions() {
  const engine = useContext(PermissionContext);

  if (!engine) {
    return {
      configLoaded: false,
      canGet: (_api?: string) => false,
      canPost: (_api?: string) => false,
      canPut: (_api?: string) => false,
      canPatch: (_api?: string) => false,
      canDelete: (_api?: string) => false,
      canUpdate: (_api?: string) => false,
      canAccess: (_api?: ApiInput, _method?: string, _params?: any) => false,
    };
  }

  return {
    configLoaded: true,

    canGet: (api: string) => engine.canCall(api, "GET"),
    canPost: (api: string) => engine.canCall(api, "POST"),
    canPut: (api: string) => engine.canCall(api, "PUT"),
    canPatch: (api: string) => engine.canCall(api, "PATCH"),
    canDelete: (api: string) => engine.canCall(api, "DELETE"),
    canUpdate: (api: string) =>
      engine.canCall(api, "PUT") || engine.canCall(api, "PATCH"),
    
    canAccess: (api: ApiInput, methodOrParams?: string | any, params?: any) => {
      const isMethodString = typeof methodOrParams === "string";
      const resolvedParams = isMethodString ? params : methodOrParams;
      const resolvedPath = resolvePath(api, resolvedParams);
      const resolvedMethod = isMethodString
        ? methodOrParams
        : (resolveMethod(api) ?? "GET");
      const m = resolvedMethod.toUpperCase();
      if (m === "GET")         return engine.canCall(resolvedPath, "GET");
      if (m === "POST")        return engine.canCall(resolvedPath, "POST");
      if (m === "PUT")         return engine.canCall(resolvedPath, "PUT");
      if (m === "PATCH")       return engine.canCall(resolvedPath, "PATCH");
      if (m === "DELETE")      return engine.canCall(resolvedPath, "DELETE");
      if (m === "UPDATE")      return engine.canCall(resolvedPath, "PUT") || engine.canCall(resolvedPath, "PATCH");
      return false;
    },
  };
}