/**
 * Handles agent transfer functionality.
 */
import { InvocationContext } from '../../types';
import { Event } from '../../events/index';
import { LlmRequest } from '../../models/llm-request';
import { BaseLlmRequestProcessor } from './base-llm-processor';
/**
 * Handles agent transfer functionality.
 */
declare class AgentTransferLlmRequestProcessor extends BaseLlmRequestProcessor {
    runAsync(invocationContext: InvocationContext, llmRequest: LlmRequest): AsyncGenerator<Event, void, unknown>;
}
export declare const requestProcessor: AgentTransferLlmRequestProcessor;
export {};
//# sourceMappingURL=agent-transfer.d.ts.map