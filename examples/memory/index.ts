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
import { rootAgent } from './agent';
import { InMemoryRunner } from '../../src/runners/in-memory-runner';
import { Content, TextPart } from '../../src/types';

// Load environment variables
dotenv.config({ override: true });



async function main() {
  const appName = 'memory_app';
  const userId = 'user1';
  
  const runner = new InMemoryRunner(rootAgent, {
    maxIterations: 5,
    enableLogging: true
  });
  
  // Create initial session state
  const sessionState: any = {
    messages: [],
    memory: {},
    metadata: {
      createdAt: new Date().toISOString(),
      example: 'memory'
    }
  };
  
  // Create invocation context
  const context = {
    sessionId: 'memory-session',
    userId: userId,
    appName: appName,
    agentName: 'memory_agent',
    requestId: 'memory-request',
    timestamp: new Date(),
    metadata: {
      source: 'memory-example'
    },
    agent: rootAgent,
    session: {
      id: 'memory-session',
      appName: appName,
      userId: userId,
      state: sessionState,
      events: [],
      lastUpdateTime: Date.now()
    },
    invocationId: 'memory-invocation'
  };
  
  let currentSessionState = sessionState;
  
  async function runPrompt(newMessage: string) {
    const content: Content = {
      role: 'user',
      parts: [{ type: 'text', text: newMessage } as TextPart]
    };
    
    console.log('\n** User says:', newMessage);
    
    try {
      const result = await runner.run(content, currentSessionState, context);
      
      // Extract the response text
      const responseText = result.response.parts
        .filter(part => part.type === 'text')
        .map(part => (part as any).text)
        .join(' ');
      
      console.log('** Agent:', responseText);
      
      // Update session state
      currentSessionState = result.sessionState;
    } catch (error) {
      console.error('Error:', error);
    }
  }
  
  const startTime = Date.now();
  console.log('Memory Agent Example');
  console.log('Start time:', new Date(startTime).toISOString());
  console.log('====================================');
  
  // Test memory operations
  await runPrompt('Hi! Can you help me store some information?');
  await runPrompt('Save my favorite color as blue with key "favorite_color"');
  await runPrompt('Save my age as 25 with key "age"');
  await runPrompt('What keys do you have stored?');
  await runPrompt('What is my favorite color?');
  await runPrompt('What is my age?');
  await runPrompt('Save a list of my hobbies: ["reading", "coding", "hiking"] with key "hobbies"');
  await runPrompt('What are my hobbies?');
  await runPrompt('Try to load something that doesn\'t exist with key "nonexistent"');
  
  const endTime = Date.now();
  console.log('\n====================================');
  console.log('End time:', new Date(endTime).toISOString());
  console.log('Total time:', (endTime - startTime) / 1000, 'seconds');
}

if (require.main === module) {
  main().catch(console.error);
}