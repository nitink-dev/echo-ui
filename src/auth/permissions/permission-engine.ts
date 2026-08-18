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
    
  }

  canCall(api: string, method: string): boolean {

    const matched = this.find(api, method);

    if (!matched) {     
      return false;
    }

    
    if (matched.isPublic) {
      return true;
    }

    const hasScope = matched.requiredScopes.some(scope => {
      const has = this.userScopes.includes(scope);
      return has;
    });

    return hasScope;
  }

  private find(
    api: string,
    method: string
  ): SecurityConfigEntry | undefined {

    const result = this.apiConfig.find(cfg => {
      const methodMatch = cfg.methods.includes(method.toUpperCase());
      const apiMatch = this.matches(cfg.api, api);
      return methodMatch && apiMatch;
    });
    return result;
  }

  private matches(
    configApi: string,
    actualApi: string
  ): boolean {
    if (configApi.endsWith("/**")) {
      const prefix = configApi.slice(0, -3);
      const isMatch = actualApi.startsWith(prefix);

      return isMatch;
    }

    const isMatch = configApi === actualApi;
    return isMatch;
  }
}