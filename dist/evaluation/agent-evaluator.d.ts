/**
 * Agent evaluator for evaluating AI agent performance
 */
import { BaseEvaluator, EvaluationCriteria, EvaluationContext, EvaluationResult, EvaluationConfig } from './base-evaluator';
export interface AgentEvaluationContext extends EvaluationContext {
    input: {
        task: string;
        instructions?: string;
        constraints?: string[];
        expectedOutcome?: string;
        timeLimit?: number;
    };
    output: {
        result: any;
        steps: AgentStep[];
        executionTime: number;
        resourceUsage?: ResourceUsage;
        errors?: string[];
    };
}
export interface AgentStep {
    id: string;
    action: string;
    input: any;
    output: any;
    timestamp: Date;
    duration: number;
    success: boolean;
    error?: string;
}
export interface ResourceUsage {
    memoryUsed: number;
    cpuTime: number;
    apiCalls: number;
    tokensUsed?: number;
    cost?: number;
}
export interface AgentMetrics {
    taskCompletion: number;
    efficiency: number;
    accuracy: number;
    reliability: number;
    resourceOptimization: number;
    errorHandling: number;
}
/**
 * Evaluator for AI agent performance
 */
export declare class AgentEvaluator extends BaseEvaluator {
    constructor(config?: Partial<EvaluationConfig>);
    /**
     * Evaluate a single criterion for agent evaluation
     */
    protected evaluateCriterion(criterion: EvaluationCriteria, context: EvaluationContext): Promise<EvaluationResult>;
    /**
     * Evaluate task completion
     */
    private evaluateTaskCompletion;
    /**
     * Evaluate efficiency
     */
    private evaluateEfficiency;
    /**
     * Evaluate accuracy
     */
    private evaluateAccuracy;
    /**
     * Evaluate reliability
     */
    private evaluateReliability;
    /**
     * Evaluate resource optimization
     */
    private evaluateResourceOptimization;
    /**
     * Evaluate error handling
     */
    private evaluateErrorHandling;
    private compareWithExpectedOutcome;
    private calculateTextSimilarity;
    private evaluateStepConsistency;
    private calculateGroupConsistency;
    private evaluateLogicalConsistency;
    private evaluateRecoveryCapability;
    private evaluateMemoryUsage;
    private evaluateApiEfficiency;
    private evaluateCostEfficiency;
    private evaluateTokenEfficiency;
    private countRecoveryAttempts;
    private evaluateGracefulDegradation;
}
//# sourceMappingURL=agent-evaluator.d.ts.map