# Token Usage Example

This example demonstrates how to track token usage when using multiple LLM models with the ADK JavaScript library. It shows how to monitor prompt tokens, candidate tokens, and total tokens across different model interactions.

## Features

- **Multiple Model Support**: Uses different Gemini models (2.0-flash, 1.5-flash, 1.5-pro)
- **Token Tracking**: Monitors token usage for each turn and cumulative session totals
- **Sequential Agent**: Demonstrates how multiple agents can work together
- **Performance Monitoring**: Tracks execution time and token consumption

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy the environment file and configure your API key:
   ```bash
   cp .env.example .env
   ```

3. Edit `.env` and add your Google AI API key:
   ```
   GOOGLE_API_KEY=your_actual_api_key_here
   ```

## Running the Example

```bash
npm start
```

## What It Does

1. **Initializes Multiple Agents**: Creates three different agents using different Gemini models
2. **Sequential Processing**: Each agent processes the user's request in sequence
3. **Token Monitoring**: Tracks and displays token usage for each model interaction
4. **Dice Rolling**: Demonstrates a simple tool (dice rolling) across multiple models
5. **Performance Metrics**: Shows total execution time and cumulative token usage

## Expected Output

The example will show:
- User input messages
- Agent responses from each model
- Token usage per turn (prompt, candidate, and total tokens)
- Cumulative session token totals
- Execution time metrics
- Any artifacts created during the session

## Key Concepts

- **Token Usage Tracking**: Learn how to monitor API costs and usage
- **Multi-Model Workflows**: See how different models can be used in sequence
- **Performance Monitoring**: Track both time and token consumption
- **State Management**: Understand how tool state persists across agent calls

This example is particularly useful for understanding the cost implications of using multiple models and for optimizing token usage in production applications.