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
import { AdvancedToolContext } from './tool-context';
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
export class VertexAiSearchTool extends BaseTool {
  private dataStoreId?: string;
  private dataStoreSpecs?: VertexAISearchDataStoreSpec[];
  private searchEngineId?: string;
  private filter?: string;
  private maxResults?: number;

  constructor(config: VertexAiSearchToolConfig) {
    // Name and description are not used because this is a model built-in tool.
    super({
      name: 'vertex_ai_search',
      description: 'vertex_ai_search',
    });

    // Validate configuration
    if ((!config.dataStoreId && !config.searchEngineId) || 
        (config.dataStoreId && config.searchEngineId)) {
      throw new Error('Either dataStoreId or searchEngineId must be specified.');
    }

    if (config.dataStoreSpecs && !config.searchEngineId) {
      throw new Error('searchEngineId must be specified if dataStoreSpecs is specified.');
    }

    this.dataStoreId = config.dataStoreId;
    this.dataStoreSpecs = config.dataStoreSpecs;
    this.searchEngineId = config.searchEngineId;
    this.filter = config.filter;
    this.maxResults = config.maxResults;
  }

  async execute(params: any, context: ToolContext): Promise<any> {
    // This tool is handled internally by the Gemini model
    // and does not require local execution
    throw new Error('VertexAiSearchTool should not be executed locally. It is handled by the Gemini model.');
  }

  /**
   * Process LLM request to add Vertex AI Search capabilities.
   * This method configures the LLM request to include Vertex AI Search tools.
   */
  async processLlmRequest(toolContext: ToolContext, llmRequest: any): Promise<void> {
    // This is a placeholder for LLM request processing
    // In a real implementation, this would:
    // 1. Check if the model is a Gemini model
    // 2. Add Vertex AI Search tools to the request configuration
    // 3. Handle compatibility with other tools for Gemini 1.x
    
    throw new Error('LLM request processing not implemented yet.');
    
    // Example of what the implementation might look like:
    /*
    if (isGeminiModel(llmRequest.model)) {
      if (isGemini1Model(llmRequest.model) && llmRequest.config?.tools?.length > 0) {
        throw new Error(
          'Vertex AI search tool can not be used with other tools in Gemini 1.x.'
        );
      }
      
      llmRequest.config = llmRequest.config || {};
      llmRequest.config.tools = llmRequest.config.tools || [];
      
      llmRequest.config.tools.push({
        retrieval: {
          vertexAiSearch: {
            datastore: this.dataStoreId,
            dataStoreSpecs: this.dataStoreSpecs,
            engine: this.searchEngineId,
            filter: this.filter,
            maxResults: this.maxResults,
          }
        }
      });
    } else {
      throw new Error(
        `Vertex AI search tool is not supported for model ${llmRequest.model}`
      );
    }
    */
  }

  /**
   * Get the configuration of this Vertex AI Search tool.
   */
  getConfig(): VertexAiSearchToolConfig {
    return {
      dataStoreId: this.dataStoreId,
      dataStoreSpecs: this.dataStoreSpecs,
      searchEngineId: this.searchEngineId,
      filter: this.filter,
      maxResults: this.maxResults,
    };
  }
}