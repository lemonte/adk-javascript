"use strict";
/**
 * Authentication credential management
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BasicAuthCredential = exports.ApiKeyCredential = exports.OAuth2Credential = exports.AuthCredential = void 0;
class AuthCredential {
    constructor(data) {
        this.accessToken = data.accessToken;
        this.refreshToken = data.refreshToken;
        this.expiresAt = data.expiresAt;
        this.tokenType = data.tokenType || 'Bearer';
        this.scope = data.scope || [];
        this.metadata = data.metadata || {};
    }
    /**
     * Get the access token
     */
    getAccessToken() {
        return this.accessToken;
    }
    /**
     * Get the refresh token
     */
    getRefreshToken() {
        return this.refreshToken;
    }
    /**
     * Get token expiration date
     */
    getExpiresAt() {
        return this.expiresAt;
    }
    /**
     * Get token type
     */
    getTokenType() {
        return this.tokenType;
    }
    /**
     * Get token scope
     */
    getScope() {
        return [...this.scope];
    }
    /**
     * Get metadata
     */
    getMetadata() {
        return { ...this.metadata };
    }
    /**
     * Check if the credential is valid (not expired)
     */
    isValid() {
        if (!this.expiresAt) {
            return true; // No expiration set
        }
        return new Date() < this.expiresAt;
    }
    /**
     * Check if the credential can be refreshed
     */
    canRefresh() {
        return !!this.refreshToken;
    }
    /**
     * Check if the credential is expired
     */
    isExpired() {
        return !this.isValid();
    }
    /**
     * Get time until expiration in milliseconds
     */
    getTimeUntilExpiration() {
        if (!this.expiresAt) {
            return null;
        }
        return this.expiresAt.getTime() - Date.now();
    }
    /**
     * Update the access token and expiration
     */
    updateToken(accessToken, expiresAt) {
        this.accessToken = accessToken;
        if (expiresAt) {
            this.expiresAt = expiresAt;
        }
    }
    /**
     * Update metadata
     */
    updateMetadata(metadata) {
        this.metadata = { ...this.metadata, ...metadata };
    }
    /**
     * Convert to JSON representation
     */
    toJSON() {
        return {
            accessToken: this.accessToken,
            refreshToken: this.refreshToken,
            expiresAt: this.expiresAt,
            tokenType: this.tokenType,
            scope: this.scope,
            metadata: this.metadata
        };
    }
}
exports.AuthCredential = AuthCredential;
/**
 * OAuth2 credential implementation
 */
class OAuth2Credential extends AuthCredential {
    constructor(data, clientId, clientSecret, tokenEndpoint) {
        super(data);
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.tokenEndpoint = tokenEndpoint;
    }
    /**
     * Refresh the OAuth2 token
     */
    async refresh() {
        if (!this.refreshToken) {
            return {
                success: false,
                error: 'No refresh token available'
            };
        }
        try {
            const response = await fetch(this.tokenEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Basic ${btoa(`${this.clientId}:${this.clientSecret}`)}`
                },
                body: new URLSearchParams({
                    grant_type: 'refresh_token',
                    refresh_token: this.refreshToken
                })
            });
            if (!response.ok) {
                throw new Error(`Token refresh failed: ${response.statusText}`);
            }
            const data = await response.json();
            this.accessToken = data.access_token;
            if (data.refresh_token) {
                this.refreshToken = data.refresh_token;
            }
            if (data.expires_in) {
                this.expiresAt = new Date(Date.now() + data.expires_in * 1000);
            }
            return {
                success: true,
                accessToken: this.accessToken,
                expiresAt: this.expiresAt
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Token refresh failed'
            };
        }
    }
}
exports.OAuth2Credential = OAuth2Credential;
/**
 * API Key credential implementation
 */
class ApiKeyCredential extends AuthCredential {
    constructor(apiKey, metadata) {
        super({
            accessToken: apiKey,
            tokenType: 'ApiKey',
            metadata
        });
    }
    /**
     * API keys typically don't refresh
     */
    async refresh() {
        return {
            success: false,
            error: 'API keys cannot be refreshed'
        };
    }
}
exports.ApiKeyCredential = ApiKeyCredential;
/**
 * Basic authentication credential
 */
class BasicAuthCredential extends AuthCredential {
    constructor(username, password) {
        const token = btoa(`${username}:${password}`);
        super({
            accessToken: token,
            tokenType: 'Basic'
        });
    }
    /**
     * Basic auth doesn't refresh
     */
    async refresh() {
        return {
            success: false,
            error: 'Basic auth credentials cannot be refreshed'
        };
    }
}
exports.BasicAuthCredential = BasicAuthCredential;
//# sourceMappingURL=auth-credential.js.map