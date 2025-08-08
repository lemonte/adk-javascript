/**
 * Gemini model implementation for the ADK JavaScript SDK
 */
import { Content, ModelRequestConfig, ModelResponse, StreamingResponse } from '../types';
import { BaseModel, BaseModelConfig } from './base-model';
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
export declare class GeminiModel extends BaseModel {
    private readonly genAI;
    private readonly model;
    private readonly projectId?;
    private readonly location?;
    constructor(config?: GeminiModelConfig);
    private mapFinishReason;
    /**
     * Generate content using Gemini
     */
    generateContent(messages: Content[], config?: ModelRequestConfig): Promise<ModelResponse>;
    /**
     * Generate streaming content using Gemini
     */
    generateStreamingContent(messages: Content[], config?: ModelRequestConfig): AsyncGenerator<StreamingResponse, void, unknown>;
    /**
     * Count tokens in content
     */
    countTokens(content: Content[]): Promise<number>;
    /**
     * Convert ADK content format to Gemini format
     */
    private convertToGeminiFormat;
    /**
     * Convert Gemini response to ADK format
     */
    private convertFromGeminiResponse;
    /**
     * Convert ADK tools to Gemini format
     */
    private convertToolsToGeminiFormat;
    /**
     * Test the Gemini API connection
     */
    testConnection(): Promise<boolean>;
    /**
     * Get available Gemini models
     */
    static getAvailableModels(): string[];
}
//# sourceMappingURL=gemini-model.d.ts.map