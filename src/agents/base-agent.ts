/**
 * Base agent implementation for the ADK JavaScript SDK
 */

import { EventEmitter } from 'events';
import {
  Content,
  InvocationContext,
  SessionState,
  FunctionCall,
  FunctionResponse,
  AdkError,
  Plugin
} from '../types';
import { BaseTool } from '../tools/index';
import { Event, EventType } from '../events/index';
import { Logger } from '../utils/index';

/**
 * Base agent configuration
 */
export interface BaseAgentConfig {
  name: string;
  description?: string;
  instruction?: string;
  tools?: BaseTool[];
  plugins?: Plugin[];
  metadata?: Record<string, any>;
  subAgents?: BaseAgent[];
}

/**
 * Abstract base class for all agents in the ADK
 */
export abstract class BaseAgent extends EventEmitter {
  public readonly name: string;
  public readonly description?: string;
  public readonly instruction?: string;
  public readonly tools: BaseTool[];
  public readonly plugins: Plugin[];
  public readonly metadata: Record<string, any>;
  public readonly subAgents: BaseAgent[];
  public parentAgent?: BaseAgent;
  protected logger: Logger;

  constructor(config: BaseAgentConfig) {
    super();
    this.name = config.name;
    this.description = config.description;
    this.instruction = config.instruction;
    this.tools = config.tools || [];
    this.plugins = config.plugins || [];
    this.metadata = config.metadata || {};
    this.subAgents = config.subAgents || [];
    this.logger = new Logger(`Agent:${this.name}`);
    this.validateConfig();
  }

  /**
   * Gets the root agent of this agent
   */
  get rootAgent(): BaseAgent {
    let rootAgent: BaseAgent = this;
    while (rootAgent.parentAgent) {
      rootAgent = rootAgent.parentAgent;
    }
    return rootAgent;
  }

  /**
   * Abstract method to run the agent with a message
   */
  abstract run(
    message: Content,
    context: InvocationContext,
    sessionState?: SessionState
  ): Promise<AsyncGenerator<Event, void, unknown>>;

  /**
   * Get tool by name
   */
  protected getTool(name: string): BaseTool | undefined {
    return this.tools.find(tool => tool.name === name);
  }

  /**
   * Execute a tool call
   */
  protected async executeTool(
    toolCall: FunctionCall,
    context: InvocationContext,
    sessionState?: SessionState
  ): Promise<FunctionResponse> {
    const tool = this.getTool(toolCall.name);
    if (!tool) {
      throw new AdkError(`Tool '${toolCall.name}' not found`);
    }

    try {
      // Emit tool call event
      this.emit('toolCall', {
        type: EventType.TOOL_CALL,
        toolCall,
        context,
        timestamp: new Date()
      });

      // Execute plugin callbacks
      await this.executePluginCallbacks('beforeToolCall', context, toolCall);

      // Execute the tool
      const result = await tool.execute(toolCall.arguments, {
        context,
        sessionState: sessionState || {}
      });

      const response: FunctionResponse = {
        name: toolCall.name,
        content: typeof result === 'string' ? result : JSON.stringify(result),
        id: toolCall.id
      };

      // Execute plugin callbacks
      await this.executePluginCallbacks('afterToolCall', context, toolCall, result);

      // Emit tool response event
      this.emit('toolResponse', {
        type: EventType.TOOL_RESPONSE,
        toolCall,
        response,
        context,
        timestamp: new Date()
      });

      return response;
    } catch (error) {
      const errorResponse: FunctionResponse = {
        name: toolCall.name,
        content: '',
        id: toolCall.id,
        error: error instanceof Error ? error.message : String(error)
      };

      // Execute plugin error callbacks
      await this.executePluginCallbacks('onError', context, error);

      this.emit('toolError', {
        type: EventType.TOOL_RESPONSE,
        toolCall,
        response: errorResponse,
        error,
        context,
        timestamp: new Date()
      });

      return errorResponse;
    }
  }

  /**
   * Execute plugin callbacks
   */
  protected async executePluginCallbacks(
    callbackName: keyof Plugin,
    context: InvocationContext,
    ...args: any[]
  ): Promise<void> {
    for (const plugin of this.plugins) {
      const callback = plugin[callbackName] as Function;
      if (callback) {
        try {
          await callback.call(plugin, context, ...args);
        } catch (error) {
          this.logger.error(`Plugin ${plugin.name} callback ${callbackName} failed:`, error);
        }
      }
    }
  }

  /**
   * Initialize the agent and its plugins
   */
  async initialize(): Promise<void> {
    this.logger.info(`Initializing agent: ${this.name}`);
    
    // Initialize plugins
    for (const plugin of this.plugins) {
      if (plugin.initialize) {
        try {
          await plugin.initialize();
          this.logger.debug(`Plugin ${plugin.name} initialized`);
        } catch (error) {
          this.logger.error(`Failed to initialize plugin ${plugin.name}:`, error);
        }
      }
    }

    // Initialize tools
    for (const tool of this.tools) {
      if (tool.initialize) {
        try {
          await tool.initialize();
          this.logger.debug(`Tool ${tool.name} initialized`);
        } catch (error) {
          this.logger.error(`Failed to initialize tool ${tool.name}:`, error);
        }
      }
    }
  }

  /**
   * Get agent information
   */
  getInfo(): {
    name: string;
    description?: string;
    instruction?: string;
    tools: string[];
    plugins: string[];
    metadata: Record<string, any>;
  } {
    return {
      name: this.name,
      description: this.description,
      instruction: this.instruction,
      tools: this.tools.map(tool => tool.name),
      plugins: this.plugins.map(plugin => plugin.name),
      metadata: this.metadata
    };
  }

  /**
   * Validate agent configuration
   */
  protected validateConfig(): void {
    if (!this.name || this.name.trim() === '') {
      throw new AdkError('Agent name is required');
    }

    // Validate tool names are unique
    const toolNames = this.tools.map(tool => tool.name);
    const uniqueToolNames = new Set(toolNames);
    if (toolNames.length !== uniqueToolNames.size) {
      throw new AdkError('Tool names must be unique');
    }
  }
}