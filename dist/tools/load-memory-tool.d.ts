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
import { FunctionTool } from './function-tool';
import { AdvancedToolContext } from './tool-context';
import { MemoryEntry } from '../memory';
import { ToolDefinition } from '../types';
/**
 * Parameters for the load memory function.
 */
export interface LoadMemoryParams {
    /**
     * The query to search for in memory.
     */
    query: string;
}
/**
 * Response from loading memory.
 */
export interface LoadMemoryResponse {
    /**
     * List of memory entries matching the query.
     */
    memories: MemoryEntry[];
}
/**
 * Loads the memory for the current user.
 *
 * @param query The query to load the memory for
 * @param toolContext The tool context containing memory service
 * @returns A list of memory results
 */
export declare function loadMemory(query: string, toolContext: AdvancedToolContext): Promise<LoadMemoryResponse>;
/**
 * Tool for loading memory entries based on a query.
 *
 * This tool allows agents to search and retrieve relevant memory entries
 * for the current user based on a search query.
 */
export declare class LoadMemoryTool extends FunctionTool {
    constructor();
    getToolDefinition(): ToolDefinition;
}
//# sourceMappingURL=load-memory-tool.d.ts.map