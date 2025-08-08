/**
 * Implementation of AutoFlow.
 */
import { SingleFlow } from './single-flow';
/**
 * AutoFlow is SingleFlow with agent transfer capability.
 *
 * Agent transfer is allowed in the following direction:
 *
 * 1. from parent to sub-agent;
 * 2. from sub-agent to parent;
 * 3. from sub-agent to its peer agents;
 *
 * For peer-agent transfers, it's only enabled when all below conditions are met:
 *
 * - The parent agent is also an LlmAgent.
 * - `disallowTransferToPeer` option of this agent is False (default).
 *
 * Depending on the target agent type, the transfer may be automatically
 * reversed. (see Runner._findAgentToRun method for which agent will remain
 * active to handle next user message.)
 */
export declare class AutoFlow extends SingleFlow {
    constructor();
}
//# sourceMappingURL=auto-flow.d.ts.map