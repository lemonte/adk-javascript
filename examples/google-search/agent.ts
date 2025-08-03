// Copyright 2025 Geanderson Lemonte
// Based on Google ADK libraries
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import * as dotenv from 'dotenv';
dotenv.config({ override: true });

import { Agent, createTool } from '../../src';

interface SearchResult {
  status: string;
  results?: Array<{
    title: string;
    link: string;
    snippet: string;
  }>;
  error_message?: string;
}

// Mock Google Search tool (since we don't have the actual Google Search API implementation)
const googleSearchTool = createTool(
  function googleSearch(query: string): SearchResult {
    // This is a mock implementation
    // In a real implementation, you would call the Google Custom Search API
    try {
      // Mock search results
      const mockResults = [
        {
          title: `Search result for "${query}" - Example 1`,
          link: 'https://example1.com',
          snippet: `This is a mock search result for the query "${query}". In a real implementation, this would be actual search results from Google.`
        },
        {
          title: `Search result for "${query}" - Example 2`,
          link: 'https://example2.com',
          snippet: `Another mock result for "${query}". You would need to implement the actual Google Custom Search API integration.`
        },
        {
          title: `Search result for "${query}" - Example 3`,
          link: 'https://example3.com',
          snippet: `Third mock result for the search query "${query}". This demonstrates how search results would be formatted.`
        }
      ];

      return {
        status: 'success',
        results: mockResults
      };
    } catch (error) {
      return {
        status: 'error',
        error_message: `Failed to search for "${query}": ${error}`
      };
    }
  },
  {
    name: 'google_search',
    description: 'Performs a Google search and returns the top results',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'The search query to execute'
        }
      },
      required: ['query']
    }
  }
);

export const rootAgent = new Agent({
  name: 'google_search_agent',
  model: 'gemini-2.0-flash',
  description: 'An agent that performs Google search queries and answers questions about the results.',
  instruction: `You are an agent whose job is to perform Google search queries and answer questions about the results.

When a user asks you to search for something, use the google_search tool to find relevant information.
Analyze the search results and provide a comprehensive answer based on the information found.
If the search results don't contain enough information to answer the question, let the user know and suggest refining the search query.

Note: This example uses mock search results for demonstration purposes. In a real implementation, you would integrate with the Google Custom Search API.`,
  tools: [googleSearchTool]
});