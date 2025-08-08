"use strict";
/**
 * Authentication schemes supported by ADK
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthSchemeUtils = exports.AuthSchemeConfigs = exports.AuthScheme = void 0;
var AuthScheme;
(function (AuthScheme) {
    /** Bearer token authentication */
    AuthScheme["BEARER"] = "bearer";
    /** API key authentication */
    AuthScheme["API_KEY"] = "api_key";
    /** Basic authentication */
    AuthScheme["BASIC"] = "basic";
    /** OAuth2 authentication */
    AuthScheme["OAUTH2"] = "oauth2";
    /** Custom authentication */
    AuthScheme["CUSTOM"] = "custom";
    /** No authentication */
    AuthScheme["NONE"] = "none";
})(AuthScheme || (exports.AuthScheme = AuthScheme = {}));
/**
 * Predefined authentication scheme configurations
 */
exports.AuthSchemeConfigs = {
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
class AuthSchemeUtils {
    /**
     * Get configuration for an authentication scheme
     */
    static getConfig(scheme) {
        return exports.AuthSchemeConfigs[scheme];
    }
    /**
     * Generate authentication headers for a scheme and token
     */
    static generateHeaders(scheme, token, customConfig) {
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
    static generateQueryParams(scheme, token, customConfig) {
        const config = { ...this.getConfig(scheme), ...customConfig };
        if (config.queryParam) {
            return { [config.queryParam]: token };
        }
        return {};
    }
    /**
     * Check if a scheme requires a token
     */
    static requiresToken(scheme) {
        return scheme !== AuthScheme.NONE;
    }
    /**
     * Check if a scheme supports token refresh
     */
    static supportsRefresh(scheme) {
        return scheme === AuthScheme.OAUTH2;
    }
    /**
     * Get all available authentication schemes
     */
    static getAllSchemes() {
        return Object.values(AuthScheme);
    }
    /**
     * Validate if a string is a valid authentication scheme
     */
    static isValidScheme(scheme) {
        return Object.values(AuthScheme).includes(scheme);
    }
    /**
     * Parse authentication scheme from string
     */
    static parseScheme(scheme) {
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
exports.AuthSchemeUtils = AuthSchemeUtils;
//# sourceMappingURL=auth-schemes.js.map