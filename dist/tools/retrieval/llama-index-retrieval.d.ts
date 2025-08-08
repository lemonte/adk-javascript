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
import { BaseRetrievalTool, RetrievalParams, RetrievalResult } from './base-retrieval-tool';
import { ToolContext } from '../base-tool';
/**
 * Configuration for LlamaIndex retrieval.
 */
export interface LlamaIndexRetrievalConfig {
    /**
     * The index to query against.
     */
    indexPath?: string;
    /**
     * Maximum number of results to return.
     */
    maxResults?: number;
    /**
     * Similarity threshold for results.
     */
    similarityThreshold?: number;
    /**
     * Custom retrieval parameters.
     */
    retrievalParams?: Record<string, any>;
}
/**
 * A retrieval tool that uses LlamaIndex for semantic search.
 *
 * This tool integrates with LlamaIndex to perform semantic retrieval
 * over indexed documents, providing more sophisticated search capabilities
 * than simple text matching.
 *
 * Note: This is a placeholder implementation. To use this tool, you would need
 * to install and configure the LlamaIndex JavaScript/TypeScript library.
 */
export declare class LlamaIndexRetrieval extends BaseRetrievalTool {
    private config;
    constructor(config?: LlamaIndexRetrievalConfig);
    execute(params: RetrievalParams, context: ToolContext): Promise<RetrievalResult>;
    private loadIndex;
}
//# sourceMappingURL=llama-index-retrieval.d.ts.map