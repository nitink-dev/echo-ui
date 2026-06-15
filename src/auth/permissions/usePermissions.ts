import { useContext } from "react";
import { PermissionContext } from "./permission-context";

export function usePermissions() {
  const engine = useContext(PermissionContext);

  if (!engine) {
    console.error(
      "[usePermissions] PermissionContext is null — engine not available. " +
      "Make sure this component is wrapped in <PermissionProvider>. " +
      "All permission checks will return false."
    );

    return {
      configLoaded: false,
      canGet: (api?: string) => { console.warn(`[usePermissions] canGet("${api}") → false (no engine)`); return false; },
      canPost: (api?: string) => { console.warn(`[usePermissions] canPost("${api}") → false (no engine)`); return false; },
      canPut: (api?: string) => { console.warn(`[usePermissions] canPut("${api}") → false (no engine)`); return false; },
      canPatch: (api?: string) => { console.warn(`[usePermissions] canPatch("${api}") → false (no engine)`); return false; },
      canDelete: (api?: string) => { console.warn(`[usePermissions] canDelete("${api}") → false (no engine)`); return false; },
      canUpdate: (api?: string) => { console.warn(`[usePermissions] canUpdate("${api}") → false (no engine)`); return false; },
      canAccess: (api?: string, method?: string) => { console.warn(`[usePermissions] canAccess("${api}", "${method}") → false (no engine)`); return false; },
    };
  }

  console.log("[usePermissions] Engine available — configLoaded: true");

  return {
    configLoaded: true,

    canGet: (api: string) => {
      console.log(`[usePermissions] canGet("${api}")`);
      const result = engine.canCall(api, "GET");
      console.log(`[usePermissions] canGet("${api}") → ${result}`);
      return result;
    },
    canPost: (api: string) => {
      console.log(`[usePermissions] canPost("${api}")`);
      const result = engine.canCall(api, "POST");
      console.log(`[usePermissions] canPost("${api}") → ${result}`);
      return result;
    },
    canPut: (api: string) => {
      console.log(`[usePermissions] canPut("${api}")`);
      const result = engine.canCall(api, "PUT");
      console.log(`[usePermissions] canPut("${api}") → ${result}`);
      return result;
    },
    canPatch: (api: string) => {
      console.log(`[usePermissions] canPatch("${api}")`);
      const result = engine.canCall(api, "PATCH");
      console.log(`[usePermissions] canPatch("${api}") → ${result}`);
      return result;
    },
    canDelete: (api: string) => {
      console.log(`[usePermissions] canDelete("${api}")`);
      const result = engine.canCall(api, "DELETE");
      console.log(`[usePermissions] canDelete("${api}") → ${result}`);
      return result;
    },
    canUpdate: (api: string) => {
      console.log(`[usePermissions] canUpdate("${api}") — will check PUT then PATCH`);
      const putResult = engine.canCall(api, "PUT");
      console.log(`[usePermissions] canUpdate("${api}") PUT → ${putResult}`);
      const patchResult = engine.canCall(api, "PATCH");
      console.log(`[usePermissions] canUpdate("${api}") PATCH → ${patchResult}`);
      const result = putResult || patchResult;
      console.log(`[usePermissions] canUpdate("${api}") final → ${result}`);
      return result;
    },
    canAccess: (api: string, method: string) => {
      console.log(`[usePermissions] canAccess("${api}", "${method}")`);
      const m = method.toUpperCase();
      let result = false;
      if (m === "GET")    result = engine.canCall(api, "GET");
      else if (m === "POST")   result = engine.canCall(api, "POST");
      else if (m === "PUT")    result = engine.canCall(api, "PUT");
      else if (m === "PATCH")  result = engine.canCall(api, "PATCH");
      else if (m === "DELETE") result = engine.canCall(api, "DELETE");
      else if (m === "UPDATE") result = engine.canCall(api, "PUT") || engine.canCall(api, "PATCH");
      console.log(`[usePermissions] canAccess("${api}", "${method}") → ${result}`);
      return result;
    },
  };
}