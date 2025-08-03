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
 * Handles function callings for LLM flow.
 */

import { v4 as uuidv4 } from 'uuid';
import { InvocationContext } from '../../types';
import { Event, EventType } from '../../events';
import { BaseTool } from '../../tools/base-tool';
import { AdvancedToolContext } from '../../tools/tool-context';
import { ToolContext } from '../../tools/base-tool';
import { FunctionCall, Content } from '../../types';

const AF_FUNCTION_CALL_ID_PREFIX = 'adk-';
const REQUEST_EUC_FUNCTION_CALL_NAME = 'adk_request_credential';

export function generateClientFunctionCallId(): string {
  return `${AF_FUNCTION_CALL_ID_PREFIX}${uuidv4()}`;
}

export function populateClientFunctionCallId(modelResponseEvent: Event): void {
  let functionCalls: FunctionCall[] = [];
  
  if (modelResponseEvent.type === 'model_response' && 'response' in modelResponseEvent) {
    functionCalls = modelResponseEvent.response.toolCalls || [];
  } else if (modelResponseEvent.type === 'tool_call' && 'toolCall' in modelResponseEvent) {
    functionCalls = [modelResponseEvent.toolCall];
  }
  
  if (!functionCalls || functionCalls.length === 0) {
    return;
  }
  
  for (const functionCall of functionCalls) {
    if (!functionCall.id) {
      functionCall.id = generateClientFunctionCallId();
    }
  }
}

export function removeClientFunctionCallId(content: Content): void {
  if (content?.parts) {
    for (const part of content.parts) {
      if (part.type === 'function_call' && part.functionCall?.id?.startsWith(AF_FUNCTION_CALL_ID_PREFIX)) {
        part.functionCall.id = undefined;
      }
      if (part.type === 'function_response' && part.functionResponse?.id?.startsWith(AF_FUNCTION_CALL_ID_PREFIX)) {
        part.functionResponse.id = undefined;
      }
    }
  }
}

export function getLongRunningFunctionCalls(
  functionCalls: FunctionCall[],
  toolsDict: Record<string, BaseTool>
): Set<string> {
  const longRunningToolIds = new Set<string>();
  
  for (const functionCall of functionCalls) {
    if (functionCall.name in toolsDict && 
        toolsDict[functionCall.name].isLongRunning && 
        functionCall.id) {
      longRunningToolIds.add(functionCall.id);
    }
  }
  
  return longRunningToolIds;
}

export async function handleFunctionCallsAsync(
  invocationContext: InvocationContext,
  functionCallEvent: Event,
  toolsDict: Record<string, BaseTool>,
  filters?: Set<string>
): Promise<Event | null> {
  let functionCalls: FunctionCall[] = [];
  
  if (functionCallEvent.type === 'model_response' && 'response' in functionCallEvent) {
    functionCalls = functionCallEvent.response.toolCalls || [];
  } else if (functionCallEvent.type === 'tool_call' && 'toolCall' in functionCallEvent) {
    functionCalls = [functionCallEvent.toolCall];
  }
  
  if (!functionCalls || functionCalls.length === 0) {
    return null;
  }

  const functionResponseEvents: Event[] = [];
  
  for (const functionCall of functionCalls) {
    if (filters && !filters.has(functionCall.id || '')) {
      continue;
    }
    
    const { tool, toolContext } = getToolAndContext(
      invocationContext,
      functionCallEvent,
      functionCall,
      toolsDict
    );
    
    if (tool && toolContext) {
      try {
        const functionArgs = functionCall.arguments || {};
        const result = await callToolAsync(tool, functionArgs, toolContext);
        const responseEvent = buildResponseEvent(
          tool,
          result,
          toolContext,
          invocationContext
        );
        functionResponseEvents.push(responseEvent);
      } catch (error) {
        // Handle error appropriately
        console.error('Error calling tool:', error);
      }
    }
  }
  
  if (functionResponseEvents.length === 0) {
    return null;
  }
  
  return mergeParallelFunctionResponseEvents(functionResponseEvents);
}

function getToolAndContext(
  invocationContext: InvocationContext,
  functionCallEvent: Event,
  functionCall: FunctionCall,
  toolsDict: Record<string, BaseTool>
): { tool: BaseTool | null; toolContext: ToolContext | null } {
  const tool = toolsDict[functionCall.name];
  if (!tool) {
    return { tool: null, toolContext: null };
  }
  
  const toolContext: ToolContext = {
    context: invocationContext,
    sessionState: invocationContext.session.state,
    metadata: { functionCallId: functionCall.id || '' }
  };
  
  return { tool, toolContext };
}

async function callToolAsync(
  tool: BaseTool,
  args: Record<string, any>,
  toolContext: ToolContext
): Promise<any> {
  return await tool.call(args, toolContext);
}

function buildResponseEvent(
  tool: BaseTool,
  functionResult: Record<string, any>,
  toolContext: ToolContext,
  invocationContext: InvocationContext
): Event {
  const functionCallId = toolContext.metadata?.functionCallId || '';
  return {
    type: EventType.TOOL_RESPONSE,
    timestamp: new Date(),
    context: invocationContext,
    toolCall: {
      name: tool.name,
      arguments: {},
      id: functionCallId
    },
    response: {
      name: tool.name,
      content: JSON.stringify(functionResult),
      id: functionCallId
    }
  };
}

export function deepMergeDicts(d1: Record<string, any>, d2: Record<string, any>): Record<string, any> {
  const result = { ...d1 };
  
  for (const [key, value] of Object.entries(d2)) {
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      result[key] = deepMergeDicts(result[key] || {}, value);
    } else {
      result[key] = value;
    }
  }
  
  return result;
}

export function mergeParallelFunctionResponseEvents(functionResponseEvents: Event[]): Event {
  if (functionResponseEvents.length === 1) {
    return functionResponseEvents[0];
  }
  
  // Merge multiple function response events
  const mergedData = functionResponseEvents.reduce((acc, event) => {
    // Only merge data if the event has a data property (IterationStartEvent or IterationEndEvent)
    if ('data' in event && event.data) {
      return deepMergeDicts(acc, event.data);
    }
    return acc;
  }, {});
  
  // For merged events, we'll create a generic error event since there's no specific merged type
  return {
    type: EventType.ERROR,
    timestamp: new Date(),
    context: functionResponseEvents[0].context,
    error: new Error('Merged function response events')
  };
}

export function findMatchingFunctionCall(events: Event[]): Event | null {
  return events.find(event => event.type === EventType.TOOL_CALL) || null;
}