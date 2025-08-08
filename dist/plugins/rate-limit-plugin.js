"use strict";
/**
 * Rate limiting plugin for ADK JavaScript
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateLimitPlugin = void 0;
const base_plugin_1 = require("./base-plugin");
const constants_1 = require("./constants");
/**
 * Plugin that provides rate limiting capabilities for tools, models, and agents
 */
class RateLimitPlugin extends base_plugin_1.BasePlugin {
    constructor(config = {}) {
        const fullConfig = {
            name: 'rate-limit-plugin',
            version: '1.0.0',
            description: 'Provides rate limiting capabilities for tools, models, and agents',
            priority: constants_1.PLUGIN_PRIORITIES.HIGH,
            hooks: [
                'before_tool',
                'before_model',
                'before_agent',
                'after_tool',
                'after_model',
                'after_agent'
            ],
            settings: {
                enableToolRateLimit: true,
                enableModelRateLimit: true,
                enableAgentRateLimit: true,
                defaultRateLimit: {
                    requests: 100,
                    window: 60000, // 1 minute
                    burst: 10,
                    strategy: 'sliding',
                    backoffStrategy: 'exponential',
                    backoffMultiplier: 2,
                    maxBackoffDelay: 300000, // 5 minutes
                    warningThreshold: 80,
                    resetOnSuccess: true
                },
                rateLimitRules: {},
                burstAllowance: 5,
                slidingWindowEnabled: true,
                distributedMode: false,
                ...config.settings
            },
            ...config
        };
        super(fullConfig);
        this.rateLimitStates = new Map();
        const settings = fullConfig.settings;
        this.enableToolRateLimit = settings.enableToolRateLimit;
        this.enableModelRateLimit = settings.enableModelRateLimit;
        this.enableAgentRateLimit = settings.enableAgentRateLimit;
        this.defaultRateLimit = settings.defaultRateLimit;
        this.rateLimitRules = settings.rateLimitRules;
        this.globalRateLimit = settings.globalRateLimit;
        this.burstAllowance = settings.burstAllowance;
        this.slidingWindowEnabled = settings.slidingWindowEnabled;
        this.distributedMode = settings.distributedMode;
        this.redisConfig = settings.redisConfig;
        this.onRateLimitExceeded = settings.onRateLimitExceeded;
        this.onRateLimitWarning = settings.onRateLimitWarning;
        this.rateLimitStats = {
            totalRequests: 0,
            allowedRequests: 0,
            blockedRequests: 0,
            averageRequestRate: 0,
            peakRequestRate: 0,
            currentBackoffCount: 0,
            violationsByRule: {},
            lastViolationTime: undefined
        };
    }
    async onInitialize() {
        this.log('info', 'Rate limit plugin initialized');
        // Initialize Redis client if distributed mode is enabled
        if (this.distributedMode && this.redisConfig) {
            await this.initializeRedisClient();
        }
        // Initialize global rate limit state
        if (this.globalRateLimit) {
            this.initializeRateLimitState('global', this.globalRateLimit);
        }
    }
    async onDestroy() {
        this.log('info', 'Rate limit plugin destroyed');
        // Close Redis connection
        if (this.redisClient) {
            await this.redisClient.quit();
        }
        // Log final statistics
        this.log('info', 'Final rate limit statistics:', this.rateLimitStats);
    }
    async beforeToolCallback(context) {
        if (!this.enableToolRateLimit) {
            return context;
        }
        const rateKey = `tool_${context.toolName}`;
        const rule = this.rateLimitRules.tools?.[context.toolName] || this.defaultRateLimit;
        const result = await this.checkRateLimit(rateKey, rule, context);
        if (!result.allowed) {
            context.rateLimitBlocked = true;
            context.rateLimitResult = result;
            if (this.onRateLimitExceeded) {
                this.onRateLimitExceeded(context, rule);
            }
            this.log('warn', `Rate limit exceeded for tool '${context.toolName}': ${result.reason}`);
            // Set error to block execution
            context.error = new Error(`Rate limit exceeded: ${result.reason}. Retry after ${result.retryAfter}ms`);
        }
        else {
            // Check for warning threshold
            const warningThreshold = rule.warningThreshold || 80;
            const usagePercentage = ((rule.requests - result.remaining) / rule.requests) * 100;
            if (usagePercentage >= warningThreshold && this.onRateLimitWarning) {
                this.onRateLimitWarning(context, rule, result.remaining);
            }
        }
        return context;
    }
    async beforeModelCallback(context) {
        if (!this.enableModelRateLimit) {
            return context;
        }
        const rateKey = `model_${context.modelName}`;
        const rule = this.rateLimitRules.models?.[context.modelName] || this.defaultRateLimit;
        const result = await this.checkRateLimit(rateKey, rule, context);
        if (!result.allowed) {
            context.rateLimitBlocked = true;
            context.rateLimitResult = result;
            if (this.onRateLimitExceeded) {
                this.onRateLimitExceeded(context, rule);
            }
            this.log('warn', `Rate limit exceeded for model '${context.modelName}': ${result.reason}`);
            // Set error to block execution
            context.error = new Error(`Rate limit exceeded: ${result.reason}. Retry after ${result.retryAfter}ms`);
        }
        else {
            // Check for warning threshold
            const warningThreshold = rule.warningThreshold || 80;
            const usagePercentage = ((rule.requests - result.remaining) / rule.requests) * 100;
            if (usagePercentage >= warningThreshold && this.onRateLimitWarning) {
                this.onRateLimitWarning(context, rule, result.remaining);
            }
        }
        return context;
    }
    async beforeAgentCallback(context) {
        if (!this.enableAgentRateLimit) {
            return context;
        }
        const rateKey = `agent_${context.agentName}`;
        const rule = this.rateLimitRules.agents?.[context.agentName] || this.defaultRateLimit;
        const result = await this.checkRateLimit(rateKey, rule, context);
        if (!result.allowed) {
            context.rateLimitBlocked = true;
            context.rateLimitResult = result;
            if (this.onRateLimitExceeded) {
                this.onRateLimitExceeded(context, rule);
            }
            this.log('warn', `Rate limit exceeded for agent '${context.agentName}': ${result.reason}`);
            // Set error to block execution
            context.error = new Error(`Rate limit exceeded: ${result.reason}. Retry after ${result.retryAfter}ms`);
        }
        else {
            // Check for warning threshold
            const warningThreshold = rule.warningThreshold || 80;
            const usagePercentage = ((rule.requests - result.remaining) / rule.requests) * 100;
            if (usagePercentage >= warningThreshold && this.onRateLimitWarning) {
                this.onRateLimitWarning(context, rule, result.remaining);
            }
        }
        return context;
    }
    async afterToolCallback(context) {
        if (!this.enableToolRateLimit || context.rateLimitBlocked) {
            return context;
        }
        const rateKey = `tool_${context.toolName}`;
        const rule = this.rateLimitRules.tools?.[context.toolName] || this.defaultRateLimit;
        // Record successful request
        await this.recordRequest(rateKey, rule, !context.error);
        return context;
    }
    async afterModelCallback(context) {
        if (!this.enableModelRateLimit || context.rateLimitBlocked) {
            return context;
        }
        const rateKey = `model_${context.modelName}`;
        const rule = this.rateLimitRules.models?.[context.modelName] || this.defaultRateLimit;
        // Record successful request
        await this.recordRequest(rateKey, rule, !context.error);
        return context;
    }
    async afterAgentCallback(context) {
        if (!this.enableAgentRateLimit || context.rateLimitBlocked) {
            return context;
        }
        const rateKey = `agent_${context.agentName}`;
        const rule = this.rateLimitRules.agents?.[context.agentName] || this.defaultRateLimit;
        // Record successful request
        await this.recordRequest(rateKey, rule, !context.error);
        return context;
    }
    /**
     * Check if request is allowed under rate limit
     */
    async checkRateLimit(key, rule, context) {
        // Check global rate limit first
        if (this.globalRateLimit) {
            const globalResult = await this.checkRateLimitRule('global', this.globalRateLimit);
            if (!globalResult.allowed) {
                return globalResult;
            }
        }
        // Check specific rate limit
        return await this.checkRateLimitRule(key, rule);
    }
    /**
     * Check rate limit for a specific rule
     */
    async checkRateLimitRule(key, rule) {
        if (!rule.enabled && rule.enabled !== undefined) {
            return {
                allowed: true,
                remaining: rule.requests,
                resetTime: Date.now() + rule.window,
                rule
            };
        }
        const now = Date.now();
        let state = await this.getRateLimitState(key);
        if (!state) {
            state = this.initializeRateLimitState(key, rule);
        }
        // Check if in backoff period
        if (state.backoffUntil && now < state.backoffUntil) {
            this.rateLimitStats.blockedRequests++;
            this.rateLimitStats.violationsByRule[key] = (this.rateLimitStats.violationsByRule[key] || 0) + 1;
            return {
                allowed: false,
                remaining: 0,
                resetTime: state.backoffUntil,
                retryAfter: state.backoffUntil - now,
                rule,
                reason: 'Backoff period active'
            };
        }
        let allowed = false;
        let remaining = 0;
        let resetTime = now + rule.window;
        switch (rule.strategy) {
            case 'fixed':
                ({ allowed, remaining, resetTime } = this.checkFixedWindow(state, rule, now));
                break;
            case 'sliding':
                ({ allowed, remaining, resetTime } = this.checkSlidingWindow(state, rule, now));
                break;
            case 'token_bucket':
                ({ allowed, remaining, resetTime } = this.checkTokenBucket(state, rule, now));
                break;
            case 'leaky_bucket':
                ({ allowed, remaining, resetTime } = this.checkLeakyBucket(state, rule, now));
                break;
            default:
                ({ allowed, remaining, resetTime } = this.checkSlidingWindow(state, rule, now));
        }
        if (allowed) {
            this.rateLimitStats.allowedRequests++;
            // Reset consecutive violations on success
            if (rule.resetOnSuccess) {
                state.consecutiveViolations = 0;
                state.backoffUntil = undefined;
            }
        }
        else {
            this.rateLimitStats.blockedRequests++;
            this.rateLimitStats.violationsByRule[key] = (this.rateLimitStats.violationsByRule[key] || 0) + 1;
            this.rateLimitStats.lastViolationTime = now;
            // Apply backoff strategy
            this.applyBackoffStrategy(state, rule, now);
        }
        this.rateLimitStats.totalRequests++;
        // Update state
        await this.setRateLimitState(key, state);
        return {
            allowed,
            remaining,
            resetTime,
            retryAfter: allowed ? undefined : resetTime - now,
            rule,
            reason: allowed ? undefined : 'Rate limit exceeded'
        };
    }
    /**
     * Check fixed window rate limit
     */
    checkFixedWindow(state, rule, now) {
        // Reset window if expired
        if (now >= state.windowStart + rule.window) {
            state.windowStart = now;
            state.requests = 0;
        }
        const allowed = state.requests < rule.requests;
        const remaining = Math.max(0, rule.requests - state.requests - (allowed ? 1 : 0));
        const resetTime = state.windowStart + rule.window;
        if (allowed) {
            state.requests++;
            state.lastRequest = now;
        }
        return { allowed, remaining, resetTime };
    }
    /**
     * Check sliding window rate limit
     */
    checkSlidingWindow(state, rule, now) {
        // For simplicity, using a basic sliding window implementation
        // In production, you might want to use a more sophisticated approach
        const windowStart = now - rule.window;
        // Reset if outside window
        if (state.windowStart < windowStart) {
            state.windowStart = now;
            state.requests = 0;
        }
        const allowed = state.requests < rule.requests;
        const remaining = Math.max(0, rule.requests - state.requests - (allowed ? 1 : 0));
        const resetTime = now + rule.window;
        if (allowed) {
            state.requests++;
            state.lastRequest = now;
        }
        return { allowed, remaining, resetTime };
    }
    /**
     * Check token bucket rate limit
     */
    checkTokenBucket(state, rule, now) {
        // Refill tokens based on time elapsed
        const timeSinceLastRefill = now - state.lastRefill;
        const tokensToAdd = Math.floor(timeSinceLastRefill / rule.window * rule.requests);
        state.tokens = Math.min(rule.requests, state.tokens + tokensToAdd);
        state.lastRefill = now;
        const allowed = state.tokens > 0;
        const remaining = state.tokens - (allowed ? 1 : 0);
        const resetTime = now + (rule.window / rule.requests); // Time to next token
        if (allowed) {
            state.tokens--;
            state.lastRequest = now;
        }
        return { allowed, remaining, resetTime };
    }
    /**
     * Check leaky bucket rate limit
     */
    checkLeakyBucket(state, rule, now) {
        // Leak tokens based on time elapsed
        const timeSinceLastRequest = now - state.lastRequest;
        const tokensToLeak = Math.floor(timeSinceLastRequest / (rule.window / rule.requests));
        state.tokens = Math.max(0, state.tokens - tokensToLeak);
        const allowed = state.tokens < rule.requests;
        const remaining = Math.max(0, rule.requests - state.tokens - (allowed ? 1 : 0));
        const resetTime = now + (rule.window / rule.requests); // Time for next leak
        if (allowed) {
            state.tokens++;
            state.lastRequest = now;
        }
        return { allowed, remaining, resetTime };
    }
    /**
     * Apply backoff strategy
     */
    applyBackoffStrategy(state, rule, now) {
        if (rule.backoffStrategy === 'none') {
            return;
        }
        state.consecutiveViolations++;
        let backoffDelay = 0;
        const multiplier = rule.backoffMultiplier || 2;
        const maxDelay = rule.maxBackoffDelay || 300000; // 5 minutes
        switch (rule.backoffStrategy) {
            case 'linear':
                backoffDelay = state.consecutiveViolations * rule.window;
                break;
            case 'exponential':
                backoffDelay = rule.window * Math.pow(multiplier, state.consecutiveViolations - 1);
                break;
        }
        backoffDelay = Math.min(backoffDelay, maxDelay);
        state.backoffUntil = now + backoffDelay;
        this.rateLimitStats.currentBackoffCount++;
        this.log('warn', `Backoff applied: ${backoffDelay}ms for ${state.consecutiveViolations} consecutive violations`);
    }
    /**
     * Record a request
     */
    async recordRequest(key, rule, success) {
        // Update statistics
        this.updateRequestRateStats();
        // If using distributed mode, sync with Redis
        if (this.distributedMode && this.redisClient) {
            await this.syncWithRedis(key);
        }
    }
    /**
     * Get rate limit state
     */
    async getRateLimitState(key) {
        if (this.distributedMode && this.redisClient) {
            return await this.getRateLimitStateFromRedis(key);
        }
        return this.rateLimitStates.get(key) || null;
    }
    /**
     * Set rate limit state
     */
    async setRateLimitState(key, state) {
        if (this.distributedMode && this.redisClient) {
            await this.setRateLimitStateToRedis(key, state);
        }
        else {
            this.rateLimitStates.set(key, state);
        }
    }
    /**
     * Initialize rate limit state
     */
    initializeRateLimitState(key, rule) {
        const now = Date.now();
        const state = {
            requests: 0,
            windowStart: now,
            lastRequest: now,
            tokens: rule.requests, // Start with full tokens for token bucket
            lastRefill: now,
            consecutiveViolations: 0
        };
        this.rateLimitStates.set(key, state);
        return state;
    }
    /**
     * Initialize Redis client
     */
    async initializeRedisClient() {
        try {
            // Note: In a real implementation, you would import and use a Redis client library
            // For this example, we'll just log that Redis would be initialized
            this.log('info', 'Redis client would be initialized here for distributed rate limiting');
            // Example Redis client initialization:
            // const Redis = require('ioredis');
            // this.redisClient = new Redis(this.redisConfig);
        }
        catch (error) {
            this.log('error', 'Failed to initialize Redis client:', error);
            throw error;
        }
    }
    /**
     * Get rate limit state from Redis
     */
    async getRateLimitStateFromRedis(key) {
        try {
            const redisKey = `${this.redisConfig?.keyPrefix || 'adk:ratelimit'}:${key}`;
            // const stateJson = await this.redisClient.get(redisKey);
            // return stateJson ? JSON.parse(stateJson) : null;
            // For now, return null as Redis is not actually implemented
            return null;
        }
        catch (error) {
            this.log('error', 'Failed to get rate limit state from Redis:', error);
            return null;
        }
    }
    /**
     * Set rate limit state to Redis
     */
    async setRateLimitStateToRedis(key, state) {
        try {
            const redisKey = `${this.redisConfig?.keyPrefix || 'adk:ratelimit'}:${key}`;
            // await this.redisClient.setex(redisKey, 3600, JSON.stringify(state)); // 1 hour TTL
            // For now, just log that state would be saved to Redis
            this.log('debug', `Rate limit state would be saved to Redis: ${redisKey}`);
        }
        catch (error) {
            this.log('error', 'Failed to set rate limit state to Redis:', error);
        }
    }
    /**
     * Sync with Redis
     */
    async syncWithRedis(key) {
        // Implementation for syncing local state with Redis
        // This would be used in distributed scenarios
    }
    /**
     * Update request rate statistics
     */
    updateRequestRateStats() {
        const now = Date.now();
        const windowSize = 60000; // 1 minute window for rate calculation
        // Calculate average request rate (simplified)
        if (this.rateLimitStats.totalRequests > 0) {
            this.rateLimitStats.averageRequestRate = this.rateLimitStats.totalRequests / (now / 1000 / 60); // requests per minute
        }
    }
    /**
     * Add rate limit rule
     */
    addRateLimitRule(type, name, rule) {
        if (!this.rateLimitRules[`${type}s`]) {
            this.rateLimitRules[`${type}s`] = {};
        }
        this.rateLimitRules[`${type}s`][name] = rule;
        this.log('info', `Rate limit rule added for ${type} '${name}'`);
    }
    /**
     * Remove rate limit rule
     */
    removeRateLimitRule(type, name) {
        const rules = this.rateLimitRules[`${type}s`];
        if (rules && rules[name]) {
            delete rules[name];
            this.log('info', `Rate limit rule removed for ${type} '${name}'`);
            return true;
        }
        return false;
    }
    /**
     * Update rate limit rule
     */
    updateRateLimitRule(type, name, updates) {
        const rules = this.rateLimitRules[`${type}s`];
        if (rules && rules[name]) {
            rules[name] = { ...rules[name], ...updates };
            this.log('info', `Rate limit rule updated for ${type} '${name}'`);
        }
    }
    /**
     * Get rate limit statistics
     */
    getRateLimitStats() {
        return { ...this.rateLimitStats };
    }
    /**
     * Get rate limit state for a key
     */
    async getRateLimitStateForKey(key) {
        return await this.getRateLimitState(key);
    }
    /**
     * Reset rate limit for a key
     */
    async resetRateLimit(key) {
        if (this.distributedMode && this.redisClient) {
            const redisKey = `${this.redisConfig?.keyPrefix || 'adk:ratelimit'}:${key}`;
            // await this.redisClient.del(redisKey);
        }
        else {
            this.rateLimitStates.delete(key);
        }
        this.log('info', `Rate limit reset for key: ${key}`);
    }
    /**
     * Reset all rate limits
     */
    async resetAllRateLimits() {
        if (this.distributedMode && this.redisClient) {
            const pattern = `${this.redisConfig?.keyPrefix || 'adk:ratelimit'}:*`;
            // const keys = await this.redisClient.keys(pattern);
            // if (keys.length > 0) {
            //   await this.redisClient.del(...keys);
            // }
        }
        else {
            this.rateLimitStates.clear();
        }
        this.log('info', 'All rate limits reset');
    }
    /**
     * Reset rate limit statistics
     */
    resetRateLimitStats() {
        this.rateLimitStats = {
            totalRequests: 0,
            allowedRequests: 0,
            blockedRequests: 0,
            averageRequestRate: 0,
            peakRequestRate: 0,
            currentBackoffCount: 0,
            violationsByRule: {},
            lastViolationTime: undefined
        };
        this.log('info', 'Rate limit statistics reset');
    }
    /**
     * Update rate limit configuration
     */
    updateRateLimitConfig(updates) {
        const currentSettings = this.config.settings || {};
        const newSettings = { ...currentSettings, ...updates };
        this.updateConfig({ settings: newSettings });
        // Update internal properties
        if (updates.enableToolRateLimit !== undefined)
            this.enableToolRateLimit = updates.enableToolRateLimit;
        if (updates.enableModelRateLimit !== undefined)
            this.enableModelRateLimit = updates.enableModelRateLimit;
        if (updates.enableAgentRateLimit !== undefined)
            this.enableAgentRateLimit = updates.enableAgentRateLimit;
        if (updates.defaultRateLimit)
            this.defaultRateLimit = { ...this.defaultRateLimit, ...updates.defaultRateLimit };
        if (updates.globalRateLimit)
            this.globalRateLimit = updates.globalRateLimit;
        if (updates.burstAllowance)
            this.burstAllowance = updates.burstAllowance;
        if (updates.slidingWindowEnabled !== undefined)
            this.slidingWindowEnabled = updates.slidingWindowEnabled;
        if (updates.distributedMode !== undefined)
            this.distributedMode = updates.distributedMode;
        this.log('info', 'Rate limit configuration updated', updates);
    }
    async performHealthCheck() {
        const stats = this.getRateLimitStats();
        return {
            rateLimitEnabled: {
                tool: this.enableToolRateLimit,
                model: this.enableModelRateLimit,
                agent: this.enableAgentRateLimit
            },
            configuration: {
                defaultRateLimit: this.defaultRateLimit,
                globalRateLimit: this.globalRateLimit,
                burstAllowance: this.burstAllowance,
                slidingWindowEnabled: this.slidingWindowEnabled,
                distributedMode: this.distributedMode
            },
            statistics: stats,
            activeRateLimits: {
                total: this.rateLimitStates.size,
                keys: Array.from(this.rateLimitStates.keys())
            },
            rateLimitRules: {
                tools: Object.keys(this.rateLimitRules.tools || {}).length,
                models: Object.keys(this.rateLimitRules.models || {}).length,
                agents: Object.keys(this.rateLimitRules.agents || {}).length
            },
            redis: {
                enabled: this.distributedMode,
                connected: this.redisClient ? true : false
            }
        };
    }
}
exports.RateLimitPlugin = RateLimitPlugin;
//# sourceMappingURL=rate-limit-plugin.js.map