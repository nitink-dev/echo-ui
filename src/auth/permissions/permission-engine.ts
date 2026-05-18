export interface SecurityConfigEntry {
  api: string;
  methods: string[];
  isPublic: boolean;
  requiredScopes: string[];
}

export class PermissionEngine {
  constructor(
    private readonly apiConfig: SecurityConfigEntry[],
    private readonly userScopes: string[]
  ) {
    console.log("[PermissionEngine] Initialized", {
      totalConfigs: apiConfig.length,
      userScopes,
      configs: apiConfig,
    });
  }

  canCall(api: string, method: string): boolean {
    console.log(`[PermissionEngine.canCall] Checking → api="${api}" method="${method}"`);

    const matched = this.find(api, method);

    if (!matched) {
      console.warn(`[PermissionEngine.canCall] ✗ No matching config found for api="${api}" method="${method}" — DENIED`);
      return false;
    }

    console.log(`[PermissionEngine.canCall] Matched config:`, matched);

    if (matched.isPublic) {
      console.log(`[PermissionEngine.canCall] ✓ Config is public — ALLOWED (api="${api}" method="${method}")`);
      return true;
    }

    console.log(`[PermissionEngine.canCall] Config is NOT public. Checking scopes...`, {
      requiredScopes: matched.requiredScopes,
      userScopes: this.userScopes,
    });

    const hasScope = matched.requiredScopes.some(scope => {
      const has = this.userScopes.includes(scope);
      console.log(`[PermissionEngine.canCall] Scope check — required="${scope}" userHasIt=${has}`);
      return has;
    });

    if (hasScope) {
      console.log(`[PermissionEngine.canCall] ✓ Scope match found — ALLOWED (api="${api}" method="${method}")`);
    } else {
      console.warn(`[PermissionEngine.canCall] ✗ No matching scope — DENIED (api="${api}" method="${method}")`, {
        requiredScopes: matched.requiredScopes,
        userScopes: this.userScopes,
      });
    }

    return hasScope;
  }

  private find(
    api: string,
    method: string
  ): SecurityConfigEntry | undefined {
    console.log(`[PermissionEngine.find] Searching ${this.apiConfig.length} config(s) for api="${api}" method="${method}"`);

    const result = this.apiConfig.find(cfg => {
      const methodMatch = cfg.methods.includes(method.toUpperCase());
      const apiMatch = this.matches(cfg.api, api);

      console.log(`[PermissionEngine.find] Testing config:`, {
        configApi: cfg.api,
        configMethods: cfg.methods,
        methodMatch,
        apiMatch,
      });

      return methodMatch && apiMatch;
    });

    if (result) {
      console.log(`[PermissionEngine.find] Found match:`, result);
    } else {
      console.warn(`[PermissionEngine.find] No match found for api="${api}" method="${method}"`);
    }

    return result;
  }

  private matches(
    configApi: string,
    actualApi: string
  ): boolean {
    if (configApi.endsWith("/**")) {
      const prefix = configApi.slice(0, -3);
      const isMatch = actualApi.startsWith(prefix);

      console.log(`[PermissionEngine.matches] Wildcard match — configApi="${configApi}" prefix="${prefix}" actualApi="${actualApi}" → ${isMatch}`);

      return isMatch;
    }

    const isMatch = configApi === actualApi;
    console.log(`[PermissionEngine.matches] Exact match — configApi="${configApi}" actualApi="${actualApi}" → ${isMatch}`);

    return isMatch;
  }
}