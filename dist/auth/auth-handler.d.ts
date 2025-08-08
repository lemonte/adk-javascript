/**
 * Authentication handler for managing different authentication schemes
 */
import { AuthCredential } from './auth-credential';
import { AuthScheme } from './auth-schemes';
export interface AuthConfig {
    scheme: AuthScheme;
    credentials?: Record<string, any>;
    refreshToken?: string;
    expiresAt?: Date;
}
export interface AuthResult {
    success: boolean;
    token?: string;
    expiresAt?: Date;
    error?: string;
}
export declare class AuthHandler {
    private credentials;
    private activeScheme?;
    /**
     * Set the active authentication scheme
     */
    setAuthScheme(scheme: AuthScheme): void;
    /**
     * Get the current authentication scheme
     */
    getAuthScheme(): AuthScheme | undefined;
    /**
     * Add credentials for a specific identifier
     */
    addCredential(id: string, credential: AuthCredential): void;
    /**
     * Get credentials by identifier
     */
    getCredential(id: string): AuthCredential | undefined;
    /**
     * Remove credentials
     */
    removeCredential(id: string): boolean;
    /**
     * Authenticate using the current scheme and credentials
     */
    authenticate(id: string): Promise<AuthResult>;
    /**
     * Get authentication headers for HTTP requests
     */
    getAuthHeaders(id: string): Promise<Record<string, string>>;
    /**
     * Clear all credentials
     */
    clearAll(): void;
    /**
     * Get all credential IDs
     */
    getCredentialIds(): string[];
    /**
     * Check if credentials exist for an ID
     */
    hasCredential(id: string): boolean;
}
export declare const authHandler: AuthHandler;
//# sourceMappingURL=auth-handler.d.ts.map