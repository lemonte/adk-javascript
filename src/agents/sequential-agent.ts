/**
 * Sequential Agent implementation for the ADK JavaScript SDK
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
 * Sequential agent configuration
 */
export interface SequentialAgentConfig extends BaseAgentConfig {
  agents: LlmAgent[];
  passResults?: boolean;
}

/**
 * Sequential agent that runs multiple agents in sequence
 */
export class SequentialAgent extends BaseAgent {
  private agents: LlmAgent[];
  private passResults: boolean;

  constructor(config: SequentialAgentConfig) {
    super(config);
    this.agents = config.agents;
    this.passResults = config.passResults ?? true;
  }

  /**
   * Run agents sequentially
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
    let currentMessage = message;
    let finalResponse: Content = {
      role: 'assistant',
      parts: []
    };

    // Emit start event
    yield {
      type: EventType.AGENT_START,
      agentName: this.name,
      message,
      context,
      timestamp: startTime
    };

    try {
      for (let i = 0; i < this.agents.length; i++) {
        const agent = this.agents[i];
        
        // Run the agent
        const agentGenerator = await agent.run(currentMessage, context, sessionState);
        
        let agentResponse: Content | undefined;
        for await (const event of agentGenerator) {
          yield event;
          
          if (event.type === EventType.AGENT_END) {
            agentResponse = event.response;
          }
        }

        if (agentResponse) {
          // Combine responses
          finalResponse.parts.push(...agentResponse.parts);
          
          // Pass result to next agent if enabled
          if (this.passResults && i < this.agents.length - 1) {
            currentMessage = agentResponse;
          }
        }
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
   * Add an agent to the sequence
   */
  addAgent(agent: LlmAgent): void {
    this.agents.push(agent);
  }

  /**
   * Remove an agent from the sequence
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
   * Get all agents in the sequence
   */
  getAgents(): LlmAgent[] {
    return [...this.agents];
  }
}