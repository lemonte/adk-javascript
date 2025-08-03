/**
 * Google Search tool implementation for the ADK JavaScript SDK
 */

import { BaseTool, BaseToolConfig, ToolContext } from './base-tool';
import { ToolError } from '../types';
import axios from 'axios';

/**
 * Google Search tool configuration
 */
export interface GoogleSearchToolConfig extends Partial<BaseToolConfig> {
  apiKey?: string;
  searchEngineId?: string;
  maxResults?: number;
  safeSearch?: 'off' | 'medium' | 'high';
  language?: string;
  country?: string;
}

/**
 * Search result interface
 */
export interface SearchResult {
  title: string;
  link: string;
  snippet: string;
  displayLink?: string;
  formattedUrl?: string;
}

/**
 * Google Custom Search API response
 */
interface GoogleSearchResponse {
  items?: Array<{
    title: string;
    link: string;
    snippet: string;
    displayLink?: string;
    formattedUrl?: string;
  }>;
  searchInformation?: {
    totalResults: string;
    searchTime: number;
  };
}

/**
 * Tool for performing Google searches using Custom Search API
 */
export class GoogleSearchTool extends BaseTool {
  private readonly apiKey: string;
  private readonly searchEngineId: string;
  private readonly maxResults: number;
  private readonly safeSearch: string;
  private readonly language?: string;
  private readonly country?: string;

  constructor(config: GoogleSearchToolConfig = {}) {
    super({
      name: config.name || 'google_search',
      description: config.description || 'Search the web using Google Custom Search API',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'The search query to execute'
          },
          num_results: {
            type: 'integer',
            description: 'Number of results to return (1-10)',
            minimum: 1,
            maximum: 10
          }
        },
        required: ['query']
      },
      metadata: config.metadata
    });

    // Get API credentials from config or environment
    this.apiKey = config.apiKey || process.env.GOOGLE_API_KEY || '';
    this.searchEngineId = config.searchEngineId || process.env.GOOGLE_SEARCH_ENGINE_ID || '';
    
    if (!this.apiKey || !this.searchEngineId) {
      throw new ToolError(
        'Google Search API key and Search Engine ID are required. ' +
        'Set GOOGLE_API_KEY and GOOGLE_SEARCH_ENGINE_ID environment variables or pass them in config.'
      );
    }

    this.maxResults = config.maxResults || 10;
    this.safeSearch = config.safeSearch || 'medium';
    this.language = config.language;
    this.country = config.country;
  }

  /**
   * Execute Google search
   */
  async execute(
    args: { query: string; num_results?: number },
    context: ToolContext
  ): Promise<{
    results: SearchResult[];
    totalResults?: string;
    searchTime?: number;
  }> {
    return this.safeExecute(async () => {
      this.validateArguments(args);

      const { query, num_results = 10 } = args;
      const numResults = Math.min(Math.max(num_results, 1), this.maxResults);

      this.logger.info(`Searching Google for: "${query}"`);

      // Build search URL
      const searchUrl = 'https://www.googleapis.com/customsearch/v1';
      const params: Record<string, string> = {
        key: this.apiKey,
        cx: this.searchEngineId,
        q: query,
        num: numResults.toString(),
        safe: this.safeSearch
      };

      if (this.language) {
        params.lr = `lang_${this.language}`;
      }

      if (this.country) {
        params.gl = this.country;
      }

      try {
        const response = await axios.get<GoogleSearchResponse>(searchUrl, {
          params,
          timeout: 30000 // 30 second timeout
        });

        const results: SearchResult[] = (response.data.items || []).map(item => ({
          title: item.title,
          link: item.link,
          snippet: item.snippet,
          displayLink: item.displayLink,
          formattedUrl: item.formattedUrl
        }));

        const result = {
          results,
          totalResults: response.data.searchInformation?.totalResults,
          searchTime: response.data.searchInformation?.searchTime
        };

        this.logExecution(args, `Found ${results.length} results`);
        
        return result;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const status = error.response?.status;
          const message = error.response?.data?.error?.message || error.message;
          
          if (status === 403) {
            throw new ToolError(
              'Google Search API access denied. Check your API key and quotas.',
              { status, message }
            );
          } else if (status === 429) {
            throw new ToolError(
              'Google Search API rate limit exceeded. Please try again later.',
              { status, message }
            );
          } else {
            throw new ToolError(
              `Google Search API error: ${message}`,
              { status, message }
            );
          }
        }
        
        throw error;
      }
    });
  }

  /**
   * Test the Google Search API connection
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.execute({ query: 'test', num_results: 1 }, {
        context: { 
          sessionId: 'test', 
          userId: 'test',
          appName: 'test',
          agentName: 'test',
          requestId: 'test',
          timestamp: new Date(),
          agent: null as any,
          session: {
            id: 'test',
            appName: 'test',
            userId: 'test',
            state: {},
            events: [],
            lastUpdateTime: Date.now()
          },
          invocationId: 'test',
          branch: undefined,
          userContent: undefined,
          endInvocation: false
        },
        sessionState: { messages: [], metadata: {} }
      });
      return true;
    } catch (error) {
      this.logger.error('Google Search API connection test failed', error);
      return false;
    }
  }

  /**
   * Get API usage information
   */
  getApiInfo(): {
    hasApiKey: boolean;
    hasSearchEngineId: boolean;
    maxResults: number;
    safeSearch: string;
  } {
    return {
      hasApiKey: !!this.apiKey,
      hasSearchEngineId: !!this.searchEngineId,
      maxResults: this.maxResults,
      safeSearch: this.safeSearch
    };
  }
}