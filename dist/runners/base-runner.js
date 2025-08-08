"use strict";
/**
 * Base runner implementation for the ADK JavaScript SDK
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseRunner = void 0;
const types_1 = require("../types");
const utils_1 = require("../utils");
const events_1 = require("events");
/**
 * Abstract base class for all runners in the ADK
 */
class BaseRunner extends events_1.EventEmitter {
    constructor(agent, config = {}) {
        super();
        this.agent = agent;
        this.maxIterations = config.maxIterations || 10;
        this.timeout = config.timeout || 300000; // 5 minutes
        this.enableLogging = config.enableLogging ?? true;
        this.enableMetrics = config.enableMetrics ?? true;
        this.eventCallbacks = config.eventCallbacks || [];
        this.metadata = config.metadata || {};
        this.logger = new utils_1.Logger(`Runner:${agent.name}`);
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
     * Get runner information
     */
    getInfo() {
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
    getMetrics() {
        return { ...this.metrics };
    }
    /**
     * Reset runner metrics
     */
    resetMetrics() {
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
    addEventCallback(callback) {
        this.eventCallbacks.push(callback);
    }
    /**
     * Remove event callback
     */
    removeEventCallback(callback) {
        const index = this.eventCallbacks.indexOf(callback);
        if (index >= 0) {
            this.eventCallbacks.splice(index, 1);
        }
    }
    /**
     * Validate runner configuration
     */
    validateConfig() {
        if (this.maxIterations <= 0) {
            throw new types_1.SessionError('Max iterations must be positive');
        }
        if (this.timeout <= 0) {
            throw new types_1.SessionError('Timeout must be positive');
        }
    }
    /**
     * Setup event handlers
     */
    setupEventHandlers() {
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
    createRunnerContext(context, iteration = 0) {
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
    async executeWithTimeout(operation, timeoutMs) {
        const timeout = timeoutMs || this.timeout;
        return new Promise((resolve, reject) => {
            const timeoutId = setTimeout(() => {
                reject(new types_1.SessionError(`Runner execution timed out after ${timeout}ms`, { timeout, agentName: this.agent.name }));
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
    emitEvent(type, data, context) {
        const event = {
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
            }
            catch (error) {
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
    updateMetrics(updates) {
        if (!this.enableMetrics)
            return;
        Object.assign(this.metrics, updates);
    }
    /**
     * Validate session state
     */
    validateSessionState(sessionState) {
        if (!sessionState) {
            throw new types_1.SessionError('Session state is required');
        }
        if (!Array.isArray(sessionState.messages)) {
            throw new types_1.SessionError('Session state must have messages array');
        }
        if (!sessionState.metadata || typeof sessionState.metadata !== 'object') {
            throw new types_1.SessionError('Session state must have metadata object');
        }
    }
    /**
     * Validate invocation context
     */
    validateInvocationContext(context) {
        if (!context) {
            throw new types_1.SessionError('Invocation context is required');
        }
        if (!context.sessionId || typeof context.sessionId !== 'string') {
            throw new types_1.SessionError('Session ID is required in invocation context');
        }
    }
    /**
     * Create execution result
     */
    createResult(response, sessionState, context) {
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
    handleError(error, context) {
        this.updateMetrics({ errors: this.metrics.errors + 1 });
        this.emitEvent('execution_error', {
            error: error instanceof Error ? error.message : String(error),
            agentName: this.agent.name
        }, context);
        if (error instanceof types_1.AdkError) {
            throw error;
        }
        throw new types_1.SessionError(`Runner execution failed: ${error instanceof Error ? error.message : String(error)}`, {
            originalError: error,
            agentName: this.agent.name,
            context
        });
    }
}
exports.BaseRunner = BaseRunner;
//# sourceMappingURL=base-runner.js.map