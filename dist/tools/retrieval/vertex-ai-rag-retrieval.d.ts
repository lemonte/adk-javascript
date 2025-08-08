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
 * Configuration for Vertex AI RAG retrieval.
 */
export interface VertexAiRagRetrievalConfig {
    /**
     * Name of the retrieval tool.
     */
    name: string;
    /**
     * Description of the retrieval tool.
     */
    description: string;
    /**
     * List of RAG corpora to search.
     */
    ragCorpora?: string[];
    /**
     * List of RAG resources to search.
     */
    ragResources?: any[];
    /**
     * Maximum number of similar results to return.
     */
    similarityTopK?: number;
    /**
     * Threshold for vector distance similarity.
     */
    vectorDistanceThreshold?: number;
}
/**
 * Vertex RAG store configuration.
 */
export interface VertexRagStore {
    ragCorpora?: string[];
    ragResources?: any[];
    similarityTopK?: number;
    vectorDistanceThreshold?: number;
}
/**
 * A retrieval tool that uses Vertex AI RAG (Retrieval-Augmented Generation) to retrieve data.
 *
 * This tool integrates with Google Cloud's Vertex AI RAG service to perform
 * semantic search over indexed documents and corpora.
 *
 * Note: This is a placeholder implementation. To use this tool, you would need
 * to install and configure the Vertex AI JavaScript/TypeScript SDK.
 */
export declare class VertexAiRagRetrieval extends BaseRetrievalTool {
    private vertexRagStore;
    constructor(config: VertexAiRagRetrievalConfig);
    execute(params: RetrievalParams, context: ToolContext): Promise<RetrievalResult>;
    /**
     * Process LLM request to add Vertex AI RAG tools for Gemini 2 models.
     * This method would be called to enhance LLM requests with RAG capabilities.
     */
    processLlmRequest(toolContext: ToolContext, llmRequest: any): Promise<void>;
    private performRagRetrieval;
}
//# sourceMappingURL=vertex-ai-rag-retrieval.d.ts.map