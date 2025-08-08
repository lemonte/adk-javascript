/**
 * Builds the contents for the LLM request.
 */
import { InvocationContext } from '../../types';
import { Event } from '../../events/index';
import { LlmRequest } from '../../models/llm-request';
import { BaseLlmRequestProcessor } from './base-llm-processor';
/**
 * Builds the contents for the LLM request.
 */
declare class ContentLlmRequestProcessor extends BaseLlmRequestProcessor {
    runAsync(invocationContext: InvocationContext, llmRequest: LlmRequest): AsyncGenerator<Event, void, unknown>;
}
export declare const requestProcessor: ContentLlmRequestProcessor;
export {};
//# sourceMappingURL=contents.d.ts.map