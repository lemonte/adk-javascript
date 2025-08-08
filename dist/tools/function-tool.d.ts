/**
 * Function tool implementation for the ADK JavaScript SDK
 */
import { BaseTool, BaseToolConfig, ToolContext } from './base-tool';
/**
 * Function tool configuration
 */
export interface FunctionToolConfig extends Omit<BaseToolConfig, 'name' | 'description'> {
    func: Function;
    name?: string;
    description?: string;
}
/**
 * Tool that wraps a JavaScript function
 */
export declare class FunctionTool extends BaseTool {
    private readonly func;
    private readonly isAsync;
    constructor(config: FunctionToolConfig);
    /**
     * Execute the wrapped function
     */
    execute(args: Record<string, any>, context: ToolContext): Promise<any>;
    /**
     * Prepare arguments for function execution
     */
    private prepareFunctionArguments;
    /**
     * Get function parameter names
     */
    private getFunctionParameterNames;
    /**
     * Infer parameters from function signature
     */
    static inferParameters(func: Function): {
        type: 'object';
        properties: Record<string, any>;
        required?: string[];
    };
}
/**
 * Create a function tool from a JavaScript function
 */
export declare function createTool(func: Function, config?: Partial<FunctionToolConfig>): FunctionTool;
/**
 * Decorator for creating tools from functions
 */
export declare function tool(config?: Partial<Omit<FunctionToolConfig, 'func'>>): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
//# sourceMappingURL=function-tool.d.ts.map