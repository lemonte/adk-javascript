"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlowManager = void 0;
const base_flow_1 = require("./base-flow");
const flow_executor_1 = require("./flow-executor");
const types_1 = require("./types");
const constants_1 = require("./constants");
/**
 * Flow manager for registering, executing, and managing flows
 */
class FlowManager {
    constructor(config, storage, hooks) {
        this.flows = new Map();
        this.executions = new Map();
        this.activeExecutions = new Map();
        this.eventListeners = new Map();
        this.metrics = new Map();
        this.isInitialized = false;
        this.config = { ...constants_1.DEFAULT_FLOW_MANAGER_CONFIG, ...config };
        this.storage = storage;
        this.hooks = hooks || {};
        this.executor = new flow_executor_1.FlowExecutor();
    }
    /**
     * Initializes the flow manager
     */
    async initialize() {
        if (this.isInitialized) {
            return;
        }
        // Initialize storage if provided
        if (this.storage) {
            await this.loadFlowsFromStorage();
        }
        // Start metrics collection
        if (this.config.enableMetrics) {
            this.startMetricsCollection();
        }
        this.isInitialized = true;
    }
    /**
     * Shuts down the flow manager
     */
    async shutdown() {
        // Cancel all active executions
        for (const [executionId] of this.activeExecutions) {
            await this.cancelExecution(executionId);
        }
        // Stop metrics collection
        if (this.metricsInterval) {
            clearInterval(this.metricsInterval);
            this.metricsInterval = undefined;
        }
        // Clear all data
        this.flows.clear();
        this.executions.clear();
        this.activeExecutions.clear();
        this.eventListeners.clear();
        this.metrics.clear();
        this.isInitialized = false;
    }
    /**
     * Registers a flow
     */
    async registerFlow(flow) {
        // Validate flow
        const validation = flow.validate();
        if (!validation.valid) {
            throw this.createError(constants_1.FLOW_ERROR_CODES.FLOW_VALIDATION_FAILED, `Flow validation failed: ${validation.errors.join(', ')}`);
        }
        // Check for duplicate flow ID
        if (this.flows.has(flow.config.id)) {
            throw this.createError(constants_1.FLOW_ERROR_CODES.INVALID_CONFIG, `Flow with ID '${flow.config.id}' already exists`);
        }
        // Register flow
        this.flows.set(flow.config.id, flow);
        // Initialize metrics for the flow
        this.initializeFlowMetrics(flow.config.id);
        // Save to storage if enabled
        if (this.storage) {
            await this.storage.saveFlow(flow.config);
        }
        // Emit event
        this.emitEvent({
            type: types_1.FlowEventType.FLOW_STARTED, // Using as registration event
            executionId: '',
            flowId: flow.config.id,
            timestamp: new Date(),
            data: { action: 'registered', config: flow.config }
        });
    }
    /**
     * Unregisters a flow
     */
    async unregisterFlow(flowId) {
        if (!this.flows.has(flowId)) {
            throw this.createError(constants_1.FLOW_ERROR_CODES.FLOW_NOT_FOUND, `Flow with ID '${flowId}' not found`);
        }
        // Cancel any active executions for this flow
        for (const [executionId, execution] of this.activeExecutions) {
            const result = await execution;
            if (result.flowId === flowId) {
                await this.cancelExecution(executionId);
            }
        }
        // Remove flow
        this.flows.delete(flowId);
        this.metrics.delete(flowId);
        // Remove from storage if enabled
        if (this.storage) {
            await this.storage.deleteFlow(flowId);
        }
    }
    /**
     * Gets a registered flow
     */
    getFlow(flowId) {
        return this.flows.get(flowId);
    }
    /**
     * Lists all registered flows
     */
    listFlows() {
        return Array.from(this.flows.values());
    }
    /**
     * Executes a flow
     */
    async executeFlow(flowId, input, context) {
        const flow = this.flows.get(flowId);
        if (!flow) {
            throw this.createError(constants_1.FLOW_ERROR_CODES.FLOW_NOT_FOUND, `Flow with ID '${flowId}' not found`);
        }
        // Check concurrent execution limit
        if (this.activeExecutions.size >= this.config.maxConcurrentExecutions) {
            throw this.createError(constants_1.FLOW_ERROR_CODES.RESOURCE_LIMIT_EXCEEDED, `Maximum concurrent executions (${this.config.maxConcurrentExecutions}) exceeded`);
        }
        // Create execution context
        const executionContext = {
            executionId: this.generateExecutionId(),
            flowId,
            input: { ...input },
            output: {},
            variables: {},
            metadata: {},
            children: [],
            ...context
        };
        // Execute before hook
        if (this.hooks.beforeExecution) {
            await this.hooks.beforeExecution(executionContext);
        }
        // Start execution
        const executionPromise = this.executeFlowInternal(flow, executionContext);
        this.activeExecutions.set(executionContext.executionId, executionPromise);
        try {
            const result = await executionPromise;
            // Execute after hook
            if (this.hooks.afterExecution) {
                await this.hooks.afterExecution(result);
            }
            // Store execution result
            this.executions.set(result.executionId, result);
            // Save to storage if enabled
            if (this.storage) {
                await this.storage.saveExecution(result);
            }
            // Update metrics
            this.updateFlowMetrics(flowId, result);
            return result;
        }
        finally {
            this.activeExecutions.delete(executionContext.executionId);
        }
    }
    /**
     * Gets an execution result
     */
    getExecution(executionId) {
        return this.executions.get(executionId);
    }
    /**
     * Lists execution results
     */
    async listExecutions(options) {
        let executions = Array.from(this.executions.values());
        // Apply filters
        if (options) {
            executions = this.filterExecutions(executions, options);
            executions = this.sortExecutions(executions, options);
            executions = this.paginateExecutions(executions, options);
        }
        return executions;
    }
    /**
     * Cancels an active execution
     */
    async cancelExecution(executionId) {
        const executionPromise = this.activeExecutions.get(executionId);
        if (!executionPromise) {
            throw this.createError(constants_1.FLOW_ERROR_CODES.FLOW_NOT_FOUND, `Active execution with ID '${executionId}' not found`);
        }
        // Note: In a real implementation, you would need to implement cancellation logic
        // This is a simplified version
        this.activeExecutions.delete(executionId);
        // Emit cancellation event
        this.emitEvent({
            type: types_1.FlowEventType.FLOW_CANCELLED,
            executionId,
            flowId: '',
            timestamp: new Date(),
            data: { reason: 'manual_cancellation' }
        });
    }
    /**
     * Gets flow statistics
     */
    getFlowStats() {
        const executions = Array.from(this.executions.values());
        const totalFlows = this.flows.size;
        const activeExecutions = this.activeExecutions.size;
        const completedExecutions = executions.filter(e => e.status === types_1.FlowStatus.COMPLETED).length;
        const failedExecutions = executions.filter(e => e.status === types_1.FlowStatus.FAILED).length;
        const totalExecutions = executions.length;
        const successRate = totalExecutions > 0 ? (completedExecutions / totalExecutions) * 100 : 0;
        const errorRate = totalExecutions > 0 ? (failedExecutions / totalExecutions) * 100 : 0;
        const durations = executions
            .filter(e => e.duration !== undefined)
            .map(e => e.duration);
        const averageExecutionTime = durations.length > 0
            ? durations.reduce((sum, duration) => sum + duration, 0) / durations.length
            : 0;
        // Calculate throughput (executions per minute)
        const now = Date.now();
        const oneMinuteAgo = now - 60 * 1000;
        const recentExecutions = executions.filter(e => e.startTime.getTime() > oneMinuteAgo).length;
        return {
            totalFlows,
            activeExecutions,
            completedExecutions,
            failedExecutions,
            averageExecutionTime,
            successRate,
            errorRate,
            throughput: recentExecutions
        };
    }
    /**
     * Gets metrics for a specific flow
     */
    getFlowMetrics(flowId) {
        return this.metrics.get(flowId);
    }
    /**
     * Gets metrics for all flows
     */
    getAllFlowMetrics() {
        return new Map(this.metrics);
    }
    /**
     * Adds an event listener
     */
    addEventListener(eventType, listener) {
        if (!this.eventListeners.has(eventType)) {
            this.eventListeners.set(eventType, []);
        }
        this.eventListeners.get(eventType).push(listener);
    }
    /**
     * Removes an event listener
     */
    removeEventListener(eventType, listener) {
        const listeners = this.eventListeners.get(eventType);
        if (listeners) {
            const index = listeners.indexOf(listener);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        }
    }
    /**
     * Backs up flows and executions
     */
    async backupFlows() {
        const flows = Array.from(this.flows.values()).map(flow => flow.config);
        const executions = Array.from(this.executions.values());
        return {
            timestamp: new Date(),
            version: '1.0.0',
            flows,
            executions,
            metadata: {
                totalFlows: flows.length,
                totalExecutions: executions.length,
                managerConfig: this.config
            }
        };
    }
    /**
     * Restores flows and executions from backup
     */
    async restoreFlows(backup, options) {
        const opts = {
            overwrite: false,
            restoreExecutions: true,
            validate: true,
            backup: true,
            ...options
        };
        let restoredCount = 0;
        // Backup existing data if requested
        if (opts.backup) {
            await this.backupFlows();
        }
        // Restore flows
        for (const flowConfig of backup.flows) {
            try {
                // Validate if requested
                if (opts.validate) {
                    // Create a temporary flow instance for validation
                    const tempFlow = new (class extends base_flow_1.BaseFlow {
                        async execute() {
                            throw new Error('Not implemented');
                        }
                        clone() {
                            throw new Error('Not implemented');
                        }
                    })(flowConfig);
                    const validation = tempFlow.validate();
                    if (!validation.valid) {
                        console.warn(`Skipping invalid flow '${flowConfig.id}': ${validation.errors.join(', ')}`);
                        continue;
                    }
                }
                // Check if flow exists
                if (this.flows.has(flowConfig.id) && !opts.overwrite) {
                    console.warn(`Skipping existing flow '${flowConfig.id}' (overwrite disabled)`);
                    continue;
                }
                // Create and register flow
                const flow = new (class extends base_flow_1.BaseFlow {
                    async execute() {
                        throw new Error('Not implemented');
                    }
                    clone() {
                        throw new Error('Not implemented');
                    }
                })(flowConfig);
                await this.registerFlow(flow);
                restoredCount++;
            }
            catch (error) {
                console.error(`Failed to restore flow '${flowConfig.id}':`, error);
            }
        }
        // Restore executions if requested
        if (opts.restoreExecutions) {
            for (const execution of backup.executions) {
                this.executions.set(execution.executionId, execution);
                if (this.storage) {
                    await this.storage.saveExecution(execution);
                }
            }
        }
        return restoredCount;
    }
    /**
     * Gets the current configuration
     */
    getConfiguration() {
        return { ...this.config };
    }
    /**
     * Updates the configuration
     */
    updateConfiguration(config) {
        this.config = { ...this.config, ...config };
    }
    /**
     * Gets health status
     */
    getHealthStatus() {
        const stats = this.getFlowStats();
        return {
            healthy: this.isInitialized && stats.errorRate < 50, // Consider unhealthy if error rate > 50%
            details: {
                initialized: this.isInitialized,
                stats,
                activeExecutions: this.activeExecutions.size,
                registeredFlows: this.flows.size,
                totalExecutions: this.executions.size,
                config: this.config
            }
        };
    }
    /**
     * Internal method to execute a flow
     */
    async executeFlowInternal(flow, context) {
        const startTime = new Date();
        try {
            // Emit start event
            this.emitEvent({
                type: types_1.FlowEventType.FLOW_STARTED,
                executionId: context.executionId,
                flowId: context.flowId,
                timestamp: startTime,
                data: { input: context.input }
            });
            // Execute the flow
            const result = await flow.execute(context);
            // Emit completion event
            this.emitEvent({
                type: types_1.FlowEventType.FLOW_COMPLETED,
                executionId: context.executionId,
                flowId: context.flowId,
                timestamp: new Date(),
                data: { output: result.output, duration: result.duration }
            });
            return result;
        }
        catch (error) {
            const endTime = new Date();
            const duration = endTime.getTime() - startTime.getTime();
            // Execute error hook
            if (this.hooks.onError) {
                await this.hooks.onError(error, context);
            }
            // Emit error event
            this.emitEvent({
                type: types_1.FlowEventType.FLOW_FAILED,
                executionId: context.executionId,
                flowId: context.flowId,
                timestamp: endTime,
                data: { error: error.message, duration }
            });
            // Create failed result
            const result = {
                executionId: context.executionId,
                flowId: context.flowId,
                status: types_1.FlowStatus.FAILED,
                input: context.input,
                output: context.output,
                error: error,
                startTime,
                endTime,
                duration,
                stepResults: [],
                metadata: context.metadata
            };
            return result;
        }
    }
    /**
     * Loads flows from storage
     */
    async loadFlowsFromStorage() {
        if (!this.storage) {
            return;
        }
        try {
            const flowConfigs = await this.storage.listFlows();
            for (const config of flowConfigs) {
                // Create a basic flow instance
                const flow = new (class extends base_flow_1.BaseFlow {
                    async execute() {
                        throw new Error('Not implemented');
                    }
                    clone() {
                        throw new Error('Not implemented');
                    }
                })(config);
                this.flows.set(config.id, flow);
                this.initializeFlowMetrics(config.id);
            }
        }
        catch (error) {
            console.error('Failed to load flows from storage:', error);
        }
    }
    /**
     * Initializes metrics for a flow
     */
    initializeFlowMetrics(flowId) {
        this.metrics.set(flowId, {
            executionCount: 0,
            successCount: 0,
            failureCount: 0,
            averageDuration: 0,
            minDuration: Infinity,
            maxDuration: 0,
            throughput: 0,
            errorRate: 0
        });
    }
    /**
     * Updates metrics for a flow
     */
    updateFlowMetrics(flowId, result) {
        const metrics = this.metrics.get(flowId);
        if (!metrics) {
            return;
        }
        metrics.executionCount++;
        if (result.status === types_1.FlowStatus.COMPLETED) {
            metrics.successCount++;
        }
        else if (result.status === types_1.FlowStatus.FAILED) {
            metrics.failureCount++;
        }
        if (result.duration !== undefined) {
            metrics.averageDuration = ((metrics.averageDuration * (metrics.executionCount - 1)) + result.duration) / metrics.executionCount;
            metrics.minDuration = Math.min(metrics.minDuration, result.duration);
            metrics.maxDuration = Math.max(metrics.maxDuration, result.duration);
        }
        metrics.errorRate = (metrics.failureCount / metrics.executionCount) * 100;
        metrics.lastExecutionTime = result.endTime;
    }
    /**
     * Starts metrics collection
     */
    startMetricsCollection() {
        if (this.metricsInterval) {
            clearInterval(this.metricsInterval);
        }
        this.metricsInterval = setInterval(() => {
            // Update throughput metrics
            const now = Date.now();
            const oneMinuteAgo = now - 60 * 1000;
            for (const [flowId, metrics] of this.metrics) {
                const recentExecutions = Array.from(this.executions.values())
                    .filter(e => e.flowId === flowId && e.startTime.getTime() > oneMinuteAgo)
                    .length;
                metrics.throughput = recentExecutions;
            }
        }, this.config.metricsInterval);
    }
    /**
     * Filters executions based on query options
     */
    filterExecutions(executions, options) {
        let filtered = executions;
        if (options.status) {
            filtered = filtered.filter(e => e.status === options.status);
        }
        if (options.userId) {
            filtered = filtered.filter(e => e.metadata.userId === options.userId);
        }
        if (options.sessionId) {
            filtered = filtered.filter(e => e.metadata.sessionId === options.sessionId);
        }
        if (options.executedAfter) {
            filtered = filtered.filter(e => e.startTime >= options.executedAfter);
        }
        if (options.executedBefore) {
            filtered = filtered.filter(e => e.startTime <= options.executedBefore);
        }
        return filtered;
    }
    /**
     * Sorts executions based on query options
     */
    sortExecutions(executions, options) {
        if (!options.sortBy) {
            return executions;
        }
        const sorted = [...executions];
        const direction = options.sortOrder === 'desc' ? -1 : 1;
        sorted.sort((a, b) => {
            let aValue;
            let bValue;
            switch (options.sortBy) {
                case 'executedAt':
                    aValue = a.startTime.getTime();
                    bValue = b.startTime.getTime();
                    break;
                case 'duration':
                    aValue = a.duration || 0;
                    bValue = b.duration || 0;
                    break;
                default:
                    return 0;
            }
            if (aValue < bValue)
                return -1 * direction;
            if (aValue > bValue)
                return 1 * direction;
            return 0;
        });
        return sorted;
    }
    /**
     * Paginates executions based on query options
     */
    paginateExecutions(executions, options) {
        if (!options.limit && !options.offset) {
            return executions;
        }
        const offset = options.offset || 0;
        const limit = options.limit;
        if (limit) {
            return executions.slice(offset, offset + limit);
        }
        else {
            return executions.slice(offset);
        }
    }
    /**
     * Emits a flow event
     */
    emitEvent(event) {
        if (!this.config.enableEvents) {
            return;
        }
        const listeners = this.eventListeners.get(event.type);
        if (listeners) {
            for (const listener of listeners) {
                try {
                    listener(event);
                }
                catch (error) {
                    console.error('Error in flow event listener:', error);
                }
            }
        }
    }
    /**
     * Generates a unique execution ID
     */
    generateExecutionId() {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substring(2, 15);
        return `exec_${timestamp}_${random}`;
    }
    /**
     * Creates an error with context
     */
    createError(code, message) {
        const error = new Error(message);
        error.code = code;
        return error;
    }
}
exports.FlowManager = FlowManager;
//# sourceMappingURL=flow-manager.js.map