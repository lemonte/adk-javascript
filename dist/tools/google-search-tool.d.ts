/**
 * Google Search tool implementation for the ADK JavaScript SDK
 */
import { BaseTool, BaseToolConfig, ToolContext } from './base-tool';
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
 * Tool for performing Google searches using Custom Search API
 */
export declare class GoogleSearchTool extends BaseTool {
    private readonly apiKey;
    private readonly searchEngineId;
    private readonly maxResults;
    private readonly safeSearch;
    private readonly language?;
    private readonly country?;
    constructor(config?: GoogleSearchToolConfig);
    /**
     * Execute Google search
     */
    execute(args: {
        query: string;
        num_results?: number;
    }, context: ToolContext): Promise<{
        results: SearchResult[];
        totalResults?: string;
        searchTime?: number;
    }>;
    /**
     * Test the Google Search API connection
     */
    testConnection(): Promise<boolean>;
    /**
     * Get API usage information
     */
    getApiInfo(): {
        hasApiKey: boolean;
        hasSearchEngineId: boolean;
        maxResults: number;
        safeSearch: string;
    };
}
//# sourceMappingURL=google-search-tool.d.ts.map