"use strict";
/**
 * Core types and interfaces for the ADK JavaScript SDK
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReadonlyContext = exports.SessionError = exports.ToolError = exports.ModelError = exports.AdkError = void 0;
/**
 * Error types
 */
class AdkError extends Error {
    constructor(message, code, details) {
        super(message);
        this.code = code;
        this.details = details;
        this.name = 'AdkError';
    }
}
exports.AdkError = AdkError;
class ModelError extends AdkError {
    constructor(message, details) {
        super(message, 'MODEL_ERROR', details);
        this.name = 'ModelError';
    }
}
exports.ModelError = ModelError;
class ToolError extends AdkError {
    constructor(message, details) {
        super(message, 'TOOL_ERROR', details);
        this.name = 'ToolError';
    }
}
exports.ToolError = ToolError;
class SessionError extends AdkError {
    constructor(message, details) {
        super(message, 'SESSION_ERROR', details);
        this.name = 'SessionError';
    }
}
exports.SessionError = SessionError;
/**
 * ReadonlyContext - A readonly wrapper for InvocationContext
 */
class ReadonlyContext {
    constructor(context) {
        this.context = context;
    }
    get sessionId() { return this.context.sessionId; }
    get userId() { return this.context.userId; }
    get appName() { return this.context.appName; }
    get agentName() { return this.context.agentName; }
    get requestId() { return this.context.requestId; }
    get timestamp() { return this.context.timestamp; }
    get metadata() { return this.context.metadata; }
    get memoryService() { return this.context.memoryService; }
    get session() { return this.context.session; }
}
exports.ReadonlyContext = ReadonlyContext;
//# sourceMappingURL=index.js.map