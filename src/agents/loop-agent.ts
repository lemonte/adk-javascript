/**
 * Loop Agent implementation for the ADK JavaScript SDK
 */

import {
  Content,
  InvocationContext,
  SessionState
} from '../types';
import { BaseAgent, BaseAgentConfig } from './base-agent';
import { LlmAgent } from './llm-agent';
import { Event, EventType } from '../events';

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
export class LoopAgent extends BaseAgent {
  private agent: LlmAgent;
  private maxIterations: number;
  private condition?: LoopCondition;
  private updateMessage?: (iteration: number, lastResponse: Content | undefined, originalMessage: Content) => Content;

  constructor(config: LoopAgentConfig) {
    super(config);
    this.agent = config.agent;
    this.maxIterations = config.maxIterations ?? 10;
    this.condition = config.condition;
    this.updateMessage = config.updateMessage;
  }

  /**
   * Run agent in a loop
   */
  async run(
    message: Content,
    context: InvocationContext,
    sessionState?: SessionState
  ): Promise<AsyncGenerator<Event, void, unknown>> {
    return this.runGenerator(message, context, sessionState);
  }

  private async *runGenerator(
    message: Content,
    context: InvocationContext,
    sessionState?: SessionState
  ): AsyncGenerator<Event, void, unknown> {
    const startTime = new Date();
    let iteration = 0;
    let lastResponse: Content | undefined;
    let currentMessage = message;

    // Emit start event
    yield {
      type: EventType.AGENT_START,
      agentName: this.name,
      message,
      context,
      timestamp: startTime
    };

    try {
      while (iteration < this.maxIterations) {
        // Check condition if provided
        if (this.condition) {
          const shouldContinue = await this.condition(iteration, lastResponse, context);
          if (!shouldContinue) {
            break;
          }
        }

        // Emit iteration start
        yield {
          type: EventType.ITERATION_START,
          iteration,
          context,
          timestamp: new Date(),
          data: { message: currentMessage }
        };

        // Update message if function provided
        if (this.updateMessage) {
          currentMessage = this.updateMessage(iteration, lastResponse, message);
        }

        // Run the agent
        const agentGenerator = await this.agent.run(currentMessage, context, sessionState);
        
        for await (const event of agentGenerator) {
          yield event;
          
          if (event.type === EventType.AGENT_END) {
            lastResponse = event.response;
          }
        }

        // Emit iteration end
        yield {
          type: EventType.ITERATION_END,
          iteration,
          context,
          timestamp: new Date(),
          data: { response: lastResponse }
        };

        iteration++;
      }

      // Use last response or create default
      const finalResponse = lastResponse || {
        role: 'assistant',
        parts: [{ type: 'text', text: 'No response generated' }]
      };

      // Emit end event
      yield {
        type: EventType.AGENT_END,
        agentName: this.name,
        response: finalResponse,
        context,
        timestamp: new Date(),
        duration: Date.now() - startTime.getTime()
      };
    } catch (error) {
      yield {
        type: EventType.ERROR,
        error: error instanceof Error ? error : new Error(String(error)),
        context,
        timestamp: new Date(),
        source: this.name
      };
      throw error;
    }
  }

  /**
   * Set the loop condition
   */
  setCondition(condition: LoopCondition): void {
    this.condition = condition;
  }

  /**
   * Set the message update function
   */
  setMessageUpdater(updater: (iteration: number, lastResponse: Content | undefined, originalMessage: Content) => Content): void {
    this.updateMessage = updater;
  }

  /**
   * Set maximum iterations
   */
  setMaxIterations(max: number): void {
    this.maxIterations = max;
  }

  /**
   * Get the wrapped agent
   */
  getAgent(): LlmAgent {
    return this.agent;
  }
}