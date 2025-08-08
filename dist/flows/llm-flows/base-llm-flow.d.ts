/**
 * Base LLM Flow implementation.
 */
import { InvocationContext } from '../../types';
import { Event } from '../../events/index';
import { LlmRequest } from '../../models/llm-request';
import { LlmResponse } from '../../models/llm-response';
import { BaseLlmRequestProcessor, BaseLlmResponseProcessor } from './base-llm-processor';
/**
 * A basic flow that calls the LLM in a loop until a final response is generated.
 *
 * This flow ends when it transfer to another agent.
 */
export declare abstract class BaseLlmFlow {
    protected requestProcessors: BaseLlmRequestProcessor[];
    protected responseProcessors: BaseLlmResponseProcessor[];
    constructor();
    /**
     * Runs the flow using live api.
     */
    runLive(invocationContext: InvocationContext): AsyncGenerator<Event, void, unknown>;
    /**
     * Runs the flow using async api.
     */
    runAsync(invocationContext: InvocationContext): Promise<Event>;
    /**
     * Preprocesses the request before calling the LLM.
     */
    protected preprocessAsync(invocationContext: InvocationContext, llmRequest: LlmRequest): AsyncGenerator<Event, void, unknown>;
    /**
     * Postprocesses the response after calling the LLM.
     */
    protected postprocessAsync(invocationContext: InvocationContext, llmResponse: LlmResponse): AsyncGenerator<Event, void, unknown>;
    /**
     * Gets the LLM instance from the invocation context.
     */
    private getLlm;
    /**
      * Converts internal Content to Google AI Content format.
      */
    private convertContent;
}
//# sourceMappingURL=base-llm-flow.d.ts.map