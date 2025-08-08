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
import { AuthConfig } from '../../auth';
/**
 * Configuration for BigQuery credentials.
 */
export interface BigQueryCredentialsConfig extends AuthConfig {
    /**
     * The Google Cloud project ID.
     */
    projectId: string;
    /**
     * The service account key file path or key object.
     */
    keyFile?: string | object;
    /**
     * OAuth 2.0 client credentials.
     */
    clientCredentials?: {
        clientId: string;
        clientSecret: string;
        redirectUri?: string;
    };
    /**
     * Application Default Credentials (ADC) configuration.
     */
    useApplicationDefaultCredentials?: boolean;
    /**
     * Scopes required for BigQuery access.
     */
    scopes?: string[];
    /**
     * The location/region for BigQuery operations.
     */
    location?: string;
}
//# sourceMappingURL=bigquery-credentials.d.ts.map