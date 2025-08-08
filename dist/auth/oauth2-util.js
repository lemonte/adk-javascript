"use strict";
/**
 * OAuth2 utilities for authentication flows
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.OAuth2Util = void 0;
/**
 * OAuth2 utility class
 */
class OAuth2Util {
    /**
     * Generate PKCE challenge for OAuth2 flow
     */
    static generatePKCEChallenge() {
        const codeVerifier = this.generateCodeVerifier();
        const codeChallenge = this.generateCodeChallenge(codeVerifier);
        return {
            codeVerifier,
            codeChallenge,
            codeChallengeMethod: 'S256'
        };
    }
    /**
     * Generate a random code verifier for PKCE
     */
    static generateCodeVerifier(length = 128) {
        const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += charset.charAt(Math.floor(Math.random() * charset.length));
        }
        return result;
    }
    /**
     * Generate code challenge from verifier
     */
    static generateCodeChallenge(verifier) {
        // In a real implementation, this would use SHA256
        // For now, we'll use a simple base64 encoding
        if (typeof btoa !== 'undefined') {
            return btoa(verifier)
                .replace(/\+/g, '-')
                .replace(/\//g, '_')
                .replace(/=/g, '');
        }
        // Fallback for Node.js
        return Buffer.from(verifier)
            .toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=/g, '');
    }
    /**
     * Build authorization URL
     */
    static buildAuthorizationUrl(config) {
        const params = new URLSearchParams({
            response_type: 'code',
            client_id: config.clientId,
            redirect_uri: config.redirectUri
        });
        if (config.scope && config.scope.length > 0) {
            params.append('scope', config.scope.join(' '));
        }
        if (config.state) {
            params.append('state', config.state);
        }
        if (config.codeChallenge) {
            params.append('code_challenge', config.codeChallenge);
            params.append('code_challenge_method', config.codeChallengeMethod || 'S256');
        }
        return `${config.authorizationEndpoint}?${params.toString()}`;
    }
    /**
     * Exchange authorization code for access token
     */
    static async exchangeCodeForToken(config, code, codeVerifier) {
        const body = new URLSearchParams({
            grant_type: 'authorization_code',
            code,
            redirect_uri: config.redirectUri,
            client_id: config.clientId
        });
        if (config.clientSecret) {
            body.append('client_secret', config.clientSecret);
        }
        if (codeVerifier) {
            body.append('code_verifier', codeVerifier);
        }
        try {
            const response = await fetch(config.tokenEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Accept': 'application/json'
                },
                body: body.toString()
            });
            const data = await response.json();
            if (!response.ok) {
                return {
                    accessToken: '',
                    tokenType: '',
                    error: data.error || 'token_exchange_failed',
                    errorDescription: data.error_description || 'Failed to exchange code for token'
                };
            }
            return {
                accessToken: data.access_token,
                tokenType: data.token_type || 'Bearer',
                expiresIn: data.expires_in,
                refreshToken: data.refresh_token,
                scope: data.scope
            };
        }
        catch (error) {
            return {
                accessToken: '',
                tokenType: '',
                error: 'network_error',
                errorDescription: error instanceof Error ? error.message : 'Network error occurred'
            };
        }
    }
    /**
     * Refresh access token using refresh token
     */
    static async refreshToken(config, refreshToken) {
        const body = new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
            client_id: config.clientId
        });
        if (config.clientSecret) {
            body.append('client_secret', config.clientSecret);
        }
        try {
            const response = await fetch(config.tokenEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Accept': 'application/json'
                },
                body: body.toString()
            });
            const data = await response.json();
            if (!response.ok) {
                return {
                    accessToken: '',
                    tokenType: '',
                    error: data.error || 'token_refresh_failed',
                    errorDescription: data.error_description || 'Failed to refresh token'
                };
            }
            return {
                accessToken: data.access_token,
                tokenType: data.token_type || 'Bearer',
                expiresIn: data.expires_in,
                refreshToken: data.refresh_token || refreshToken, // Keep old refresh token if new one not provided
                scope: data.scope
            };
        }
        catch (error) {
            return {
                accessToken: '',
                tokenType: '',
                error: 'network_error',
                errorDescription: error instanceof Error ? error.message : 'Network error occurred'
            };
        }
    }
    /**
     * Parse authorization response from URL
     */
    static parseAuthorizationResponse(url) {
        const urlObj = new URL(url);
        const params = urlObj.searchParams;
        const code = params.get('code');
        const state = params.get('state');
        const error = params.get('error');
        const errorDescription = params.get('error_description');
        if (error) {
            return {
                code: '',
                state: state || undefined,
                error,
                errorDescription: errorDescription || undefined
            };
        }
        if (!code) {
            return {
                code: '',
                error: 'invalid_response',
                errorDescription: 'No authorization code found in response'
            };
        }
        return {
            code,
            state: state || undefined
        };
    }
    /**
     * Validate state parameter
     */
    static validateState(expected, received) {
        return expected === received;
    }
    /**
     * Generate random state parameter
     */
    static generateState(length = 32) {
        const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += charset.charAt(Math.floor(Math.random() * charset.length));
        }
        return result;
    }
    /**
     * Build logout URL (if supported by provider)
     */
    static buildLogoutUrl(logoutEndpoint, postLogoutRedirectUri, idTokenHint) {
        const params = new URLSearchParams();
        if (postLogoutRedirectUri) {
            params.append('post_logout_redirect_uri', postLogoutRedirectUri);
        }
        if (idTokenHint) {
            params.append('id_token_hint', idTokenHint);
        }
        const queryString = params.toString();
        return queryString ? `${logoutEndpoint}?${queryString}` : logoutEndpoint;
    }
}
exports.OAuth2Util = OAuth2Util;
//# sourceMappingURL=oauth2-util.js.map