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
export declare class LlmResponseUtils {
    /**
     * Creates an LlmResponse from a GenerateContentResponse.
     *
     * @param generateContentResponse - The GenerateContentResponse to create the LlmResponse from.
     * @returns The LlmResponse.
     */
    static create(generateContentResponse: GenerateContentResponse): LlmResponse;
}
//# sourceMappingURL=llm-response.d.ts.map