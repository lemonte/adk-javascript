"use strict";
/**
 * Credential manager for storing and retrieving authentication credentials
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.credentialManager = exports.CredentialManager = exports.LocalStorageCredentialStorage = exports.InMemoryCredentialStorage = void 0;
const auth_credential_1 = require("./auth-credential");
const auth_schemes_1 = require("./auth-schemes");
/**
 * In-memory credential storage implementation
 */
class InMemoryCredentialStorage {
    constructor() {
        this.credentials = new Map();
    }
    async store(id, credential) {
        this.credentials.set(id, credential);
    }
    async retrieve(id) {
        return this.credentials.get(id) || null;
    }
    async remove(id) {
        return this.credentials.delete(id);
    }
    async list() {
        return Array.from(this.credentials.keys());
    }
    async clear() {
        this.credentials.clear();
    }
}
exports.InMemoryCredentialStorage = InMemoryCredentialStorage;
/**
 * Local storage credential storage implementation (browser only)
 */
class LocalStorageCredentialStorage {
    constructor() {
        this.prefix = 'adk_credentials_';
    }
    isAvailable() {
        try {
            return typeof localStorage !== 'undefined';
        }
        catch {
            return false;
        }
    }
    async store(id, credential) {
        if (!this.isAvailable()) {
            throw new Error('LocalStorage is not available');
        }
        const key = this.prefix + id;
        localStorage.setItem(key, JSON.stringify(credential));
    }
    async retrieve(id) {
        if (!this.isAvailable()) {
            return null;
        }
        const key = this.prefix + id;
        const data = localStorage.getItem(key);
        if (!data) {
            return null;
        }
        try {
            const credential = JSON.parse(data);
            // Convert date strings back to Date objects
            credential.createdAt = new Date(credential.createdAt);
            if (credential.lastUsed) {
                credential.lastUsed = new Date(credential.lastUsed);
            }
            if (credential.data.expiresAt) {
                credential.data.expiresAt = new Date(credential.data.expiresAt);
            }
            return credential;
        }
        catch {
            return null;
        }
    }
    async remove(id) {
        if (!this.isAvailable()) {
            return false;
        }
        const key = this.prefix + id;
        const existed = localStorage.getItem(key) !== null;
        localStorage.removeItem(key);
        return existed;
    }
    async list() {
        if (!this.isAvailable()) {
            return [];
        }
        const keys = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(this.prefix)) {
                keys.push(key.substring(this.prefix.length));
            }
        }
        return keys;
    }
    async clear() {
        if (!this.isAvailable()) {
            return;
        }
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(this.prefix)) {
                keysToRemove.push(key);
            }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
    }
}
exports.LocalStorageCredentialStorage = LocalStorageCredentialStorage;
/**
 * Main credential manager class
 */
class CredentialManager {
    constructor(storage) {
        this.cache = new Map();
        this.storage = storage || new InMemoryCredentialStorage();
    }
    /**
     * Store a credential
     */
    async storeCredential(id, credential, scheme, metadata) {
        const storedCredential = {
            id,
            scheme,
            data: credential.toJSON(),
            metadata,
            createdAt: new Date()
        };
        await this.storage.store(id, storedCredential);
        this.cache.set(id, credential);
    }
    /**
     * Retrieve a credential
     */
    async getCredential(id) {
        // Check cache first
        if (this.cache.has(id)) {
            return this.cache.get(id);
        }
        // Load from storage
        const stored = await this.storage.retrieve(id);
        if (!stored) {
            return null;
        }
        // Create credential instance based on scheme
        const credential = this.createCredentialFromStored(stored);
        if (credential) {
            this.cache.set(id, credential);
            // Update last used timestamp
            stored.lastUsed = new Date();
            await this.storage.store(id, stored);
        }
        return credential;
    }
    /**
     * Remove a credential
     */
    async removeCredential(id) {
        this.cache.delete(id);
        return await this.storage.remove(id);
    }
    /**
     * List all credential IDs
     */
    async listCredentials() {
        return await this.storage.list();
    }
    /**
     * Clear all credentials
     */
    async clearAll() {
        this.cache.clear();
        await this.storage.clear();
    }
    /**
     * Get credential metadata
     */
    async getCredentialMetadata(id) {
        const stored = await this.storage.retrieve(id);
        return stored?.metadata || null;
    }
    /**
     * Update credential metadata
     */
    async updateCredentialMetadata(id, metadata) {
        const stored = await this.storage.retrieve(id);
        if (!stored) {
            return false;
        }
        stored.metadata = { ...stored.metadata, ...metadata };
        await this.storage.store(id, stored);
        return true;
    }
    /**
     * Check if a credential exists
     */
    async hasCredential(id) {
        if (this.cache.has(id)) {
            return true;
        }
        const stored = await this.storage.retrieve(id);
        return stored !== null;
    }
    /**
     * Get credential info without loading the full credential
     */
    async getCredentialInfo(id) {
        const stored = await this.storage.retrieve(id);
        if (!stored) {
            return null;
        }
        return {
            scheme: stored.scheme,
            createdAt: stored.createdAt,
            lastUsed: stored.lastUsed,
            metadata: stored.metadata
        };
    }
    /**
     * Create credential instance from stored data
     */
    createCredentialFromStored(stored) {
        const { scheme, data } = stored;
        try {
            switch (scheme) {
                case auth_schemes_1.AuthScheme.OAUTH2:
                    // For OAuth2, we need additional config that should be in metadata
                    const oauth2Config = stored.metadata?.oauth2Config;
                    if (oauth2Config) {
                        return new auth_credential_1.OAuth2Credential(data, oauth2Config.clientId, oauth2Config.clientSecret, oauth2Config.tokenEndpoint);
                    }
                    break;
                case auth_schemes_1.AuthScheme.API_KEY:
                    return new auth_credential_1.ApiKeyCredential(data.accessToken, data.metadata);
                case auth_schemes_1.AuthScheme.BASIC:
                    return new auth_credential_1.BasicAuthCredential(stored.metadata?.username || '', stored.metadata?.password || '');
                default:
                    // For other schemes, create a generic credential
                    return new (class extends auth_credential_1.AuthCredential {
                        async refresh() {
                            return {
                                success: false,
                                error: 'Refresh not supported for this credential type'
                            };
                        }
                    })(data);
            }
        }
        catch (error) {
            console.error('Failed to create credential from stored data:', error);
        }
        return null;
    }
    /**
     * Set storage implementation
     */
    setStorage(storage) {
        this.storage = storage;
        this.cache.clear(); // Clear cache when changing storage
    }
    /**
     * Get current storage implementation
     */
    getStorage() {
        return this.storage;
    }
}
exports.CredentialManager = CredentialManager;
// Default credential manager instance
exports.credentialManager = new CredentialManager();
//# sourceMappingURL=credential-manager.js.map