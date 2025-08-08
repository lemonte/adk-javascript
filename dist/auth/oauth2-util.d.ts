/**
 * OAuth2 utilities for authentication flows
 */
export interface OAuth2Config {
    clientId: string;
    clientSecret?: string;
    redirectUri: string;
    authorizationEndpoint: string;
    tokenEndpoint: string;
    scope?: string[];
    state?: string;
    codeChallenge?: string;
    codeChallengeMethod?: 'S256' | 'plain';
}
export interface AuthorizationCodeResponse {
    code: string;
    state?: string;
    error?: string;
    errorDescription?: string;
}
export interface TokenResponse {
    accessToken: string;
    tokenType: string;
    expiresIn?: number;
    refreshToken?: string;
    scope?: string;
    error?: string;
    errorDescription?: string;
}
export interface PKCEChallenge {
    codeVerifier: string;
    codeChallenge: string;
    codeChallengeMethod: 'S256';
}
/**
 * OAuth2 utility class
 */
export declare class OAuth2Util {
    /**
     * Generate PKCE challenge for OAuth2 flow
     */
    static generatePKCEChallenge(): PKCEChallenge;
    /**
     * Generate a random code verifier for PKCE
     */
    static generateCodeVerifier(length?: number): string;
    /**
     * Generate code challenge from verifier
     */
    static generateCodeChallenge(verifier: string): string;
    /**
     * Build authorization URL
     */
    static buildAuthorizationUrl(config: OAuth2Config): string;
    /**
     * Exchange authorization code for access token
     */
    static exchangeCodeForToken(config: OAuth2Config, code: string, codeVerifier?: string): Promise<TokenResponse>;
    /**
     * Refresh access token using refresh token
     */
    static refreshToken(config: OAuth2Config, refreshToken: string): Promise<TokenResponse>;
    /**
     * Parse authorization response from URL
     */
    static parseAuthorizationResponse(url: string): AuthorizationCodeResponse;
    /**
     * Validate state parameter
     */
    static validateState(expected: string, received?: string): boolean;
    /**
     * Generate random state parameter
     */
    static generateState(length?: number): string;
    /**
     * Build logout URL (if supported by provider)
     */
    static buildLogoutUrl(logoutEndpoint: string, postLogoutRedirectUri?: string, idTokenHint?: string): string;
}
//# sourceMappingURL=oauth2-util.d.ts.map