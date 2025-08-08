/**
 * LLM-as-a-Judge evaluator for using language models to evaluate responses
 */
import { BaseEvaluator, EvaluationCriteria, EvaluationContext, EvaluationResult, EvaluationConfig } from './base-evaluator';
export interface LLMJudgeConfig extends EvaluationConfig {
    model: {
        provider: 'openai' | 'anthropic' | 'google' | 'custom';
        modelName: string;
        apiKey?: string;
        endpoint?: string;
        temperature?: number;
        maxTokens?: number;
    };
    prompts: {
        systemPrompt?: string;
        evaluationTemplate: string;
        scoringInstructions: string;
    };
    outputFormat: 'json' | 'structured' | 'text';
    retryAttempts?: number;
    timeout?: number;
}
export interface LLMJudgeContext extends EvaluationContext {
    input: {
        prompt: string;
        context?: string;
        expectedOutput?: string;
        referenceAnswers?: string[];
        metadata?: Record<string, any>;
    };
    output: {
        response: string;
        reasoning?: string;
        confidence?: number;
        metadata?: Record<string, any>;
    };
    evaluationFocus?: string[];
    customInstructions?: string;
}
export interface LLMJudgeResult extends EvaluationResult {
    llmReasoning: string;
    llmConfidence: number;
    llmRawResponse: string;
    tokenUsage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
}
export interface ModelResponse {
    content: string;
    reasoning?: string;
    confidence?: number;
    score?: number;
    tokenUsage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
}
/**
 * Evaluator that uses LLMs to judge response quality
 */
export declare class LLMJudge extends BaseEvaluator {
    private config;
    private modelClient;
    constructor(config: LLMJudgeConfig);
    /**
     * Initialize the model client based on provider
     */
    private initializeModelClient;
    /**
     * Evaluate a single criterion using LLM
     */
    protected evaluateCriterion(criterion: EvaluationCriteria, context: EvaluationContext): Promise<EvaluationResult>;
    /**
     * Build evaluation prompt for a specific criterion
     */
    private buildEvaluationPrompt;
    /**
     * Get default system prompt
     */
    private getDefaultSystemPrompt;
    /**
     * Call the model with the evaluation prompt
     */
    private callModel;
    /**
     * Make the actual model request
     */
    private makeModelRequest;
    /**
     * Parse model response into evaluation result
     */
    private parseModelResponse;
    /**
     * Generate mock score for testing
     */
    private generateMockScore;
    /**
     * Generate mock reasoning for testing
     */
    private generateMockReasoning;
    /**
     * Sleep utility for retry delays
     */
    private sleep;
    private createOpenAIClient;
    private createAnthropicClient;
    private createGoogleClient;
    private createCustomClient;
    /**
     * Get token usage statistics
     */
    getTokenUsage(): {
        total: number;
        prompt: number;
        completion: number;
    };
    /**
     * Estimate evaluation cost
     */
    estimateCost(promptLength: number, expectedResponseLength?: number): number;
}
/**
 * Utility functions for LLM Judge
 */
export declare class LLMJudgeUtils {
    /**
     * Create a standard evaluation prompt template
     */
    static createEvaluationTemplate(): string;
    /**
     * Create standard scoring instructions
     */
    static createScoringInstructions(): string;
    /**
     * Create a comprehensive system prompt
     */
    static createSystemPrompt(): string;
    /**
     * Validate LLM Judge configuration
     */
    static validateConfig(config: Partial<LLMJudgeConfig>): string[];
}
//# sourceMappingURL=llm-judge.d.ts.map