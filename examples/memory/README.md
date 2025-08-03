# Memory Agent Example

This example demonstrates an agent that can store and retrieve information using memory tools.

## Features

- Save data to memory with custom keys
- Load data from memory by key
- List all available memory keys
- Automatic timestamp tracking
- Persistent memory during the session

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

### saveMemory(key: string, value: any)
Saves data to memory with a specified key.

### loadMemory(key: string)
Loads data from memory using the specified key. Returns null if the key doesn't exist.

### listMemoryKeys()
Returns an array of all available memory keys.

## Example Interactions

- "Save my favorite color as blue with key 'favorite_color'"
- "What is my favorite color?"
- "What keys do you have stored?"
- "Save my age as 25 with key 'age'"
- "What is my age?"

## Features Demonstrated

- **State Management**: The agent maintains a `_time` field that gets updated before each interaction
- **Memory Persistence**: Data stored during the session persists across multiple interactions
- **Error Handling**: Graceful handling of non-existent keys
- **Complex Data Types**: Can store strings, numbers, arrays, and objects