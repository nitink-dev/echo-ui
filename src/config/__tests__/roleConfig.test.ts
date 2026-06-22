import { describe, it, expect } from 'vitest';
import {
  canReadWithScopes,
  canWriteWithScopes,
  canDeleteWithScopes
} from '../roleConfig';
import { SecurityConfigEntry } from '../../api/services/authService';
import { PermissionEngine } from '../../auth/permissions/permission-engine';
import { renderHook } from '@testing-library/react';
import React from 'react';
import { PermissionContext } from '../../auth/permissions/permission-context';
import { usePermissions } from '../../auth/permissions/usePermissions';
import { API_URLS } from '../../auth/permissions/apiConfig';

describe('roleConfig.ts', () => {
  const mockSecurityConfig: SecurityConfigEntry[] = [
    {
      api: '/api/scanners',
      methods: ['GET'],
      requiredScopes: ['platform.read'],
      isPublic: false
    },
    {
      api: '/api/scanners',
      methods: ['POST'],
      requiredScopes: ['platform.write'],
      isPublic: false
    },
    {
      api: '/api/scanners/**',
      methods: ['DELETE'],
      requiredScopes: ['platform.delete'],
      isPublic: false
    },
    {
      api: '/api/slides',
      methods: ['GET'],
      requiredScopes: [],
      isPublic: true
    },
    {
      api: '/api/health/status/**',
      methods: ['GET'],
      requiredScopes: ['health.read'],
      isPublic: false
    }
  ];

  describe('canReadWithScopes', () => {
    it('should return false when configLoaded is false', () => {
      const result = canReadWithScopes('list', ['platform.read'], mockSecurityConfig, false);
      expect(result).toBe(false);
    });

    it('should return false when securityConfig is empty', () => {
      const result = canReadWithScopes('list', ['platform.read'], [], true);
      expect(result).toBe(false);
    });

    it('should return false when securityConfig is null', () => {
      const result = canReadWithScopes('list', ['platform.read'], null as any, true);
      expect(result).toBe(false);
    });

    it('should return false when pageId is not in PAGE_API_MAP', () => {
      const result = canReadWithScopes('unknown-page', ['platform.read'], mockSecurityConfig, true);
      expect(result).toBe(false);
    });

    it('should return true when user has required read scopes', () => {
      const result = canReadWithScopes('list', ['platform.read'], mockSecurityConfig, true);
      expect(result).toBe(true);
    });

    it('should return true when user has platform.read scope', () => {
      const result = canReadWithScopes('list', ['platform.read', 'other.scope'], mockSecurityConfig, true);
      expect(result).toBe(true);
    });

    it('should return false when user lacks required read scopes', () => {
      const result = canReadWithScopes('list', ['other.scope'], mockSecurityConfig, true);
      expect(result).toBe(false);
    });

    it('should allow access to public APIs without scopes', () => {
      const result = canReadWithScopes('qa-analysis', [], mockSecurityConfig, true);
      expect(result).toBe(true);
    });

    it('should handle multiple user scopes', () => {
      const result = canReadWithScopes('list', ['admin', 'platform.read', 'user'], mockSecurityConfig, true);
      expect(result).toBe(true);
    });

    it('should check exact pageId match', () => {
      const result = canReadWithScopes('list', ['platform.read'], mockSecurityConfig, true);
      expect(result).toBe(true);
    });

    it('should handle pages without read permission', () => {
      const config: SecurityConfigEntry[] = [
        {
          api: '/api/test',
          methods: ['POST'],
          requiredScopes: ['write'],
          isPublic: false
        }

      ];

      const result = canReadWithScopes('list', ['platform.read'], config, true);
      expect(result).toBe(true); // No restriction means accessible
    });
  });

  describe('canWriteWithScopes', () => {
    it('should return false when configLoaded is false', () => {
      const result = canWriteWithScopes('list', ['platform.write'], mockSecurityConfig, false);
      expect(result).toBe(false);
    });

    it('should return false when securityConfig is empty', () => {
      const result = canWriteWithScopes('list', ['platform.write'], [], true);
      expect(result).toBe(false);
    });

    it('should return false when page has no write permission', () => {
      const result = canWriteWithScopes('view', ['platform.write'], mockSecurityConfig, true);
      expect(result).toBe(false);
    });

    it('should return true when user has required write scopes', () => {
      const result = canWriteWithScopes('list', ['platform.write'], mockSecurityConfig, true);
      expect(result).toBe(true);
    });

    it('should return true when user has platform.write scope', () => {
      const result = canWriteWithScopes('list', ['platform.write', 'other.scope'], mockSecurityConfig, true);
      expect(result).toBe(true);
    });

    it('should return false when user lacks required write scopes', () => {
      const result = canWriteWithScopes('list', ['other.scope'], mockSecurityConfig, true);
      expect(result).toBe(false);
    });

    it('should handle pages with platform-level write permissions', () => {
      const result = canWriteWithScopes('add', ['platform.write'], mockSecurityConfig, true);
      expect(result).toBe(true);
    });

    it('should handle multiple user scopes for write', () => {
      const result = canWriteWithScopes('list', ['admin', 'platform.write', 'user'], mockSecurityConfig, true);
      expect(result).toBe(true);
    });

    it('should return false when write mapping is missing', () => {
      const config: SecurityConfigEntry[] = [
        {
          api: '/api/test',
          methods: ['GET'],
          requiredScopes: ['read'],
          isPublic: false
        }
      ];
      const result = canWriteWithScopes('view', ['read'], config, true);
      expect(result).toBe(false);
    });
  });

  describe('canDeleteWithScopes', () => {
    it('should return false when configLoaded is false', () => {
      const result = canDeleteWithScopes('list', ['platform.delete'], mockSecurityConfig, false);
      expect(result).toBe(false);
    });

    it('should return false when securityConfig is empty', () => {
      const result = canDeleteWithScopes('list', ['platform.delete'], [], true);
      expect(result).toBe(false);
    });

    it('should return false when page has no delete permission', () => {
      const result = canDeleteWithScopes('add', ['platform.delete'], mockSecurityConfig, true);
      expect(result).toBe(false);
    });

    it('should return true when user has required delete scopes', () => {
      const result = canDeleteWithScopes('list', ['platform.delete'], mockSecurityConfig, true);
      expect(result).toBe(true);
    });

    it('should return true when user has platform.delete scope', () => {
      const result = canDeleteWithScopes('list', ['platform.delete', 'other.scope'], mockSecurityConfig, true);
      expect(result).toBe(true);
    });

    it('should return false when user lacks required delete scopes', () => {
      const result = canDeleteWithScopes('list', ['other.scope'], mockSecurityConfig, true);
      expect(result).toBe(false);
    });

    it('should handle pages with multiple delete operations', () => {
      const result = canDeleteWithScopes('edit', ['platform.delete'], mockSecurityConfig, true);
      expect(result).toBe(true);
    });

    it('should handle multiple user scopes for delete', () => {
      const result = canDeleteWithScopes('list', ['admin', 'platform.delete', 'user'], mockSecurityConfig, true);
      expect(result).toBe(true);
    });

    it('should return false when delete mapping is missing', () => {
      const config: SecurityConfigEntry[] = [
        {
          api: '/api/test',
          methods: ['GET'],
          requiredScopes: ['read'],
          isPublic: false
        }
      ];
      const result = canDeleteWithScopes('view', ['delete'], config, true);
      expect(result).toBe(false);
    });

    it('should allow users with platform.delete for any deletable resource', () => {
      const result = canDeleteWithScopes('qa-analysis', ['platform.delete'], mockSecurityConfig, true);
      expect(result).toBe(true);
    });
  });

  describe('feature-specific scopes', () => {
    const configWithPatch: SecurityConfigEntry[] = [
      ...mockSecurityConfig,
      {
        api: '/api/config/**',
        methods: ['PATCH'],
        requiredScopes: [],
        isPublic: false,
      },
      {
        api: '/api/slides/**',
        methods: ['PATCH', 'DELETE'],
        requiredScopes: [],
        isPublic: false,
      },
      {
        api: '/api/enrichment/tools/**',
        methods: ['PATCH'],
        requiredScopes: [],
        isPublic: false,
      },
    ];

    it('should allow lis write with platform.update or config scopes', () => {
      expect(
        canWriteWithScopes('lis', [], configWithPatch, true)
      ).toBe(false);
      expect(
        canWriteWithScopes('lis', ['platform.update'], configWithPatch, true)
      ).toBe(true);
      expect(
        canWriteWithScopes(
          'lis',
          ['config.update', 'config.path-qa-store.update'],
          configWithPatch,
          true
        )
      ).toBe(true);
    });

    it('should require config.update for synapse write', () => {
      expect(
        canWriteWithScopes('synapse', ['platform.update', 'config.update'], configWithPatch, true)
      ).toBe(true);
    });

    it('should require qa-slide scopes for qa-analysis write and delete', () => {
      expect(
        canWriteWithScopes('qa-analysis', ['platform.update', 'qa-slide.update'], configWithPatch, true)
      ).toBe(true);
      expect(
        canDeleteWithScopes('qa-analysis', ['platform.delete', 'qa-slide.delete'], configWithPatch, true)
      ).toBe(true);
    });

    it('should require enrichment.tools.update for enrichment-tool write', () => {
      expect(
        canWriteWithScopes(
          'enrichment-tool',
          ['platform.update', 'enrichment.tools.update'],
          configWithPatch,
          true
        )
      ).toBe(true);
    });

    it('should allow read on health-status with health.read scope', () => {
      expect(
        canReadWithScopes('health-status', ['health.read'], mockSecurityConfig, true)
      ).toBe(true);
    });
  });

  describe('access control combinations', () => {
    it('should handle read-only pages', () => {
      const result = {
        read: canReadWithScopes('view', ['platform.read'], mockSecurityConfig, true),
        write: canWriteWithScopes('view', ['platform.write'], mockSecurityConfig, true),
        delete: canDeleteWithScopes('view', ['platform.delete'], mockSecurityConfig, true)
      };
      expect(result.read).toBe(true);
      expect(result.write).toBe(false);
      expect(result.delete).toBe(false);
    });

    it('should handle read-write pages', () => {
      const result = {
        read: canReadWithScopes('add', ['platform.read'], mockSecurityConfig, true),
        write: canWriteWithScopes('add', ['platform.write'], mockSecurityConfig, true),
        delete: canDeleteWithScopes('add', ['platform.delete'], mockSecurityConfig, true)
      };
      expect(result.read).toBe(true);
      expect(result.write).toBe(true);
      expect(result.delete).toBe(false);
    });

    it('should handle full-access pages', () => {
      const editScopes = [
        'platform.read',
        'platform.update',
        'scanner.update',
        'platform.delete',
      ];
      const result = {
        read: canReadWithScopes('edit', editScopes, mockSecurityConfig, true),
        write: canWriteWithScopes('edit', editScopes, mockSecurityConfig, true),
        delete: canDeleteWithScopes('edit', editScopes, mockSecurityConfig, true)
      };
      expect(result.read).toBe(true);
      expect(result.write).toBe(true);
      expect(result.delete).toBe(true);
    });

    it('should respect platform-level scopes across operations', () => {
      const platformScopes = ['platform.read', 'platform.write', 'platform.delete'];
      const result = {
        read: canReadWithScopes('list', platformScopes, mockSecurityConfig, true),
        write: canWriteWithScopes('list', platformScopes, mockSecurityConfig, true),
        delete: canDeleteWithScopes('list', platformScopes, mockSecurityConfig, true)
      };
      expect(result.read).toBe(true);
      expect(result.write).toBe(true);
      expect(result.delete).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle empty user scopes array', () => {
      const result = {
        read: canReadWithScopes('list', [], mockSecurityConfig, true),
        write: canWriteWithScopes('list', [], mockSecurityConfig, true),
        delete: canDeleteWithScopes('list', [], mockSecurityConfig, true)
      };
      expect(result.read).toBe(false);
      expect(result.write).toBe(false);
      expect(result.delete).toBe(false);
    });

    it('should handle case-sensitive scope matching', () => {
      const result = canReadWithScopes('list', ['PLATFORM.READ'], mockSecurityConfig, true);
      expect(result).toBe(false);
    });

    it('should handle undefined pageId gracefully', () => {
      const result = canReadWithScopes(undefined as any, ['platform.read'], mockSecurityConfig, true);
      expect(result).toBe(false);
    });

    it('should handle special characters in pageId', () => {
      const result = canReadWithScopes('unknown-page-!@#', ['platform.read'], mockSecurityConfig, true);
      expect(result).toBe(false);
    });

    it('should allow bypass with proper platform scopes', () => {
      const adminScopes = [
        'platform.read',
        'platform.update',
        'scanner.update',
        'platform.delete',
        'admin',
      ];
      const result = {
        read: canReadWithScopes('edit', adminScopes, mockSecurityConfig, true),
        write: canWriteWithScopes('edit', adminScopes, mockSecurityConfig, true),
        delete: canDeleteWithScopes('edit', adminScopes, mockSecurityConfig, true)
      };
      expect(result.read).toBe(true);
      expect(result.write).toBe(true);
      expect(result.delete).toBe(true);
    });
  });
});

describe('PermissionEngine', () => {
  const securityConfig: SecurityConfigEntry[] = [
    {
      api: '/api/scanners',
      methods: ['GET'],
      requiredScopes: ['platform.read'],
      isPublic: false,
    },
    {
      api: '/api/scanners/**',
      methods: ['PATCH'],
      requiredScopes: ['scanner.update'],
      isPublic: false,
    },
    {
      api: '/api/slides',
      methods: ['GET'],
      requiredScopes: [],
      isPublic: true,
    },
  ];

  it('should allow access when user has required scope', () => {
    const engine = new PermissionEngine(securityConfig, ['platform.read']);
    expect(engine.canCall('/api/scanners', 'GET')).toBe(true);
  });

  it('should deny access when user lacks required scope', () => {
    const engine = new PermissionEngine(securityConfig, []);
    expect(engine.canCall('/api/scanners', 'GET')).toBe(false);
  });

  it('should allow public API access without scopes', () => {
    const engine = new PermissionEngine(securityConfig, []);
    expect(engine.canCall('/api/slides', 'GET')).toBe(true);
  });

  it('should match wildcard API paths', () => {
    const engine = new PermissionEngine(securityConfig, ['scanner.update']);
    expect(engine.canCall('/api/scanners/SN-123', 'PATCH')).toBe(true);
  });

  it('should return false for unmatched API', () => {
    const engine = new PermissionEngine(securityConfig, ['platform.read']);
    expect(engine.canCall('/api/unknown', 'GET')).toBe(false);
  });
});

describe('usePermissions hook', () => {
  const securityConfig: SecurityConfigEntry[] = [
    {
      api: '/api/scanners',
      methods: ['GET', 'POST'],
      requiredScopes: ['platform.read'],
      isPublic: false,
    },
  ];

  const wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(
      PermissionContext.Provider,
      { value: new PermissionEngine(securityConfig, ['platform.read']) },
      children
    );

  it('should expose canAccess for API definitions', () => {
    const { result } = renderHook(() => usePermissions(), { wrapper });
    expect(result.current.configLoaded).toBe(true);
    expect(result.current.canGet('/api/scanners')).toBe(true);
    expect(result.current.canAccess(API_URLS.scanners.base, 'GET')).toBe(true);
  });

  it('should return false helpers when context is missing', () => {
    const { result } = renderHook(() => usePermissions());
    expect(result.current.configLoaded).toBe(false);
    expect(result.current.canAccess('/api/scanners', 'GET')).toBe(false);
  });
});
