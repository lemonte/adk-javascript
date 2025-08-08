/**
 * Flow types and interfaces
 */
/**
 * Flow execution status
 */
export declare enum FlowStatus {
    PENDING = "pending",
    RUNNING = "running",
    COMPLETED = "completed",
    FAILED = "failed",
    CANCELLED = "cancelled",
    PAUSED = "paused"
}
/**
 * Flow execution priority
 */
export declare enum FlowPriority {
    LOW = "low",
    NORMAL = "normal",
    HIGH = "high",
    CRITICAL = "critical"
}
/**
 * Flow execution mode
 */
export declare enum FlowExecutionMode {
    SEQUENTIAL = "sequential",
    PARALLEL = "parallel",
    CONDITIONAL = "conditional",
    LOOP = "loop"
}
/**
 * Flow event types
 */
export declare enum FlowEventType {
    FLOW_STARTED = "flow_started",
    FLOW_COMPLETED = "flow_completed",
    FLOW_FAILED = "flow_failed",
    FLOW_CANCELLED = "flow_cancelled",
    FLOW_PAUSED = "flow_paused",
    FLOW_RESUMED = "flow_resumed",
    STEP_STARTED = "step_started",
    STEP_COMPLETED = "step_completed",
    STEP_FAILED = "step_failed",
    STEP_SKIPPED = "step_skipped"
}
/**
 * Flow context for execution
 */
export interface FlowContext {
    /** Unique execution ID */
    executionId: string;
    /** Flow ID */
    flowId: string;
    /** User ID */
    userId?: string;
    /** Session ID */
    sessionId?: string;
    /** Input data */
    input: Record<string, any>;
    /** Output data */
    output: Record<string, any>;
    /** Intermediate variables */
    variables: Record<string, any>;
    /** Execution metadata */
    metadata: Record<string, any>;
    /** Parent context (for nested flows) */
    parent?: FlowContext;
    /** Child contexts */
    children: FlowContext[];
}
/**
 * Flow step definition
 */
export interface FlowStep {
    /** Step ID */
    id: string;
    /** Step name */
    name: string;
    /** Step type */
    type: string;
    /** Step configuration */
    config: Record<string, any>;
    /** Input mapping */
    inputs?: Record<string, string>;
    /** Output mapping */
    outputs?: Record<string, string>;
    /** Conditions for execution */
    conditions?: FlowCondition[];
    /** Retry configuration */
    retry?: FlowRetryConfig;
    /** Timeout in milliseconds */
    timeout?: number;
    /** Dependencies (step IDs that must complete first) */
    dependencies?: string[];
    /** Whether step is optional */
    optional?: boolean;
    /** Step metadata */
    metadata?: Record<string, any>;
}
/**
 * Flow condition for conditional execution
 */
export interface FlowCondition {
    /** Condition type */
    type: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'exists' | 'custom';
    /** Variable to check */
    variable: string;
    /** Expected value */
    value?: any;
    /** Custom condition function */
    condition?: (context: FlowContext) => boolean;
    /** Logical operator for multiple conditions */
    operator?: 'and' | 'or';
}
/**
 * Flow retry configuration
 */
export interface FlowRetryConfig {
    /** Maximum number of retries */
    maxRetries: number;
    /** Delay between retries in milliseconds */
    delay: number;
    /** Backoff strategy */
    backoff?: 'linear' | 'exponential' | 'fixed';
    /** Maximum delay in milliseconds */
    maxDelay?: number;
    /** Conditions for retry */
    retryOn?: string[];
}
/**
 * Flow configuration
 */
export interface FlowConfig {
    /** Flow ID */
    id: string;
    /** Flow name */
    name: string;
    /** Flow description */
    description?: string;
    /** Flow version */
    version: string;
    /** Flow steps */
    steps: FlowStep[];
    /** Flow execution mode */
    mode: FlowExecutionMode;
    /** Flow priority */
    priority?: FlowPriority;
    /** Flow timeout in milliseconds */
    timeout?: number;
    /** Flow retry configuration */
    retry?: FlowRetryConfig;
    /** Flow metadata */
    metadata?: Record<string, any>;
    /** Flow tags */
    tags?: string[];
    /** Flow variables */
    variables?: Record<string, any>;
    /** Flow input schema */
    inputSchema?: Record<string, any>;
    /** Flow output schema */
    outputSchema?: Record<string, any>;
}
/**
 * Flow execution result
 */
export interface FlowExecutionResult {
    /** Execution ID */
    executionId: string;
    /** Flow ID */
    flowId: string;
    /** Execution status */
    status: FlowStatus;
    /** Input data */
    input: Record<string, any>;
    /** Output data */
    output: Record<string, any>;
    /** Execution error */
    error?: Error;
    /** Execution start time */
    startTime: Date;
    /** Execution end time */
    endTime?: Date;
    /** Execution duration in milliseconds */
    duration?: number;
    /** Step results */
    stepResults: FlowStepResult[];
    /** Execution metadata */
    metadata: Record<string, any>;
}
/**
 * Flow step execution result
 */
export interface FlowStepResult {
    /** Step ID */
    stepId: string;
    /** Step name */
    stepName: string;
    /** Execution status */
    status: FlowStatus;
    /** Input data */
    input: Record<string, any>;
    /** Output data */
    output: Record<string, any>;
    /** Execution error */
    error?: Error;
    /** Execution start time */
    startTime: Date;
    /** Execution end time */
    endTime?: Date;
    /** Execution duration in milliseconds */
    duration?: number;
    /** Retry attempts */
    retryAttempts: number;
    /** Step metadata */
    metadata: Record<string, any>;
}
/**
 * Flow event
 */
export interface FlowEvent {
    /** Event type */
    type: FlowEventType;
    /** Execution ID */
    executionId: string;
    /** Flow ID */
    flowId: string;
    /** Step ID (for step events) */
    stepId?: string;
    /** Event timestamp */
    timestamp: Date;
    /** Event data */
    data: Record<string, any>;
    /** User ID */
    userId?: string;
    /** Session ID */
    sessionId?: string;
}
/**
 * Flow manager configuration
 */
export interface FlowManagerConfig {
    /** Maximum concurrent executions */
    maxConcurrentExecutions: number;
    /** Default flow timeout in milliseconds */
    defaultTimeout: number;
    /** Default retry configuration */
    defaultRetry: FlowRetryConfig;
    /** Enable flow persistence */
    enablePersistence: boolean;
    /** Persistence storage path */
    persistencePath?: string;
    /** Enable flow metrics */
    enableMetrics: boolean;
    /** Metrics collection interval in milliseconds */
    metricsInterval: number;
    /** Enable flow events */
    enableEvents: boolean;
    /** Event buffer size */
    eventBufferSize: number;
}
/**
 * Flow executor configuration
 */
export interface FlowExecutorConfig {
    /** Maximum concurrent steps */
    maxConcurrentSteps: number;
    /** Step execution timeout in milliseconds */
    stepTimeout: number;
    /** Enable step retry */
    enableRetry: boolean;
    /** Default step retry configuration */
    defaultStepRetry: FlowRetryConfig;
    /** Enable step caching */
    enableCaching: boolean;
    /** Cache TTL in milliseconds */
    cacheTtl: number;
}
/**
 * Flow statistics
 */
export interface FlowStats {
    /** Total flows */
    totalFlows: number;
    /** Active executions */
    activeExecutions: number;
    /** Completed executions */
    completedExecutions: number;
    /** Failed executions */
    failedExecutions: number;
    /** Average execution time */
    averageExecutionTime: number;
    /** Success rate */
    successRate: number;
    /** Error rate */
    errorRate: number;
    /** Throughput (executions per minute) */
    throughput: number;
}
/**
 * Flow metrics
 */
export interface FlowMetrics {
    /** Execution count */
    executionCount: number;
    /** Success count */
    successCount: number;
    /** Failure count */
    failureCount: number;
    /** Average duration */
    averageDuration: number;
    /** Min duration */
    minDuration: number;
    /** Max duration */
    maxDuration: number;
    /** Throughput */
    throughput: number;
    /** Error rate */
    errorRate: number;
    /** Last execution time */
    lastExecutionTime?: Date;
}
/**
 * Flow query options
 */
export interface FlowQueryOptions {
    /** Filter by status */
    status?: FlowStatus;
    /** Filter by priority */
    priority?: FlowPriority;
    /** Filter by tags */
    tags?: string[];
    /** Filter by execution date range */
    executedAfter?: Date;
    /** Filter by execution date range */
    executedBefore?: Date;
    /** Filter by user ID */
    userId?: string;
    /** Filter by session ID */
    sessionId?: string;
    /** Sort by field */
    sortBy?: 'createdAt' | 'executedAt' | 'duration' | 'priority';
    /** Sort order */
    sortOrder?: 'asc' | 'desc';
    /** Limit results */
    limit?: number;
    /** Offset for pagination */
    offset?: number;
}
/**
 * Flow backup data
 */
export interface FlowBackup {
    /** Backup timestamp */
    timestamp: Date;
    /** Backup version */
    version: string;
    /** Flow configurations */
    flows: FlowConfig[];
    /** Execution results */
    executions: FlowExecutionResult[];
    /** Backup metadata */
    metadata: Record<string, any>;
}
/**
 * Flow restore options
 */
export interface FlowRestoreOptions {
    /** Overwrite existing flows */
    overwrite: boolean;
    /** Restore executions */
    restoreExecutions: boolean;
    /** Validate flows before restore */
    validate: boolean;
    /** Backup existing data */
    backup: boolean;
}
/**
 * Flow validation result
 */
export interface FlowValidationResult {
    /** Whether flow is valid */
    valid: boolean;
    /** Validation errors */
    errors: string[];
    /** Validation warnings */
    warnings: string[];
}
/**
 * Flow lifecycle hooks
 */
export interface FlowLifecycleHooks {
    /** Before flow execution */
    beforeExecution?: (context: FlowContext) => Promise<void>;
    /** After flow execution */
    afterExecution?: (result: FlowExecutionResult) => Promise<void>;
    /** Before step execution */
    beforeStep?: (step: FlowStep, context: FlowContext) => Promise<void>;
    /** After step execution */
    afterStep?: (step: FlowStep, result: FlowStepResult, context: FlowContext) => Promise<void>;
    /** On flow error */
    onError?: (error: Error, context: FlowContext) => Promise<void>;
    /** On step error */
    onStepError?: (error: Error, step: FlowStep, context: FlowContext) => Promise<void>;
}
/**
 * Base flow interface
 */
export interface IFlow {
    /** Flow configuration */
    config: FlowConfig;
    /** Execute the flow */
    execute(context: FlowContext): Promise<FlowExecutionResult>;
    /** Validate the flow */
    validate(): FlowValidationResult;
    /** Get flow metadata */
    getMetadata(): Record<string, any>;
    /** Clone the flow */
    clone(): IFlow;
}
/**
 * Flow step executor interface
 */
export interface IFlowStepExecutor {
    /** Execute a step */
    executeStep(step: FlowStep, context: FlowContext): Promise<FlowStepResult>;
    /** Validate a step */
    validateStep(step: FlowStep): FlowValidationResult;
    /** Get supported step types */
    getSupportedTypes(): string[];
}
/**
 * Flow storage interface
 */
export interface IFlowStorage {
    /** Save flow configuration */
    saveFlow(flow: FlowConfig): Promise<void>;
    /** Load flow configuration */
    loadFlow(flowId: string): Promise<FlowConfig | null>;
    /** Delete flow configuration */
    deleteFlow(flowId: string): Promise<void>;
    /** List flows */
    listFlows(options?: FlowQueryOptions): Promise<FlowConfig[]>;
    /** Save execution result */
    saveExecution(result: FlowExecutionResult): Promise<void>;
    /** Load execution result */
    loadExecution(executionId: string): Promise<FlowExecutionResult | null>;
    /** List executions */
    listExecutions(options?: FlowQueryOptions): Promise<FlowExecutionResult[]>;
}
//# sourceMappingURL=types.d.ts.map