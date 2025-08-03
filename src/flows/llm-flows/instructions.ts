// Copyright 2025 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * Handles instructions and global instructions for LLM flow.
 */

import { InvocationContext, ReadonlyContext } from '../../types';
import { Event } from '../../events/index';
import { LlmRequest } from '../../models/llm-request';
import { LlmAgent } from '../../agents/llm-agent';
import { BaseAgent } from '../../agents/base-agent';
import { BaseLlmRequestProcessor } from './base-llm-processor';

/**
 * Handles instructions and global instructions for LLM flow.
 */
class InstructionsLlmRequestProcessor extends BaseLlmRequestProcessor {
  async *runAsync(
    invocationContext: InvocationContext,
    llmRequest: LlmRequest
  ): AsyncGenerator<Event, void, unknown> {
    const agent = invocationContext.agent;
    if (!(agent instanceof LlmAgent)) {
      return;
    }

    const rootAgent: BaseAgent = agent.rootAgent;

    // Appends global instructions if set
    if (rootAgent instanceof LlmAgent && rootAgent.globalInstruction) {
      const { instruction: rawSi, bypassStateInjection } = 
        await rootAgent.canonicalGlobalInstruction(
          new ReadonlyContext(invocationContext)
        );
      
      let si = rawSi;
      if (!bypassStateInjection) {
        si = await this.injectSessionState(
          rawSi, 
          new ReadonlyContext(invocationContext)
        );
      }
      llmRequest.appendInstructions([si]);
    }

    // Appends agent instructions if set
    if (agent.instruction) {
      const { instruction: rawSi, bypassStateInjection } = 
        await agent.canonicalInstruction(
          new ReadonlyContext(invocationContext)
        );
      
      let si = rawSi;
      if (!bypassStateInjection) {
        si = await this.injectSessionState(
          rawSi, 
          new ReadonlyContext(invocationContext)
        );
      }
      llmRequest.appendInstructions([si]);
    }

    // Maintain async generator behavior
    if (false) {
      yield {} as Event; // This is a no-op but maintains generator structure
    }
  }

  private async injectSessionState(
    instruction: string,
    context: ReadonlyContext
  ): Promise<string> {
    // Simple state injection - replace placeholders with session state
    let result = instruction;
    
    // Replace common placeholders
    const state = context.session.state;
    if (state) {
      // Replace {{variable_name}} patterns with state values
      result = result.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
        const value = state[key.trim()];
        return value !== undefined ? String(value) : match;
      });
    }
    
    return result;
  }
}

export const requestProcessor = new InstructionsLlmRequestProcessor();