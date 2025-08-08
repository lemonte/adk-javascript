/**
 * Base tool implementation for the ADK JavaScript SDK
 */
import { ToolDefinition, InvocationContext, SessionState } from '../types';
import { Logger } from '../utils';
/**
 * Tool context passed to tool execution
 */
export interface ToolContext {
    context: InvocationContext;
    sessionState: SessionState;
    metadata?: Record<string, any>;
}
/**
 * Base tool configuration
 */
export interface BaseToolConfig {
    name: string;
    description: string;
    parameters?: {
        type: 'object';
        properties: Record<string, any>;
        required?: string[];
    };
    metadata?: Record<string, any>;
    isLongRunning?: boolean;
}
/**
 * Abstract base class for all tools in the ADK
 */
export declare abstract class BaseTool {
    readonly name: string;
    readonly description: string;
    readonly parameters: {
        type: 'object';
        properties: Record<string, any>;
        required?: string[];
    };
    readonly metadata: Record<string, any>;
    readonly isLongRunning: boolean;
    protected logger: Logger;
    constructor(config: BaseToolConfig);
    /**
     * Abstract method to execute the tool
     */
    abstract execute(args: Record<string, any>, context: ToolContext): Promise<any> | any;
    /**
     * Call method that wraps execute for compatibility
     */
    call(args: Record<string, any>, context: ToolContext): Promise<any>;
    /**
     * Get the tool definition for the model
     */
    getDefinition(): ToolDefinition;
    /**
     * Validate tool arguments against the schema
     */
    protected validateArguments(args: Record<string, any>): void;
    /**
     * Validate a value against a JSON schema type
     */
    private validateType;
    /**
     * Initialize the tool (optional)
     */
    initialize?(): Promise<void>;
    /**
     * Cleanup the tool (optional)
     */
    cleanup?(): Promise<void>;
    /**
     * Get tool information
     */
    getInfo(): {
        name: string;
        description: string;
        parameters: any;
        metadata: Record<string, any>;
    };
    /**
     * Validate tool configuration
     */
    protected validateConfig(): void;
    /**
     * Create a safe execution wrapper
     */
    protected safeExecute<T>(operation: () => Promise<T> | T, errorMessage?: string): Promise<T>;
    /**
     * Log tool execution
     */
    protected logExecution(args: Record<string, any>, result: any): void;
}
//# sourceMappingURL=base-tool.d.ts.map