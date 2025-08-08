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
 * Configuration for files retrieval.
 */
export interface FilesRetrievalConfig {
    /**
     * Base directory to search for files.
     */
    baseDirectory: string;
    /**
     * File extensions to include in search.
     */
    allowedExtensions?: string[];
    /**
     * Maximum number of files to return.
     */
    maxResults?: number;
    /**
     * Whether to search recursively in subdirectories.
     */
    recursive?: boolean;
    /**
     * Patterns to exclude from search.
     */
    excludePatterns?: string[];
}
/**
 * A retrieval tool that searches for relevant content in local files.
 *
 * This tool performs text-based search across files in a specified directory,
 * useful for retrieving relevant documentation, code, or other text content.
 */
export declare class FilesRetrieval extends BaseRetrievalTool {
    private config;
    constructor(config: FilesRetrievalConfig);
    execute(params: RetrievalParams, context: ToolContext): Promise<RetrievalResult>;
    private findRelevantFiles;
    private extractContent;
    private calculateRelevanceScore;
    private extractRelevantSnippet;
}
//# sourceMappingURL=files-retrieval.d.ts.map