"use strict";
/**
 * Retry utilities for handling failed operations
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.RetryPresets = exports.CircuitBreakerRetrier = exports.Retrier = exports.RetryConditions = exports.RetryStrategy = void 0;
exports.calculateDelay = calculateDelay;
exports.retry = retry;
exports.retryWithResult = retryWithResult;
exports.retryable = retryable;
/**
 * Retry strategies
 */
var RetryStrategy;
(function (RetryStrategy) {
    RetryStrategy["FIXED"] = "fixed";
    RetryStrategy["LINEAR"] = "linear";
    RetryStrategy["EXPONENTIAL"] = "exponential";
    RetryStrategy["FIBONACCI"] = "fibonacci";
})(RetryStrategy || (exports.RetryStrategy = RetryStrategy = {}));
/**
 * Default retry conditions
 */
exports.RetryConditions = {
    /**
     * Always retry (up to max attempts)
     */
    always: () => true,
    /**
     * Never retry
     */
    never: () => false,
    /**
     * Retry on network errors
     */
    networkErrors: (error) => {
        if (error?.code) {
            return ['ECONNRESET', 'ENOTFOUND', 'ECONNREFUSED', 'ETIMEDOUT'].includes(error.code);
        }
        if (error?.message) {
            return error.message.includes('network') || error.message.includes('timeout');
        }
        return false;
    },
    /**
     * Retry on HTTP 5xx errors
     */
    serverErrors: (error) => {
        const status = error?.response?.status || error?.status;
        return status >= 500 && status < 600;
    },
    /**
     * Retry on specific HTTP status codes
     */
    httpStatus: (codes) => (error) => {
        const status = error?.response?.status || error?.status;
        return codes.includes(status);
    },
    /**
     * Retry on specific error types
     */
    errorTypes: (types) => (error) => {
        return types.includes(error?.constructor?.name) || types.includes(error?.name);
    },
    /**
     * Combine multiple conditions with OR logic
     */
    or: (...conditions) => {
        return (error, attempt) => {
            return conditions.some(condition => condition(error, attempt));
        };
    },
    /**
     * Combine multiple conditions with AND logic
     */
    and: (...conditions) => {
        return (error, attempt) => {
            return conditions.every(condition => condition(error, attempt));
        };
    },
};
/**
 * Calculate delay based on strategy
 */
function calculateDelay(attempt, strategy, baseDelay, backoffFactor, maxDelay, jitter) {
    let delay;
    switch (strategy) {
        case RetryStrategy.FIXED:
            delay = baseDelay;
            break;
        case RetryStrategy.LINEAR:
            delay = baseDelay * attempt;
            break;
        case RetryStrategy.EXPONENTIAL:
            delay = baseDelay * Math.pow(backoffFactor, attempt - 1);
            break;
        case RetryStrategy.FIBONACCI:
            delay = baseDelay * fibonacci(attempt);
            break;
        default:
            delay = baseDelay;
    }
    // Apply maximum delay limit
    delay = Math.min(delay, maxDelay);
    // Add jitter if enabled
    if (jitter) {
        delay = delay * (0.5 + Math.random() * 0.5);
    }
    return Math.floor(delay);
}
/**
 * Calculate fibonacci number
 */
function fibonacci(n) {
    if (n <= 1)
        return 1;
    if (n === 2)
        return 1;
    let a = 1, b = 1;
    for (let i = 3; i <= n; i++) {
        [a, b] = [b, a + b];
    }
    return b;
}
/**
 * Sleep for specified milliseconds
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
/**
 * Retry function with configurable strategy
 */
async function retry(fn, config) {
    const { maxAttempts, baseDelay = 1000, maxDelay = 30000, backoffFactor = 2, jitter = true, retryCondition = exports.RetryConditions.always, onRetry, enableLogging = false, } = config;
    const attempts = [];
    const startTime = Date.now();
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            if (enableLogging && attempt > 1) {
                console.log(`[Retry] Attempt ${attempt}/${maxAttempts}`);
            }
            const result = await fn();
            if (enableLogging && attempt > 1) {
                console.log(`[Retry] Success on attempt ${attempt}`);
            }
            return result;
        }
        catch (error) {
            const shouldRetry = attempt < maxAttempts && retryCondition(error, attempt);
            if (!shouldRetry) {
                if (enableLogging) {
                    console.log(`[Retry] Failed after ${attempt} attempts:`, error);
                }
                throw error;
            }
            const delay = calculateDelay(attempt, RetryStrategy.EXPONENTIAL, baseDelay, backoffFactor, maxDelay, jitter);
            const attemptInfo = {
                attempt,
                error,
                delay,
                timestamp: Date.now(),
            };
            attempts.push(attemptInfo);
            if (enableLogging) {
                console.log(`[Retry] Attempt ${attempt} failed, retrying in ${delay}ms:`, error);
            }
            if (onRetry) {
                onRetry(error, attempt, delay);
            }
            await sleep(delay);
        }
    }
    // This should never be reached due to the logic above
    throw new Error('Retry logic error');
}
/**
 * Retry function with detailed result
 */
async function retryWithResult(fn, config) {
    const startTime = Date.now();
    let attempts = 0;
    let lastError;
    try {
        const result = await retry(async () => {
            attempts++;
            return await fn();
        }, {
            ...config,
            onRetry: (error, attempt, delay) => {
                lastError = error;
                config.onRetry?.(error, attempt, delay);
            },
        });
        return {
            success: true,
            result,
            attempts,
            totalTime: Date.now() - startTime,
        };
    }
    catch (error) {
        return {
            success: false,
            error: lastError || error,
            attempts,
            totalTime: Date.now() - startTime,
        };
    }
}
/**
 * Retry class for more advanced usage
 */
class Retrier {
    constructor(config) {
        this.attempts = [];
        this.config = {
            baseDelay: 1000,
            maxDelay: 30000,
            backoffFactor: 2,
            jitter: true,
            retryCondition: exports.RetryConditions.always,
            onRetry: () => { },
            enableLogging: false,
            ...config,
        };
    }
    /**
     * Execute function with retry logic
     */
    async execute(fn) {
        this.attempts = [];
        return await retry(fn, this.config);
    }
    /**
     * Execute with detailed result
     */
    async executeWithResult(fn) {
        this.attempts = [];
        return await retryWithResult(fn, this.config);
    }
    /**
     * Get retry attempts history
     */
    getAttempts() {
        return [...this.attempts];
    }
    /**
     * Update configuration
     */
    updateConfig(config) {
        this.config = { ...this.config, ...config };
    }
    /**
     * Reset attempts history
     */
    reset() {
        this.attempts = [];
    }
}
exports.Retrier = Retrier;
/**
 * Retry decorator for methods
 */
function retryable(config) {
    return function (target, propertyKey, descriptor) {
        const originalMethod = descriptor.value;
        descriptor.value = async function (...args) {
            return await retry(() => originalMethod.apply(this, args), config);
        };
        return descriptor;
    };
}
/**
 * Circuit breaker with retry
 */
class CircuitBreakerRetrier {
    constructor(failureThreshold, recoveryTimeout, retryConfig) {
        this.failureThreshold = failureThreshold;
        this.recoveryTimeout = recoveryTimeout;
        this.failures = 0;
        this.lastFailureTime = 0;
        this.state = 'CLOSED';
        this.retrier = new Retrier(retryConfig);
    }
    /**
     * Execute function with circuit breaker and retry
     */
    async execute(fn) {
        if (this.state === 'OPEN') {
            if (Date.now() - this.lastFailureTime > this.recoveryTimeout) {
                this.state = 'HALF_OPEN';
            }
            else {
                throw new Error('Circuit breaker is OPEN');
            }
        }
        try {
            const result = await this.retrier.execute(fn);
            this.onSuccess();
            return result;
        }
        catch (error) {
            this.onFailure();
            throw error;
        }
    }
    /**
     * Get current state
     */
    getState() {
        return this.state;
    }
    /**
     * Reset circuit breaker
     */
    reset() {
        this.failures = 0;
        this.lastFailureTime = 0;
        this.state = 'CLOSED';
        this.retrier.reset();
    }
    onSuccess() {
        this.failures = 0;
        this.state = 'CLOSED';
    }
    onFailure() {
        this.failures++;
        this.lastFailureTime = Date.now();
        if (this.failures >= this.failureThreshold) {
            this.state = 'OPEN';
        }
    }
}
exports.CircuitBreakerRetrier = CircuitBreakerRetrier;
// Common retry configurations
exports.RetryPresets = {
    // Quick retry for fast operations
    quick: {
        maxAttempts: 3,
        baseDelay: 100,
        maxDelay: 1000,
        backoffFactor: 2,
    },
    // Standard retry for API calls
    standard: {
        maxAttempts: 5,
        baseDelay: 1000,
        maxDelay: 10000,
        backoffFactor: 2,
    },
    // Aggressive retry for critical operations
    aggressive: {
        maxAttempts: 10,
        baseDelay: 500,
        maxDelay: 30000,
        backoffFactor: 1.5,
    },
    // Network-specific retry
    network: {
        maxAttempts: 5,
        baseDelay: 2000,
        maxDelay: 15000,
        backoffFactor: 2,
        retryCondition: exports.RetryConditions.or(exports.RetryConditions.networkErrors, exports.RetryConditions.serverErrors),
    },
};
//# sourceMappingURL=retry.js.map