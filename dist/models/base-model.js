"use strict";
/**
 * Base model implementation for the ADK JavaScript SDK
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseModel = void 0;
const types_1 = require("../types");
const utils_1 = require("../utils");
const events_1 = require("events");
/**
 * Abstract base class for all models in the ADK
 */
class BaseModel extends events_1.EventEmitter {
    constructor(config, capabilities) {
        super();
        this.modelName = config.modelName;
        this.capabilities = capabilities;
        this.apiKey = config.apiKey;
        this.baseUrl = config.baseUrl;
        this.timeout = config.timeout || 60000; // 60 seconds
        this.retryAttempts = config.retryAttempts || 3;
        this.retryDelay = config.retryDelay || 1000; // 1 second
        this.defaultGenerationConfig = config.defaultGenerationConfig;
        this.defaultSafetySettings = config.defaultSafetySettings;
        this.metadata = config.metadata || {};
        this.logger = new utils_1.Logger(`Model:${this.modelName}`);
        this.metrics = {
            requestCount: 0,
            totalTokensUsed: 0,
            averageLatency: 0,
            errorCount: 0
        };
        this.validateConfig();
    }
    /**
     * Get model information
     */
    getInfo() {
        return {
            modelName: this.modelName,
            capabilities: this.capabilities,
            metrics: { ...this.metrics },
            metadata: { ...this.metadata }
        };
    }
    /**
     * Get model metrics
     */
    getMetrics() {
        return { ...this.metrics };
    }
    /**
     * Reset model metrics
     */
    resetMetrics() {
        this.metrics = {
            requestCount: 0,
            totalTokensUsed: 0,
            averageLatency: 0,
            errorCount: 0
        };
    }
    /**
     * Check if model supports a capability
     */
    supports(capability) {
        return !!this.capabilities[capability];
    }
    /**
     * Validate model configuration
     */
    validateConfig() {
        if (!this.modelName || this.modelName.trim() === '') {
            throw new types_1.ModelError('Model name is required');
        }
        if (this.timeout <= 0) {
            throw new types_1.ModelError('Timeout must be positive');
        }
        if (this.retryAttempts < 0) {
            throw new types_1.ModelError('Retry attempts must be non-negative');
        }
        if (this.retryDelay < 0) {
            throw new types_1.ModelError('Retry delay must be non-negative');
        }
    }
    /**
     * Validate content for model compatibility
     */
    validateContent(content) {
        for (const message of content) {
            if (!message.parts || message.parts.length === 0) {
                throw new types_1.ModelError('Message must have at least one part');
            }
            for (const part of message.parts) {
                if (part.type === 'image' && !this.capabilities.supportsImages) {
                    throw new types_1.ModelError('Model does not support image content');
                }
                if (part.type === 'audio' && !this.capabilities.supportsAudio) {
                    throw new types_1.ModelError('Model does not support audio content');
                }
                if (part.type === 'video' && !this.capabilities.supportsVideo) {
                    throw new types_1.ModelError('Model does not support video content');
                }
            }
        }
    }
    /**
     * Validate tools for model compatibility
     */
    validateTools(tools) {
        if (tools && tools.length > 0 && !this.capabilities.supportsTools) {
            throw new types_1.ModelError('Model does not support tools');
        }
    }
    /**
     * Merge generation config with defaults
     */
    mergeGenerationConfig(config) {
        if (!this.defaultGenerationConfig && !config) {
            return undefined;
        }
        return {
            ...this.defaultGenerationConfig,
            ...config
        };
    }
    /**
     * Merge safety settings with defaults
     */
    mergeSafetySettings(settings) {
        if (!this.defaultSafetySettings && !settings) {
            return undefined;
        }
        if (!this.defaultSafetySettings) {
            return settings;
        }
        if (!settings) {
            return this.defaultSafetySettings;
        }
        // Merge settings, with provided settings taking precedence
        const merged = [...this.defaultSafetySettings];
        for (const setting of settings) {
            const existingIndex = merged.findIndex(s => s.category === setting.category);
            if (existingIndex >= 0) {
                merged[existingIndex] = setting;
            }
            else {
                merged.push(setting);
            }
        }
        return merged;
    }
    /**
     * Update metrics after a request
     */
    updateMetrics(latency, tokenUsage, error) {
        this.metrics.requestCount++;
        this.metrics.lastRequestTime = new Date();
        if (error) {
            this.metrics.errorCount++;
        }
        if (tokenUsage) {
            this.metrics.totalTokensUsed += tokenUsage.totalTokens;
        }
        // Update average latency
        this.metrics.averageLatency =
            (this.metrics.averageLatency * (this.metrics.requestCount - 1) + latency) /
                this.metrics.requestCount;
    }
    /**
     * Execute with retry logic
     */
    async executeWithRetry(operation, context) {
        let lastError;
        for (let attempt = 0; attempt <= this.retryAttempts; attempt++) {
            try {
                return await operation();
            }
            catch (error) {
                lastError = error;
                if (attempt === this.retryAttempts) {
                    break; // Last attempt, don't retry
                }
                // Check if error is retryable
                if (!this.isRetryableError(error)) {
                    break;
                }
                const delay = this.retryDelay * Math.pow(2, attempt); // Exponential backoff
                this.logger.warn(`${context || 'Operation'} failed (attempt ${attempt + 1}/${this.retryAttempts + 1}), retrying in ${delay}ms`, error);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
        throw lastError;
    }
    /**
     * Check if an error is retryable
     */
    isRetryableError(error) {
        if (error instanceof types_1.ModelError) {
            // Don't retry client errors (4xx)
            return false;
        }
        // Retry network errors, timeouts, and server errors (5xx)
        return true;
    }
    /**
     * Emit model events
     */
    emitEvent(event, data) {
        this.emit(event, {
            modelName: this.modelName,
            timestamp: new Date(),
            ...data
        });
    }
}
exports.BaseModel = BaseModel;
//# sourceMappingURL=base-model.js.map