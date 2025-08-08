/**
 * Authentication schemes supported by ADK
 */
export declare enum AuthScheme {
    /** Bearer token authentication */
    BEARER = "bearer",
    /** API key authentication */
    API_KEY = "api_key",
    /** Basic authentication */
    BASIC = "basic",
    /** OAuth2 authentication */
    OAUTH2 = "oauth2",
    /** Custom authentication */
    CUSTOM = "custom",
    /** No authentication */
    NONE = "none"
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
export declare const AuthSchemeConfigs: Record<AuthScheme, AuthSchemeConfig>;
/**
 * Utility class for working with authentication schemes
 */
export declare class AuthSchemeUtils {
    /**
     * Get configuration for an authentication scheme
     */
    static getConfig(scheme: AuthScheme): AuthSchemeConfig;
    /**
     * Generate authentication headers for a scheme and token
     */
    static generateHeaders(scheme: AuthScheme, token: string, customConfig?: Partial<AuthSchemeConfig>): Record<string, string>;
    /**
     * Generate query parameters for authentication
     */
    static generateQueryParams(scheme: AuthScheme, token: string, customConfig?: Partial<AuthSchemeConfig>): Record<string, string>;
    /**
     * Check if a scheme requires a token
     */
    static requiresToken(scheme: AuthScheme): boolean;
    /**
     * Check if a scheme supports token refresh
     */
    static supportsRefresh(scheme: AuthScheme): boolean;
    /**
     * Get all available authentication schemes
     */
    static getAllSchemes(): AuthScheme[];
    /**
     * Validate if a string is a valid authentication scheme
     */
    static isValidScheme(scheme: string): scheme is AuthScheme;
    /**
     * Parse authentication scheme from string
     */
    static parseScheme(scheme: string): AuthScheme;
}
//# sourceMappingURL=auth-schemes.d.ts.map