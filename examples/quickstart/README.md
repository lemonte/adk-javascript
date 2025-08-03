# ADK JavaScript Quickstart Example

This is a simple quickstart example that demonstrates how to create an agent using the ADK JavaScript library. The agent can answer questions about weather and time for specific cities.

## Features

- **Weather Information**: Get current weather for supported cities
- **Time Information**: Get current time for supported cities
- **Tool Integration**: Demonstrates how to integrate custom tools with an agent

## Supported Cities

Currently, this example supports:
- New York (weather and time)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Run the example:
```bash
npm start
```

## Code Structure

### Tools

The example includes two tools:

- `getWeather(city: string)`: Returns weather information for a city
- `getCurrentTime(city: string)`: Returns current time for a city

### Agent Configuration

The agent is configured with:
- **Name**: `weather_time_agent`
- **Model**: `gemini-2.0-flash`
- **Description**: Agent to answer questions about the time and weather in a city
- **Tools**: Weather and time retrieval functions

## Usage Example

Once you have the agent running, you can ask questions like:
- "What's the weather in New York?"
- "What time is it in New York?"
- "Can you tell me both the weather and time in New York?"

## Extending the Example

To add support for more cities:
1. Update the `getWeather` function to handle additional cities
2. Update the `getCurrentTime` function with appropriate timezone information
3. Add error handling for unsupported cities

## License

Copyright 2025 Google LLC

Licensed under the Apache License, Version 2.0.