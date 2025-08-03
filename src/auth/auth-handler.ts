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

export class AuthHandler {
  private credentials: Map<string, AuthCredential> = new Map();
  private activeScheme?: AuthScheme;

  /**
   * Set the active authentication scheme
   */
  setAuthScheme(scheme: AuthScheme): void {
    this.activeScheme = scheme;
  }

  /**
   * Get the current authentication scheme
   */
  getAuthScheme(): AuthScheme | undefined {
    return this.activeScheme;
  }

  /**
   * Add credentials for a specific identifier
   */
  addCredential(id: string, credential: AuthCredential): void {
    this.credentials.set(id, credential);
  }

  /**
   * Get credentials by identifier
   */
  getCredential(id: string): AuthCredential | undefined {
    return this.credentials.get(id);
  }

  /**
   * Remove credentials
   */
  removeCredential(id: string): boolean {
    return this.credentials.delete(id);
  }

  /**
   * Authenticate using the current scheme and credentials
   */
  async authenticate(id: string): Promise<AuthResult> {
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
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Authentication failed'
      };
    }
  }

  /**
   * Get authentication headers for HTTP requests
   */
  async getAuthHeaders(id: string): Promise<Record<string, string>> {
    const result = await this.authenticate(id);
    if (!result.success || !result.token) {
      throw new Error(result.error || 'Authentication failed');
    }

    switch (this.activeScheme) {
      case AuthScheme.BEARER:
        return { Authorization: `Bearer ${result.token}` };
      case AuthScheme.API_KEY:
        return { 'X-API-Key': result.token };
      case AuthScheme.BASIC:
        return { Authorization: `Basic ${result.token}` };
      default:
        return { Authorization: result.token };
    }
  }

  /**
   * Clear all credentials
   */
  clearAll(): void {
    this.credentials.clear();
    this.activeScheme = undefined;
  }

  /**
   * Get all credential IDs
   */
  getCredentialIds(): string[] {
    return Array.from(this.credentials.keys());
  }

  /**
   * Check if credentials exist for an ID
   */
  hasCredential(id: string): boolean {
    return this.credentials.has(id);
  }
}

// Default auth handler instance
export const authHandler = new AuthHandler();