"use strict";
/**
 * Validation utilities for the ADK JavaScript SDK
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationError = void 0;
exports.validateContent = validateContent;
exports.validateContentPart = validateContentPart;
exports.validateToolDefinition = validateToolDefinition;
exports.validateJsonSchema = validateJsonSchema;
exports.validateGenerationConfig = validateGenerationConfig;
exports.validateSafetySettings = validateSafetySettings;
exports.validateSessionId = validateSessionId;
exports.validateUserId = validateUserId;
exports.validateEmail = validateEmail;
exports.validateUrl = validateUrl;
exports.validateMimeType = validateMimeType;
const types_1 = require("../types");
/**
 * Validation error class
 */
class ValidationError extends types_1.AdkError {
    constructor(message, details) {
        super(message, 'VALIDATION_ERROR', details);
        this.name = 'ValidationError';
    }
}
exports.ValidationError = ValidationError;
/**
 * Validate content structure
 */
function validateContent(content) {
    if (!Array.isArray(content)) {
        throw new ValidationError('Content must be an array');
    }
    if (content.length === 0) {
        throw new ValidationError('Content array cannot be empty');
    }
    for (let i = 0; i < content.length; i++) {
        const message = content[i];
        if (!message || typeof message !== 'object') {
            throw new ValidationError(`Content[${i}] must be an object`);
        }
        if (!message.role || typeof message.role !== 'string') {
            throw new ValidationError(`Content[${i}] must have a valid role`);
        }
        if (!['user', 'model', 'system'].includes(message.role)) {
            throw new ValidationError(`Content[${i}] role must be 'user', 'model', or 'system'`);
        }
        if (!Array.isArray(message.parts) || message.parts.length === 0) {
            throw new ValidationError(`Content[${i}] must have non-empty parts array`);
        }
        for (let j = 0; j < message.parts.length; j++) {
            const part = message.parts[j];
            if (!part || typeof part !== 'object') {
                throw new ValidationError(`Content[${i}].parts[${j}] must be an object`);
            }
            if (!part.type || typeof part.type !== 'string') {
                throw new ValidationError(`Content[${i}].parts[${j}] must have a valid type`);
            }
            validateContentPart(part, `Content[${i}].parts[${j}]`);
        }
    }
}
/**
 * Validate individual content part
 */
function validateContentPart(part, context = 'Part') {
    switch (part.type) {
        case 'text':
            if (typeof part.text !== 'string') {
                throw new ValidationError(`${context} of type 'text' must have a string 'text' property`);
            }
            break;
        case 'image':
            if (typeof part.data !== 'string') {
                throw new ValidationError(`${context} of type 'image' must have a string 'data' property`);
            }
            if (typeof part.mimeType !== 'string') {
                throw new ValidationError(`${context} of type 'image' must have a string 'mimeType' property`);
            }
            if (!part.mimeType.startsWith('image/')) {
                throw new ValidationError(`${context} of type 'image' must have a valid image MIME type`);
            }
            break;
        case 'audio':
            if (typeof part.data !== 'string') {
                throw new ValidationError(`${context} of type 'audio' must have a string 'data' property`);
            }
            if (typeof part.mimeType !== 'string') {
                throw new ValidationError(`${context} of type 'audio' must have a string 'mimeType' property`);
            }
            if (!part.mimeType.startsWith('audio/')) {
                throw new ValidationError(`${context} of type 'audio' must have a valid audio MIME type`);
            }
            break;
        case 'video':
            if (typeof part.data !== 'string') {
                throw new ValidationError(`${context} of type 'video' must have a string 'data' property`);
            }
            if (typeof part.mimeType !== 'string') {
                throw new ValidationError(`${context} of type 'video' must have a string 'mimeType' property`);
            }
            if (!part.mimeType.startsWith('video/')) {
                throw new ValidationError(`${context} of type 'video' must have a valid video MIME type`);
            }
            break;
        case 'function_call':
            if (!part.functionCall || typeof part.functionCall !== 'object') {
                throw new ValidationError(`${context} of type 'function_call' must have a 'functionCall' object`);
            }
            if (typeof part.functionCall.name !== 'string') {
                throw new ValidationError(`${context} function call must have a string 'name'`);
            }
            if (part.functionCall.args && typeof part.functionCall.args !== 'object') {
                throw new ValidationError(`${context} function call 'args' must be an object`);
            }
            break;
        case 'function_response':
            if (!part.functionResponse || typeof part.functionResponse !== 'object') {
                throw new ValidationError(`${context} of type 'function_response' must have a 'functionResponse' object`);
            }
            if (typeof part.functionResponse.name !== 'string') {
                throw new ValidationError(`${context} function response must have a string 'name'`);
            }
            break;
        default:
            throw new ValidationError(`${context} has unsupported type: ${part.type}`);
    }
}
/**
 * Validate tool definition
 */
function validateToolDefinition(tool) {
    if (!tool || typeof tool !== 'object') {
        throw new ValidationError('Tool definition must be an object');
    }
    if (tool.type !== 'function') {
        throw new ValidationError('Tool type must be "function"');
    }
    if (!tool.function || typeof tool.function !== 'object') {
        throw new ValidationError('Tool must have a function object');
    }
    const func = tool.function;
    if (typeof func.name !== 'string' || func.name.trim() === '') {
        throw new ValidationError('Tool function must have a non-empty name');
    }
    if (typeof func.description !== 'string' || func.description.trim() === '') {
        throw new ValidationError('Tool function must have a non-empty description');
    }
    if (func.parameters) {
        validateJsonSchema(func.parameters, 'Tool function parameters');
    }
}
/**
 * Validate JSON schema (basic validation)
 */
function validateJsonSchema(schema, context = 'Schema') {
    if (!schema || typeof schema !== 'object') {
        throw new ValidationError(`${context} must be an object`);
    }
    if (schema.type && typeof schema.type !== 'string') {
        throw new ValidationError(`${context} type must be a string`);
    }
    if (schema.properties && typeof schema.properties !== 'object') {
        throw new ValidationError(`${context} properties must be an object`);
    }
    if (schema.required && !Array.isArray(schema.required)) {
        throw new ValidationError(`${context} required must be an array`);
    }
    if (schema.required) {
        for (const req of schema.required) {
            if (typeof req !== 'string') {
                throw new ValidationError(`${context} required items must be strings`);
            }
        }
    }
}
/**
 * Validate generation config
 */
function validateGenerationConfig(config) {
    if (!config || typeof config !== 'object') {
        throw new ValidationError('Generation config must be an object');
    }
    if (config.temperature !== undefined) {
        if (typeof config.temperature !== 'number' || config.temperature < 0 || config.temperature > 2) {
            throw new ValidationError('Temperature must be a number between 0 and 2');
        }
    }
    if (config.topP !== undefined) {
        if (typeof config.topP !== 'number' || config.topP < 0 || config.topP > 1) {
            throw new ValidationError('TopP must be a number between 0 and 1');
        }
    }
    if (config.topK !== undefined) {
        if (typeof config.topK !== 'number' || config.topK < 1 || !Number.isInteger(config.topK)) {
            throw new ValidationError('TopK must be a positive integer');
        }
    }
    if (config.maxOutputTokens !== undefined) {
        if (typeof config.maxOutputTokens !== 'number' || config.maxOutputTokens < 1 || !Number.isInteger(config.maxOutputTokens)) {
            throw new ValidationError('MaxOutputTokens must be a positive integer');
        }
    }
    if (config.stopSequences !== undefined) {
        if (!Array.isArray(config.stopSequences)) {
            throw new ValidationError('StopSequences must be an array');
        }
        for (const seq of config.stopSequences) {
            if (typeof seq !== 'string') {
                throw new ValidationError('Stop sequences must be strings');
            }
        }
    }
}
/**
 * Validate safety settings
 */
function validateSafetySettings(settings) {
    if (!Array.isArray(settings)) {
        throw new ValidationError('Safety settings must be an array');
    }
    const validCategories = [
        'HARM_CATEGORY_HARASSMENT',
        'HARM_CATEGORY_HATE_SPEECH',
        'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        'HARM_CATEGORY_DANGEROUS_CONTENT'
    ];
    const validThresholds = [
        'BLOCK_NONE',
        'BLOCK_ONLY_HIGH',
        'BLOCK_MEDIUM_AND_ABOVE',
        'BLOCK_LOW_AND_ABOVE'
    ];
    for (let i = 0; i < settings.length; i++) {
        const setting = settings[i];
        if (!setting || typeof setting !== 'object') {
            throw new ValidationError(`Safety setting[${i}] must be an object`);
        }
        if (!validCategories.includes(setting.category)) {
            throw new ValidationError(`Safety setting[${i}] category must be one of: ${validCategories.join(', ')}`);
        }
        if (!validThresholds.includes(setting.threshold)) {
            throw new ValidationError(`Safety setting[${i}] threshold must be one of: ${validThresholds.join(', ')}`);
        }
    }
}
/**
 * Validate session ID
 */
function validateSessionId(sessionId) {
    if (typeof sessionId !== 'string' || sessionId.trim() === '') {
        throw new ValidationError('Session ID must be a non-empty string');
    }
    // Basic format validation (alphanumeric, hyphens, underscores)
    const sessionIdRegex = /^[a-zA-Z0-9_-]+$/;
    if (!sessionIdRegex.test(sessionId)) {
        throw new ValidationError('Session ID must contain only alphanumeric characters, hyphens, and underscores');
    }
    if (sessionId.length > 128) {
        throw new ValidationError('Session ID must be 128 characters or less');
    }
}
/**
 * Validate user ID
 */
function validateUserId(userId) {
    if (typeof userId !== 'string' || userId.trim() === '') {
        throw new ValidationError('User ID must be a non-empty string');
    }
    if (userId.length > 128) {
        throw new ValidationError('User ID must be 128 characters or less');
    }
}
/**
 * Validate email address
 */
function validateEmail(email) {
    if (typeof email !== 'string' || email.trim() === '') {
        throw new ValidationError('Email must be a non-empty string');
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        throw new ValidationError('Email must be a valid email address');
    }
}
/**
 * Validate URL
 */
function validateUrl(url) {
    if (typeof url !== 'string' || url.trim() === '') {
        throw new ValidationError('URL must be a non-empty string');
    }
    try {
        new URL(url);
    }
    catch {
        throw new ValidationError('URL must be a valid URL');
    }
}
/**
 * Validate MIME type
 */
function validateMimeType(mimeType, expectedPrefix) {
    if (typeof mimeType !== 'string' || mimeType.trim() === '') {
        throw new ValidationError('MIME type must be a non-empty string');
    }
    const mimeTypeRegex = /^[a-zA-Z0-9][a-zA-Z0-9!#$&\-\^_]*\/[a-zA-Z0-9][a-zA-Z0-9!#$&\-\^_.]*$/;
    if (!mimeTypeRegex.test(mimeType)) {
        throw new ValidationError('MIME type must be in valid format (type/subtype)');
    }
    if (expectedPrefix && !mimeType.startsWith(expectedPrefix)) {
        throw new ValidationError(`MIME type must start with '${expectedPrefix}'`);
    }
}
//# sourceMappingURL=validation.js.map