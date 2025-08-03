/**
 * RAG Agent Example
 * 
 * This example demonstrates Retrieval-Augmented Generation using Vertex AI RAG.
 * The agent can search through a knowledge base and provide accurate answers
 * based on retrieved documents.
 */

import * as readline from 'readline';
import * as dotenv from 'dotenv';
dotenv.config({ override: true });

import {
  InMemoryRunner,
  logger,
  LogLevel
} from '../../src';

import { ragAgent, createRagCorpus, uploadDocuments } from './agent';

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
  console.log('  - "What information do you have available?"');
  console.log('  - "Search for documentation about getting started"');
  console.log('  - "Tell me about the API endpoints"');
  console.log('  - "How do I configure authentication?"\n');

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

      console.log('🤖 Assistant: Searching knowledge base...');

      const context = {
        sessionId: 'rag-session',
        userId: 'example-user',
        appName: 'rag-app',
        agentName: 'rag-agent',
        requestId: `rag-request-${Date.now()}`,
        timestamp: new Date(),
        metadata: {
          source: 'rag-example'
        },
        agent: agent,
        session: {
          id: 'rag-session',
          appName: 'rag-app',
          userId: 'example-user',
          state: sessionState,
          events: [],
          lastUpdateTime: Date.now()
        },
        invocationId: `rag-invocation-${Date.now()}`
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
        
        // Note: Retrieval metadata would be available in a real RAG implementation
        console.log('\n--- RAG Search Complete ---');
        console.log('Retrieved documents would be shown here in a full implementation.');
      } else {
        console.log('🤖 Assistant: Search completed successfully.');
      }

    } catch (error) {
      console.error('❌ Error:', (error as Error).message);
    }
  }

  rl.close();
}

async function main() {
  try {
    logger.info('Starting RAG Agent example...');

    // Use the imported agent
    const agent = ragAgent;

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
        example: 'rag-agent'
      }
    };

    // Test messages to demonstrate RAG functionality
    const testMessages = [
      'What information do you have available? Can you search for documentation about getting started?',
      'Tell me about the main features and capabilities'
    ];

    console.log('\n📚 RAG Agent Demo');
    console.log('==================\n');

    // Process test messages
    for (const message of testMessages) {
      console.log(`\n👤 User: ${message}`);
      console.log('🤖 Assistant: Searching knowledge base...');

      try {
        const context = {
          sessionId: 'rag-session',
          userId: 'example-user',
          appName: 'rag-app',
          agentName: 'rag-agent',
          requestId: `rag-request-${Date.now()}`,
          timestamp: new Date(),
          metadata: {
            source: 'rag-example'
          },
          agent: agent,
          session: {
            id: 'rag-session',
            appName: 'rag-app',
            userId: 'example-user',
            state: sessionState,
            events: [],
            lastUpdateTime: Date.now()
          },
          invocationId: `rag-invocation-${Date.now()}`
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
          console.log('🤖 Assistant: Search completed successfully.');
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
    console.log('\nMake sure you have:');
    console.log('1. Set up Google Cloud credentials');
    console.log('2. Enabled the Vertex AI API');
    console.log('3. Created a RAG corpus in Vertex AI');
    console.log('4. Set the VERTEX_AI_RAG_CORPUS_ID environment variable');
    console.log('5. Uploaded documents to your RAG corpus');
    process.exit(1);
  }
}



if (require.main === module) {
  main();
}

export { ragAgent };