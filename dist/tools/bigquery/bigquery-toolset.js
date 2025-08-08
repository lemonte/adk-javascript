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
exports.BigQueryToolset = void 0;
const bigquery_tool_1 = require("./bigquery-tool");
/**
 * A collection of BigQuery tools for comprehensive data operations.
 *
 * This toolset provides a complete set of tools for working with BigQuery,
 * including query execution, metadata exploration, and data insights.
 */
class BigQueryToolset {
    constructor(config) {
        this.config = config;
        this.tools = this.createTools();
    }
    /**
     * Get all tools in the toolset.
     */
    getTools() {
        return this.tools;
    }
    /**
     * Get a specific tool by name.
     */
    getTool(name) {
        return this.tools.find(tool => tool.name === name);
    }
    createTools() {
        const tools = [];
        // Main BigQuery query tool
        tools.push(new bigquery_tool_1.BigQueryTool({
            config: this.config.config,
            credentials: this.config.credentials,
            name: 'bigquery_query',
            description: 'Execute SQL queries against BigQuery datasets',
        }));
        // Metadata tools
        if (this.config.includeMetadataTools) {
            tools.push(new bigquery_tool_1.BigQueryTool({
                config: this.config.config,
                credentials: this.config.credentials,
                name: 'bigquery_list_datasets',
                description: 'List available BigQuery datasets',
            }));
            tools.push(new bigquery_tool_1.BigQueryTool({
                config: this.config.config,
                credentials: this.config.credentials,
                name: 'bigquery_list_tables',
                description: 'List tables in a BigQuery dataset',
            }));
            tools.push(new bigquery_tool_1.BigQueryTool({
                config: this.config.config,
                credentials: this.config.credentials,
                name: 'bigquery_describe_table',
                description: 'Get schema and metadata for a BigQuery table',
            }));
        }
        // Data insights tools
        if (this.config.includeDataInsightsTools) {
            tools.push(new bigquery_tool_1.BigQueryTool({
                config: this.config.config,
                credentials: this.config.credentials,
                name: 'bigquery_data_profile',
                description: 'Generate data profiling insights for a BigQuery table',
            }));
            tools.push(new bigquery_tool_1.BigQueryTool({
                config: this.config.config,
                credentials: this.config.credentials,
                name: 'bigquery_data_quality',
                description: 'Analyze data quality metrics for a BigQuery table',
            }));
        }
        // Custom tools
        if (this.config.customTools) {
            for (const customToolConfig of this.config.customTools) {
                tools.push(new bigquery_tool_1.BigQueryTool({
                    config: this.config.config,
                    credentials: this.config.credentials,
                    ...customToolConfig,
                }));
            }
        }
        return tools;
    }
}
exports.BigQueryToolset = BigQueryToolset;
//# sourceMappingURL=bigquery-toolset.js.map