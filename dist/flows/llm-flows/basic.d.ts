/**
 * Handles basic information to build the LLM request.
 */
import { InvocationContext } from '../../types';
import { Event } from '../../events/index';
import { LlmRequest } from '../../models/llm-request';
import { BaseLlmRequestProcessor } from './base-llm-processor';
declare class BasicLlmRequestProcessor extends BaseLlmRequestProcessor {
    runAsync(invocationContext: InvocationContext, llmRequest: LlmRequest): AsyncGenerator<Event, void, unknown>;
}
export declare const requestProcessor: BasicLlmRequestProcessor;
export {};
//# sourceMappingURL=basic.d.ts.map