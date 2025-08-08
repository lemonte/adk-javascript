# Agent Development Kit (ADK)

[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)
[![Python Unit Tests](https://github.com/google/adk-python/actions/workflows/python-unit-tests.yml/badge.svg)](https://github.com/google/adk-python/actions/workflows/python-unit-tests.yml)
[![r/agentdevelopmentkit](https://img.shields.io/badge/Reddit-r%2Fagentdevelopmentkit-FF4500?style=flat&logo=reddit&logoColor=white)](https://www.reddit.com/r/agentdevelopmentkit/)
[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/google/adk-python)

<html>
    <h2 align="center">
      <img src="https://raw.githubusercontent.com/google/adk-python/main/assets/agent-development-kit.png" width="256"/>
    </h2>
    <h3 align="center">
      An open-source, code-first JavaScript/TypeScript toolkit for building, evaluating, and deploying sophisticated AI agents with flexibility and control.
    </h3>
    <h3 align="center">
      Important Links:
      <a href="https://google.github.io/adk-docs/">Docs</a>, 
      <a href="https://github.com/google/adk-samples">Samples</a>,
      <a href="https://github.com/google/adk-java">Java ADK</a> &
      <a href="https://github.com/google/adk-web">ADK Web</a>.
    </h3>
</html>

Agent Development Kit (ADK) is a flexible and modular framework for developing and deploying AI agents. While optimized for Gemini and the Google ecosystem, ADK is model-agnostic, deployment-agnostic, and is built for compatibility with other frameworks. ADK was designed to make agent development feel more like software development, to make it easier for developers to create, deploy, and orchestrate agentic architectures that range from simple tasks to complex workflows.


---

## ✨ Key Features

- **Rich Tool Ecosystem**: Utilize pre-built tools, custom functions,
  OpenAPI specs, or integrate existing tools to give agents diverse
  capabilities, all for tight integration with the Google ecosystem.

- **Code-First Development**: Define agent logic, tools, and orchestration
  directly in JavaScript/TypeScript for ultimate flexibility, testability, and versioning.

- **Modular Multi-Agent Systems**: Design scalable applications by composing
  multiple specialized agents into flexible hierarchies.

- **Deploy Anywhere**: Easily containerize and deploy agents on Cloud Run or
  scale seamlessly with Vertex AI Agent Engine.

## 🤖 Agent2Agent (A2A) Protocol and ADK Integration

For remote agent-to-agent communication, ADK integrates with the
[A2A protocol](https://github.com/google-a2a/A2A/).
See this [example](https://github.com/a2aproject/a2a-samples/tree/main/samples/python/agents)
for how they can work together.

## 🚀 Installation

### Prerequisites

Make sure you have Node.js (version 18 or higher) installed on your system.

### Install from GitHub

To use the adk-javascript package, add it to your project's dependencies in `package.json`:

```json
{
  "dependencies": {
    "adk-javascript": "github:lemonte/adk-javascript"
  }
}
```

Then install the dependencies:

```bash
npm install
```

Or install directly using npm:

```bash
npm install github:lemonte/adk-javascript
```

Or using `yarn`:

```bash
yarn add github:lemonte/adk-javascript
```

## 🚀 Quick Start

### 1. Create a new project

```bash
mkdir my-adk-project
cd my-adk-project
npm init -y
```

### 2. Install ADK

Add to your `package.json`:

```json
{
  "dependencies": {
    "adk-javascript": "github:lemonte/adk-javascript"
  }
}
```

Then install:

```bash
npm install
```

### 3. Set up your API key

```bash
export GOOGLE_API_KEY="your-api-key-here"
```

### 4. Create your first agent

Create a file called `agent.js`:

```javascript
import * as adk from 'adk-javascript';

// Create roll die tool with state tracking
const rollDieTool = adk.createTool(
  function rollDie(sides) {
    const result = Math.floor(Math.random() * sides) + 1;
    console.log(`🎲 Rolled a ${sides}-sided die: ${result}`);
    return result;
  },
  {
    name: 'roll_die',
    description: 'Roll a die and return the rolled result',
    parameters: {
      type: 'object',
      properties: {
        sides: {
          type: 'integer',
          description: 'The integer number of sides the die has',
          minimum: 2,
          maximum: 100
        }
      },
      required: ['sides']
    }
  }
);

// Create a simple greeting tool
const greetTool = adk.createTool(
  function greet(name) {
    return `Hello, ${name}! Nice to meet you.`;
  },
  {
    name: 'greet',
    description: 'Greets a person by name',
    parameters: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'The name of the person to greet' }
      },
      required: ['name']
    }
  }
);

// Create the agent
const agent = new adk.Agent({
    name: 'dice_assistant',
    model: 'gemini-2.0-flash',
    instruction: 'You are a helpful assistant that can greet people and roll dice for games.',
    tools: [greetTool, rollDieTool]
});

export { agent };
```

### 5. Run your agent

Create a file called `run.js`:

```javascript
import * as adk from 'adk-javascript';
import { agent } from './agent.js';

const runner = new adk.InMemoryRunner();

async function main() {
    const session = await runner.createSession({
        agent,
        sessionId: 'demo-session'
    });

    // Test greeting
    let response = await session.send('Please greet John');
    console.log('Agent response:', response.content);
    
    // Test dice rolling
    response = await session.send('Roll a 6-sided die for me');
    console.log('Agent response:', response.content);
    
    // Test dice rolling with different sides
    response = await session.send('Roll a 20-sided die');
    console.log('Agent response:', response.content);
}

main().catch(console.error);
```

### 6. Execute

**For JavaScript (.js files):**
```bash
node run.js
```

**For TypeScript (.ts files):**

First, install TypeScript and ts-node:
```bash
npm install -D typescript ts-node @types/node
```

Then run directly:
```bash
npx ts-node run.ts
```

Or compile and run:
```bash
npx tsc run.ts
node run.js
```

## 🏃‍♂️ Running Examples

The project includes several examples in the `examples/` directory. Here's how to run them:

### JavaScript Examples

```bash
# Navigate to an example directory
cd examples/hello-world

# Run the JavaScript version
node agent.js
```

### TypeScript Examples

```bash
# Navigate to an example directory
cd examples/hello-world

# Install TypeScript dependencies (if not already installed)
npm install -D typescript ts-node @types/node

# Run the TypeScript version directly
npx ts-node agent.ts

# Or compile first, then run
npx tsc agent.ts
node agent.js
```

### Available Examples

- `hello-world/` - Basic agent setup
- `dice-game/` - Dice rolling and prime number checking (demonstrates new import syntax)
- `google-search/` - Agent with Google Search integration
- `weather-time/` - Weather and time tools
- `memory/` - Agent with memory capabilities
- `workflow-agent/` - Multi-step workflow example
- `rag-agent/` - Retrieval-Augmented Generation
- `callbacks/` - Callback functionality demonstration
- And many more...

## 📚 Documentation

Explore the full documentation for detailed guides on building, evaluating, and
deploying agents:

* **[Documentation](https://google.github.io/adk-docs)**

## 🏁 Feature Highlight

### Define a single agent:

```javascript
import * as adk from 'adk-javascript';

const rootAgent = new adk.Agent({
    name: "search_assistant",
    model: "gemini-2.0-flash", // Or your preferred Gemini model
    instruction: "You are a helpful assistant. Answer user questions using Google Search when needed.",
    description: "An assistant that can search the web.",
    tools: [adk.tools.googleSearch]
});
```

### Define a multi-agent system:

Define a multi-agent system with coordinator agent, greeter agent, and task execution agent. Then ADK engine and the model will guide the agents works together to accomplish the task.

```javascript
import * as adk from 'adk-javascript';

// Define individual agents
const greeter = new adk.LlmAgent({
    name: "greeter", 
    model: "gemini-2.0-flash"
    // ... other options
});

const taskExecutor = new adk.LlmAgent({
    name: "task_executor", 
    model: "gemini-2.0-flash"
    // ... other options
});

// Create parent agent and assign children via subAgents
const coordinator = new adk.LlmAgent({
    name: "Coordinator",
    model: "gemini-2.0-flash",
    description: "I coordinate greetings and tasks.",
    subAgents: [ // Assign subAgents here
        greeter,
        taskExecutor
    ]
});
```
```

### Development UI

A built-in development UI to help you test, evaluate, debug, and showcase your agent(s).

<img src="https://raw.githubusercontent.com/google/adk-python/main/assets/adk-web-dev-ui-function-call.png"/>

### Evaluate Agents

```bash
npx adk eval \
    examples/hello-world \
    examples/hello-world/hello_world_eval_set_001.evalset.json
```

Or using the programmatic API:

```javascript
import * as adk from 'adk-javascript';
import { rootAgent } from './examples/hello-world/agent.js';

const results = await adk.evaluate({
    agent: rootAgent,
    evalSet: './examples/hello-world/hello_world_eval_set_001.evalset.json'
});

console.log('Evaluation results:', results);
```

## 🤝 Contributing

We welcome contributions from the community! Whether it's bug reports, feature requests, documentation improvements, or code contributions, please see our
- [General contribution guideline and flow](https://google.github.io/adk-docs/contributing-guide/).
- Then if you want to contribute code, please read [Code Contributing Guidelines](./CONTRIBUTING.md) to get started.

## 🔧 TypeScript Support

ADK JavaScript fully supports TypeScript out of the box. Simply use `.ts` files instead of `.js`:

### TypeScript Configuration

Create a `tsconfig.json` file in your project:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

### TypeScript Example

```typescript
import * as adk from 'adk-javascript';

interface GreetParams {
    name: string;
}

interface RollDieParams {
    sides: number;
}

const greetTool = adk.createTool<GreetParams>(
    function greet({ name }: GreetParams): string {
        return `Hello, ${name}! Nice to meet you.`;
    },
    {
        name: 'greet',
        description: 'Greets a person by name',
        parameters: {
            type: 'object',
            properties: {
                name: { type: 'string', description: 'The name of the person to greet' }
            },
            required: ['name']
        }
    }
);

const rollDieTool = adk.createTool<RollDieParams>(
    function rollDie({ sides }: RollDieParams): number {
        const result = Math.floor(Math.random() * sides) + 1;
        console.log(`🎲 Rolled a ${sides}-sided die: ${result}`);
        return result;
    },
    {
        name: 'roll_die',
        description: 'Roll a die and return the rolled result',
        parameters: {
            type: 'object',
            properties: {
                sides: {
                    type: 'integer',
                    description: 'The integer number of sides the die has',
                    minimum: 2,
                    maximum: 100
                }
            },
            required: ['sides']
        }
    }
);

const agent = new adk.Agent({
    name: 'typescript_agent',
    model: 'gemini-2.0-flash',
    instruction: 'You are a helpful assistant that can greet people and roll dice.',
    tools: [greetTool, rollDieTool]
});
```

### Running TypeScript Files

```bash
# Install TypeScript dependencies
npm install -D typescript ts-node @types/node

# Run directly with ts-node
npx ts-node your-agent.ts

# Or compile and run
npx tsc your-agent.ts
node your-agent.js
```

## 💡 Vibe Coding

If you are developing agents via vibe coding, you can use the project's documentation files as context for LLMs. Check the `examples/` directory for comprehensive code samples and patterns.

## 📄 License

This project is licensed under the Apache 2.0 License - see the [LICENSE](LICENSE) file for details.

---

*Happy Agent Building!*
