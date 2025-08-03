/**
 * Base model implementation for the ADK JavaScript SDK
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
  StreamingResponse
} from '../types';
import { Logger } from '../utils';
import { EventEmitter } from 'events';

/**
 * Base model configuration
 */
export interface BaseModelConfig {
  modelName: string;
  apiKey?: string;
  baseUrl?: string;
  timeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
  defaultGenerationConfig?: GenerationConfig;
  defaultSafetySettings?: SafetySetting[];
  metadata?: Record<string, any>;
}

/**
 * Model capabilities
 */
export interface ModelCapabilities {
  supportsStreaming: boolean;
  supportsTools: boolean;
  supportsImages: boolean;
  supportsAudio: boolean;
  supportsVideo: boolean;
  supportsSystemInstructions: boolean;
  maxTokens?: number;
  maxInputTokens?: number;
  maxOutputTokens?: number;
  supportedMimeTypes?: string[];
}

/**
 * Token usage information
 */
export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  cachedTokens?: number;
}

/**
 * Model metrics
 */
export interface ModelMetrics {
  requestCount: number;
  totalTokensUsed: number;
  averageLatency: number;
  errorCount: number;
  lastRequestTime?: Date;
}

/**
 * Abstract base class for all models in the ADK
 */
export abstract class BaseModel extends EventEmitter {
  public readonly modelName: string;
  public readonly capabilities: ModelCapabilities;
  protected readonly apiKey?: string;
  protected readonly baseUrl?: string;
  protected readonly timeout: number;
  protected readonly retryAttempts: number;
  protected readonly retryDelay: number;
  protected readonly defaultGenerationConfig?: GenerationConfig;
  protected readonly defaultSafetySettings?: SafetySetting[];
  protected readonly metadata: Record<string, any>;
  protected readonly logger: Logger;
  protected metrics: ModelMetrics;

  constructor(config: BaseModelConfig, capabilities: ModelCapabilities) {
    super();
    
    this.modelName = config.modelName;
    this.capabilities = capabilities;
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl;
    this.timeout = config.timeout || 60000; // 60 seconds
    this.retryAttempts = config.retryAttempts || 3;
    this.retryDelay = config.retryDelay || 1000; // 1 second
    this.defaultGenerationConfig = config.defaultGenerationConfig;
    this.defaultSafetySettings = config.defaultSafetySettings;
    this.metadata = config.metadata || {};
    this.logger = new Logger(`Model:${this.modelName}`);
    
    this.metrics = {
      requestCount: 0,
      totalTokensUsed: 0,
      averageLatency: 0,
      errorCount: 0
    };

    this.validateConfig();
  }

  /**
   * Generate content from the model
   */
  abstract generateContent(
    messages: Content[],
    config?: ModelRequestConfig
  ): Promise<ModelResponse>;

  /**
   * Generate streaming content from the model
   */
  abstract generateStreamingContent(
    messages: Content[],
    config?: ModelRequestConfig
  ): AsyncGenerator<StreamingResponse, void, unknown>;

  /**
   * Count tokens in content
   */
  abstract countTokens(content: Content[]): Promise<number>;

  /**
   * Get model information
   */
  getInfo(): {
    modelName: string;
    capabilities: ModelCapabilities;
    metrics: ModelMetrics;
    metadata: Record<string, any>;
  } {
    return {
      modelName: this.modelName,
      capabilities: this.capabilities,
      metrics: { ...this.metrics },
      metadata: { ...this.metadata }
    };
  }

  /**
   * Get model metrics
   */
  getMetrics(): ModelMetrics {
    return { ...this.metrics };
  }

  /**
   * Reset model metrics
   */
  resetMetrics(): void {
    this.metrics = {
      requestCount: 0,
      totalTokensUsed: 0,
      averageLatency: 0,
      errorCount: 0
    };
  }

  /**
   * Check if model supports a capability
   */
  supports(capability: keyof ModelCapabilities): boolean {
    return !!this.capabilities[capability];
  }

  /**
   * Validate model configuration
   */
  protected validateConfig(): void {
    if (!this.modelName || this.modelName.trim() === '') {
      throw new ModelError('Model name is required');
    }

    if (this.timeout <= 0) {
      throw new ModelError('Timeout must be positive');
    }

    if (this.retryAttempts < 0) {
      throw new ModelError('Retry attempts must be non-negative');
    }

    if (this.retryDelay < 0) {
      throw new ModelError('Retry delay must be non-negative');
    }
  }

  /**
   * Validate content for model compatibility
   */
  protected validateContent(content: Content[]): void {
    for (const message of content) {
      if (!message.parts || message.parts.length === 0) {
        throw new ModelError('Message must have at least one part');
      }

      for (const part of message.parts) {
        if (part.type === 'image' && !this.capabilities.supportsImages) {
          throw new ModelError('Model does not support image content');
        }
        if (part.type === 'audio' && !this.capabilities.supportsAudio) {
          throw new ModelError('Model does not support audio content');
        }
        if (part.type === 'video' && !this.capabilities.supportsVideo) {
          throw new ModelError('Model does not support video content');
        }
      }
    }
  }

  /**
   * Validate tools for model compatibility
   */
  protected validateTools(tools?: ToolDefinition[]): void {
    if (tools && tools.length > 0 && !this.capabilities.supportsTools) {
      throw new ModelError('Model does not support tools');
    }
  }

  /**
   * Merge generation config with defaults
   */
  protected mergeGenerationConfig(config?: GenerationConfig): GenerationConfig | undefined {
    if (!this.defaultGenerationConfig && !config) {
      return undefined;
    }

    return {
      ...this.defaultGenerationConfig,
      ...config
    };
  }

  /**
   * Merge safety settings with defaults
   */
  protected mergeSafetySettings(settings?: SafetySetting[]): SafetySetting[] | undefined {
    if (!this.defaultSafetySettings && !settings) {
      return undefined;
    }

    if (!this.defaultSafetySettings) {
      return settings;
    }

    if (!settings) {
      return this.defaultSafetySettings;
    }

    // Merge settings, with provided settings taking precedence
    const merged = [...this.defaultSafetySettings];
    for (const setting of settings) {
      const existingIndex = merged.findIndex(s => s.category === setting.category);
      if (existingIndex >= 0) {
        merged[existingIndex] = setting;
      } else {
        merged.push(setting);
      }
    }

    return merged;
  }

  /**
   * Update metrics after a request
   */
  protected updateMetrics(latency: number, tokenUsage?: TokenUsage, error?: boolean): void {
    this.metrics.requestCount++;
    this.metrics.lastRequestTime = new Date();

    if (error) {
      this.metrics.errorCount++;
    }

    if (tokenUsage) {
      this.metrics.totalTokensUsed += tokenUsage.totalTokens;
    }

    // Update average latency
    this.metrics.averageLatency = 
      (this.metrics.averageLatency * (this.metrics.requestCount - 1) + latency) / 
      this.metrics.requestCount;
  }

  /**
   * Execute with retry logic
   */
  protected async executeWithRetry<T>(
    operation: () => Promise<T>,
    context?: string
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 0; attempt <= this.retryAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === this.retryAttempts) {
          break; // Last attempt, don't retry
        }

        // Check if error is retryable
        if (!this.isRetryableError(error)) {
          break;
        }

        const delay = this.retryDelay * Math.pow(2, attempt); // Exponential backoff
        this.logger.warn(
          `${context || 'Operation'} failed (attempt ${attempt + 1}/${this.retryAttempts + 1}), retrying in ${delay}ms`,
          error
        );
        
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError!;
  }

  /**
   * Check if an error is retryable
   */
  protected isRetryableError(error: any): boolean {
    if (error instanceof ModelError) {
      // Don't retry client errors (4xx)
      return false;
    }

    // Retry network errors, timeouts, and server errors (5xx)
    return true;
  }

  /**
   * Emit model events
   */
  protected emitEvent(event: string, data: any): void {
    this.emit(event, {
      modelName: this.modelName,
      timestamp: new Date(),
      ...data
    });
  }
}