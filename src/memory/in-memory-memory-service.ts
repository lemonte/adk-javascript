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

import { BaseMemoryService, SearchMemoryResponse } from './base-memory-service';
import { MemoryEntry } from './memory-entry';
import { Session } from '../sessions/session';
import { Event } from '../events/event';

function userKey(appName: string, userId: string): string {
  return `${appName}/${userId}`;
}

function extractWordsLower(text: string): Set<string> {
  /**
   * Extracts words from a string and converts them to lowercase.
   */
  const words = text.match(/[A-Za-z]+/g) || [];
  return new Set(words.map(word => word.toLowerCase()));
}

function formatTimestamp(timestamp: number): string {
  /**
   * Formats the timestamp of the memory entry.
   */
  return new Date(timestamp * 1000).toISOString();
}

/**
 * An in-memory memory service for prototyping purpose only.
 * 
 * Uses keyword matching instead of semantic search.
 * 
 * This class should be used for testing and development only.
 */
export class InMemoryMemoryService extends BaseMemoryService {
  private sessionEvents: Map<string, Map<string, Event[]>> = new Map();
  /**
   * Keys are "{app_name}/{user_id}". Values are Maps of session_id to
   * session event lists.
   */

  async addSessionToMemory(session: Session): Promise<void> {
    const userKeyStr = userKey(session.appName, session.userId);

    if (!this.sessionEvents.has(userKeyStr)) {
      this.sessionEvents.set(userKeyStr, new Map());
    }

    const userSessions = this.sessionEvents.get(userKeyStr)!;
    const filteredEvents = session.events.filter(
      event => event.content && event.content.parts && event.content.parts.length > 0
    );
    
    userSessions.set(session.id, filteredEvents);
  }

  async searchMemory(params: {
    appName: string;
    userId: string;
    query: string;
  }): Promise<SearchMemoryResponse> {
    const { appName, userId, query } = params;
    const userKeyStr = userKey(appName, userId);

    const sessionEventLists = this.sessionEvents.get(userKeyStr) || new Map();
    const wordsInQuery = extractWordsLower(query);
    const response: SearchMemoryResponse = { memories: [] };

    for (const sessionEvents of sessionEventLists.values()) {
      for (const event of sessionEvents) {
        if (!event.content || !event.content.parts) {
          continue;
        }

        const textParts = event.content.parts
          .filter((part: any) => part.text)
          .map((part: any) => part.text!);
        
        if (textParts.length === 0) {
          continue;
        }

        const wordsInEvent = extractWordsLower(textParts.join(' '));
        
        if (wordsInEvent.size === 0) {
          continue;
        }

        // Check if any query word is in the event
        const hasMatch = Array.from(wordsInQuery).some(queryWord => 
          wordsInEvent.has(queryWord)
        );

        if (hasMatch) {
          response.memories.push({
            content: event.content,
            author: event.author,
            timestamp: event.timestamp ? formatTimestamp(event.timestamp) : undefined,
          });
        }
      }
    }

    return response;
  }
}