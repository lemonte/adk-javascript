/**
 * Base model implementation for the ADK JavaScript SDK
 */
import { Content, GenerationConfig, SafetySetting, ModelRequestConfig, ModelResponse, ToolDefinition, StreamingResponse } from '../types';
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
export declare abstract class BaseModel extends EventEmitter {
    readonly modelName: string;
    readonly capabilities: ModelCapabilities;
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
    constructor(config: BaseModelConfig, capabilities: ModelCapabilities);
    /**
     * Generate content from the model
     */
    abstract generateContent(messages: Content[], config?: ModelRequestConfig): Promise<ModelResponse>;
    /**
     * Generate streaming content from the model
     */
    abstract generateStreamingContent(messages: Content[], config?: ModelRequestConfig): AsyncGenerator<StreamingResponse, void, unknown>;
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
    };
    /**
     * Get model metrics
     */
    getMetrics(): ModelMetrics;
    /**
     * Reset model metrics
     */
    resetMetrics(): void;
    /**
     * Check if model supports a capability
     */
    supports(capability: keyof ModelCapabilities): boolean;
    /**
     * Validate model configuration
     */
    protected validateConfig(): void;
    /**
     * Validate content for model compatibility
     */
    protected validateContent(content: Content[]): void;
    /**
     * Validate tools for model compatibility
     */
    protected validateTools(tools?: ToolDefinition[]): void;
    /**
     * Merge generation config with defaults
     */
    protected mergeGenerationConfig(config?: GenerationConfig): GenerationConfig | undefined;
    /**
     * Merge safety settings with defaults
     */
    protected mergeSafetySettings(settings?: SafetySetting[]): SafetySetting[] | undefined;
    /**
     * Update metrics after a request
     */
    protected updateMetrics(latency: number, tokenUsage?: TokenUsage, error?: boolean): void;
    /**
     * Execute with retry logic
     */
    protected executeWithRetry<T>(operation: () => Promise<T>, context?: string): Promise<T>;
    /**
     * Check if an error is retryable
     */
    protected isRetryableError(error: any): boolean;
    /**
     * Emit model events
     */
    protected emitEvent(event: string, data: any): void;
}
//# sourceMappingURL=base-model.d.ts.map