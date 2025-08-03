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
dotenv.config({ path: '.env' });

async function main() {
  const appName = 'weather_time_app';
  const userId = 'user1';
  
  const runner = new InMemoryRunner(rootAgent, {
    maxIterations: 5,
    enableLogging: true
  });
  
  // Create initial session state
  const sessionState: any = {
    messages: [],
    metadata: {
      createdAt: new Date().toISOString(),
      example: 'weather-time'
    }
  };
  
  // Create invocation context
  const context = {
    sessionId: 'weather-time-session',
    userId: userId,
    appName: appName,
    agentName: 'weather_time_agent',
    requestId: 'weather-time-request',
    timestamp: new Date(),
    metadata: {
      source: 'weather-time-example'
    },
    agent: rootAgent,
    session: {
      id: 'weather-time-session',
      appName: appName,
      userId: userId,
      state: sessionState,
      events: [],
      lastUpdateTime: Date.now()
    },
    invocationId: 'weather-time-invocation'
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
  console.log('Start time:', startTime);
  console.log('------------------------------------');
  
  await runPrompt('Hi! What can you help me with?');
  await runPrompt('What is the weather in New York?');
  await runPrompt('What time is it in New York?');
  await runPrompt('What about the weather in London?');
  
  const endTime = Date.now();
  console.log('------------------------------------');
  console.log('End time:', endTime);
  console.log('Total time:', (endTime - startTime) / 1000, 'seconds');
}

if (require.main === module) {
  main().catch(console.error);
}