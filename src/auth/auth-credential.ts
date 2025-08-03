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

export abstract class AuthCredential {
  protected accessToken: string;
  protected refreshToken?: string;
  protected expiresAt?: Date;
  protected tokenType: string;
  protected scope: string[];
  protected metadata: Record<string, any>;

  constructor(data: CredentialData) {
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
  getAccessToken(): string {
    return this.accessToken;
  }

  /**
   * Get the refresh token
   */
  getRefreshToken(): string | undefined {
    return this.refreshToken;
  }

  /**
   * Get token expiration date
   */
  getExpiresAt(): Date | undefined {
    return this.expiresAt;
  }

  /**
   * Get token type
   */
  getTokenType(): string {
    return this.tokenType;
  }

  /**
   * Get token scope
   */
  getScope(): string[] {
    return [...this.scope];
  }

  /**
   * Get metadata
   */
  getMetadata(): Record<string, any> {
    return { ...this.metadata };
  }

  /**
   * Check if the credential is valid (not expired)
   */
  isValid(): boolean {
    if (!this.expiresAt) {
      return true; // No expiration set
    }
    return new Date() < this.expiresAt;
  }

  /**
   * Check if the credential can be refreshed
   */
  canRefresh(): boolean {
    return !!this.refreshToken;
  }

  /**
   * Check if the credential is expired
   */
  isExpired(): boolean {
    return !this.isValid();
  }

  /**
   * Get time until expiration in milliseconds
   */
  getTimeUntilExpiration(): number | null {
    if (!this.expiresAt) {
      return null;
    }
    return this.expiresAt.getTime() - Date.now();
  }

  /**
   * Update the access token and expiration
   */
  updateToken(accessToken: string, expiresAt?: Date): void {
    this.accessToken = accessToken;
    if (expiresAt) {
      this.expiresAt = expiresAt;
    }
  }

  /**
   * Update metadata
   */
  updateMetadata(metadata: Record<string, any>): void {
    this.metadata = { ...this.metadata, ...metadata };
  }

  /**
   * Abstract method to refresh the credential
   */
  abstract refresh(): Promise<RefreshResult>;

  /**
   * Convert to JSON representation
   */
  toJSON(): CredentialData {
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

/**
 * OAuth2 credential implementation
 */
export class OAuth2Credential extends AuthCredential {
  private clientId: string;
  private clientSecret: string;
  private tokenEndpoint: string;

  constructor(
    data: CredentialData,
    clientId: string,
    clientSecret: string,
    tokenEndpoint: string
  ) {
    super(data);
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.tokenEndpoint = tokenEndpoint;
  }

  /**
   * Refresh the OAuth2 token
   */
  async refresh(): Promise<RefreshResult> {
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
      
      this.accessToken = (data as any).access_token;
      if ((data as any).refresh_token) {
        this.refreshToken = (data as any).refresh_token;
      }
      if ((data as any).expires_in) {
        this.expiresAt = new Date(Date.now() + (data as any).expires_in * 1000);
      }

      return {
        success: true,
        accessToken: this.accessToken,
        expiresAt: this.expiresAt
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Token refresh failed'
      };
    }
  }
}

/**
 * API Key credential implementation
 */
export class ApiKeyCredential extends AuthCredential {
  constructor(apiKey: string, metadata?: Record<string, any>) {
    super({
      accessToken: apiKey,
      tokenType: 'ApiKey',
      metadata
    });
  }

  /**
   * API keys typically don't refresh
   */
  async refresh(): Promise<RefreshResult> {
    return {
      success: false,
      error: 'API keys cannot be refreshed'
    };
  }
}

/**
 * Basic authentication credential
 */
export class BasicAuthCredential extends AuthCredential {
  constructor(username: string, password: string) {
    const token = btoa(`${username}:${password}`);
    super({
      accessToken: token,
      tokenType: 'Basic'
    });
  }

  /**
   * Basic auth doesn't refresh
   */
  async refresh(): Promise<RefreshResult> {
    return {
      success: false,
      error: 'Basic auth credentials cannot be refreshed'
    };
  }
}