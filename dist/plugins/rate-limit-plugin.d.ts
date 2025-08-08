/**
 * Rate limiting plugin for ADK JavaScript
 */
import { BasePlugin } from './base-plugin';
import { PluginConfig, ToolContext, ModelContext, AgentContext } from './types';
export interface RateLimitPluginConfig extends PluginConfig {
    settings?: {
        enableToolRateLimit?: boolean;
        enableModelRateLimit?: boolean;
        enableAgentRateLimit?: boolean;
        defaultRateLimit?: RateLimitRule;
        rateLimitRules?: RateLimitRules;
        globalRateLimit?: RateLimitRule;
        burstAllowance?: number;
        slidingWindowEnabled?: boolean;
        distributedMode?: boolean;
        redisConfig?: RedisConfig;
        onRateLimitExceeded?: (context: any, rule: RateLimitRule) => void;
        onRateLimitWarning?: (context: any, rule: RateLimitRule, remaining: number) => void;
    };
}
export interface RateLimitRule {
    requests: number;
    window: number;
    burst?: number;
    priority?: number;
    enabled?: boolean;
    strategy?: 'fixed' | 'sliding' | 'token_bucket' | 'leaky_bucket';
    backoffStrategy?: 'none' | 'linear' | 'exponential';
    backoffMultiplier?: number;
    maxBackoffDelay?: number;
    warningThreshold?: number;
    resetOnSuccess?: boolean;
}
export interface RateLimitRules {
    tools?: Record<string, RateLimitRule>;
    models?: Record<string, RateLimitRule>;
    agents?: Record<string, RateLimitRule>;
    global?: RateLimitRule;
}
export interface RedisConfig {
    host: string;
    port: number;
    password?: string;
    database?: number;
    keyPrefix?: string;
}
export interface RateLimitState {
    requests: number;
    windowStart: number;
    lastRequest: number;
    tokens: number;
    lastRefill: number;
    backoffUntil?: number;
    consecutiveViolations: number;
}
export interface RateLimitStats {
    totalRequests: number;
    allowedRequests: number;
    blockedRequests: number;
    averageRequestRate: number;
    peakRequestRate: number;
    currentBackoffCount: number;
    violationsByRule: Record<string, number>;
    lastViolationTime?: number;
}
export interface RateLimitResult {
    allowed: boolean;
    remaining: number;
    resetTime: number;
    retryAfter?: number;
    rule: RateLimitRule;
    reason?: string;
}
/**
 * Plugin that provides rate limiting capabilities for tools, models, and agents
 */
export declare class RateLimitPlugin extends BasePlugin {
    private enableToolRateLimit;
    private enableModelRateLimit;
    private enableAgentRateLimit;
    private defaultRateLimit;
    private rateLimitRules;
    private globalRateLimit?;
    private burstAllowance;
    private slidingWindowEnabled;
    private distributedMode;
    private redisConfig?;
    private onRateLimitExceeded?;
    private onRateLimitWarning?;
    private rateLimitStates;
    private rateLimitStats;
    private redisClient?;
    constructor(config?: Partial<RateLimitPluginConfig>);
    protected onInitialize(): Promise<void>;
    protected onDestroy(): Promise<void>;
    beforeToolCallback(context: ToolContext): Promise<ToolContext>;
    beforeModelCallback(context: ModelContext): Promise<ModelContext>;
    beforeAgentCallback(context: AgentContext): Promise<AgentContext>;
    afterToolCallback(context: ToolContext): Promise<ToolContext>;
    afterModelCallback(context: ModelContext): Promise<ModelContext>;
    afterAgentCallback(context: AgentContext): Promise<AgentContext>;
    /**
     * Check if request is allowed under rate limit
     */
    private checkRateLimit;
    /**
     * Check rate limit for a specific rule
     */
    private checkRateLimitRule;
    /**
     * Check fixed window rate limit
     */
    private checkFixedWindow;
    /**
     * Check sliding window rate limit
     */
    private checkSlidingWindow;
    /**
     * Check token bucket rate limit
     */
    private checkTokenBucket;
    /**
     * Check leaky bucket rate limit
     */
    private checkLeakyBucket;
    /**
     * Apply backoff strategy
     */
    private applyBackoffStrategy;
    /**
     * Record a request
     */
    private recordRequest;
    /**
     * Get rate limit state
     */
    private getRateLimitState;
    /**
     * Set rate limit state
     */
    private setRateLimitState;
    /**
     * Initialize rate limit state
     */
    private initializeRateLimitState;
    /**
     * Initialize Redis client
     */
    private initializeRedisClient;
    /**
     * Get rate limit state from Redis
     */
    private getRateLimitStateFromRedis;
    /**
     * Set rate limit state to Redis
     */
    private setRateLimitStateToRedis;
    /**
     * Sync with Redis
     */
    private syncWithRedis;
    /**
     * Update request rate statistics
     */
    private updateRequestRateStats;
    /**
     * Add rate limit rule
     */
    addRateLimitRule(type: 'tool' | 'model' | 'agent', name: string, rule: RateLimitRule): void;
    /**
     * Remove rate limit rule
     */
    removeRateLimitRule(type: 'tool' | 'model' | 'agent', name: string): boolean;
    /**
     * Update rate limit rule
     */
    updateRateLimitRule(type: 'tool' | 'model' | 'agent', name: string, updates: Partial<RateLimitRule>): void;
    /**
     * Get rate limit statistics
     */
    getRateLimitStats(): RateLimitStats;
    /**
     * Get rate limit state for a key
     */
    getRateLimitStateForKey(key: string): Promise<RateLimitState | null>;
    /**
     * Reset rate limit for a key
     */
    resetRateLimit(key: string): Promise<void>;
    /**
     * Reset all rate limits
     */
    resetAllRateLimits(): Promise<void>;
    /**
     * Reset rate limit statistics
     */
    resetRateLimitStats(): void;
    /**
     * Update rate limit configuration
     */
    updateRateLimitConfig(updates: Partial<RateLimitPluginConfig['settings']>): void;
    protected performHealthCheck(): Promise<Record<string, any>>;
}
//# sourceMappingURL=rate-limit-plugin.d.ts.map