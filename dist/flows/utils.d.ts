import { FlowConfig, FlowContext, FlowExecutionResult, FlowStep, FlowCondition, FlowQueryOptions, FlowValidationResult, FlowStats, FlowMetrics } from './types';
/**
 * Utility functions for flow management
 */
export declare class FlowUtils {
    /**
     * Generates a unique flow ID
     */
    static generateFlowId(prefix?: string): string;
    /**
     * Validates a flow ID format
     */
    static validateFlowId(id: string): boolean;
    /**
     * Validates a flow configuration
     */
    static validateFlowConfig(config: FlowConfig): FlowValidationResult;
    /**
     * Validates a flow step
     */
    static validateFlowStep(step: FlowStep, index: number): string[];
    /**
     * Validates a flow condition
     */
    static validateFlowCondition(condition: FlowCondition, prefix: string): string[];
    /**
     * Detects circular dependencies in flow steps
     */
    static detectCircularDependencies(steps: FlowStep[]): string[];
    /**
     * Sanitizes flow configuration
     */
    static sanitizeFlowConfig(config: FlowConfig): FlowConfig;
    /**
     * Sanitizes a flow step
     */
    static sanitizeFlowStep(step: FlowStep): FlowStep;
    /**
     * Calculates flow execution statistics
     */
    static calculateFlowStats(executions: FlowExecutionResult[]): FlowStats;
    /**
     * Calculates metrics for a specific flow
     */
    static calculateFlowMetrics(flowId: string, executions: FlowExecutionResult[]): FlowMetrics;
    /**
     * Filters flow executions based on query options
     */
    static filterFlowExecutions(executions: FlowExecutionResult[], options: FlowQueryOptions): FlowExecutionResult[];
    /**
     * Sorts flow executions
     */
    static sortFlowExecutions(executions: FlowExecutionResult[], sortBy?: string, sortOrder?: 'asc' | 'desc'): FlowExecutionResult[];
    /**
     * Paginates flow executions
     */
    static paginateFlowExecutions(executions: FlowExecutionResult[], limit?: number, offset?: number): FlowExecutionResult[];
    /**
     * Merges flow configurations
     */
    static mergeFlowConfigs(base: FlowConfig, override: Partial<FlowConfig>): FlowConfig;
    /**
     * Compares two flow configurations
     */
    static compareFlowConfigs(config1: FlowConfig, config2: FlowConfig): boolean;
    /**
     * Normalizes a flow configuration for comparison
     */
    static normalizeFlowConfig(config: FlowConfig): FlowConfig;
    /**
     * Creates a flow execution context
     */
    static createFlowContext(executionId: string, flowId: string, input?: Record<string, any>, metadata?: Record<string, any>): FlowContext;
    /**
     * Formats a duration in milliseconds to human-readable string
     */
    static formatDuration(milliseconds: number): string;
    /**
     * Deep clones an object
     */
    static deepClone<T>(obj: T): T;
    /**
     * Validates flow execution result integrity
     */
    static validateFlowExecutionResult(result: FlowExecutionResult): FlowValidationResult;
}
/**
 * Export utility functions as individual exports for convenience
 */
export declare const generateFlowId: typeof FlowUtils.generateFlowId, validateFlowId: typeof FlowUtils.validateFlowId, validateFlowConfig: typeof FlowUtils.validateFlowConfig, validateFlowStep: typeof FlowUtils.validateFlowStep, validateFlowCondition: typeof FlowUtils.validateFlowCondition, detectCircularDependencies: typeof FlowUtils.detectCircularDependencies, sanitizeFlowConfig: typeof FlowUtils.sanitizeFlowConfig, sanitizeFlowStep: typeof FlowUtils.sanitizeFlowStep, calculateFlowStats: typeof FlowUtils.calculateFlowStats, calculateFlowMetrics: typeof FlowUtils.calculateFlowMetrics, filterFlowExecutions: typeof FlowUtils.filterFlowExecutions, sortFlowExecutions: typeof FlowUtils.sortFlowExecutions, paginateFlowExecutions: typeof FlowUtils.paginateFlowExecutions, mergeFlowConfigs: typeof FlowUtils.mergeFlowConfigs, compareFlowConfigs: typeof FlowUtils.compareFlowConfigs, normalizeFlowConfig: typeof FlowUtils.normalizeFlowConfig, createFlowContext: typeof FlowUtils.createFlowContext, formatDuration: typeof FlowUtils.formatDuration, deepClone: typeof FlowUtils.deepClone, validateFlowExecutionResult: typeof FlowUtils.validateFlowExecutionResult;
//# sourceMappingURL=utils.d.ts.map