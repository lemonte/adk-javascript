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

## 🚀 Quick Start

### 1. Create a new project

```bash
mkdir my-adk-project
cd my-adk-project
npm init -y
```

### 2. Install ADK

Run:
```bash
npm install github:lemonte/adk-javascript
```

Or add to your `package.json`:

```json
{
  "dependencies": {
    "adk-javascript": "github:lemonte/adk-javascript"
  }
}
```

Then run:
```bash
npm install
```

### 3. Set up your API key

Create a `.env` file with:
```bash
export GOOGLE_API_KEY="your-api-key-here"
```

Get your API key from: https://aistudio.google.com/app/apikey

### 4. Create your first agent

Use the import:
```javascript
import * as adk from 'adk-javascript';
```

Check the `examples/` folder for usage examples.

Or create an `index.js`/`index.ts` file and use this code example:

```javascript
import * as adk from 'adk-javascript';

const codeExecutorTool = adk.createTool(
  async (args) => {
    const { code, language = 'python' } = args;
    
    // Simulate code execution (in a real implementation, this would use a secure sandbox)
    console.log(`\n--- Executing ${language} code ---`);
    console.log(code);
    console.log('--- End code ---\n');
    
    // Simple simulation of common Python operations
    try {
      // Basic math operations
      if (code.includes('print(') && /\d+\s*[+\-*/]\s*\d+/.test(code)) {
        const mathMatch = code.match(/(\d+)\s*([+\-*/])\s*(\d+)/);
        if (mathMatch) {
          const [, a, op, b] = mathMatch;
          const num1 = parseInt(a);
          const num2 = parseInt(b);
          let result;
          switch (op) {
            case '+': result = num1 + num2; break;
            case '-': result = num1 - num2; break;
            case '*': result = num1 * num2; break;
            case '/': result = num2 !== 0 ? num1 / num2 : 'Error: Division by zero'; break;
            default: result = 'Unknown operation';
          }
          return {
            success: true,
            output: `${result}`,
            code,
            language,
            message: 'Code executed successfully (simulated)'
          };
        }
      }
      
      // List operations
      if (code.includes('[') && code.includes(']') && code.includes('print(')) {
        return {
          success: true,
          output: '[1, 2, 3, 4, 5]',
          code,
          language,
          message: 'List operation executed successfully (simulated)'
        };
      }
      
      // Default simulation
      return {
        success: true,
        output: 'Code executed successfully\n(This is a simulation - in a real implementation, this would execute in a secure Python environment)',
        code,
        language,
        message: 'Code execution completed (simulated)'
      };
      
    } catch (error) {
      return {
        success: false,
        error: 'Execution failed',
        code,
        language,
        message: 'Code execution failed (simulated error)'
      };
    }
  },
  {
    name: 'execute_code',
    parameters: {
      type: 'object',
      properties: {
        code: {
          type: 'string',
          description: 'Python code to execute'
        },
        language: {
          type: 'string',
          description: 'Programming language (currently only Python is supported)',
          enum: ['python'],
          default: 'python'
        }
      },
      required: ['code']
    }
  }
);

// File operations tool
const fileOperationsTool = adk.createTool(
  async function fileOperations(params) {
    const { operation, path, content } = params;
    
    console.log(`\n--- File Operation: ${operation} on ${path} ---`);
    
    // Simulate file operations
    try {
      switch (operation) {
        case 'read':
          if (path.endsWith('.py')) {
            return {
              success: true,
              content: '# Sample Python file\nprint("Hello, World!")\n',
              path,
              operation,
              message: 'File read successfully (simulated)'
            };
          } else if (path.endsWith('.txt')) {
            return {
              success: true,
              content: 'This is a sample text file content.\nLine 2 of the file.\n',
              path,
              operation,
              message: 'File read successfully (simulated)'
            };
          } else {
            return {
              success: true,
              content: 'Generic file content',
              path,
              operation,
              message: 'File read successfully (simulated)'
            };
          }
          
        case 'write':
          return {
            success: true,
            path,
            content,
            operation,
            message: `File written successfully to ${path} (simulated)`
          };
          
        case 'list':
          return {
            success: true,
            files: ['file1.py', 'file2.txt', 'data.json', 'script.py'],
            path,
            operation,
            message: `Directory listing for ${path} (simulated)`
          };
          
        case 'create_directory':
          return {
            success: true,
            path,
            operation,
            message: `Directory created at ${path} (simulated)`
          };
          
        default:
          return {
            success: false,
            error: `Unknown operation: ${operation}`,
            path,
            operation,
            message: 'Operation failed'
          };
      }
    } catch (error) {
      return {
        success: false,
        error: 'File operation failed',
        path,
        operation,
        message: 'File operation failed (simulated error)'
      };
    }
  },
  {
    name: 'file_operations',
    description: 'Perform file operations like reading, writing, or listing files',
    parameters: {
      type: 'object',
      properties: {
        operation: {
          type: 'string',
          description: 'Type of file operation to perform',
          enum: ['read', 'write', 'list', 'create_directory']
        },
        path: {
          type: 'string',
          description: 'File or directory path'
        },
        content: {
          type: 'string',
          description: 'Content to write (only for write operations)'
        }
      },
      required: ['operation', 'path']
    }
  }
);

export const rootAgent = new adk.Agent({
  model: 'gemini-2.0-flash-exp',
  name: 'Code Execution Assistant',
  description: 'An AI assistant that can execute code safely',
  instruction: `You are a helpful AI assistant that can execute code to help users with programming tasks.

You have access to a simulated code execution environment where you can:
- Run Python code (simulated)
- Perform calculations
- Process data
- Work with files
- Test algorithms

Always explain what you're going to do before executing code, and interpret the results for the user.
If there are errors, help debug and fix them.
Be helpful and educational in your responses.

Note: This is a demonstration environment with simulated code execution.`,
  tools: [codeExecutorTool, fileOperationsTool]
});

async function main() {
  const appName = 'code_execution_app';
  const userId = 'user1';
  const sessionService = new adk.InMemorySessionService();
  
  const runner = new adk.InMemoryRunner(rootAgent, {
    maxIterations: 10,
    enableLogging: true
  });
  
  const session = await sessionService.createSession({
    appName,
    userId,
  });

  async function askAgent(query) {
    console.log(`\n>>> User: ${query}`);
    console.log('--- Agent Response ---');
    
    // Create proper session state with messages array
    const sessionState = {
      messages: [],
      metadata: {
        createdAt: new Date().toISOString(),
        example: 'code-execution'
      }
    };
    
    const context = {
      sessionId: session.id,
      userId,
      appName,
      agentName: 'code-execution-agent',
      requestId: `code-execution-request-${Date.now()}`,
      timestamp: new Date(),
      metadata: {
        source: 'code-execution-example'
      },
      agent: rootAgent,
      session: {
        id: session.id,
        appName,
        userId,
        state: sessionState,
        events: [],
        lastUpdateTime: Date.now()
      },
      invocationId: `code-execution-invocation-${Date.now()}`
    };
    
    const result = await runner.run({
      role: 'user',
      parts: [{ type: 'text', text: query }]
    }, sessionState, context);
    
    // Extract text from response
    const responseText = result.response.parts
      ?.filter(part => part.type === 'text')
      .map(part => part.text)
      .filter(Boolean)
      .join(' ') || 'No response';
    
    console.log(responseText);
    console.log('--- End Response ---\n');
  }

  // Example queries demonstrating code execution capabilities
  await askAgent('Calculate the factorial of 10 using JavaScript');
  
  await askAgent('Create an array of the first 20 Fibonacci numbers and show me the result');
  
  await askAgent('I have this sales data: [{"month": "Jan", "sales": 1000}, {"month": "Feb", "sales": 1500}, {"month": "Mar", "sales": 1200}]. Calculate the total sales and average monthly sales.');
  
  await askAgent('Generate a simple analysis of the sales data from the previous question. Which month had the highest sales?');
  
  await askAgent('Create a function that finds all prime numbers up to 50 and show me the result');
}

if (require.main === module) {
  main().catch(console.error);
}
```

## 📄 License

This project is licensed under the Apache 2.0 License - see the [LICENSE](LICENSE) file for details.
