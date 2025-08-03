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
import { 
  rootAgent, 
  beforeAgentCallback, 
  afterAgentCallback, 
  beforeModelCallback, 
  afterModelCallback,
  afterAgentCb1,
  afterAgentCb2
} from './agent';

async function main() {
  console.log('🎯 Callbacks Agent initialized successfully!');
  console.log(`Agent name: ${rootAgent.name}`);
  console.log(`Agent description: ${rootAgent.description}`);
  console.log(`Available tools: ${rootAgent.tools?.length || 0}`);
  console.log('\n📋 This example demonstrates callback functionality during agent execution.');
  console.log('Watch for callback messages prefixed with 📥, 📤, 🤖, ✅, and 🔄');
  console.log('\n' + '='.repeat(60));
  console.log('');

  const runner = new InMemoryRunner(rootAgent, {
    maxIterations: 5,
    enableLogging: true
  });
  
  // Set up event listeners to simulate callbacks
  runner.on('run_start', (event) => {
    beforeAgentCallback(event.data);
  });

  runner.on('tool_call', (event) => {
    beforeModelCallback(event.data, { request: 'model_request_data' });
  });

  runner.on('run_complete', (event) => {
    afterAgentCallback(event.data);
    afterModelCallback(event.data, { response: 'model_response_data' });
    afterAgentCb1(event.data);
    afterAgentCb2(event.data);
  });
  
  // Simulate callback registration (in a real implementation, this would be done through the ADK API)
  console.log('🔧 Registering callbacks...');
  console.log('   - beforeAgentCallback: monitors agent start');
  console.log('   - afterAgentCallback: monitors agent completion');
  console.log('   - beforeModelCallback: monitors model calls');
  console.log('   - afterModelCallback: monitors model responses');
  console.log('   - afterAgentCb1 & afterAgentCb2: additional processing callbacks');
  console.log('');
  
  const startTime = Date.now();
  console.log(`⏰ Start time: ${startTime}`);
  console.log('------------------------------------');
  console.log('');

  // Create initial session state
  const sessionState: any = {
    messages: [],
    metadata: {
      createdAt: new Date().toISOString(),
      example: 'callbacks'
    }
  };

  // Create invocation context
  const context = {
    sessionId: 'callbacks-session',
    userId: 'example-user',
    appName: 'callbacks-app',
    agentName: 'callbacks-agent',
    requestId: 'callbacks-request',
    timestamp: new Date(),
    metadata: {
      source: 'callbacks-example'
    },
    agent: rootAgent,
    session: {
      id: 'callbacks-session',
      appName: 'callbacks-app',
      userId: 'example-user',
      state: sessionState,
      events: [],
      lastUpdateTime: Date.now()
    },
    invocationId: 'callbacks-invocation'
  };

  // Example interactions that demonstrate callbacks
  const queries = [
    'Hi! What can you help me with?',
    'Roll a 6-sided die',
    'Check if the number you just rolled is prime',
    'Roll a 20-sided die and check if it\'s prime'
  ];

  let currentSessionState = sessionState;

  for (let i = 0; i < queries.length; i++) {
    const query = queries[i];
    console.log(`\n🗣️  User says: ${query}`);
    
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
      
      console.log(`🤖 Agent: ${responseText}`);
      
      // Update session state for next iteration
      currentSessionState = result.sessionState;
      
    } catch (error) {
      console.error(`❌ Error: ${error}`);
    }
    
    console.log('\n' + '-'.repeat(40));
  }

  const endTime = Date.now();
  console.log('');
  console.log('====================================');
  console.log(`⏰ End time: ${endTime}`);
  console.log(`⏱️  Total time: ${(endTime - startTime) / 1000} seconds`);
  console.log('\n✨ Callbacks example completed!');
  console.log('\n📝 Note: In this example, callbacks are simulated for demonstration.');
  console.log('   In a real implementation, callbacks would be integrated into the ADK framework.');
}

if (require.main === module) {
  main().catch(console.error);
}