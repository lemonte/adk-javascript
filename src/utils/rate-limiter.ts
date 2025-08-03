/**
 * Rate limiting utilities for controlling request rates
 */

export interface RateLimiterConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  keyGenerator?: (identifier: string) => string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  enableLogging?: boolean;
}

export interface RateLimitInfo {
  totalHits: number;
  totalHitsInWindow: number;
  remainingPoints: number;
  msBeforeNext: number;
  isBlocked: boolean;
}

export interface RateLimitResult {
  allowed: boolean;
  info: RateLimitInfo;
}

/**
 * Token bucket rate limiter
 */
export class TokenBucketRateLimiter {
  private tokens: number;
  private lastRefill: number;
  private readonly capacity: number;
  private readonly refillRate: number; // tokens per second
  private readonly enableLogging: boolean;

  constructor(
    capacity: number,
    refillRate: number,
    enableLogging = false
  ) {
    this.capacity = capacity;
    this.refillRate = refillRate;
    this.tokens = capacity;
    this.lastRefill = Date.now();
    this.enableLogging = enableLogging;
  }

  /**
   * Try to consume tokens
   */
  consume(tokens = 1): boolean {
    this.refill();

    if (this.tokens >= tokens) {
      this.tokens -= tokens;
      this.log(`Consumed ${tokens} tokens, ${this.tokens} remaining`);
      return true;
    }

    this.log(`Rate limit exceeded, need ${tokens} tokens but only have ${this.tokens}`);
    return false;
  }

  /**
   * Get current token count
   */
  getTokens(): number {
    this.refill();
    return this.tokens;
  }

  /**
   * Get time until next token is available
   */
  getTimeUntilRefill(): number {
    if (this.tokens >= 1) return 0;
    return Math.ceil((1 - this.tokens) / this.refillRate * 1000);
  }

  /**
   * Reset the bucket
   */
  reset(): void {
    this.tokens = this.capacity;
    this.lastRefill = Date.now();
    this.log('Token bucket reset');
  }

  private refill(): void {
    const now = Date.now();
    const timePassed = (now - this.lastRefill) / 1000;
    const tokensToAdd = timePassed * this.refillRate;

    this.tokens = Math.min(this.capacity, this.tokens + tokensToAdd);
    this.lastRefill = now;
  }

  private log(message: string): void {
    if (this.enableLogging) {
      console.log(`[TokenBucket] ${message}`);
    }
  }
}

/**
 * Sliding window rate limiter
 */
export class SlidingWindowRateLimiter {
  private requests: Map<string, number[]> = new Map();
  private config: Required<RateLimiterConfig>;

  constructor(config: RateLimiterConfig) {
    this.config = {
      keyGenerator: (id: string) => id,
      skipSuccessfulRequests: false,
      skipFailedRequests: false,
      enableLogging: false,
      ...config,
    };
  }

  /**
   * Check if request is allowed
   */
  async checkLimit(identifier: string): Promise<RateLimitResult> {
    const key = this.config.keyGenerator(identifier);
    const now = Date.now();
    const windowStart = now - this.config.windowMs;

    // Get or create request history for this key
    let requestTimes = this.requests.get(key) || [];
    
    // Remove old requests outside the window
    requestTimes = requestTimes.filter(time => time > windowStart);
    
    const totalHitsInWindow = requestTimes.length;
    const remainingPoints = Math.max(0, this.config.maxRequests - totalHitsInWindow);
    const isBlocked = totalHitsInWindow >= this.config.maxRequests;
    
    let msBeforeNext = 0;
    if (isBlocked && requestTimes.length > 0) {
      const oldestRequest = Math.min(...requestTimes);
      msBeforeNext = Math.max(0, oldestRequest + this.config.windowMs - now);
    }

    const info: RateLimitInfo = {
      totalHits: totalHitsInWindow + 1, // Include current request
      totalHitsInWindow,
      remainingPoints: isBlocked ? 0 : remainingPoints - 1,
      msBeforeNext,
      isBlocked,
    };

    if (!isBlocked) {
      // Add current request to history
      requestTimes.push(now);
      this.requests.set(key, requestTimes);
      this.log(`Request allowed for ${key}, ${remainingPoints - 1} remaining`);
    } else {
      this.log(`Request blocked for ${key}, retry in ${msBeforeNext}ms`);
    }

    return {
      allowed: !isBlocked,
      info,
    };
  }

  /**
   * Record a request (for manual tracking)
   */
  async recordRequest(identifier: string, success?: boolean): Promise<void> {
    if (this.config.skipSuccessfulRequests && success) return;
    if (this.config.skipFailedRequests && success === false) return;

    const key = this.config.keyGenerator(identifier);
    const now = Date.now();
    const windowStart = now - this.config.windowMs;

    let requestTimes = this.requests.get(key) || [];
    requestTimes = requestTimes.filter(time => time > windowStart);
    requestTimes.push(now);
    
    this.requests.set(key, requestTimes);
    this.log(`Recorded request for ${key}`);
  }

  /**
   * Reset limits for a specific identifier
   */
  async resetKey(identifier: string): Promise<void> {
    const key = this.config.keyGenerator(identifier);
    this.requests.delete(key);
    this.log(`Reset limits for ${key}`);
  }

  /**
   * Clear all rate limit data
   */
  async reset(): Promise<void> {
    this.requests.clear();
    this.log('All rate limits reset');
  }

  /**
   * Get current status for identifier
   */
  async getStatus(identifier: string): Promise<RateLimitInfo> {
    const key = this.config.keyGenerator(identifier);
    const now = Date.now();
    const windowStart = now - this.config.windowMs;

    const requestTimes = (this.requests.get(key) || []).filter(time => time > windowStart);
    const totalHitsInWindow = requestTimes.length;
    const remainingPoints = Math.max(0, this.config.maxRequests - totalHitsInWindow);
    const isBlocked = totalHitsInWindow >= this.config.maxRequests;
    
    let msBeforeNext = 0;
    if (isBlocked && requestTimes.length > 0) {
      const oldestRequest = Math.min(...requestTimes);
      msBeforeNext = Math.max(0, oldestRequest + this.config.windowMs - now);
    }

    return {
      totalHits: totalHitsInWindow,
      totalHitsInWindow,
      remainingPoints,
      msBeforeNext,
      isBlocked,
    };
  }

  /**
   * Cleanup old entries
   */
  cleanup(): void {
    const now = Date.now();
    const windowStart = now - this.config.windowMs;
    let cleanedKeys = 0;

    for (const [key, requestTimes] of this.requests.entries()) {
      const validTimes = requestTimes.filter(time => time > windowStart);
      
      if (validTimes.length === 0) {
        this.requests.delete(key);
        cleanedKeys++;
      } else if (validTimes.length !== requestTimes.length) {
        this.requests.set(key, validTimes);
      }
    }

    if (cleanedKeys > 0) {
      this.log(`Cleaned up ${cleanedKeys} expired keys`);
    }
  }

  /**
   * Get statistics
   */
  getStats(): {
    totalKeys: number;
    totalRequests: number;
    activeKeys: number;
  } {
    this.cleanup();
    
    let totalRequests = 0;
    let activeKeys = 0;
    
    for (const requestTimes of this.requests.values()) {
      totalRequests += requestTimes.length;
      if (requestTimes.length > 0) activeKeys++;
    }

    return {
      totalKeys: this.requests.size,
      totalRequests,
      activeKeys,
    };
  }

  private log(message: string): void {
    if (this.config.enableLogging) {
      console.log(`[RateLimiter] ${message}`);
    }
  }
}

/**
 * Fixed window rate limiter
 */
export class FixedWindowRateLimiter {
  private windows: Map<string, { count: number; resetTime: number }> = new Map();
  private config: Required<RateLimiterConfig>;

  constructor(config: RateLimiterConfig) {
    this.config = {
      keyGenerator: (id: string) => id,
      skipSuccessfulRequests: false,
      skipFailedRequests: false,
      enableLogging: false,
      ...config,
    };
  }

  /**
   * Check if request is allowed
   */
  async checkLimit(identifier: string): Promise<RateLimitResult> {
    const key = this.config.keyGenerator(identifier);
    const now = Date.now();
    
    let window = this.windows.get(key);
    
    // Create new window or reset if expired
    if (!window || now >= window.resetTime) {
      window = {
        count: 0,
        resetTime: now + this.config.windowMs,
      };
      this.windows.set(key, window);
    }

    const isBlocked = window.count >= this.config.maxRequests;
    const remainingPoints = Math.max(0, this.config.maxRequests - window.count);
    const msBeforeNext = isBlocked ? window.resetTime - now : 0;

    const info: RateLimitInfo = {
      totalHits: window.count + (isBlocked ? 0 : 1),
      totalHitsInWindow: window.count,
      remainingPoints: isBlocked ? 0 : remainingPoints - 1,
      msBeforeNext,
      isBlocked,
    };

    if (!isBlocked) {
      window.count++;
      this.log(`Request allowed for ${key}, ${remainingPoints - 1} remaining`);
    } else {
      this.log(`Request blocked for ${key}, window resets in ${msBeforeNext}ms`);
    }

    return {
      allowed: !isBlocked,
      info,
    };
  }

  /**
   * Reset limits for a specific identifier
   */
  async resetKey(identifier: string): Promise<void> {
    const key = this.config.keyGenerator(identifier);
    this.windows.delete(key);
    this.log(`Reset limits for ${key}`);
  }

  /**
   * Clear all rate limit data
   */
  async reset(): Promise<void> {
    this.windows.clear();
    this.log('All rate limits reset');
  }

  /**
   * Cleanup expired windows
   */
  cleanup(): void {
    const now = Date.now();
    let cleanedKeys = 0;

    for (const [key, window] of this.windows.entries()) {
      if (now >= window.resetTime) {
        this.windows.delete(key);
        cleanedKeys++;
      }
    }

    if (cleanedKeys > 0) {
      this.log(`Cleaned up ${cleanedKeys} expired windows`);
    }
  }

  private log(message: string): void {
    if (this.config.enableLogging) {
      console.log(`[FixedWindowRateLimiter] ${message}`);
    }
  }
}

/**
 * Rate limiter factory
 */
export class RateLimiterFactory {
  static createSlidingWindow(config: RateLimiterConfig): SlidingWindowRateLimiter {
    return new SlidingWindowRateLimiter(config);
  }

  static createFixedWindow(config: RateLimiterConfig): FixedWindowRateLimiter {
    return new FixedWindowRateLimiter(config);
  }

  static createTokenBucket(
    capacity: number,
    refillRate: number,
    enableLogging = false
  ): TokenBucketRateLimiter {
    return new TokenBucketRateLimiter(capacity, refillRate, enableLogging);
  }
}

// Common rate limiter configurations
export const RateLimiterPresets = {
  // API rate limiting
  api: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100,
  },
  
  // Strict rate limiting
  strict: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10,
  },
  
  // Generous rate limiting
  generous: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 1000,
  },
  
  // Per-second limiting
  perSecond: {
    windowMs: 1000, // 1 second
    maxRequests: 10,
  },
  
  // Per-hour limiting
  perHour: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 1000,
  },
} as const;