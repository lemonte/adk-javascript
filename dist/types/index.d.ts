/**
 * Core types and interfaces for the ADK JavaScript SDK
 */
/**
 * Content part types
 */
export interface TextPart {
    type: 'text';
    text: string;
}
export interface ImagePart {
    type: 'image';
    imageUrl: {
        url: string;
        detail?: 'low' | 'high' | 'auto';
    };
}
export interface AudioPart {
    type: 'audio';
    audioUrl: {
        url: string;
    };
}
export interface VideoPart {
    type: 'video';
    videoUrl: {
        url: string;
    };
}
export interface FunctionCallPart {
    type: 'function_call';
    functionCall: FunctionCall;
}
export interface FunctionResponsePart {
    type: 'function_response';
    functionResponse: FunctionResponse;
}
export type ContentPart = TextPart | ImagePart | AudioPart | VideoPart | FunctionCallPart | FunctionResponsePart;
/**
 * Message content
 */
export interface Content {
    role: 'user' | 'assistant' | 'system' | 'tool';
    parts: ContentPart[];
    metadata?: Record<string, any>;
}
/**
 * Tool function call
 */
export interface FunctionCall {
    name: string;
    arguments: Record<string, any>;
    id?: string;
}
/**
 * Tool function response
 */
export interface FunctionResponse {
    name: string;
    content: string;
    id?: string;
    error?: string;
}
/**
 * Tool definition
 */
export interface ToolDefinition {
    type: 'function';
    function: {
        name: string;
        description: string;
        parameters: {
            type: 'object';
            properties: Record<string, any>;
            required?: string[];
        };
    };
}
/**
 * Model generation configuration
 */
export interface GenerationConfig {
    temperature?: number;
    topP?: number;
    topK?: number;
    maxOutputTokens?: number;
    stopSequences?: string[];
    candidateCount?: number;
    presencePenalty?: number;
    frequencyPenalty?: number;
}
/**
 * Safety settings
 */
export interface SafetySetting {
    category: string;
    threshold: string;
}
/**
 * Model request configuration
 */
export interface ModelRequestConfig {
    model: string;
    messages: Content[];
    tools?: ToolDefinition[];
    toolChoice?: 'auto' | 'none' | {
        type: 'function';
        function: {
            name: string;
        };
    };
    generationConfig?: GenerationConfig;
    safetySettings?: SafetySetting[];
    systemInstruction?: string;
}
/**
 * Model response
 */
export interface ModelResponse {
    content?: Content;
    toolCalls?: FunctionCall[];
    finishReason?: 'stop' | 'length' | 'tool_calls' | 'content_filter';
    usage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
    metadata?: Record<string, any>;
}
/**
 * Agent execution context
 */
export interface InvocationContext {
    sessionId: string;
    userId: string;
    appName: string;
    agentName: string;
    requestId: string;
    timestamp: Date;
    metadata?: Record<string, any>;
    memoryService?: any;
    agent: any;
    session: {
        id: string;
        appName: string;
        userId: string;
        state: Record<string, any>;
        events: any[];
        lastUpdateTime: number;
    };
    invocationId: string;
    branch?: string;
    userContent?: any;
    endInvocation?: boolean;
}
/**
 * Session state
 */
export interface SessionState {
    [key: string]: any;
}
/**
 * Memory entry
 */
export interface MemoryEntry {
    id: string;
    content: string;
    metadata?: Record<string, any>;
    timestamp: Date;
    sessionId?: string;
    userId?: string;
}
/**
 * Error types
 */
export declare class AdkError extends Error {
    code?: string | undefined;
    details?: Record<string, any> | undefined;
    constructor(message: string, code?: string | undefined, details?: Record<string, any> | undefined);
}
export declare class ModelError extends AdkError {
    constructor(message: string, details?: Record<string, any>);
}
export declare class ToolError extends AdkError {
    constructor(message: string, details?: Record<string, any>);
}
export declare class SessionError extends AdkError {
    constructor(message: string, details?: Record<string, any>);
}
/**
 * Callback types
 */
export type EventCallback<T = any> = (event: T) => void | Promise<void>;
/**
 * Streaming response
 */
export interface StreamingResponse {
    content?: string;
    toolCalls?: FunctionCall[];
    done: boolean;
    metadata?: Record<string, any>;
}
/**
 * Plugin interface
 */
export interface Plugin {
    name: string;
    version: string;
    initialize?(config?: Record<string, any>): Promise<void> | void;
    beforeAgentRun?(context: InvocationContext): Promise<void> | void;
    afterAgentRun?(context: InvocationContext, result: any): Promise<void> | void;
    beforeToolCall?(context: InvocationContext, toolCall: FunctionCall): Promise<void> | void;
    afterToolCall?(context: InvocationContext, toolCall: FunctionCall, result: any): Promise<void> | void;
    onError?(context: InvocationContext, error: Error): Promise<void> | void;
}
/**
 * ReadonlyContext - A readonly wrapper for InvocationContext
 */
export declare class ReadonlyContext {
    private context;
    constructor(context: InvocationContext);
    get sessionId(): string;
    get userId(): string;
    get appName(): string;
    get agentName(): string;
    get requestId(): string;
    get timestamp(): Date;
    get metadata(): Record<string, any> | undefined;
    get memoryService(): any;
    get session(): any;
}
//# sourceMappingURL=index.d.ts.map