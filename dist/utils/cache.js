"use strict";
/**
 * Cache utilities for storing and retrieving data
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultCache = exports.RedisCache = exports.MemoryCache = exports.Cache = void 0;
/**
 * Abstract cache interface
 */
class Cache {
    constructor(config = {}) {
        this.config = {
            defaultTtl: config.defaultTtl ?? 300000, // 5 minutes
            maxSize: config.maxSize ?? 1000,
            enableLogging: config.enableLogging ?? false,
        };
    }
    /**
     * Get or set a value in cache
     */
    async getOrSet(key, factory, ttl) {
        const cached = await this.get(key);
        if (cached !== undefined) {
            return cached;
        }
        const value = await factory();
        await this.set(key, value, ttl);
        return value;
    }
    /**
     * Set multiple values
     */
    async setMany(entries, ttl) {
        const promises = Object.entries(entries).map(([key, value]) => this.set(key, value, ttl));
        await Promise.all(promises);
    }
    /**
     * Get multiple values
     */
    async getMany(keys) {
        const promises = keys.map(async (key) => [key, await this.get(key)]);
        const results = await Promise.all(promises);
        return Object.fromEntries(results);
    }
    /**
     * Delete multiple keys
     */
    async deleteMany(keys) {
        const promises = keys.map(key => this.delete(key));
        const results = await Promise.all(promises);
        return results.filter(Boolean).length;
    }
    /**
     * Increment a numeric value
     */
    async increment(key, delta = 1, ttl) {
        const current = await this.get(key) ?? 0;
        const newValue = current + delta;
        await this.set(key, newValue, ttl);
        return newValue;
    }
    /**
     * Decrement a numeric value
     */
    async decrement(key, delta = 1, ttl) {
        return this.increment(key, -delta, ttl);
    }
    log(message, ...args) {
        if (this.config.enableLogging) {
            console.log(`[Cache] ${message}`, ...args);
        }
    }
}
exports.Cache = Cache;
/**
 * In-memory cache implementation
 */
class MemoryCache extends Cache {
    constructor(config = {}) {
        super(config);
        this.store = new Map();
        this.startCleanup();
    }
    async get(key) {
        const entry = this.store.get(key);
        if (!entry) {
            this.log(`Cache miss for key: ${key}`);
            return undefined;
        }
        if (Date.now() > entry.expiresAt) {
            this.store.delete(key);
            this.log(`Cache expired for key: ${key}`);
            return undefined;
        }
        this.log(`Cache hit for key: ${key}`);
        return entry.value;
    }
    async set(key, value, ttl) {
        const actualTtl = ttl ?? this.config.defaultTtl;
        const now = Date.now();
        const entry = {
            value,
            expiresAt: now + actualTtl,
            createdAt: now,
        };
        // Check if we need to evict items
        if (this.store.size >= this.config.maxSize && !this.store.has(key)) {
            this.evictOldest();
        }
        this.store.set(key, entry);
        this.log(`Cache set for key: ${key}, TTL: ${actualTtl}ms`);
    }
    async delete(key) {
        const deleted = this.store.delete(key);
        if (deleted) {
            this.log(`Cache deleted for key: ${key}`);
        }
        return deleted;
    }
    async clear() {
        this.store.clear();
        this.log('Cache cleared');
    }
    async has(key) {
        const entry = this.store.get(key);
        if (!entry)
            return false;
        if (Date.now() > entry.expiresAt) {
            this.store.delete(key);
            return false;
        }
        return true;
    }
    async size() {
        this.cleanupExpired();
        return this.store.size;
    }
    async keys() {
        this.cleanupExpired();
        return Array.from(this.store.keys());
    }
    /**
     * Get cache statistics
     */
    getStats() {
        let oldestTime = Infinity;
        let newestTime = 0;
        for (const entry of this.store.values()) {
            if (entry.createdAt < oldestTime)
                oldestTime = entry.createdAt;
            if (entry.createdAt > newestTime)
                newestTime = entry.createdAt;
        }
        return {
            size: this.store.size,
            maxSize: this.config.maxSize,
            oldestEntry: oldestTime !== Infinity ? new Date(oldestTime) : undefined,
            newestEntry: newestTime !== 0 ? new Date(newestTime) : undefined,
        };
    }
    /**
     * Cleanup expired entries
     */
    cleanupExpired() {
        const now = Date.now();
        let cleanedCount = 0;
        for (const [key, entry] of this.store.entries()) {
            if (now > entry.expiresAt) {
                this.store.delete(key);
                cleanedCount++;
            }
        }
        if (cleanedCount > 0) {
            this.log(`Cleaned up ${cleanedCount} expired entries`);
        }
    }
    /**
     * Evict oldest entry
     */
    evictOldest() {
        let oldestKey;
        let oldestTime = Infinity;
        for (const [key, entry] of this.store.entries()) {
            if (entry.createdAt < oldestTime) {
                oldestTime = entry.createdAt;
                oldestKey = key;
            }
        }
        if (oldestKey) {
            this.store.delete(oldestKey);
            this.log(`Evicted oldest entry: ${oldestKey}`);
        }
    }
    /**
     * Start periodic cleanup
     */
    startCleanup() {
        this.cleanupInterval = setInterval(() => {
            this.cleanupExpired();
        }, 60000); // Cleanup every minute
    }
    /**
     * Stop periodic cleanup
     */
    destroy() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = undefined;
        }
        this.store.clear();
    }
}
exports.MemoryCache = MemoryCache;
/**
 * Redis cache implementation (requires redis client)
 */
class RedisCache extends Cache {
    constructor(client, config = {}) {
        super(config);
        this.client = client;
    }
    async get(key) {
        try {
            const value = await this.client.get(key);
            if (value === null) {
                this.log(`Cache miss for key: ${key}`);
                return undefined;
            }
            this.log(`Cache hit for key: ${key}`);
            return JSON.parse(value);
        }
        catch (error) {
            this.log(`Error getting cache key ${key}:`, error);
            return undefined;
        }
    }
    async set(key, value, ttl) {
        try {
            const actualTtl = ttl ?? this.config.defaultTtl;
            const serialized = JSON.stringify(value);
            if (actualTtl > 0) {
                await this.client.setex(key, Math.ceil(actualTtl / 1000), serialized);
            }
            else {
                await this.client.set(key, serialized);
            }
            this.log(`Cache set for key: ${key}, TTL: ${actualTtl}ms`);
        }
        catch (error) {
            this.log(`Error setting cache key ${key}:`, error);
            throw error;
        }
    }
    async delete(key) {
        try {
            const result = await this.client.del(key);
            const deleted = result > 0;
            if (deleted) {
                this.log(`Cache deleted for key: ${key}`);
            }
            return deleted;
        }
        catch (error) {
            this.log(`Error deleting cache key ${key}:`, error);
            return false;
        }
    }
    async clear() {
        try {
            await this.client.flushdb();
            this.log('Cache cleared');
        }
        catch (error) {
            this.log('Error clearing cache:', error);
            throw error;
        }
    }
    async has(key) {
        try {
            const exists = await this.client.exists(key);
            return exists === 1;
        }
        catch (error) {
            this.log(`Error checking cache key ${key}:`, error);
            return false;
        }
    }
    async size() {
        try {
            return await this.client.dbsize();
        }
        catch (error) {
            this.log('Error getting cache size:', error);
            return 0;
        }
    }
    async keys() {
        try {
            return await this.client.keys('*');
        }
        catch (error) {
            this.log('Error getting cache keys:', error);
            return [];
        }
    }
    /**
     * Set TTL for existing key
     */
    async expire(key, ttl) {
        try {
            const result = await this.client.expire(key, Math.ceil(ttl / 1000));
            return result === 1;
        }
        catch (error) {
            this.log(`Error setting TTL for key ${key}:`, error);
            return false;
        }
    }
    /**
     * Get TTL for key
     */
    async getTtl(key) {
        try {
            const ttl = await this.client.ttl(key);
            return ttl * 1000; // Convert to milliseconds
        }
        catch (error) {
            this.log(`Error getting TTL for key ${key}:`, error);
            return -1;
        }
    }
}
exports.RedisCache = RedisCache;
// Default memory cache instance
exports.defaultCache = new MemoryCache();
//# sourceMappingURL=cache.js.map