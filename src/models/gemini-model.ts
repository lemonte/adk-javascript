/**
 * Gemini model implementation for the ADK JavaScript SDK
 */

import {
  Content,
  GenerationConfig,
  SafetySetting,
  ModelRequestConfig,
  ModelResponse,
  ModelError,
  ToolDefinition,
  FunctionCall,
  StreamingResponse,
  TextPart,
  ImagePart
} from '../types';
import { BaseModel, BaseModelConfig, ModelCapabilities, TokenUsage } from './base-model';
import { GoogleGenerativeAI, GenerativeModel, Part } from '@google/generative-ai';

/**
 * Gemini model configuration
 */
export interface GeminiModelConfig extends Omit<BaseModelConfig, 'modelName'> {
  modelName?: string;
  projectId?: string;
  location?: string;
}

/**
 * Gemini model implementation
 */
export class GeminiModel extends BaseModel {
  private readonly genAI: GoogleGenerativeAI;
  private readonly model: GenerativeModel;
  private readonly projectId?: string;
  private readonly location?: string;

  constructor(config: GeminiModelConfig = {}) {
    const modelName = config.modelName || 'gemini-2.0-flash';
    
    // Define Gemini capabilities
    const capabilities: ModelCapabilities = {
      supportsStreaming: true,
      supportsTools: true,
      supportsImages: true,
      supportsAudio: true,
      supportsVideo: true,
      supportsSystemInstructions: true,
      maxTokens: 2097152, // 2M tokens for Gemini 2.0
      maxInputTokens: 1048576, // 1M input tokens
      maxOutputTokens: 8192, // 8K output tokens
      supportedMimeTypes: [
        'image/png',
        'image/jpeg',
        'image/webp',
        'image/heic',
        'image/heif',
        'audio/wav',
        'audio/mp3',
        'audio/aiff',
        'audio/aac',
        'audio/ogg',
        'audio/flac',
        'video/mp4',
        'video/mpeg',
        'video/mov',
        'video/avi',
        'video/x-flv',
        'video/mpg',
        'video/webm',
        'video/wmv',
        'video/3gpp'
      ]
    };

      super(
      {
        modelName,
        apiKey: config.apiKey || process.env.GOOGLE_API_KEY,
        baseUrl: config.baseUrl,
        timeout: config.timeout,
        retryAttempts: config.retryAttempts,
        retryDelay: config.retryDelay,
        defaultGenerationConfig: config.defaultGenerationConfig,
        defaultSafetySettings: config.defaultSafetySettings,
        metadata: config.metadata
      },
      capabilities
    );

    if (!this.apiKey) {
      throw new ModelError(
        'Google API key is required. Set GOOGLE_API_KEY environment variable or pass apiKey in config.'
      );
    }

    this.projectId = config.projectId;
    this.location = config.location;
    this.genAI = new GoogleGenerativeAI(this.apiKey);
    this.model = this.genAI.getGenerativeModel({ model: modelName });
  }

  private mapFinishReason(geminiReason: any): 'stop' | 'length' | 'tool_calls' | 'content_filter' | undefined {
     if (!geminiReason) return 'stop';
     
     switch (geminiReason) {
       case 'STOP':
         return 'stop';
       case 'MAX_TOKENS':
         return 'length';
       case 'SAFETY':
         return 'content_filter';
       default:
         return 'stop';
     }
   }
  /**
   * Generate content using Gemini
   */
  async generateContent(
    messages: Content[],
    config?: ModelRequestConfig
  ): Promise<ModelResponse> {
    return this.executeWithRetry(async () => {
      const startTime = Date.now();
      
      try {
        this.validateContent(messages);
        this.validateTools(config?.tools);

        // Convert messages to Gemini format
        const geminiMessages = this.convertToGeminiFormat(messages);
        
        // Prepare request configuration
        const requestConfig = {
          generationConfig: this.mergeGenerationConfig(config?.generationConfig),
          safetySettings: this.mergeSafetySettings(config?.safetySettings),
          tools: config?.tools ? this.convertToolsToGeminiFormat(config.tools) : undefined
        };

        // Generate content - create proper GenerateContentRequest
        const generateContentRequest: any = {
          contents: geminiMessages,
          generationConfig: requestConfig.generationConfig,
          safetySettings: requestConfig.safetySettings,
          tools: requestConfig.tools
        };
        
        const result = await this.model.generateContent(generateContentRequest);

        const response = await result.response;
        const latency = Date.now() - startTime;

        // Extract token usage
        const tokenUsage: TokenUsage = {
          promptTokens: response.usageMetadata?.promptTokenCount || 0,
          completionTokens: response.usageMetadata?.candidatesTokenCount || 0,
          totalTokens: response.usageMetadata?.totalTokenCount || 0,
          cachedTokens: response.usageMetadata?.cachedContentTokenCount
        };

        this.updateMetrics(latency, tokenUsage);
        this.emitEvent('generation_complete', { latency, tokenUsage });

        // Convert response
        const modelResponse: ModelResponse = {
          content: this.convertFromGeminiResponse(response),
          usage: tokenUsage,
          finishReason: this.mapFinishReason(response.candidates?.[0]?.finishReason) || 'stop',
          metadata: {
            modelName: this.modelName,
            latency,
            safetyRatings: response.candidates?.[0]?.safetyRatings
          }
        };

        return modelResponse;
      } catch (error) {
        const latency = Date.now() - startTime;
        this.updateMetrics(latency, undefined, true);
        this.emitEvent('generation_error', { error, latency });
        
        if (error instanceof Error) {
          throw new ModelError(
            `Gemini generation failed: ${error.message}`,
            { originalError: error.message, modelName: this.modelName }
          );
        }
        throw error;
      }
    }, 'Gemini content generation');
  }

  /**
   * Generate streaming content using Gemini
   */
  async* generateStreamingContent(
    messages: Content[],
    config?: ModelRequestConfig
  ): AsyncGenerator<StreamingResponse, void, unknown> {
    const startTime = Date.now();
    
    try {
      this.validateContent(messages);
      this.validateTools(config?.tools);

      // Convert messages to Gemini format
      const geminiMessages = this.convertToGeminiFormat(messages);
      
      // Prepare request configuration
      const requestConfig = {
        generationConfig: this.mergeGenerationConfig(config?.generationConfig),
        safetySettings: this.mergeSafetySettings(config?.safetySettings),
        tools: config?.tools ? this.convertToolsToGeminiFormat(config.tools) : undefined
      };

      // Generate streaming content
      const result = await this.model.generateContentStream(geminiMessages);

      let totalTokens = 0;
      
      for await (const chunk of result.stream) {
        const response = chunk;
        
        if (response.candidates && response.candidates.length > 0) {
          const candidate = response.candidates[0];
          
          if (candidate.content && candidate.content.parts) {
            for (const part of candidate.content.parts) {
              if (part.text) {
                yield {
                  content: (typeof chunk.text === 'function' ? chunk.text() : chunk.text) || '',
                  done: false,
                  metadata: {
                    modelName: this.modelName,
                    finishReason: undefined
                  }
                };
              }
              
              if (part.functionCall) {
                yield {
                  toolCalls: [{
                     name: part.functionCall.name,
                     arguments: part.functionCall.args || {}
                   }],
                   done: false,
                  metadata: {
                    modelName: this.modelName
                  }
                };
              }
            }
          }
        }
        
        // Update token count if available
        if (response.usageMetadata?.totalTokenCount) {
          totalTokens = response.usageMetadata.totalTokenCount;
        }
      }

      // Final metrics update
      const latency = Date.now() - startTime;
      const tokenUsage: TokenUsage = {
        promptTokens: 0, // Not available in streaming
        completionTokens: 0,
        totalTokens
      };
      
      this.updateMetrics(latency, tokenUsage);
      this.emitEvent('streaming_complete', { latency, tokenUsage });
      
    } catch (error) {
      const latency = Date.now() - startTime;
      this.updateMetrics(latency, undefined, true);
      this.emitEvent('streaming_error', { error, latency });
      
      if (error instanceof Error) {
        throw new ModelError(
          `Gemini streaming failed: ${error.message}`,
          { originalError: error.message, modelName: this.modelName }
        );
      }
      throw error;
    }
  }

  /**
   * Count tokens in content
   */
  async countTokens(content: Content[]): Promise<number> {
    try {
      const geminiMessages = this.convertToGeminiFormat(content);
      const result = await this.model.countTokens({ contents: geminiMessages });
      return result.totalTokens || 0;
    } catch (error) {
      this.logger.error('Token counting failed', error);
      throw new ModelError(
        `Token counting failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        { originalError: error, modelName: this.modelName }
      );
    }
  }

  /**
   * Convert ADK content format to Gemini format
   */
  private convertToGeminiFormat(messages: Content[]): any[] {
    return messages.map(message => ({
      role: message.role === 'assistant' ? 'model' : 'user',
      parts: message.parts.map(part => {
        switch (part.type) {
          case 'text':
            return { text: (part as TextPart).text };
          case 'image':
            const imagePart = part as ImagePart;
            return {
              inlineData: {
                mimeType: (imagePart as any).mimeType,
                data: (imagePart as any).data
              }
            };
          case 'function_call':
            const functionCallPart = part as any;
            return {
              functionCall: {
                name: functionCallPart.functionCall.name,
                args: functionCallPart.functionCall.args || {}
              }
            };
          case 'function_response':
            const functionResponsePart = part as any;
            return {
              functionResponse: {
                name: functionResponsePart.functionResponse.name,
                response: functionResponsePart.functionResponse.content || functionResponsePart.functionResponse.response
              }
            };
          default:
            throw new ModelError(`Unsupported part type: ${part.type}`);
        }
      })
    }));
  }

  /**
   * Convert Gemini response to ADK format
   */
  private convertFromGeminiResponse(response: any): Content {
    const candidate = response.candidates?.[0];
    if (!candidate || !candidate.content) {
      throw new ModelError('Invalid Gemini response format');
    }

    return {
      role: 'assistant',
      parts: candidate.content.parts.map((part: any) => {
        if (part.text) {
          return { type: 'text', text: part.text };
        }
        if (part.functionCall) {
          return {
            type: 'function_call',
            functionCall: {
              name: part.functionCall.name,
              args: part.functionCall.args || {}
            }
          };
        }
        throw new ModelError(`Unsupported response part type`);
      })
    };
  }

  /**
   * Convert ADK tools to Gemini format
   */
  private convertToolsToGeminiFormat(tools: ToolDefinition[]): any[] {
    return tools.map(tool => ({
      functionDeclarations: [{
        name: tool.function.name,
        description: tool.function.description,
        parameters: tool.function.parameters
      }]
    }));
  }

  /**
   * Test the Gemini API connection
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.generateContent([
        {
          role: 'user',
          parts: [{ type: 'text', text: 'Hello' }]
        }
      ]);
      return true;
    } catch (error) {
      this.logger.error('Gemini API connection test failed', error);
      return false;
    }
  }

  /**
   * Get available Gemini models
   */
  static getAvailableModels(): string[] {
    return [
      'gemini-2.0-flash',
      'gemini-1.5-pro',
      'gemini-1.5-flash',
      'gemini-1.0-pro'
    ];
  }
}