/**
 * Event types and interfaces for the ADK JavaScript SDK
 */
import { Content, InvocationContext, ModelRequestConfig, ModelResponse, FunctionCall, FunctionResponse } from '../types';
export * from './event';
export * from './event-actions';
/**
 * Event types enumeration
 */
export declare enum EventType {
    AGENT_START = "agent_start",
    AGENT_END = "agent_end",
    MODEL_REQUEST = "model_request",
    MODEL_RESPONSE = "model_response",
    TOOL_CALL = "tool_call",
    TOOL_RESPONSE = "tool_response",
    ITERATION_START = "iteration_start",
    ITERATION_END = "iteration_end",
    ERROR = "error"
}
/**
 * Base event interface
 */
export interface BaseEvent {
    type: EventType;
    timestamp: Date;
    context: InvocationContext;
}
/**
 * Agent start event
 */
export interface AgentStartEvent extends BaseEvent {
    type: EventType.AGENT_START;
    agentName: string;
    message: Content;
}
/**
 * Agent end event
 */
export interface AgentEndEvent extends BaseEvent {
    type: EventType.AGENT_END;
    agentName: string;
    response: Content;
    duration: number;
}
/**
 * Model request event
 */
export interface ModelRequestEvent extends BaseEvent {
    type: EventType.MODEL_REQUEST;
    request: ModelRequestConfig;
}
/**
 * Model response event
 */
export interface ModelResponseEvent extends BaseEvent {
    type: EventType.MODEL_RESPONSE;
    response: ModelResponse;
}
/**
 * Tool call event
 */
export interface ToolCallEvent extends BaseEvent {
    type: EventType.TOOL_CALL;
    toolCall: FunctionCall;
}
/**
 * Tool response event
 */
export interface ToolResponseEvent extends BaseEvent {
    type: EventType.TOOL_RESPONSE;
    toolCall: FunctionCall;
    response: FunctionResponse;
    error?: Error;
}
/**
 * Iteration start event
 */
export interface IterationStartEvent extends BaseEvent {
    type: EventType.ITERATION_START;
    iteration: number;
    data?: any;
}
/**
 * Iteration end event
 */
export interface IterationEndEvent extends BaseEvent {
    type: EventType.ITERATION_END;
    iteration: number;
    data?: any;
}
/**
 * Error event
 */
export interface ErrorEvent extends BaseEvent {
    type: EventType.ERROR;
    error: Error;
    source?: string;
}
/**
 * Union type for all events
 */
export type Event = AgentStartEvent | AgentEndEvent | ModelRequestEvent | ModelResponseEvent | ToolCallEvent | ToolResponseEvent | IterationStartEvent | IterationEndEvent | ErrorEvent;
/**
 * Event emitter interface
 */
export interface EventEmitter {
    emit(event: string, ...args: any[]): boolean;
    on(event: string, listener: (...args: any[]) => void): this;
    off(event: string, listener: (...args: any[]) => void): this;
}
//# sourceMappingURL=index.d.ts.map