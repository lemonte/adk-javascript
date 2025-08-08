"use strict";
/**
 * Base tool implementation for the ADK JavaScript SDK
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseTool = void 0;
const types_1 = require("../types");
const utils_1 = require("../utils");
/**
 * Abstract base class for all tools in the ADK
 */
class BaseTool {
    constructor(config) {
        this.name = config.name;
        this.description = config.description;
        this.parameters = config.parameters || {
            type: 'object',
            properties: {},
            required: []
        };
        this.metadata = config.metadata || {};
        this.isLongRunning = config.isLongRunning || false;
        this.logger = new utils_1.Logger(`Tool:${this.name}`);
        this.validateConfig();
    }
    /**
     * Call method that wraps execute for compatibility
     */
    async call(args, context) {
        return await this.execute(args, context);
    }
    /**
     * Get the tool definition for the model
     */
    getDefinition() {
        return {
            type: 'function',
            function: {
                name: this.name,
                description: this.description,
                parameters: this.parameters
            }
        };
    }
    /**
     * Validate tool arguments against the schema
     */
    validateArguments(args) {
        // Check required parameters
        if (this.parameters.required) {
            for (const required of this.parameters.required) {
                if (!(required in args)) {
                    throw new types_1.ToolError(`Missing required parameter: ${required}`, { tool: this.name, parameter: required });
                }
            }
        }
        // Basic type validation
        for (const [key, value] of Object.entries(args)) {
            const paramSchema = this.parameters.properties[key];
            if (paramSchema && paramSchema.type) {
                if (!this.validateType(value, paramSchema.type)) {
                    throw new types_1.ToolError(`Invalid type for parameter ${key}. Expected ${paramSchema.type}, got ${typeof value}`, { tool: this.name, parameter: key, expectedType: paramSchema.type, actualType: typeof value });
                }
            }
        }
    }
    /**
     * Validate a value against a JSON schema type
     */
    validateType(value, expectedType) {
        switch (expectedType) {
            case 'string':
                return typeof value === 'string';
            case 'number':
                return typeof value === 'number' && !isNaN(value);
            case 'integer':
                return typeof value === 'number' && Number.isInteger(value);
            case 'boolean':
                return typeof value === 'boolean';
            case 'array':
                return Array.isArray(value);
            case 'object':
                return typeof value === 'object' && value !== null && !Array.isArray(value);
            case 'null':
                return value === null;
            default:
                return true; // Unknown type, assume valid
        }
    }
    /**
     * Get tool information
     */
    getInfo() {
        return {
            name: this.name,
            description: this.description,
            parameters: this.parameters,
            metadata: this.metadata
        };
    }
    /**
     * Validate tool configuration
     */
    validateConfig() {
        if (!this.name || this.name.trim() === '') {
            throw new types_1.ToolError('Tool name is required');
        }
        if (!this.description || this.description.trim() === '') {
            throw new types_1.ToolError('Tool description is required');
        }
        // Validate name format (should be valid function name)
        const nameRegex = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
        if (!nameRegex.test(this.name)) {
            throw new types_1.ToolError('Tool name must be a valid identifier (letters, numbers, underscore, starting with letter or underscore)');
        }
    }
    /**
     * Create a safe execution wrapper
     */
    async safeExecute(operation, errorMessage) {
        try {
            return await operation();
        }
        catch (error) {
            const message = errorMessage || `Tool ${this.name} execution failed`;
            this.logger.error(message, error);
            if (error instanceof types_1.ToolError) {
                throw error;
            }
            throw new types_1.ToolError(message, {
                tool: this.name,
                originalError: error instanceof Error ? error.message : String(error)
            });
        }
    }
    /**
     * Log tool execution
     */
    logExecution(args, result) {
        this.logger.debug(`Executed tool ${this.name}`, {
            arguments: args,
            result: typeof result === 'object' ? JSON.stringify(result) : result
        });
    }
}
exports.BaseTool = BaseTool;
//# sourceMappingURL=base-tool.js.map