"use strict";
/**
 * Retry plugin for ADK JavaScript
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.RetryPlugin = void 0;
const base_plugin_1 = require("./base-plugin");
const constants_1 = require("./constants");
/**
 * Plugin that provides retry capabilities for tools, models, and agents
 */
class RetryPlugin extends base_plugin_1.BasePlugin {
    constructor(config = {}) {
        const fullConfig = {
            name: 'retry-plugin',
            version: '1.0.0',
            description: 'Provides retry capabilities for tools, models, and agents',
            priority: constants_1.PLUGIN_PRIORITIES.HIGH,
            hooks: [
                'on_tool_error',
                'on_model_error',
                'on_agent_error'
            ],
            settings: {
                enableToolRetry: true,
                enableModelRetry: true,
                enableAgentRetry: true,
                defaultMaxRetries: 3,
                defaultRetryDelay: 1000, // 1 second
                retryStrategy: 'exponential',
                exponentialBase: 2,
                exponentialMultiplier: 1000,
                maxRetryDelay: 30000, // 30 seconds
                jitterEnabled: true,
                jitterRange: 0.1, // 10%
                retryableErrors: [
                    'NetworkError',
                    'TimeoutError',
                    'RateLimitError',
                    'ServiceUnavailableError',
                    'InternalServerError',
                    'BadGatewayError',
                    'GatewayTimeoutError'
                ],
                nonRetryableErrors: [
                    'AuthenticationError',
                    'AuthorizationError',
                    'ValidationError',
                    'NotFoundError',
                    'BadRequestError'
                ],
                retryConditions: [],
                circuitBreakerEnabled: true,
                circuitBreakerThreshold: 5,
                circuitBreakerTimeout: 60000, // 1 minute
                retryRules: {},
                ...config.settings
            },
            ...config
        };
        super(fullConfig);
        this.retryAttempts = new Map();
        this.circuitBreakers = new Map();
        const settings = fullConfig.settings;
        this.enableToolRetry = settings.enableToolRetry;
        this.enableModelRetry = settings.enableModelRetry;
        this.enableAgentRetry = settings.enableAgentRetry;
        this.defaultMaxRetries = settings.defaultMaxRetries;
        this.defaultRetryDelay = settings.defaultRetryDelay;
        this.retryStrategy = settings.retryStrategy;
        this.exponentialBase = settings.exponentialBase;
        this.exponentialMultiplier = settings.exponentialMultiplier;
        this.maxRetryDelay = settings.maxRetryDelay;
        this.jitterEnabled = settings.jitterEnabled;
        this.jitterRange = settings.jitterRange;
        this.retryableErrors = new Set(settings.retryableErrors);
        this.nonRetryableErrors = new Set(settings.nonRetryableErrors);
        this.retryConditions = new Map();
        this.circuitBreakerEnabled = settings.circuitBreakerEnabled;
        this.circuitBreakerThreshold = settings.circuitBreakerThreshold;
        this.circuitBreakerTimeout = settings.circuitBreakerTimeout;
        this.retryRules = settings.retryRules;
        this.onRetryCallback = settings.onRetryCallback;
        this.onMaxRetriesReached = settings.onMaxRetriesReached;
        // Initialize retry conditions
        for (const condition of settings.retryConditions) {
            this.retryConditions.set(condition.name, condition);
        }
        this.retryStats = {
            totalRetries: 0,
            successfulRetries: 0,
            failedRetries: 0,
            maxRetriesReached: 0,
            averageRetryDelay: 0,
            retrySuccessRate: 0,
            circuitBreakerTrips: 0
        };
    }
    async onInitialize() {
        this.log('info', 'Retry plugin initialized');
        // Register built-in retry conditions
        this.registerBuiltInRetryConditions();
    }
    async onDestroy() {
        this.log('info', 'Retry plugin destroyed');
        // Log final statistics
        this.log('info', 'Final retry statistics:', this.retryStats);
    }
    async onToolErrorCallback(context) {
        if (!this.enableToolRetry || !context.error) {
            return context;
        }
        const retryKey = `tool_${context.toolName}`;
        const retryRule = this.retryRules.tools?.[context.toolName] || {};
        // Check circuit breaker
        if (this.circuitBreakerEnabled && this.isCircuitBreakerOpen(retryKey)) {
            this.log('warn', `Circuit breaker is open for tool: ${context.toolName}`);
            return context;
        }
        const shouldRetry = await this.shouldRetryError(context.error, context, retryRule);
        if (!shouldRetry) {
            return context;
        }
        const maxRetries = retryRule.maxRetries ?? this.defaultMaxRetries;
        const currentAttempt = context.retryCount || 0;
        if (currentAttempt >= maxRetries) {
            this.handleMaxRetriesReached(context, context.error);
            return context;
        }
        // Calculate retry delay
        const delay = this.calculateRetryDelay(currentAttempt, retryRule);
        // Record retry attempt
        this.recordRetryAttempt(retryKey, currentAttempt + 1, context.error, delay, context);
        // Execute retry callback
        if (this.onRetryCallback) {
            this.onRetryCallback(context, currentAttempt + 1, context.error);
        }
        this.log('info', `Retrying tool '${context.toolName}' (attempt ${currentAttempt + 1}/${maxRetries}) after ${delay}ms`);
        // Wait for retry delay
        await this.sleep(delay);
        // Update context for retry
        context.retryCount = currentAttempt + 1;
        context.shouldRetry = true;
        // Clear error to allow retry
        delete context.error;
        this.retryStats.totalRetries++;
        return context;
    }
    async onModelErrorCallback(context) {
        if (!this.enableModelRetry || !context.error) {
            return context;
        }
        const retryKey = `model_${context.modelName}`;
        const retryRule = this.retryRules.models?.[context.modelName] || {};
        // Check circuit breaker
        if (this.circuitBreakerEnabled && this.isCircuitBreakerOpen(retryKey)) {
            this.log('warn', `Circuit breaker is open for model: ${context.modelName}`);
            return context;
        }
        const shouldRetry = await this.shouldRetryError(context.error, context, retryRule);
        if (!shouldRetry) {
            return context;
        }
        const maxRetries = retryRule.maxRetries ?? this.defaultMaxRetries;
        const currentAttempt = context.retryCount || 0;
        if (currentAttempt >= maxRetries) {
            this.handleMaxRetriesReached(context, context.error);
            return context;
        }
        // Special handling for rate limit errors
        let delay = this.calculateRetryDelay(currentAttempt, retryRule);
        if (this.isRateLimitError(context.error) && retryRule.rateLimitRetry !== false) {
            delay = this.calculateRateLimitDelay(context.error, delay);
        }
        // Record retry attempt
        this.recordRetryAttempt(retryKey, currentAttempt + 1, context.error, delay, context);
        // Execute retry callback
        if (this.onRetryCallback) {
            this.onRetryCallback(context, currentAttempt + 1, context.error);
        }
        this.log('info', `Retrying model '${context.modelName}' (attempt ${currentAttempt + 1}/${maxRetries}) after ${delay}ms`);
        // Wait for retry delay
        await this.sleep(delay);
        // Update context for retry
        context.retryCount = currentAttempt + 1;
        context.shouldRetry = true;
        // Clear error to allow retry
        delete context.error;
        this.retryStats.totalRetries++;
        return context;
    }
    async onAgentErrorCallback(context) {
        if (!this.enableAgentRetry || !context.error) {
            return context;
        }
        const retryKey = `agent_${context.agentName}`;
        const retryRule = this.retryRules.agents?.[context.agentName] || {};
        // Check circuit breaker
        if (this.circuitBreakerEnabled && this.isCircuitBreakerOpen(retryKey)) {
            this.log('warn', `Circuit breaker is open for agent: ${context.agentName}`);
            return context;
        }
        const shouldRetry = await this.shouldRetryError(context.error, context, retryRule);
        if (!shouldRetry) {
            return context;
        }
        const maxRetries = retryRule.maxRetries ?? this.defaultMaxRetries;
        const currentAttempt = context.retryCount || 0;
        if (currentAttempt >= maxRetries) {
            this.handleMaxRetriesReached(context, context.error);
            return context;
        }
        // Calculate retry delay
        const delay = this.calculateRetryDelay(currentAttempt, retryRule);
        // Record retry attempt
        this.recordRetryAttempt(retryKey, currentAttempt + 1, context.error, delay, context);
        // Execute retry callback
        if (this.onRetryCallback) {
            this.onRetryCallback(context, currentAttempt + 1, context.error);
        }
        this.log('info', `Retrying agent '${context.agentName}' (attempt ${currentAttempt + 1}/${maxRetries}) after ${delay}ms`);
        // Wait for retry delay
        await this.sleep(delay);
        // Update context for retry
        context.retryCount = currentAttempt + 1;
        context.shouldRetry = true;
        // Clear error to allow retry
        delete context.error;
        this.retryStats.totalRetries++;
        return context;
    }
    /**
     * Determine if an error should be retried
     */
    async shouldRetryError(error, context, retryRule) {
        // Check non-retryable errors first
        const nonRetryableErrors = retryRule.nonRetryableErrors || Array.from(this.nonRetryableErrors);
        if (nonRetryableErrors.some((errorType) => this.isErrorType(error, errorType))) {
            this.log('debug', `Error type '${error.name}' is non-retryable`);
            return false;
        }
        // Check retryable errors
        const retryableErrors = retryRule.retryableErrors || Array.from(this.retryableErrors);
        if (retryableErrors.some((errorType) => this.isErrorType(error, errorType))) {
            this.log('debug', `Error type '${error.name}' is retryable`);
            return true;
        }
        // Check custom retry conditions
        if (retryRule.customCondition) {
            const condition = this.retryConditions.get(retryRule.customCondition);
            if (condition) {
                const currentAttempt = context.retryCount || 0;
                return condition.condition(error, context, currentAttempt);
            }
        }
        // Check global retry conditions
        for (const condition of this.retryConditions.values()) {
            const currentAttempt = context.retryCount || 0;
            if (condition.condition(error, context, currentAttempt)) {
                this.log('debug', `Custom condition '${condition.name}' allows retry`);
                return true;
            }
        }
        // Default: don't retry unknown errors
        this.log('debug', `Error type '${error.name}' is not configured for retry`);
        return false;
    }
    /**
     * Check if error matches a specific type
     */
    isErrorType(error, errorType) {
        return error.name === errorType ||
            error.constructor.name === errorType ||
            error.message.includes(errorType);
    }
    /**
     * Check if error is a rate limit error
     */
    isRateLimitError(error) {
        return this.isErrorType(error, 'RateLimitError') ||
            error.message.toLowerCase().includes('rate limit') ||
            error.message.toLowerCase().includes('too many requests');
    }
    /**
     * Calculate retry delay
     */
    calculateRetryDelay(attempt, retryRule) {
        const strategy = retryRule.retryStrategy || this.retryStrategy;
        const baseDelay = retryRule.retryDelay || this.defaultRetryDelay;
        let delay;
        switch (strategy) {
            case 'fixed':
                delay = baseDelay;
                break;
            case 'linear':
                delay = baseDelay * (attempt + 1);
                break;
            case 'exponential':
                delay = this.exponentialMultiplier * Math.pow(this.exponentialBase, attempt);
                break;
            case 'custom':
                // For custom strategy, use the base delay as fallback
                delay = baseDelay;
                break;
            default:
                delay = baseDelay;
        }
        // Apply maximum delay limit
        delay = Math.min(delay, this.maxRetryDelay);
        // Apply jitter if enabled
        if (this.jitterEnabled) {
            const jitter = delay * this.jitterRange * (Math.random() - 0.5) * 2;
            delay = Math.max(0, delay + jitter);
        }
        return Math.round(delay);
    }
    /**
     * Calculate delay for rate limit errors
     */
    calculateRateLimitDelay(error, baseDelay) {
        // Try to extract retry-after header value from error message
        const retryAfterMatch = error.message.match(/retry[\s-]?after[:\s]*(\d+)/i);
        if (retryAfterMatch) {
            const retryAfter = parseInt(retryAfterMatch[1], 10) * 1000; // Convert to milliseconds
            return Math.min(retryAfter, this.maxRetryDelay);
        }
        // Use exponential backoff for rate limits
        return Math.min(baseDelay * 2, this.maxRetryDelay);
    }
    /**
     * Record retry attempt
     */
    recordRetryAttempt(key, attempt, error, delay, context) {
        if (!this.retryAttempts.has(key)) {
            this.retryAttempts.set(key, []);
        }
        const attempts = this.retryAttempts.get(key);
        attempts.push({
            attempt,
            timestamp: Date.now(),
            error,
            delay,
            context
        });
        // Keep only recent attempts (last 100)
        if (attempts.length > 100) {
            attempts.splice(0, attempts.length - 100);
        }
        // Update circuit breaker
        if (this.circuitBreakerEnabled) {
            this.updateCircuitBreaker(key, false);
        }
    }
    /**
     * Handle max retries reached
     */
    handleMaxRetriesReached(context, error) {
        this.retryStats.maxRetriesReached++;
        this.retryStats.failedRetries++;
        if (this.onMaxRetriesReached) {
            this.onMaxRetriesReached(context, error);
        }
        this.log('error', `Max retries reached for ${context.toolName || context.modelName || context.agentName}`, error);
    }
    /**
     * Check if circuit breaker is open
     */
    isCircuitBreakerOpen(key) {
        const state = this.circuitBreakers.get(key);
        if (!state) {
            return false;
        }
        if (state.isOpen) {
            // Check if timeout has passed
            if (Date.now() >= state.nextAttemptTime) {
                // Reset circuit breaker to half-open state
                state.isOpen = false;
                state.failureCount = 0;
                this.log('info', `Circuit breaker reset for ${key}`);
                return false;
            }
            return true;
        }
        return false;
    }
    /**
     * Update circuit breaker state
     */
    updateCircuitBreaker(key, success) {
        if (!this.circuitBreakers.has(key)) {
            this.circuitBreakers.set(key, {
                isOpen: false,
                failureCount: 0,
                lastFailureTime: 0,
                nextAttemptTime: 0
            });
        }
        const state = this.circuitBreakers.get(key);
        if (success) {
            // Reset on success
            state.failureCount = 0;
            state.isOpen = false;
        }
        else {
            // Increment failure count
            state.failureCount++;
            state.lastFailureTime = Date.now();
            // Open circuit breaker if threshold reached
            if (state.failureCount >= this.circuitBreakerThreshold) {
                state.isOpen = true;
                state.nextAttemptTime = Date.now() + this.circuitBreakerTimeout;
                this.retryStats.circuitBreakerTrips++;
                this.log('warn', `Circuit breaker opened for ${key} after ${state.failureCount} failures`);
            }
        }
    }
    /**
     * Sleep for specified milliseconds
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    /**
     * Register built-in retry conditions
     */
    registerBuiltInRetryConditions() {
        // Network-related errors
        this.retryConditions.set('network_errors', {
            name: 'network_errors',
            condition: (error) => {
                const networkErrors = ['NetworkError', 'TimeoutError', 'ConnectionError', 'DNSError'];
                return networkErrors.some(errorType => this.isErrorType(error, errorType));
            }
        });
        // Server errors (5xx)
        this.retryConditions.set('server_errors', {
            name: 'server_errors',
            condition: (error) => {
                const serverErrors = ['InternalServerError', 'BadGatewayError', 'ServiceUnavailableError', 'GatewayTimeoutError'];
                return serverErrors.some(errorType => this.isErrorType(error, errorType)) ||
                    /5\d{2}/.test(error.message);
            }
        });
        // Rate limit errors
        this.retryConditions.set('rate_limit_errors', {
            name: 'rate_limit_errors',
            condition: (error) => {
                return this.isRateLimitError(error);
            }
        });
        // Temporary errors
        this.retryConditions.set('temporary_errors', {
            name: 'temporary_errors',
            condition: (error) => {
                const temporaryKeywords = ['temporary', 'transient', 'unavailable', 'busy'];
                return temporaryKeywords.some(keyword => error.message.toLowerCase().includes(keyword));
            }
        });
    }
    /**
     * Add custom retry condition
     */
    addRetryCondition(condition) {
        this.retryConditions.set(condition.name, condition);
        this.log('info', `Custom retry condition '${condition.name}' added`);
    }
    /**
     * Remove retry condition
     */
    removeRetryCondition(name) {
        const removed = this.retryConditions.delete(name);
        if (removed) {
            this.log('info', `Retry condition '${name}' removed`);
        }
        return removed;
    }
    /**
     * Update retry rules
     */
    updateRetryRules(rules) {
        this.retryRules = { ...this.retryRules, ...rules };
        this.log('info', 'Retry rules updated');
    }
    /**
     * Get retry statistics
     */
    getRetryStats() {
        // Update success rate
        const totalAttempts = this.retryStats.successfulRetries + this.retryStats.failedRetries;
        this.retryStats.retrySuccessRate = totalAttempts > 0 ?
            this.retryStats.successfulRetries / totalAttempts : 0;
        return { ...this.retryStats };
    }
    /**
     * Get retry attempts for a specific key
     */
    getRetryAttempts(key) {
        return this.retryAttempts.get(key) || [];
    }
    /**
     * Get circuit breaker state
     */
    getCircuitBreakerState(key) {
        const state = this.circuitBreakers.get(key);
        return state ? { ...state } : null;
    }
    /**
     * Reset circuit breaker
     */
    resetCircuitBreaker(key) {
        const state = this.circuitBreakers.get(key);
        if (state) {
            state.isOpen = false;
            state.failureCount = 0;
            state.lastFailureTime = 0;
            state.nextAttemptTime = 0;
            this.log('info', `Circuit breaker manually reset for ${key}`);
        }
    }
    /**
     * Reset all circuit breakers
     */
    resetAllCircuitBreakers() {
        for (const [key, state] of this.circuitBreakers.entries()) {
            state.isOpen = false;
            state.failureCount = 0;
            state.lastFailureTime = 0;
            state.nextAttemptTime = 0;
        }
        this.log('info', 'All circuit breakers manually reset');
    }
    /**
     * Clear retry history
     */
    clearRetryHistory() {
        this.retryAttempts.clear();
        this.log('info', 'Retry history cleared');
    }
    /**
     * Reset retry statistics
     */
    resetRetryStats() {
        this.retryStats = {
            totalRetries: 0,
            successfulRetries: 0,
            failedRetries: 0,
            maxRetriesReached: 0,
            averageRetryDelay: 0,
            retrySuccessRate: 0,
            circuitBreakerTrips: 0
        };
        this.log('info', 'Retry statistics reset');
    }
    /**
     * Update retry configuration
     */
    updateRetryConfig(updates) {
        const currentSettings = this.config.settings || {};
        const newSettings = { ...currentSettings, ...updates };
        this.updateConfig({ settings: newSettings });
        // Update internal properties
        if (updates.enableToolRetry !== undefined)
            this.enableToolRetry = updates.enableToolRetry;
        if (updates.enableModelRetry !== undefined)
            this.enableModelRetry = updates.enableModelRetry;
        if (updates.enableAgentRetry !== undefined)
            this.enableAgentRetry = updates.enableAgentRetry;
        if (updates.defaultMaxRetries)
            this.defaultMaxRetries = updates.defaultMaxRetries;
        if (updates.defaultRetryDelay)
            this.defaultRetryDelay = updates.defaultRetryDelay;
        if (updates.retryStrategy)
            this.retryStrategy = updates.retryStrategy;
        if (updates.maxRetryDelay)
            this.maxRetryDelay = updates.maxRetryDelay;
        if (updates.circuitBreakerEnabled !== undefined)
            this.circuitBreakerEnabled = updates.circuitBreakerEnabled;
        if (updates.circuitBreakerThreshold)
            this.circuitBreakerThreshold = updates.circuitBreakerThreshold;
        if (updates.circuitBreakerTimeout)
            this.circuitBreakerTimeout = updates.circuitBreakerTimeout;
        this.log('info', 'Retry configuration updated', updates);
    }
    async performHealthCheck() {
        const stats = this.getRetryStats();
        return {
            retryEnabled: {
                tool: this.enableToolRetry,
                model: this.enableModelRetry,
                agent: this.enableAgentRetry
            },
            configuration: {
                defaultMaxRetries: this.defaultMaxRetries,
                defaultRetryDelay: this.defaultRetryDelay,
                retryStrategy: this.retryStrategy,
                maxRetryDelay: this.maxRetryDelay,
                jitterEnabled: this.jitterEnabled
            },
            circuitBreaker: {
                enabled: this.circuitBreakerEnabled,
                threshold: this.circuitBreakerThreshold,
                timeout: this.circuitBreakerTimeout,
                activeBreakers: Array.from(this.circuitBreakers.entries())
                    .filter(([_, state]) => state.isOpen)
                    .map(([key, _]) => key)
            },
            statistics: stats,
            retryConditions: Array.from(this.retryConditions.keys()),
            retryRules: {
                tools: Object.keys(this.retryRules.tools || {}).length,
                models: Object.keys(this.retryRules.models || {}).length,
                agents: Object.keys(this.retryRules.agents || {}).length
            }
        };
    }
}
exports.RetryPlugin = RetryPlugin;
//# sourceMappingURL=retry-plugin.js.map