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

import { Content, FunctionCall, FunctionResponse } from '@google/generative-ai';
import { LlmResponse } from '../models/llm-response';
import { EventActions } from './event-actions';

/**
 * Represents an event in a conversation between agents and users.
 * 
 * It is used to store the content of the conversation, as well as the actions
 * taken by the agents like function calls, etc.
 */
export interface Event extends LlmResponse {
  /**
   * The invocation ID of the event. Should be non-empty before appending to a session.
   */
  invocationId: string;

  /**
   * "user" or the name of the agent, indicating who appended the event to the session.
   */
  author: string;

  /**
   * The actions taken by the agent.
   */
  actions: EventActions;

  /**
   * Set of ids of the long running function calls.
   * Agent client will know from this field about which function call is long running.
   * only valid for function call event
   */
  longRunningToolIds?: Set<string>;

  /**
   * The branch of the event.
   * 
   * The format is like agent_1.agent_2.agent_3, where agent_1 is the parent of
   * agent_2, and agent_2 is the parent of agent_3.
   * 
   * Branch is used when multiple sub-agent shouldn't see their peer agents'
   * conversation history.
   */
  branch?: string;

  /**
   * The unique identifier of the event.
   */
  id: string;

  /**
   * The timestamp of the event.
   */
  timestamp: number;
}

/**
 * Utility functions for Event
 */
export class EventUtils {
  /**
   * Returns whether the event is the final response of an agent.
   */
  static isFinalResponse(event: Event): boolean {
    if (event.actions.skipSummarization || event.longRunningToolIds) {
      return true;
    }
    return (
      !EventUtils.getFunctionCalls(event).length &&
      !EventUtils.getFunctionResponses(event).length &&
      !event.partial &&
      !EventUtils.hasTrailingCodeExecutionResult(event)
    );
  }

  /**
   * Returns the function calls in the event.
   */
  static getFunctionCalls(event: Event): FunctionCall[] {
    const funcCalls: FunctionCall[] = [];
    if (event.content && event.content.parts) {
      for (const part of event.content.parts) {
        if (part.functionCall) {
          funcCalls.push(part.functionCall);
        }
      }
    }
    return funcCalls;
  }

  /**
   * Returns the function responses in the event.
   */
  static getFunctionResponses(event: Event): FunctionResponse[] {
    const funcResponses: FunctionResponse[] = [];
    if (event.content && event.content.parts) {
      for (const part of event.content.parts) {
        if (part.functionResponse) {
          funcResponses.push(part.functionResponse);
        }
      }
    }
    return funcResponses;
  }

  /**
   * Returns whether the event has a trailing code execution result.
   */
  static hasTrailingCodeExecutionResult(event: Event): boolean {
    if (event.content && event.content.parts && event.content.parts.length > 0) {
      const lastPart = event.content.parts[event.content.parts.length - 1];
      return lastPart.codeExecutionResult !== undefined;
    }
    return false;
  }

  /**
   * Generates a new unique ID for an event.
   */
  static newId(): string {
    return crypto.randomUUID();
  }
}