import { Agent, createTool } from '../../src';
import * as fs from 'fs';
import * as path from 'path';

// Simulated MCP Tools using createTool

// File System Tool (simulated)
const readFileTool = createTool(
  async (params: any) => {
    try {
      const filePath = params.path;
      const encoding = params.encoding || 'utf8';
      
      // Security check - prevent reading outside current directory
      const resolvedPath = path.resolve(filePath);
      const currentDir = process.cwd();
      
      if (!resolvedPath.startsWith(currentDir)) {
        throw new Error('Access denied: Cannot read files outside current directory');
      }
      
      const content = fs.readFileSync(resolvedPath, encoding);
      
      return {
        success: true,
        content: content,
        size: content.length,
        path: resolvedPath
      }
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message
      };
    }
  },
  {
    name: 'read_file',
    description: 'Read contents of a file from the local filesystem (simulated)',
    parameters: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'Path to the file to read'
        },
        encoding: {
          type: 'string',
          description: 'File encoding (default: utf8)',
          default: 'utf8'
        }
      },
      required: ['path']
    }
  }
);

// HTTP Request Tool (simulated)
const httpRequestTool = createTool(
  async (params: any) => {
    try {
      const { url, method = 'GET', headers = {}, body, timeout = 10000 } = params;
      
      // Simulate HTTP request with mock data
      console.log(`[SIMULATED] Making ${method} request to: ${url}`);
      
      // Mock response based on URL patterns
      let mockResponse;
      if (url.includes('api.github.com')) {
        mockResponse = {
          status: 200,
          data: { message: 'GitHub API response (simulated)', user: 'example-user' }
        };
      } else if (url.includes('jsonplaceholder')) {
        mockResponse = {
          status: 200,
          data: { id: 1, title: 'Sample Post', body: 'This is a simulated API response' }
        };
      } else {
        mockResponse = {
          status: 200,
          data: { message: 'Generic API response (simulated)', timestamp: new Date().toISOString() }
        };
      }
      
      return {
        success: true,
        status: mockResponse.status,
        data: mockResponse.data,
        headers: { 'content-type': 'application/json' },
        url: url
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message
      };
    }
  },
  {
    name: 'http_request',
    description: 'Make HTTP requests to external APIs (simulated)',
    parameters: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          description: 'URL to make the request to'
        },
        method: {
          type: 'string',
          description: 'HTTP method (GET, POST, PUT, DELETE)',
          default: 'GET'
        },
        headers: {
          type: 'object',
          description: 'HTTP headers to include'
        },
        body: {
          type: 'string',
          description: 'Request body (for POST/PUT requests)'
        },
        timeout: {
          type: 'number',
          description: 'Request timeout in milliseconds',
          default: 10000
        }
      },
      required: ['url']
    }
  }
);

// Database Query Tool (simulated)
const databaseQueryTool = createTool(
  async (params: any) => {
    try {
      const { query, database = './example.db', params: queryParams = [] } = params;
      
      console.log(`[SIMULATED] Executing query on ${database}: ${query}`);
      
      // Mock database responses
      let mockResult;
      if (query.toLowerCase().includes('select')) {
        mockResult = {
          rows: [
            { id: 1, name: 'John Doe', email: 'john@example.com' },
            { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
          ],
          rowCount: 2
        };
      } else if (query.toLowerCase().includes('insert')) {
        mockResult = {
          insertId: 3,
          rowsAffected: 1
        };
      } else {
        mockResult = {
          rowsAffected: 1
        };
      }
      
      return {
        success: true,
        result: mockResult,
        query: query,
        database: database
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message
      };
    }
  },
  {
    name: 'database_query',
    description: 'Execute SQL queries on a SQLite database (simulated)',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'SQL query to execute'
        },
        database: {
          type: 'string',
          description: 'Database file path',
          default: './example.db'
        },
        params: {
          type: 'array',
          description: 'Query parameters for prepared statements'
        }
      },
      required: ['query']
    }
  }
);

// System Command Tool (simulated)
const systemCommandTool = createTool(
  async (params: any) => {
    try {
      const { command, args = [], timeout = 30000 } = params;
      
      // Security whitelist of allowed commands (simulated)
      const allowedCommands = ['ls', 'pwd', 'date', 'whoami', 'uname', 'echo'];
      
      if (!allowedCommands.includes(command)) {
        throw new Error(`Command '${command}' is not allowed for security reasons`);
      }
      
      console.log(`[SIMULATED] Executing command: ${command} ${args.join(' ')}`);
      
      // Mock command outputs
      let mockOutput;
      switch (command) {
        case 'ls':
          mockOutput = 'file1.txt\nfile2.js\ndirectory1\n';
          break;
        case 'pwd':
          mockOutput = '/current/working/directory';
          break;
        case 'date':
          mockOutput = new Date().toString();
          break;
        case 'whoami':
          mockOutput = 'current-user';
          break;
        case 'uname':
          mockOutput = 'Darwin';
          break;
        case 'echo':
          mockOutput = args.join(' ');
          break;
        default:
          mockOutput = 'Command executed successfully (simulated)';
      }
      
      return {
        success: true,
        output: mockOutput,
        exitCode: 0,
        command: `${command} ${args.join(' ')}`
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
        exitCode: 1
      };
    }
  },
  {
    name: 'system_command',
    description: 'Execute system commands (with security restrictions, simulated)',
    parameters: {
      type: 'object',
      properties: {
        command: {
          type: 'string',
          description: 'Command to execute'
        },
        args: {
          type: 'array',
          description: 'Command arguments'
        },
        timeout: {
          type: 'number',
          description: 'Command timeout in milliseconds',
          default: 30000
        }
      },
      required: ['command']
    }
  }
);

// Create the MCP agent
export const mcpAgent = new Agent({
  name: 'MCP Demo Agent',
  model: 'gemini-2.0-flash-exp',
  tools: [readFileTool, httpRequestTool, databaseQueryTool, systemCommandTool],
  systemInstruction: `You are an AI assistant demonstrating Model Context Protocol (MCP) integration with simulated tools.

You have access to the following simulated MCP tools:
1. **read_file**: Read contents of files from the local filesystem (simulated)
2. **http_request**: Make HTTP requests to external APIs (simulated with mock data)
3. **database_query**: Execute SQL queries on databases (simulated with mock data)
4. **system_command**: Execute safe system commands (simulated with mock outputs)

When using these tools:
- Always validate inputs and handle errors gracefully
- Be mindful of security implications
- Provide clear feedback about tool execution results
- Use appropriate tools for each task
- Remember that these are simulated tools for demonstration purposes

Example usage patterns:
- To read a file: Use read_file with the file path
- To fetch data from an API: Use http_request with the URL and method
- To query data: Use database_query with SQL statements
- To get system info: Use system_command with safe commands

Always explain what you're doing and why you're using specific tools. Note that all responses are simulated for demonstration purposes.`
});

export { readFileTool, httpRequestTool, databaseQueryTool, systemCommandTool };