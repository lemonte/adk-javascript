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
exports.getUserChoiceTool = exports.GetUserChoiceTool = void 0;
exports.getUserChoice = getUserChoice;
const long_running_tool_1 = require("./long-running-tool");
/**
 * Provides the options to the user and asks them to choose one.
 *
 * @param options List of options to present to the user
 * @param toolContext The tool context
 * @returns The user's choice (null initially for long-running operation)
 */
function getUserChoice(options, toolContext) {
    if (toolContext.actions) {
        toolContext.actions.skipSummarization = true;
    }
    return null;
}
/**
 * Tool for getting user choice from a list of options.
 *
 * This is a long-running tool that presents options to the user
 * and waits for their selection.
 */
class GetUserChoiceTool extends long_running_tool_1.LongRunningFunctionTool {
    constructor() {
        super({
            name: 'get_user_choice',
            description: 'Provides options to the user and asks them to choose one. This is a long-running operation that waits for user input.',
            func: async (params, context) => {
                return getUserChoice(params.options, context);
            },
            parameters: {
                type: 'object',
                properties: {
                    options: {
                        type: 'array',
                        items: { type: 'string' },
                        description: 'List of options to present to the user'
                    }
                },
                required: ['options']
            }
        });
    }
    getToolDefinition() {
        return super.getToolDefinition();
    }
}
exports.GetUserChoiceTool = GetUserChoiceTool;
/**
 * Pre-configured instance of the GetUserChoiceTool.
 */
exports.getUserChoiceTool = new GetUserChoiceTool();
//# sourceMappingURL=get-user-choice-tool.js.map