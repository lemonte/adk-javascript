"use strict";
/**
 * LLM-as-a-Judge evaluator for using language models to evaluate responses
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMJudgeUtils = exports.LLMJudge = void 0;
const base_evaluator_1 = require("./base-evaluator");
/**
 * Evaluator that uses LLMs to judge response quality
 */
class LLMJudge extends base_evaluator_1.BaseEvaluator {
    constructor(config) {
        const defaultCriteria = [
            {
                name: 'relevance',
                description: 'How well the response addresses the input prompt',
                weight: 0.25,
                threshold: 0.7
            },
            {
                name: 'accuracy',
                description: 'Factual correctness and truthfulness of the response',
                weight: 0.25,
                threshold: 0.8
            },
            {
                name: 'completeness',
                description: 'How thoroughly the response covers the topic',
                weight: 0.2,
                threshold: 0.7
            },
            {
                name: 'clarity',
                description: 'How clear and understandable the response is',
                weight: 0.15,
                threshold: 0.7
            },
            {
                name: 'helpfulness',
                description: 'How useful the response is to the user',
                weight: 0.15,
                threshold: 0.7
            }
        ];
        const mergedConfig = {
            ...config,
            criteria: config.criteria || defaultCriteria,
            retryAttempts: config.retryAttempts || 3,
            timeout: config.timeout || 30000
        };
        super('LLMJudge', mergedConfig);
        this.config = mergedConfig;
        this.initializeModelClient();
    }
    /**
     * Initialize the model client based on provider
     */
    initializeModelClient() {
        // This would typically initialize the actual model client
        // For now, we'll use a mock implementation
        switch (this.config.model.provider) {
            case 'openai':
                this.modelClient = this.createOpenAIClient();
                break;
            case 'anthropic':
                this.modelClient = this.createAnthropicClient();
                break;
            case 'google':
                this.modelClient = this.createGoogleClient();
                break;
            case 'custom':
                this.modelClient = this.createCustomClient();
                break;
            default:
                throw new Error(`Unsupported model provider: ${this.config.model.provider}`);
        }
    }
    /**
     * Evaluate a single criterion using LLM
     */
    async evaluateCriterion(criterion, context) {
        const llmContext = context;
        if (!llmContext.input?.prompt || !llmContext.output?.response) {
            return this.createResult(0, 'Missing required prompt or response');
        }
        try {
            const evaluationPrompt = this.buildEvaluationPrompt(criterion, llmContext);
            const modelResponse = await this.callModel(evaluationPrompt);
            return this.parseModelResponse(modelResponse, criterion);
        }
        catch (error) {
            console.error(`Error evaluating criterion ${criterion.name}:`, error);
            return this.createResult(0, `Evaluation failed: ${error.message}`);
        }
    }
    /**
     * Build evaluation prompt for a specific criterion
     */
    buildEvaluationPrompt(criterion, context) {
        const { input, output, evaluationFocus, customInstructions } = context;
        let prompt = this.config.prompts.systemPrompt || this.getDefaultSystemPrompt();
        prompt += '\n\n';
        // Add evaluation template
        prompt += this.config.prompts.evaluationTemplate
            .replace('{criterion_name}', criterion.name)
            .replace('{criterion_description}', criterion.description)
            .replace('{input_prompt}', input.prompt)
            .replace('{response}', output.response);
        // Add context if available
        if (input.context) {
            prompt += `\n\nContext: ${input.context}`;
        }
        // Add expected output if available
        if (input.expectedOutput) {
            prompt += `\n\nExpected Output: ${input.expectedOutput}`;
        }
        // Add reference answers if available
        if (input.referenceAnswers && input.referenceAnswers.length > 0) {
            prompt += `\n\nReference Answers:\n${input.referenceAnswers.map((ref, i) => `${i + 1}. ${ref}`).join('\n')}`;
        }
        // Add evaluation focus
        if (evaluationFocus && evaluationFocus.length > 0) {
            prompt += `\n\nFocus Areas: ${evaluationFocus.join(', ')}`;
        }
        // Add custom instructions
        if (customInstructions) {
            prompt += `\n\nAdditional Instructions: ${customInstructions}`;
        }
        // Add scoring instructions
        prompt += '\n\n' + this.config.prompts.scoringInstructions;
        return prompt;
    }
    /**
     * Get default system prompt
     */
    getDefaultSystemPrompt() {
        return `You are an expert evaluator tasked with assessing the quality of AI-generated responses. 
You should provide objective, fair, and detailed evaluations based on the specified criteria. 
Always explain your reasoning and provide constructive feedback.`;
    }
    /**
     * Call the model with the evaluation prompt
     */
    async callModel(prompt) {
        let lastError;
        for (let attempt = 1; attempt <= this.config.retryAttempts; attempt++) {
            try {
                const response = await this.makeModelRequest(prompt);
                return response;
            }
            catch (error) {
                lastError = error;
                console.warn(`Model call attempt ${attempt} failed:`, error.message);
                if (attempt < this.config.retryAttempts) {
                    // Exponential backoff
                    await this.sleep(Math.pow(2, attempt) * 1000);
                }
            }
        }
        throw lastError;
    }
    /**
     * Make the actual model request
     */
    async makeModelRequest(prompt) {
        // This is a mock implementation
        // In a real implementation, this would call the actual model API
        return new Promise((resolve) => {
            setTimeout(() => {
                // Mock response based on prompt analysis
                const score = this.generateMockScore(prompt);
                const reasoning = this.generateMockReasoning(prompt, score);
                resolve({
                    content: JSON.stringify({
                        score,
                        reasoning,
                        confidence: 0.8
                    }),
                    reasoning,
                    confidence: 0.8,
                    score,
                    tokenUsage: {
                        promptTokens: prompt.length / 4, // Rough estimate
                        completionTokens: 150,
                        totalTokens: (prompt.length / 4) + 150
                    }
                });
            }, 1000); // Simulate API delay
        });
    }
    /**
     * Parse model response into evaluation result
     */
    parseModelResponse(modelResponse, criterion) {
        let score = 0;
        let reasoning = '';
        let confidence = 0;
        try {
            if (this.config.outputFormat === 'json') {
                const parsed = JSON.parse(modelResponse.content);
                score = parsed.score || 0;
                reasoning = parsed.reasoning || '';
                confidence = parsed.confidence || 0;
            }
            else if (this.config.outputFormat === 'structured') {
                // Parse structured text format
                const scoreMatch = modelResponse.content.match(/Score:\s*(\d+(?:\.\d+)?)/i);
                const reasoningMatch = modelResponse.content.match(/Reasoning:\s*(.+?)(?=\n\n|$)/is);
                const confidenceMatch = modelResponse.content.match(/Confidence:\s*(\d+(?:\.\d+)?)/i);
                score = scoreMatch ? parseFloat(scoreMatch[1]) : 0;
                reasoning = reasoningMatch ? reasoningMatch[1].trim() : '';
                confidence = confidenceMatch ? parseFloat(confidenceMatch[1]) : 0;
            }
            else {
                // Text format - extract what we can
                reasoning = modelResponse.content;
                score = modelResponse.score || 0.5; // Default score
                confidence = modelResponse.confidence || 0.5;
            }
        }
        catch (error) {
            console.error('Error parsing model response:', error);
            reasoning = 'Failed to parse model response';
            score = 0;
            confidence = 0;
        }
        // Normalize score to 0-1 range
        if (score > 1) {
            score = score / 10; // Assume 0-10 scale
        }
        const result = {
            score: Math.max(0, Math.min(1, score)),
            passed: score >= (criterion.threshold || 0.7),
            feedback: reasoning,
            details: {
                criterion: criterion.name,
                threshold: criterion.threshold,
                weight: criterion.weight
            },
            llmReasoning: reasoning,
            llmConfidence: confidence,
            llmRawResponse: modelResponse.content,
            tokenUsage: modelResponse.tokenUsage
        };
        return result;
    }
    /**
     * Generate mock score for testing
     */
    generateMockScore(prompt) {
        // Simple heuristic for mock scoring
        const lowerPrompt = prompt.toLowerCase();
        let score = 0.7; // Base score
        // Positive indicators
        if (lowerPrompt.includes('clear') || lowerPrompt.includes('detailed'))
            score += 0.1;
        if (lowerPrompt.includes('accurate') || lowerPrompt.includes('correct'))
            score += 0.1;
        if (lowerPrompt.includes('helpful') || lowerPrompt.includes('useful'))
            score += 0.1;
        if (lowerPrompt.includes('complete') || lowerPrompt.includes('thorough'))
            score += 0.1;
        // Negative indicators
        if (lowerPrompt.includes('unclear') || lowerPrompt.includes('confusing'))
            score -= 0.2;
        if (lowerPrompt.includes('incorrect') || lowerPrompt.includes('wrong'))
            score -= 0.3;
        if (lowerPrompt.includes('incomplete') || lowerPrompt.includes('missing'))
            score -= 0.2;
        return Math.max(0, Math.min(1, score));
    }
    /**
     * Generate mock reasoning for testing
     */
    generateMockReasoning(prompt, score) {
        const criterionMatch = prompt.match(/criterion_name}\s*(\w+)/i);
        const criterion = criterionMatch ? criterionMatch[1] : 'quality';
        if (score >= 0.8) {
            return `The response demonstrates excellent ${criterion}. It addresses the prompt comprehensively and provides valuable information with clear structure and appropriate detail.`;
        }
        else if (score >= 0.6) {
            return `The response shows good ${criterion} overall. It addresses most aspects of the prompt adequately, though there may be minor areas for improvement in depth or clarity.`;
        }
        else if (score >= 0.4) {
            return `The response has moderate ${criterion}. While it attempts to address the prompt, there are noticeable gaps or issues that limit its effectiveness.`;
        }
        else {
            return `The response has poor ${criterion}. It fails to adequately address the prompt and has significant issues that need to be resolved.`;
        }
    }
    /**
     * Sleep utility for retry delays
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    // Model client creation methods (mock implementations)
    createOpenAIClient() {
        return {
            provider: 'openai',
            model: this.config.model.modelName,
            apiKey: this.config.model.apiKey
        };
    }
    createAnthropicClient() {
        return {
            provider: 'anthropic',
            model: this.config.model.modelName,
            apiKey: this.config.model.apiKey
        };
    }
    createGoogleClient() {
        return {
            provider: 'google',
            model: this.config.model.modelName,
            apiKey: this.config.model.apiKey
        };
    }
    createCustomClient() {
        return {
            provider: 'custom',
            endpoint: this.config.model.endpoint,
            apiKey: this.config.model.apiKey
        };
    }
    /**
     * Get token usage statistics
     */
    getTokenUsage() {
        // This would track actual token usage in a real implementation
        return {
            total: 0,
            prompt: 0,
            completion: 0
        };
    }
    /**
     * Estimate evaluation cost
     */
    estimateCost(promptLength, expectedResponseLength = 200) {
        // Mock cost estimation based on token usage
        const promptTokens = promptLength / 4; // Rough estimate
        const completionTokens = expectedResponseLength;
        const totalTokens = promptTokens + completionTokens;
        // Mock pricing (per 1K tokens)
        const costPer1KTokens = 0.002; // $0.002 per 1K tokens
        return (totalTokens / 1000) * costPer1KTokens;
    }
}
exports.LLMJudge = LLMJudge;
/**
 * Utility functions for LLM Judge
 */
class LLMJudgeUtils {
    /**
     * Create a standard evaluation prompt template
     */
    static createEvaluationTemplate() {
        return `Please evaluate the following response based on the criterion: {criterion_name}

Criterion Description: {criterion_description}

Input Prompt: {input_prompt}

Response to Evaluate: {response}

Please provide your evaluation in the following format:
Score: [0.0 to 1.0]
Reasoning: [Your detailed reasoning]
Confidence: [0.0 to 1.0]`;
    }
    /**
     * Create standard scoring instructions
     */
    static createScoringInstructions() {
        return `Scoring Guidelines:
- 0.9-1.0: Exceptional quality, exceeds expectations
- 0.8-0.9: High quality, meets expectations well
- 0.7-0.8: Good quality, meets basic expectations
- 0.6-0.7: Acceptable quality, minor issues
- 0.5-0.6: Below average, noticeable problems
- 0.0-0.5: Poor quality, significant issues

Provide specific examples and constructive feedback in your reasoning.`;
    }
    /**
     * Create a comprehensive system prompt
     */
    static createSystemPrompt() {
        return `You are an expert AI evaluator with extensive experience in assessing response quality across multiple dimensions. Your role is to provide objective, detailed, and constructive evaluations.

Key principles:
1. Be objective and fair in your assessments
2. Provide specific examples to support your scores
3. Consider the context and intended audience
4. Focus on the specific criterion being evaluated
5. Offer constructive feedback for improvement
6. Be consistent in your scoring standards

Your evaluations should be thorough, well-reasoned, and actionable.`;
    }
    /**
     * Validate LLM Judge configuration
     */
    static validateConfig(config) {
        const errors = [];
        if (!config.model) {
            errors.push('Model configuration is required');
        }
        else {
            if (!config.model.provider) {
                errors.push('Model provider is required');
            }
            if (!config.model.modelName) {
                errors.push('Model name is required');
            }
        }
        if (!config.prompts) {
            errors.push('Prompts configuration is required');
        }
        else {
            if (!config.prompts.evaluationTemplate) {
                errors.push('Evaluation template is required');
            }
            if (!config.prompts.scoringInstructions) {
                errors.push('Scoring instructions are required');
            }
        }
        if (!config.outputFormat) {
            errors.push('Output format is required');
        }
        return errors;
    }
}
exports.LLMJudgeUtils = LLMJudgeUtils;
//# sourceMappingURL=llm-judge.js.map