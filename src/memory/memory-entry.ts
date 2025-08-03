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

import { Content } from '@google/generative-ai';

/**
 * Represent one memory entry.
 */
export interface MemoryEntry {
  /**
   * The main content of the memory.
   */
  content: Content;

  /**
   * The author of the memory.
   */
  author?: string;

  /**
   * The timestamp when the original content of this memory happened.
   * 
   * This string will be forwarded to LLM. Preferred format is ISO 8601 format.
   */
  timestamp?: string;
}