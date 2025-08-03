/**
 * Cache utilities for storing and retrieving data
 */

export interface CacheConfig {
  defaultTtl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum number of items
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
export abstract class Cache {
  protected config: Required<CacheConfig>;

  constructor(config: CacheConfig = {}) {
    this.config = {
      defaultTtl: config.defaultTtl ?? 300000, // 5 minutes
      maxSize: config.maxSize ?? 1000,
      enableLogging: config.enableLogging ?? false,
    };
  }

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
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T> | T,
    ttl?: number
  ): Promise<T> {
    const cached = await this.get<T>(key);
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
  async setMany<T>(entries: Record<string, T>, ttl?: number): Promise<void> {
    const promises = Object.entries(entries).map(([key, value]) =>
      this.set(key, value, ttl)
    );
    await Promise.all(promises);
  }

  /**
   * Get multiple values
   */
  async getMany<T>(keys: string[]): Promise<Record<string, T | undefined>> {
    const promises = keys.map(async key => [key, await this.get<T>(key)] as const);
    const results = await Promise.all(promises);
    return Object.fromEntries(results);
  }

  /**
   * Delete multiple keys
   */
  async deleteMany(keys: string[]): Promise<number> {
    const promises = keys.map(key => this.delete(key));
    const results = await Promise.all(promises);
    return results.filter(Boolean).length;
  }

  /**
   * Increment a numeric value
   */
  async increment(key: string, delta = 1, ttl?: number): Promise<number> {
    const current = await this.get<number>(key) ?? 0;
    const newValue = current + delta;
    await this.set(key, newValue, ttl);
    return newValue;
  }

  /**
   * Decrement a numeric value
   */
  async decrement(key: string, delta = 1, ttl?: number): Promise<number> {
    return this.increment(key, -delta, ttl);
  }

  protected log(message: string, ...args: any[]): void {
    if (this.config.enableLogging) {
      console.log(`[Cache] ${message}`, ...args);
    }
  }
}

/**
 * In-memory cache implementation
 */
export class MemoryCache extends Cache {
  private store: Map<string, CacheEntry<any>> = new Map();
  private cleanupInterval: NodeJS.Timeout | undefined;

  constructor(config: CacheConfig = {}) {
    super(config);
    this.startCleanup();
  }

  async get<T>(key: string): Promise<T | undefined> {
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

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    const actualTtl = ttl ?? this.config.defaultTtl;
    const now = Date.now();
    
    const entry: CacheEntry<T> = {
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

  async delete(key: string): Promise<boolean> {
    const deleted = this.store.delete(key);
    if (deleted) {
      this.log(`Cache deleted for key: ${key}`);
    }
    return deleted;
  }

  async clear(): Promise<void> {
    this.store.clear();
    this.log('Cache cleared');
  }

  async has(key: string): Promise<boolean> {
    const entry = this.store.get(key);
    if (!entry) return false;
    
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return false;
    }
    
    return true;
  }

  async size(): Promise<number> {
    this.cleanupExpired();
    return this.store.size;
  }

  async keys(): Promise<string[]> {
    this.cleanupExpired();
    return Array.from(this.store.keys());
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number;
    maxSize: number;
    oldestEntry?: Date;
    newestEntry?: Date;
  } {
    let oldestTime = Infinity;
    let newestTime = 0;

    for (const entry of this.store.values()) {
      if (entry.createdAt < oldestTime) oldestTime = entry.createdAt;
      if (entry.createdAt > newestTime) newestTime = entry.createdAt;
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
  private cleanupExpired(): void {
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
  private evictOldest(): void {
    let oldestKey: string | undefined;
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
  private startCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpired();
    }, 60000); // Cleanup every minute
  }

  /**
   * Stop periodic cleanup
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = undefined;
    }
    this.store.clear();
  }
}

/**
 * Redis cache implementation (requires redis client)
 */
export class RedisCache extends Cache {
  private client: any; // Redis client

  constructor(client: any, config: CacheConfig = {}) {
    super(config);
    this.client = client;
  }

  async get<T>(key: string): Promise<T | undefined> {
    try {
      const value = await this.client.get(key);
      if (value === null) {
        this.log(`Cache miss for key: ${key}`);
        return undefined;
      }
      
      this.log(`Cache hit for key: ${key}`);
      return JSON.parse(value);
    } catch (error) {
      this.log(`Error getting cache key ${key}:`, error);
      return undefined;
    }
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      const actualTtl = ttl ?? this.config.defaultTtl;
      const serialized = JSON.stringify(value);
      
      if (actualTtl > 0) {
        await this.client.setex(key, Math.ceil(actualTtl / 1000), serialized);
      } else {
        await this.client.set(key, serialized);
      }
      
      this.log(`Cache set for key: ${key}, TTL: ${actualTtl}ms`);
    } catch (error) {
      this.log(`Error setting cache key ${key}:`, error);
      throw error;
    }
  }

  async delete(key: string): Promise<boolean> {
    try {
      const result = await this.client.del(key);
      const deleted = result > 0;
      if (deleted) {
        this.log(`Cache deleted for key: ${key}`);
      }
      return deleted;
    } catch (error) {
      this.log(`Error deleting cache key ${key}:`, error);
      return false;
    }
  }

  async clear(): Promise<void> {
    try {
      await this.client.flushdb();
      this.log('Cache cleared');
    } catch (error) {
      this.log('Error clearing cache:', error);
      throw error;
    }
  }

  async has(key: string): Promise<boolean> {
    try {
      const exists = await this.client.exists(key);
      return exists === 1;
    } catch (error) {
      this.log(`Error checking cache key ${key}:`, error);
      return false;
    }
  }

  async size(): Promise<number> {
    try {
      return await this.client.dbsize();
    } catch (error) {
      this.log('Error getting cache size:', error);
      return 0;
    }
  }

  async keys(): Promise<string[]> {
    try {
      return await this.client.keys('*');
    } catch (error) {
      this.log('Error getting cache keys:', error);
      return [];
    }
  }

  /**
   * Set TTL for existing key
   */
  async expire(key: string, ttl: number): Promise<boolean> {
    try {
      const result = await this.client.expire(key, Math.ceil(ttl / 1000));
      return result === 1;
    } catch (error) {
      this.log(`Error setting TTL for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Get TTL for key
   */
  async getTtl(key: string): Promise<number> {
    try {
      const ttl = await this.client.ttl(key);
      return ttl * 1000; // Convert to milliseconds
    } catch (error) {
      this.log(`Error getting TTL for key ${key}:`, error);
      return -1;
    }
  }
}

// Default memory cache instance
export const defaultCache = new MemoryCache();