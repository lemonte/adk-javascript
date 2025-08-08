/**
 * Agent Development Kit (ADK) for JavaScript/Node.js
 * 
 * A flexible and modular framework for developing and deploying AI agents.
 * While optimized for Gemini and the Google ecosystem, ADK is model-agnostic,
 * deployment-agnostic, and is built for compatibility with other frameworks.
 * 
 * @packageDocumentation
 */

// Core exports
export { Agent, LlmAgent, BaseAgent } from './agents/index';
export { Runner, InMemoryRunner } from './runners/index';
export { Session, InMemorySessionService } from './sessions/index';
export { BaseMemoryService, InMemoryMemoryService, MemoryEntry } from './memory/index';
import * as dotenv from 'dotenv';
dotenv.config({ override: true });
// Tools exports
export {
  BaseTool,
  FunctionTool,
  createTool,
  AdvancedToolContext
} from './tools/index';

// Models exports
export {
  BaseModel,
  GeminiModel
} from './models';

// Events exports
export {
  Event,
  EventType,
  AgentStartEvent,
  AgentEndEvent,
  ToolCallEvent,
  ToolResponseEvent,
  ModelRequestEvent,
  ModelResponseEvent
} from './events/index';

// Configuration exports
// export {
//   RunConfig,
//   AgentConfig,
//   LlmAgentConfig
// } from './config';

// Flows exports
export {
  BaseLlmFlow,
  SingleFlow,
  AutoFlow,
  BaseLlmRequestProcessor,
  BaseLlmResponseProcessor
} from './flows';

// Utilities exports
export {
  Logger,
  LogLevel,
  logger,
  createLogger,
  validateJsonSchema
} from './utils';

// Types exports
export * from './types';

// Version
export const VERSION = '1.0.0';

/**
 * Default export for convenience
 */
export default {
  VERSION
};