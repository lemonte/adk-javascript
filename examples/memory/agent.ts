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

// Load environment variables first
import * as dotenv from 'dotenv';
dotenv.config({ override: true });

import { Agent, createTool } from '../../src';
import { Content, TextPart } from '../../src';

/**
 * Simple memory storage for demonstration
 */
const memoryStore: { [key: string]: any } = {};

// Create load memory tool
const loadMemoryTool = createTool(
  function loadMemory(key: string): string {
    const value = memoryStore[key];
    console.log(`Loading memory for key '${key}':`, value || 'not found');
    return value ? `Retrieved from memory: ${value}` : `No data found for key: ${key}`;
  },
  {
    name: 'load_memory',
    description: 'Load data from memory using a key',
    parameters: {
      type: 'object',
      properties: {
        key: {
          type: 'string',
          description: 'The key to retrieve data for'
        }
      },
      required: ['key']
    }
  }
);

// Create save memory tool
const saveMemoryTool = createTool(
  function saveMemory(key: string, value: string): string {
    memoryStore[key] = value;
    console.log(`Saved to memory - key: '${key}', value:`, value);
    return `Successfully saved data to memory with key '${key}'`;
  },
  {
    name: 'save_memory',
    description: 'Save data to memory with a specific key',
    parameters: {
      type: 'object',
      properties: {
        key: {
          type: 'string',
          description: 'The key to store the data under'
        },
        value: {
          type: 'string',
          description: 'The value to store'
        }
      },
      required: ['key', 'value']
    }
  }
);

// Create list memory keys tool
const listMemoryKeysTool = createTool(
  function listMemoryKeys(): string {
    const keys = Object.keys(memoryStore);
    console.log('Available memory keys:', keys);
    return keys.length > 0 ? `Memory keys: ${keys.join(', ')}` : 'No memory keys found';
  },
  {
    name: 'list_memory_keys',
    description: 'List all memory keys',
    parameters: {
      type: 'object',
      properties: {},
      required: []
    }
  }
);

export const rootAgent = new Agent({
  model: 'gemini-2.0-flash',
  name: 'memory_agent',
  description: 'Agent that can save, load, and list data in memory.',
  instruction: `
You are a helpful assistant with memory capabilities. You can:
1. Save data to memory using a key-value system
2. Load previously saved data using keys
3. List all available memory keys

When users ask you to remember something, use the save_memory tool.
When they ask you to recall something, use the load_memory tool.
When they want to see what you remember, use the list_memory_keys tool.

Always be helpful and explain what you're doing with the memory operations.
`,
  tools: [saveMemoryTool, loadMemoryTool, listMemoryKeysTool]
});