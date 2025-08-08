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
const llm_agent_1 = require("../../agents/llm-agent");
class BasicLlmRequestProcessor extends base_llm_processor_1.BaseLlmRequestProcessor {
    async *runAsync(invocationContext, llmRequest) {
        const agent = invocationContext.agent;
        if (!(agent instanceof llm_agent_1.LlmAgent)) {
            return;
        }
        // Set model from agent's model property
        if (typeof agent.model === 'object' && 'model' in agent.model && typeof agent.model.model === 'string') {
            llmRequest.model = agent.model.model;
        }
        else {
            llmRequest.model = 'gemini-1.5-flash'; // default model
        }
        if (agent.generationConfig) {
            // Set generation config as part of the model request config
            llmRequest.config = {
                model: llmRequest.model || 'gemini-1.5-flash',
                messages: [], // Will be populated later
                ...agent.generationConfig
            };
        }
        llmRequest.systemInstruction = agent.systemInstruction;
        // Convert tools to ToolDefinition format if needed
        if (agent.tools && agent.tools.length > 0) {
            llmRequest.tools = agent.tools.map(tool => ({
                type: 'function',
                function: {
                    name: tool.name,
                    description: tool.description,
                    parameters: tool.parameters
                }
            }));
        }
        llmRequest.safetySettings = agent.safetySettings;
        // Maintain async generator behavior
        if (false) {
            yield {}; // This is a no-op but maintains generator structure
        }
    }
}
exports.requestProcessor = new BasicLlmRequestProcessor();
//# sourceMappingURL=basic.js.map