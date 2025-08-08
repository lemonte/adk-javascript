"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateFlowExecutionResult = exports.deepClone = exports.formatDuration = exports.createFlowContext = exports.normalizeFlowConfig = exports.compareFlowConfigs = exports.mergeFlowConfigs = exports.paginateFlowExecutions = exports.sortFlowExecutions = exports.filterFlowExecutions = exports.calculateFlowMetrics = exports.calculateFlowStats = exports.sanitizeFlowStep = exports.sanitizeFlowConfig = exports.detectCircularDependencies = exports.validateFlowCondition = exports.validateFlowStep = exports.validateFlowConfig = exports.validateFlowId = exports.generateFlowId = exports.FlowUtils = void 0;
const types_1 = require("./types");
const constants_1 = require("./constants");
/**
 * Utility functions for flow management
 */
class FlowUtils {
    /**
     * Generates a unique flow ID
     */
    static generateFlowId(prefix = 'flow') {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substring(2, 15);
        return `${prefix}_${timestamp}_${random}`;
    }
    /**
     * Validates a flow ID format
     */
    static validateFlowId(id) {
        return constants_1.FLOW_ID_PATTERN.test(id);
    }
    /**
     * Validates a flow configuration
     */
    static validateFlowConfig(config) {
        const errors = [];
        // Validate ID
        if (!config.id || !this.validateFlowId(config.id)) {
            errors.push('Invalid flow ID format');
        }
        // Validate name
        if (!config.name || config.name.trim().length === 0) {
            errors.push('Flow name is required');
        }
        if (config.name && config.name.length > constants_1.FLOW_VALIDATION_RULES.MAX_NAME_LENGTH) {
            errors.push(`Flow name exceeds maximum length of ${constants_1.FLOW_VALIDATION_RULES.MAX_NAME_LENGTH}`);
        }
        // Validate description
        if (config.description && config.description.length > constants_1.FLOW_VALIDATION_RULES.MAX_DESCRIPTION_LENGTH) {
            errors.push(`Flow description exceeds maximum length of ${constants_1.FLOW_VALIDATION_RULES.MAX_DESCRIPTION_LENGTH}`);
        }
        // Validate steps
        if (!config.steps || config.steps.length === 0) {
            errors.push('Flow must have at least one step');
        }
        if (config.steps && config.steps.length > constants_1.FLOW_VALIDATION_RULES.MAX_STEPS) {
            errors.push(`Flow exceeds maximum number of steps (${constants_1.FLOW_VALIDATION_RULES.MAX_STEPS})`);
        }
        // Validate individual steps
        if (config.steps) {
            config.steps.forEach((step, index) => {
                const stepErrors = this.validateFlowStep(step, index);
                errors.push(...stepErrors);
            });
        }
        // Validate timeout
        if (config.timeout !== undefined) {
            if (config.timeout < constants_1.FLOW_VALIDATION_RULES.MIN_TIMEOUT) {
                errors.push(`Flow timeout must be at least ${constants_1.FLOW_VALIDATION_RULES.MIN_TIMEOUT}ms`);
            }
            if (config.timeout > constants_1.FLOW_VALIDATION_RULES.MAX_TIMEOUT) {
                errors.push(`Flow timeout cannot exceed ${constants_1.FLOW_VALIDATION_RULES.MAX_TIMEOUT}ms`);
            }
        }
        // Validate retry configuration
        if (config.retryConfig) {
            if (config.retryConfig.maxAttempts < 0 || config.retryConfig.maxAttempts > constants_1.FLOW_VALIDATION_RULES.MAX_RETRY_ATTEMPTS) {
                errors.push(`Retry attempts must be between 0 and ${constants_1.FLOW_VALIDATION_RULES.MAX_RETRY_ATTEMPTS}`);
            }
            if (config.retryConfig.delay < 0) {
                errors.push('Retry delay cannot be negative');
            }
        }
        // Check for circular dependencies
        if (config.steps) {
            const circularDeps = this.detectCircularDependencies(config.steps);
            if (circularDeps.length > 0) {
                errors.push(`Circular dependencies detected: ${circularDeps.join(', ')}`);
            }
        }
        return {
            valid: errors.length === 0,
            errors
        };
    }
    /**
     * Validates a flow step
     */
    static validateFlowStep(step, index) {
        const errors = [];
        const stepPrefix = `Step ${index + 1}`;
        // Validate ID
        if (!step.id || !this.validateFlowId(step.id)) {
            errors.push(`${stepPrefix}: Invalid step ID format`);
        }
        // Validate name
        if (!step.name || step.name.trim().length === 0) {
            errors.push(`${stepPrefix}: Step name is required`);
        }
        // Validate type
        if (!step.type || !constants_1.FLOW_STEP_TYPES.includes(step.type)) {
            errors.push(`${stepPrefix}: Invalid step type '${step.type}'`);
        }
        // Validate timeout
        if (step.timeout !== undefined) {
            if (step.timeout < 0) {
                errors.push(`${stepPrefix}: Step timeout cannot be negative`);
            }
        }
        // Validate conditions
        if (step.conditions) {
            step.conditions.forEach((condition, condIndex) => {
                const condErrors = this.validateFlowCondition(condition, `${stepPrefix} condition ${condIndex + 1}`);
                errors.push(...condErrors);
            });
        }
        return errors;
    }
    /**
     * Validates a flow condition
     */
    static validateFlowCondition(condition, prefix) {
        const errors = [];
        if (!condition.field || condition.field.trim().length === 0) {
            errors.push(`${prefix}: Condition field is required`);
        }
        if (!condition.operator || condition.operator.trim().length === 0) {
            errors.push(`${prefix}: Condition operator is required`);
        }
        if (condition.value === undefined || condition.value === null) {
            errors.push(`${prefix}: Condition value is required`);
        }
        return errors;
    }
    /**
     * Detects circular dependencies in flow steps
     */
    static detectCircularDependencies(steps) {
        const graph = new Map();
        const visited = new Set();
        const recursionStack = new Set();
        const cycles = [];
        // Build dependency graph
        steps.forEach(step => {
            graph.set(step.id, step.dependencies || []);
        });
        // DFS to detect cycles
        const dfs = (stepId, path) => {
            if (recursionStack.has(stepId)) {
                const cycleStart = path.indexOf(stepId);
                const cycle = path.slice(cycleStart).concat(stepId);
                cycles.push(cycle.join(' -> '));
                return;
            }
            if (visited.has(stepId)) {
                return;
            }
            visited.add(stepId);
            recursionStack.add(stepId);
            path.push(stepId);
            const dependencies = graph.get(stepId) || [];
            dependencies.forEach(depId => {
                dfs(depId, [...path]);
            });
            recursionStack.delete(stepId);
        };
        // Check each step
        steps.forEach(step => {
            if (!visited.has(step.id)) {
                dfs(step.id, []);
            }
        });
        return cycles;
    }
    /**
     * Sanitizes flow configuration
     */
    static sanitizeFlowConfig(config) {
        return {
            ...config,
            name: config.name?.trim() || '',
            description: config.description?.trim() || '',
            timeout: Math.max(0, config.timeout || constants_1.FLOW_DEFAULTS.TIMEOUT),
            priority: config.priority || types_1.FlowPriority.MEDIUM,
            executionMode: config.executionMode || types_1.FlowExecutionMode.SEQUENTIAL,
            retryConfig: config.retryConfig ? {
                maxAttempts: Math.max(0, Math.min(config.retryConfig.maxAttempts, constants_1.FLOW_VALIDATION_RULES.MAX_RETRY_ATTEMPTS)),
                delay: Math.max(0, config.retryConfig.delay),
                backoffMultiplier: Math.max(1, config.retryConfig.backoffMultiplier || 1),
                maxDelay: Math.max(config.retryConfig.delay, config.retryConfig.maxDelay || config.retryConfig.delay)
            } : undefined,
            steps: config.steps?.map(step => this.sanitizeFlowStep(step)) || [],
            metadata: { ...config.metadata }
        };
    }
    /**
     * Sanitizes a flow step
     */
    static sanitizeFlowStep(step) {
        return {
            ...step,
            name: step.name?.trim() || '',
            description: step.description?.trim() || '',
            timeout: step.timeout !== undefined ? Math.max(0, step.timeout) : undefined,
            dependencies: step.dependencies?.filter(dep => dep && dep.trim().length > 0) || [],
            conditions: step.conditions?.map(condition => ({
                ...condition,
                field: condition.field?.trim() || '',
                operator: condition.operator?.trim() || ''
            })) || [],
            metadata: { ...step.metadata }
        };
    }
    /**
     * Calculates flow execution statistics
     */
    static calculateFlowStats(executions) {
        const totalExecutions = executions.length;
        const completedExecutions = executions.filter(e => e.status === types_1.FlowStatus.COMPLETED).length;
        const failedExecutions = executions.filter(e => e.status === types_1.FlowStatus.FAILED).length;
        const activeExecutions = executions.filter(e => e.status === types_1.FlowStatus.RUNNING).length;
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
            totalFlows: new Set(executions.map(e => e.flowId)).size,
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
     * Calculates metrics for a specific flow
     */
    static calculateFlowMetrics(flowId, executions) {
        const flowExecutions = executions.filter(e => e.flowId === flowId);
        const executionCount = flowExecutions.length;
        const successCount = flowExecutions.filter(e => e.status === types_1.FlowStatus.COMPLETED).length;
        const failureCount = flowExecutions.filter(e => e.status === types_1.FlowStatus.FAILED).length;
        const durations = flowExecutions
            .filter(e => e.duration !== undefined)
            .map(e => e.duration);
        const averageDuration = durations.length > 0
            ? durations.reduce((sum, duration) => sum + duration, 0) / durations.length
            : 0;
        const minDuration = durations.length > 0 ? Math.min(...durations) : 0;
        const maxDuration = durations.length > 0 ? Math.max(...durations) : 0;
        const errorRate = executionCount > 0 ? (failureCount / executionCount) * 100 : 0;
        // Calculate throughput (executions per minute)
        const now = Date.now();
        const oneMinuteAgo = now - 60 * 1000;
        const recentExecutions = flowExecutions.filter(e => e.startTime.getTime() > oneMinuteAgo).length;
        const lastExecution = flowExecutions
            .sort((a, b) => b.startTime.getTime() - a.startTime.getTime())[0];
        return {
            executionCount,
            successCount,
            failureCount,
            averageDuration,
            minDuration,
            maxDuration,
            throughput: recentExecutions,
            errorRate,
            lastExecutionTime: lastExecution?.endTime
        };
    }
    /**
     * Filters flow executions based on query options
     */
    static filterFlowExecutions(executions, options) {
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
     * Sorts flow executions
     */
    static sortFlowExecutions(executions, sortBy, sortOrder = 'desc') {
        if (!sortBy) {
            return executions;
        }
        const sorted = [...executions];
        const direction = sortOrder === 'desc' ? -1 : 1;
        sorted.sort((a, b) => {
            let aValue;
            let bValue;
            switch (sortBy) {
                case 'executedAt':
                    aValue = a.startTime.getTime();
                    bValue = b.startTime.getTime();
                    break;
                case 'duration':
                    aValue = a.duration || 0;
                    bValue = b.duration || 0;
                    break;
                case 'status':
                    aValue = a.status;
                    bValue = b.status;
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
     * Paginates flow executions
     */
    static paginateFlowExecutions(executions, limit, offset = 0) {
        if (!limit && !offset) {
            return executions;
        }
        if (limit) {
            return executions.slice(offset, offset + limit);
        }
        else {
            return executions.slice(offset);
        }
    }
    /**
     * Merges flow configurations
     */
    static mergeFlowConfigs(base, override) {
        return {
            ...base,
            ...override,
            metadata: {
                ...base.metadata,
                ...override.metadata
            },
            retryConfig: override.retryConfig ? {
                ...base.retryConfig,
                ...override.retryConfig
            } : base.retryConfig,
            steps: override.steps || base.steps
        };
    }
    /**
     * Compares two flow configurations
     */
    static compareFlowConfigs(config1, config2) {
        return JSON.stringify(this.normalizeFlowConfig(config1)) ===
            JSON.stringify(this.normalizeFlowConfig(config2));
    }
    /**
     * Normalizes a flow configuration for comparison
     */
    static normalizeFlowConfig(config) {
        const normalized = { ...config };
        // Sort steps by ID for consistent comparison
        if (normalized.steps) {
            normalized.steps = [...normalized.steps].sort((a, b) => a.id.localeCompare(b.id));
        }
        // Sort metadata keys
        if (normalized.metadata) {
            const sortedMetadata = {};
            Object.keys(normalized.metadata).sort().forEach(key => {
                sortedMetadata[key] = normalized.metadata[key];
            });
            normalized.metadata = sortedMetadata;
        }
        return normalized;
    }
    /**
     * Creates a flow execution context
     */
    static createFlowContext(executionId, flowId, input = {}, metadata = {}) {
        return {
            executionId,
            flowId,
            input: { ...input },
            output: {},
            variables: {},
            metadata: { ...metadata },
            children: []
        };
    }
    /**
     * Formats a duration in milliseconds to human-readable string
     */
    static formatDuration(milliseconds) {
        if (milliseconds < 1000) {
            return `${milliseconds}ms`;
        }
        const seconds = Math.floor(milliseconds / 1000);
        if (seconds < 60) {
            return `${seconds}s`;
        }
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        if (minutes < 60) {
            return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
        }
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
    }
    /**
     * Deep clones an object
     */
    static deepClone(obj) {
        if (obj === null || typeof obj !== 'object') {
            return obj;
        }
        if (obj instanceof Date) {
            return new Date(obj.getTime());
        }
        if (obj instanceof Array) {
            return obj.map(item => this.deepClone(item));
        }
        if (typeof obj === 'object') {
            const cloned = {};
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    cloned[key] = this.deepClone(obj[key]);
                }
            }
            return cloned;
        }
        return obj;
    }
    /**
     * Validates flow execution result integrity
     */
    static validateFlowExecutionResult(result) {
        const errors = [];
        if (!result.executionId || !this.validateFlowId(result.executionId)) {
            errors.push('Invalid execution ID format');
        }
        if (!result.flowId || !this.validateFlowId(result.flowId)) {
            errors.push('Invalid flow ID format');
        }
        if (!Object.values(types_1.FlowStatus).includes(result.status)) {
            errors.push('Invalid flow status');
        }
        if (!result.startTime || !(result.startTime instanceof Date)) {
            errors.push('Invalid start time');
        }
        if (result.endTime && !(result.endTime instanceof Date)) {
            errors.push('Invalid end time');
        }
        if (result.endTime && result.startTime && result.endTime < result.startTime) {
            errors.push('End time cannot be before start time');
        }
        if (result.duration !== undefined && result.duration < 0) {
            errors.push('Duration cannot be negative');
        }
        return {
            valid: errors.length === 0,
            errors
        };
    }
}
exports.FlowUtils = FlowUtils;
/**
 * Export utility functions as individual exports for convenience
 */
exports.generateFlowId = FlowUtils.generateFlowId, exports.validateFlowId = FlowUtils.validateFlowId, exports.validateFlowConfig = FlowUtils.validateFlowConfig, exports.validateFlowStep = FlowUtils.validateFlowStep, exports.validateFlowCondition = FlowUtils.validateFlowCondition, exports.detectCircularDependencies = FlowUtils.detectCircularDependencies, exports.sanitizeFlowConfig = FlowUtils.sanitizeFlowConfig, exports.sanitizeFlowStep = FlowUtils.sanitizeFlowStep, exports.calculateFlowStats = FlowUtils.calculateFlowStats, exports.calculateFlowMetrics = FlowUtils.calculateFlowMetrics, exports.filterFlowExecutions = FlowUtils.filterFlowExecutions, exports.sortFlowExecutions = FlowUtils.sortFlowExecutions, exports.paginateFlowExecutions = FlowUtils.paginateFlowExecutions, exports.mergeFlowConfigs = FlowUtils.mergeFlowConfigs, exports.compareFlowConfigs = FlowUtils.compareFlowConfigs, exports.normalizeFlowConfig = FlowUtils.normalizeFlowConfig, exports.createFlowContext = FlowUtils.createFlowContext, exports.formatDuration = FlowUtils.formatDuration, exports.deepClone = FlowUtils.deepClone, exports.validateFlowExecutionResult = FlowUtils.validateFlowExecutionResult;
//# sourceMappingURL=utils.js.map