"use strict";
/**
 * Models module exports
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Model = exports.GeminiModel = exports.BaseModel = void 0;
var base_model_1 = require("./base-model");
Object.defineProperty(exports, "BaseModel", { enumerable: true, get: function () { return base_model_1.BaseModel; } });
var gemini_model_1 = require("./gemini-model");
Object.defineProperty(exports, "GeminiModel", { enumerable: true, get: function () { return gemini_model_1.GeminiModel; } });
// export { OpenAIModel, OpenAIModelConfig } from './openai-model';
// TODO: Add other model implementations as needed
// export { OpenAIModel, OpenAIModelConfig } from './openai-model';
// export { AnthropicModel, AnthropicModelConfig } from './anthropic-model';
// export { OllamaModel, OllamaModelConfig } from './ollama-model';
// export { AzureOpenAIModel, AzureOpenAIModelConfig } from './azure-openai-model';
// TODO: Add model factory and utilities
// export { ModelFactory } from './model-factory';
// export { ModelRegistry } from './model-registry';
// export { createModel, getAvailableModels } from './utils';
// Re-export for convenience
var gemini_model_2 = require("./gemini-model");
Object.defineProperty(exports, "Model", { enumerable: true, get: function () { return gemini_model_2.GeminiModel; } });
// LLM Request and Response types
__exportStar(require("./llm-request"), exports);
__exportStar(require("./llm-response"), exports);
//# sourceMappingURL=index.js.map