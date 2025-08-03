// Copyright 2025 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * Implementation of AutoFlow.
 */

import { SingleFlow } from './single-flow';
// import { requestProcessor as agentTransferProcessor } from './agent-transfer';

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
export class AutoFlow extends SingleFlow {
  constructor() {
    super();
    
    // TODO: Implement agent transfer processor
    // this.requestProcessors.push(agentTransferProcessor);
  }
}