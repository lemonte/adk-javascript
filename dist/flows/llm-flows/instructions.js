"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestProcessor = void 0;
/**
 * Handles instructions and global instructions for LLM flow.
 */
const types_1 = require("../../types");
const llm_agent_1 = require("../../agents/llm-agent");
const base_llm_processor_1 = require("./base-llm-processor");
/**
 * Handles instructions and global instructions for LLM flow.
 */
class InstructionsLlmRequestProcessor extends base_llm_processor_1.BaseLlmRequestProcessor {
    async *runAsync(invocationContext, llmRequest) {
        const agent = invocationContext.agent;
        if (!(agent instanceof llm_agent_1.LlmAgent)) {
            return;
        }
        const rootAgent = agent.rootAgent;
        // Appends global instructions if set
        if (rootAgent instanceof llm_agent_1.LlmAgent && rootAgent.globalInstruction) {
            const { instruction: rawSi, bypassStateInjection } = await rootAgent.canonicalGlobalInstruction(new types_1.ReadonlyContext(invocationContext));
            let si = rawSi;
            if (!bypassStateInjection) {
                si = await this.injectSessionState(rawSi, new types_1.ReadonlyContext(invocationContext));
            }
            llmRequest.appendInstructions([si]);
        }
        // Appends agent instructions if set
        if (agent.instruction) {
            const { instruction: rawSi, bypassStateInjection } = await agent.canonicalInstruction(new types_1.ReadonlyContext(invocationContext));
            let si = rawSi;
            if (!bypassStateInjection) {
                si = await this.injectSessionState(rawSi, new types_1.ReadonlyContext(invocationContext));
            }
            llmRequest.appendInstructions([si]);
        }
        // Maintain async generator behavior
        if (false) {
            yield {}; // This is a no-op but maintains generator structure
        }
    }
    async injectSessionState(instruction, context) {
        // Simple state injection - replace placeholders with session state
        let result = instruction;
        // Replace common placeholders
        const state = context.session.state;
        if (state) {
            // Replace {{variable_name}} patterns with state values
            result = result.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
                const value = state[key.trim()];
                return value !== undefined ? String(value) : match;
            });
        }
        return result;
    }
}
exports.requestProcessor = new InstructionsLlmRequestProcessor();
//# sourceMappingURL=instructions.js.map