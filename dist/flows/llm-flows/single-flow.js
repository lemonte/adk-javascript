"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SingleFlow = void 0;
/**
 * Implementation of single flow.
 */
const base_llm_flow_1 = require("./base-llm-flow");
const basic_1 = require("./basic");
const identity_1 = require("./identity");
const contents_1 = require("./contents");
const instructions_1 = require("./instructions");
/**
 * SingleFlow is the LLM flows that handles tools calls.
 *
 * A single flow only consider an agent itself and tools.
 * No sub-agents are allowed for single flow.
 */
class SingleFlow extends base_llm_flow_1.BaseLlmFlow {
    constructor() {
        super();
        this.requestProcessors.push(basic_1.requestProcessor, 
        // auth_preprocessor.request_processor, // TODO: Implement auth preprocessor
        instructions_1.requestProcessor, identity_1.requestProcessor, contents_1.requestProcessor);
        this.responseProcessors.push(
        // TODO: Implement response processors
        // _nl_planning.response_processor,
        // _code_execution.response_processor,
        );
    }
}
exports.SingleFlow = SingleFlow;
//# sourceMappingURL=single-flow.js.map