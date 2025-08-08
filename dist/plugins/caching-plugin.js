"use strict";
/**
 * Caching plugin for ADK JavaScript
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CachingPlugin = void 0;
const base_plugin_1 = require("./base-plugin");
const constants_1 = require("./constants");
/**
 * Plugin that provides caching capabilities for models, tools, and agents
 */
class CachingPlugin extends base_plugin_1.BasePlugin {
    constructor(config = {}) {
        const fullConfig = {
            name: 'caching-plugin',
            version: '1.0.0',
            description: 'Provides caching capabilities for models, tools, and agents',
            priority: constants_1.PLUGIN_PRIORITIES.HIGH,
            hooks: [
                'before_tool',
                'after_tool',
                'before_model',
                'after_model',
                'before_agent',
                'after_agent'
            ],
            settings: {
                enableModelCache: true,
                enableToolCache: true,
                enableAgentCache: false, // Agent caching is more complex
                defaultTtl: 3600000, // 1 hour
                maxCacheSize: 1000,
                cacheStrategy: 'lru',
                persistCache: false,
                compressionEnabled: false,
                encryptionEnabled: false,
                cacheKeyPrefix: 'adk_cache',
                excludePatterns: [],
                includePatterns: [],
                warmupCache: false,
                warmupData: [],
                evictionPolicy: {
                    maxMemoryUsage: 100 * 1024 * 1024, // 100MB
                    evictionThreshold: 0.8 // 80%
                },
                ...config.settings
            },
            ...config
        };
        super(fullConfig);
        this.cache = new Map();
        this.accessOrder = []; // For LRU
        this.accessFrequency = new Map(); // For LFU
        this.insertionOrder = []; // For FIFO
        const settings = fullConfig.settings;
        this.enableModelCache = settings.enableModelCache;
        this.enableToolCache = settings.enableToolCache;
        this.enableAgentCache = settings.enableAgentCache;
        this.defaultTtl = settings.defaultTtl;
        this.maxCacheSize = settings.maxCacheSize;
        this.cacheStrategy = settings.cacheStrategy;
        this.persistCache = settings.persistCache;
        this.cacheFilePath = settings.cacheFilePath;
        this.compressionEnabled = settings.compressionEnabled;
        this.encryptionEnabled = settings.encryptionEnabled;
        this.encryptionKey = settings.encryptionKey;
        this.cacheKeyPrefix = settings.cacheKeyPrefix;
        this.excludePatterns = (settings.excludePatterns || []).map(pattern => new RegExp(pattern));
        this.includePatterns = (settings.includePatterns || []).map(pattern => new RegExp(pattern));
        this.warmupCache = settings.warmupCache;
        this.warmupData = settings.warmupData;
        this.evictionPolicy = settings.evictionPolicy;
        this.stats = {
            hits: 0,
            misses: 0,
            hitRate: 0,
            totalEntries: 0,
            totalSize: 0,
            evictions: 0,
            averageAccessTime: 0,
            oldestEntry: 0,
            newestEntry: 0
        };
    }
    async onInitialize() {
        this.log('info', 'Caching plugin initialized');
        // Load persisted cache
        if (this.persistCache && this.cacheFilePath) {
            await this.loadPersistedCache();
        }
        // Warmup cache
        if (this.warmupCache && this.warmupData.length > 0) {
            await this.warmupCacheData();
        }
        // Start cleanup timer
        this.startCleanupTimer();
    }
    async onDestroy() {
        this.log('info', 'Caching plugin destroyed');
        // Stop cleanup timer
        if (this.cleanupTimer) {
            clearInterval(this.cleanupTimer);
        }
        // Persist cache
        if (this.persistCache && this.cacheFilePath) {
            await this.persistCacheData();
        }
    }
    async beforeToolCallback(context) {
        if (!this.enableToolCache) {
            return context;
        }
        const cacheKey = this.generateCacheKey({
            type: 'tool',
            name: context.toolName,
            input: JSON.stringify(context.toolArgs),
            parameters: context.toolConfig
        });
        if (!this.shouldCache(cacheKey)) {
            return context;
        }
        const cachedResult = this.get(cacheKey);
        if (cachedResult !== null) {
            this.log('debug', `Cache hit for tool: ${context.toolName}`);
            // Set cached result
            context.toolResult = cachedResult;
            context.fromCache = true;
            // Skip actual tool execution by marking as completed
            context.skipExecution = true;
        }
        return context;
    }
    async afterToolCallback(context) {
        if (!this.enableToolCache || context.fromCache || context.error) {
            return context;
        }
        const cacheKey = this.generateCacheKey({
            type: 'tool',
            name: context.toolName,
            input: JSON.stringify(context.toolArgs),
            parameters: context.toolConfig
        });
        if (!this.shouldCache(cacheKey)) {
            return context;
        }
        // Cache the result
        this.set(cacheKey, context.toolResult, {
            ttl: this.defaultTtl,
            tags: ['tool', context.toolName],
            metadata: {
                toolName: context.toolName,
                executionTime: context.executionTime,
                timestamp: Date.now()
            }
        });
        this.log('debug', `Cached result for tool: ${context.toolName}`);
        return context;
    }
    async beforeModelCallback(context) {
        if (!this.enableModelCache) {
            return context;
        }
        const cacheKey = this.generateCacheKey({
            type: 'model',
            name: context.modelName,
            input: JSON.stringify(context.prompt),
            parameters: context.modelConfig
        });
        if (!this.shouldCache(cacheKey)) {
            return context;
        }
        const cachedResult = this.get(cacheKey);
        if (cachedResult !== null) {
            this.log('debug', `Cache hit for model: ${context.modelName}`);
            // Set cached result
            context.response = cachedResult.response;
            context.tokens = cachedResult.tokens;
            context.cost = cachedResult.cost;
            context.fromCache = true;
            // Skip actual model call
            context.skipExecution = true;
        }
        return context;
    }
    async afterModelCallback(context) {
        if (!this.enableModelCache || context.fromCache || context.error) {
            return context;
        }
        const cacheKey = this.generateCacheKey({
            type: 'model',
            name: context.modelName,
            input: JSON.stringify(context.prompt),
            parameters: context.modelConfig
        });
        if (!this.shouldCache(cacheKey)) {
            return context;
        }
        // Cache the result
        const cacheValue = {
            response: context.response,
            tokens: context.tokens,
            cost: context.cost
        };
        this.set(cacheKey, cacheValue, {
            ttl: this.defaultTtl,
            tags: ['model', context.modelName],
            metadata: {
                modelName: context.modelName,
                tokens: context.tokens,
                cost: context.cost,
                latency: context.latency,
                timestamp: Date.now()
            }
        });
        this.log('debug', `Cached result for model: ${context.modelName}`);
        return context;
    }
    async beforeAgentCallback(context) {
        if (!this.enableAgentCache) {
            return context;
        }
        const cacheKey = this.generateCacheKey({
            type: 'agent',
            name: context.agentName,
            input: JSON.stringify(context.input),
            parameters: context.agentConfig
        });
        if (!this.shouldCache(cacheKey)) {
            return context;
        }
        const cachedResult = this.get(cacheKey);
        if (cachedResult !== null) {
            this.log('debug', `Cache hit for agent: ${context.agentName}`);
            // Set cached result
            context.output = cachedResult.output;
            context.totalSteps = cachedResult.totalSteps;
            context.fromCache = true;
            // Skip actual agent execution
            context.skipExecution = true;
        }
        return context;
    }
    async afterAgentCallback(context) {
        if (!this.enableAgentCache || context.fromCache || context.error) {
            return context;
        }
        const cacheKey = this.generateCacheKey({
            type: 'agent',
            name: context.agentName,
            input: JSON.stringify(context.input),
            parameters: context.agentConfig
        });
        if (!this.shouldCache(cacheKey)) {
            return context;
        }
        // Cache the result
        const cacheValue = {
            output: context.output,
            totalSteps: context.totalSteps
        };
        this.set(cacheKey, cacheValue, {
            ttl: this.defaultTtl,
            tags: ['agent', context.agentName],
            metadata: {
                agentName: context.agentName,
                totalSteps: context.totalSteps,
                executionTime: context.executionTime,
                timestamp: Date.now()
            }
        });
        this.log('debug', `Cached result for agent: ${context.agentName}`);
        return context;
    }
    /**
     * Generate cache key from cache key object
     */
    generateCacheKey(keyObj) {
        const keyString = `${keyObj.type}:${keyObj.name}:${this.hashString(keyObj.input)}`;
        if (keyObj.parameters) {
            const paramHash = this.hashString(JSON.stringify(keyObj.parameters));
            return `${this.cacheKeyPrefix}:${keyString}:${paramHash}`;
        }
        return `${this.cacheKeyPrefix}:${keyString}`;
    }
    /**
     * Hash string for cache key generation
     */
    hashString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash).toString(36);
    }
    /**
     * Check if key should be cached based on include/exclude patterns
     */
    shouldCache(key) {
        // Check exclude patterns first
        if (this.excludePatterns.length > 0) {
            for (const pattern of this.excludePatterns) {
                if (pattern.test(key)) {
                    return false;
                }
            }
        }
        // Check include patterns
        if (this.includePatterns.length > 0) {
            for (const pattern of this.includePatterns) {
                if (pattern.test(key)) {
                    return true;
                }
            }
            return false; // If include patterns exist, key must match one
        }
        return true; // Cache by default if no patterns specified
    }
    /**
     * Get value from cache
     */
    get(key) {
        const startTime = Date.now();
        const entry = this.cache.get(key);
        if (!entry) {
            this.stats.misses++;
            this.updateStats();
            return null;
        }
        // Check TTL
        if (this.isExpired(entry)) {
            this.cache.delete(key);
            this.removeFromAccessStructures(key);
            this.stats.misses++;
            this.updateStats();
            return null;
        }
        // Update access information
        entry.accessCount++;
        entry.lastAccessed = Date.now();
        // Update access structures for cache strategies
        this.updateAccessStructures(key);
        this.stats.hits++;
        this.stats.averageAccessTime = (this.stats.averageAccessTime + (Date.now() - startTime)) / 2;
        this.updateStats();
        return entry.value;
    }
    /**
     * Set value in cache
     */
    set(key, value, options = {}) {
        const now = Date.now();
        const ttl = options.ttl || this.defaultTtl;
        const size = this.calculateSize(value);
        // Check if we need to evict entries
        this.evictIfNecessary(size);
        const entry = {
            key,
            value: this.processValue(value),
            timestamp: now,
            ttl,
            accessCount: 0,
            lastAccessed: now,
            size,
            tags: options.tags,
            metadata: options.metadata
        };
        // Remove existing entry if it exists
        if (this.cache.has(key)) {
            this.removeFromAccessStructures(key);
        }
        this.cache.set(key, entry);
        // Update access structures
        this.addToAccessStructures(key);
        this.updateStats();
    }
    /**
     * Delete value from cache
     */
    delete(key) {
        const existed = this.cache.delete(key);
        if (existed) {
            this.removeFromAccessStructures(key);
            this.updateStats();
        }
        return existed;
    }
    /**
     * Clear all cache entries
     */
    clear() {
        this.cache.clear();
        this.accessOrder = [];
        this.accessFrequency.clear();
        this.insertionOrder = [];
        this.updateStats();
    }
    /**
     * Check if entry is expired
     */
    isExpired(entry) {
        return Date.now() > (entry.timestamp + entry.ttl);
    }
    /**
     * Calculate size of value
     */
    calculateSize(value) {
        try {
            return JSON.stringify(value).length * 2; // Rough estimate (UTF-16)
        }
        catch {
            return 1000; // Default size for non-serializable values
        }
    }
    /**
     * Process value for storage (compression, encryption)
     */
    processValue(value) {
        let processed = value;
        if (this.compressionEnabled) {
            // In a real implementation, you would compress the value
            processed = value; // Placeholder
        }
        if (this.encryptionEnabled && this.encryptionKey) {
            // In a real implementation, you would encrypt the value
            processed = value; // Placeholder
        }
        return processed;
    }
    /**
     * Update access structures for cache strategies
     */
    updateAccessStructures(key) {
        // LRU: Move to end
        const lruIndex = this.accessOrder.indexOf(key);
        if (lruIndex > -1) {
            this.accessOrder.splice(lruIndex, 1);
        }
        this.accessOrder.push(key);
        // LFU: Increment frequency
        const currentFreq = this.accessFrequency.get(key) || 0;
        this.accessFrequency.set(key, currentFreq + 1);
    }
    /**
     * Add to access structures
     */
    addToAccessStructures(key) {
        this.accessOrder.push(key);
        this.accessFrequency.set(key, 0);
        this.insertionOrder.push(key);
    }
    /**
     * Remove from access structures
     */
    removeFromAccessStructures(key) {
        const lruIndex = this.accessOrder.indexOf(key);
        if (lruIndex > -1) {
            this.accessOrder.splice(lruIndex, 1);
        }
        this.accessFrequency.delete(key);
        const fifoIndex = this.insertionOrder.indexOf(key);
        if (fifoIndex > -1) {
            this.insertionOrder.splice(fifoIndex, 1);
        }
    }
    /**
     * Evict entries if necessary
     */
    evictIfNecessary(newEntrySize) {
        // Check size limit
        if (this.cache.size >= this.maxCacheSize) {
            this.evictEntries(1);
        }
        // Check memory usage
        const currentSize = this.stats.totalSize + newEntrySize;
        const maxSize = this.evictionPolicy.maxMemoryUsage;
        const threshold = maxSize * this.evictionPolicy.evictionThreshold;
        if (currentSize > threshold) {
            const targetSize = maxSize * 0.7; // Evict to 70% of max
            const sizeToEvict = currentSize - targetSize;
            this.evictBySize(sizeToEvict);
        }
    }
    /**
     * Evict entries based on cache strategy
     */
    evictEntries(count) {
        for (let i = 0; i < count && this.cache.size > 0; i++) {
            let keyToEvict;
            switch (this.cacheStrategy) {
                case 'lru':
                    keyToEvict = this.accessOrder[0];
                    break;
                case 'lfu':
                    keyToEvict = this.findLFUKey();
                    break;
                case 'fifo':
                    keyToEvict = this.insertionOrder[0];
                    break;
                case 'ttl':
                    keyToEvict = this.findExpiredKey();
                    break;
            }
            if (keyToEvict) {
                this.cache.delete(keyToEvict);
                this.removeFromAccessStructures(keyToEvict);
                this.stats.evictions++;
            }
        }
    }
    /**
     * Evict entries by size
     */
    evictBySize(targetSize) {
        let evictedSize = 0;
        while (evictedSize < targetSize && this.cache.size > 0) {
            let keyToEvict;
            switch (this.cacheStrategy) {
                case 'lru':
                    keyToEvict = this.accessOrder[0];
                    break;
                case 'lfu':
                    keyToEvict = this.findLFUKey();
                    break;
                case 'fifo':
                    keyToEvict = this.insertionOrder[0];
                    break;
                case 'ttl':
                    keyToEvict = this.findExpiredKey();
                    break;
            }
            if (keyToEvict) {
                const entry = this.cache.get(keyToEvict);
                if (entry) {
                    evictedSize += entry.size;
                }
                this.cache.delete(keyToEvict);
                this.removeFromAccessStructures(keyToEvict);
                this.stats.evictions++;
            }
            else {
                break; // No more entries to evict
            }
        }
    }
    /**
     * Find least frequently used key
     */
    findLFUKey() {
        let minFreq = Infinity;
        let lfuKey;
        for (const [key, freq] of this.accessFrequency.entries()) {
            if (freq < minFreq) {
                minFreq = freq;
                lfuKey = key;
            }
        }
        return lfuKey;
    }
    /**
     * Find expired key
     */
    findExpiredKey() {
        for (const [key, entry] of this.cache.entries()) {
            if (this.isExpired(entry)) {
                return key;
            }
        }
        return undefined;
    }
    /**
     * Update cache statistics
     */
    updateStats() {
        const totalRequests = this.stats.hits + this.stats.misses;
        this.stats.hitRate = totalRequests > 0 ? this.stats.hits / totalRequests : 0;
        this.stats.totalEntries = this.cache.size;
        let totalSize = 0;
        let oldestTimestamp = Date.now();
        let newestTimestamp = 0;
        for (const entry of this.cache.values()) {
            totalSize += entry.size;
            if (entry.timestamp < oldestTimestamp) {
                oldestTimestamp = entry.timestamp;
            }
            if (entry.timestamp > newestTimestamp) {
                newestTimestamp = entry.timestamp;
            }
        }
        this.stats.totalSize = totalSize;
        this.stats.oldestEntry = oldestTimestamp;
        this.stats.newestEntry = newestTimestamp;
    }
    /**
     * Start cleanup timer for expired entries
     */
    startCleanupTimer() {
        this.cleanupTimer = setInterval(() => {
            this.cleanupExpiredEntries();
        }, 60000); // Every minute
    }
    /**
     * Clean up expired entries
     */
    cleanupExpiredEntries() {
        const expiredKeys = [];
        for (const [key, entry] of this.cache.entries()) {
            if (this.isExpired(entry)) {
                expiredKeys.push(key);
            }
        }
        for (const key of expiredKeys) {
            this.cache.delete(key);
            this.removeFromAccessStructures(key);
        }
        if (expiredKeys.length > 0) {
            this.log('debug', `Cleaned up ${expiredKeys.length} expired cache entries`);
            this.updateStats();
        }
    }
    /**
     * Load persisted cache from file
     */
    async loadPersistedCache() {
        try {
            // In a real implementation, you would load from file system
            this.log('info', `Loading persisted cache from ${this.cacheFilePath}`);
        }
        catch (error) {
            this.log('error', 'Failed to load persisted cache:', error);
        }
    }
    /**
     * Persist cache data to file
     */
    async persistCacheData() {
        try {
            // In a real implementation, you would save to file system
            this.log('info', `Persisting cache data to ${this.cacheFilePath}`);
        }
        catch (error) {
            this.log('error', 'Failed to persist cache data:', error);
        }
    }
    /**
     * Warmup cache with predefined data
     */
    async warmupCacheData() {
        try {
            for (const entry of this.warmupData) {
                this.cache.set(entry.key, entry);
                this.addToAccessStructures(entry.key);
            }
            this.log('info', `Warmed up cache with ${this.warmupData.length} entries`);
            this.updateStats();
        }
        catch (error) {
            this.log('error', 'Failed to warmup cache:', error);
        }
    }
    /**
     * Get cache statistics
     */
    getStats() {
        this.updateStats();
        return { ...this.stats };
    }
    /**
     * Get cache entries by tag
     */
    getEntriesByTag(tag) {
        const entries = [];
        for (const entry of this.cache.values()) {
            if (entry.tags && entry.tags.includes(tag)) {
                entries.push({ ...entry });
            }
        }
        return entries;
    }
    /**
     * Delete entries by tag
     */
    deleteByTag(tag) {
        const keysToDelete = [];
        for (const [key, entry] of this.cache.entries()) {
            if (entry.tags && entry.tags.includes(tag)) {
                keysToDelete.push(key);
            }
        }
        for (const key of keysToDelete) {
            this.cache.delete(key);
            this.removeFromAccessStructures(key);
        }
        this.updateStats();
        return keysToDelete.length;
    }
    /**
     * Get cache size in bytes
     */
    getCacheSize() {
        return this.stats.totalSize;
    }
    /**
     * Get cache entry count
     */
    getCacheEntryCount() {
        return this.cache.size;
    }
    /**
     * Check if key exists in cache
     */
    has(key) {
        const entry = this.cache.get(key);
        return entry !== undefined && !this.isExpired(entry);
    }
    /**
     * Get all cache keys
     */
    getKeys() {
        return Array.from(this.cache.keys());
    }
    /**
     * Update cache configuration
     */
    updateCacheConfig(updates) {
        const currentSettings = this.config.settings || {};
        const newSettings = { ...currentSettings, ...updates };
        this.updateConfig({ settings: newSettings });
        // Update internal properties
        if (updates.enableModelCache !== undefined)
            this.enableModelCache = updates.enableModelCache;
        if (updates.enableToolCache !== undefined)
            this.enableToolCache = updates.enableToolCache;
        if (updates.enableAgentCache !== undefined)
            this.enableAgentCache = updates.enableAgentCache;
        if (updates.defaultTtl)
            this.defaultTtl = updates.defaultTtl;
        if (updates.maxCacheSize)
            this.maxCacheSize = updates.maxCacheSize;
        if (updates.cacheStrategy)
            this.cacheStrategy = updates.cacheStrategy;
        this.log('info', 'Cache configuration updated', updates);
    }
    async performHealthCheck() {
        this.updateStats();
        return {
            cacheSize: this.cache.size,
            totalSize: this.stats.totalSize,
            hitRate: this.stats.hitRate,
            hits: this.stats.hits,
            misses: this.stats.misses,
            evictions: this.stats.evictions,
            enabledCaches: {
                model: this.enableModelCache,
                tool: this.enableToolCache,
                agent: this.enableAgentCache
            },
            strategy: this.cacheStrategy,
            maxSize: this.maxCacheSize,
            defaultTtl: this.defaultTtl,
            cleanupTimerActive: !!this.cleanupTimer
        };
    }
}
exports.CachingPlugin = CachingPlugin;
//# sourceMappingURL=caching-plugin.js.map