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
import { ToolDefinition } from '../types';
/**
 * Configuration for the LoadWebPageTool.
 */
export interface LoadWebPageToolConfig {
    /**
     * Custom headers to include in the request.
     */
    headers?: Record<string, string>;
    /**
     * Timeout for the request in milliseconds.
     */
    timeout?: number;
    /**
     * Whether to follow redirects.
     */
    followRedirects?: boolean;
}
/**
 * Parameters for the load web page function.
 */
export interface LoadWebPageParams {
    /**
     * The URL to browse and extract text content from.
     */
    url: string;
}
/**
 * Tool for loading and extracting text content from web pages.
 *
 * This tool fetches the content from a given URL and returns the text content,
 * filtering out very short lines to provide meaningful content.
 */
export declare class LoadWebPageTool extends BaseTool {
    private config;
    constructor(config?: LoadWebPageToolConfig);
    getToolDefinition(): ToolDefinition;
    execute(params: LoadWebPageParams, context: ToolContext): Promise<string>;
    private fetchWebPage;
    private extractTextContent;
}
/**
 * Standalone function for loading web page content.
 *
 * @param url The URL to browse
 * @returns The text content of the URL
 */
export declare function loadWebPage(url: string): Promise<string>;
//# sourceMappingURL=load-web-page-tool.d.ts.map