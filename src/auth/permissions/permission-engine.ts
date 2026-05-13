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
  ) {}

  canCall(api: string, method: string): boolean {
    const matched = this.find(api, method);

    if (!matched) {
      return false;
    }

    if (matched.isPublic) {
      return true;
    }

    return matched.requiredScopes.some(scope =>
      this.userScopes.includes(scope)
    );
  }

  private find(
    api: string,
    method: string
  ): SecurityConfigEntry | undefined {
    return this.apiConfig.find(cfg => {
      return (
        cfg.methods.includes(method.toUpperCase()) &&
        this.matches(cfg.api, api)
      );
    });
  }

  private matches(
    configApi: string,
    actualApi: string
  ): boolean {
    if (configApi.endsWith("/**")) {
      const prefix = configApi.slice(0, -3);

      return actualApi.startsWith(prefix);
    }

    return configApi === actualApi;
  }
}