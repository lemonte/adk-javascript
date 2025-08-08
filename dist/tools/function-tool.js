"use strict";
/**
 * Function tool implementation for the ADK JavaScript SDK
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.FunctionTool = void 0;
exports.createTool = createTool;
exports.tool = tool;
const base_tool_1 = require("./base-tool");
const types_1 = require("../types");
/**
 * Tool that wraps a JavaScript function
 */
class FunctionTool extends base_tool_1.BaseTool {
    constructor(config) {
        // Extract function metadata
        const name = config.name || config.func.name || 'anonymous_function';
        const description = config.description || `Function tool: ${name}`;
        super({
            name,
            description,
            parameters: config.parameters || FunctionTool.inferParameters(config.func),
            metadata: config.metadata
        });
        this.func = config.func;
        this.isAsync = this.func.constructor.name === 'AsyncFunction';
    }
    /**
     * Execute the wrapped function
     */
    async execute(args, context) {
        return this.safeExecute(async () => {
            // Validate arguments
            this.validateArguments(args);
            // Prepare function arguments
            const functionArgs = this.prepareFunctionArguments(args, context);
            // Execute the function
            let result;
            if (this.isAsync) {
                result = await this.func(...functionArgs);
            }
            else {
                result = this.func(...functionArgs);
            }
            // Log execution
            this.logExecution(args, result);
            return result;
        });
    }
    /**
     * Prepare arguments for function execution
     */
    prepareFunctionArguments(args, context) {
        const functionArgs = [];
        const paramNames = this.getFunctionParameterNames();
        // Add arguments in order of function parameters
        for (const paramName of paramNames) {
            if (paramName === 'toolContext' || paramName === 'context') {
                // Special parameter for tool context
                functionArgs.push(context);
            }
            else if (paramName in args) {
                functionArgs.push(args[paramName]);
            }
            else {
                // Check if parameter is required
                const isRequired = this.parameters.required?.includes(paramName) || false;
                if (isRequired) {
                    throw new types_1.ToolError(`Missing required parameter: ${paramName}`);
                }
                functionArgs.push(undefined);
            }
        }
        return functionArgs;
    }
    /**
     * Get function parameter names
     */
    getFunctionParameterNames() {
        const funcStr = this.func.toString();
        const match = funcStr.match(/\(([^)]*)\)/);
        if (!match || !match[1]) {
            return [];
        }
        return match[1]
            .split(',')
            .map(param => param.trim().split('=')[0].trim())
            .filter(param => param.length > 0);
    }
    /**
     * Infer parameters from function signature
     */
    static inferParameters(func) {
        const funcStr = func.toString();
        const match = funcStr.match(/\(([^)]*)\)/);
        if (!match || !match[1]) {
            return {
                type: 'object',
                properties: {},
                required: []
            };
        }
        const params = match[1]
            .split(',')
            .map(param => param.trim())
            .filter(param => param.length > 0);
        const properties = {};
        const required = [];
        for (const param of params) {
            const [name, defaultValue] = param.split('=').map(p => p.trim());
            // Skip special context parameters
            if (name === 'toolContext' || name === 'context') {
                continue;
            }
            properties[name] = {
                type: 'string', // Default to string, can be overridden in config
                description: `Parameter ${name}`
            };
            // If no default value, consider it required
            if (defaultValue === undefined) {
                required.push(name);
            }
        }
        return {
            type: 'object',
            properties,
            required: required.length > 0 ? required : undefined
        };
    }
}
exports.FunctionTool = FunctionTool;
/**
 * Create a function tool from a JavaScript function
 */
function createTool(func, config) {
    return new FunctionTool({
        func,
        ...config
    });
}
/**
 * Decorator for creating tools from functions
 */
function tool(config) {
    return function (target, propertyKey, descriptor) {
        const originalMethod = descriptor.value;
        // Create the tool
        const toolInstance = new FunctionTool({
            func: originalMethod,
            name: config?.name || propertyKey,
            description: config?.description || `Tool: ${propertyKey}`,
            ...config
        });
        // Replace the method with the tool
        descriptor.value = toolInstance;
        return descriptor;
    };
}
//# sourceMappingURL=function-tool.js.map