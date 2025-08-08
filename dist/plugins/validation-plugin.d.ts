/**
 * Validation plugin for ADK JavaScript
 */
import { BasePlugin } from './base-plugin';
import { PluginConfig, InvocationContext, ToolContext, ModelContext, AgentContext } from './types';
export interface ValidationPluginConfig extends PluginConfig {
    settings?: {
        enableInputValidation?: boolean;
        enableOutputValidation?: boolean;
        enableParameterValidation?: boolean;
        enableSchemaValidation?: boolean;
        strictMode?: boolean;
        customValidators?: Record<string, ValidatorFunction>;
        validationRules?: ValidationRules;
        errorHandling?: 'throw' | 'log' | 'ignore';
        sanitizeInputs?: boolean;
        sanitizeOutputs?: boolean;
        maxInputSize?: number;
        maxOutputSize?: number;
        allowedDataTypes?: string[];
        blockedPatterns?: string[];
        requiredFields?: Record<string, string[]>;
        fieldConstraints?: Record<string, FieldConstraint>;
    };
}
export interface ValidationRules {
    tools?: Record<string, ToolValidationRule>;
    models?: Record<string, ModelValidationRule>;
    agents?: Record<string, AgentValidationRule>;
    global?: GlobalValidationRule;
}
export interface ToolValidationRule {
    inputSchema?: any;
    outputSchema?: any;
    requiredParams?: string[];
    optionalParams?: string[];
    paramConstraints?: Record<string, FieldConstraint>;
    customValidator?: string;
}
export interface ModelValidationRule {
    inputSchema?: any;
    outputSchema?: any;
    maxTokens?: number;
    minTokens?: number;
    allowedModels?: string[];
    blockedModels?: string[];
    customValidator?: string;
}
export interface AgentValidationRule {
    inputSchema?: any;
    outputSchema?: any;
    maxSteps?: number;
    minSteps?: number;
    allowedAgents?: string[];
    blockedAgents?: string[];
    customValidator?: string;
}
export interface GlobalValidationRule {
    maxExecutionTime?: number;
    maxMemoryUsage?: number;
    allowedOperations?: string[];
    blockedOperations?: string[];
    securityChecks?: boolean;
}
export interface FieldConstraint {
    type?: 'string' | 'number' | 'boolean' | 'object' | 'array';
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    pattern?: string;
    enum?: any[];
    format?: 'email' | 'url' | 'uuid' | 'date' | 'time' | 'datetime';
    customValidator?: string;
}
export interface ValidationResult {
    isValid: boolean;
    errors: ValidationError[];
    warnings: ValidationWarning[];
    sanitizedData?: any;
}
export interface ValidationError {
    field: string;
    message: string;
    code: string;
    value?: any;
    constraint?: string;
}
export interface ValidationWarning {
    field: string;
    message: string;
    code: string;
    value?: any;
}
export type ValidatorFunction = (value: any, context?: any) => ValidationResult;
/**
 * Plugin that provides comprehensive validation for inputs, outputs, and parameters
 */
export declare class ValidationPlugin extends BasePlugin {
    private enableInputValidation;
    private enableOutputValidation;
    private enableParameterValidation;
    private enableSchemaValidation;
    private strictMode;
    private customValidators;
    private validationRules;
    private errorHandling;
    private sanitizeInputs;
    private sanitizeOutputs;
    private maxInputSize;
    private maxOutputSize;
    private allowedDataTypes;
    private blockedPatterns;
    private requiredFields;
    private fieldConstraints;
    private validationStats;
    constructor(config?: Partial<ValidationPluginConfig>);
    protected onInitialize(): Promise<void>;
    protected onDestroy(): Promise<void>;
    beforeRunCallback(context: InvocationContext): Promise<InvocationContext>;
    afterRunCallback(context: InvocationContext): Promise<InvocationContext>;
    beforeAgentCallback(context: AgentContext): Promise<AgentContext>;
    afterAgentCallback(context: AgentContext): Promise<AgentContext>;
    beforeToolCallback(context: ToolContext): Promise<ToolContext>;
    afterToolCallback(context: ToolContext): Promise<ToolContext>;
    beforeModelCallback(context: ModelContext): Promise<ModelContext>;
    afterModelCallback(context: ModelContext): Promise<ModelContext>;
    /**
     * Validate run input
     */
    private validateRunInput;
    /**
     * Validate run output
     */
    private validateRunOutput;
    /**
     * Validate agent input
     */
    private validateAgentInput;
    /**
     * Validate agent output
     */
    private validateAgentOutput;
    /**
     * Validate agent parameters
     */
    private validateAgentParameters;
    /**
     * Validate tool input
     */
    private validateToolInput;
    /**
     * Validate tool output
     */
    private validateToolOutput;
    /**
     * Validate tool parameters
     */
    private validateToolParameters;
    /**
     * Validate model input
     */
    private validateModelInput;
    /**
     * Validate model output
     */
    private validateModelOutput;
    /**
     * Validate model parameters
     */
    private validateModelParameters;
    /**
     * Validate schema
     */
    private validateSchema;
    /**
     * Validate field constraint
     */
    private validateFieldConstraint;
    /**
     * Validate object constraints
     */
    private validateObjectConstraints;
    /**
     * Run custom validator
     */
    private runCustomValidator;
    /**
     * Calculate data size
     */
    private calculateDataSize;
    /**
     * Estimate tokens in text
     */
    private estimateTokens;
    /**
     * Sanitize data
     */
    private sanitizeData;
    /**
     * Sanitize string
     */
    private sanitizeString;
    /**
     * Create validation result
     */
    private createValidationResult;
    /**
     * Handle validation result
     */
    private handleValidationResult;
    /**
     * Register built-in validators
     */
    private registerBuiltInValidators;
    /**
     * Validate plugin configuration
     */
    private validatePluginConfig;
    /**
     * Add custom validator
     */
    addCustomValidator(name: string, validator: ValidatorFunction): void;
    /**
     * Remove custom validator
     */
    removeCustomValidator(name: string): boolean;
    /**
     * Update validation rules
     */
    updateValidationRules(rules: Partial<ValidationRules>): void;
    /**
     * Get validation statistics
     */
    getValidationStats(): typeof this.validationStats;
    /**
     * Reset validation statistics
     */
    resetValidationStats(): void;
    protected performHealthCheck(): Promise<Record<string, any>>;
}
//# sourceMappingURL=validation-plugin.d.ts.map