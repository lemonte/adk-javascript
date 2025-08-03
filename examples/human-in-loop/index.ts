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

// Load environment variables from .env file
import * as dotenv from 'dotenv';
dotenv.config({ override: true });

import {
  InMemoryRunner,
  InMemorySessionService
} from '../../src';

import { rootAgent } from './agent';

async function main() {
  const appName = 'human_in_loop_app';
  const userId = 'user1';
  const sessionService = new InMemorySessionService();
  
  const session = await sessionService.createSession({
    appName,
    userId,
  });

  async function runPrompt(userMessage: string) {
    console.log(`\n>>> User: ${userMessage}`);
    console.log('--- Agent Response ---');
    
    const runner = new InMemoryRunner(rootAgent, {
    maxIterations: 10,
    enableLogging: true
  });
  
  // Create proper session state with messages array
  const sessionState = {
    messages: [],
    metadata: {
      createdAt: new Date().toISOString(),
      example: 'human-in-loop'
    }
  };
  
  const context = {
    sessionId: session.id,
    userId,
    appName,
    agentName: 'human-in-loop-agent',
    requestId: `human-in-loop-request-${Date.now()}`,
    timestamp: new Date(),
    metadata: {
      source: 'human-in-loop-example'
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
    invocationId: `human-in-loop-invocation-${Date.now()}`
  };
  
  const result = await runner.run({
    role: 'user',
    parts: [{ type: 'text', text: userMessage }]
  }, sessionState, context);
    
    // Extract text from response
    const responseText = result.response.parts
      ?.map((part: any) => part.type === 'text' ? part.text : '')
      .filter(Boolean)
      .join(' ') || 'No response';
    
    console.log(responseText);
    console.log('--- End Response ---\n');
    
    return result;
  }

  // Example prompts to demonstrate human-in-the-loop workflows
  console.log('🤖 Human-in-Loop Demo');
  console.log('This demo shows how an AI agent can work with human oversight.');
  
  await runPrompt('Calculate 15 * 23 + 7');
  
  await runPrompt('I need to access personal information for user ID "user123" to help with their support request');
  
  await runPrompt('Please process the "customer_data_2024" dataset using analysis type processing');
  
  console.log('\n✅ Demo completed!');
  console.log('In a real implementation:');
  console.log('- Sensitive data access would require actual human approval');
  console.log('- Long-running processes would run in the background');
  console.log('- You could implement approval workflows, notifications, etc.');
}

if (require.main === module) {
  const startTime = Date.now();
  main()
    .then(() => {
      const endTime = Date.now();
      console.log(`\nTotal execution time: ${endTime - startTime}ms`);
    })
    .catch(console.error);
}