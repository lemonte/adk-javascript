/**
 * Loop Agent implementation for the ADK JavaScript SDK
 */
import { Content, InvocationContext, SessionState } from '../types';
import { BaseAgent, BaseAgentConfig } from './base-agent';
import { LlmAgent } from './llm-agent';
import { Event } from '../events';
/**
 * Loop condition function type
 */
export type LoopCondition = (iteration: number, lastResponse: Content | undefined, context: InvocationContext) => boolean | Promise<boolean>;
/**
 * Loop agent configuration
 */
export interface LoopAgentConfig extends BaseAgentConfig {
    agent: LlmAgent;
    maxIterations?: number;
    condition?: LoopCondition;
    updateMessage?: (iteration: number, lastResponse: Content | undefined, originalMessage: Content) => Content;
}
/**
 * Loop agent that runs an agent multiple times based on conditions
 */
export declare class LoopAgent extends BaseAgent {
    private agent;
    private maxIterations;
    private condition?;
    private updateMessage?;
    constructor(config: LoopAgentConfig);
    /**
     * Run agent in a loop
     */
    run(message: Content, context: InvocationContext, sessionState?: SessionState): Promise<AsyncGenerator<Event, void, unknown>>;
    private runGenerator;
    /**
     * Set the loop condition
     */
    setCondition(condition: LoopCondition): void;
    /**
     * Set the message update function
     */
    setMessageUpdater(updater: (iteration: number, lastResponse: Content | undefined, originalMessage: Content) => Content): void;
    /**
     * Set maximum iterations
     */
    setMaxIterations(max: number): void;
    /**
     * Get the wrapped agent
     */
    getAgent(): LlmAgent;
}
//# sourceMappingURL=loop-agent.d.ts.map