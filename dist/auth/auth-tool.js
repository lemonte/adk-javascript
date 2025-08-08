"use strict";
/**
 * Authentication tool for handling various authentication flows
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthTool = void 0;
const auth_handler_1 = require("./auth-handler");
const auth_schemes_1 = require("./auth-schemes");
const auth_credential_1 = require("./auth-credential");
const oauth2_util_1 = require("./oauth2-util");
/**
 * Authentication tool for managing authentication flows
 */
class AuthTool {
    constructor(config = {}) {
        this.authHandler = new auth_handler_1.AuthHandler();
        this.config = {
            defaultScheme: auth_schemes_1.AuthScheme.BEARER,
            autoRefresh: true,
            refreshThreshold: 300, // 5 minutes
            ...config
        };
        if (this.config.defaultScheme) {
            this.authHandler.setActiveScheme(this.config.defaultScheme);
        }
    }
    /**
     * Get the auth handler instance
     */
    getAuthHandler() {
        return this.authHandler;
    }
    /**
     * Set up API key authentication
     */
    setupApiKey(key, credentialId = 'default') {
        try {
            const credential = new auth_credential_1.ApiKeyCredential(key);
            this.authHandler.addCredential(credentialId, credential);
            this.authHandler.setActiveScheme(auth_schemes_1.AuthScheme.API_KEY);
            return {
                success: true,
                token: key
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to setup API key'
            };
        }
    }
    /**
     * Set up basic authentication
     */
    setupBasicAuth(username, password, credentialId = 'default') {
        try {
            const credential = new auth_credential_1.BasicAuthCredential(username, password);
            this.authHandler.addCredential(credentialId, credential);
            this.authHandler.setActiveScheme(auth_schemes_1.AuthScheme.BASIC);
            const token = credential.getToken();
            return {
                success: true,
                token
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to setup basic auth'
            };
        }
    }
    /**
     * Set up bearer token authentication
     */
    setupBearerToken(token, expiresAt, credentialId = 'default') {
        try {
            const credential = new auth_credential_1.OAuth2Credential({
                accessToken: token,
                tokenType: 'Bearer',
                expiresAt
            });
            this.authHandler.addCredential(credentialId, credential);
            this.authHandler.setActiveScheme(auth_schemes_1.AuthScheme.BEARER);
            return {
                success: true,
                token,
                expiresAt
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to setup bearer token'
            };
        }
    }
    /**
     * Start OAuth2 authorization flow
     */
    startOAuth2Flow(config, usePKCE = true) {
        try {
            // Generate PKCE challenge if requested
            if (usePKCE) {
                this.pkceChallenge = oauth2_util_1.OAuth2Util.generatePKCEChallenge();
                config.codeChallenge = this.pkceChallenge.codeChallenge;
                config.codeChallengeMethod = this.pkceChallenge.codeChallengeMethod;
            }
            // Generate state parameter
            this.oauth2State = oauth2_util_1.OAuth2Util.generateState();
            config.state = this.oauth2State;
            // Build authorization URL
            const authorizationUrl = oauth2_util_1.OAuth2Util.buildAuthorizationUrl(config);
            return {
                success: true,
                authorizationUrl
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to start OAuth2 flow'
            };
        }
    }
    /**
     * Complete OAuth2 authorization flow
     */
    async completeOAuth2Flow(config, authorizationResponseUrl, credentialId = 'default') {
        try {
            // Parse authorization response
            const authResponse = oauth2_util_1.OAuth2Util.parseAuthorizationResponse(authorizationResponseUrl);
            if (authResponse.error) {
                return {
                    success: false,
                    error: `Authorization failed: ${authResponse.error} - ${authResponse.errorDescription}`
                };
            }
            // Validate state
            if (this.oauth2State && !oauth2_util_1.OAuth2Util.validateState(this.oauth2State, authResponse.state)) {
                return {
                    success: false,
                    error: 'Invalid state parameter'
                };
            }
            // Exchange code for token
            const tokenResponse = await oauth2_util_1.OAuth2Util.exchangeCodeForToken(config, authResponse.code, this.pkceChallenge?.codeVerifier);
            if (tokenResponse.error) {
                return {
                    success: false,
                    error: `Token exchange failed: ${tokenResponse.error} - ${tokenResponse.errorDescription}`
                };
            }
            // Create credential
            const expiresAt = tokenResponse.expiresIn
                ? new Date(Date.now() + tokenResponse.expiresIn * 1000)
                : undefined;
            const credential = new auth_credential_1.OAuth2Credential({
                accessToken: tokenResponse.accessToken,
                tokenType: tokenResponse.tokenType,
                refreshToken: tokenResponse.refreshToken,
                expiresAt,
                scope: tokenResponse.scope?.split(' ')
            });
            // Store credential and set active scheme
            this.authHandler.addCredential(credentialId, credential);
            this.authHandler.setActiveScheme(auth_schemes_1.AuthScheme.OAUTH2);
            // Clean up flow state
            this.pkceChallenge = undefined;
            this.oauth2State = undefined;
            return {
                success: true,
                credential
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to complete OAuth2 flow'
            };
        }
    }
    /**
     * Refresh OAuth2 token
     */
    async refreshOAuth2Token(config, credentialId = 'default') {
        try {
            const credential = this.authHandler.getCredential(credentialId);
            if (!(credential instanceof auth_credential_1.OAuth2Credential)) {
                return {
                    success: false,
                    error: 'Credential is not an OAuth2 credential'
                };
            }
            const refreshResult = await credential.refresh({
                tokenEndpoint: config.tokenEndpoint,
                clientId: config.clientId,
                clientSecret: config.clientSecret
            });
            if (!refreshResult.success) {
                return {
                    success: false,
                    error: refreshResult.error
                };
            }
            return {
                success: true,
                token: credential.getToken(),
                expiresAt: credential.getExpiresAt()
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to refresh token'
            };
        }
    }
    /**
     * Authenticate and get current token
     */
    async authenticate(credentialId) {
        try {
            const result = await this.authHandler.authenticate(credentialId);
            if (!result.success) {
                return {
                    success: false,
                    error: result.error
                };
            }
            return {
                success: true,
                token: result.token,
                expiresAt: result.expiresAt
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
     * Check if token needs refresh
     */
    needsRefresh(credentialId) {
        try {
            const credential = this.authHandler.getCredential(credentialId);
            if (!credential || !credential.getExpiresAt()) {
                return false;
            }
            const now = new Date();
            const expiresAt = credential.getExpiresAt();
            const thresholdMs = (this.config.refreshThreshold || 300) * 1000;
            return (expiresAt.getTime() - now.getTime()) <= thresholdMs;
        }
        catch {
            return false;
        }
    }
    /**
     * Auto-refresh token if needed
     */
    async autoRefresh(config, credentialId) {
        if (!this.config.autoRefresh || !this.needsRefresh(credentialId)) {
            return this.authenticate(credentialId);
        }
        const refreshResult = await this.refreshOAuth2Token(config, credentialId);
        if (refreshResult.success) {
            return refreshResult;
        }
        // If refresh failed, try to authenticate with existing token
        return this.authenticate(credentialId);
    }
    /**
     * Get authentication headers
     */
    async getAuthHeaders(credentialId) {
        const authResult = await this.authenticate(credentialId);
        if (!authResult.success) {
            return {};
        }
        return this.authHandler.getAuthHeaders(credentialId);
    }
    /**
     * Clear all credentials
     */
    clearCredentials() {
        this.authHandler.clearCredentials();
    }
    /**
     * Remove specific credential
     */
    removeCredential(credentialId) {
        return this.authHandler.removeCredential(credentialId);
    }
    /**
     * Check if authenticated
     */
    isAuthenticated(credentialId) {
        return this.authHandler.hasCredential(credentialId);
    }
    /**
     * Get current authentication scheme
     */
    getCurrentScheme() {
        return this.authHandler.getActiveScheme();
    }
    /**
     * Set authentication scheme
     */
    setScheme(scheme) {
        this.authHandler.setActiveScheme(scheme);
    }
}
exports.AuthTool = AuthTool;
// Default export
exports.default = AuthTool;
//# sourceMappingURL=auth-tool.js.map