"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseFlow = void 0;
const constants_1 = require("./constants");
/**
 * Abstract base class for all flow implementations
 */
class BaseFlow {
    constructor(config) {
        this._eventListeners = new Map();
        this._isExecuting = false;
        this._config = { ...config };
        this.validateConfig();
    }
    /**
     * Gets the flow configuration
     */
    get config() {
        return { ...this._config };
    }
    /**
     * Gets whether the flow is currently executing
     */
    get isExecuting() {
        return this._isExecuting;
    }
    /**
     * Gets the current execution info
     */
    get currentExecution() {
        return this._currentExecution ? { ...this._currentExecution } : undefined;
    }
    /**
     * Validates the flow configuration
     */
    validate() {
        const errors = [];
        const warnings = [];
        // Validate basic configuration
        const configValidation = this.validateConfig();
        if (!configValidation.valid) {
            errors.push(...configValidation.errors);
        }
        // Validate steps
        const stepsValidation = this.validateSteps();
        if (!stepsValidation.valid) {
            errors.push(...stepsValidation.errors);
        }
        warnings.push(...stepsValidation.warnings);
        // Validate dependencies
        const dependencyValidation = this.validateDependencies();
        if (!dependencyValidation.valid) {
            errors.push(...dependencyValidation.errors);
        }
        return {
            valid: errors.length === 0,
            errors,
            warnings
        };
    }
    /**
     * Gets flow metadata
     */
    getMetadata() {
        return {
            id: this._config.id,
            name: this._config.name,
            version: this._config.version,
            mode: this._config.mode,
            priority: this._config.priority,
            stepCount: this._config.steps.length,
            tags: this._config.tags || [],
            metadata: this._config.metadata || {},
            isExecuting: this._isExecuting,
            currentExecution: this._currentExecution
        };
    }
    /**
     * Adds an event listener
     */
    addEventListener(eventType, listener) {
        if (!this._eventListeners.has(eventType)) {
            this._eventListeners.set(eventType, []);
        }
        this._eventListeners.get(eventType).push(listener);
    }
    /**
     * Removes an event listener
     */
    removeEventListener(eventType, listener) {
        const listeners = this._eventListeners.get(eventType);
        if (listeners) {
            const index = listeners.indexOf(listener);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        }
    }
    /**
     * Removes all event listeners
     */
    removeAllEventListeners(eventType) {
        if (eventType) {
            this._eventListeners.delete(eventType);
        }
        else {
            this._eventListeners.clear();
        }
    }
    /**
     * Updates the flow configuration
     */
    updateConfig(config) {
        this._config = { ...this._config, ...config };
        this.validateConfig();
    }
    /**
     * Gets a step by ID
     */
    getStep(stepId) {
        return this._config.steps.find(step => step.id === stepId);
    }
    /**
     * Gets all steps
     */
    getSteps() {
        return [...this._config.steps];
    }
    /**
     * Adds a step to the flow
     */
    addStep(step) {
        if (this.getStep(step.id)) {
            throw new Error(`Step with ID '${step.id}' already exists`);
        }
        this._config.steps.push(step);
    }
    /**
     * Updates a step in the flow
     */
    updateStep(stepId, updates) {
        const stepIndex = this._config.steps.findIndex(step => step.id === stepId);
        if (stepIndex === -1) {
            throw new Error(`Step with ID '${stepId}' not found`);
        }
        this._config.steps[stepIndex] = { ...this._config.steps[stepIndex], ...updates };
    }
    /**
     * Removes a step from the flow
     */
    removeStep(stepId) {
        const stepIndex = this._config.steps.findIndex(step => step.id === stepId);
        if (stepIndex === -1) {
            throw new Error(`Step with ID '${stepId}' not found`);
        }
        this._config.steps.splice(stepIndex, 1);
    }
    /**
     * Creates a flow context
     */
    createContext(input, executionId) {
        return {
            executionId: executionId || this.generateExecutionId(),
            flowId: this._config.id,
            input: { ...input },
            output: {},
            variables: { ...this._config.variables },
            metadata: {},
            children: []
        };
    }
    /**
     * Creates a flow execution result
     */
    createExecutionResult(context, status, startTime, endTime, error, stepResults = []) {
        const duration = endTime ? endTime.getTime() - startTime.getTime() : undefined;
        return {
            executionId: context.executionId,
            flowId: this._config.id,
            status,
            input: context.input,
            output: context.output,
            error,
            startTime,
            endTime,
            duration,
            stepResults,
            metadata: context.metadata
        };
    }
    /**
     * Emits a flow event
     */
    emitEvent(event) {
        const listeners = this._eventListeners.get(event.type);
        if (listeners) {
            for (const listener of listeners) {
                try {
                    listener(event);
                }
                catch (error) {
                    console.error('Error in flow event listener:', error);
                }
            }
        }
    }
    /**
     * Creates a flow event
     */
    createEvent(type, executionId, data = {}, stepId) {
        return {
            type,
            executionId,
            flowId: this._config.id,
            stepId,
            timestamp: new Date(),
            data
        };
    }
    /**
     * Generates a unique execution ID
     */
    generateExecutionId() {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substring(2, 15);
        return `exec_${this._config.id}_${timestamp}_${random}`;
    }
    /**
     * Validates the flow configuration
     */
    validateConfig() {
        const errors = [];
        // Validate required fields
        if (!this._config.id || typeof this._config.id !== 'string') {
            errors.push('Flow ID is required and must be a string');
        }
        else if (!constants_1.FLOW_VALIDATION_RULES.FLOW_ID_PATTERN.test(this._config.id)) {
            errors.push('Flow ID contains invalid characters');
        }
        if (!this._config.name || typeof this._config.name !== 'string') {
            errors.push('Flow name is required and must be a string');
        }
        else {
            if (this._config.name.length < constants_1.FLOW_VALIDATION_RULES.MIN_NAME_LENGTH) {
                errors.push(`Flow name must be at least ${constants_1.FLOW_VALIDATION_RULES.MIN_NAME_LENGTH} characters`);
            }
            if (this._config.name.length > constants_1.FLOW_VALIDATION_RULES.MAX_NAME_LENGTH) {
                errors.push(`Flow name cannot exceed ${constants_1.FLOW_VALIDATION_RULES.MAX_NAME_LENGTH} characters`);
            }
        }
        if (!this._config.version || typeof this._config.version !== 'string') {
            errors.push('Flow version is required and must be a string');
        }
        if (!Array.isArray(this._config.steps)) {
            errors.push('Flow steps must be an array');
        }
        // Validate optional fields
        if (this._config.description && typeof this._config.description !== 'string') {
            errors.push('Flow description must be a string');
        }
        else if (this._config.description) {
            if (this._config.description.length > constants_1.FLOW_VALIDATION_RULES.MAX_DESCRIPTION_LENGTH) {
                errors.push(`Flow description cannot exceed ${constants_1.FLOW_VALIDATION_RULES.MAX_DESCRIPTION_LENGTH} characters`);
            }
        }
        if (this._config.timeout !== undefined) {
            if (!Number.isInteger(this._config.timeout) || this._config.timeout <= 0) {
                errors.push('Flow timeout must be a positive integer');
            }
        }
        if (this._config.tags && Array.isArray(this._config.tags)) {
            if (this._config.tags.length > constants_1.FLOW_VALIDATION_RULES.MAX_TAGS) {
                errors.push(`Flow cannot have more than ${constants_1.FLOW_VALIDATION_RULES.MAX_TAGS} tags`);
            }
            for (const tag of this._config.tags) {
                if (typeof tag !== 'string') {
                    errors.push('All flow tags must be strings');
                    break;
                }
                if (tag.length > constants_1.FLOW_VALIDATION_RULES.MAX_TAG_LENGTH) {
                    errors.push(`Tag '${tag}' exceeds maximum length of ${constants_1.FLOW_VALIDATION_RULES.MAX_TAG_LENGTH} characters`);
                }
            }
        }
        return {
            valid: errors.length === 0,
            errors,
            warnings: []
        };
    }
    /**
     * Validates flow steps
     */
    validateSteps() {
        const errors = [];
        const warnings = [];
        const stepIds = new Set();
        for (const step of this._config.steps) {
            // Check for duplicate step IDs
            if (stepIds.has(step.id)) {
                errors.push(`Duplicate step ID: ${step.id}`);
            }
            stepIds.add(step.id);
            // Validate step ID
            if (!step.id || typeof step.id !== 'string') {
                errors.push('Step ID is required and must be a string');
            }
            else if (!constants_1.FLOW_VALIDATION_RULES.STEP_ID_PATTERN.test(step.id)) {
                errors.push(`Step ID '${step.id}' contains invalid characters`);
            }
            // Validate step name
            if (!step.name || typeof step.name !== 'string') {
                errors.push(`Step '${step.id}' name is required and must be a string`);
            }
            // Validate step type
            if (!step.type || typeof step.type !== 'string') {
                errors.push(`Step '${step.id}' type is required and must be a string`);
            }
            // Validate step config
            if (!step.config || typeof step.config !== 'object') {
                errors.push(`Step '${step.id}' config is required and must be an object`);
            }
            // Validate timeout
            if (step.timeout !== undefined) {
                if (!Number.isInteger(step.timeout) || step.timeout <= 0) {
                    errors.push(`Step '${step.id}' timeout must be a positive integer`);
                }
            }
            // Validate retry config
            if (step.retry) {
                if (!Number.isInteger(step.retry.maxRetries) || step.retry.maxRetries < 0) {
                    errors.push(`Step '${step.id}' retry maxRetries must be a non-negative integer`);
                }
                if (!Number.isInteger(step.retry.delay) || step.retry.delay < 0) {
                    errors.push(`Step '${step.id}' retry delay must be a non-negative integer`);
                }
            }
            // Check for unknown step types
            if (!Object.values(constants_1.BUILT_IN_STEP_TYPES).includes(step.type)) {
                warnings.push(`Step '${step.id}' uses unknown step type: ${step.type}`);
            }
        }
        return {
            valid: errors.length === 0,
            errors,
            warnings
        };
    }
    /**
     * Validates step dependencies
     */
    validateDependencies() {
        const errors = [];
        const stepIds = new Set(this._config.steps.map(step => step.id));
        // Check for invalid dependencies
        for (const step of this._config.steps) {
            if (step.dependencies) {
                for (const depId of step.dependencies) {
                    if (!stepIds.has(depId)) {
                        errors.push(`Step '${step.id}' depends on non-existent step: ${depId}`);
                    }
                }
            }
        }
        // Check for circular dependencies
        const circularDeps = this.detectCircularDependencies();
        if (circularDeps.length > 0) {
            errors.push(`Circular dependencies detected: ${circularDeps.join(', ')}`);
        }
        return {
            valid: errors.length === 0,
            errors,
            warnings: []
        };
    }
    /**
     * Detects circular dependencies in the flow
     */
    detectCircularDependencies() {
        const visited = new Set();
        const recursionStack = new Set();
        const cycles = [];
        const dfs = (stepId, path) => {
            if (recursionStack.has(stepId)) {
                const cycleStart = path.indexOf(stepId);
                cycles.push(path.slice(cycleStart).concat(stepId).join(' -> '));
                return;
            }
            if (visited.has(stepId)) {
                return;
            }
            visited.add(stepId);
            recursionStack.add(stepId);
            const step = this.getStep(stepId);
            if (step && step.dependencies) {
                for (const depId of step.dependencies) {
                    dfs(depId, [...path, stepId]);
                }
            }
            recursionStack.delete(stepId);
        };
        for (const step of this._config.steps) {
            if (!visited.has(step.id)) {
                dfs(step.id, []);
            }
        }
        return cycles;
    }
    /**
     * Gets the execution timeout for the flow
     */
    getExecutionTimeout() {
        return this._config.timeout || constants_1.DEFAULT_FLOW_TIMEOUTS.FLOW_TIMEOUT;
    }
    /**
     * Checks if the flow execution should be cancelled
     */
    shouldCancel(startTime) {
        const timeout = this.getExecutionTimeout();
        return Date.now() - startTime.getTime() > timeout;
    }
    /**
     * Creates an error with flow context
     */
    createError(code, message, cause) {
        const error = new Error(message);
        error.code = code;
        error.flowId = this._config.id;
        if (cause) {
            error.cause = cause;
        }
        return error;
    }
}
exports.BaseFlow = BaseFlow;
//# sourceMappingURL=base-flow.js.map