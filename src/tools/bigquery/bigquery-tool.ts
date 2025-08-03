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
import { AdvancedToolContext } from '../tool-context';
import { ToolContext } from '../base-tool';
import { ToolDefinition } from '../../types';
import { BigQueryClient, QueryResult } from './client';
import { BigQueryConfig, WriteMode } from './config';
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
export class BigQueryTool extends BaseTool {
  private client: BigQueryClient;
  private config: BigQueryConfig;

  constructor(toolConfig: BigQueryToolConfig) {
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
    this.client = new BigQueryClient(toolConfig.config, toolConfig.credentials);
  }

  getToolDefinition(): ToolDefinition {
    return this.getDefinition();
  }

  async execute(params: BigQueryParams, context: ToolContext): Promise<QueryResult> {
    // Convert simple ToolContext to AdvancedToolContext
    const advancedContext = new AdvancedToolContext(context.context, {
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
    } catch (error) {
      throw new Error(`BigQuery execution failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private validateQuery(query: string): void {
    const normalizedQuery = query.trim().toLowerCase();
    
    // Check write mode restrictions
    if (this.config.writeMode === WriteMode.BLOCKED) {
      // Only allow SELECT queries
      if (!normalizedQuery.startsWith('select') && !normalizedQuery.startsWith('with')) {
        throw new Error('Only SELECT queries are allowed in BLOCKED write mode');
      }
    } else if (this.config.writeMode === WriteMode.PROTECTED) {
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