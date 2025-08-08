/**
 * Credential manager for storing and retrieving authentication credentials
 */
import { AuthCredential, CredentialData } from './auth-credential';
import { AuthScheme } from './auth-schemes';
export interface StoredCredential {
    id: string;
    scheme: AuthScheme;
    data: CredentialData;
    metadata?: Record<string, any>;
    createdAt: Date;
    lastUsed?: Date;
}
export interface CredentialStorage {
    store(id: string, credential: StoredCredential): Promise<void>;
    retrieve(id: string): Promise<StoredCredential | null>;
    remove(id: string): Promise<boolean>;
    list(): Promise<string[]>;
    clear(): Promise<void>;
}
/**
 * In-memory credential storage implementation
 */
export declare class InMemoryCredentialStorage implements CredentialStorage {
    private credentials;
    store(id: string, credential: StoredCredential): Promise<void>;
    retrieve(id: string): Promise<StoredCredential | null>;
    remove(id: string): Promise<boolean>;
    list(): Promise<string[]>;
    clear(): Promise<void>;
}
/**
 * Local storage credential storage implementation (browser only)
 */
export declare class LocalStorageCredentialStorage implements CredentialStorage {
    private prefix;
    private isAvailable;
    store(id: string, credential: StoredCredential): Promise<void>;
    retrieve(id: string): Promise<StoredCredential | null>;
    remove(id: string): Promise<boolean>;
    list(): Promise<string[]>;
    clear(): Promise<void>;
}
/**
 * Main credential manager class
 */
export declare class CredentialManager {
    private storage;
    private cache;
    constructor(storage?: CredentialStorage);
    /**
     * Store a credential
     */
    storeCredential(id: string, credential: AuthCredential, scheme: AuthScheme, metadata?: Record<string, any>): Promise<void>;
    /**
     * Retrieve a credential
     */
    getCredential(id: string): Promise<AuthCredential | null>;
    /**
     * Remove a credential
     */
    removeCredential(id: string): Promise<boolean>;
    /**
     * List all credential IDs
     */
    listCredentials(): Promise<string[]>;
    /**
     * Clear all credentials
     */
    clearAll(): Promise<void>;
    /**
     * Get credential metadata
     */
    getCredentialMetadata(id: string): Promise<Record<string, any> | null>;
    /**
     * Update credential metadata
     */
    updateCredentialMetadata(id: string, metadata: Record<string, any>): Promise<boolean>;
    /**
     * Check if a credential exists
     */
    hasCredential(id: string): Promise<boolean>;
    /**
     * Get credential info without loading the full credential
     */
    getCredentialInfo(id: string): Promise<{
        scheme: AuthScheme;
        createdAt: Date;
        lastUsed?: Date;
        metadata?: Record<string, any>;
    } | null>;
    /**
     * Create credential instance from stored data
     */
    private createCredentialFromStored;
    /**
     * Set storage implementation
     */
    setStorage(storage: CredentialStorage): void;
    /**
     * Get current storage implementation
     */
    getStorage(): CredentialStorage;
}
export declare const credentialManager: CredentialManager;
//# sourceMappingURL=credential-manager.d.ts.map