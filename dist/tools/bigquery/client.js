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
exports.BigQueryClient = void 0;
/**
 * BigQuery client for executing queries and managing BigQuery resources.
 */
class BigQueryClient {
    constructor(config, credentials) {
        this.config = config;
        this.credentials = credentials;
    }
    /**
     * Execute a SQL query against BigQuery.
     */
    async query(sql, options) {
        // This is a placeholder implementation
        // In a real implementation, this would use the BigQuery client library
        throw new Error('BigQuery client not implemented yet. This requires the @google-cloud/bigquery package.');
    }
    /**
     * Get information about a dataset.
     */
    async getDataset(datasetId) {
        throw new Error('BigQuery client not implemented yet.');
    }
    /**
     * List tables in a dataset.
     */
    async listTables(datasetId) {
        throw new Error('BigQuery client not implemented yet.');
    }
    /**
     * Get table metadata.
     */
    async getTable(datasetId, tableId) {
        throw new Error('BigQuery client not implemented yet.');
    }
    /**
     * Create a new dataset.
     */
    async createDataset(datasetId, options) {
        throw new Error('BigQuery client not implemented yet.');
    }
    /**
     * Delete a dataset.
     */
    async deleteDataset(datasetId, options) {
        throw new Error('BigQuery client not implemented yet.');
    }
}
exports.BigQueryClient = BigQueryClient;
//# sourceMappingURL=client.js.map