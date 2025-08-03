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

// Simple function tool that simulates requiring human approval
const sensitiveDataTool = createTool(
  async (args: any) => {
    const { data_type, user_id } = args;
    
    // Simulate human approval process
    console.log(`\n🔐 HUMAN APPROVAL REQUIRED`);
    console.log(`Request: Access ${data_type} ${user_id ? `for user ${user_id}` : ''}`);
    console.log(`⏳ Waiting for human approval... (simulated)`);
    
    // Simulate approval delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulate approval (in real implementation, this would wait for actual human input)
    const approved = Math.random() > 0.3; // 70% approval rate for demo
    
    if (approved) {
      console.log(`✅ APPROVED: Access granted to ${data_type}`);
      return {
        success: true,
        data_type,
        user_id,
        data: `[REDACTED] Sample ${data_type} data`,
        approval_status: 'approved',
        message: `Access to ${data_type} has been approved and data retrieved`
      };
    } else {
      console.log(`❌ DENIED: Access denied to ${data_type}`);
      return {
        success: false,
        data_type,
        user_id,
        approval_status: 'denied',
        message: `Access to ${data_type} has been denied by human reviewer`
      };
    }
  },
  {
    name: 'access_sensitive_data',
    description: 'Access sensitive user data (requires human approval)',
    parameters: {
      type: 'object',
      properties: {
        data_type: {
          type: 'string',
          description: 'Type of sensitive data to access',
          enum: ['personal_info', 'financial_data', 'medical_records', 'private_messages']
        },
        user_id: {
          type: 'string',
          description: 'ID of the user whose data to access'
        }
      },
      required: ['data_type']
    }
  }
);

// Long-running tool that processes data
const longRunningTool = createTool(
  async (args: any) => {
    const { dataset_name, operation } = args;
    
    console.log(`\n📊 Starting ${operation} operation on dataset: ${dataset_name}`);
    console.log(`⏳ This is a long-running operation...`);
    
    // Simulate processing steps
    const steps = [
      'Loading dataset...',
      'Validating data integrity...',
      'Processing records...',
      'Applying transformations...',
      'Generating results...'
    ];
    
    for (let i = 0; i < steps.length; i++) {
      console.log(`   ${i + 1}/5: ${steps[i]}`);
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate work
    }
    
    const results = {
      dataset_name,
      operation,
      records_processed: Math.floor(Math.random() * 10000) + 1000,
      processing_time: `${(steps.length * 0.8).toFixed(1)}s`,
      status: 'completed',
      output_file: `${dataset_name}_${operation}_${Date.now()}.json`
    };
    
    console.log(`✅ ${operation} operation completed successfully!`);
    console.log(`   Processed ${results.records_processed} records in ${results.processing_time}`);
    
    return results;
   },
   {
     name: 'process_large_dataset',
     description: 'Process a large dataset (simulates long-running operation)',
     parameters: {
       type: 'object',
       properties: {
         dataset_name: {
           type: 'string',
           description: 'Name of the dataset to process'
         },
         operation: {
           type: 'string',
           description: 'Type of operation to perform',
           enum: ['analyze', 'transform', 'validate', 'export']
         }
       },
       required: ['dataset_name', 'operation']
     }
   }
 );

// Simple calculation tool
const calculatorTool = createTool(
  async (args: any) => {
    const { expression } = args;
    
    try {
      // Simple expression evaluator (in production, use a proper math library)
      // This is a basic implementation for demo purposes
      const sanitized = expression.replace(/[^0-9+\-*/().\s]/g, '');
      const result = Function(`"use strict"; return (${sanitized})`)();
      
      return {
        success: true,
        expression,
        result,
        message: `Calculated: ${expression} = ${result}`
      };
    } catch (error) {
      return {
        success: false,
        expression,
        error: 'Invalid mathematical expression',
        message: `Could not evaluate expression: ${expression}`
      };
     }
   },
   {
     name: 'calculate',
     description: 'Perform mathematical calculations',
     parameters: {
       type: 'object',
       properties: {
         expression: {
           type: 'string',
           description: 'Mathematical expression to evaluate (e.g., "2 + 3 * 4")'
         }
       },
       required: ['expression']
     }
   }
 );

export const rootAgent = new Agent({
  model: 'gemini-2.0-flash-exp',
  name: 'Human-in-Loop Assistant',
  description: 'An AI assistant that demonstrates human-in-the-loop workflows',
  instruction: `You are a helpful AI assistant that can:
1. Access sensitive data (simulates requiring human approval)
2. Process large datasets (simulates long-running operations)
3. Perform mathematical calculations

When accessing sensitive data, always explain why you need the data.
For data processing operations, explain what the process involves.
Be helpful and explain what you're doing at each step.`,
  tools: [sensitiveDataTool, longRunningTool, calculatorTool]
});