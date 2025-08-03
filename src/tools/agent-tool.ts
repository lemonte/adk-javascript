/**
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { BaseTool } from './base-tool';
import { AdvancedToolContext } from './tool-context';
import { ToolContext } from './base-tool';
import { ToolDefinition, Content } from '../types';
import { BaseAgent } from '../agents';
import { LlmAgent } from '../agents';
import { Runner } from '../runners';

/**
 * Configuration for the AgentTool.
 */
export interface AgentToolConfig {
  /**
   * The agent to wrap as a tool.
   */
  agent: BaseAgent;
  
  /**
   * Whether to skip summarization of the agent output.
   */
  skipSummarization?: boolean;
}

/**
 * A tool that wraps an agent.
 *
 * This tool allows an agent to be called as a tool within a larger application.
 * The agent's input schema is used to define the tool's input parameters, and
 * the agent's output is returned as the tool's result.
 */
export class AgentTool extends BaseTool {
  private agent: BaseAgent;
  private skipSummarization: boolean;

  constructor(config: AgentToolConfig) {
    super({
      name: config.agent.name,
      description: config.agent.description || `Agent tool for ${config.agent.name}`,
      parameters: {
        type: 'object',
        properties: {
          request: {
            type: 'string',
            description: 'The request to send to the agent'
          }
        },
        required: ['request']
      }
    });
    
    this.agent = config.agent;
    this.skipSummarization = config.skipSummarization ?? false;
  }

  getToolDefinition(): ToolDefinition {
    return {
      type: 'function',
      function: {
        name: this.name,
        description: this.description,
        parameters: this.parameters
      }
    };
  }

  async execute(args: Record<string, any>, context: ToolContext): Promise<any> {
    // Convert simple ToolContext to AdvancedToolContext
    const advancedContext = new AdvancedToolContext(context.context, {
      functionCallId: context.metadata?.functionCallId
    });
    if (this.skipSummarization && advancedContext.actions) {
      advancedContext.actions.skipSummarization = true;
    }

    let content: Content;
    
    // Handle the request
    const request = args.request || JSON.stringify(args);
    content = {
      role: 'user',
      parts: [{
        type: 'text',
        text: request,
      }],
    };

    // Create a runner to execute the agent
    const runner = new Runner(this.agent, {
      enableLogging: true,
      enableMetrics: true
    });

    try {
      // Execute the agent with the provided content
      const response = await runner.run(
        content,
        context.sessionState,
        advancedContext.invocationContext
      );

      // Return the agent's response
      if (response && response.response && response.response.parts) {
        const textParts = response.response.parts
          .filter((part: any) => part.type === 'text')
          .map((part: any) => part.text)
          .join('\n');
        
        return textParts || response;
      }
      
      return response;
    } catch (error) {
      throw new Error(`Agent execution failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}