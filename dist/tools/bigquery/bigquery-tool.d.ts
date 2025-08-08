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
import { BaseTool } from '../base-tool';
import { ToolContext } from '../base-tool';
import { ToolDefinition } from '../../types';
import { QueryResult } from './client';
import { BigQueryConfig } from './config';
import { BigQueryCredentialsConfig } from './bigquery-credentials';
/**
 * Parameters for BigQuery operations.
 */
export interface BigQueryParams {
    /**
     * The SQL query to execute.
     */
    query: string;
    /**
     * Parameters for the query (for parameterized queries).
     */
    parameters?: any[];
    /**
     * Maximum number of rows to return.
     */
    maxResults?: number;
}
/**
 * Configuration for the BigQuery tool.
 */
export interface BigQueryToolConfig {
    /**
     * BigQuery configuration.
     */
    config: BigQueryConfig;
    /**
     * BigQuery credentials configuration.
     */
    credentials: BigQueryCredentialsConfig;
    /**
     * Custom name for the tool.
     */
    name?: string;
    /**
     * Custom description for the tool.
     */
    description?: string;
}
/**
 * A tool for executing BigQuery operations.
 *
 * This tool provides a safe interface for executing SQL queries against BigQuery,
 * with configurable write permissions and access controls.
 */
export declare class BigQueryTool extends BaseTool {
    private client;
    private config;
    constructor(toolConfig: BigQueryToolConfig);
    getToolDefinition(): ToolDefinition;
    execute(params: BigQueryParams, context: ToolContext): Promise<QueryResult>;
    private validateQuery;
}
//# sourceMappingURL=bigquery-tool.d.ts.map