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
import { BaseTool } from './base-tool';
import { ToolContext } from './base-tool';
/**
 * Vertex AI Search data store specification.
 */
export interface VertexAISearchDataStoreSpec {
    /**
     * The data store ID.
     */
    dataStore: string;
    /**
     * Additional configuration for the data store.
     */
    [key: string]: any;
}
/**
 * Configuration for Vertex AI Search tool.
 */
export interface VertexAiSearchToolConfig {
    /**
     * The Vertex AI search data store resource ID in the format of
     * "projects/{project}/locations/{location}/collections/{collection}/dataStores/{dataStore}".
     */
    dataStoreId?: string;
    /**
     * Specifications that define the specific DataStores to be searched.
     * It should only be set if engine is used.
     */
    dataStoreSpecs?: VertexAISearchDataStoreSpec[];
    /**
     * The Vertex AI search engine resource ID in the format of
     * "projects/{project}/locations/{location}/collections/{collection}/engines/{engine}".
     */
    searchEngineId?: string;
    /**
     * Filter to apply to search results.
     */
    filter?: string;
    /**
     * Maximum number of results to return.
     */
    maxResults?: number;
}
/**
 * A built-in tool using Vertex AI Search.
 *
 * This tool integrates with Google Cloud's Vertex AI Search service to perform
 * enterprise search over indexed documents and data stores.
 */
export declare class VertexAiSearchTool extends BaseTool {
    private dataStoreId?;
    private dataStoreSpecs?;
    private searchEngineId?;
    private filter?;
    private maxResults?;
    constructor(config: VertexAiSearchToolConfig);
    execute(params: any, context: ToolContext): Promise<any>;
    /**
     * Process LLM request to add Vertex AI Search capabilities.
     * This method configures the LLM request to include Vertex AI Search tools.
     */
    processLlmRequest(toolContext: ToolContext, llmRequest: any): Promise<void>;
    /**
     * Get the configuration of this Vertex AI Search tool.
     */
    getConfig(): VertexAiSearchToolConfig;
}
//# sourceMappingURL=vertex-ai-search-tool.d.ts.map