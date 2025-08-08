/**
 * In-memory runner implementation for the ADK JavaScript SDK
 */
import { Content, SessionState, InvocationContext } from '../types';
import { BaseRunner, BaseRunnerConfig, RunnerResult, RunnerEvent } from './base-runner';
import { BaseAgent } from '../agents/base-agent';
/**
 * In-memory runner configuration
 */
export interface InMemoryRunnerConfig extends BaseRunnerConfig {
    persistState?: boolean;
    maxHistorySize?: number;
}
/**
 * In-memory runner that manages agent execution with local state
 */
export declare class InMemoryRunner extends BaseRunner {
    private readonly persistState;
    private readonly maxHistorySize;
    private readonly sessionStates;
    constructor(agent: BaseAgent, config?: InMemoryRunnerConfig);
    /**
     * Run the agent with a new message
     */
    run(message: Content, sessionState: SessionState, context: InvocationContext): Promise<RunnerResult>;
    /**
     * Run the agent with streaming response
     */
    runStreaming(message: Content, sessionState: SessionState, context: InvocationContext): AsyncGenerator<RunnerEvent, RunnerResult, unknown>;
    /**
     * Get session state by ID
     */
    getSessionState(sessionId: string): SessionState | undefined;
    /**
     * Set session state
     */
    setSessionState(sessionId: string, state: SessionState): void;
    /**
     * Clear session state
     */
    clearSessionState(sessionId: string): boolean;
    /**
     * Clear all session states
     */
    clearAllSessions(): void;
    /**
     * Get all session IDs
     */
    getSessionIds(): string[];
    /**
     * Get session count
     */
    getSessionCount(): number;
    /**
     * Clone session state to avoid mutations
     */
    private cloneSessionState;
    /**
     * Check if response has tool calls
     */
    private hasToolCalls;
    /**
     * Determine if execution should continue
     */
    private shouldContinue;
}
//# sourceMappingURL=in-memory-runner.d.ts.map