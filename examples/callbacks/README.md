# Callbacks Agent Example

This example demonstrates how to use callbacks to monitor and intercept various stages of agent execution in the ADK JavaScript framework.

## Features

- **Lifecycle Callbacks**: Monitor agent execution at different stages
- **Before/After Agent Callbacks**: Track when agent processing starts and ends
- **Before/After Model Callbacks**: Monitor model API calls and responses
- **Multiple Callback Registration**: Support for multiple callbacks on the same event
- **Tool Integration**: Combines callbacks with dice rolling and prime number checking tools

## Callback Types

This example demonstrates several types of callbacks:

1. **beforeAgentCallback**: Called before the agent starts processing a request
2. **afterAgentCallback**: Called after the agent completes processing
3. **beforeModelCallback**: Called before making a request to the language model
4. **afterModelCallback**: Called after receiving a response from the language model
5. **afterAgentCb1** & **afterAgentCb2**: Additional callbacks for custom processing

## Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment variables**:
   Copy `.env.example` to `.env` and fill in your API key:
   ```bash
   cp .env.example .env
   ```

   Required variables:
   - `GOOGLE_API_KEY`: Your Google AI API key for Gemini

## Usage

Run the example:
```bash
npm start
```

The agent will demonstrate:
- Callback execution at various stages
- Rolling dice with different numbers of sides
- Checking if numbers are prime
- Logging callback events with emoji indicators

## Callback Indicators

Watch for these emoji indicators in the console output:
- 📥 `@before_agent_callback` - Agent is about to process a request
- 📤 `@after_agent_callback` - Agent finished processing request
- 🤖 `@before_model_callback` - About to call the model
- ✅ `@after_model_callback` - Model response received
- 🔄 `@after_agent_cb1` & `@after_agent_cb2` - Additional callbacks
- 🎲 Tool execution (dice rolling)
- 🔢 Tool execution (prime checking)

## Example Interactions

- "Hi! What can you help me with?"
- "Roll a 6-sided die"
- "Check if the number you just rolled is prime"
- "Roll a 20-sided die and check if it's prime"

## Implementation Notes

- **Simulated Callbacks**: This example simulates callback functionality for demonstration purposes
- **Real Integration**: In a production implementation, callbacks would be integrated directly into the ADK framework
- **Event Monitoring**: Callbacks provide visibility into the agent's execution lifecycle
- **Custom Processing**: Callbacks can be used to modify requests/responses or add custom logic

## Use Cases

Callbacks are useful for:
- **Logging and Monitoring**: Track agent performance and behavior
- **Request/Response Modification**: Transform data before/after model calls
- **Error Handling**: Implement custom error handling logic
- **Analytics**: Collect metrics on agent usage
- **Debugging**: Inspect the agent's execution flow

## Note

This example demonstrates the callback pattern and structure. The actual callback integration depends on the specific ADK JavaScript API implementation. The callbacks shown here illustrate how such functionality would work in practice.