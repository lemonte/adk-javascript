"use strict";
/**
 * LLM Request implementation for the ADK JavaScript SDK
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.LlmRequest = void 0;
/**
 * LLM Request class that wraps ModelRequestConfig with additional functionality
 */
class LlmRequest {
    constructor() {
        this.contents = [];
        this.instructions = [];
        this.contents = [];
        this.instructions = [];
    }
    /**
     * Append instructions to the request
     */
    appendInstructions(newInstructions) {
        this.instructions.push(...newInstructions);
        // Update system instruction with combined instructions
        if (this.instructions.length > 0) {
            const combinedInstructions = this.instructions.join('\n');
            if (this.systemInstruction) {
                this.systemInstruction = `${this.systemInstruction}\n${combinedInstructions}`;
            }
            else {
                this.systemInstruction = combinedInstructions;
            }
        }
    }
    /**
     * Convert to ModelRequestConfig for use with models
     */
    toModelRequestConfig() {
        return {
            model: this.model || 'gemini-2.0-flash',
            messages: this.contents,
            tools: this.tools,
            toolChoice: this.toolConfig?.functionCallingConfig?.mode,
            generationConfig: this.config?.generationConfig,
            safetySettings: this.safetySettings,
            systemInstruction: this.systemInstruction
        };
    }
}
exports.LlmRequest = LlmRequest;
//# sourceMappingURL=llm-request.js.map