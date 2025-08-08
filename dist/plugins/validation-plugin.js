"use strict";
/**
 * Validation plugin for ADK JavaScript
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationPlugin = void 0;
const base_plugin_1 = require("./base-plugin");
const constants_1 = require("./constants");
/**
 * Plugin that provides comprehensive validation for inputs, outputs, and parameters
 */
class ValidationPlugin extends base_plugin_1.BasePlugin {
    constructor(config = {}) {
        const fullConfig = {
            name: 'validation-plugin',
            version: '1.0.0',
            description: 'Provides comprehensive validation for inputs, outputs, and parameters',
            priority: constants_1.PLUGIN_PRIORITIES.HIGH,
            hooks: [
                'before_run',
                'after_run',
                'before_agent',
                'after_agent',
                'before_tool',
                'after_tool',
                'before_model',
                'after_model'
            ],
            settings: {
                enableInputValidation: true,
                enableOutputValidation: true,
                enableParameterValidation: true,
                enableSchemaValidation: true,
                strictMode: false,
                customValidators: {},
                validationRules: {},
                errorHandling: 'throw',
                sanitizeInputs: true,
                sanitizeOutputs: false,
                maxInputSize: 1024 * 1024, // 1MB
                maxOutputSize: 10 * 1024 * 1024, // 10MB
                allowedDataTypes: ['string', 'number', 'boolean', 'object', 'array'],
                blockedPatterns: [],
                requiredFields: {},
                fieldConstraints: {},
                ...config.settings
            },
            ...config
        };
        super(fullConfig);
        const settings = fullConfig.settings;
        this.enableInputValidation = settings.enableInputValidation;
        this.enableOutputValidation = settings.enableOutputValidation;
        this.enableParameterValidation = settings.enableParameterValidation;
        this.enableSchemaValidation = settings.enableSchemaValidation;
        this.strictMode = settings.strictMode;
        this.customValidators = new Map(Object.entries(settings.customValidators));
        this.validationRules = settings.validationRules;
        this.errorHandling = settings.errorHandling;
        this.sanitizeInputs = settings.sanitizeInputs;
        this.sanitizeOutputs = settings.sanitizeOutputs;
        this.maxInputSize = settings.maxInputSize;
        this.maxOutputSize = settings.maxOutputSize;
        this.allowedDataTypes = settings.allowedDataTypes;
        this.blockedPatterns = (settings.blockedPatterns || []).map(pattern => new RegExp(pattern));
        this.requiredFields = settings.requiredFields;
        this.fieldConstraints = settings.fieldConstraints;
        this.validationStats = {
            totalValidations: 0,
            passedValidations: 0,
            failedValidations: 0,
            warningsGenerated: 0,
            sanitizationsPerformed: 0
        };
    }
    async onInitialize() {
        this.log('info', 'Validation plugin initialized');
        // Register built-in validators
        this.registerBuiltInValidators();
        // Validate plugin configuration
        this.validatePluginConfig();
    }
    async onDestroy() {
        this.log('info', 'Validation plugin destroyed');
        // Log final statistics
        this.log('info', 'Final validation statistics:', this.validationStats);
    }
    async beforeRunCallback(context) {
        if (this.enableInputValidation) {
            const validationResult = this.validateRunInput(context);
            this.handleValidationResult(validationResult, 'run_input');
            if (validationResult.sanitizedData) {
                // Apply sanitized data if available
                Object.assign(context, validationResult.sanitizedData);
            }
        }
        return context;
    }
    async afterRunCallback(context) {
        if (this.enableOutputValidation) {
            const validationResult = this.validateRunOutput(context);
            this.handleValidationResult(validationResult, 'run_output');
        }
        return context;
    }
    async beforeAgentCallback(context) {
        if (this.enableInputValidation) {
            const validationResult = this.validateAgentInput(context);
            this.handleValidationResult(validationResult, 'agent_input');
            if (validationResult.sanitizedData) {
                context.input = validationResult.sanitizedData.input || context.input;
            }
        }
        if (this.enableParameterValidation) {
            const paramValidationResult = this.validateAgentParameters(context);
            this.handleValidationResult(paramValidationResult, 'agent_parameters');
        }
        return context;
    }
    async afterAgentCallback(context) {
        if (this.enableOutputValidation) {
            const validationResult = this.validateAgentOutput(context);
            this.handleValidationResult(validationResult, 'agent_output');
        }
        return context;
    }
    async beforeToolCallback(context) {
        if (this.enableInputValidation) {
            const validationResult = this.validateToolInput(context);
            this.handleValidationResult(validationResult, 'tool_input');
            if (validationResult.sanitizedData) {
                context.toolArgs = validationResult.sanitizedData.toolArgs || context.toolArgs;
            }
        }
        if (this.enableParameterValidation) {
            const paramValidationResult = this.validateToolParameters(context);
            this.handleValidationResult(paramValidationResult, 'tool_parameters');
        }
        return context;
    }
    async afterToolCallback(context) {
        if (this.enableOutputValidation) {
            const validationResult = this.validateToolOutput(context);
            this.handleValidationResult(validationResult, 'tool_output');
        }
        return context;
    }
    async beforeModelCallback(context) {
        if (this.enableInputValidation) {
            const validationResult = this.validateModelInput(context);
            this.handleValidationResult(validationResult, 'model_input');
            if (validationResult.sanitizedData) {
                context.prompt = validationResult.sanitizedData.prompt || context.prompt;
            }
        }
        if (this.enableParameterValidation) {
            const paramValidationResult = this.validateModelParameters(context);
            this.handleValidationResult(paramValidationResult, 'model_parameters');
        }
        return context;
    }
    async afterModelCallback(context) {
        if (this.enableOutputValidation) {
            const validationResult = this.validateModelOutput(context);
            this.handleValidationResult(validationResult, 'model_output');
        }
        return context;
    }
    /**
     * Validate run input
     */
    validateRunInput(context) {
        const errors = [];
        const warnings = [];
        let sanitizedData = {};
        // Basic validation
        if (!context.runId) {
            errors.push({
                field: 'runId',
                message: 'Run ID is required',
                code: 'REQUIRED_FIELD_MISSING'
            });
        }
        // Size validation
        const inputSize = this.calculateDataSize(context);
        if (inputSize > this.maxInputSize) {
            errors.push({
                field: 'context',
                message: `Input size (${inputSize}) exceeds maximum allowed size (${this.maxInputSize})`,
                code: 'INPUT_SIZE_EXCEEDED',
                value: inputSize
            });
        }
        // Sanitization
        if (this.sanitizeInputs) {
            sanitizedData = this.sanitizeData(context);
            if (sanitizedData !== context) {
                this.validationStats.sanitizationsPerformed++;
            }
        }
        return this.createValidationResult(errors, warnings, sanitizedData);
    }
    /**
     * Validate run output
     */
    validateRunOutput(context) {
        const errors = [];
        const warnings = [];
        // Size validation
        const outputSize = this.calculateDataSize(context);
        if (outputSize > this.maxOutputSize) {
            errors.push({
                field: 'context',
                message: `Output size (${outputSize}) exceeds maximum allowed size (${this.maxOutputSize})`,
                code: 'OUTPUT_SIZE_EXCEEDED',
                value: outputSize
            });
        }
        // Status validation
        if (context.status && !['success', 'error', 'timeout', 'cancelled'].includes(context.status)) {
            warnings.push({
                field: 'status',
                message: `Unknown status: ${context.status}`,
                code: 'UNKNOWN_STATUS',
                value: context.status
            });
        }
        return this.createValidationResult(errors, warnings);
    }
    /**
     * Validate agent input
     */
    validateAgentInput(context) {
        const errors = [];
        const warnings = [];
        let sanitizedData = {};
        const agentRule = this.validationRules.agents?.[context.agentName];
        // Basic validation
        if (!context.agentName) {
            errors.push({
                field: 'agentName',
                message: 'Agent name is required',
                code: 'REQUIRED_FIELD_MISSING'
            });
        }
        // Agent whitelist/blacklist
        if (agentRule?.allowedAgents && !agentRule.allowedAgents.includes(context.agentName)) {
            errors.push({
                field: 'agentName',
                message: `Agent '${context.agentName}' is not in the allowed list`,
                code: 'AGENT_NOT_ALLOWED',
                value: context.agentName
            });
        }
        if (agentRule?.blockedAgents && agentRule.blockedAgents.includes(context.agentName)) {
            errors.push({
                field: 'agentName',
                message: `Agent '${context.agentName}' is blocked`,
                code: 'AGENT_BLOCKED',
                value: context.agentName
            });
        }
        // Schema validation
        if (this.enableSchemaValidation && agentRule?.inputSchema) {
            const schemaErrors = this.validateSchema(context.input, agentRule.inputSchema, 'input');
            errors.push(...schemaErrors);
        }
        // Custom validation
        if (agentRule?.customValidator) {
            const customResult = this.runCustomValidator(agentRule.customValidator, context.input, context);
            errors.push(...customResult.errors);
            warnings.push(...customResult.warnings);
        }
        // Sanitization
        if (this.sanitizeInputs) {
            sanitizedData.input = this.sanitizeData(context.input);
            if (sanitizedData.input !== context.input) {
                this.validationStats.sanitizationsPerformed++;
            }
        }
        return this.createValidationResult(errors, warnings, sanitizedData);
    }
    /**
     * Validate agent output
     */
    validateAgentOutput(context) {
        const errors = [];
        const warnings = [];
        const agentRule = this.validationRules.agents?.[context.agentName];
        // Steps validation
        if (agentRule?.maxSteps && context.totalSteps && context.totalSteps > agentRule.maxSteps) {
            errors.push({
                field: 'totalSteps',
                message: `Total steps (${context.totalSteps}) exceeds maximum allowed (${agentRule.maxSteps})`,
                code: 'MAX_STEPS_EXCEEDED',
                value: context.totalSteps
            });
        }
        if (agentRule?.minSteps && context.totalSteps && context.totalSteps < agentRule.minSteps) {
            warnings.push({
                field: 'totalSteps',
                message: `Total steps (${context.totalSteps}) is below minimum expected (${agentRule.minSteps})`,
                code: 'MIN_STEPS_NOT_REACHED',
                value: context.totalSteps
            });
        }
        // Schema validation
        if (this.enableSchemaValidation && agentRule?.outputSchema) {
            const schemaErrors = this.validateSchema(context.output, agentRule.outputSchema, 'output');
            errors.push(...schemaErrors);
        }
        return this.createValidationResult(errors, warnings);
    }
    /**
     * Validate agent parameters
     */
    validateAgentParameters(context) {
        const errors = [];
        const warnings = [];
        if (!context.agentConfig) {
            return this.createValidationResult(errors, warnings);
        }
        // Validate agent configuration parameters
        const configErrors = this.validateObjectConstraints(context.agentConfig, 'agentConfig');
        errors.push(...configErrors);
        return this.createValidationResult(errors, warnings);
    }
    /**
     * Validate tool input
     */
    validateToolInput(context) {
        const errors = [];
        const warnings = [];
        let sanitizedData = {};
        const toolRule = this.validationRules.tools?.[context.toolName];
        // Basic validation
        if (!context.toolName) {
            errors.push({
                field: 'toolName',
                message: 'Tool name is required',
                code: 'REQUIRED_FIELD_MISSING'
            });
        }
        // Required parameters
        if (toolRule?.requiredParams) {
            for (const param of toolRule.requiredParams) {
                if (!context.toolArgs || !(param in context.toolArgs)) {
                    errors.push({
                        field: `toolArgs.${param}`,
                        message: `Required parameter '${param}' is missing`,
                        code: 'REQUIRED_PARAMETER_MISSING',
                        constraint: param
                    });
                }
            }
        }
        // Parameter constraints
        if (toolRule?.paramConstraints && context.toolArgs) {
            for (const [param, constraint] of Object.entries(toolRule.paramConstraints)) {
                if (param in context.toolArgs) {
                    const paramErrors = this.validateFieldConstraint(context.toolArgs[param], constraint, `toolArgs.${param}`);
                    errors.push(...paramErrors);
                }
            }
        }
        // Schema validation
        if (this.enableSchemaValidation && toolRule?.inputSchema) {
            const schemaErrors = this.validateSchema(context.toolArgs, toolRule.inputSchema, 'toolArgs');
            errors.push(...schemaErrors);
        }
        // Custom validation
        if (toolRule?.customValidator) {
            const customResult = this.runCustomValidator(toolRule.customValidator, context.toolArgs, context);
            errors.push(...customResult.errors);
            warnings.push(...customResult.warnings);
        }
        // Sanitization
        if (this.sanitizeInputs) {
            sanitizedData.toolArgs = this.sanitizeData(context.toolArgs);
            if (sanitizedData.toolArgs !== context.toolArgs) {
                this.validationStats.sanitizationsPerformed++;
            }
        }
        return this.createValidationResult(errors, warnings, sanitizedData);
    }
    /**
     * Validate tool output
     */
    validateToolOutput(context) {
        const errors = [];
        const warnings = [];
        const toolRule = this.validationRules.tools?.[context.toolName];
        // Schema validation
        if (this.enableSchemaValidation && toolRule?.outputSchema && !context.error) {
            const schemaErrors = this.validateSchema(context.toolResult, toolRule.outputSchema, 'toolResult');
            errors.push(...schemaErrors);
        }
        return this.createValidationResult(errors, warnings);
    }
    /**
     * Validate tool parameters
     */
    validateToolParameters(context) {
        const errors = [];
        const warnings = [];
        if (!context.toolConfig) {
            return this.createValidationResult(errors, warnings);
        }
        // Validate tool configuration parameters
        const configErrors = this.validateObjectConstraints(context.toolConfig, 'toolConfig');
        errors.push(...configErrors);
        return this.createValidationResult(errors, warnings);
    }
    /**
     * Validate model input
     */
    validateModelInput(context) {
        const errors = [];
        const warnings = [];
        let sanitizedData = {};
        const modelRule = this.validationRules.models?.[context.modelName];
        // Basic validation
        if (!context.modelName) {
            errors.push({
                field: 'modelName',
                message: 'Model name is required',
                code: 'REQUIRED_FIELD_MISSING'
            });
        }
        if (!context.prompt) {
            errors.push({
                field: 'prompt',
                message: 'Prompt is required',
                code: 'REQUIRED_FIELD_MISSING'
            });
        }
        // Model whitelist/blacklist
        if (modelRule?.allowedModels && !modelRule.allowedModels.includes(context.modelName)) {
            errors.push({
                field: 'modelName',
                message: `Model '${context.modelName}' is not in the allowed list`,
                code: 'MODEL_NOT_ALLOWED',
                value: context.modelName
            });
        }
        if (modelRule?.blockedModels && modelRule.blockedModels.includes(context.modelName)) {
            errors.push({
                field: 'modelName',
                message: `Model '${context.modelName}' is blocked`,
                code: 'MODEL_BLOCKED',
                value: context.modelName
            });
        }
        // Token validation
        if (context.prompt) {
            const estimatedTokens = this.estimateTokens(context.prompt);
            if (modelRule?.maxTokens && estimatedTokens > modelRule.maxTokens) {
                errors.push({
                    field: 'prompt',
                    message: `Estimated tokens (${estimatedTokens}) exceeds maximum allowed (${modelRule.maxTokens})`,
                    code: 'MAX_TOKENS_EXCEEDED',
                    value: estimatedTokens
                });
            }
            if (modelRule?.minTokens && estimatedTokens < modelRule.minTokens) {
                warnings.push({
                    field: 'prompt',
                    message: `Estimated tokens (${estimatedTokens}) is below minimum expected (${modelRule.minTokens})`,
                    code: 'MIN_TOKENS_NOT_REACHED',
                    value: estimatedTokens
                });
            }
        }
        // Schema validation
        if (this.enableSchemaValidation && modelRule?.inputSchema) {
            const schemaErrors = this.validateSchema(context.prompt, modelRule.inputSchema, 'prompt');
            errors.push(...schemaErrors);
        }
        // Custom validation
        if (modelRule?.customValidator) {
            const customResult = this.runCustomValidator(modelRule.customValidator, context.prompt, context);
            errors.push(...customResult.errors);
            warnings.push(...customResult.warnings);
        }
        // Sanitization
        if (this.sanitizeInputs) {
            sanitizedData.prompt = this.sanitizeData(context.prompt);
            if (sanitizedData.prompt !== context.prompt) {
                this.validationStats.sanitizationsPerformed++;
            }
        }
        return this.createValidationResult(errors, warnings, sanitizedData);
    }
    /**
     * Validate model output
     */
    validateModelOutput(context) {
        const errors = [];
        const warnings = [];
        const modelRule = this.validationRules.models?.[context.modelName];
        // Schema validation
        if (this.enableSchemaValidation && modelRule?.outputSchema && !context.error) {
            const schemaErrors = this.validateSchema(context.response, modelRule.outputSchema, 'response');
            errors.push(...schemaErrors);
        }
        // Token usage validation
        if (context.tokens) {
            if (modelRule?.maxTokens && context.tokens.total && context.tokens.total > modelRule.maxTokens) {
                warnings.push({
                    field: 'tokens.total',
                    message: `Total tokens used (${context.tokens.total}) exceeds expected maximum (${modelRule.maxTokens})`,
                    code: 'TOKEN_USAGE_HIGH',
                    value: context.tokens.total
                });
            }
        }
        return this.createValidationResult(errors, warnings);
    }
    /**
     * Validate model parameters
     */
    validateModelParameters(context) {
        const errors = [];
        const warnings = [];
        if (!context.modelConfig) {
            return this.createValidationResult(errors, warnings);
        }
        // Validate model configuration parameters
        const configErrors = this.validateObjectConstraints(context.modelConfig, 'modelConfig');
        errors.push(...configErrors);
        return this.createValidationResult(errors, warnings);
    }
    /**
     * Validate schema
     */
    validateSchema(data, schema, fieldPath) {
        const errors = [];
        // Simple schema validation (in a real implementation, you might use a library like Joi or Ajv)
        if (schema.type && typeof data !== schema.type) {
            errors.push({
                field: fieldPath,
                message: `Expected type '${schema.type}' but got '${typeof data}'`,
                code: 'TYPE_MISMATCH',
                value: data,
                constraint: schema.type
            });
        }
        if (schema.required && (data === null || data === undefined)) {
            errors.push({
                field: fieldPath,
                message: 'Field is required',
                code: 'REQUIRED_FIELD_MISSING',
                constraint: 'required'
            });
        }
        return errors;
    }
    /**
     * Validate field constraint
     */
    validateFieldConstraint(value, constraint, fieldPath) {
        const errors = [];
        // Type validation
        if (constraint.type && typeof value !== constraint.type) {
            errors.push({
                field: fieldPath,
                message: `Expected type '${constraint.type}' but got '${typeof value}'`,
                code: 'TYPE_MISMATCH',
                value,
                constraint: constraint.type
            });
        }
        // Required validation
        if (constraint.required && (value === null || value === undefined)) {
            errors.push({
                field: fieldPath,
                message: 'Field is required',
                code: 'REQUIRED_FIELD_MISSING',
                constraint: 'required'
            });
        }
        // String validations
        if (typeof value === 'string') {
            if (constraint.minLength && value.length < constraint.minLength) {
                errors.push({
                    field: fieldPath,
                    message: `String length (${value.length}) is below minimum (${constraint.minLength})`,
                    code: 'MIN_LENGTH_NOT_REACHED',
                    value,
                    constraint: constraint.minLength.toString()
                });
            }
            if (constraint.maxLength && value.length > constraint.maxLength) {
                errors.push({
                    field: fieldPath,
                    message: `String length (${value.length}) exceeds maximum (${constraint.maxLength})`,
                    code: 'MAX_LENGTH_EXCEEDED',
                    value,
                    constraint: constraint.maxLength.toString()
                });
            }
            if (constraint.pattern && !new RegExp(constraint.pattern).test(value)) {
                errors.push({
                    field: fieldPath,
                    message: `String does not match required pattern: ${constraint.pattern}`,
                    code: 'PATTERN_MISMATCH',
                    value,
                    constraint: constraint.pattern
                });
            }
        }
        // Number validations
        if (typeof value === 'number') {
            if (constraint.min !== undefined && value < constraint.min) {
                errors.push({
                    field: fieldPath,
                    message: `Value (${value}) is below minimum (${constraint.min})`,
                    code: 'MIN_VALUE_NOT_REACHED',
                    value,
                    constraint: constraint.min.toString()
                });
            }
            if (constraint.max !== undefined && value > constraint.max) {
                errors.push({
                    field: fieldPath,
                    message: `Value (${value}) exceeds maximum (${constraint.max})`,
                    code: 'MAX_VALUE_EXCEEDED',
                    value,
                    constraint: constraint.max.toString()
                });
            }
        }
        // Enum validation
        if (constraint.enum && !constraint.enum.includes(value)) {
            errors.push({
                field: fieldPath,
                message: `Value '${value}' is not in allowed values: [${constraint.enum.join(', ')}]`,
                code: 'ENUM_MISMATCH',
                value,
                constraint: constraint.enum.join(', ')
            });
        }
        // Custom validator
        if (constraint.customValidator) {
            const customResult = this.runCustomValidator(constraint.customValidator, value);
            errors.push(...customResult.errors);
        }
        return errors;
    }
    /**
     * Validate object constraints
     */
    validateObjectConstraints(obj, fieldPath) {
        const errors = [];
        if (!obj || typeof obj !== 'object') {
            return errors;
        }
        for (const [key, value] of Object.entries(obj)) {
            const constraint = this.fieldConstraints[key];
            if (constraint) {
                const fieldErrors = this.validateFieldConstraint(value, constraint, `${fieldPath}.${key}`);
                errors.push(...fieldErrors);
            }
        }
        return errors;
    }
    /**
     * Run custom validator
     */
    runCustomValidator(validatorName, value, context) {
        const validator = this.customValidators.get(validatorName);
        if (!validator) {
            return {
                isValid: false,
                errors: [{
                        field: 'validator',
                        message: `Custom validator '${validatorName}' not found`,
                        code: 'VALIDATOR_NOT_FOUND'
                    }],
                warnings: []
            };
        }
        try {
            return validator(value, context);
        }
        catch (error) {
            return {
                isValid: false,
                errors: [{
                        field: 'validator',
                        message: `Custom validator '${validatorName}' threw an error: ${error}`,
                        code: 'VALIDATOR_ERROR'
                    }],
                warnings: []
            };
        }
    }
    /**
     * Calculate data size
     */
    calculateDataSize(data) {
        try {
            return JSON.stringify(data).length * 2; // Rough estimate (UTF-16)
        }
        catch {
            return 1000; // Default size for non-serializable data
        }
    }
    /**
     * Estimate tokens in text
     */
    estimateTokens(text) {
        // Simple estimation: roughly 4 characters per token
        return Math.ceil(text.length / 4);
    }
    /**
     * Sanitize data
     */
    sanitizeData(data) {
        if (typeof data === 'string') {
            return this.sanitizeString(data);
        }
        if (Array.isArray(data)) {
            return data.map(item => this.sanitizeData(item));
        }
        if (data && typeof data === 'object') {
            const sanitized = {};
            for (const [key, value] of Object.entries(data)) {
                sanitized[key] = this.sanitizeData(value);
            }
            return sanitized;
        }
        return data;
    }
    /**
     * Sanitize string
     */
    sanitizeString(str) {
        let sanitized = str;
        // Remove blocked patterns
        for (const pattern of this.blockedPatterns) {
            sanitized = sanitized.replace(pattern, '[BLOCKED]');
        }
        // Basic HTML/script sanitization
        sanitized = sanitized.replace(/<script[^>]*>.*?<\/script>/gi, '');
        sanitized = sanitized.replace(/<[^>]*>/g, '');
        return sanitized;
    }
    /**
     * Create validation result
     */
    createValidationResult(errors, warnings, sanitizedData) {
        this.validationStats.totalValidations++;
        if (errors.length > 0) {
            this.validationStats.failedValidations++;
        }
        else {
            this.validationStats.passedValidations++;
        }
        this.validationStats.warningsGenerated += warnings.length;
        return {
            isValid: errors.length === 0,
            errors,
            warnings,
            sanitizedData
        };
    }
    /**
     * Handle validation result
     */
    handleValidationResult(result, context) {
        if (!result.isValid) {
            const errorMessage = `Validation failed for ${context}: ${result.errors.map(e => e.message).join(', ')}`;
            switch (this.errorHandling) {
                case 'throw':
                    throw new Error(errorMessage);
                case 'log':
                    this.log('error', errorMessage, result.errors);
                    break;
                case 'ignore':
                    // Do nothing
                    break;
            }
        }
        if (result.warnings.length > 0) {
            const warningMessage = `Validation warnings for ${context}: ${result.warnings.map(w => w.message).join(', ')}`;
            this.log('warn', warningMessage, result.warnings);
        }
    }
    /**
     * Register built-in validators
     */
    registerBuiltInValidators() {
        // Email validator
        this.customValidators.set('email', (value) => {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const isValid = emailRegex.test(value);
            return {
                isValid,
                errors: isValid ? [] : [{
                        field: 'value',
                        message: 'Invalid email format',
                        code: 'INVALID_EMAIL'
                    }],
                warnings: []
            };
        });
        // URL validator
        this.customValidators.set('url', (value) => {
            try {
                new URL(value);
                return { isValid: true, errors: [], warnings: [] };
            }
            catch {
                return {
                    isValid: false,
                    errors: [{
                            field: 'value',
                            message: 'Invalid URL format',
                            code: 'INVALID_URL'
                        }],
                    warnings: []
                };
            }
        });
        // UUID validator
        this.customValidators.set('uuid', (value) => {
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
            const isValid = uuidRegex.test(value);
            return {
                isValid,
                errors: isValid ? [] : [{
                        field: 'value',
                        message: 'Invalid UUID format',
                        code: 'INVALID_UUID'
                    }],
                warnings: []
            };
        });
    }
    /**
     * Validate plugin configuration
     */
    validatePluginConfig() {
        if (this.maxInputSize <= 0) {
            throw new Error('maxInputSize must be greater than 0');
        }
        if (this.maxOutputSize <= 0) {
            throw new Error('maxOutputSize must be greater than 0');
        }
        if (!['throw', 'log', 'ignore'].includes(this.errorHandling)) {
            throw new Error('errorHandling must be one of: throw, log, ignore');
        }
    }
    /**
     * Add custom validator
     */
    addCustomValidator(name, validator) {
        this.customValidators.set(name, validator);
        this.log('info', `Custom validator '${name}' added`);
    }
    /**
     * Remove custom validator
     */
    removeCustomValidator(name) {
        const removed = this.customValidators.delete(name);
        if (removed) {
            this.log('info', `Custom validator '${name}' removed`);
        }
        return removed;
    }
    /**
     * Update validation rules
     */
    updateValidationRules(rules) {
        this.validationRules = { ...this.validationRules, ...rules };
        this.log('info', 'Validation rules updated');
    }
    /**
     * Get validation statistics
     */
    getValidationStats() {
        return { ...this.validationStats };
    }
    /**
     * Reset validation statistics
     */
    resetValidationStats() {
        this.validationStats = {
            totalValidations: 0,
            passedValidations: 0,
            failedValidations: 0,
            warningsGenerated: 0,
            sanitizationsPerformed: 0
        };
        this.log('info', 'Validation statistics reset');
    }
    async performHealthCheck() {
        return {
            validationEnabled: {
                input: this.enableInputValidation,
                output: this.enableOutputValidation,
                parameters: this.enableParameterValidation,
                schema: this.enableSchemaValidation
            },
            strictMode: this.strictMode,
            errorHandling: this.errorHandling,
            sanitization: {
                inputs: this.sanitizeInputs,
                outputs: this.sanitizeOutputs
            },
            limits: {
                maxInputSize: this.maxInputSize,
                maxOutputSize: this.maxOutputSize
            },
            customValidators: this.customValidators.size,
            validationRules: {
                tools: Object.keys(this.validationRules.tools || {}).length,
                models: Object.keys(this.validationRules.models || {}).length,
                agents: Object.keys(this.validationRules.agents || {}).length
            },
            statistics: this.validationStats
        };
    }
}
exports.ValidationPlugin = ValidationPlugin;
//# sourceMappingURL=validation-plugin.js.map