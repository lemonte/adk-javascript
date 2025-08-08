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
exports.BaseRetrievalTool = void 0;
const base_tool_1 = require("../base-tool");
/**
 * Base class for retrieval tools.
 *
 * This abstract class provides a common interface for different types of
 * retrieval tools, such as file-based retrieval, vector database retrieval,
 * or external API-based retrieval.
 */
class BaseRetrievalTool extends base_tool_1.BaseTool {
    constructor(config) {
        super({
            name: config.name,
            description: config.description,
            parameters: {
                type: 'object',
                properties: {
                    query: {
                        type: 'string',
                        description: 'The query to retrieve relevant information for'
                    }
                },
                required: ['query']
            }
        });
    }
    getToolDefinition() {
        return {
            type: 'function',
            function: {
                name: this.name,
                description: this.description,
                parameters: {
                    type: 'object',
                    properties: {
                        query: {
                            type: 'string',
                            description: 'The query to retrieve relevant information for'
                        }
                    },
                    required: ['query']
                }
            }
        };
    }
}
exports.BaseRetrievalTool = BaseRetrievalTool;
//# sourceMappingURL=base-retrieval-tool.js.map