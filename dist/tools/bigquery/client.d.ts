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
import { BigQueryConfig } from './config';
import { BigQueryCredentialsConfig } from './bigquery-credentials';
/**
 * Result of a BigQuery query execution.
 */
export interface QueryResult {
    /**
     * The rows returned by the query.
     */
    rows: any[];
    /**
     * Schema information for the result.
     */
    schema?: any[];
    /**
     * Total number of rows (may be larger than rows.length if limited).
     */
    totalRows?: number;
    /**
     * Job ID of the query execution.
     */
    jobId?: string;
}
/**
 * BigQuery client for executing queries and managing BigQuery resources.
 */
export declare class BigQueryClient {
    private config;
    private credentials;
    constructor(config: BigQueryConfig, credentials: BigQueryCredentialsConfig);
    /**
     * Execute a SQL query against BigQuery.
     */
    query(sql: string, options?: {
        parameters?: any[];
        maxResults?: number;
        timeoutMs?: number;
    }): Promise<QueryResult>;
    /**
     * Get information about a dataset.
     */
    getDataset(datasetId: string): Promise<any>;
    /**
     * List tables in a dataset.
     */
    listTables(datasetId: string): Promise<any[]>;
    /**
     * Get table metadata.
     */
    getTable(datasetId: string, tableId: string): Promise<any>;
    /**
     * Create a new dataset.
     */
    createDataset(datasetId: string, options?: any): Promise<any>;
    /**
     * Delete a dataset.
     */
    deleteDataset(datasetId: string, options?: {
        force?: boolean;
    }): Promise<void>;
}
//# sourceMappingURL=client.d.ts.map