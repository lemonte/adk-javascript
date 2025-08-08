/**
 * Authentication tool for handling various authentication flows
 */
import { AuthHandler } from './auth-handler';
import { AuthScheme } from './auth-schemes';
import { OAuth2Credential } from './auth-credential';
import { OAuth2Config } from './oauth2-util';
export interface AuthToolConfig {
    defaultScheme?: AuthScheme;
    autoRefresh?: boolean;
    refreshThreshold?: number;
}
export interface AuthenticationResult {
    success: boolean;
    token?: string;
    error?: string;
    expiresAt?: Date;
}
export interface OAuth2FlowResult {
    success: boolean;
    credential?: OAuth2Credential;
    error?: string;
    authorizationUrl?: string;
}
/**
 * Authentication tool for managing authentication flows
 */
export declare class AuthTool {
    private authHandler;
    private config;
    private pkceChallenge?;
    private oauth2State?;
    constructor(config?: AuthToolConfig);
    /**
     * Get the auth handler instance
     */
    getAuthHandler(): AuthHandler;
    /**
     * Set up API key authentication
     */
    setupApiKey(key: string, credentialId?: string): AuthenticationResult;
    /**
     * Set up basic authentication
     */
    setupBasicAuth(username: string, password: string, credentialId?: string): AuthenticationResult;
    /**
     * Set up bearer token authentication
     */
    setupBearerToken(token: string, expiresAt?: Date, credentialId?: string): AuthenticationResult;
    /**
     * Start OAuth2 authorization flow
     */
    startOAuth2Flow(config: OAuth2Config, usePKCE?: boolean): OAuth2FlowResult;
    /**
     * Complete OAuth2 authorization flow
     */
    completeOAuth2Flow(config: OAuth2Config, authorizationResponseUrl: string, credentialId?: string): Promise<OAuth2FlowResult>;
    /**
     * Refresh OAuth2 token
     */
    refreshOAuth2Token(config: OAuth2Config, credentialId?: string): Promise<AuthenticationResult>;
    /**
     * Authenticate and get current token
     */
    authenticate(credentialId?: string): Promise<AuthenticationResult>;
    /**
     * Check if token needs refresh
     */
    needsRefresh(credentialId?: string): boolean;
    /**
     * Auto-refresh token if needed
     */
    autoRefresh(config: OAuth2Config, credentialId?: string): Promise<AuthenticationResult>;
    /**
     * Get authentication headers
     */
    getAuthHeaders(credentialId?: string): Promise<Record<string, string>>;
    /**
     * Clear all credentials
     */
    clearCredentials(): void;
    /**
     * Remove specific credential
     */
    removeCredential(credentialId: string): boolean;
    /**
     * Check if authenticated
     */
    isAuthenticated(credentialId?: string): boolean;
    /**
     * Get current authentication scheme
     */
    getCurrentScheme(): AuthScheme | null;
    /**
     * Set authentication scheme
     */
    setScheme(scheme: AuthScheme): void;
}
export default AuthTool;
//# sourceMappingURL=auth-tool.d.ts.map