"use strict";
/**
 * Gemini model implementation for the ADK JavaScript SDK
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeminiModel = void 0;
const types_1 = require("../types");
const base_model_1 = require("./base-model");
const generative_ai_1 = require("@google/generative-ai");
/**
 * Gemini model implementation
 */
class GeminiModel extends base_model_1.BaseModel {
    constructor(config = {}) {
        const modelName = config.modelName || 'gemini-2.0-flash';
        // Define Gemini capabilities
        const capabilities = {
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
        super({
            modelName,
            apiKey: config.apiKey || process.env.GOOGLE_API_KEY,
            baseUrl: config.baseUrl,
            timeout: config.timeout,
            retryAttempts: config.retryAttempts,
            retryDelay: config.retryDelay,
            defaultGenerationConfig: config.defaultGenerationConfig,
            defaultSafetySettings: config.defaultSafetySettings,
            metadata: config.metadata
        }, capabilities);
        if (!this.apiKey) {
            throw new types_1.ModelError('Google API key is required. Set GOOGLE_API_KEY environment variable or pass apiKey in config.');
        }
        this.projectId = config.projectId;
        this.location = config.location;
        this.genAI = new generative_ai_1.GoogleGenerativeAI(this.apiKey);
        this.model = this.genAI.getGenerativeModel({ model: modelName });
    }
    mapFinishReason(geminiReason) {
        if (!geminiReason)
            return 'stop';
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
    async generateContent(messages, config) {
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
                const generateContentRequest = {
                    contents: geminiMessages,
                    generationConfig: requestConfig.generationConfig,
                    safetySettings: requestConfig.safetySettings,
                    tools: requestConfig.tools
                };
                const result = await this.model.generateContent(generateContentRequest);
                const response = await result.response;
                const latency = Date.now() - startTime;
                // Extract token usage
                const tokenUsage = {
                    promptTokens: response.usageMetadata?.promptTokenCount || 0,
                    completionTokens: response.usageMetadata?.candidatesTokenCount || 0,
                    totalTokens: response.usageMetadata?.totalTokenCount || 0,
                    cachedTokens: response.usageMetadata?.cachedContentTokenCount
                };
                this.updateMetrics(latency, tokenUsage);
                this.emitEvent('generation_complete', { latency, tokenUsage });
                // Convert response
                const modelResponse = {
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
            }
            catch (error) {
                const latency = Date.now() - startTime;
                this.updateMetrics(latency, undefined, true);
                this.emitEvent('generation_error', { error, latency });
                if (error instanceof Error) {
                    throw new types_1.ModelError(`Gemini generation failed: ${error.message}`, { originalError: error.message, modelName: this.modelName });
                }
                throw error;
            }
        }, 'Gemini content generation');
    }
    /**
     * Generate streaming content using Gemini
     */
    async *generateStreamingContent(messages, config) {
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
            const tokenUsage = {
                promptTokens: 0, // Not available in streaming
                completionTokens: 0,
                totalTokens
            };
            this.updateMetrics(latency, tokenUsage);
            this.emitEvent('streaming_complete', { latency, tokenUsage });
        }
        catch (error) {
            const latency = Date.now() - startTime;
            this.updateMetrics(latency, undefined, true);
            this.emitEvent('streaming_error', { error, latency });
            if (error instanceof Error) {
                throw new types_1.ModelError(`Gemini streaming failed: ${error.message}`, { originalError: error.message, modelName: this.modelName });
            }
            throw error;
        }
    }
    /**
     * Count tokens in content
     */
    async countTokens(content) {
        try {
            const geminiMessages = this.convertToGeminiFormat(content);
            const result = await this.model.countTokens({ contents: geminiMessages });
            return result.totalTokens || 0;
        }
        catch (error) {
            this.logger.error('Token counting failed', error);
            throw new types_1.ModelError(`Token counting failed: ${error instanceof Error ? error.message : 'Unknown error'}`, { originalError: error, modelName: this.modelName });
        }
    }
    /**
     * Convert ADK content format to Gemini format
     */
    convertToGeminiFormat(messages) {
        return messages.map(message => ({
            role: message.role === 'assistant' ? 'model' : 'user',
            parts: message.parts.map(part => {
                switch (part.type) {
                    case 'text':
                        return { text: part.text };
                    case 'image':
                        const imagePart = part;
                        return {
                            inlineData: {
                                mimeType: imagePart.mimeType,
                                data: imagePart.data
                            }
                        };
                    case 'function_call':
                        const functionCallPart = part;
                        return {
                            functionCall: {
                                name: functionCallPart.functionCall.name,
                                args: functionCallPart.functionCall.args || {}
                            }
                        };
                    case 'function_response':
                        const functionResponsePart = part;
                        return {
                            functionResponse: {
                                name: functionResponsePart.functionResponse.name,
                                response: functionResponsePart.functionResponse.content || functionResponsePart.functionResponse.response
                            }
                        };
                    default:
                        throw new types_1.ModelError(`Unsupported part type: ${part.type}`);
                }
            })
        }));
    }
    /**
     * Convert Gemini response to ADK format
     */
    convertFromGeminiResponse(response) {
        const candidate = response.candidates?.[0];
        if (!candidate || !candidate.content) {
            throw new types_1.ModelError('Invalid Gemini response format');
        }
        return {
            role: 'assistant',
            parts: candidate.content.parts.map((part) => {
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
                throw new types_1.ModelError(`Unsupported response part type`);
            })
        };
    }
    /**
     * Convert ADK tools to Gemini format
     */
    convertToolsToGeminiFormat(tools) {
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
    async testConnection() {
        try {
            await this.generateContent([
                {
                    role: 'user',
                    parts: [{ type: 'text', text: 'Hello' }]
                }
            ]);
            return true;
        }
        catch (error) {
            this.logger.error('Gemini API connection test failed', error);
            return false;
        }
    }
    /**
     * Get available Gemini models
     */
    static getAvailableModels() {
        return [
            'gemini-2.0-flash',
            'gemini-1.5-pro',
            'gemini-1.5-flash',
            'gemini-1.0-pro'
        ];
    }
}
exports.GeminiModel = GeminiModel;
//# sourceMappingURL=gemini-model.js.map