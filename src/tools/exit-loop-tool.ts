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

import { FunctionTool } from './function-tool';
import { AdvancedToolContext } from './tool-context';
import { ToolContext } from './base-tool';
import { ToolDefinition } from '../types';

/**
 * Exits the loop.
 * 
 * Call this function only when you are instructed to do so.
 * 
 * @param toolContext The tool context
 */
export function exitLoop(toolContext: AdvancedToolContext): void {
  if (toolContext.actions) {
    toolContext.actions.escalate = true;
    toolContext.actions.skipSummarization = true;
  }
}

/**
 * Tool for exiting execution loops.
 * 
 * This tool is used to signal that the agent should exit from
 * a loop or recursive execution pattern. It should only be called
 * when explicitly instructed to do so.
 */
export class ExitLoopTool extends FunctionTool {
  constructor() {
    super({
      name: 'exit_loop',
      description: 'Exits the current execution loop. Call this function only when you are instructed to do so.',
      func: async (params: {}, context: AdvancedToolContext) => {
        exitLoop(context);
      },
      parameters: {
        type: 'object',
        properties: {},
        required: []
      }
    });
  }

  getToolDefinition(): ToolDefinition {
    return this.getDefinition();
  }
}

/**
 * Pre-configured instance of the ExitLoopTool.
 */
export const exitLoopTool = new ExitLoopTool();