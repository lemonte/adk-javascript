import { Agent, createTool } from '../../src';

// Simulated die roll tool
const rollDieTool = createTool(
  async function rollDie({ sides = 6, count = 1 }: { sides?: number; count?: number }) {
    // Simulate rolling delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const results: number[] = [];
    
    for (let i = 0; i < count; i++) {
      const result = Math.floor(Math.random() * sides) + 1;
      results.push(result);
    }
    
    const total = results.reduce((sum, result) => sum + result, 0);
    const average = total / count;
    
    return {
      success: true,
      results,
      total,
      average: Math.round(average * 100) / 100,
      sides,
      count,
      message: `🎲 Rolled ${count} ${sides}-sided die${count > 1 ? 's' : ''}: ${results.join(', ')}${count > 1 ? ` (Total: ${total}, Average: ${average.toFixed(2)})` : ''}`
    };
  },
  {
    name: 'roll_die',
    description: 'Roll a die and return the result',
    parameters: {
      type: 'object',
      properties: {
        sides: {
          type: 'number',
          description: 'Number of sides on the die (default: 6)',
          minimum: 2,
          maximum: 100,
          default: 6
        },
        count: {
          type: 'number',
          description: 'Number of dice to roll (default: 1)',
          minimum: 1,
          maximum: 10,
          default: 1
        }
      }
    }
  }
);

// Prime number checking tool
const checkPrimeTool = createTool(
  async function checkPrime({ number }: { number: number }) {
    // Simulate computation delay for larger numbers
    const delay = Math.min(1000, Math.max(100, number / 1000));
    await new Promise(resolve => setTimeout(resolve, delay));
    
    if (number < 2) {
      return {
        success: true,
        number,
        isPrime: false,
        reason: 'Numbers less than 2 are not prime',
        message: `❌ ${number} is not prime (numbers less than 2 are not prime)`
      };
    }
    
    if (number === 2) {
      return {
        success: true,
        number,
        isPrime: true,
        reason: '2 is the only even prime number',
        message: `✅ ${number} is prime (the only even prime number)`
      };
    }
    
    if (number % 2 === 0) {
      return {
        success: true,
        number,
        isPrime: false,
        reason: 'Even numbers greater than 2 are not prime',
        divisibleBy: [2, number / 2],
        message: `❌ ${number} is not prime (divisible by 2)`
      };
    }
    
    // Check odd divisors up to sqrt(number)
    const sqrt = Math.sqrt(number);
    for (let i = 3; i <= sqrt; i += 2) {
      if (number % i === 0) {
        return {
          success: true,
          number,
          isPrime: false,
          reason: `Divisible by ${i}`,
          divisibleBy: [i, number / i],
          message: `❌ ${number} is not prime (divisible by ${i})`
        };
      }
    }
    
    return {
      success: true,
      number,
      isPrime: true,
      reason: 'No divisors found',
      message: `✅ ${number} is prime!`
    };
  },
  {
    name: 'check_prime',
    description: 'Check if a number is prime',
    parameters: {
      type: 'object',
      properties: {
        number: {
          type: 'number',
          description: 'The number to check for primality',
          minimum: 1
        }
      },
      required: ['number']
    }
  }
);

// Create the streaming agent
export const streamingAgent = new Agent({
  model: 'gemini-2.0-flash-exp',
  tools: [rollDieTool, checkPrimeTool],
  name: 'Streaming Demo Agent',
  description: 'An agent that demonstrates interactive capabilities (simulated streaming)',
  instruction: `You are a helpful assistant that can:

    1. **Roll Dice**: Use the roll_die tool to roll dice with different numbers of sides
    2. **Check Prime Numbers**: Use the check_prime tool to determine if numbers are prime

    When users ask you to roll dice or check prime numbers, use the appropriate tools.
    Be friendly and explain the results clearly.

    Note: This is a demonstration of interactive capabilities. In a real streaming implementation,
    you would see live updates as tools execute, but here we simulate the experience.`
});

export { rollDieTool, checkPrimeTool };