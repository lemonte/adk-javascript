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
exports.EventUtils = void 0;
/**
 * Utility functions for Event
 */
class EventUtils {
    /**
     * Returns whether the event is the final response of an agent.
     */
    static isFinalResponse(event) {
        if (event.actions.skipSummarization || event.longRunningToolIds) {
            return true;
        }
        return (!EventUtils.getFunctionCalls(event).length &&
            !EventUtils.getFunctionResponses(event).length &&
            !event.partial &&
            !EventUtils.hasTrailingCodeExecutionResult(event));
    }
    /**
     * Returns the function calls in the event.
     */
    static getFunctionCalls(event) {
        const funcCalls = [];
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
    static getFunctionResponses(event) {
        const funcResponses = [];
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
    static hasTrailingCodeExecutionResult(event) {
        if (event.content && event.content.parts && event.content.parts.length > 0) {
            const lastPart = event.content.parts[event.content.parts.length - 1];
            return lastPart.codeExecutionResult !== undefined;
        }
        return false;
    }
    /**
     * Generates a new unique ID for an event.
     */
    static newId() {
        return crypto.randomUUID();
    }
}
exports.EventUtils = EventUtils;
//# sourceMappingURL=event.js.map