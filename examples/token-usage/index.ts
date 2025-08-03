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

import {
  InMemoryRunner,
  InMemorySessionService
} from '../../src';

import { rootAgent, rollAgentWithGemini, rollAgentWithGeminiFlash, rollAgentWithGeminiPro } from './agent';

async function main() {
  const appName = 'token_usage_app';
  const userId = 'user1';
  const sessionService = new InMemorySessionService();
  
  const session = await sessionService.createSession({
    appName,
    userId,
  });

  async function runPromptWithAgent(agent: any, agentName: string, userMessage: string) {
    console.log(`\n=== ${agentName} ===`);
    console.log(`>>> User: ${userMessage}`);
    console.log('--- Agent Response ---');
    
    const runner = new InMemoryRunner(agent, {
      maxIterations: 10,
      enableLogging: true
    });
    
    // Create proper session state with messages array
    const sessionState = {
      messages: [],
      metadata: {
        createdAt: new Date().toISOString(),
        example: 'token-usage'
      }
    };
    
    const context = {
      sessionId: session.id,
      userId,
      appName,
      agentName,
      requestId: `token-usage-request-${Date.now()}`,
      timestamp: new Date(),
      metadata: {
        source: 'token-usage-example'
      },
      agent: agent,
      session: {
        id: session.id,
        appName,
        userId,
        state: sessionState,
        events: [],
        lastUpdateTime: Date.now()
      },
      invocationId: `token-usage-invocation-${Date.now()}`
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

  // Test the same prompt with different models to compare token usage
  const testPrompt = 'Roll a 6-sided die and tell me about the result';
  
  console.log('\n🎲 Token Usage Comparison Demo');
  console.log('Testing the same prompt with different Gemini models...');
  
  await runPromptWithAgent(rollAgentWithGemini, 'Gemini 2.0 Flash', testPrompt);
  await runPromptWithAgent(rollAgentWithGeminiFlash, 'Gemini 1.5 Flash', testPrompt);
  await runPromptWithAgent(rollAgentWithGeminiPro, 'Gemini 1.5 Pro', testPrompt);
  
  console.log('\n📊 Note: In a real implementation, you would capture and compare');
  console.log('the actual token usage metrics from each model response.');
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