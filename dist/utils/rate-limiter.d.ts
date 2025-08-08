/**
 * Rate limiting utilities for controlling request rates
 */
export interface RateLimiterConfig {
    windowMs: number;
    maxRequests: number;
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
export declare class TokenBucketRateLimiter {
    private tokens;
    private lastRefill;
    private readonly capacity;
    private readonly refillRate;
    private readonly enableLogging;
    constructor(capacity: number, refillRate: number, enableLogging?: boolean);
    /**
     * Try to consume tokens
     */
    consume(tokens?: number): boolean;
    /**
     * Get current token count
     */
    getTokens(): number;
    /**
     * Get time until next token is available
     */
    getTimeUntilRefill(): number;
    /**
     * Reset the bucket
     */
    reset(): void;
    private refill;
    private log;
}
/**
 * Sliding window rate limiter
 */
export declare class SlidingWindowRateLimiter {
    private requests;
    private config;
    constructor(config: RateLimiterConfig);
    /**
     * Check if request is allowed
     */
    checkLimit(identifier: string): Promise<RateLimitResult>;
    /**
     * Record a request (for manual tracking)
     */
    recordRequest(identifier: string, success?: boolean): Promise<void>;
    /**
     * Reset limits for a specific identifier
     */
    resetKey(identifier: string): Promise<void>;
    /**
     * Clear all rate limit data
     */
    reset(): Promise<void>;
    /**
     * Get current status for identifier
     */
    getStatus(identifier: string): Promise<RateLimitInfo>;
    /**
     * Cleanup old entries
     */
    cleanup(): void;
    /**
     * Get statistics
     */
    getStats(): {
        totalKeys: number;
        totalRequests: number;
        activeKeys: number;
    };
    private log;
}
/**
 * Fixed window rate limiter
 */
export declare class FixedWindowRateLimiter {
    private windows;
    private config;
    constructor(config: RateLimiterConfig);
    /**
     * Check if request is allowed
     */
    checkLimit(identifier: string): Promise<RateLimitResult>;
    /**
     * Reset limits for a specific identifier
     */
    resetKey(identifier: string): Promise<void>;
    /**
     * Clear all rate limit data
     */
    reset(): Promise<void>;
    /**
     * Cleanup expired windows
     */
    cleanup(): void;
    private log;
}
/**
 * Rate limiter factory
 */
export declare class RateLimiterFactory {
    static createSlidingWindow(config: RateLimiterConfig): SlidingWindowRateLimiter;
    static createFixedWindow(config: RateLimiterConfig): FixedWindowRateLimiter;
    static createTokenBucket(capacity: number, refillRate: number, enableLogging?: boolean): TokenBucketRateLimiter;
}
export declare const RateLimiterPresets: {
    readonly api: {
        readonly windowMs: number;
        readonly maxRequests: 100;
    };
    readonly strict: {
        readonly windowMs: number;
        readonly maxRequests: 10;
    };
    readonly generous: {
        readonly windowMs: number;
        readonly maxRequests: 1000;
    };
    readonly perSecond: {
        readonly windowMs: 1000;
        readonly maxRequests: 10;
    };
    readonly perHour: {
        readonly windowMs: number;
        readonly maxRequests: 1000;
    };
};
//# sourceMappingURL=rate-limiter.d.ts.map