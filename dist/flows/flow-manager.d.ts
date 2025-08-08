import { IFlow, FlowContext, FlowExecutionResult, FlowManagerConfig, FlowStats, FlowMetrics, FlowQueryOptions, FlowBackup, FlowRestoreOptions, FlowLifecycleHooks, FlowEvent, FlowEventType, IFlowStorage } from './types';
/**
 * Flow manager for registering, executing, and managing flows
 */
export declare class FlowManager {
    private config;
    private flows;
    private executions;
    private activeExecutions;
    private executor;
    private storage?;
    private hooks;
    private eventListeners;
    private metrics;
    private metricsInterval?;
    private isInitialized;
    constructor(config?: Partial<FlowManagerConfig>, storage?: IFlowStorage, hooks?: FlowLifecycleHooks);
    /**
     * Initializes the flow manager
     */
    initialize(): Promise<void>;
    /**
     * Shuts down the flow manager
     */
    shutdown(): Promise<void>;
    /**
     * Registers a flow
     */
    registerFlow(flow: IFlow): Promise<void>;
    /**
     * Unregisters a flow
     */
    unregisterFlow(flowId: string): Promise<void>;
    /**
     * Gets a registered flow
     */
    getFlow(flowId: string): IFlow | undefined;
    /**
     * Lists all registered flows
     */
    listFlows(): IFlow[];
    /**
     * Executes a flow
     */
    executeFlow(flowId: string, input: Record<string, any>, context?: Partial<FlowContext>): Promise<FlowExecutionResult>;
    /**
     * Gets an execution result
     */
    getExecution(executionId: string): FlowExecutionResult | undefined;
    /**
     * Lists execution results
     */
    listExecutions(options?: FlowQueryOptions): Promise<FlowExecutionResult[]>;
    /**
     * Cancels an active execution
     */
    cancelExecution(executionId: string): Promise<void>;
    /**
     * Gets flow statistics
     */
    getFlowStats(): FlowStats;
    /**
     * Gets metrics for a specific flow
     */
    getFlowMetrics(flowId: string): FlowMetrics | undefined;
    /**
     * Gets metrics for all flows
     */
    getAllFlowMetrics(): Map<string, FlowMetrics>;
    /**
     * Adds an event listener
     */
    addEventListener(eventType: FlowEventType, listener: (event: FlowEvent) => void): void;
    /**
     * Removes an event listener
     */
    removeEventListener(eventType: FlowEventType, listener: (event: FlowEvent) => void): void;
    /**
     * Backs up flows and executions
     */
    backupFlows(): Promise<FlowBackup>;
    /**
     * Restores flows and executions from backup
     */
    restoreFlows(backup: FlowBackup, options?: FlowRestoreOptions): Promise<number>;
    /**
     * Gets the current configuration
     */
    getConfiguration(): FlowManagerConfig;
    /**
     * Updates the configuration
     */
    updateConfiguration(config: Partial<FlowManagerConfig>): void;
    /**
     * Gets health status
     */
    getHealthStatus(): {
        healthy: boolean;
        details: Record<string, any>;
    };
    /**
     * Internal method to execute a flow
     */
    private executeFlowInternal;
    /**
     * Loads flows from storage
     */
    private loadFlowsFromStorage;
    /**
     * Initializes metrics for a flow
     */
    private initializeFlowMetrics;
    /**
     * Updates metrics for a flow
     */
    private updateFlowMetrics;
    /**
     * Starts metrics collection
     */
    private startMetricsCollection;
    /**
     * Filters executions based on query options
     */
    private filterExecutions;
    /**
     * Sorts executions based on query options
     */
    private sortExecutions;
    /**
     * Paginates executions based on query options
     */
    private paginateExecutions;
    /**
     * Emits a flow event
     */
    private emitEvent;
    /**
     * Generates a unique execution ID
     */
    private generateExecutionId;
    /**
     * Creates an error with context
     */
    private createError;
}
//# sourceMappingURL=flow-manager.d.ts.map