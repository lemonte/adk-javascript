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
import { BaseTool } from './base-tool';
import { ToolContext } from './base-tool';
/**
 * A built-in tool that is automatically invoked by Gemini 2 models to retrieve content from URLs
 * and use that content to inform and shape its response.
 *
 * This tool operates internally within the model and does not require or perform
 * local code execution.
 */
export declare class UrlContextTool extends BaseTool {
    constructor();
    execute(params: any, context: ToolContext): Promise<any>;
    /**
     * Process LLM request to add URL context capabilities.
     * This method configures the LLM request to include URL context tools
     * for Gemini 2 models.
     */
    processLlmRequest(toolContext: ToolContext, llmRequest: any): Promise<void>;
}
/**
 * Pre-configured instance of UrlContextTool.
 */
export declare const urlContext: UrlContextTool;
//# sourceMappingURL=url-context-tool.d.ts.map