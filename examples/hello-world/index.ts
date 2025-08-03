/**
 * Hello World example for the ADK JavaScript SDK
 */

// Load environment variables from .env file
import * as dotenv from 'dotenv';
dotenv.config({ override: true });

import {
  InMemoryRunner,
  logger,
  LogLevel
} from '../../src';

import { rootAgent } from './agent';

// Configure logging
logger.setLevel(LogLevel.INFO);



async function main() {
  try {
    logger.info('Starting Hello World example...');

    // Use the imported agent
    const agent = rootAgent;

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

    // Create initial session state
    const sessionState: any = {
      messages: [],
      metadata: {
        createdAt: new Date().toISOString(),
        example: 'hello-world'
      }
    };

    // Create invocation context
    const context = {
      sessionId: 'hello-world-session',
      userId: 'example-user',
      appName: 'hello-world-app',
      agentName: 'hello-world-agent',
      requestId: 'hello-world-request',
      timestamp: new Date(),
      metadata: {
        source: 'hello-world-example'
      },
      agent: agent,
      session: {
        id: 'hello-world-session',
        appName: 'hello-world-app',
        userId: 'example-user',
        state: sessionState,
        events: [],
        lastUpdateTime: Date.now()
      },
      invocationId: 'hello-world-invocation'
    };

    // Test messages
    const testMessages = [
      {
        role: 'user' as const,
        parts: [{
          type: 'text' as const,
          text: 'Hello! Can you roll a 20-sided die for me?'
        }]
      },
      {
        role: 'user' as const,
        parts: [{
          type: 'text' as const,
          text: 'Now roll a regular 6-sided die and tell me about the result!'
        }]
      },
      {
        role: 'user' as const,
        parts: [{
          type: 'text' as const,
          text: 'Is the number 17 prime?'
        }]
      }
    ];

    // Run each test message
    let currentSessionState = sessionState;
    
    for (let i = 0; i < testMessages.length; i++) {
      const message = testMessages[i];
      
      logger.info(`\n--- Test ${i + 1} ---`);
      logger.info(`User: ${message.parts[0].text}`);
      
      try {
        const result = await runner.run(message, currentSessionState, context);
        
        // Extract the response text
        const responseText = result.response.parts
          .filter(part => part.type === 'text')
          .map(part => (part as any).text)
          .join(' ');
        
        logger.info(`Agent: ${responseText}`);
        logger.info(`Metrics: ${JSON.stringify(result.metrics, null, 2)}`);
        
        // Update session state for next iteration
        currentSessionState = result.sessionState;
        
      } catch (error) {
        logger.error(`Error in test ${i + 1}:`, error);
      }
      
      // Wait a bit between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    logger.info('\n--- Example completed successfully! ---');
    
    // Show final session state
    logger.info(`Final session has ${currentSessionState.messages.length} messages`);
    logger.info(`Runner metrics: ${JSON.stringify(runner.getMetrics(), null, 2)}`);
    
  } catch (error) {
    logger.error('Example failed:', error);
    process.exit(1);
  }
}

// Run the example
if (require.main === module) {
  main().catch(error => {
    logger.error('Unhandled error:', error);
    process.exit(1);
  });
}

export { main };