"use strict";
/**
 * Authentication handler for managing different authentication schemes
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.authHandler = exports.AuthHandler = void 0;
const auth_schemes_1 = require("./auth-schemes");
class AuthHandler {
    constructor() {
        this.credentials = new Map();
    }
    /**
     * Set the active authentication scheme
     */
    setAuthScheme(scheme) {
        this.activeScheme = scheme;
    }
    /**
     * Get the current authentication scheme
     */
    getAuthScheme() {
        return this.activeScheme;
    }
    /**
     * Add credentials for a specific identifier
     */
    addCredential(id, credential) {
        this.credentials.set(id, credential);
    }
    /**
     * Get credentials by identifier
     */
    getCredential(id) {
        return this.credentials.get(id);
    }
    /**
     * Remove credentials
     */
    removeCredential(id) {
        return this.credentials.delete(id);
    }
    /**
     * Authenticate using the current scheme and credentials
     */
    async authenticate(id) {
        const credential = this.getCredential(id);
        if (!credential) {
            return {
                success: false,
                error: `No credentials found for ID: ${id}`
            };
        }
        if (!this.activeScheme) {
            return {
                success: false,
                error: 'No authentication scheme set'
            };
        }
        try {
            // Check if token is still valid
            if (credential.isValid()) {
                return {
                    success: true,
                    token: credential.getAccessToken(),
                    expiresAt: credential.getExpiresAt()
                };
            }
            // Try to refresh if possible
            if (credential.canRefresh()) {
                await credential.refresh();
                return {
                    success: true,
                    token: credential.getAccessToken(),
                    expiresAt: credential.getExpiresAt()
                };
            }
            return {
                success: false,
                error: 'Credentials expired and cannot be refreshed'
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Authentication failed'
            };
        }
    }
    /**
     * Get authentication headers for HTTP requests
     */
    async getAuthHeaders(id) {
        const result = await this.authenticate(id);
        if (!result.success || !result.token) {
            throw new Error(result.error || 'Authentication failed');
        }
        switch (this.activeScheme) {
            case auth_schemes_1.AuthScheme.BEARER:
                return { Authorization: `Bearer ${result.token}` };
            case auth_schemes_1.AuthScheme.API_KEY:
                return { 'X-API-Key': result.token };
            case auth_schemes_1.AuthScheme.BASIC:
                return { Authorization: `Basic ${result.token}` };
            default:
                return { Authorization: result.token };
        }
    }
    /**
     * Clear all credentials
     */
    clearAll() {
        this.credentials.clear();
        this.activeScheme = undefined;
    }
    /**
     * Get all credential IDs
     */
    getCredentialIds() {
        return Array.from(this.credentials.keys());
    }
    /**
     * Check if credentials exist for an ID
     */
    hasCredential(id) {
        return this.credentials.has(id);
    }
}
exports.AuthHandler = AuthHandler;
// Default auth handler instance
exports.authHandler = new AuthHandler();
//# sourceMappingURL=auth-handler.js.map