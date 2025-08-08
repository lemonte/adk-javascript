/**
 * Sequential Agent implementation for the ADK JavaScript SDK
 */
import { Content, InvocationContext, SessionState } from '../types';
import { BaseAgent, BaseAgentConfig } from './base-agent';
import { LlmAgent } from './llm-agent';
import { Event } from '../events';
/**
 * Sequential agent configuration
 */
export interface SequentialAgentConfig extends BaseAgentConfig {
    agents: LlmAgent[];
    passResults?: boolean;
}
/**
 * Sequential agent that runs multiple agents in sequence
 */
export declare class SequentialAgent extends BaseAgent {
    private agents;
    private passResults;
    constructor(config: SequentialAgentConfig);
    /**
     * Run agents sequentially
     */
    run(message: Content, context: InvocationContext, sessionState?: SessionState): Promise<AsyncGenerator<Event, void, unknown>>;
    private runGenerator;
    /**
     * Add an agent to the sequence
     */
    addAgent(agent: LlmAgent): void;
    /**
     * Remove an agent from the sequence
     */
    removeAgent(agentName: string): boolean;
    /**
     * Get all agents in the sequence
     */
    getAgents(): LlmAgent[];
}
//# sourceMappingURL=sequential-agent.d.ts.map