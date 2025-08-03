# Live Bidirectional Streaming Example

This example demonstrates interactive capabilities with simulated streaming features, showing how agents can use tools and provide responses in an interactive chat environment.

## What This Example Shows

This example simulates bidirectional streaming concepts:

- **Interactive Chat**: Real-time conversation with the agent
- **Tool Integration**: Agent uses dice rolling and prime checking tools
- **Event Handling**: Demonstrates event-driven architecture
- **Session Management**: Maintains conversation state
- **Simulated Streaming**: Shows the foundation for real streaming implementations

## Features

- Interactive chat interface
- Tool execution with dice rolling and prime checking
- Event-driven runner with logging
- Session state management
- Error handling and recovery
- Graceful shutdown handling

## Files

- `agent.ts` - Defines the streaming agent with dice and prime tools
- `index.ts` - Main interactive runner with chat interface
- `package.json` - Project configuration
- `.env.example` - Environment variables template

## Setup

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your Google API key:
   ```
   GOOGLE_API_KEY=your_google_api_key
   ```

3. Run the example:
   ```bash
   npm start
   ```

## Usage

The example provides an interactive chat interface where you can:

1. **Roll Dice**: Ask the agent to roll dice with different configurations
2. **Check Prime Numbers**: Test if numbers are prime
3. **Combine Operations**: Use multiple tools in sequence

### Example Interactions

**Dice Rolling:**
```
You: roll 3 dice with 20 sides each
Agent: 🎲 Rolled 3 20-sided dice: 15, 8, 12 (Total: 35, Average: 11.67)
```

**Prime Checking:**
```
You: check if 97 is prime
Agent: ✅ 97 is a prime number! It's only divisible by 1 and itself.
```

**Combined Operations:**
```
You: roll a die and check if the result is prime
Agent: 🎲 Rolled 1 6-sided die: 5
       ✅ 5 is a prime number!
```

### Available Commands

- Type any natural language request involving dice or prime numbers
- Type `exit` to quit the application
- The agent will automatically use the appropriate tools based on your request

## Available Tools

### roll_die
- **Purpose**: Roll dice with configurable sides and count
- **Parameters**: 
  - `sides` (optional): Number of sides (2-100, default: 6)
  - `count` (optional): Number of dice (1-10, default: 1)
- **Example**: "roll 3 dice with 20 sides each"

### check_prime
- **Purpose**: Check if a number is prime
- **Parameters**:
  - `number` (required): The number to check (minimum: 1)
- **Example**: "check if 97 is prime"

## Implementation Details

### Agent Configuration

```typescript
export const streamingAgent = new Agent({
  model: 'gemini-2.0-flash-exp',
  tools: [rollDieTool, checkPrimeTool],
  name: 'Streaming Demo Agent',
  description: 'An agent that demonstrates interactive capabilities (simulated streaming)',
  instruction: `You are a helpful assistant that can:
    1. Roll Dice: Use the roll_die tool to roll dice with different numbers of sides
    2. Check Prime Numbers: Use the check_prime tool to determine if numbers are prime`
});
```

### Event Handling

```typescript
// Set up event listeners for the runner
runner.on('run_start', (event) => {
  logger.info('Run started', event.data);
});

runner.on('tool_call', (event) => {
  logger.info('Tool called', event.data);
});

runner.on('run_complete', (event) => {
  logger.info('Run completed', event.data);
});
```

## What This Example Demonstrates

This example serves as a foundation for understanding how to build interactive agents that could support streaming in the future. It shows:

1. **Event-Driven Architecture**: How to set up event listeners for different stages of agent execution
2. **Tool Integration**: How agents can use multiple tools to accomplish tasks
3. **Session Management**: How to maintain conversation state across interactions
4. **Error Handling**: Proper error handling in interactive applications
5. **User Experience**: Creating a smooth chat interface

## Extending This Example

You can extend this example by:

1. **Adding More Tools**: Create additional tools for different functionalities
2. **Implementing Real Streaming**: Add actual streaming capabilities using WebSockets or Server-Sent Events
3. **Enhanced UI**: Build a web interface instead of command-line
4. **Persistence**: Add database storage for conversation history
5. **Authentication**: Add user authentication and authorization

## Real-World Applications

This pattern can be used for:

- **Interactive Chatbots**: Customer service or support bots
- **Gaming Applications**: Dice rolling and probability calculations
- **Educational Tools**: Math tutoring with prime number exercises
- **Data Analysis**: Interactive data exploration tools
- **Development Tools**: Interactive code generation and testing

## Troubleshooting

### Common Issues

1. **Missing API Key**
   - Ensure `GOOGLE_API_KEY` is set in your `.env` file
   - Verify the API key is valid and has proper permissions

2. **Tool Execution Errors**
   - Check that tool parameters are within valid ranges
   - Ensure network connectivity for API calls

3. **Interactive Mode Issues**
   - Try typing `exit` to quit properly
   - Check terminal compatibility for readline interface

4. **Performance Issues**
   - Monitor API rate limits
   - Check system resources for large operations

## Note on Streaming

This example demonstrates the foundation for streaming implementations. In a production streaming system, you would:

- Implement WebSocket or Server-Sent Events for real-time communication
- Add token-level streaming for immediate response feedback
- Include progress tracking for long-running operations
- Provide concurrent stream handling
- Add comprehensive error recovery mechanisms

The current implementation focuses on the core concepts and can be extended with actual streaming capabilities as needed.