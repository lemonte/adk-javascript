/**
 * LLM Request implementation for the ADK JavaScript SDK
 */
import { Content, SafetySetting, ToolDefinition, ModelRequestConfig } from '../types';
/**
 * LLM Request class that wraps ModelRequestConfig with additional functionality
 */
export declare class LlmRequest {
    contents: Content[];
    model?: string;
    config?: ModelRequestConfig;
    systemInstruction?: string;
    tools?: ToolDefinition[];
    toolConfig?: any;
    safetySettings?: SafetySetting[];
    cachedContent?: string;
    private instructions;
    constructor();
    /**
     * Append instructions to the request
     */
    appendInstructions(newInstructions: string[]): void;
    /**
     * Convert to ModelRequestConfig for use with models
     */
    toModelRequestConfig(): ModelRequestConfig;
}
//# sourceMappingURL=llm-request.d.ts.map