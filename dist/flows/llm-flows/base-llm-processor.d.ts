/**
 * Defines the processor interface used for BaseLlmFlow.
 */
import { InvocationContext } from '../../types';
import { Event } from '../../events/index';
import { LlmRequest } from '../../models/llm-request';
import { LlmResponse } from '../../models/llm-response';
/**
 * Base class for LLM request processor.
 */
export declare abstract class BaseLlmRequestProcessor {
    /**
     * Runs the processor.
     */
    abstract runAsync(invocationContext: InvocationContext, llmRequest: LlmRequest): AsyncGenerator<Event, void, unknown>;
}
/**
 * Base class for LLM response processor.
 */
export declare abstract class BaseLlmResponseProcessor {
    /**
     * Processes the LLM response.
     */
    abstract runAsync(invocationContext: InvocationContext, llmResponse: LlmResponse): AsyncGenerator<Event, void, unknown>;
}
//# sourceMappingURL=base-llm-processor.d.ts.map