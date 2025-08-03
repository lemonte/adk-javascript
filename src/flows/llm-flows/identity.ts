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
 * Gives the agent identity from the framework.
 */

import { InvocationContext } from '../../types';
import { Event } from '../../events/index';
import { LlmRequest } from '../../models/llm-request';
import { BaseLlmRequestProcessor } from './base-llm-processor';

/**
 * Gives the agent identity from the framework.
 */
class IdentityLlmRequestProcessor extends BaseLlmRequestProcessor {
  async *runAsync(
    invocationContext: InvocationContext,
    llmRequest: LlmRequest
  ): AsyncGenerator<Event, void, unknown> {
    const agent = invocationContext.agent;
    const instructions = [`You are an agent. Your internal name is "${agent.name}".`];
    
    if (agent.description) {
      instructions.push(` The description about you is "${agent.description}"`);
    }
    
    llmRequest.appendInstructions(instructions);

    // Maintain async generator behavior
    if (false) {
      yield {} as Event; // This is a no-op but maintains generator structure
    }
  }
}

export const requestProcessor = new IdentityLlmRequestProcessor();