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

### Install from GitHub (Current Method)

Since the package is not yet available on npm, you can install directly from the GitHub repository:

```bash
npm install git+https://github.com/lemonte/adk-javascript.git
```

Or using `yarn`:

```bash
yarn add git+https://github.com/lemonte/adk-javascript.git
```

### Clone and Build Locally

Alternatively, you can clone the repository and build it locally:

```bash
git clone https://github.com/lemonte/adk-javascript.git
cd adk-javascript
npm install
npm run build
```

Then link it to your project:

```bash
npm link
# In your project directory:
npm link @google/adk
```

### Future npm Release

Once available on npm, you will be able to install using:

```bash
npm install @google/adk
```

The release cadence will be weekly once published to npm.

## 🚀 Quick Start

### 1. Create a new project

```bash
mkdir my-adk-project
cd my-adk-project
npm init -y
```

### 2. Install ADK

```bash
npm install git+https://github.com/lemonte/adk-javascript.git
```

### 3. Set up your API key

```bash
export GOOGLE_API_KEY="your-api-key-here"
```

### 4. Create your first agent

Create a file called `agent.js`:

```javascript
import { Agent, createTool } from '@google/adk';

// Create a simple tool
const greetTool = createTool({
    name: 'greet',
    description: 'Greets a person by name',
    parameters: {
        type: 'object',
        properties: {
            name: { type: 'string', description: 'The name of the person to greet' }
        },
        required: ['name']
    },
    handler: async ({ name }) => {
        return `Hello, ${name}! Nice to meet you.`;
    }
});

// Create the agent
const agent = new Agent({
    name: 'greeting_assistant',
    model: 'gemini-2.0-flash',
    instruction: 'You are a friendly assistant that greets people.',
    tools: [greetTool]
});

export { agent };
```

### 5. Run your agent

Create a file called `run.js`:

```javascript
import { InMemoryRunner } from '@google/adk';
import { agent } from './agent.js';

const runner = new InMemoryRunner();

async function main() {
    const session = await runner.createSession({
        agent,
        sessionId: 'demo-session'
    });

    const response = await session.send('Please greet John');
    console.log('Agent response:', response.content);
}

main().catch(console.error);
```

### 6. Execute

```bash
node run.js
```

## 📚 Documentation

Explore the full documentation for detailed guides on building, evaluating, and
deploying agents:

* **[Documentation](https://google.github.io/adk-docs)**

## 🏁 Feature Highlight

### Define a single agent:

```javascript
import { Agent } from '@google/adk';
import { googleSearch } from '@google/adk/tools';

const rootAgent = new Agent({
    name: "search_assistant",
    model: "gemini-2.0-flash", // Or your preferred Gemini model
    instruction: "You are a helpful assistant. Answer user questions using Google Search when needed.",
    description: "An assistant that can search the web.",
    tools: [googleSearch]
});
```

### Define a multi-agent system:

Define a multi-agent system with coordinator agent, greeter agent, and task execution agent. Then ADK engine and the model will guide the agents works together to accomplish the task.

```javascript
import { LlmAgent } from '@google/adk';

// Define individual agents
const greeter = new LlmAgent({
    name: "greeter", 
    model: "gemini-2.0-flash"
    // ... other options
});

const taskExecutor = new LlmAgent({
    name: "task_executor", 
    model: "gemini-2.0-flash"
    // ... other options
});

// Create parent agent and assign children via subAgents
const coordinator = new LlmAgent({
    name: "Coordinator",
    model: "gemini-2.0-flash",
    description: "I coordinate greetings and tasks.",
    subAgents: [ // Assign subAgents here
        greeter,
        taskExecutor
    ]
});
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
import { evaluate } from '@google/adk/evaluation';
import { rootAgent } from './examples/hello-world/agent.js';

const results = await evaluate({
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

```typescript
import { Agent, createTool, ToolHandler } from '@google/adk';

interface GreetParams {
    name: string;
}

const greetTool = createTool<GreetParams>({
    name: 'greet',
    description: 'Greets a person by name',
    parameters: {
        type: 'object',
        properties: {
            name: { type: 'string', description: 'The name of the person to greet' }
        },
        required: ['name']
    },
    handler: async ({ name }: GreetParams): Promise<string> => {
        return `Hello, ${name}! Nice to meet you.`;
    }
});
```

## 💡 Vibe Coding

If you are developing agents via vibe coding, you can use the project's documentation files as context for LLMs. Check the `examples/` directory for comprehensive code samples and patterns.

## 📄 License

This project is licensed under the Apache 2.0 License - see the [LICENSE](LICENSE) file for details.

---

*Happy Agent Building!*
