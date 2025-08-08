/**
 * Parallel Agent implementation for the ADK JavaScript SDK
 */
import { Content, InvocationContext, SessionState } from '../types';
import { BaseAgent, BaseAgentConfig } from './base-agent';
import { LlmAgent } from './llm-agent';
import { Event } from '../events';
/**
 * Parallel agent configuration
 */
export interface ParallelAgentConfig extends BaseAgentConfig {
    agents: LlmAgent[];
    combineResults?: boolean;
    waitForAll?: boolean;
}
/**
 * Parallel agent that runs multiple agents concurrently
 */
export declare class ParallelAgent extends BaseAgent {
    private agents;
    private combineResults;
    private waitForAll;
    constructor(config: ParallelAgentConfig);
    /**
     * Run agents in parallel
     */
    run(message: Content, context: InvocationContext, sessionState?: SessionState): Promise<AsyncGenerator<Event, void, unknown>>;
    private runGenerator;
    /**
     * Add an agent to run in parallel
     */
    addAgent(agent: LlmAgent): void;
    /**
     * Remove an agent from parallel execution
     */
    removeAgent(agentName: string): boolean;
    /**
     * Get all agents
     */
    getAgents(): LlmAgent[];
}
//# sourceMappingURL=parallel-agent.d.ts.map