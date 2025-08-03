# Hello World Example

This is a simple "Hello World" example that demonstrates the basic usage of the ADK JavaScript SDK.

## Features

- Creates a simple agent with dice rolling and prime checking tools
- Demonstrates tool calling functionality
- Shows how to run conversations with an agent
- Includes proper error handling and logging
- Uses modular agent definition

## Files

- `agent.ts` - Defines the hello world agent with tools
- `index.ts` - Main example runner that demonstrates the agent
- `package.json` - Project configuration
- `.env.example` - Environment variables template

## Setup

1. Copy `.env.example` to `.env` and add your Google API key:
   ```
   cp .env.example .env
   ```
   Then edit `.env` and add your API key.

2. Run the example:
   ```
   npm start
   ```

## What it does

The example creates an agent that can:
- Roll dice with different numbers of sides (2-100)
- Check if numbers are prime
- Handle multiple tool calls in sequence
- Maintain conversation history

The agent runs through three predefined test scenarios:
1. Rolling a 20-sided die
2. Rolling a 6-sided die
3. Checking if the number 17 is prime

## Tools

### rollDie(sides: number)
- Rolls a die with the specified number of sides (2-100)
- Returns the rolled number
- Logs the result to console

### checkPrime(nums: number[])
- Checks if a list of numbers are prime
- Returns a formatted string with prime number results
- Handles multiple numbers efficiently

## Example Output

When you run the example, you'll see:
- Agent responses to each test message
- Tool call logs and results
- Session metrics and final state
- Runner performance metrics