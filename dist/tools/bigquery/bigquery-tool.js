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
exports.BigQueryTool = void 0;
const base_tool_1 = require("../base-tool");
const tool_context_1 = require("../tool-context");
const client_1 = require("./client");
const config_1 = require("./config");
/**
 * A tool for executing BigQuery operations.
 *
 * This tool provides a safe interface for executing SQL queries against BigQuery,
 * with configurable write permissions and access controls.
 */
class BigQueryTool extends base_tool_1.BaseTool {
    constructor(toolConfig) {
        super({
            name: toolConfig.name || 'bigquery',
            description: toolConfig.description || 'Execute SQL queries against BigQuery with configurable access controls.',
            parameters: {
                type: 'object',
                properties: {
                    query: {
                        type: 'string',
                        description: 'The SQL query to execute against BigQuery'
                    },
                    parameters: {
                        type: 'array',
                        description: 'Optional query parameters for parameterized queries'
                    },
                    maxResults: {
                        type: 'number',
                        description: 'Maximum number of results to return'
                    }
                },
                required: ['query']
            }
        });
        this.config = toolConfig.config;
        this.client = new client_1.BigQueryClient(toolConfig.config, toolConfig.credentials);
    }
    getToolDefinition() {
        return this.getDefinition();
    }
    async execute(params, context) {
        // Convert simple ToolContext to AdvancedToolContext
        const advancedContext = new tool_context_1.AdvancedToolContext(context.context, {
            functionCallId: context.metadata?.functionCallId
        });
        // Validate query based on write mode
        this.validateQuery(params.query);
        try {
            const result = await this.client.query(params.query, {
                parameters: params.parameters,
                maxResults: params.maxResults || this.config.maxResults || 1000,
                timeoutMs: this.config.timeoutMs,
            });
            return result;
        }
        catch (error) {
            throw new Error(`BigQuery execution failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    validateQuery(query) {
        const normalizedQuery = query.trim().toLowerCase();
        // Check write mode restrictions
        if (this.config.writeMode === config_1.WriteMode.BLOCKED) {
            // Only allow SELECT queries
            if (!normalizedQuery.startsWith('select') && !normalizedQuery.startsWith('with')) {
                throw new Error('Only SELECT queries are allowed in BLOCKED write mode');
            }
        }
        else if (this.config.writeMode === config_1.WriteMode.PROTECTED) {
            // Block dangerous operations on permanent tables
            const dangerousOperations = ['drop', 'delete', 'truncate', 'alter'];
            for (const operation of dangerousOperations) {
                if (normalizedQuery.includes(operation)) {
                    throw new Error(`${operation.toUpperCase()} operations are not allowed in PROTECTED write mode`);
                }
            }
        }
        // Additional validation can be added here
    }
}
exports.BigQueryTool = BigQueryTool;
//# sourceMappingURL=bigquery-tool.js.map