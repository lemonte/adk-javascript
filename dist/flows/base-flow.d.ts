import { IFlow, FlowConfig, FlowContext, FlowExecutionResult, FlowValidationResult, FlowStatus, FlowStep, FlowStepResult, FlowEventType, FlowEvent } from './types';
/**
 * Abstract base class for all flow implementations
 */
export declare abstract class BaseFlow implements IFlow {
    protected _config: FlowConfig;
    protected _eventListeners: Map<FlowEventType, ((event: FlowEvent) => void)[]>;
    protected _isExecuting: boolean;
    protected _currentExecution?: {
        executionId: string;
        context: FlowContext;
        startTime: Date;
        stepResults: FlowStepResult[];
    };
    constructor(config: FlowConfig);
    /**
     * Gets the flow configuration
     */
    get config(): FlowConfig;
    /**
     * Gets whether the flow is currently executing
     */
    get isExecuting(): boolean;
    /**
     * Gets the current execution info
     */
    get currentExecution(): {
        executionId: string;
        context: FlowContext;
        startTime: Date;
        stepResults: FlowStepResult[];
    } | undefined;
    /**
     * Abstract method to execute the flow
     */
    abstract execute(context: FlowContext): Promise<FlowExecutionResult>;
    /**
     * Validates the flow configuration
     */
    validate(): FlowValidationResult;
    /**
     * Gets flow metadata
     */
    getMetadata(): Record<string, any>;
    /**
     * Creates a clone of the flow
     */
    abstract clone(): IFlow;
    /**
     * Adds an event listener
     */
    addEventListener(eventType: FlowEventType, listener: (event: FlowEvent) => void): void;
    /**
     * Removes an event listener
     */
    removeEventListener(eventType: FlowEventType, listener: (event: FlowEvent) => void): void;
    /**
     * Removes all event listeners
     */
    removeAllEventListeners(eventType?: FlowEventType): void;
    /**
     * Updates the flow configuration
     */
    updateConfig(config: Partial<FlowConfig>): void;
    /**
     * Gets a step by ID
     */
    getStep(stepId: string): FlowStep | undefined;
    /**
     * Gets all steps
     */
    getSteps(): FlowStep[];
    /**
     * Adds a step to the flow
     */
    addStep(step: FlowStep): void;
    /**
     * Updates a step in the flow
     */
    updateStep(stepId: string, updates: Partial<FlowStep>): void;
    /**
     * Removes a step from the flow
     */
    removeStep(stepId: string): void;
    /**
     * Creates a flow context
     */
    protected createContext(input: Record<string, any>, executionId?: string): FlowContext;
    /**
     * Creates a flow execution result
     */
    protected createExecutionResult(context: FlowContext, status: FlowStatus, startTime: Date, endTime?: Date, error?: Error, stepResults?: FlowStepResult[]): FlowExecutionResult;
    /**
     * Emits a flow event
     */
    protected emitEvent(event: FlowEvent): void;
    /**
     * Creates a flow event
     */
    protected createEvent(type: FlowEventType, executionId: string, data?: Record<string, any>, stepId?: string): FlowEvent;
    /**
     * Generates a unique execution ID
     */
    protected generateExecutionId(): string;
    /**
     * Validates the flow configuration
     */
    protected validateConfig(): FlowValidationResult;
    /**
     * Validates flow steps
     */
    protected validateSteps(): FlowValidationResult;
    /**
     * Validates step dependencies
     */
    protected validateDependencies(): FlowValidationResult;
    /**
     * Detects circular dependencies in the flow
     */
    protected detectCircularDependencies(): string[];
    /**
     * Gets the execution timeout for the flow
     */
    protected getExecutionTimeout(): number;
    /**
     * Checks if the flow execution should be cancelled
     */
    protected shouldCancel(startTime: Date): boolean;
    /**
     * Creates an error with flow context
     */
    protected createError(code: string, message: string, cause?: Error): Error;
}
//# sourceMappingURL=base-flow.d.ts.map