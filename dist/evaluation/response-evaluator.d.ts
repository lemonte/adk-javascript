/**
 * Response evaluator for evaluating AI model responses
 */
import { BaseEvaluator, EvaluationCriteria, EvaluationContext, EvaluationResult, EvaluationConfig } from './base-evaluator';
export interface ResponseEvaluationContext extends EvaluationContext {
    input: {
        prompt: string;
        context?: string;
        expectedResponse?: string;
        referenceAnswers?: string[];
    };
    output: {
        response: string;
        confidence?: number;
        metadata?: Record<string, any>;
    };
}
export interface ResponseMetrics {
    relevance: number;
    accuracy: number;
    completeness: number;
    clarity: number;
    coherence: number;
    factualness?: number;
    helpfulness?: number;
}
/**
 * Evaluator for AI model responses
 */
export declare class ResponseEvaluator extends BaseEvaluator {
    constructor(config?: Partial<EvaluationConfig>);
    /**
     * Evaluate a single criterion for response evaluation
     */
    protected evaluateCriterion(criterion: EvaluationCriteria, context: EvaluationContext): Promise<EvaluationResult>;
    /**
     * Evaluate relevance of response to prompt
     */
    private evaluateRelevance;
    /**
     * Evaluate accuracy against expected response or reference answers
     */
    private evaluateAccuracy;
    /**
     * Evaluate completeness of response
     */
    private evaluateCompleteness;
    /**
     * Evaluate clarity of response
     */
    private evaluateClarity;
    /**
     * Evaluate coherence of response
     */
    private evaluateCoherence;
    /**
     * Evaluate factualness (basic implementation)
     */
    private evaluateFactualness;
    /**
     * Evaluate helpfulness of response
     */
    private evaluateHelpfulness;
    private extractKeyTerms;
    private isStopWord;
    private calculateTermOverlap;
    private checkDirectAddressing;
    private calculateSemanticSimilarity;
    private extractRequirements;
    private isRequirementAddressed;
    private calculateAverageSentenceLength;
    private calculateReadabilityScore;
    private countSyllables;
    private evaluateStructure;
    private splitIntoSentences;
    private evaluateTransitions;
}
//# sourceMappingURL=response-evaluator.d.ts.map