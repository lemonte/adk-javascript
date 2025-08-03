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
dotenv.config({ override: true });

import { Agent, createTool } from '../../src';

// Simple code execution tool (simulated)
const codeExecutorTool = createTool(
  async (args: any) => {
    const { code, language = 'python' } = args;
    
    // Simulate code execution (in a real implementation, this would use a secure sandbox)
    console.log(`\n--- Executing ${language} code ---`);
    console.log(code);
    console.log('--- End code ---\n');
    
    // Simple simulation of common Python operations
    try {
      // Basic math operations
      if (code.includes('print(') && /\d+\s*[+\-*/]\s*\d+/.test(code)) {
        const mathMatch = code.match(/(\d+)\s*([+\-*/])\s*(\d+)/);
        if (mathMatch) {
          const [, a, op, b] = mathMatch;
          const num1 = parseInt(a);
          const num2 = parseInt(b);
          let result;
          switch (op) {
            case '+': result = num1 + num2; break;
            case '-': result = num1 - num2; break;
            case '*': result = num1 * num2; break;
            case '/': result = num2 !== 0 ? num1 / num2 : 'Error: Division by zero'; break;
            default: result = 'Unknown operation';
          }
          return {
            success: true,
            output: `${result}`,
            code,
            language,
            message: 'Code executed successfully (simulated)'
          };
        }
      }
      
      // List operations
      if (code.includes('[') && code.includes(']') && code.includes('print(')) {
        return {
          success: true,
          output: '[1, 2, 3, 4, 5]',
          code,
          language,
          message: 'List operation executed successfully (simulated)'
        };
      }
      
      // Default simulation
      return {
        success: true,
        output: 'Code executed successfully\n(This is a simulation - in a real implementation, this would execute in a secure Python environment)',
        code,
        language,
        message: 'Code execution completed (simulated)'
      };
      
    } catch (error) {
      return {
        success: false,
        error: 'Execution failed',
        code,
        language,
        message: 'Code execution failed (simulated error)'
      };
    }
  },
  {
    name: 'execute_code',
    parameters: {
      type: 'object',
      properties: {
        code: {
          type: 'string',
          description: 'Python code to execute'
        },
        language: {
          type: 'string',
          description: 'Programming language (currently only Python is supported)',
          enum: ['python'],
          default: 'python'
        }
      },
      required: ['code']
    }
  }
);

// File operations tool
const fileOperationsTool = createTool(
  async function fileOperations(params: { operation: string; path: string; content?: string }) {
    const { operation, path, content } = params;
    
    console.log(`\n--- File Operation: ${operation} on ${path} ---`);
    
    // Simulate file operations
    try {
      switch (operation) {
        case 'read':
          if (path.endsWith('.py')) {
            return {
              success: true,
              content: '# Sample Python file\nprint("Hello, World!")\n',
              path,
              operation,
              message: 'File read successfully (simulated)'
            };
          } else if (path.endsWith('.txt')) {
            return {
              success: true,
              content: 'This is a sample text file content.\nLine 2 of the file.\n',
              path,
              operation,
              message: 'File read successfully (simulated)'
            };
          } else {
            return {
              success: true,
              content: 'Generic file content',
              path,
              operation,
              message: 'File read successfully (simulated)'
            };
          }
          
        case 'write':
          return {
            success: true,
            path,
            content,
            operation,
            message: `File written successfully to ${path} (simulated)`
          };
          
        case 'list':
          return {
            success: true,
            files: ['file1.py', 'file2.txt', 'data.json', 'script.py'],
            path,
            operation,
            message: `Directory listing for ${path} (simulated)`
          };
          
        case 'create_directory':
          return {
            success: true,
            path,
            operation,
            message: `Directory created at ${path} (simulated)`
          };
          
        default:
          return {
            success: false,
            error: `Unknown operation: ${operation}`,
            path,
            operation,
            message: 'Operation failed'
          };
      }
    } catch (error) {
      return {
        success: false,
        error: 'File operation failed',
        path,
        operation,
        message: 'File operation failed (simulated error)'
      };
    }
  },
  {
    name: 'file_operations',
    description: 'Perform file operations like reading, writing, or listing files',
    parameters: {
      type: 'object',
      properties: {
        operation: {
          type: 'string',
          description: 'Type of file operation to perform',
          enum: ['read', 'write', 'list', 'create_directory']
        },
        path: {
          type: 'string',
          description: 'File or directory path'
        },
        content: {
          type: 'string',
          description: 'Content to write (only for write operations)'
        }
      },
      required: ['operation', 'path']
    }
  }
);

export const rootAgent = new Agent({
  model: 'gemini-2.0-flash-exp',
  name: 'Code Execution Assistant',
  description: 'An AI assistant that can execute code safely',
  instruction: `You are a helpful AI assistant that can execute code to help users with programming tasks.

You have access to a simulated code execution environment where you can:
- Run Python code (simulated)
- Perform calculations
- Process data
- Work with files
- Test algorithms

Always explain what you're going to do before executing code, and interpret the results for the user.
If there are errors, help debug and fix them.
Be helpful and educational in your responses.

Note: This is a demonstration environment with simulated code execution.`,
  tools: [codeExecutorTool, fileOperationsTool]
});