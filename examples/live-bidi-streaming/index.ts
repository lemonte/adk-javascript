import { InMemoryRunner, logger, LogLevel } from '../../src';
import * as readline from 'readline';
import * as dotenv from 'dotenv';
dotenv.config({ override: true });

import { streamingAgent } from './agent';

// Configure logger
logger.setLevel(LogLevel.INFO);

// Use the agent from the separate file
const agent = streamingAgent;

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function runInteractiveMode() {
  console.log('🚀 Live Bidirectional Streaming Example (Simulated)');
  console.log('===================================================');
  console.log('');
  console.log('This example demonstrates interactive capabilities with simulated streaming.');
  console.log('In a real streaming implementation, you would see live updates as tools execute.');
  console.log('');
  console.log('Try these commands:');
  console.log('  • "roll 3 dice with 20 sides each"');
  console.log('  • "check if 97 is prime"');
  console.log('  • "roll a die and check if the result is prime"');
  console.log('  • "roll 5 dice"');
  console.log('');
  console.log('Type "exit" to quit.');
  console.log('');
  
  // Create a runner
  const runner = new InMemoryRunner(agent, {
    maxIterations: 5,
    enableLogging: true
  });
  
  // Set up event listeners
  runner.on('run_start', (event) => {
    logger.info('Run started', event.data);
  });
  
  runner.on('tool_call', (event) => {
    logger.info('Tool called', event.data);
  });
  
  runner.on('run_complete', (event) => {
    logger.info('Run completed', event.data);
  });
  
  while (true) {
    let userInput: string;
    
    try {
      userInput = await new Promise<string>((resolve, reject) => {
        rl.question('You: ', resolve);
        rl.on('close', () => reject(new Error('readline closed')));
      });
    } catch (error) {
      // Handle readline being closed (e.g., when using pipes)
      console.log('\n👋 Goodbye!');
      break;
    }
    
    if (userInput.toLowerCase() === 'exit') {
      console.log('\n👋 Goodbye!');
      break;
    }
    
    if (userInput.trim() === '') {
      continue;
    }
    
    try {
      console.log('\n🎬 Processing your request...');
      
      // Create session state
      const sessionState = {
        messages: [],
        metadata: {
          createdAt: new Date().toISOString(),
          example: 'live-bidi-streaming'
        }
      };
      
      // Create context
      const context = {
        sessionId: 'streaming-session',
        userId: 'example-user',
        appName: 'streaming-app',
        agentName: 'streaming_agent',
        invocationId: `streaming-invocation-${Date.now()}`,
        timestamp: new Date(),
        requestId: `req-${Date.now()}`,
        agent: agent,
        session: {
          id: 'streaming-session',
          appName: 'streaming-app',
          userId: 'example-user',
          state: sessionState,
          events: [],
          lastUpdateTime: Date.now()
        },
        metadata: {}
      };
      
      // Create message
      const message = {
        role: 'user' as const,
        parts: [{
          type: 'text' as const,
          text: userInput
        }]
      };
      
      const result = await runner.run(message, sessionState, context);
      
      // Extract the response text
      const responseText = result.response.parts
        .filter(part => part.type === 'text')
        .map(part => (part as any).text)
        .join('');
      
      console.log('\n🎯 Agent:', responseText);
      
    } catch (error) {
      console.error('\n❌ Error:', (error as Error).message);
    }
    
    console.log('');
  }
  
  rl.close();
}

async function main() {
  try {
    console.log('🚀 Starting Live Bidirectional Streaming Agent (Simulated)...');
    console.log('\n✅ Agent is ready!');
    await runInteractiveMode();
    
  } catch (error) {
    console.error('❌ Failed to start streaming agent:', (error as Error).message);
    process.exit(1);
  }
}

// Demonstrate advanced streaming features
export async function demonstrateAdvancedStreaming() {
  console.log('\n🔬 Demonstrating advanced streaming features...');
  console.log('This would demonstrate concurrent streaming in a real implementation.');
}

// Performance monitoring
export function setupPerformanceMonitoring() {
  console.log('📊 Performance monitoring would be set up here in a real implementation.');
  return {
    messagesProcessed: 0,
    averageLatency: 0,
    errorCount: 0,
    startTime: Date.now()
  };
}

if (require.main === module) {
  // Set up performance monitoring
  setupPerformanceMonitoring();
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down...');
    process.exit(0);
  });
  
  main();
}

export { streamingAgent };