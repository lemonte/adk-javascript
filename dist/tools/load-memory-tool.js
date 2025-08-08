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
exports.LoadMemoryTool = void 0;
exports.loadMemory = loadMemory;
const function_tool_1 = require("./function-tool");
/**
 * Loads the memory for the current user.
 *
 * @param query The query to load the memory for
 * @param toolContext The tool context containing memory service
 * @returns A list of memory results
 */
async function loadMemory(query, toolContext) {
    const searchMemoryResponse = await toolContext.searchMemory(query);
    return {
        memories: searchMemoryResponse.memories,
    };
}
/**
 * Tool for loading memory entries based on a query.
 *
 * This tool allows agents to search and retrieve relevant memory entries
 * for the current user based on a search query.
 */
class LoadMemoryTool extends function_tool_1.FunctionTool {
    constructor() {
        super({
            name: 'load_memory',
            description: 'Loads memory entries for the current user based on a search query. Useful for retrieving relevant past conversations, context, or stored information.',
            func: async (params, context) => {
                return loadMemory(params.query, context);
            },
            parameters: {
                type: 'object',
                properties: {
                    query: {
                        type: 'string',
                        description: 'The query to search for in memory. Use descriptive terms related to what you want to find.'
                    }
                },
                required: ['query']
            }
        });
    }
    getToolDefinition() {
        return this.getDefinition();
    }
}
exports.LoadMemoryTool = LoadMemoryTool;
//# sourceMappingURL=load-memory-tool.js.map