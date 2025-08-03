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
import { BigQueryTool, BigQueryToolConfig } from './bigquery-tool';
import { BigQueryConfig } from './config';
import { BigQueryCredentialsConfig } from './bigquery-credentials';

/**
 * Configuration for the BigQuery toolset.
 */
export interface BigQueryToolsetConfig {
  /**
   * BigQuery configuration.
   */
  config: BigQueryConfig;

  /**
   * BigQuery credentials configuration.
   */
  credentials: BigQueryCredentialsConfig;

  /**
   * Whether to include metadata tools.
   */
  includeMetadataTools?: boolean;

  /**
   * Whether to include data insights tools.
   */
  includeDataInsightsTools?: boolean;

  /**
   * Custom tool configurations.
   */
  customTools?: Partial<BigQueryToolConfig>[];
}

/**
 * A collection of BigQuery tools for comprehensive data operations.
 * 
 * This toolset provides a complete set of tools for working with BigQuery,
 * including query execution, metadata exploration, and data insights.
 */
export class BigQueryToolset {
  private config: BigQueryToolsetConfig;
  private tools: BaseTool[];

  constructor(config: BigQueryToolsetConfig) {
    this.config = config;
    this.tools = this.createTools();
  }

  /**
   * Get all tools in the toolset.
   */
  getTools(): BaseTool[] {
    return this.tools;
  }

  /**
   * Get a specific tool by name.
   */
  getTool(name: string): BaseTool | undefined {
    return this.tools.find(tool => tool.name === name);
  }

  private createTools(): BaseTool[] {
    const tools: BaseTool[] = [];

    // Main BigQuery query tool
    tools.push(new BigQueryTool({
      config: this.config.config,
      credentials: this.config.credentials,
      name: 'bigquery_query',
      description: 'Execute SQL queries against BigQuery datasets',
    }));

    // Metadata tools
    if (this.config.includeMetadataTools) {
      tools.push(new BigQueryTool({
        config: this.config.config,
        credentials: this.config.credentials,
        name: 'bigquery_list_datasets',
        description: 'List available BigQuery datasets',
      }));

      tools.push(new BigQueryTool({
        config: this.config.config,
        credentials: this.config.credentials,
        name: 'bigquery_list_tables',
        description: 'List tables in a BigQuery dataset',
      }));

      tools.push(new BigQueryTool({
        config: this.config.config,
        credentials: this.config.credentials,
        name: 'bigquery_describe_table',
        description: 'Get schema and metadata for a BigQuery table',
      }));
    }

    // Data insights tools
    if (this.config.includeDataInsightsTools) {
      tools.push(new BigQueryTool({
        config: this.config.config,
        credentials: this.config.credentials,
        name: 'bigquery_data_profile',
        description: 'Generate data profiling insights for a BigQuery table',
      }));

      tools.push(new BigQueryTool({
        config: this.config.config,
        credentials: this.config.credentials,
        name: 'bigquery_data_quality',
        description: 'Analyze data quality metrics for a BigQuery table',
      }));
    }

    // Custom tools
    if (this.config.customTools) {
      for (const customToolConfig of this.config.customTools) {
        tools.push(new BigQueryTool({
          config: this.config.config,
          credentials: this.config.credentials,
          ...customToolConfig,
        }));
      }
    }

    return tools;
  }
}