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

import { Agent, createTool } from '../../src';

// Create roll die tool
const rollDieTool = createTool(
  function rollDie(sides: number): number {
    const result = Math.floor(Math.random() * sides) + 1;
    console.log(`Rolled a ${sides}-sided die: ${result}`);
    return result;
  },
  {
    name: 'roll_die',
    description: 'Roll a die and return the rolled result',
    parameters: {
      type: 'object',
      properties: {
        sides: {
          type: 'integer',
          description: 'The integer number of sides the die has',
          minimum: 2,
          maximum: 100
        }
      },
      required: ['sides']
    }
  }
);

// Create three agents with different Gemini models for token usage comparison
const rollAgentWithGemini = new Agent({
  model: 'gemini-2.0-flash',
  name: 'roll_agent_gemini',
  description: 'Agent that rolls dice using Gemini 2.0 Flash',
  instruction: `
    You are a dice rolling agent. When asked to roll a die, use the roll_die tool.
    Always be enthusiastic about the results!
  `,
  tools: [rollDieTool]
});

const rollAgentWithGeminiFlash = new Agent({
  model: 'gemini-1.5-flash',
  name: 'roll_agent_gemini_flash',
  description: 'Agent that rolls dice using Gemini 1.5 Flash',
  instruction: `
    You are a dice rolling agent. When asked to roll a die, use the roll_die tool.
    Always be enthusiastic about the results!
  `,
  tools: [rollDieTool]
});

const rollAgentWithGeminiPro = new Agent({
  model: 'gemini-1.5-pro',
  name: 'roll_agent_gemini_pro',
  description: 'Agent that rolls dice using Gemini 1.5 Pro',
  instruction: `
    You are a dice rolling agent. When asked to roll a die, use the roll_die tool.
    Always be enthusiastic about the results!
  `,
  tools: [rollDieTool]
});

// Export agents for individual testing
export { rollAgentWithGemini, rollAgentWithGeminiFlash, rollAgentWithGeminiPro };

// Export the main agent for demonstration
export const rootAgent = rollAgentWithGemini;