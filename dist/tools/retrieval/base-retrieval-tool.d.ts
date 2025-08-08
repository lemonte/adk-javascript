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
import { BaseTool } from '../base-tool';
import { ToolDefinition } from '../../types';
/**
 * Parameters for retrieval operations.
 */
export interface RetrievalParams {
    /**
     * The query to retrieve relevant information for.
     */
    query: string;
}
/**
 * Result from a retrieval operation.
 */
export interface RetrievalResult {
    /**
     * Retrieved documents or content.
     */
    documents: Array<{
        content: string;
        metadata?: Record<string, any>;
        score?: number;
    }>;
    /**
     * Total number of documents found.
     */
    totalCount?: number;
    /**
     * Additional metadata about the retrieval operation.
     */
    metadata?: Record<string, any>;
}
/**
 * Base class for retrieval tools.
 *
 * This abstract class provides a common interface for different types of
 * retrieval tools, such as file-based retrieval, vector database retrieval,
 * or external API-based retrieval.
 */
export declare abstract class BaseRetrievalTool extends BaseTool {
    constructor(config: {
        name: string;
        description: string;
    });
    getToolDefinition(): ToolDefinition;
}
//# sourceMappingURL=base-retrieval-tool.d.ts.map