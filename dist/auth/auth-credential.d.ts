/**
 * Authentication credential management
 */
export interface CredentialData {
    accessToken: string;
    refreshToken?: string;
    expiresAt?: Date;
    tokenType?: string;
    scope?: string[];
    metadata?: Record<string, any>;
}
export interface RefreshResult {
    success: boolean;
    accessToken?: string;
    expiresAt?: Date;
    error?: string;
}
export declare abstract class AuthCredential {
    protected accessToken: string;
    protected refreshToken?: string;
    protected expiresAt?: Date;
    protected tokenType: string;
    protected scope: string[];
    protected metadata: Record<string, any>;
    constructor(data: CredentialData);
    /**
     * Get the access token
     */
    getAccessToken(): string;
    /**
     * Get the refresh token
     */
    getRefreshToken(): string | undefined;
    /**
     * Get token expiration date
     */
    getExpiresAt(): Date | undefined;
    /**
     * Get token type
     */
    getTokenType(): string;
    /**
     * Get token scope
     */
    getScope(): string[];
    /**
     * Get metadata
     */
    getMetadata(): Record<string, any>;
    /**
     * Check if the credential is valid (not expired)
     */
    isValid(): boolean;
    /**
     * Check if the credential can be refreshed
     */
    canRefresh(): boolean;
    /**
     * Check if the credential is expired
     */
    isExpired(): boolean;
    /**
     * Get time until expiration in milliseconds
     */
    getTimeUntilExpiration(): number | null;
    /**
     * Update the access token and expiration
     */
    updateToken(accessToken: string, expiresAt?: Date): void;
    /**
     * Update metadata
     */
    updateMetadata(metadata: Record<string, any>): void;
    /**
     * Abstract method to refresh the credential
     */
    abstract refresh(): Promise<RefreshResult>;
    /**
     * Convert to JSON representation
     */
    toJSON(): CredentialData;
}
/**
 * OAuth2 credential implementation
 */
export declare class OAuth2Credential extends AuthCredential {
    private clientId;
    private clientSecret;
    private tokenEndpoint;
    constructor(data: CredentialData, clientId: string, clientSecret: string, tokenEndpoint: string);
    /**
     * Refresh the OAuth2 token
     */
    refresh(): Promise<RefreshResult>;
}
/**
 * API Key credential implementation
 */
export declare class ApiKeyCredential extends AuthCredential {
    constructor(apiKey: string, metadata?: Record<string, any>);
    /**
     * API keys typically don't refresh
     */
    refresh(): Promise<RefreshResult>;
}
/**
 * Basic authentication credential
 */
export declare class BasicAuthCredential extends AuthCredential {
    constructor(username: string, password: string);
    /**
     * Basic auth doesn't refresh
     */
    refresh(): Promise<RefreshResult>;
}
//# sourceMappingURL=auth-credential.d.ts.map