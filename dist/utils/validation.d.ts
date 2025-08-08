/**
 * Validation utilities for the ADK JavaScript SDK
 */
import { AdkError, Content, ToolDefinition, GenerationConfig, SafetySetting } from '../types';
/**
 * Validation error class
 */
export declare class ValidationError extends AdkError {
    constructor(message: string, details?: Record<string, any>);
}
/**
 * Validate content structure
 */
export declare function validateContent(content: Content[]): void;
/**
 * Validate individual content part
 */
export declare function validateContentPart(part: any, context?: string): void;
/**
 * Validate tool definition
 */
export declare function validateToolDefinition(tool: ToolDefinition): void;
/**
 * Validate JSON schema (basic validation)
 */
export declare function validateJsonSchema(schema: any, context?: string): void;
/**
 * Validate generation config
 */
export declare function validateGenerationConfig(config: GenerationConfig): void;
/**
 * Validate safety settings
 */
export declare function validateSafetySettings(settings: SafetySetting[]): void;
/**
 * Validate session ID
 */
export declare function validateSessionId(sessionId: string): void;
/**
 * Validate user ID
 */
export declare function validateUserId(userId: string): void;
/**
 * Validate email address
 */
export declare function validateEmail(email: string): void;
/**
 * Validate URL
 */
export declare function validateUrl(url: string): void;
/**
 * Validate MIME type
 */
export declare function validateMimeType(mimeType: string, expectedPrefix?: string): void;
//# sourceMappingURL=validation.d.ts.map