// Copyright 2025 Geanderson Lemonte
// Based on Google ADK libraries
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import * as dotenv from 'dotenv';
dotenv.config({ override: true });

import { InMemoryRunner } from '../../src';
import { rootAgent } from './agent';

async function main() {
  console.log('Google Search Agent initialized successfully!');
  console.log(`Agent name: ${rootAgent.name}`);
  console.log(`Agent description: ${rootAgent.description}`);
  console.log(`Available tools: ${rootAgent.tools?.length || 0}`);
  console.log('\nNote: This example uses mock search results for demonstration purposes.');
  console.log('To use real Google Search, you would need to integrate with the Google Custom Search API.');
  console.log('\n' + '='.repeat(50));
  console.log('');

  const runner = new InMemoryRunner(rootAgent, {
    maxIterations: 10,
    enableLogging: true
  });
  
  // Set up event listeners
  runner.on('run_start', (event) => {
    console.log('Run started', event.data);
  });

  runner.on('tool_call', (event) => {
    console.log('Tool called', event.data);
  });

  runner.on('run_complete', (event) => {
    console.log('Run completed', event.data);
  });
  
  // Create initial session state
  const sessionState: any = {
    messages: [],
    metadata: {
      createdAt: new Date().toISOString(),
      example: 'google-search'
    }
  };

  // Create invocation context
  const context = {
    sessionId: 'google-search-session',
    userId: 'example-user',
    appName: 'google-search-app',
    agentName: 'google-search-agent',
    requestId: 'google-search-request',
    timestamp: new Date(),
    metadata: {
      source: 'google-search-example'
    },
    agent: rootAgent,
    session: {
      id: 'google-search-session',
      appName: 'google-search-app',
      userId: 'example-user',
      state: sessionState,
      events: [],
      lastUpdateTime: Date.now()
    },
    invocationId: 'google-search-invocation'
  };
  
  const startTime = Date.now();
  console.log(`Start time: ${startTime}`);
  console.log('------------------------------------');
  console.log('');

  // Example interactions
  const queries = [
    'Hi! What can you help me with?',
    'Search for information about artificial intelligence',
    'What did you find about AI trends?'
  ];

  let currentSessionState = sessionState;

  for (const query of queries) {
    console.log(`** User says: ${query}`);
    try {
      const message = {
        role: 'user' as const,
        parts: [{
          type: 'text' as const,
          text: query
        }]
      };
      
      const result = await runner.run(message, currentSessionState, context);
      
      // Extract the response text
      const responseText = result.response.parts
        .filter(part => part.type === 'text')
        .map(part => (part as any).text)
        .join(' ');
      
      console.log(`** Agent: ${responseText}`);
      console.log('');
      
      // Update session state for next iteration
      currentSessionState = result.sessionState;
      
    } catch (error) {
      console.error(`Error: ${error}`);
      console.log('');
    }
  }

  const endTime = Date.now();
  console.log('------------------------------------');
  console.log(`End time: ${endTime}`);
  console.log(`Total time: ${(endTime - startTime) / 1000} seconds`);
}

if (require.main === module) {
  main().catch(console.error);
}