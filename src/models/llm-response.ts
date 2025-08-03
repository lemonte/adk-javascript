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

import { Content, GroundingMetadata, GenerateContentResponse, UsageMetadata } from '@google/generative-ai';

/**
 * LLM response class that provides the first candidate response from the
 * model if available. Otherwise, returns error code and message.
 */
export interface LlmResponse {
  /**
   * The content of the response.
   */
  content?: Content;

  /**
   * The grounding metadata of the response.
   */
  groundingMetadata?: GroundingMetadata;

  /**
   * Indicates whether the text content is part of a unfinished text stream.
   * 
   * Only used for streaming mode and when the content is plain text.
   */
  partial?: boolean;

  /**
   * Indicates whether the response from the model is complete.
   * 
   * Only used for streaming mode.
   */
  turnComplete?: boolean;

  /**
   * Error code if the response is an error. Code varies by model.
   */
  errorCode?: string;

  /**
   * Error message if the response is an error.
   */
  errorMessage?: string;

  /**
   * Flag indicating that LLM was interrupted when generating the content.
   * Usually it's due to user interruption during a bidi streaming.
   */
  interrupted?: boolean;

  /**
   * The custom metadata of the LlmResponse.
   * 
   * An optional key-value pair to label an LlmResponse.
   * 
   * NOTE: the entire object must be JSON serializable.
   */
  customMetadata?: Record<string, any>;

  /**
   * The usage metadata of the LlmResponse
   */
  usageMetadata?: UsageMetadata;
}

/**
 * Utility functions for LlmResponse
 */
export class LlmResponseUtils {
  /**
   * Creates an LlmResponse from a GenerateContentResponse.
   * 
   * @param generateContentResponse - The GenerateContentResponse to create the LlmResponse from.
   * @returns The LlmResponse.
   */
  static create(generateContentResponse: GenerateContentResponse): LlmResponse {
    const usageMetadata = generateContentResponse.usageMetadata;
    
    if (generateContentResponse.candidates && generateContentResponse.candidates.length > 0) {
      const candidate = generateContentResponse.candidates[0];
      
      if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
        return {
          content: candidate.content,
          groundingMetadata: candidate.groundingMetadata,
          usageMetadata,
        };
      } else {
        return {
          errorCode: candidate.finishReason,
          errorMessage: candidate.finishMessage,
          usageMetadata,
        };
      }
    } else {
      if (generateContentResponse.promptFeedback) {
        const promptFeedback = generateContentResponse.promptFeedback;
        return {
          errorCode: promptFeedback.blockReason,
          errorMessage: promptFeedback.blockReasonMessage,
          usageMetadata,
        };
      } else {
        return {
          errorCode: 'UNKNOWN_ERROR',
          errorMessage: 'Unknown error.',
          usageMetadata,
        };
      }
    }
  }
}