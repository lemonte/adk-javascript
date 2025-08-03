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
 * Builds the contents for the LLM request.
 */

import { InvocationContext } from '../../types';
import { Event } from '../../events/index';
import { LlmRequest } from '../../models/llm-request';
import { LlmAgent } from '../../agents/llm-agent';
import { BaseLlmRequestProcessor } from './base-llm-processor';
import { removeClientFunctionCallId } from './functions';
import { Content } from '../../types';

const REQUEST_EUC_FUNCTION_CALL_NAME = 'adk_request_credential';

/**
 * Builds the contents for the LLM request.
 */
class ContentLlmRequestProcessor extends BaseLlmRequestProcessor {
  async *runAsync(
    invocationContext: InvocationContext,
    llmRequest: LlmRequest
  ): AsyncGenerator<Event, void, unknown> {
    const agent = invocationContext.agent;
    if (!(agent instanceof LlmAgent)) {
      return;
    }

    // For now, include full conversation history by default
    // The includeContents property is not yet implemented in the JavaScript SDK
    llmRequest.contents = getContents(
      invocationContext.branch || '',
      invocationContext.session.events
    );

    // Clean up client function call IDs
    if (llmRequest.contents) {
      for (const content of llmRequest.contents) {
        removeClientFunctionCallId(content);
      }
    }

    // Maintain async generator behavior
    if (false) {
      yield {} as Event; // This is a no-op but maintains generator structure
    }
  }
}

function getContents(
  branch: string,
  events: Event[]
): Content[] {
  const contents: Content[] = [];
  
  // Filter events for the current branch
  const filteredEvents = events;
  
  // Convert events to contents
  for (const event of filteredEvents) {
    const content = eventToContent(event);
    if (content) {
      contents.push(content);
    }
  }
  
  return rearrangeEventsForAsyncFunctionResponsesInHistory(contents);
}

function eventToContent(event: Event): Content | null {
  // Check if event has content property directly
  if ('content' in event && event.content) {
    return event.content as Content;
  }
  return null;
}

function contentEquals(content1: Content, content2: Content): boolean {
  return JSON.stringify(content1) === JSON.stringify(content2);
}

function rearrangeEventsForAsyncFunctionResponsesInHistory(contents: Content[]): Content[] {
  // Rearrange function calls and responses to maintain proper order
  const rearranged: Content[] = [];
  const pendingFunctionCalls: Content[] = [];
  
  for (const content of contents) {
    if (hasFunctionCall(content)) {
      pendingFunctionCalls.push(content);
    } else if (hasFunctionResponse(content)) {
      // Find matching function call
      const matchingCallIndex = pendingFunctionCalls.findIndex(call => 
        matchesFunctionCall(call, content)
      );
      
      if (matchingCallIndex >= 0) {
        // Add the function call and response together
        rearranged.push(pendingFunctionCalls[matchingCallIndex]);
        rearranged.push(content);
        pendingFunctionCalls.splice(matchingCallIndex, 1);
      } else {
        rearranged.push(content);
      }
    } else {
      rearranged.push(content);
    }
  }
  
  // Add any remaining function calls
  rearranged.push(...pendingFunctionCalls);
  
  return rearranged;
}

function hasFunctionCall(content: Content): boolean {
  return content.parts?.some(part => part.type === 'function_call') || false;
}

function hasFunctionResponse(content: Content): boolean {
  return content.parts?.some(part => part.type === 'function_response') || false;
}

function matchesFunctionCall(callContent: Content, responseContent: Content): boolean {
  const callPart = callContent.parts?.find(p => p.type === 'function_call');
  const responsePart = responseContent.parts?.find(p => p.type === 'function_response');
  
  if (!callPart || !responsePart || callPart.type !== 'function_call' || responsePart.type !== 'function_response') {
    return false;
  }
  
  return callPart.functionCall.id === responsePart.functionResponse.id;
}

export const requestProcessor = new ContentLlmRequestProcessor();