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

// Create check prime tool
const checkPrimeTool = createTool(
  async function checkPrime(nums: number[]): Promise<string> {
    const primes = new Set<number>();
    
    for (const number of nums) {
      const num = Math.floor(number);
      if (num <= 1) {
        continue;
      }
      
      let isPrime = true;
      for (let i = 2; i <= Math.sqrt(num); i++) {
        if (num % i === 0) {
          isPrime = false;
          break;
        }
      }
      
      if (isPrime) {
        primes.add(num);
      }
    }
    
    return primes.size === 0
      ? 'No prime numbers found.'
      : `${Array.from(primes).join(', ')} are prime numbers.`;
  },
  {
    name: 'check_prime',
    description: 'Check if a given list of numbers are prime',
    parameters: {
      type: 'object',
      properties: {
        nums: {
          type: 'array',
          description: 'The list of numbers to check',
          items: {
            type: 'integer',
            minimum: 1
          }
        }
      },
      required: ['nums']
    }
  }
);

export const rootAgent = new Agent({
  model: 'gemini-2.0-flash',
  name: 'hello_world_agent',
  description: 'hello world agent that can roll a dice of 8 sides and check prime numbers.',
  instruction: `
    You roll dice and answer questions about the outcome of the dice rolls.
    You can roll dice of different sizes.
    You can use multiple tools in parallel by calling functions in parallel(in one request and in one round).
    It is ok to discuss dice rolls and comment on the results.
    When you are asked to roll a die, you must call the roll_die tool with the number of sides. Be sure to pass in an integer. Do not pass in a string.
    You should never roll a die on your own.
    When checking prime numbers, call the check_prime tool with a list of integers. Be sure to pass in a list of integers. You should never pass in a string.
    You should not check prime numbers before calling the tool.
    When you are asked to roll a die and check prime numbers, you should always make the following two function calls:
    1. You should first call the roll_die tool to get a roll. Wait for the function response before calling the check_prime tool.
    2. After you get the function response from roll_die tool, you should call the check_prime tool with the roll_die result.
    3. When you respond, you must include the roll_die result from step 1.
    You should always perform the previous 3 steps when asking for a roll and checking prime numbers.
    Always be enthusiastic and explain what you're doing!
  `,
  tools: [rollDieTool, checkPrimeTool]
});

// Example usage
if (require.main === module) {
  async function main() {
    try {
      console.log('Hello World Agent initialized successfully!');
      console.log('Agent name:', rootAgent.name);
      console.log('Agent description:', rootAgent.description);
      console.log('Available tools:', rootAgent.tools?.length || 0);
      console.log('\nTry asking the agent to:');
      console.log('- "Roll a 6-sided die"');
      console.log('- "Roll a die and check if the result is prime"');
      console.log('- "Roll two dice and check which results are prime"');
    } catch (error) {
      console.error('Error initializing agent:', error);
    }
  }
  
  main();
}