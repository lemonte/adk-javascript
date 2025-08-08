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
const base_llm_processor_1 = require("./base-llm-processor");
/**
 * Gives the agent identity from the framework.
 */
class IdentityLlmRequestProcessor extends base_llm_processor_1.BaseLlmRequestProcessor {
    async *runAsync(invocationContext, llmRequest) {
        const agent = invocationContext.agent;
        const instructions = [`You are an agent. Your internal name is "${agent.name}".`];
        if (agent.description) {
            instructions.push(` The description about you is "${agent.description}"`);
        }
        llmRequest.appendInstructions(instructions);
        // Maintain async generator behavior
        if (false) {
            yield {}; // This is a no-op but maintains generator structure
        }
    }
}
exports.requestProcessor = new IdentityLlmRequestProcessor();
//# sourceMappingURL=identity.js.map