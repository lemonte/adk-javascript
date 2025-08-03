/**
 * In-memory runner implementation for the ADK JavaScript SDK
 */

import {
  Content,
  SessionState,
  InvocationContext,
  SessionError
} from '../types';
import {
  BaseRunner,
  BaseRunnerConfig,
  RunnerContext,
  RunnerResult,
  RunnerEvent
} from './base-runner';
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
export class InMemoryRunner extends BaseRunner {
  private readonly persistState: boolean;
  private readonly maxHistorySize: number;
  private readonly sessionStates: Map<string, SessionState>;

  constructor(agent: BaseAgent, config: InMemoryRunnerConfig = {}) {
    super(agent, config);
    
    this.persistState = config.persistState ?? true;
    this.maxHistorySize = config.maxHistorySize || 1000;
    this.sessionStates = new Map();
  }

  /**
   * Run the agent with a new message
   */
  async run(
    message: Content,
    sessionState: SessionState,
    context: InvocationContext
  ): Promise<RunnerResult> {
    return this.executeWithTimeout(async () => {
      this.validateSessionState(sessionState);
      this.validateInvocationContext(context);

      const runnerContext = this.createRunnerContext(context);
      this.emitEvent('run_start', {
        message,
        sessionId: context.sessionId,
        agentName: this.agent.name
      }, runnerContext);

      try {
        // Clone session state to avoid mutations
        let currentState = this.cloneSessionState(sessionState);
        
        // Add the new message to the session
        currentState.messages.push(message);
        
        // Trim history if needed
        if (currentState.messages.length > this.maxHistorySize) {
          const excess = currentState.messages.length - this.maxHistorySize;
          currentState.messages = currentState.messages.slice(excess);
          this.logger.warn(`Trimmed ${excess} messages from session history`);
        }

        let iteration = 0;
        let response: Content | null = null;

        // Main execution loop
        while (iteration < this.maxIterations) {
          runnerContext.iteration = iteration;
          
          this.emitEvent('iteration_start', {
            iteration,
            messagesCount: currentState.messages.length
          }, runnerContext);

          try {
            // Run the agent with the latest message
            const latestMessage = currentState.messages[currentState.messages.length - 1];
            const agentGenerator = await this.agent.run(
              latestMessage,
              {
                sessionId: context.sessionId,
                userId: context.userId,
                appName: context.appName,
                agentName: context.agentName,
                requestId: context.requestId,
                timestamp: context.timestamp,
                memoryService: context.memoryService,
                metadata: { ...context.metadata, iteration },
                agent: this.agent,
                session: {
                  id: context.sessionId,
                  appName: context.appName,
                  userId: context.userId,
                  state: currentState,
                  events: [],
                  lastUpdateTime: Date.now()
                },
                invocationId: context.requestId,
                branch: undefined,
                userContent: latestMessage,
                endInvocation: false
              }
            );

            // Consume the generator to get the final response
            let lastEvent: any = null;
            for await (const event of agentGenerator) {
              lastEvent = event;
            }

            // Extract response from the last event or create a default response
            if (lastEvent && lastEvent.type === 'agent_end' && lastEvent.response) {
              response = lastEvent.response;
            } else {
              // Create a default response if no proper response found
              response = {
                role: 'assistant',
                parts: [{ type: 'text', text: 'No response generated' }]
              };
            }
            currentState.messages.push(response);

            this.emitEvent('iteration_complete', {
              iteration,
              response,
              hasToolCalls: response ? this.hasToolCalls(response) : false
            }, runnerContext);

            // Check if we need to continue (e.g., if there are tool calls)
            if (!response || !this.shouldContinue(response)) {
              break;
            }

            iteration++;
          } catch (error) {
            this.emitEvent('iteration_error', {
              iteration,
              error: error instanceof Error ? error.message : String(error)
            }, runnerContext);
            
            throw error;
          }
        }

        if (iteration >= this.maxIterations) {
          this.logger.warn(`Reached maximum iterations (${this.maxIterations})`);
          this.emitEvent('max_iterations_reached', {
            maxIterations: this.maxIterations
          }, runnerContext);
        }

        if (!response) {
          throw new SessionError('No response generated from agent');
        }

        // Update session metadata
        currentState.metadata = {
          ...currentState.metadata,
          lastUpdated: new Date().toISOString(),
          messageCount: currentState.messages.length,
          iterations: iteration + 1
        };

        // Persist state if enabled
        if (this.persistState) {
          this.sessionStates.set(context.sessionId, currentState);
        }

        const result = this.createResult(response, currentState, runnerContext);
        
        this.emitEvent('run_complete', {
          sessionId: context.sessionId,
          iterations: iteration + 1,
          messagesCount: currentState.messages.length,
          executionTime: result.metrics.executionTime
        }, runnerContext);

        return result;
      } catch (error) {
        this.handleError(error, runnerContext);
      }
    });
  }

  /**
   * Run the agent with streaming response
   */
  async* runStreaming(
    message: Content,
    sessionState: SessionState,
    context: InvocationContext
  ): AsyncGenerator<RunnerEvent, RunnerResult, unknown> {
    this.validateSessionState(sessionState);
    this.validateInvocationContext(context);

    const runnerContext = this.createRunnerContext(context);
    
    const startEvent: RunnerEvent = {
      type: 'run_start',
      timestamp: new Date(),
      data: {
        message,
        sessionId: context.sessionId,
        agentName: this.agent.name
      },
      context: runnerContext
    };
    
    yield startEvent;
    this.emitEvent('run_start', startEvent.data, runnerContext);

    try {
      // Clone session state
      let currentState = this.cloneSessionState(sessionState);
      currentState.messages.push(message);
      
      // Trim history if needed
      if (currentState.messages.length > this.maxHistorySize) {
        const excess = currentState.messages.length - this.maxHistorySize;
        currentState.messages = currentState.messages.slice(excess);
      }

      let iteration = 0;
      let response: Content | null = null;

      // Main execution loop
      while (iteration < this.maxIterations) {
        runnerContext.iteration = iteration;
        
        const iterationStartEvent: RunnerEvent = {
          type: 'iteration_start',
          timestamp: new Date(),
          data: {
            iteration,
            messagesCount: currentState.messages.length
          },
          context: runnerContext
        };
        
        yield iterationStartEvent;
        this.emitEvent('iteration_start', iterationStartEvent.data, runnerContext);

        try {
          // Use the agent's run method which returns an AsyncGenerator
          const latestMessage = currentState.messages[currentState.messages.length - 1];
          const agentGenerator = await this.agent.run(
            latestMessage,
            {
              sessionId: context.sessionId,
              userId: context.userId,
              appName: context.appName,
              agentName: context.agentName,
              requestId: context.requestId,
              timestamp: context.timestamp,
              memoryService: context.memoryService,
              metadata: { ...context.metadata, iteration },
              agent: this.agent,
              session: {
                id: context.sessionId,
                appName: context.appName,
                userId: context.userId,
                state: currentState,
                events: [],
                lastUpdateTime: Date.now()
              },
              invocationId: context.requestId,
              branch: undefined,
              userContent: latestMessage,
              endInvocation: false
            }
          );

          // Consume the generator to get events and final response
          let lastEvent: any = null;
          for await (const event of agentGenerator) {
            // Convert Event to RunnerEvent format
            const runnerEvent: RunnerEvent = {
              type: event.type as any,
              timestamp: event.timestamp || new Date(),
              data: event,
              context: runnerContext
            };
            yield runnerEvent;
            lastEvent = event;
          }

          // Extract response from the last event or create a default response
          if (lastEvent && lastEvent.type === 'agent_end' && lastEvent.response) {
            response = lastEvent.response;
          } else {
            // Create a default response if no proper response found
            response = {
              role: 'assistant',
              parts: [{ type: 'text', text: 'No response generated' }]
            };
          }
          currentState.messages.push(response);

          const iterationCompleteEvent: RunnerEvent = {
            type: 'iteration_complete',
            timestamp: new Date(),
            data: {
              iteration,
              response,
              hasToolCalls: response ? this.hasToolCalls(response) : false
            },
            context: runnerContext
          };
          
          yield iterationCompleteEvent;
          this.emitEvent('iteration_complete', iterationCompleteEvent.data, runnerContext);

          // Check if we should continue
          if (!response || !this.shouldContinue(response)) {
            break;
          }

          iteration++;
        } catch (error) {
          const errorEvent: RunnerEvent = {
            type: 'iteration_error',
            timestamp: new Date(),
            data: {
              iteration,
              error: error instanceof Error ? error.message : String(error)
            },
            context: runnerContext
          };
          
          yield errorEvent;
          throw error;
        }
      }

      if (iteration >= this.maxIterations) {
        const maxIterationsEvent: RunnerEvent = {
          type: 'max_iterations_reached',
          timestamp: new Date(),
          data: { maxIterations: this.maxIterations },
          context: runnerContext
        };
        
        yield maxIterationsEvent;
      }

      if (!response) {
        throw new SessionError('No response generated from agent');
      }

      // Update session metadata
      currentState.metadata = {
        ...currentState.metadata,
        lastUpdated: new Date().toISOString(),
        messageCount: currentState.messages.length,
        iterations: iteration + 1
      };

      // Persist state if enabled
      if (this.persistState) {
        this.sessionStates.set(context.sessionId, currentState);
      }

      const result = this.createResult(response, currentState, runnerContext);
      
      const completeEvent: RunnerEvent = {
        type: 'run_complete',
        timestamp: new Date(),
        data: {
          sessionId: context.sessionId,
          iterations: iteration + 1,
          messagesCount: currentState.messages.length,
          executionTime: result.metrics.executionTime
        },
        context: runnerContext
      };
      
      yield completeEvent;
      this.emitEvent('run_complete', completeEvent.data, runnerContext);

      return result;
    } catch (error) {
      this.handleError(error, runnerContext);
    }
  }

  /**
   * Get session state by ID
   */
  getSessionState(sessionId: string): SessionState | undefined {
    return this.sessionStates.get(sessionId);
  }

  /**
   * Set session state
   */
  setSessionState(sessionId: string, state: SessionState): void {
    this.sessionStates.set(sessionId, this.cloneSessionState(state));
  }

  /**
   * Clear session state
   */
  clearSessionState(sessionId: string): boolean {
    return this.sessionStates.delete(sessionId);
  }

  /**
   * Clear all session states
   */
  clearAllSessions(): void {
    this.sessionStates.clear();
  }

  /**
   * Get all session IDs
   */
  getSessionIds(): string[] {
    return Array.from(this.sessionStates.keys());
  }

  /**
   * Get session count
   */
  getSessionCount(): number {
    return this.sessionStates.size;
  }

  /**
   * Clone session state to avoid mutations
   */
  private cloneSessionState(state: SessionState): SessionState {
    return {
      messages: state.messages.map((msg: any) => ({ ...msg, parts: [...msg.parts] })),
      metadata: { ...state.metadata }
    };
  }

  /**
   * Check if response has tool calls
   */
  private hasToolCalls(response: Content): boolean {
    return response.parts.some(part => 
      (part as any).type === 'function_call' || 
      (part as any).functionCall
    );
  }

  /**
   * Determine if execution should continue
   */
  private shouldContinue(response: Content): boolean {
    // Continue if there are tool calls that need responses
    return this.hasToolCalls(response);
  }
}