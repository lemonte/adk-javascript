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

/**
 * Implementation of single flow.
 */

import { BaseLlmFlow } from './base-llm-flow';
import { requestProcessor as basicProcessor } from './basic';
import { requestProcessor as identityProcessor } from './identity';
import { requestProcessor as contentsProcessor } from './contents';
import { requestProcessor as instructionsProcessor } from './instructions';

/**
 * SingleFlow is the LLM flows that handles tools calls.
 * 
 * A single flow only consider an agent itself and tools.
 * No sub-agents are allowed for single flow.
 */
export class SingleFlow extends BaseLlmFlow {
  constructor() {
    super();
    
    this.requestProcessors.push(
      basicProcessor,
      // auth_preprocessor.request_processor, // TODO: Implement auth preprocessor
      instructionsProcessor,
      identityProcessor,
      contentsProcessor,
      // TODO: Implement NL Planning processor
      // _nl_planning.request_processor,
      // TODO: Implement Code execution processor
      // _code_execution.request_processor,
    );
    
    this.responseProcessors.push(
      // TODO: Implement response processors
      // _nl_planning.response_processor,
      // _code_execution.response_processor,
    );
  }
}