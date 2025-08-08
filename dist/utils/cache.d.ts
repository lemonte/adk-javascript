/**
 * Cache utilities for storing and retrieving data
 */
export interface CacheConfig {
    defaultTtl?: number;
    maxSize?: number;
    enableLogging?: boolean;
}
export interface CacheEntry<T> {
    value: T;
    expiresAt: number;
    createdAt: number;
}
/**
 * Abstract cache interface
 */
export declare abstract class Cache {
    protected config: Required<CacheConfig>;
    constructor(config?: CacheConfig);
    abstract get<T>(key: string): Promise<T | undefined>;
    abstract set<T>(key: string, value: T, ttl?: number): Promise<void>;
    abstract delete(key: string): Promise<boolean>;
    abstract clear(): Promise<void>;
    abstract has(key: string): Promise<boolean>;
    abstract size(): Promise<number>;
    abstract keys(): Promise<string[]>;
    /**
     * Get or set a value in cache
     */
    getOrSet<T>(key: string, factory: () => Promise<T> | T, ttl?: number): Promise<T>;
    /**
     * Set multiple values
     */
    setMany<T>(entries: Record<string, T>, ttl?: number): Promise<void>;
    /**
     * Get multiple values
     */
    getMany<T>(keys: string[]): Promise<Record<string, T | undefined>>;
    /**
     * Delete multiple keys
     */
    deleteMany(keys: string[]): Promise<number>;
    /**
     * Increment a numeric value
     */
    increment(key: string, delta?: number, ttl?: number): Promise<number>;
    /**
     * Decrement a numeric value
     */
    decrement(key: string, delta?: number, ttl?: number): Promise<number>;
    protected log(message: string, ...args: any[]): void;
}
/**
 * In-memory cache implementation
 */
export declare class MemoryCache extends Cache {
    private store;
    private cleanupInterval;
    constructor(config?: CacheConfig);
    get<T>(key: string): Promise<T | undefined>;
    set<T>(key: string, value: T, ttl?: number): Promise<void>;
    delete(key: string): Promise<boolean>;
    clear(): Promise<void>;
    has(key: string): Promise<boolean>;
    size(): Promise<number>;
    keys(): Promise<string[]>;
    /**
     * Get cache statistics
     */
    getStats(): {
        size: number;
        maxSize: number;
        oldestEntry?: Date;
        newestEntry?: Date;
    };
    /**
     * Cleanup expired entries
     */
    private cleanupExpired;
    /**
     * Evict oldest entry
     */
    private evictOldest;
    /**
     * Start periodic cleanup
     */
    private startCleanup;
    /**
     * Stop periodic cleanup
     */
    destroy(): void;
}
/**
 * Redis cache implementation (requires redis client)
 */
export declare class RedisCache extends Cache {
    private client;
    constructor(client: any, config?: CacheConfig);
    get<T>(key: string): Promise<T | undefined>;
    set<T>(key: string, value: T, ttl?: number): Promise<void>;
    delete(key: string): Promise<boolean>;
    clear(): Promise<void>;
    has(key: string): Promise<boolean>;
    size(): Promise<number>;
    keys(): Promise<string[]>;
    /**
     * Set TTL for existing key
     */
    expire(key: string, ttl: number): Promise<boolean>;
    /**
     * Get TTL for key
     */
    getTtl(key: string): Promise<number>;
}
export declare const defaultCache: MemoryCache;
//# sourceMappingURL=cache.d.ts.map