import { InvocationContext } from '../../types';
import { Event } from '../../events';
import { BaseTool } from '../../tools/base-tool';
import { FunctionCall, Content } from '../../types';
export declare function generateClientFunctionCallId(): string;
export declare function populateClientFunctionCallId(modelResponseEvent: Event): void;
export declare function removeClientFunctionCallId(content: Content): void;
export declare function getLongRunningFunctionCalls(functionCalls: FunctionCall[], toolsDict: Record<string, BaseTool>): Set<string>;
export declare function handleFunctionCallsAsync(invocationContext: InvocationContext, functionCallEvent: Event, toolsDict: Record<string, BaseTool>, filters?: Set<string>): Promise<Event | null>;
export declare function deepMergeDicts(d1: Record<string, any>, d2: Record<string, any>): Record<string, any>;
export declare function mergeParallelFunctionResponseEvents(functionResponseEvents: Event[]): Event;
export declare function findMatchingFunctionCall(events: Event[]): Event | null;
//# sourceMappingURL=functions.d.ts.map