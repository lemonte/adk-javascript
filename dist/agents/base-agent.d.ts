/**
 * Base agent implementation for the ADK JavaScript SDK
 */
import { EventEmitter } from 'events';
import { Content, InvocationContext, SessionState, FunctionCall, FunctionResponse, Plugin } from '../types';
import { BaseTool } from '../tools/index';
import { Event } from '../events/index';
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
export declare abstract class BaseAgent extends EventEmitter {
    readonly name: string;
    readonly description?: string;
    readonly instruction?: string;
    readonly tools: BaseTool[];
    readonly plugins: Plugin[];
    readonly metadata: Record<string, any>;
    readonly subAgents: BaseAgent[];
    parentAgent?: BaseAgent;
    protected logger: Logger;
    constructor(config: BaseAgentConfig);
    /**
     * Gets the root agent of this agent
     */
    get rootAgent(): BaseAgent;
    /**
     * Abstract method to run the agent with a message
     */
    abstract run(message: Content, context: InvocationContext, sessionState?: SessionState): Promise<AsyncGenerator<Event, void, unknown>>;
    /**
     * Get tool by name
     */
    protected getTool(name: string): BaseTool | undefined;
    /**
     * Execute a tool call
     */
    protected executeTool(toolCall: FunctionCall, context: InvocationContext, sessionState?: SessionState): Promise<FunctionResponse>;
    /**
     * Execute plugin callbacks
     */
    protected executePluginCallbacks(callbackName: keyof Plugin, context: InvocationContext, ...args: any[]): Promise<void>;
    /**
     * Initialize the agent and its plugins
     */
    initialize(): Promise<void>;
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
    };
    /**
     * Validate agent configuration
     */
    protected validateConfig(): void;
}
//# sourceMappingURL=base-agent.d.ts.map