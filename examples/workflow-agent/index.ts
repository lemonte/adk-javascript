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

import { InMemoryRunner } from '../../src';
import { 
  codeWriterAgent, 
  codeReviewerAgent, 
  codeRefactorerAgent,
  SequentialWorkflow
} from './agent';

async function runSequentialWorkflow(userRequest: string) {
  console.log('🔄 Starting Sequential Workflow...');
  console.log(`📝 User Request: ${userRequest}`);
  console.log('\n' + '='.repeat(60));
  
  const workflow = new SequentialWorkflow();
  
  try {
    // Step 1: Code Generation
    console.log('\n📝 STEP 1: Code Generation');
    console.log('Agent: CodeWriterAgent');
    console.log('Task: Generate initial Python code');
    console.log('-'.repeat(40));
    
    const codeRunner = new InMemoryRunner(codeWriterAgent, {
      maxIterations: 5,
      enableLogging: false
    });
    
    // Create session state and context for code generation
    const sessionState: any = {
      messages: [],
      metadata: {
        createdAt: new Date().toISOString(),
        step: 'code_generation'
      }
    };

    const context = {
      sessionId: 'workflow-session',
      userId: 'workflow-user',
      appName: 'workflow-app',
      agentName: 'CodeWriterAgent',
      requestId: 'workflow-request-1',
      timestamp: new Date(),
      metadata: {
        source: 'workflow-example'
      },
      agent: codeWriterAgent,
      session: {
        id: 'workflow-session',
        appName: 'workflow-app',
        userId: 'workflow-user',
        state: sessionState,
        events: [],
        lastUpdateTime: Date.now()
      },
      invocationId: 'workflow-invocation-1'
    };
    
    const message = {
      role: 'user' as const,
      parts: [{
        type: 'text' as const,
        text: userRequest
      }]
    };
    
    const codeResult = await codeRunner.run(message, sessionState, context);
    const generatedCode = codeResult.response.parts
      .filter(part => part.type === 'text')
      .map(part => (part as any).text)
      .join(' ');
    workflow.setState('generated_code', generatedCode);
    
    console.log('✅ Generated Code:');
    console.log(generatedCode);
    
    // Step 2: Code Review
    console.log('\n🔍 STEP 2: Code Review');
    console.log('Agent: CodeReviewerAgent');
    console.log('Task: Review the generated code');
    console.log('-'.repeat(40));
    
    const reviewRunner = new InMemoryRunner(codeReviewerAgent, {
      maxIterations: 5,
      enableLogging: false
    });
    
    const reviewPrompt = `Please review the following Python code:\n\n${generatedCode}`;
    const reviewMessage = {
      role: 'user' as const,
      parts: [{
        type: 'text' as const,
        text: reviewPrompt
      }]
    };
    
    const reviewSessionState: any = {
      messages: [],
      metadata: {
        createdAt: new Date().toISOString(),
        step: 'code_review'
      }
    };
    
    const reviewContext = {
      ...context,
      agentName: 'CodeReviewerAgent',
      requestId: 'workflow-request-2',
      agent: codeReviewerAgent,
      invocationId: 'workflow-invocation-2'
    };
    
    const reviewResult = await reviewRunner.run(reviewMessage, reviewSessionState, reviewContext);
    const reviewComments = reviewResult.response.parts
      .filter(part => part.type === 'text')
      .map(part => (part as any).text)
      .join(' ');
    workflow.setState('review_comments', reviewComments);
    
    console.log('✅ Review Comments:');
    console.log(reviewComments);
    
    // Step 3: Code Refactoring
    console.log('\n🔧 STEP 3: Code Refactoring');
    console.log('Agent: CodeRefactorerAgent');
    console.log('Task: Refactor code based on review feedback');
    console.log('-'.repeat(40));
    
    const refactorRunner = new InMemoryRunner(codeRefactorerAgent, {
      maxIterations: 5,
      enableLogging: false
    });
    
    const refactorPrompt = `Please refactor the following code based on the review comments:\n\n**Original Code:**\n${generatedCode}\n\n**Review Comments:**\n${reviewComments}`;
    const refactorMessage = {
      role: 'user' as const,
      parts: [{
        type: 'text' as const,
        text: refactorPrompt
      }]
    };
    
    const refactorSessionState: any = {
      messages: [],
      metadata: {
        createdAt: new Date().toISOString(),
        step: 'code_refactoring'
      }
    };
    
    const refactorContext = {
      ...context,
      agentName: 'CodeRefactorerAgent',
      requestId: 'workflow-request-3',
      agent: codeRefactorerAgent,
      invocationId: 'workflow-invocation-3'
    };
    
    const refactorResult = await refactorRunner.run(refactorMessage, refactorSessionState, refactorContext);
    const refactoredCode = refactorResult.response.parts
      .filter(part => part.type === 'text')
      .map(part => (part as any).text)
      .join(' ');
    workflow.setState('refactored_code', refactoredCode);
    
    console.log('✅ Refactored Code:');
    console.log(refactoredCode);
    
    // Final Summary
    console.log('\n' + '='.repeat(60));
    console.log('🎯 WORKFLOW SUMMARY');
    console.log('='.repeat(60));
    console.log('✅ Code Generation: Completed');
    console.log('✅ Code Review: Completed');
    console.log('✅ Code Refactoring: Completed');
    console.log('\n📊 Workflow State:');
    console.log(`- Generated Code Length: ${generatedCode.length} characters`);
    console.log(`- Review Comments Length: ${reviewComments.length} characters`);
    console.log(`- Refactored Code Length: ${refactoredCode.length} characters`);
    
    return {
      generatedCode,
      reviewComments,
      refactoredCode,
      workflow: workflow.getState()
    };
    
  } catch (error) {
    console.error('❌ Workflow Error:', error);
    throw error;
  }
}

async function main() {
  console.log('🚀 Sequential Workflow Agent Example');
  console.log('=====================================');
  console.log('\nThis example demonstrates a 3-step sequential workflow:');
  console.log('1. 📝 Code Generation - Generate initial Python code');
  console.log('2. 🔍 Code Review - Review and provide feedback');
  console.log('3. 🔧 Code Refactoring - Improve code based on feedback');
  console.log('');
  
  const startTime = Date.now();
  
  // Example requests to demonstrate the workflow
  const requests = [
    'Create a Python function that calculates the factorial of a number',
    'Write a Python class for a simple calculator with basic operations'
  ];
  
  for (let i = 0; i < requests.length; i++) {
    const request = requests[i];
    console.log(`\n🔄 WORKFLOW ${i + 1}/${requests.length}`);
    console.log('=' .repeat(60));
    
    try {
      await runSequentialWorkflow(request);
    } catch (error) {
      console.error(`❌ Failed to complete workflow ${i + 1}:`, error);
    }
    
    if (i < requests.length - 1) {
      console.log('\n' + '⏸️ '.repeat(20));
      console.log('Waiting before next workflow...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  const endTime = Date.now();
  console.log('\n' + '🏁 '.repeat(20));
  console.log('✨ All workflows completed!');
  console.log(`⏱️  Total execution time: ${(endTime - startTime) / 1000} seconds`);
  console.log('\n📝 Note: This example demonstrates sequential agent workflows.');
  console.log('   Each agent in the pipeline processes the output from the previous agent.');
}

if (require.main === module) {
  main().catch(console.error);
}