import { AuthConfig } from '../auth/auth-handler';
/**
 * Represents the actions attached to an event.
 */
export interface EventActions {
    /**
     * If true, it won't call model to summarize function response.
     *
     * Only used for function_response event.
     */
    skipSummarization?: boolean;
    /**
     * Indicates that the event is updating the state with the given delta.
     */
    stateDelta: Record<string, any>;
    /**
     * Indicates that the event is updating an artifact. key is the filename,
     * value is the version.
     */
    artifactDelta: Record<string, number>;
    /**
     * If set, the event transfers to the specified agent.
     */
    transferToAgent?: string;
    /**
     * The agent is escalating to a higher level agent.
     */
    escalate?: boolean;
    /**
     * Authentication configurations requested by tool responses.
     *
     * This field will only be set by a tool response event indicating tool request
     * auth credential.
     * - Keys: The function call id. Since one function response event could contain
     * multiple function responses that correspond to multiple function calls. Each
     * function call could request different auth configs. This id is used to
     * identify the function call.
     * - Values: The requested auth config.
     */
    requestedAuthConfigs: Record<string, AuthConfig>;
}
/**
 * Creates a default EventActions object.
 */
export declare function createEventActions(): EventActions;
//# sourceMappingURL=event-actions.d.ts.map