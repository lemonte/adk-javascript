"use strict";
/**
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentTool = void 0;
const base_tool_1 = require("./base-tool");
const tool_context_1 = require("./tool-context");
const runners_1 = require("../runners");
/**
 * A tool that wraps an agent.
 *
 * This tool allows an agent to be called as a tool within a larger application.
 * The agent's input schema is used to define the tool's input parameters, and
 * the agent's output is returned as the tool's result.
 */
class AgentTool extends base_tool_1.BaseTool {
    constructor(config) {
        super({
            name: config.agent.name,
            description: config.agent.description || `Agent tool for ${config.agent.name}`,
            parameters: {
                type: 'object',
                properties: {
                    request: {
                        type: 'string',
                        description: 'The request to send to the agent'
                    }
                },
                required: ['request']
            }
        });
        this.agent = config.agent;
        this.skipSummarization = config.skipSummarization ?? false;
    }
    getToolDefinition() {
        return {
            type: 'function',
            function: {
                name: this.name,
                description: this.description,
                parameters: this.parameters
            }
        };
    }
    async execute(args, context) {
        // Convert simple ToolContext to AdvancedToolContext
        const advancedContext = new tool_context_1.AdvancedToolContext(context.context, {
            functionCallId: context.metadata?.functionCallId
        });
        if (this.skipSummarization && advancedContext.actions) {
            advancedContext.actions.skipSummarization = true;
        }
        let content;
        // Handle the request
        const request = args.request || JSON.stringify(args);
        content = {
            role: 'user',
            parts: [{
                    type: 'text',
                    text: request,
                }],
        };
        // Create a runner to execute the agent
        const runner = new runners_1.Runner(this.agent, {
            enableLogging: true,
            enableMetrics: true
        });
        try {
            // Execute the agent with the provided content
            const response = await runner.run(content, context.sessionState, advancedContext.invocationContext);
            // Return the agent's response
            if (response && response.response && response.response.parts) {
                const textParts = response.response.parts
                    .filter((part) => part.type === 'text')
                    .map((part) => part.text)
                    .join('\n');
                return textParts || response;
            }
            return response;
        }
        catch (error) {
            throw new Error(`Agent execution failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
}
exports.AgentTool = AgentTool;
//# sourceMappingURL=agent-tool.js.map