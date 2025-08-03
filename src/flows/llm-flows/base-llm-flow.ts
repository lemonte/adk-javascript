// Copyright 2025 Google LLC
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

/**
 * Base LLM Flow implementation.
 */

import { InvocationContext, Content, ModelResponse } from '../../types';
import { Event, EventType } from '../../events/index';
import { EventUtils } from '../../events/event';
import { LlmRequest } from '../../models/llm-request';
import { LlmResponse } from '../../models/llm-response';
import { BaseLlmRequestProcessor, BaseLlmResponseProcessor } from './base-llm-processor';
import { LlmAgent } from '../../agents/llm-agent';
import { BaseModel } from '../../models/index';
import { Content as GoogleContent, Part } from '@google/generative-ai';

const ADK_AGENT_NAME_LABEL_KEY = 'adk_agent_name';

/**
 * A basic flow that calls the LLM in a loop until a final response is generated.
 * 
 * This flow ends when it transfer to another agent.
 */
export abstract class BaseLlmFlow {
  protected requestProcessors: BaseLlmRequestProcessor[] = [];
  protected responseProcessors: BaseLlmResponseProcessor[] = [];

  constructor() {
    this.requestProcessors = [];
    this.responseProcessors = [];
  }

  /**
   * Runs the flow using live api.
   */
  async *runLive(
    invocationContext: InvocationContext
  ): AsyncGenerator<Event, void, unknown> {
    const llmRequest = new LlmRequest();
    const eventId = EventUtils.newId();

    // Preprocess before calling the LLM
    for await (const event of this.preprocessAsync(invocationContext, llmRequest)) {
      yield event;
    }
    
    if (invocationContext.endInvocation) {
      return;
    }

    const llm = this.getLlm(invocationContext);
    console.debug(
      `Establishing live connection for agent: ${invocationContext.agent.name} with llm request:`,
      llmRequest
    );

    // TODO: Implement live connection logic
    // This is a simplified version - full implementation would handle live streaming
    try {
      const response = await llm.generateContent(llmRequest.contents);
      const responseEvent: Event = {
        type: EventType.MODEL_RESPONSE,
        timestamp: new Date(),
        context: invocationContext,
        response
      };
      
      yield responseEvent;
      
      // Post-process the response
      // Convert ModelResponse to LlmResponse
      const llmResponse: LlmResponse = {
        content: response.content ? this.convertContent(response.content) : undefined,
        errorCode: undefined,
        errorMessage: undefined,
        partial: false,
        turnComplete: true
      };
      
      for await (const event of this.postprocessAsync(invocationContext, llmResponse)) {
        yield event;
      }
    } catch (error) {
      console.error('Error in LLM flow:', error);
      const errorEvent: Event = {
        type: EventType.ERROR,
        timestamp: new Date(),
        context: invocationContext,
        error: error instanceof Error ? error : new Error(String(error))
      };
      yield errorEvent;
    }
  }

  /**
   * Runs the flow using async api.
   */
  async runAsync(
    invocationContext: InvocationContext
  ): Promise<Event> {
    const llmRequest = new LlmRequest();

    // Preprocess before calling the LLM
    for await (const event of this.preprocessAsync(invocationContext, llmRequest)) {
      // Handle preprocessing events if needed
    }
    
    if (invocationContext.endInvocation) {
      throw new Error('Invocation ended during preprocessing');
    }

    const llm = this.getLlm(invocationContext);
    
    try {
      const response = await llm.generateContent(llmRequest.contents);
      
      // Convert ModelResponse to LlmResponse
      const llmResponse: LlmResponse = {
        content: response.content ? this.convertContent(response.content) : undefined,
        errorCode: undefined,
        errorMessage: undefined,
        partial: false,
        turnComplete: true
      };
      
      // Post-process the response
      for await (const event of this.postprocessAsync(invocationContext, llmResponse)) {
        // Handle postprocessing events if needed
      }
      
      return {
        type: EventType.MODEL_RESPONSE,
        timestamp: new Date(),
        context: invocationContext,
        response
      };
    } catch (error) {
      throw new Error(`Error in LLM flow: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Preprocesses the request before calling the LLM.
   */
  protected async *preprocessAsync(
    invocationContext: InvocationContext,
    llmRequest: LlmRequest
  ): AsyncGenerator<Event, void, unknown> {
    for (const processor of this.requestProcessors) {
      for await (const event of processor.runAsync(invocationContext, llmRequest)) {
        yield event;
      }
    }
  }

  /**
   * Postprocesses the response after calling the LLM.
   */
  protected async *postprocessAsync(
    invocationContext: InvocationContext,
    llmResponse: LlmResponse
  ): AsyncGenerator<Event, void, unknown> {
    for (const processor of this.responseProcessors) {
      for await (const event of processor.runAsync(invocationContext, llmResponse)) {
        yield event;
      }
    }
  }

  /**
   * Gets the LLM instance from the invocation context.
   */
  private getLlm(invocationContext: InvocationContext): BaseModel {
    const agent = invocationContext.agent;
    if (!(agent instanceof LlmAgent)) {
      throw new Error('Agent must be an LlmAgent');
    }
    return agent.model;
  }

  /**
    * Converts internal Content to Google AI Content format.
    */
   private convertContent(content: Content): GoogleContent {
     return {
       role: content.role as any,
       parts: content.parts.map(part => {
         if (part.type === 'text') {
           return { text: part.text };
         }
         // For other part types, return as-is for now
         return part as any;
       })
     };
   }
}