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
exports.urlContext = exports.UrlContextTool = void 0;
const base_tool_1 = require("./base-tool");
/**
 * A built-in tool that is automatically invoked by Gemini 2 models to retrieve content from URLs
 * and use that content to inform and shape its response.
 *
 * This tool operates internally within the model and does not require or perform
 * local code execution.
 */
class UrlContextTool extends base_tool_1.BaseTool {
    constructor() {
        // Name and description are not used because this is a model built-in tool.
        super({
            name: 'url_context',
            description: 'url_context',
        });
    }
    async execute(params, context) {
        // This tool is handled internally by the Gemini model
        // and does not require local execution
        throw new Error('UrlContextTool should not be executed locally. It is handled by the Gemini model.');
    }
    /**
     * Process LLM request to add URL context capabilities.
     * This method configures the LLM request to include URL context tools
     * for Gemini 2 models.
     */
    async processLlmRequest(toolContext, llmRequest) {
        // This is a placeholder for LLM request processing
        // In a real implementation, this would:
        // 1. Check if the model is a Gemini 2 model
        // 2. Add URL context tools to the request configuration
        // 3. Reject usage with Gemini 1.x models
        throw new Error('LLM request processing not implemented yet.');
        // Example of what the implementation might look like:
        /*
        llmRequest.config = llmRequest.config || {};
        llmRequest.config.tools = llmRequest.config.tools || [];
        
        if (isGemini1Model(llmRequest.model)) {
          throw new Error('Url context tool can not be used in Gemini 1.x.');
        } else if (isGemini2Model(llmRequest.model)) {
          llmRequest.config.tools.push({
            urlContext: {}
          });
        } else {
          throw new Error(
            `Url context tool is not supported for model ${llmRequest.model}`
          );
        }
        */
    }
}
exports.UrlContextTool = UrlContextTool;
/**
 * Pre-configured instance of UrlContextTool.
 */
exports.urlContext = new UrlContextTool();
//# sourceMappingURL=url-context-tool.js.map