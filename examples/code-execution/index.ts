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
  const appName = 'code_execution_app';
  const userId = 'user1';
  const sessionService = new InMemorySessionService();
  
  const runner = new InMemoryRunner(rootAgent, {
    maxIterations: 10,
    enableLogging: true
  });
  
  const session = await sessionService.createSession({
    appName,
    userId,
  });

  async function askAgent(query: string) {
    console.log(`\n>>> User: ${query}`);
    console.log('--- Agent Response ---');
    
    // Create proper session state with messages array
    const sessionState = {
      messages: [],
      metadata: {
        createdAt: new Date().toISOString(),
        example: 'code-execution'
      }
    };
    
    const context = {
      sessionId: session.id,
      userId,
      appName,
      agentName: 'code-execution-agent',
      requestId: `code-execution-request-${Date.now()}`,
      timestamp: new Date(),
      metadata: {
        source: 'code-execution-example'
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
      invocationId: `code-execution-invocation-${Date.now()}`
    };
    
    const result = await runner.run({
      role: 'user',
      parts: [{ type: 'text', text: query }]
    }, sessionState, context);
    
    // Extract text from response
    const responseText = result.response.parts
      ?.filter(part => part.type === 'text')
      .map(part => (part as any).text)
      .filter(Boolean)
      .join(' ') || 'No response';
    
    console.log(responseText);
    console.log('--- End Response ---\n');
  }

  // Example queries demonstrating code execution capabilities
  await askAgent('Calculate the factorial of 10 using JavaScript');
  
  await askAgent('Create an array of the first 20 Fibonacci numbers and show me the result');
  
  await askAgent('I have this sales data: [{"month": "Jan", "sales": 1000}, {"month": "Feb", "sales": 1500}, {"month": "Mar", "sales": 1200}]. Calculate the total sales and average monthly sales.');
  
  await askAgent('Generate a simple analysis of the sales data from the previous question. Which month had the highest sales?');
  
  await askAgent('Create a function that finds all prime numbers up to 50 and show me the result');
}

if (require.main === module) {
  main().catch(console.error);
}