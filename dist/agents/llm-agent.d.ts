/**
 * LLM Agent implementation for the ADK JavaScript SDK
 */
import { Content, InvocationContext, SessionState, GenerationConfig, SafetySetting, ReadonlyContext } from '../types';
import { BaseAgent, BaseAgentConfig } from './base-agent';
import { BaseModel } from '../models/index';
import { Event } from '../events/index';
/**
 * LLM Agent configuration
 */
export interface LlmAgentConfig extends BaseAgentConfig {
    model: string | BaseModel;
    systemInstruction?: string;
    globalInstruction?: string;
    generationConfig?: GenerationConfig;
    safetySettings?: SafetySetting[];
    maxIterations?: number;
    subAgents?: LlmAgent[];
}
/**
 * LLM Agent that uses language models to process messages and execute tools
 */
export declare class LlmAgent extends BaseAgent {
    readonly model: BaseModel;
    readonly systemInstruction?: string;
    readonly globalInstruction?: string;
    readonly generationConfig?: GenerationConfig;
    readonly safetySettings?: SafetySetting[];
    readonly maxIterations: number;
    readonly subAgents: LlmAgent[];
    constructor(config: LlmAgentConfig);
    /**
     * Create model instance from string identifier
     */
    private createModelFromString;
    /**
     * Run the agent with a message
     */
    run(message: Content, context: InvocationContext, sessionState?: SessionState): Promise<AsyncGenerator<Event, void, unknown>>;
    private runGenerator;
    /**
     * Build messages for the model request
     */
    private buildMessages;
    /**
     * Get tool definitions for the model
     */
    private getToolDefinitions;
    /**
     * Execute multiple tool calls
     */
    private executeToolCalls;
    /**
     * Transfer to a sub-agent
     */
    transferToAgent(agentName: string, message: Content, context: InvocationContext, sessionState?: SessionState): Promise<AsyncGenerator<Event, void, unknown>>;
    /**
     * Add a sub-agent
     */
    addSubAgent(agent: LlmAgent): void;
    /**
     * Remove a sub-agent
     */
    removeSubAgent(agentName: string): boolean;
    /**
     * Get sub-agent names
     */
    getSubAgentNames(): string[];
    /**
     * Get canonical global instruction
     */
    canonicalGlobalInstruction(context: ReadonlyContext): Promise<{
        instruction: string;
        bypassStateInjection: boolean;
    }>;
    /**
     * Get canonical instruction
     */
    canonicalInstruction(context: ReadonlyContext): Promise<{
        instruction: string;
        bypassStateInjection: boolean;
    }>;
}
/**
 * Convenience alias for LlmAgent
 */
export declare const Agent: typeof LlmAgent;
//# sourceMappingURL=llm-agent.d.ts.map