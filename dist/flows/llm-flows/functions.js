"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateClientFunctionCallId = generateClientFunctionCallId;
exports.populateClientFunctionCallId = populateClientFunctionCallId;
exports.removeClientFunctionCallId = removeClientFunctionCallId;
exports.getLongRunningFunctionCalls = getLongRunningFunctionCalls;
exports.handleFunctionCallsAsync = handleFunctionCallsAsync;
exports.deepMergeDicts = deepMergeDicts;
exports.mergeParallelFunctionResponseEvents = mergeParallelFunctionResponseEvents;
exports.findMatchingFunctionCall = findMatchingFunctionCall;
/**
 * Handles function callings for LLM flow.
 */
const uuid_1 = require("uuid");
const events_1 = require("../../events");
const AF_FUNCTION_CALL_ID_PREFIX = 'adk-';
const REQUEST_EUC_FUNCTION_CALL_NAME = 'adk_request_credential';
function generateClientFunctionCallId() {
    return `${AF_FUNCTION_CALL_ID_PREFIX}${(0, uuid_1.v4)()}`;
}
function populateClientFunctionCallId(modelResponseEvent) {
    let functionCalls = [];
    if (modelResponseEvent.type === 'model_response' && 'response' in modelResponseEvent) {
        functionCalls = modelResponseEvent.response.toolCalls || [];
    }
    else if (modelResponseEvent.type === 'tool_call' && 'toolCall' in modelResponseEvent) {
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
function removeClientFunctionCallId(content) {
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
function getLongRunningFunctionCalls(functionCalls, toolsDict) {
    const longRunningToolIds = new Set();
    for (const functionCall of functionCalls) {
        if (functionCall.name in toolsDict &&
            toolsDict[functionCall.name].isLongRunning &&
            functionCall.id) {
            longRunningToolIds.add(functionCall.id);
        }
    }
    return longRunningToolIds;
}
async function handleFunctionCallsAsync(invocationContext, functionCallEvent, toolsDict, filters) {
    let functionCalls = [];
    if (functionCallEvent.type === 'model_response' && 'response' in functionCallEvent) {
        functionCalls = functionCallEvent.response.toolCalls || [];
    }
    else if (functionCallEvent.type === 'tool_call' && 'toolCall' in functionCallEvent) {
        functionCalls = [functionCallEvent.toolCall];
    }
    if (!functionCalls || functionCalls.length === 0) {
        return null;
    }
    const functionResponseEvents = [];
    for (const functionCall of functionCalls) {
        if (filters && !filters.has(functionCall.id || '')) {
            continue;
        }
        const { tool, toolContext } = getToolAndContext(invocationContext, functionCallEvent, functionCall, toolsDict);
        if (tool && toolContext) {
            try {
                const functionArgs = functionCall.arguments || {};
                const result = await callToolAsync(tool, functionArgs, toolContext);
                const responseEvent = buildResponseEvent(tool, result, toolContext, invocationContext);
                functionResponseEvents.push(responseEvent);
            }
            catch (error) {
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
function getToolAndContext(invocationContext, functionCallEvent, functionCall, toolsDict) {
    const tool = toolsDict[functionCall.name];
    if (!tool) {
        return { tool: null, toolContext: null };
    }
    const toolContext = {
        context: invocationContext,
        sessionState: invocationContext.session.state,
        metadata: { functionCallId: functionCall.id || '' }
    };
    return { tool, toolContext };
}
async function callToolAsync(tool, args, toolContext) {
    return await tool.call(args, toolContext);
}
function buildResponseEvent(tool, functionResult, toolContext, invocationContext) {
    const functionCallId = toolContext.metadata?.functionCallId || '';
    return {
        type: events_1.EventType.TOOL_RESPONSE,
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
function deepMergeDicts(d1, d2) {
    const result = { ...d1 };
    for (const [key, value] of Object.entries(d2)) {
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            result[key] = deepMergeDicts(result[key] || {}, value);
        }
        else {
            result[key] = value;
        }
    }
    return result;
}
function mergeParallelFunctionResponseEvents(functionResponseEvents) {
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
        type: events_1.EventType.ERROR,
        timestamp: new Date(),
        context: functionResponseEvents[0].context,
        error: new Error('Merged function response events')
    };
}
function findMatchingFunctionCall(events) {
    return events.find(event => event.type === events_1.EventType.TOOL_CALL) || null;
}
//# sourceMappingURL=functions.js.map