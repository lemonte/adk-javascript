/**
 * Caching plugin for ADK JavaScript
 */
import { BasePlugin } from './base-plugin';
import { PluginConfig, ToolContext, ModelContext, AgentContext } from './types';
export interface CachingPluginConfig extends PluginConfig {
    settings?: {
        enableModelCache?: boolean;
        enableToolCache?: boolean;
        enableAgentCache?: boolean;
        defaultTtl?: number;
        maxCacheSize?: number;
        cacheStrategy?: 'lru' | 'lfu' | 'fifo' | 'ttl';
        persistCache?: boolean;
        cacheFilePath?: string;
        compressionEnabled?: boolean;
        encryptionEnabled?: boolean;
        encryptionKey?: string;
        cacheKeyPrefix?: string;
        excludePatterns?: string[];
        includePatterns?: string[];
        warmupCache?: boolean;
        warmupData?: CacheEntry[];
        evictionPolicy?: {
            maxMemoryUsage?: number;
            evictionThreshold?: number;
        };
    };
}
export interface CacheEntry {
    key: string;
    value: any;
    timestamp: number;
    ttl: number;
    accessCount: number;
    lastAccessed: number;
    size: number;
    tags?: string[];
    metadata?: Record<string, any>;
}
export interface CacheStats {
    hits: number;
    misses: number;
    hitRate: number;
    totalEntries: number;
    totalSize: number;
    evictions: number;
    averageAccessTime: number;
    oldestEntry: number;
    newestEntry: number;
}
export interface CacheKey {
    type: 'model' | 'tool' | 'agent';
    name: string;
    input: string;
    parameters?: Record<string, any>;
    version?: string;
}
/**
 * Plugin that provides caching capabilities for models, tools, and agents
 */
export declare class CachingPlugin extends BasePlugin {
    private cache;
    private accessOrder;
    private accessFrequency;
    private insertionOrder;
    private stats;
    private cleanupTimer?;
    private enableModelCache;
    private enableToolCache;
    private enableAgentCache;
    private defaultTtl;
    private maxCacheSize;
    private cacheStrategy;
    private persistCache;
    private cacheFilePath?;
    private compressionEnabled;
    private encryptionEnabled;
    private encryptionKey?;
    private cacheKeyPrefix;
    private excludePatterns;
    private includePatterns;
    private warmupCache;
    private warmupData;
    private evictionPolicy;
    constructor(config?: Partial<CachingPluginConfig>);
    protected onInitialize(): Promise<void>;
    protected onDestroy(): Promise<void>;
    beforeToolCallback(context: ToolContext): Promise<ToolContext>;
    afterToolCallback(context: ToolContext): Promise<ToolContext>;
    beforeModelCallback(context: ModelContext): Promise<ModelContext>;
    afterModelCallback(context: ModelContext): Promise<ModelContext>;
    beforeAgentCallback(context: AgentContext): Promise<AgentContext>;
    afterAgentCallback(context: AgentContext): Promise<AgentContext>;
    /**
     * Generate cache key from cache key object
     */
    private generateCacheKey;
    /**
     * Hash string for cache key generation
     */
    private hashString;
    /**
     * Check if key should be cached based on include/exclude patterns
     */
    private shouldCache;
    /**
     * Get value from cache
     */
    get(key: string): any;
    /**
     * Set value in cache
     */
    set(key: string, value: any, options?: {
        ttl?: number;
        tags?: string[];
        metadata?: Record<string, any>;
    }): void;
    /**
     * Delete value from cache
     */
    delete(key: string): boolean;
    /**
     * Clear all cache entries
     */
    clear(): void;
    /**
     * Check if entry is expired
     */
    private isExpired;
    /**
     * Calculate size of value
     */
    private calculateSize;
    /**
     * Process value for storage (compression, encryption)
     */
    private processValue;
    /**
     * Update access structures for cache strategies
     */
    private updateAccessStructures;
    /**
     * Add to access structures
     */
    private addToAccessStructures;
    /**
     * Remove from access structures
     */
    private removeFromAccessStructures;
    /**
     * Evict entries if necessary
     */
    private evictIfNecessary;
    /**
     * Evict entries based on cache strategy
     */
    private evictEntries;
    /**
     * Evict entries by size
     */
    private evictBySize;
    /**
     * Find least frequently used key
     */
    private findLFUKey;
    /**
     * Find expired key
     */
    private findExpiredKey;
    /**
     * Update cache statistics
     */
    private updateStats;
    /**
     * Start cleanup timer for expired entries
     */
    private startCleanupTimer;
    /**
     * Clean up expired entries
     */
    private cleanupExpiredEntries;
    /**
     * Load persisted cache from file
     */
    private loadPersistedCache;
    /**
     * Persist cache data to file
     */
    private persistCacheData;
    /**
     * Warmup cache with predefined data
     */
    private warmupCacheData;
    /**
     * Get cache statistics
     */
    getStats(): CacheStats;
    /**
     * Get cache entries by tag
     */
    getEntriesByTag(tag: string): CacheEntry[];
    /**
     * Delete entries by tag
     */
    deleteByTag(tag: string): number;
    /**
     * Get cache size in bytes
     */
    getCacheSize(): number;
    /**
     * Get cache entry count
     */
    getCacheEntryCount(): number;
    /**
     * Check if key exists in cache
     */
    has(key: string): boolean;
    /**
     * Get all cache keys
     */
    getKeys(): string[];
    /**
     * Update cache configuration
     */
    updateCacheConfig(updates: Partial<CachingPluginConfig['settings']>): void;
    protected performHealthCheck(): Promise<Record<string, any>>;
}
//# sourceMappingURL=caching-plugin.d.ts.map