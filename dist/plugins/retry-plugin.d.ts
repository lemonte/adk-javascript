/**
 * Retry plugin for ADK JavaScript
 */
import { BasePlugin } from './base-plugin';
import { PluginConfig, ToolContext, ModelContext, AgentContext } from './types';
export interface RetryPluginConfig extends PluginConfig {
    settings?: {
        enableToolRetry?: boolean;
        enableModelRetry?: boolean;
        enableAgentRetry?: boolean;
        defaultMaxRetries?: number;
        defaultRetryDelay?: number;
        retryStrategy?: 'fixed' | 'exponential' | 'linear' | 'custom';
        exponentialBase?: number;
        exponentialMultiplier?: number;
        maxRetryDelay?: number;
        jitterEnabled?: boolean;
        jitterRange?: number;
        retryableErrors?: string[];
        nonRetryableErrors?: string[];
        retryConditions?: RetryCondition[];
        circuitBreakerEnabled?: boolean;
        circuitBreakerThreshold?: number;
        circuitBreakerTimeout?: number;
        retryRules?: RetryRules;
        onRetryCallback?: (context: any, attempt: number, error: Error) => void;
        onMaxRetriesReached?: (context: any, error: Error) => void;
    };
}
export interface RetryRules {
    tools?: Record<string, ToolRetryRule>;
    models?: Record<string, ModelRetryRule>;
    agents?: Record<string, AgentRetryRule>;
    global?: GlobalRetryRule;
}
export interface ToolRetryRule {
    maxRetries?: number;
    retryDelay?: number;
    retryStrategy?: string;
    retryableErrors?: string[];
    nonRetryableErrors?: string[];
    customCondition?: string;
}
export interface ModelRetryRule {
    maxRetries?: number;
    retryDelay?: number;
    retryStrategy?: string;
    retryableErrors?: string[];
    nonRetryableErrors?: string[];
    rateLimitRetry?: boolean;
    tokenLimitRetry?: boolean;
    customCondition?: string;
}
export interface AgentRetryRule {
    maxRetries?: number;
    retryDelay?: number;
    retryStrategy?: string;
    retryableErrors?: string[];
    nonRetryableErrors?: string[];
    stepLimitRetry?: boolean;
    customCondition?: string;
}
export interface GlobalRetryRule {
    maxRetries?: number;
    retryDelay?: number;
    retryStrategy?: string;
    retryableErrors?: string[];
    nonRetryableErrors?: string[];
}
export interface RetryCondition {
    name: string;
    condition: (error: Error, context: any, attempt: number) => boolean;
    maxRetries?: number;
    retryDelay?: number;
}
export interface RetryAttempt {
    attempt: number;
    timestamp: number;
    error: Error;
    delay: number;
    context: any;
}
export interface RetryStats {
    totalRetries: number;
    successfulRetries: number;
    failedRetries: number;
    maxRetriesReached: number;
    averageRetryDelay: number;
    retrySuccessRate: number;
    circuitBreakerTrips: number;
}
export interface CircuitBreakerState {
    isOpen: boolean;
    failureCount: number;
    lastFailureTime: number;
    nextAttemptTime: number;
}
/**
 * Plugin that provides retry capabilities for tools, models, and agents
 */
export declare class RetryPlugin extends BasePlugin {
    private enableToolRetry;
    private enableModelRetry;
    private enableAgentRetry;
    private defaultMaxRetries;
    private defaultRetryDelay;
    private retryStrategy;
    private exponentialBase;
    private exponentialMultiplier;
    private maxRetryDelay;
    private jitterEnabled;
    private jitterRange;
    private retryableErrors;
    private nonRetryableErrors;
    private retryConditions;
    private circuitBreakerEnabled;
    private circuitBreakerThreshold;
    private circuitBreakerTimeout;
    private retryRules;
    private onRetryCallback?;
    private onMaxRetriesReached?;
    private retryAttempts;
    private circuitBreakers;
    private retryStats;
    constructor(config?: Partial<RetryPluginConfig>);
    protected onInitialize(): Promise<void>;
    protected onDestroy(): Promise<void>;
    onToolErrorCallback(context: ToolContext): Promise<ToolContext>;
    onModelErrorCallback(context: ModelContext): Promise<ModelContext>;
    onAgentErrorCallback(context: AgentContext): Promise<AgentContext>;
    /**
     * Determine if an error should be retried
     */
    private shouldRetryError;
    /**
     * Check if error matches a specific type
     */
    private isErrorType;
    /**
     * Check if error is a rate limit error
     */
    private isRateLimitError;
    /**
     * Calculate retry delay
     */
    private calculateRetryDelay;
    /**
     * Calculate delay for rate limit errors
     */
    private calculateRateLimitDelay;
    /**
     * Record retry attempt
     */
    private recordRetryAttempt;
    /**
     * Handle max retries reached
     */
    private handleMaxRetriesReached;
    /**
     * Check if circuit breaker is open
     */
    private isCircuitBreakerOpen;
    /**
     * Update circuit breaker state
     */
    private updateCircuitBreaker;
    /**
     * Sleep for specified milliseconds
     */
    private sleep;
    /**
     * Register built-in retry conditions
     */
    private registerBuiltInRetryConditions;
    /**
     * Add custom retry condition
     */
    addRetryCondition(condition: RetryCondition): void;
    /**
     * Remove retry condition
     */
    removeRetryCondition(name: string): boolean;
    /**
     * Update retry rules
     */
    updateRetryRules(rules: Partial<RetryRules>): void;
    /**
     * Get retry statistics
     */
    getRetryStats(): RetryStats;
    /**
     * Get retry attempts for a specific key
     */
    getRetryAttempts(key: string): RetryAttempt[];
    /**
     * Get circuit breaker state
     */
    getCircuitBreakerState(key: string): CircuitBreakerState | null;
    /**
     * Reset circuit breaker
     */
    resetCircuitBreaker(key: string): void;
    /**
     * Reset all circuit breakers
     */
    resetAllCircuitBreakers(): void;
    /**
     * Clear retry history
     */
    clearRetryHistory(): void;
    /**
     * Reset retry statistics
     */
    resetRetryStats(): void;
    /**
     * Update retry configuration
     */
    updateRetryConfig(updates: Partial<RetryPluginConfig['settings']>): void;
    protected performHealthCheck(): Promise<Record<string, any>>;
}
//# sourceMappingURL=retry-plugin.d.ts.map