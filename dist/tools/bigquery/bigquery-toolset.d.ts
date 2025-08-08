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
import { BigQueryToolConfig } from './bigquery-tool';
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
export declare class BigQueryToolset {
    private config;
    private tools;
    constructor(config: BigQueryToolsetConfig);
    /**
     * Get all tools in the toolset.
     */
    getTools(): BaseTool[];
    /**
     * Get a specific tool by name.
     */
    getTool(name: string): BaseTool | undefined;
    private createTools;
}
//# sourceMappingURL=bigquery-toolset.d.ts.map