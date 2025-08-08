/**
 * Retry utilities for handling failed operations
 */
export interface RetryConfig {
    maxAttempts: number;
    baseDelay?: number;
    maxDelay?: number;
    backoffFactor?: number;
    jitter?: boolean;
    retryCondition?: (error: any, attempt: number) => boolean;
    onRetry?: (error: any, attempt: number, delay: number) => void;
    enableLogging?: boolean;
}
export interface RetryResult<T> {
    success: boolean;
    result?: T;
    error?: any;
    attempts: number;
    totalTime: number;
}
export interface RetryAttempt {
    attempt: number;
    error: any;
    delay: number;
    timestamp: number;
}
/**
 * Retry strategies
 */
export declare enum RetryStrategy {
    FIXED = "fixed",
    LINEAR = "linear",
    EXPONENTIAL = "exponential",
    FIBONACCI = "fibonacci"
}
/**
 * Default retry conditions
 */
export declare const RetryConditions: {
    /**
     * Always retry (up to max attempts)
     */
    always: () => boolean;
    /**
     * Never retry
     */
    never: () => boolean;
    /**
     * Retry on network errors
     */
    networkErrors: (error: any) => any;
    /**
     * Retry on HTTP 5xx errors
     */
    serverErrors: (error: any) => boolean;
    /**
     * Retry on specific HTTP status codes
     */
    httpStatus: (codes: number[]) => (error: any) => boolean;
    /**
     * Retry on specific error types
     */
    errorTypes: (types: string[]) => (error: any) => boolean;
    /**
     * Combine multiple conditions with OR logic
     */
    or: (...conditions: Array<(error: any, attempt: number) => boolean>) => (error: any, attempt: number) => boolean;
    /**
     * Combine multiple conditions with AND logic
     */
    and: (...conditions: Array<(error: any, attempt: number) => boolean>) => (error: any, attempt: number) => boolean;
};
/**
 * Calculate delay based on strategy
 */
export declare function calculateDelay(attempt: number, strategy: RetryStrategy, baseDelay: number, backoffFactor: number, maxDelay: number, jitter: boolean): number;
/**
 * Retry function with configurable strategy
 */
export declare function retry<T>(fn: () => Promise<T>, config: RetryConfig): Promise<T>;
/**
 * Retry function with detailed result
 */
export declare function retryWithResult<T>(fn: () => Promise<T>, config: RetryConfig): Promise<RetryResult<T>>;
/**
 * Retry class for more advanced usage
 */
export declare class Retrier {
    private config;
    private attempts;
    constructor(config: RetryConfig);
    /**
     * Execute function with retry logic
     */
    execute<T>(fn: () => Promise<T>): Promise<T>;
    /**
     * Execute with detailed result
     */
    executeWithResult<T>(fn: () => Promise<T>): Promise<RetryResult<T>>;
    /**
     * Get retry attempts history
     */
    getAttempts(): RetryAttempt[];
    /**
     * Update configuration
     */
    updateConfig(config: Partial<RetryConfig>): void;
    /**
     * Reset attempts history
     */
    reset(): void;
}
/**
 * Retry decorator for methods
 */
export declare function retryable(config: RetryConfig): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
/**
 * Circuit breaker with retry
 */
export declare class CircuitBreakerRetrier {
    private failureThreshold;
    private recoveryTimeout;
    private failures;
    private lastFailureTime;
    private state;
    private retrier;
    constructor(failureThreshold: number, recoveryTimeout: number, retryConfig: RetryConfig);
    /**
     * Execute function with circuit breaker and retry
     */
    execute<T>(fn: () => Promise<T>): Promise<T>;
    /**
     * Get current state
     */
    getState(): string;
    /**
     * Reset circuit breaker
     */
    reset(): void;
    private onSuccess;
    private onFailure;
}
export declare const RetryPresets: {
    readonly quick: {
        readonly maxAttempts: 3;
        readonly baseDelay: 100;
        readonly maxDelay: 1000;
        readonly backoffFactor: 2;
    };
    readonly standard: {
        readonly maxAttempts: 5;
        readonly baseDelay: 1000;
        readonly maxDelay: 10000;
        readonly backoffFactor: 2;
    };
    readonly aggressive: {
        readonly maxAttempts: 10;
        readonly baseDelay: 500;
        readonly maxDelay: 30000;
        readonly backoffFactor: 1.5;
    };
    readonly network: {
        readonly maxAttempts: 5;
        readonly baseDelay: 2000;
        readonly maxDelay: 15000;
        readonly backoffFactor: 2;
        readonly retryCondition: (error: any, attempt: number) => boolean;
    };
};
//# sourceMappingURL=retry.d.ts.map