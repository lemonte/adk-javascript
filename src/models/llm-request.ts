/**
 * LLM Request implementation for the ADK JavaScript SDK
 */

import {
  Content,
  GenerationConfig,
  SafetySetting,
  ToolDefinition,
  ModelRequestConfig
} from '../types';

/**
 * LLM Request class that wraps ModelRequestConfig with additional functionality
 */
export class LlmRequest {
  public contents: Content[] = [];
  public model?: string;
  public config?: ModelRequestConfig;
  public systemInstruction?: string;
  public tools?: ToolDefinition[];
  public toolConfig?: any;
  public safetySettings?: SafetySetting[];
  public cachedContent?: string;
  private instructions: string[] = [];

  constructor() {
    this.contents = [];
    this.instructions = [];
  }

  /**
   * Append instructions to the request
   */
  appendInstructions(newInstructions: string[]): void {
    this.instructions.push(...newInstructions);
    
    // Update system instruction with combined instructions
    if (this.instructions.length > 0) {
      const combinedInstructions = this.instructions.join('\n');
      if (this.systemInstruction) {
        this.systemInstruction = `${this.systemInstruction}\n${combinedInstructions}`;
      } else {
        this.systemInstruction = combinedInstructions;
      }
    }
  }

  /**
   * Convert to ModelRequestConfig for use with models
   */
  toModelRequestConfig(): ModelRequestConfig {
    return {
      model: this.model || 'gemini-2.0-flash',
      messages: this.contents,
      tools: this.tools,
      toolChoice: this.toolConfig?.functionCallingConfig?.mode,
      generationConfig: this.config?.generationConfig,
      safetySettings: this.safetySettings,
      systemInstruction: this.systemInstruction
    };
  }
}