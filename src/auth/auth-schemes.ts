/**
 * Authentication schemes supported by ADK
 */

export enum AuthScheme {
  /** Bearer token authentication */
  BEARER = 'bearer',
  /** API key authentication */
  API_KEY = 'api_key',
  /** Basic authentication */
  BASIC = 'basic',
  /** OAuth2 authentication */
  OAUTH2 = 'oauth2',
  /** Custom authentication */
  CUSTOM = 'custom',
  /** No authentication */
  NONE = 'none'
}

export interface AuthSchemeConfig {
  scheme: AuthScheme;
  headerName?: string;
  headerPrefix?: string;
  queryParam?: string;
  customHandler?: (token: string) => Record<string, string>;
}

/**
 * Predefined authentication scheme configurations
 */
export const AuthSchemeConfigs: Record<AuthScheme, AuthSchemeConfig> = {
  [AuthScheme.BEARER]: {
    scheme: AuthScheme.BEARER,
    headerName: 'Authorization',
    headerPrefix: 'Bearer '
  },
  [AuthScheme.API_KEY]: {
    scheme: AuthScheme.API_KEY,
    headerName: 'X-API-Key'
  },
  [AuthScheme.BASIC]: {
    scheme: AuthScheme.BASIC,
    headerName: 'Authorization',
    headerPrefix: 'Basic '
  },
  [AuthScheme.OAUTH2]: {
    scheme: AuthScheme.OAUTH2,
    headerName: 'Authorization',
    headerPrefix: 'Bearer '
  },
  [AuthScheme.CUSTOM]: {
    scheme: AuthScheme.CUSTOM
  },
  [AuthScheme.NONE]: {
    scheme: AuthScheme.NONE
  }
};

/**
 * Utility class for working with authentication schemes
 */
export class AuthSchemeUtils {
  /**
   * Get configuration for an authentication scheme
   */
  static getConfig(scheme: AuthScheme): AuthSchemeConfig {
    return AuthSchemeConfigs[scheme];
  }

  /**
   * Generate authentication headers for a scheme and token
   */
  static generateHeaders(
    scheme: AuthScheme,
    token: string,
    customConfig?: Partial<AuthSchemeConfig>
  ): Record<string, string> {
    const config = { ...this.getConfig(scheme), ...customConfig };

    if (config.customHandler) {
      return config.customHandler(token);
    }

    if (config.headerName) {
      const headerValue = config.headerPrefix ? `${config.headerPrefix}${token}` : token;
      return { [config.headerName]: headerValue };
    }

    if (config.queryParam) {
      // For query parameter auth, return empty headers
      // The query param should be handled separately
      return {};
    }

    return {};
  }

  /**
   * Generate query parameters for authentication
   */
  static generateQueryParams(
    scheme: AuthScheme,
    token: string,
    customConfig?: Partial<AuthSchemeConfig>
  ): Record<string, string> {
    const config = { ...this.getConfig(scheme), ...customConfig };

    if (config.queryParam) {
      return { [config.queryParam]: token };
    }

    return {};
  }

  /**
   * Check if a scheme requires a token
   */
  static requiresToken(scheme: AuthScheme): boolean {
    return scheme !== AuthScheme.NONE;
  }

  /**
   * Check if a scheme supports token refresh
   */
  static supportsRefresh(scheme: AuthScheme): boolean {
    return scheme === AuthScheme.OAUTH2;
  }

  /**
   * Get all available authentication schemes
   */
  static getAllSchemes(): AuthScheme[] {
    return Object.values(AuthScheme);
  }

  /**
   * Validate if a string is a valid authentication scheme
   */
  static isValidScheme(scheme: string): scheme is AuthScheme {
    return Object.values(AuthScheme).includes(scheme as AuthScheme);
  }

  /**
   * Parse authentication scheme from string
   */
  static parseScheme(scheme: string): AuthScheme {
    const normalizedScheme = scheme.toLowerCase();
    
    if (this.isValidScheme(normalizedScheme)) {
      return normalizedScheme;
    }

    // Try to match common variations
    switch (normalizedScheme) {
      case 'token':
      case 'bearer_token':
        return AuthScheme.BEARER;
      case 'key':
      case 'apikey':
      case 'api-key':
        return AuthScheme.API_KEY;
      case 'basic_auth':
      case 'basicauth':
        return AuthScheme.BASIC;
      case 'oauth':
      case 'oauth_2':
      case 'oauth-2':
        return AuthScheme.OAUTH2;
      default:
        return AuthScheme.CUSTOM;
    }
  }
}