"use strict";
/**
 * Google Search tool implementation for the ADK JavaScript SDK
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleSearchTool = void 0;
const base_tool_1 = require("./base-tool");
const types_1 = require("../types");
const axios_1 = __importDefault(require("axios"));
/**
 * Tool for performing Google searches using Custom Search API
 */
class GoogleSearchTool extends base_tool_1.BaseTool {
    constructor(config = {}) {
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
            throw new types_1.ToolError('Google Search API key and Search Engine ID are required. ' +
                'Set GOOGLE_API_KEY and GOOGLE_SEARCH_ENGINE_ID environment variables or pass them in config.');
        }
        this.maxResults = config.maxResults || 10;
        this.safeSearch = config.safeSearch || 'medium';
        this.language = config.language;
        this.country = config.country;
    }
    /**
     * Execute Google search
     */
    async execute(args, context) {
        return this.safeExecute(async () => {
            this.validateArguments(args);
            const { query, num_results = 10 } = args;
            const numResults = Math.min(Math.max(num_results, 1), this.maxResults);
            this.logger.info(`Searching Google for: "${query}"`);
            // Build search URL
            const searchUrl = 'https://www.googleapis.com/customsearch/v1';
            const params = {
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
                const response = await axios_1.default.get(searchUrl, {
                    params,
                    timeout: 30000 // 30 second timeout
                });
                const results = (response.data.items || []).map(item => ({
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
            }
            catch (error) {
                if (axios_1.default.isAxiosError(error)) {
                    const status = error.response?.status;
                    const message = error.response?.data?.error?.message || error.message;
                    if (status === 403) {
                        throw new types_1.ToolError('Google Search API access denied. Check your API key and quotas.', { status, message });
                    }
                    else if (status === 429) {
                        throw new types_1.ToolError('Google Search API rate limit exceeded. Please try again later.', { status, message });
                    }
                    else {
                        throw new types_1.ToolError(`Google Search API error: ${message}`, { status, message });
                    }
                }
                throw error;
            }
        });
    }
    /**
     * Test the Google Search API connection
     */
    async testConnection() {
        try {
            await this.execute({ query: 'test', num_results: 1 }, {
                context: {
                    sessionId: 'test',
                    userId: 'test',
                    appName: 'test',
                    agentName: 'test',
                    requestId: 'test',
                    timestamp: new Date(),
                    agent: null,
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
        }
        catch (error) {
            this.logger.error('Google Search API connection test failed', error);
            return false;
        }
    }
    /**
     * Get API usage information
     */
    getApiInfo() {
        return {
            hasApiKey: !!this.apiKey,
            hasSearchEngineId: !!this.searchEngineId,
            maxResults: this.maxResults,
            safeSearch: this.safeSearch
        };
    }
}
exports.GoogleSearchTool = GoogleSearchTool;
//# sourceMappingURL=google-search-tool.js.map