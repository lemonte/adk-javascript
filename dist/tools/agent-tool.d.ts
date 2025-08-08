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
import { ToolDefinition } from '../types';
import { BaseAgent } from '../agents';
/**
 * Configuration for the AgentTool.
 */
export interface AgentToolConfig {
    /**
     * The agent to wrap as a tool.
     */
    agent: BaseAgent;
    /**
     * Whether to skip summarization of the agent output.
     */
    skipSummarization?: boolean;
}
/**
 * A tool that wraps an agent.
 *
 * This tool allows an agent to be called as a tool within a larger application.
 * The agent's input schema is used to define the tool's input parameters, and
 * the agent's output is returned as the tool's result.
 */
export declare class AgentTool extends BaseTool {
    private agent;
    private skipSummarization;
    constructor(config: AgentToolConfig);
    getToolDefinition(): ToolDefinition;
    execute(args: Record<string, any>, context: ToolContext): Promise<any>;
}
//# sourceMappingURL=agent-tool.d.ts.map