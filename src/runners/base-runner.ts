/**
 * Base runner implementation for the ADK JavaScript SDK
 */

import {
  Content,
  SessionState,
  InvocationContext,
  AdkError,
  SessionError,
  EventCallback
} from '../types';
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
export abstract class BaseRunner extends EventEmitter {
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

  constructor(agent: BaseAgent, config: BaseRunnerConfig = {}) {
    super();
    
    this.agent = agent;
    this.maxIterations = config.maxIterations || 10;
    this.timeout = config.timeout || 300000; // 5 minutes
    this.enableLogging = config.enableLogging ?? true;
    this.enableMetrics = config.enableMetrics ?? true;
    this.eventCallbacks = config.eventCallbacks || [];
    this.metadata = config.metadata || {};
    this.logger = new Logger(`Runner:${agent.name}`);
    this.events = [];
    
    this.metrics = {
      executionTime: 0,
      iterations: 0,
      tokensUsed: 0,
      toolCalls: 0,
      errors: 0
    };

    this.validateConfig();
    this.setupEventHandlers();
  }

  /**
   * Run the agent with a new message
   */
  abstract run(
    message: Content,
    sessionState: SessionState,
    context: InvocationContext
  ): Promise<RunnerResult>;

  /**
   * Run the agent with streaming response
   */
  abstract runStreaming(
    message: Content,
    sessionState: SessionState,
    context: InvocationContext
  ): AsyncGenerator<RunnerEvent, RunnerResult, unknown>;

  /**
   * Get runner information
   */
  getInfo(): {
    agentName: string;
    maxIterations: number;
    timeout: number;
    metrics: RunnerMetrics;
    metadata: Record<string, any>;
  } {
    return {
      agentName: this.agent.name,
      maxIterations: this.maxIterations,
      timeout: this.timeout,
      metrics: { ...this.metrics },
      metadata: { ...this.metadata }
    };
  }

  /**
   * Get runner metrics
   */
  getMetrics(): RunnerMetrics {
    return { ...this.metrics };
  }

  /**
   * Reset runner metrics
   */
  resetMetrics(): void {
    this.metrics = {
      executionTime: 0,
      iterations: 0,
      tokensUsed: 0,
      toolCalls: 0,
      errors: 0
    };
    this.events.length = 0;
  }

  /**
   * Add event callback
   */
  addEventCallback(callback: EventCallback): void {
    this.eventCallbacks.push(callback);
  }

  /**
   * Remove event callback
   */
  removeEventCallback(callback: EventCallback): void {
    const index = this.eventCallbacks.indexOf(callback);
    if (index >= 0) {
      this.eventCallbacks.splice(index, 1);
    }
  }

  /**
   * Validate runner configuration
   */
  protected validateConfig(): void {
    if (this.maxIterations <= 0) {
      throw new SessionError('Max iterations must be positive');
    }

    if (this.timeout <= 0) {
      throw new SessionError('Timeout must be positive');
    }
  }

  /**
   * Setup event handlers
   */
  protected setupEventHandlers(): void {
    // Listen to agent events
    this.agent.on('tool_call', (data) => {
      this.emitEvent('tool_call', data);
      if (this.enableMetrics) {
        this.metrics.toolCalls++;
      }
    });

    this.agent.on('tool_result', (data) => {
      this.emitEvent('tool_result', data);
    });

    this.agent.on('error', (data) => {
      this.emitEvent('error', data);
      if (this.enableMetrics) {
        this.metrics.errors++;
      }
    });
  }

  /**
   * Create runner context
   */
  protected createRunnerContext(
    context: InvocationContext,
    iteration: number = 0
  ): RunnerContext {
    return {
      sessionId: context.sessionId,
      userId: context.userId,
      metadata: { ...context.metadata, ...this.metadata },
      startTime: new Date(),
      iteration,
      maxIterations: this.maxIterations
    };
  }

  /**
   * Execute with timeout
   */
  protected async executeWithTimeout<T>(
    operation: () => Promise<T>,
    timeoutMs?: number
  ): Promise<T> {
    const timeout = timeoutMs || this.timeout;
    
    return new Promise<T>((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new SessionError(
          `Runner execution timed out after ${timeout}ms`,
          { timeout, agentName: this.agent.name }
        ));
      }, timeout);

      operation()
        .then(result => {
          clearTimeout(timeoutId);
          resolve(result);
        })
        .catch(error => {
          clearTimeout(timeoutId);
          reject(error);
        });
    });
  }

  /**
   * Emit runner event
   */
  protected emitEvent(
    type: string,
    data: any,
    context?: Partial<RunnerContext>
  ): void {
    const event: RunnerEvent = {
      type,
      timestamp: new Date(),
      data,
      context
    };

    // Store event
    this.events.push(event);

    // Emit to EventEmitter
    this.emit(type, event);

    // Call registered callbacks
    for (const callback of this.eventCallbacks) {
      try {
        callback(event);
      } catch (error) {
        this.logger.error('Event callback failed', error);
      }
    }

    // Log event if enabled
    if (this.enableLogging) {
      this.logger.debug(`Runner event: ${type}`, { data, context });
    }
  }

  /**
   * Update metrics
   */
  protected updateMetrics(updates: Partial<RunnerMetrics>): void {
    if (!this.enableMetrics) return;

    Object.assign(this.metrics, updates);
  }

  /**
   * Validate session state
   */
  protected validateSessionState(sessionState: SessionState): void {
    if (!sessionState) {
      throw new SessionError('Session state is required');
    }

    if (!Array.isArray(sessionState.messages)) {
      throw new SessionError('Session state must have messages array');
    }

    if (!sessionState.metadata || typeof sessionState.metadata !== 'object') {
      throw new SessionError('Session state must have metadata object');
    }
  }

  /**
   * Validate invocation context
   */
  protected validateInvocationContext(context: InvocationContext): void {
    if (!context) {
      throw new SessionError('Invocation context is required');
    }

    if (!context.sessionId || typeof context.sessionId !== 'string') {
      throw new SessionError('Session ID is required in invocation context');
    }
  }

  /**
   * Create execution result
   */
  protected createResult(
    response: Content,
    sessionState: SessionState,
    context: RunnerContext
  ): RunnerResult {
    const executionTime = Date.now() - context.startTime.getTime();
    
    this.updateMetrics({
      executionTime,
      iterations: context.iteration + 1
    });

    return {
      response,
      sessionState,
      context,
      metrics: { ...this.metrics },
      events: [...this.events]
    };
  }

  /**
   * Handle execution error
   */
  protected handleError(error: any, context?: RunnerContext): never {
    this.updateMetrics({ errors: this.metrics.errors + 1 });
    
    this.emitEvent('execution_error', {
      error: error instanceof Error ? error.message : String(error),
      agentName: this.agent.name
    }, context);

    if (error instanceof AdkError) {
      throw error;
    }

    throw new SessionError(
      `Runner execution failed: ${error instanceof Error ? error.message : String(error)}`,
      {
        originalError: error,
        agentName: this.agent.name,
        context
      }
    );
  }
}