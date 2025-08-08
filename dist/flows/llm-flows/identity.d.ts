/**
 * Gives the agent identity from the framework.
 */
import { InvocationContext } from '../../types';
import { Event } from '../../events/index';
import { LlmRequest } from '../../models/llm-request';
import { BaseLlmRequestProcessor } from './base-llm-processor';
/**
 * Gives the agent identity from the framework.
 */
declare class IdentityLlmRequestProcessor extends BaseLlmRequestProcessor {
    runAsync(invocationContext: InvocationContext, llmRequest: LlmRequest): AsyncGenerator<Event, void, unknown>;
}
export declare const requestProcessor: IdentityLlmRequestProcessor;
export {};
//# sourceMappingURL=identity.d.ts.map