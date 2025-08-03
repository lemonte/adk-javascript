import { InMemoryRunner, logger, LogLevel } from '../../src';
import * as readline from 'readline';
import * as dotenv from 'dotenv';
dotenv.config({ override: true });

import { mcpAgent } from './agent';

// Configure logger
logger.setLevel(LogLevel.INFO);

/**
 * MCP (Model Context Protocol) Integration Example
 * 
 * This example demonstrates how to integrate external tools and services
 * using the Model Context Protocol, enabling the agent to interact with
 * various external systems and APIs.
 */

// Use the agent from the separate file
const agent = mcpAgent;

// Interactive CLI
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function runInteractiveMode() {
  console.log('🚀 ADK MCP Integration Example (Simulated)');
  console.log('==========================================');
  console.log('');
  console.log('This example demonstrates Model Context Protocol (MCP) integration with simulated tools.');
  console.log('The agent can use external tools and services through simulated MCP tools.');
  console.log('');
  console.log('Available simulated MCP tools:');
  console.log('  • read_file: Read contents of files from the local filesystem (simulated)');
  console.log('  • http_request: Make HTTP requests to external APIs (simulated with mock data)');
  console.log('  • database_query: Execute SQL queries on databases (simulated with mock data)');
  console.log('  • system_command: Execute safe system commands (simulated with mock outputs)');
  console.log('');
  console.log('Example commands:');
  console.log('  • "Read the package.json file"');
  console.log('  • "Make a GET request to https://api.github.com/users/octocat"');
  console.log('  • "Query the users table in the database"');
  console.log('  • "List files in the current directory"');
  console.log('');
  console.log('Type "exit" to quit.');
  console.log('');
  
  // Create runner with event handlers
  const runner = new InMemoryRunner(agent);
  
  let sessionState = {};
  
  runner.on('run_start', (data) => {
    console.log('\n🤖 Agent: Processing your request...');
  });
  
  runner.on('tool_call', (data) => {
    console.log(`\n🔧 Using tool: ${data.toolName}`);
  });
  
  runner.on('run_complete', (data) => {
    console.log(`\n✅ Run completed in ${data.totalDuration}ms`);
  });
  
  // Handle readline close event for pipe support
  rl.on('close', () => {
    console.log('\n👋 Goodbye!');
    process.exit(0);
  });
  
  while (true) {
    const userInput = await new Promise<string>((resolve) => {
      rl.question('You: ', resolve);
    });
    
    if (userInput.toLowerCase() === 'exit') {
      console.log('\n👋 Goodbye!');
      break;
    }
    
    if (userInput.trim() === '') {
      continue;
    }
    
    try {
      const message = { role: 'user' as const, parts: [{ type: 'text' as const, text: userInput }] };
      const context = {
        sessionId: 'mcp-session',
        userId: 'user-123',
        appName: 'MCP Integration Example',
        agentName: 'MCP Demo Agent',
        invocationId: `inv-${Date.now()}`,
        timestamp: new Date(),
        metadata: {},
        requestId: `req-${Date.now()}`,
        agent: {
          id: 'mcp-agent',
          name: 'MCP Demo Agent',
          version: '1.0.0'
        },
        session: {
           id: 'mcp-examples-session',
           appName: 'MCP Integration Example',
           userId: 'user-123',
           state: {},
           events: [],
           lastUpdateTime: Date.now()
         }
      };
      
      const result = await runner.run(message, sessionState, context);
      
      // Extract text from agent response
      const agentText = result.response?.parts?.find(part => part.type === 'text')?.text || 'No response';
      console.log('\n🤖 Agent:', agentText);
      
      // Tool usage is logged automatically by the runner
      
    } catch (error) {
      console.error('\n❌ Error:', (error as Error).message);
    }
    
    console.log('');
  }
  
  rl.close();
}

// Example usage function
async function runExamples() {
  console.log('🧪 Running MCP Integration Examples (Simulated)...');
  console.log('');
  
  const runner = new InMemoryRunner(agent);
  let sessionState = {};
  
  const examples = [
    {
      name: 'File System Access',
      message: 'Read the package.json file and tell me about this project'
    },
    {
      name: 'HTTP API Request',
      message: 'Make a GET request to https://api.github.com/users/octocat and show me the user information'
    },
    {
      name: 'Database Query',
      message: 'Query the users table to get all user information'
    },
    {
      name: 'System Command',
      message: 'List the files in the current directory using a system command'
    }
  ];
  
  for (const example of examples) {
    console.log(`\n📋 Example: ${example.name}`);
    console.log(`💬 Message: "${example.message}"`);
    console.log('');
    
    try {
      const message = { role: 'user' as const, parts: [{ type: 'text' as const, text: example.message }] };
      const context = {
        sessionId: 'mcp-examples-session',
        userId: 'user-123',
        appName: 'MCP Integration Example',
        agentName: 'MCP Demo Agent',
        invocationId: `inv-${Date.now()}`,
        timestamp: new Date(),
        metadata: {},
        requestId: `req-${Date.now()}`,
        agent: {
          id: 'mcp-agent',
          name: 'MCP Demo Agent',
          version: '1.0.0'
        },
        session: {
          id: 'mcp-examples-session',
          appName: 'MCP Integration Example',
          userId: 'user-123',
          state: {},
          events: [],
          lastUpdateTime: Date.now()
        }
      };
      
      const result = await runner.run(message, sessionState, context);
      
      // Extract text from agent response
      const agentText = result.response?.parts?.find(part => part.type === 'text')?.text || 'No response';
      console.log('🤖 Response:', agentText);
      
      // Tool usage is logged automatically by the runner
      
    } catch (error) {
      console.error('❌ Error:', (error as Error).message);
    }
    
    console.log('\n' + '='.repeat(50));
  }
}

// Main execution
async function main() {
  try {
    // Check for required environment variables
    if (!process.env.GOOGLE_API_KEY) {
    console.error('❌ Error: Please set GOOGLE_API_KEY in your .env file');
      process.exit(1);
    }
    
    const args = process.argv.slice(2);
    
    if (args.includes('--examples')) {
      await runExamples();
    } else {
      await runInteractiveMode();
    }
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n👋 Shutting down gracefully...');
  rl.close();
  process.exit(0);
});

if (require.main === module) {
  main();
}

export { agent };