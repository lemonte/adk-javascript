/**
 * Main evaluation service for orchestrating different types of evaluations
 */
import { BaseEvaluator, EvaluationResult, EvaluationCriteria, EvaluationContext, EvaluationConfig } from './base-evaluator';
import { LLMJudgeConfig } from './llm-judge';
export interface EvaluationServiceConfig {
    evaluators: {
        response?: Partial<EvaluationConfig>;
        agent?: Partial<EvaluationConfig>;
        safety?: Partial<EvaluationConfig>;
        llmJudge?: LLMJudgeConfig;
    };
    defaultEvaluators?: string[];
    parallelExecution?: boolean;
    timeout?: number;
    retryAttempts?: number;
}
export interface EvaluationRequest {
    type: 'response' | 'agent' | 'safety' | 'llm-judge' | 'comprehensive';
    context: EvaluationContext;
    evaluators?: string[];
    customCriteria?: EvaluationCriteria[];
    options?: {
        includeDetails?: boolean;
        generateReport?: boolean;
        saveResults?: boolean;
    };
}
export interface EvaluationSuite {
    id: string;
    name: string;
    description: string;
    evaluators: string[];
    criteria: EvaluationCriteria[];
    config: Record<string, any>;
    metadata?: Record<string, any>;
}
export interface BatchEvaluationRequest {
    suite: EvaluationSuite;
    contexts: EvaluationContext[];
    options?: {
        parallelism?: number;
        progressCallback?: (progress: number, completed: number, total: number) => void;
        errorCallback?: (error: Error, context: EvaluationContext, index: number) => void;
    };
}
export interface BatchEvaluationResult {
    suiteId: string;
    totalEvaluations: number;
    completedEvaluations: number;
    failedEvaluations: number;
    results: EvaluationResult[];
    aggregatedScores: Record<string, number>;
    summary: {
        averageScore: number;
        passRate: number;
        topPerformers: EvaluationResult[];
        bottomPerformers: EvaluationResult[];
    };
    executionTime: number;
    errors: Array<{
        index: number;
        error: string;
        context: EvaluationContext;
    }>;
}
/**
 * Main evaluation service for orchestrating different types of evaluations
 */
export declare class EvaluationService {
    private evaluators;
    private config;
    private evaluationHistory;
    constructor(config: EvaluationServiceConfig);
    /**
     * Initialize evaluators based on configuration
     */
    private initializeEvaluators;
    /**
     * Perform a single evaluation
     */
    evaluate(request: EvaluationRequest): Promise<EvaluationResult>;
    /**
     * Perform batch evaluation
     */
    evaluateBatch(request: BatchEvaluationRequest): Promise<BatchEvaluationResult>;
    /**
     * Perform comprehensive evaluation using multiple evaluators
     */
    private performComprehensiveEvaluation;
    /**
     * Perform evaluation with a single evaluator
     */
    private performSingleEvaluation;
    /**
     * Get evaluator by name
     */
    private getEvaluator;
    /**
     * Aggregate results from multiple evaluators
     */
    private aggregateResults;
    /**
     * Calculate aggregated scores for batch evaluation
     */
    private calculateAggregatedScores;
    /**
     * Generate summary for batch evaluation
     */
    private generateBatchSummary;
    /**
     * Add a custom evaluator
     */
    addEvaluator(name: string, evaluator: BaseEvaluator): void;
    /**
     * Remove an evaluator
     */
    removeEvaluator(name: string): boolean;
    /**
     * Get list of available evaluators
     */
    getAvailableEvaluators(): string[];
    /**
     * Get evaluation history
     */
    getEvaluationHistory(limit?: number): EvaluationResult[];
    /**
     * Clear evaluation history
     */
    clearHistory(): void;
    /**
     * Get evaluation statistics
     */
    getStatistics(): {
        totalEvaluations: number;
        averageScore: number;
        passRate: number;
        evaluatorUsage: Record<string, number>;
    };
    /**
     * Export evaluation results
     */
    exportResults(format?: 'json' | 'csv'): string;
}
/**
 * Utility functions for evaluation service
 */
export declare class EvaluationServiceUtils {
    /**
     * Create a standard evaluation suite
     */
    static createStandardSuite(name: string, type: 'basic' | 'comprehensive' | 'safety-focused'): EvaluationSuite;
    /**
     * Validate evaluation service configuration
     */
    static validateConfig(config: Partial<EvaluationServiceConfig>): string[];
}
//# sourceMappingURL=evaluation-service.d.ts.map