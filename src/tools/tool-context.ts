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

import { InvocationContext } from '../types';
import { EventActions } from '../events/index';
import { AuthConfig, AuthCredential } from '../auth/index';
import { MemoryEntry } from '../memory/index';

/**
 * Response from searching memory.
 */
export interface SearchMemoryResponse {
  memories: MemoryEntry[];
}

/**
 * The context of the tool.
 *
 * This class provides the context for a tool invocation, including access to
 * the invocation context, function call ID, event actions, and authentication
 * response. It also provides methods for requesting credentials, retrieving
 * authentication responses, listing artifacts, and searching memory.
 */
export class AdvancedToolContext {
  /**
   * The invocation context of the tool.
   */
  public readonly invocationContext: InvocationContext;

  /**
   * The function call id of the current tool call. This id was
   * returned in the function call event from LLM to identify a function call.
   * If LLM didn't return this id, ADK will assign one to it. This id is used
   * to map function call response to the original function call.
   */
  public readonly functionCallId?: string;

  /**
   * The event actions of the current tool call.
   */
  public readonly eventActions?: EventActions;

  constructor(
    invocationContext: InvocationContext,
    options: {
      functionCallId?: string;
      eventActions?: EventActions;
    } = {}
  ) {
    this.invocationContext = invocationContext;
    this.functionCallId = options.functionCallId;
    this.eventActions = options.eventActions;
  }

  /**
   * Get the event actions.
   */
  get actions(): EventActions {
    if (!this.eventActions) {
      throw new Error('Event actions not available');
    }
    return this.eventActions;
  }

  /**
   * Request credentials for authentication.
   */
  requestCredential(authConfig: AuthConfig): void {
    if (!this.functionCallId) {
      throw new Error('function_call_id is not set.');
    }
    // Implementation would depend on auth system
    throw new Error('Authentication not implemented yet');
  }

  /**
   * Get authentication response.
   */
  getAuthResponse(authConfig: AuthConfig): AuthCredential {
    // Implementation would depend on auth system
    throw new Error('Authentication not implemented yet');
  }

  /**
   * Searches the memory of the current user.
   */
  async searchMemory(query: string): Promise<SearchMemoryResponse> {
    if (!this.invocationContext.memoryService) {
      throw new Error('Memory service is not available.');
    }
    
    const result = await this.invocationContext.memoryService.searchMemory({
      appName: this.invocationContext.appName,
      userId: this.invocationContext.userId,
      query,
    });
    
    return { memories: result.memories };
  }
}