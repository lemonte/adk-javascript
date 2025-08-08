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
exports.LlmResponseUtils = void 0;
/**
 * Utility functions for LlmResponse
 */
class LlmResponseUtils {
    /**
     * Creates an LlmResponse from a GenerateContentResponse.
     *
     * @param generateContentResponse - The GenerateContentResponse to create the LlmResponse from.
     * @returns The LlmResponse.
     */
    static create(generateContentResponse) {
        const usageMetadata = generateContentResponse.usageMetadata;
        if (generateContentResponse.candidates && generateContentResponse.candidates.length > 0) {
            const candidate = generateContentResponse.candidates[0];
            if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
                return {
                    content: candidate.content,
                    groundingMetadata: candidate.groundingMetadata,
                    usageMetadata,
                };
            }
            else {
                return {
                    errorCode: candidate.finishReason,
                    errorMessage: candidate.finishMessage,
                    usageMetadata,
                };
            }
        }
        else {
            if (generateContentResponse.promptFeedback) {
                const promptFeedback = generateContentResponse.promptFeedback;
                return {
                    errorCode: promptFeedback.blockReason,
                    errorMessage: promptFeedback.blockReasonMessage,
                    usageMetadata,
                };
            }
            else {
                return {
                    errorCode: 'UNKNOWN_ERROR',
                    errorMessage: 'Unknown error.',
                    usageMetadata,
                };
            }
        }
    }
}
exports.LlmResponseUtils = LlmResponseUtils;
//# sourceMappingURL=llm-response.js.map