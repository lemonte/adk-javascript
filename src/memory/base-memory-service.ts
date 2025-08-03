// Copyright 2025 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { MemoryEntry } from './memory-entry';
import { Session } from '../sessions/session';

/**
 * Represents the response from a memory search.
 */
export interface SearchMemoryResponse {
  /**
   * A list of memory entries that relate to the search query.
   */
  memories: MemoryEntry[];
}

/**
 * Base class for memory services.
 * 
 * The service provides functionalities to ingest sessions into memory so that
 * the memory can be used for user queries.
 */
export abstract class BaseMemoryService {
  /**
   * Adds a session to the memory service.
   * 
   * A session may be added multiple times during its lifetime.
   * 
   * @param session - The session to add.
   */
  abstract addSessionToMemory(session: Session): Promise<void>;

  /**
   * Searches for sessions that match the query.
   * 
   * @param params - The search parameters.
   * @param params.appName - The name of the application.
   * @param params.userId - The id of the user.
   * @param params.query - The query to search for.
   * @returns A SearchMemoryResponse containing the matching memories.
   */
  abstract searchMemory(params: {
    appName: string;
    userId: string;
    query: string;
  }): Promise<SearchMemoryResponse>;
}