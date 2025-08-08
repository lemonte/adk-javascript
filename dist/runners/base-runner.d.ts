/**
 * Base runner implementation for the ADK JavaScript SDK
 */
import { Content, SessionState, InvocationContext, EventCallback } from '../types';
import { BaseAgent } from '../agents/base-agent';
import { Logger } from '../utils';
import { EventEmitter } from 'events';
/**
 * Runner configuration
 */
export interface BaseRunnerConfig {
    maxIterations?: number;
    timeout?: number;
    enableLogging?: boolean;
    enableMetrics?: boolean;
    eventCallbacks?: EventCallback[];
    metadata?: Record<string, any>;
}
/**
 * Runner execution context
 */
export interface RunnerContext {
    sessionId: string;
    userId?: string;
    metadata?: Record<string, any>;
    startTime: Date;
    iteration: number;
    maxIterations: number;
}
/**
 * Runner execution result
 */
export interface RunnerResult {
    response: Content;
    sessionState: SessionState;
    context: RunnerContext;
    metrics: RunnerMetrics;
    events: RunnerEvent[];
}
/**
 * Runner metrics
 */
export interface RunnerMetrics {
    executionTime: number;
    iterations: number;
    tokensUsed: number;
    toolCalls: number;
    errors: number;
}
/**
 * Runner event
 */
export interface RunnerEvent {
    type: string;
    timestamp: Date;
    data: any;
    context?: Partial<RunnerContext>;
}
/**
 * Abstract base class for all runners in the ADK
 */
export declare abstract class BaseRunner extends EventEmitter {
    protected readonly agent: BaseAgent;
    protected readonly maxIterations: number;
    protected readonly timeout: number;
    protected readonly enableLogging: boolean;
    protected readonly enableMetrics: boolean;
    protected readonly eventCallbacks: EventCallback[];
    protected readonly metadata: Record<string, any>;
    protected readonly logger: Logger;
    protected readonly events: RunnerEvent[];
    protected metrics: RunnerMetrics;
    constructor(agent: BaseAgent, config?: BaseRunnerConfig);
    /**
     * Run the agent with a new message
     */
    abstract run(message: Content, sessionState: SessionState, context: InvocationContext): Promise<RunnerResult>;
    /**
     * Run the agent with streaming response
     */
    abstract runStreaming(message: Content, sessionState: SessionState, context: InvocationContext): AsyncGenerator<RunnerEvent, RunnerResult, unknown>;
    /**
     * Get runner information
     */
    getInfo(): {
        agentName: string;
        maxIterations: number;
        timeout: number;
        metrics: RunnerMetrics;
        metadata: Record<string, any>;
    };
    /**
     * Get runner metrics
     */
    getMetrics(): RunnerMetrics;
    /**
     * Reset runner metrics
     */
    resetMetrics(): void;
    /**
     * Add event callback
     */
    addEventCallback(callback: EventCallback): void;
    /**
     * Remove event callback
     */
    removeEventCallback(callback: EventCallback): void;
    /**
     * Validate runner configuration
     */
    protected validateConfig(): void;
    /**
     * Setup event handlers
     */
    protected setupEventHandlers(): void;
    /**
     * Create runner context
     */
    protected createRunnerContext(context: InvocationContext, iteration?: number): RunnerContext;
    /**
     * Execute with timeout
     */
    protected executeWithTimeout<T>(operation: () => Promise<T>, timeoutMs?: number): Promise<T>;
    /**
     * Emit runner event
     */
    protected emitEvent(type: string, data: any, context?: Partial<RunnerContext>): void;
    /**
     * Update metrics
     */
    protected updateMetrics(updates: Partial<RunnerMetrics>): void;
    /**
     * Validate session state
     */
    protected validateSessionState(sessionState: SessionState): void;
    /**
     * Validate invocation context
     */
    protected validateInvocationContext(context: InvocationContext): void;
    /**
     * Create execution result
     */
    protected createResult(response: Content, sessionState: SessionState, context: RunnerContext): RunnerResult;
    /**
     * Handle execution error
     */
    protected handleError(error: any, context?: RunnerContext): never;
}
//# sourceMappingURL=base-runner.d.ts.map