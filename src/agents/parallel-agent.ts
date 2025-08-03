/**
 * Parallel Agent implementation for the ADK JavaScript SDK
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
export class ParallelAgent extends BaseAgent {
  private agents: LlmAgent[];
  private combineResults: boolean;
  private waitForAll: boolean;

  constructor(config: ParallelAgentConfig) {
    super(config);
    this.agents = config.agents;
    this.combineResults = config.combineResults ?? true;
    this.waitForAll = config.waitForAll ?? true;
  }

  /**
   * Run agents in parallel
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
    const responses: Content[] = [];

    // Emit start event
    yield {
      type: EventType.AGENT_START,
      agentName: this.name,
      message,
      context,
      timestamp: startTime
    };

    try {
      // Create promises for all agents
      const agentPromises = this.agents.map(async (agent) => {
        const events: Event[] = [];
        let response: Content | undefined;
        
        const agentGenerator = await agent.run(message, context, sessionState);
        
        for await (const event of agentGenerator) {
          events.push(event);
          
          if (event.type === EventType.AGENT_END) {
            response = event.response;
          }
        }
        
        return { agent, events, response };
      });

      if (this.waitForAll) {
        // Wait for all agents to complete
        const results = await Promise.all(agentPromises);
        
        // Emit all events in order
        for (const result of results) {
          for (const event of result.events) {
            yield event;
          }
          
          if (result.response) {
            responses.push(result.response);
          }
        }
      } else {
        // Emit events as they come
        const results = await Promise.allSettled(agentPromises);
        
        for (const result of results) {
          if (result.status === 'fulfilled') {
            for (const event of result.value.events) {
              yield event;
            }
            
            if (result.value.response) {
              responses.push(result.value.response);
            }
          } else {
            yield {
              type: EventType.ERROR,
              error: result.reason instanceof Error ? result.reason : new Error(String(result.reason)),
              context,
              timestamp: new Date(),
              source: this.name
            };
          }
        }
      }

      // Combine results if enabled
      let finalResponse: Content;
      if (this.combineResults && responses.length > 0) {
        finalResponse = {
          role: 'assistant',
          parts: responses.flatMap(response => response.parts)
        };
      } else {
        finalResponse = responses[0] || {
          role: 'assistant',
          parts: [{ type: 'text', text: 'No responses received' }]
        };
      }

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
   * Add an agent to run in parallel
   */
  addAgent(agent: LlmAgent): void {
    this.agents.push(agent);
  }

  /**
   * Remove an agent from parallel execution
   */
  removeAgent(agentName: string): boolean {
    const index = this.agents.findIndex(agent => agent.name === agentName);
    if (index !== -1) {
      this.agents.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Get all agents
   */
  getAgents(): LlmAgent[] {
    return [...this.agents];
  }
}