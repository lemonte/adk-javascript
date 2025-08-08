/**
 * Base evaluator interface and abstract implementation
 */
export interface EvaluationResult {
    score: number;
    passed: boolean;
    feedback?: string;
    details?: Record<string, any>;
    metadata?: Record<string, any>;
    timestamp: Date;
}
export interface EvaluationCriteria {
    name: string;
    description: string;
    weight: number;
    threshold?: number;
    required?: boolean;
}
export interface EvaluationConfig {
    criteria: EvaluationCriteria[];
    passingThreshold?: number;
    aggregationMethod?: 'weighted_average' | 'minimum' | 'maximum' | 'custom';
    customAggregator?: (scores: number[], weights: number[]) => number;
}
export interface EvaluationContext {
    input?: any;
    output?: any;
    expected?: any;
    metadata?: Record<string, any>;
    environment?: Record<string, any>;
}
export interface EvaluationReport {
    overallScore: number;
    passed: boolean;
    criteriaResults: Map<string, EvaluationResult>;
    summary: string;
    recommendations?: string[];
    timestamp: Date;
    evaluatorInfo: {
        name: string;
        version: string;
        config: EvaluationConfig;
    };
}
/**
 * Abstract base class for all evaluators
 */
export declare abstract class BaseEvaluator {
    protected config: EvaluationConfig;
    protected name: string;
    protected version: string;
    constructor(name: string, config: EvaluationConfig, version?: string);
    /**
     * Evaluate the given context against all criteria
     */
    evaluate(context: EvaluationContext): Promise<EvaluationReport>;
    /**
     * Evaluate a single criterion (to be implemented by subclasses)
     */
    protected abstract evaluateCriterion(criterion: EvaluationCriteria, context: EvaluationContext): Promise<EvaluationResult>;
    /**
     * Validate the evaluation configuration
     */
    protected validateConfig(config: EvaluationConfig): EvaluationConfig;
    /**
     * Aggregate scores based on the configured method
     */
    protected aggregateScores(scores: number[], weights: number[]): number;
    /**
     * Check if all required criteria passed
     */
    protected checkRequiredCriteria(results: Map<string, EvaluationResult>): boolean;
    /**
     * Generate a summary of the evaluation
     */
    protected generateSummary(overallScore: number, passed: boolean, results: Map<string, EvaluationResult>): string;
    /**
     * Generate recommendations based on evaluation results
     */
    protected generateRecommendations(results: Map<string, EvaluationResult>): string[];
    /**
     * Get evaluator information
     */
    getInfo(): {
        name: string;
        version: string;
        config: EvaluationConfig;
    };
    /**
     * Update evaluator configuration
     */
    updateConfig(newConfig: Partial<EvaluationConfig>): void;
    /**
     * Add a new criterion
     */
    addCriterion(criterion: EvaluationCriteria): void;
    /**
     * Remove a criterion by name
     */
    removeCriterion(name: string): boolean;
    /**
     * Get criterion by name
     */
    getCriterion(name: string): EvaluationCriteria | undefined;
    /**
     * List all criteria names
     */
    listCriteria(): string[];
    /**
     * Create a normalized score (0-1) from any numeric value
     */
    protected normalizeScore(value: number, min?: number, max?: number): number;
    /**
     * Create an evaluation result
     */
    protected createResult(score: number, feedback?: string, details?: Record<string, any>, threshold?: number): EvaluationResult;
}
//# sourceMappingURL=base-evaluator.d.ts.map