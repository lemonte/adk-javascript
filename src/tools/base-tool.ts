/**
 * Base tool implementation for the ADK JavaScript SDK
 */

import {
  ToolDefinition,
  InvocationContext,
  SessionState,
  ToolError
} from '../types';
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
export abstract class BaseTool {
  public readonly name: string;
  public readonly description: string;
  public readonly parameters: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
  public readonly metadata: Record<string, any>;
  public readonly isLongRunning: boolean;
  protected logger: Logger;

  constructor(config: BaseToolConfig) {
    this.name = config.name;
    this.description = config.description;
    this.parameters = config.parameters || {
      type: 'object',
      properties: {},
      required: []
    };
    this.metadata = config.metadata || {};
    this.isLongRunning = config.isLongRunning || false;
    this.logger = new Logger(`Tool:${this.name}`);
    
    this.validateConfig();
  }

  /**
   * Abstract method to execute the tool
   */
  abstract execute(
    args: Record<string, any>,
    context: ToolContext
  ): Promise<any> | any;

  /**
   * Call method that wraps execute for compatibility
   */
  async call(
    args: Record<string, any>,
    context: ToolContext
  ): Promise<any> {
    return await this.execute(args, context);
  }

  /**
   * Get the tool definition for the model
   */
  getDefinition(): ToolDefinition {
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
  protected validateArguments(args: Record<string, any>): void {
    // Check required parameters
    if (this.parameters.required) {
      for (const required of this.parameters.required) {
        if (!(required in args)) {
          throw new ToolError(
            `Missing required parameter: ${required}`,
            { tool: this.name, parameter: required }
          );
        }
      }
    }

    // Basic type validation
    for (const [key, value] of Object.entries(args)) {
      const paramSchema = this.parameters.properties[key];
      if (paramSchema && paramSchema.type) {
        if (!this.validateType(value, paramSchema.type)) {
          throw new ToolError(
            `Invalid type for parameter ${key}. Expected ${paramSchema.type}, got ${typeof value}`,
            { tool: this.name, parameter: key, expectedType: paramSchema.type, actualType: typeof value }
          );
        }
      }
    }
  }

  /**
   * Validate a value against a JSON schema type
   */
  private validateType(value: any, expectedType: string): boolean {
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
   * Initialize the tool (optional)
   */
  async initialize?(): Promise<void>;

  /**
   * Cleanup the tool (optional)
   */
  async cleanup?(): Promise<void>;

  /**
   * Get tool information
   */
  getInfo(): {
    name: string;
    description: string;
    parameters: any;
    metadata: Record<string, any>;
  } {
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
  protected validateConfig(): void {
    if (!this.name || this.name.trim() === '') {
      throw new ToolError('Tool name is required');
    }

    if (!this.description || this.description.trim() === '') {
      throw new ToolError('Tool description is required');
    }

    // Validate name format (should be valid function name)
    const nameRegex = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
    if (!nameRegex.test(this.name)) {
      throw new ToolError(
        'Tool name must be a valid identifier (letters, numbers, underscore, starting with letter or underscore)'
      );
    }
  }

  /**
   * Create a safe execution wrapper
   */
  protected async safeExecute<T>(
    operation: () => Promise<T> | T,
    errorMessage?: string
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      const message = errorMessage || `Tool ${this.name} execution failed`;
      this.logger.error(message, error);
      
      if (error instanceof ToolError) {
        throw error;
      }
      
      throw new ToolError(
        message,
        {
          tool: this.name,
          originalError: error instanceof Error ? error.message : String(error)
        }
      );
    }
  }

  /**
   * Log tool execution
   */
  protected logExecution(args: Record<string, any>, result: any): void {
    this.logger.debug(`Executed tool ${this.name}`, {
      arguments: args,
      result: typeof result === 'object' ? JSON.stringify(result) : result
    });
  }
}