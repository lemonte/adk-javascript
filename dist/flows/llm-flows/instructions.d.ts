/**
 * Handles instructions and global instructions for LLM flow.
 */
import { InvocationContext } from '../../types';
import { Event } from '../../events/index';
import { LlmRequest } from '../../models/llm-request';
import { BaseLlmRequestProcessor } from './base-llm-processor';
/**
 * Handles instructions and global instructions for LLM flow.
 */
declare class InstructionsLlmRequestProcessor extends BaseLlmRequestProcessor {
    runAsync(invocationContext: InvocationContext, llmRequest: LlmRequest): AsyncGenerator<Event, void, unknown>;
    private injectSessionState;
}
export declare const requestProcessor: InstructionsLlmRequestProcessor;
export {};
//# sourceMappingURL=instructions.d.ts.map