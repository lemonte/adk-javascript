# Google Search Agent Example

This example demonstrates how to create an agent that can perform Google searches and answer questions based on the search results.

## Features

- **Google Search Integration**: Performs web searches using Google Custom Search API
- **Result Analysis**: Analyzes search results to provide comprehensive answers
- **Mock Implementation**: Includes mock search results for demonstration purposes

## Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment variables**:
   Copy `.env.example` to `.env` and fill in your API keys:
   ```bash
   cp .env.example .env
   ```

   Required variables:
   - `GOOGLE_API_KEY`: Your Google AI API key for Gemini
   - `GOOGLE_SEARCH_API_KEY`: Your Google Custom Search API key (optional for mock version)
   - `GOOGLE_SEARCH_ENGINE_ID`: Your Custom Search Engine ID (optional for mock version)

## Usage

Run the example:
```bash
npm start
```

The agent will demonstrate:
- Responding to general queries
- Performing mock Google searches
- Analyzing and summarizing search results

## Real Google Search Integration

To use real Google Search instead of mock results:

1. **Get Google Custom Search API Key**:
   - Visit [Google Cloud Console](https://console.cloud.google.com/)
   - Enable the Custom Search API
   - Create an API key

2. **Create Custom Search Engine**:
   - Visit [Google Custom Search](https://cse.google.com/cse/)
   - Create a new search engine
   - Get the Search Engine ID

3. **Update the agent.ts file**:
   - Replace the mock implementation with actual API calls
   - Use the Google Custom Search JSON API

## Example Interactions

- "Search for information about artificial intelligence"
- "What are the latest trends in machine learning?"
- "Find news about renewable energy"

## Note

This example currently uses mock search results for demonstration purposes. The mock implementation shows how the agent would work with real search results without requiring actual API keys for testing.