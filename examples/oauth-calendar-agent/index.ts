/**
 * OAuth Calendar Agent example for the ADK JavaScript SDK
 * Demonstrates calendar management capabilities with simulated OAuth authentication
 */

// Load environment variables from .env file
import * as dotenv from 'dotenv';
dotenv.config({ override: true });

import {
  InMemoryRunner,
  logger,
  LogLevel
} from '../../src';

import { oauthCalendarAgent } from './agent';
import * as readline from 'readline';

// Configure logging
logger.setLevel(LogLevel.INFO);







// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function startInteractiveMode(runner: InMemoryRunner, sessionState: any, agent: any) {
  console.log('💬 Interactive mode started. Type "exit" to quit.');
  console.log('\nExample commands:');
  console.log('  - "List my events for today"');
  console.log('  - "Create a meeting with John tomorrow at 2 PM"');
  console.log('  - "Update event-123 to start at 3 PM"');
  console.log('  - "Delete the team meeting"\n');

  while (true) {
    try {
      const userInput = await new Promise<string>((resolve) => {
        rl.question('👤 You: ', resolve);
      });

      if (userInput.toLowerCase().trim() === 'exit') {
        console.log('\n👋 Goodbye!');
        break;
      }

      if (!userInput.trim()) {
        continue;
      }

      console.log('🤖 Assistant: Processing...');

      const context = {
        sessionId: 'calendar-session',
        userId: 'example-user',
        appName: 'oauth-calendar-app',
        agentName: 'oauth-calendar-agent',
        requestId: `calendar-request-${Date.now()}`,
        timestamp: new Date(),
        metadata: {
          source: 'oauth-calendar-example'
        },
        agent: agent,
        session: {
          id: 'calendar-session',
          appName: 'oauth-calendar-app',
          userId: 'example-user',
          state: sessionState,
          events: [],
          lastUpdateTime: Date.now()
        },
        invocationId: `calendar-invocation-${Date.now()}`
      };

      const messageObj = {
         role: 'user' as const,
         parts: [{
           type: 'text' as const,
           text: userInput
         }]
       };

       const result = await runner.run(messageObj, sessionState, context);
       
       if (result && result.response && result.response.parts) {
         const responseText = result.response.parts
           .filter(part => part.type === 'text')
           .map(part => (part as any).text)
           .join(' ');
         console.log(`🤖 Assistant: ${responseText}`);
       } else {
         console.log('🤖 Assistant: Operation completed successfully.');
       }

    } catch (error) {
      console.error('❌ Error:', (error as Error).message);
    }
  }

  rl.close();
}

async function main() {
  try {
    logger.info('Starting OAuth Calendar Agent example...');

    // Use the imported agent
    const agent = oauthCalendarAgent;

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
        example: 'oauth-calendar-agent'
      }
    };

    // Test messages to demonstrate calendar functionality
    const testMessages = [
      'List my calendar events',
      'Create a team meeting tomorrow at 2 PM for 1 hour',
      'Show me events for this week'
    ];

    console.log('\n🗓️  OAuth Calendar Agent Demo');
    console.log('================================\n');

    // Process test messages
    for (const message of testMessages) {
      console.log(`\n👤 User: ${message}`);
      console.log('🤖 Assistant: Processing...');

      try {
        const context = {
          sessionId: 'calendar-session',
          userId: 'example-user',
          appName: 'oauth-calendar-app',
          agentName: 'oauth-calendar-agent',
          requestId: `calendar-request-${Date.now()}`,
          timestamp: new Date(),
          metadata: {
            source: 'oauth-calendar-example'
          },
          agent: agent,
          session: {
            id: 'calendar-session',
            appName: 'oauth-calendar-app',
            userId: 'example-user',
            state: sessionState,
            events: [],
            lastUpdateTime: Date.now()
          },
          invocationId: `calendar-invocation-${Date.now()}`
        };

        const messageObj = {
           role: 'user' as const,
           parts: [{
             type: 'text' as const,
             text: message
           }]
         };

         const result = await runner.run(messageObj, sessionState, context);
         
         if (result && result.response && result.response.parts) {
           const responseText = result.response.parts
             .filter(part => part.type === 'text')
             .map(part => (part as any).text)
             .join(' ');
           console.log(`🤖 Assistant: ${responseText}`);
         } else {
           console.log('🤖 Assistant: Operation completed successfully.');
         }
      } catch (error) {
        console.error('❌ Error processing message:', (error as Error).message);
      }

      // Add a small delay between messages
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('\n✅ Demo completed! Starting interactive mode...\n');
    
    // Start interactive mode
    await startInteractiveMode(runner, sessionState, agent);

  } catch (error) {
    console.error('❌ Error in main:', (error as Error).message);
    process.exit(1);
  }
}

// Example calendar operations
export async function demonstrateCalendarOperations() {
  console.log('\n🗓️  Calendar Agent Demo');
  console.log('========================');
  
  try {
    console.log('\n📅 Calendar tools available:');
    console.log('- list_events: List calendar events');
    console.log('- create_event: Create new events');
    console.log('- update_event: Update existing events');
    console.log('- delete_event: Delete events');
    
    console.log('\n✅ Calendar agent is ready to use!');
    console.log('💡 You can interact with it using the interactive mode.');
    
  } catch (error) {
    console.error('❌ Error during calendar operations:', (error as Error).message);
  }
}

if (require.main === module) {
  main();
}

export { oauthCalendarAgent as calendarAgent };