"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdvancedToolContext = void 0;
/**
 * The context of the tool.
 *
 * This class provides the context for a tool invocation, including access to
 * the invocation context, function call ID, event actions, and authentication
 * response. It also provides methods for requesting credentials, retrieving
 * authentication responses, listing artifacts, and searching memory.
 */
class AdvancedToolContext {
    constructor(invocationContext, options = {}) {
        this.invocationContext = invocationContext;
        this.functionCallId = options.functionCallId;
        this.eventActions = options.eventActions;
    }
    /**
     * Get the event actions.
     */
    get actions() {
        if (!this.eventActions) {
            throw new Error('Event actions not available');
        }
        return this.eventActions;
    }
    /**
     * Request credentials for authentication.
     */
    requestCredential(authConfig) {
        if (!this.functionCallId) {
            throw new Error('function_call_id is not set.');
        }
        // Implementation would depend on auth system
        throw new Error('Authentication not implemented yet');
    }
    /**
     * Get authentication response.
     */
    getAuthResponse(authConfig) {
        // Implementation would depend on auth system
        throw new Error('Authentication not implemented yet');
    }
    /**
     * Searches the memory of the current user.
     */
    async searchMemory(query) {
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
exports.AdvancedToolContext = AdvancedToolContext;
//# sourceMappingURL=tool-context.js.map