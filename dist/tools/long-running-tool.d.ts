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
import { FunctionTool, FunctionToolConfig } from './function-tool';
import { ToolDefinition } from '../types';
/**
 * A function tool that returns the result asynchronously.
 *
 * This tool is used for long-running operations that may take a significant
 * amount of time to complete. The framework will call the function. Once the
 * function returns, the response will be returned asynchronously to the
 * framework which is identified by the function_call_id.
 *
 * Example:
 * ```typescript
 * const tool = new LongRunningFunctionTool({
 *   name: 'long_operation',
 *   description: 'Performs a long-running operation',
 *   func: aLongRunningFunction
 * });
 * ```
 */
export declare class LongRunningFunctionTool extends FunctionTool {
    /**
     * Whether the tool is a long running operation.
     */
    readonly isLongRunning = true;
    constructor(config: FunctionToolConfig);
    getToolDefinition(): ToolDefinition;
}
//# sourceMappingURL=long-running-tool.d.ts.map