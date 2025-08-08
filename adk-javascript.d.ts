declare module 'adk-javascript' {
  // ===== CORE TYPES =====
  
  /**
   * Tool definition interface for creating tools
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
   * Content part types for messages
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

  export interface FunctionCallPart {
    type: 'function_call';
    functionCall: FunctionCall;
  }

  export interface FunctionResponsePart {
    type: 'function_response';
    functionResponse: FunctionResponse;
  }

  export type ContentPart = TextPart | ImagePart | FunctionCallPart | FunctionResponsePart;

  /**
   * Message content interface
   */
  export interface Content {
    role: 'user' | 'assistant' | 'system' | 'tool';
    parts: ContentPart[];
    metadata?: Record<string, any>;
  }

  /**
   * Function call and response interfaces
   */
  export interface FunctionCall {
    name: string;
    arguments: Record<string, any>;
    id?: string;
  }

  export interface FunctionResponse {
    name: string;
    content: string;
    id?: string;
    error?: string;
  }

  /**
   * Generation configuration for models
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
   * Safety settings for content filtering
   */
  export interface SafetySetting {
    category: 'HARM_CATEGORY_HARASSMENT' | 'HARM_CATEGORY_HATE_SPEECH' | 'HARM_CATEGORY_SEXUALLY_EXPLICIT' | 'HARM_CATEGORY_DANGEROUS_CONTENT' | string;
    threshold: 'BLOCK_NONE' | 'BLOCK_ONLY_HIGH' | 'BLOCK_MEDIUM_AND_ABOVE' | 'BLOCK_LOW_AND_ABOVE' | string;
  }

  // ===== AGENT CONFIGURATION =====

  /**
   * Base agent configuration
   */
  export interface BaseAgentConfig {
    name: string;
    description?: string;
    instruction?: string;
    tools?: BaseTool[];
    plugins?: Plugin[];
    metadata?: Record<string, any>;
    subAgents?: BaseAgent[];
  }

  /**
   * LLM Agent configuration
   */
  export interface LlmAgentConfig extends BaseAgentConfig {
    model: string | BaseModel;
    systemInstruction?: string;
    globalInstruction?: string;
    generationConfig?: GenerationConfig;
    safetySettings?: SafetySetting[];
    maxIterations?: number;
    subAgents?: LlmAgent[];
  }

  /**
   * Alias for LlmAgentConfig for convenience
   */
  export interface AgentConfig extends LlmAgentConfig {}

  // ===== CONTEXT AND SESSION =====

  /**
   * Invocation context for agent execution
   */
  export interface InvocationContext {
    sessionId: string;
    userId: string;
    appName: string;
    agentName: string;
    requestId: string;
    timestamp: Date;
    metadata?: Record<string, any>;
    memoryService?: BaseMemoryService;
    agent: BaseAgent;
    session: {
      id: string;
      appName: string;
      userId: string;
      state: Record<string, any>;
      events: Event[];
      lastUpdateTime: number;
    };
    invocationId: string;
    branch?: string;
    userContent?: Content;
    endInvocation?: boolean;
  }

  /**
   * Session state interface
   */
  export interface SessionState {
    [key: string]: any;
  }

  /**
   * Memory entry interface
   */
  export interface MemoryEntry {
    id: string;
    content: string;
    metadata?: Record<string, any>;
    timestamp: Date;
    sessionId?: string;
    userId?: string;
  }

  // ===== TOOLS =====

  /**
   * Base tool configuration
   */
  export interface BaseToolConfig {
    name: string;
    description: string;
    parameters: {
      type: 'object';
      properties: Record<string, any>;
      required?: string[];
    };
    metadata?: Record<string, any>;
  }

  /**
   * Tool context for tool execution
   */
  export interface ToolContext {
    sessionId: string;
    userId: string;
    agentName: string;
    requestId: string;
    metadata?: Record<string, any>;
  }

  /**
   * Advanced tool context
   */
  export interface AdvancedToolContext extends ToolContext {
    session: Session;
    agent: BaseAgent;
    memoryService?: BaseMemoryService;
  }

  // ===== EVENTS =====

  /**
   * Event types enumeration
   */
  export enum EventType {
    AGENT_START = 'agent_start',
    AGENT_END = 'agent_end',
    TOOL_CALL = 'tool_call',
    TOOL_RESPONSE = 'tool_response',
    MODEL_REQUEST = 'model_request',
    MODEL_RESPONSE = 'model_response'
  }

  /**
   * Base event interface
   */
  export interface Event {
    type: EventType;
    timestamp: Date;
    metadata?: Record<string, any>;
  }

  // ===== PLUGINS =====

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

  // ===== CLASSES =====

  /**
   * Base tool class
   */
  export abstract class BaseTool {
    readonly name: string;
    readonly description: string;
    readonly parameters: {
      type: 'object';
      properties: Record<string, any>;
      required?: string[];
    };
    readonly metadata: Record<string, any>;

    constructor(config: BaseToolConfig);
    abstract execute(args: Record<string, any>, context: ToolContext): Promise<any>;
  }

  /**
   * Function tool class
   */
  export class FunctionTool extends BaseTool {
    readonly func: Function;

    constructor(config: {
      func: Function;
      name?: string;
      description?: string;
      parameters?: {
        type: 'object';
        properties: Record<string, any>;
        required?: string[];
      };
      metadata?: Record<string, any>;
    });

    execute(args: Record<string, any>, context: ToolContext): Promise<any>;
  }

  /**
   * Base agent class
   */
  export abstract class BaseAgent {
    readonly name: string;
    readonly description?: string;
    readonly instruction?: string;
    readonly tools: BaseTool[];
    readonly plugins: Plugin[];
    readonly metadata: Record<string, any>;
    readonly subAgents: BaseAgent[];
    parentAgent?: BaseAgent;

    constructor(config: BaseAgentConfig);
    abstract run(
      message: Content,
      context: InvocationContext,
      sessionState?: SessionState
    ): Promise<AsyncGenerator<Event, void, unknown>>;
  }

  /**
   * LLM Agent class
   */
  export class LlmAgent extends BaseAgent {
    readonly model: BaseModel;
    readonly systemInstruction?: string;
    readonly globalInstruction?: string;
    readonly generationConfig?: GenerationConfig;
    readonly safetySettings?: SafetySetting[];
    readonly maxIterations: number;
    readonly subAgents: LlmAgent[];

    constructor(config: LlmAgentConfig);

    run(
      message: Content,
      context: InvocationContext,
      sessionState?: SessionState
    ): Promise<AsyncGenerator<Event, void, unknown>>;
  }

  /**
   * Agent alias for LlmAgent
   */
  export class Agent extends LlmAgent {
    constructor(config: LlmAgentConfig);
  }

  /**
   * Base model class
   */
  export abstract class BaseModel {
    abstract generateContent(
      config: {
        model: string;
        messages: Content[];
        tools?: ToolDefinition[];
        generationConfig?: GenerationConfig;
        safetySettings?: SafetySetting[];
        systemInstruction?: string;
      }
    ): Promise<{
      content?: Content;
      toolCalls?: FunctionCall[];
      finishReason?: 'stop' | 'length' | 'tool_calls' | 'content_filter';
      usage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
      };
      metadata?: Record<string, any>;
    }>;
  }

  /**
   * Gemini model class
   */
  export class GeminiModel extends BaseModel {
    readonly model: string;
    readonly apiKey?: string;

    constructor(config: { model: string; apiKey?: string });

    generateContent(
      config: {
        model: string;
        messages: Content[];
        tools?: ToolDefinition[];
        generationConfig?: GenerationConfig;
        safetySettings?: SafetySetting[];
        systemInstruction?: string;
      }
    ): Promise<{
      content?: Content;
      toolCalls?: FunctionCall[];
      finishReason?: 'stop' | 'length' | 'tool_calls' | 'content_filter';
      usage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
      };
      metadata?: Record<string, any>;
    }>;
  }

  // ===== UTILITY FUNCTIONS =====

  /**
   * Create a tool from a function
   */
  export function createTool<T extends (...args: any[]) => any>(
    fn: T,
    config?: {
      name?: string;
      description?: string;
      parameters?: {
        type: 'object';
        properties: Record<string, any>;
        required?: string[];
      };
      metadata?: Record<string, any>;
    }
  ): FunctionTool;

  // ===== MEMORY SERVICES =====

  /**
   * Base memory service
   */
  export abstract class BaseMemoryService {
    abstract store(entry: MemoryEntry): Promise<void>;
    abstract retrieve(query: string, options?: {
      limit?: number;
      sessionId?: string;
      userId?: string;
      metadata?: Record<string, any>;
    }): Promise<MemoryEntry[]>;
    abstract delete(id: string): Promise<void>;
  }

  /**
   * In-memory memory service
   */
  export class InMemoryMemoryService extends BaseMemoryService {
    constructor();

    store(entry: MemoryEntry): Promise<void>;
    retrieve(query: string, options?: {
      limit?: number;
      sessionId?: string;
      userId?: string;
      metadata?: Record<string, any>;
    }): Promise<MemoryEntry[]>;
    delete(id: string): Promise<void>;
  }

  // ===== SESSION SERVICES =====

  /**
   * Session interface
   */
  export interface Session {
    id: string;
    appName: string;
    userId: string;
    state: SessionState;
    events: Event[];
    lastUpdateTime: number;
  }

  /**
   * In-memory session service
   */
  export class InMemorySessionService {
    constructor();

    createSession(appName: string, userId: string): Promise<Session>;
    getSession(sessionId: string): Promise<Session | null>;
    updateSession(sessionId: string, updates: Partial<Session>): Promise<void>;
    deleteSession(sessionId: string): Promise<void>;
  }

  // ===== RUNNERS =====

  /**
   * Base runner class
   */
  export abstract class Runner {
    abstract run(
      agent: BaseAgent,
      message: Content,
      context: InvocationContext
    ): Promise<AsyncGenerator<Event, void, unknown>>;
  }

  /**
   * In-memory runner
   */
  export class InMemoryRunner extends Runner {
    constructor();

    run(
      agent: BaseAgent,
      message: Content,
      context: InvocationContext
    ): Promise<AsyncGenerator<Event, void, unknown>>;
  }

  // ===== LOGGING =====

  /**
   * Log levels
   */
  export enum LogLevel {
    DEBUG = 'debug',
    INFO = 'info',
    WARN = 'warn',
    ERROR = 'error'
  }

  /**
   * Logger interface
   */
  export interface Logger {
    debug(message: string, ...args: any[]): void;
    info(message: string, ...args: any[]): void;
    warn(message: string, ...args: any[]): void;
    error(message: string, ...args: any[]): void;
  }

  /**
   * Create a logger instance
   */
  export function createLogger(name: string): Logger;

  /**
   * Default logger instance
   */
  export const logger: Logger;

  // ===== ERRORS =====

  /**
   * Base ADK error class
   */
  export class AdkError extends Error {
    readonly code?: string;
    readonly details?: Record<string, any>;

    constructor(
      message: string,
      code?: string,
      details?: Record<string, any>
    );
  }

  /**
   * Model error class
   */
  export class ModelError extends AdkError {
    constructor(message: string, details?: Record<string, any>);
  }

  /**
   * Tool error class
   */
  export class ToolError extends AdkError {
    constructor(message: string, details?: Record<string, any>);
  }

  /**
   * Session error class
   */
  export class SessionError extends AdkError {
    constructor(message: string, details?: Record<string, any>);
  }

  // ===== VERSION =====

  /**
   * Package version
   */
  export const VERSION: string;

  /**
   * Default export
   */
  const _default: {
    VERSION: string;
  };
  export default _default;
}