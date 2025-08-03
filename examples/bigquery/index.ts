// Load environment variables from .env file
import * as dotenv from 'dotenv';
dotenv.config({ override: true });

import {
  Agent,
  InMemoryRunner,
  createTool,
  logger,
  LogLevel
} from '../../src';

import * as readline from 'readline';

// Configure logging
logger.setLevel(LogLevel.INFO);

// Create a mock BigQuery tool for demonstration
const bigQueryTool = createTool(
  async function queryBigQuery(query: string): Promise<string> {
    // Mock BigQuery responses for demonstration
    const mockData = {
      'SELECT * FROM users LIMIT 5': [
        { id: 1, name: 'John Doe', email: 'john@example.com', created_at: '2024-01-15' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', created_at: '2024-01-16' },
        { id: 3, name: 'Bob Johnson', email: 'bob@example.com', created_at: '2024-01-17' }
      ],
      'SELECT COUNT(*) as total FROM users': [{ total: 1250 }],
      'SELECT DATE(created_at) as date, COUNT(*) as users FROM users GROUP BY DATE(created_at) ORDER BY date DESC LIMIT 7': [
        { date: '2024-01-20', users: 45 },
        { date: '2024-01-19', users: 38 },
        { date: '2024-01-18', users: 52 }
      ]
    };
    
    logger.info(`Executing BigQuery: ${query}`);
    
    // Simulate query execution time
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const result = (mockData as any)[query] || [{ message: 'Query executed successfully (mock data)' }];
    
    return JSON.stringify(result, null, 2);
  },
  {
    name: 'query_bigquery',
    description: 'Execute SQL queries on BigQuery datasets',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'SQL query to execute on BigQuery'
        }
      },
      required: ['query']
    }
  }
);

// Create the BigQuery agent
const bigqueryAgent = new Agent({
  model: 'gemini-2.0-flash-exp',
  name: 'bigquery_agent',
  description: 'An agent that can query BigQuery datasets and analyze data.',
  tools: [bigQueryTool],
  instruction: `You are a BigQuery assistant that helps users interact with their BigQuery datasets and tables.

You have access to a BigQuery tool that can execute SQL queries. The tool returns mock data for demonstration purposes.

When helping users:
1. Start by understanding what data they want to work with
2. Execute SQL queries to retrieve or analyze data
3. Always explain your queries and results clearly
4. Format the results in a user-friendly way

Be helpful, accurate, and provide clear explanations of the data returned.`
});

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function runInteractiveMode() {
  console.log('🚀 ADK BigQuery Integration Example');
  console.log('====================================');
  console.log('');
  console.log('This example demonstrates how to use BigQuery with the ADK.');
  console.log('You can query datasets, analyze data, and get insights.');
  console.log('');
  console.log('Example queries:');
  console.log('  • "Show me the first 5 users from the users table"');
  console.log('  • "How many total users do we have?"');
  console.log('  • "What are the user registration trends for the last 7 days?"');
  console.log('');
  console.log('Type "exit" to quit.');
  console.log('');
  
  // Create a runner
  const runner = new InMemoryRunner(bigqueryAgent, {
    maxIterations: 5,
    enableLogging: true
  });
  
  // Set up event listeners
  runner.on('run_start', (event) => {
    logger.info('Run started', event.data);
  });
  
  runner.on('tool_call', (event) => {
    logger.info('Tool called', event.data);
  });
  
  runner.on('run_complete', (event) => {
    logger.info('Run completed', event.data);
  });
  
  while (true) {
    let userInput: string;
    
    try {
      userInput = await new Promise<string>((resolve, reject) => {
        rl.question('You: ', resolve);
        rl.on('close', () => reject(new Error('readline closed')));
      });
    } catch (error) {
      // Handle readline being closed (e.g., when using pipes)
      console.log('\n👋 Goodbye!');
      break;
    }
    
    if (userInput.toLowerCase() === 'exit') {
      console.log('\n👋 Goodbye!');
      break;
    }
    
    if (userInput.trim() === '') {
      continue;
    }
    
    try {
      console.log('\n🤖 Agent: Analyzing your query...');
      
      // Create session state
      const sessionState = {
        messages: [],
        metadata: {
          createdAt: new Date().toISOString(),
          example: 'bigquery'
        }
      };

      // Create invocation context
      const context = {
        sessionId: 'bigquery-session',
        userId: 'example-user',
        appName: 'bigquery-app',
        agentName: 'bigquery-agent',
        requestId: `bigquery-request-${Date.now()}`,
        timestamp: new Date(),
        metadata: {
          source: 'bigquery-example'
        },
        agent: bigqueryAgent,
        session: {
          id: 'bigquery-session',
          appName: 'bigquery-app',
          userId: 'example-user',
          state: sessionState,
          events: [],
          lastUpdateTime: Date.now()
        },
        invocationId: `bigquery-invocation-${Date.now()}`
      };

      // Create message
      const message = {
        role: 'user' as const,
        parts: [{
          type: 'text' as const,
          text: userInput
        }]
      };
      
      const result = await runner.run(message, sessionState, context);
      
      // Extract the response text
      const responseText = result.response.parts
        .filter(part => part.type === 'text')
        .map(part => (part as any).text)
        .join('');
      
      console.log('\n🤖 Agent:', responseText);
      
    } catch (error) {
      console.error('\n❌ Error:', (error as Error).message);
    }
    
    console.log('');
  }
  
  rl.close();
}

async function main() {
  console.log('BigQuery Agent Example');
  console.log('=====================');
  console.log('This example demonstrates BigQuery integration with the ADK.');
  console.log('Make sure you have configured your Google Cloud credentials.');
  console.log('');

  try {
    await runInteractiveMode();
  } catch (error) {
    console.error('Error running BigQuery agent:', error);
    console.log('\nMake sure you have:');
    console.log('1. Set up Google Cloud credentials');
    console.log('2. Enabled the BigQuery API');
    console.log('3. Set the GOOGLE_CLOUD_PROJECT_ID environment variable');
  }
}

if (require.main === module) {
  main();
}

export { bigqueryAgent, bigQueryTool };