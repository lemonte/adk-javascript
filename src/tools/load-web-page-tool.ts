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
export class LoadWebPageTool extends BaseTool {
  private config: LoadWebPageToolConfig;

  constructor(config: LoadWebPageToolConfig = {}) {
    super({
      name: 'load_web_page',
      description: 'Fetches the content from a URL and returns the text content. Useful for browsing web pages and extracting readable text.',
      parameters: {
        type: 'object',
        properties: {
          url: {
            type: 'string',
            description: 'The URL to browse and extract text content from'
          }
        },
        required: ['url']
      }
    });
    this.config = {
      timeout: 10000,
      followRedirects: true,
      ...config,
    };
  }

  getToolDefinition(): ToolDefinition {
    return this.getDefinition();
  }

  async execute(params: LoadWebPageParams, context: ToolContext): Promise<string> {
    try {
      const response = await this.fetchWebPage(params.url);
      return this.extractTextContent(response);
    } catch (error) {
      return `Failed to fetch URL: ${params.url}. Error: ${error instanceof Error ? error.message : String(error)}`;
    }
  }

  private async fetchWebPage(url: string): Promise<string> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        redirect: this.config.followRedirects ? 'follow' : 'manual',
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; ADK-WebLoader/1.0)',
          ...this.config.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.text();
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private extractTextContent(html: string): string {
    // Simple HTML parsing - in a real implementation, you might want to use a proper HTML parser
    // Remove script and style elements
    let text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
    text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
    
    // Remove HTML tags
    text = text.replace(/<[^>]*>/g, ' ');
    
    // Decode HTML entities
    text = text.replace(/&nbsp;/g, ' ');
    text = text.replace(/&amp;/g, '&');
    text = text.replace(/&lt;/g, '<');
    text = text.replace(/&gt;/g, '>');
    text = text.replace(/&quot;/g, '"');
    text = text.replace(/&#39;/g, "'");
    
    // Split into lines and filter out very short lines
    const lines = text.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0 && line.split(/\s+/).length > 3);
    
    return lines.join('\n');
  }
}

/**
 * Standalone function for loading web page content.
 * 
 * @param url The URL to browse
 * @returns The text content of the URL
 */
export async function loadWebPage(url: string): Promise<string> {
  const tool = new LoadWebPageTool();
  const context = {} as ToolContext; // Minimal context for standalone usage
  return tool.execute({ url }, context);
}