# Weather Time Agent Example

This example demonstrates a simple agent that can provide weather information and current time for specific cities.

## Features

- Get weather information for New York
- Get current time for New York
- Error handling for unsupported cities

## Setup

1. Make sure you have the Google API key configured in the `.env` file in the `hello-world` directory
2. Install dependencies from the root of the project:
   ```bash
   npm install
   ```

## Running the Example

```bash
npx ts-node index.ts
```

## Tools Available

### getWeather(city: string)
Retrieves weather information for a specified city. Currently supports:
- New York (returns sunny weather with 25°C/77°F)

### getCurrentTime(city: string)
Returns the current time in a specified city. Currently supports:
- New York (returns time in America/New_York timezone)

## Example Interactions

- "What is the weather in New York?"
- "What time is it in New York?"
- "What about the weather in London?" (will return an error)