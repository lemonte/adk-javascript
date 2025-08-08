"use strict";
/**
 * Agent evaluator for evaluating AI agent performance
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentEvaluator = void 0;
const base_evaluator_1 = require("./base-evaluator");
/**
 * Evaluator for AI agent performance
 */
class AgentEvaluator extends base_evaluator_1.BaseEvaluator {
    constructor(config) {
        const defaultConfig = {
            criteria: [
                {
                    name: 'task_completion',
                    description: 'How well the agent completed the assigned task',
                    weight: 0.3,
                    threshold: 0.8,
                    required: true
                },
                {
                    name: 'efficiency',
                    description: 'How efficiently the agent executed the task',
                    weight: 0.2,
                    threshold: 0.6
                },
                {
                    name: 'accuracy',
                    description: 'How accurate the agent\'s outputs are',
                    weight: 0.2,
                    threshold: 0.7
                },
                {
                    name: 'reliability',
                    description: 'How reliably the agent performs without errors',
                    weight: 0.15,
                    threshold: 0.8
                },
                {
                    name: 'resource_optimization',
                    description: 'How well the agent optimizes resource usage',
                    weight: 0.1,
                    threshold: 0.5
                },
                {
                    name: 'error_handling',
                    description: 'How well the agent handles and recovers from errors',
                    weight: 0.05,
                    threshold: 0.6
                }
            ],
            passingThreshold: 0.75,
            aggregationMethod: 'weighted_average'
        };
        const mergedConfig = {
            ...defaultConfig,
            ...config,
            criteria: config?.criteria || defaultConfig.criteria
        };
        super('AgentEvaluator', mergedConfig);
    }
    /**
     * Evaluate a single criterion for agent evaluation
     */
    async evaluateCriterion(criterion, context) {
        const agentContext = context;
        if (!agentContext.input?.task || !agentContext.output) {
            return this.createResult(0, 'Missing required task input or agent output');
        }
        const { task, expectedOutcome, timeLimit, constraints } = agentContext.input;
        const { result, steps, executionTime, resourceUsage, errors } = agentContext.output;
        switch (criterion.name) {
            case 'task_completion':
                return this.evaluateTaskCompletion(task, result, expectedOutcome, steps, criterion.threshold);
            case 'efficiency':
                return this.evaluateEfficiency(steps, executionTime, timeLimit, criterion.threshold);
            case 'accuracy':
                return this.evaluateAccuracy(result, expectedOutcome, steps, criterion.threshold);
            case 'reliability':
                return this.evaluateReliability(steps, errors, criterion.threshold);
            case 'resource_optimization':
                return this.evaluateResourceOptimization(resourceUsage, steps, criterion.threshold);
            case 'error_handling':
                return this.evaluateErrorHandling(steps, errors, criterion.threshold);
            default:
                return this.createResult(0, `Unknown criterion: ${criterion.name}`);
        }
    }
    /**
     * Evaluate task completion
     */
    evaluateTaskCompletion(task, result, expectedOutcome, steps, threshold) {
        let score = 0;
        const details = {};
        // Check if result exists and is not null/undefined
        if (result !== null && result !== undefined) {
            score += 0.4;
            details.hasResult = true;
        }
        else {
            details.hasResult = false;
        }
        // Check if all steps completed successfully
        if (steps && steps.length > 0) {
            const successfulSteps = steps.filter(step => step.success).length;
            const completionRate = successfulSteps / steps.length;
            score += completionRate * 0.3;
            details.stepCompletionRate = completionRate;
            details.totalSteps = steps.length;
            details.successfulSteps = successfulSteps;
        }
        // Compare with expected outcome if provided
        if (expectedOutcome && result) {
            const outcomeMatch = this.compareWithExpectedOutcome(result, expectedOutcome);
            score += outcomeMatch * 0.3;
            details.outcomeMatch = outcomeMatch;
        }
        else {
            score += 0.3; // No expected outcome to compare against
        }
        let feedback = '';
        if (score < 0.5) {
            feedback = 'Task was not completed successfully';
        }
        else if (score < 0.8) {
            feedback = 'Task was partially completed with some issues';
        }
        else {
            feedback = 'Task was completed successfully';
        }
        return this.createResult(score, feedback, details, threshold);
    }
    /**
     * Evaluate efficiency
     */
    evaluateEfficiency(steps, executionTime, timeLimit, threshold) {
        let score = 0.5; // Base score
        const details = { executionTime, stepCount: steps?.length || 0 };
        // Time efficiency
        if (timeLimit && executionTime > 0) {
            const timeEfficiency = Math.max(0, 1 - (executionTime / timeLimit));
            score += timeEfficiency * 0.4;
            details.timeEfficiency = timeEfficiency;
            details.timeLimit = timeLimit;
        }
        // Step efficiency (fewer steps generally better for same outcome)
        if (steps && steps.length > 0) {
            // Penalize excessive steps, reward concise execution
            const stepEfficiency = Math.max(0, 1 - Math.log(steps.length) / 10);
            score += stepEfficiency * 0.3;
            details.stepEfficiency = stepEfficiency;
            // Reward steps that don't require retries
            const retriedSteps = steps.filter(step => steps.some(otherStep => otherStep.action === step.action &&
                otherStep.timestamp > step.timestamp)).length;
            const retryPenalty = retriedSteps / steps.length;
            score -= retryPenalty * 0.2;
            details.retryPenalty = retryPenalty;
        }
        let feedback = '';
        if (score < 0.4) {
            feedback = 'Agent execution was inefficient with excessive time or steps';
        }
        else if (score < 0.7) {
            feedback = 'Agent execution was moderately efficient';
        }
        else {
            feedback = 'Agent execution was highly efficient';
        }
        return this.createResult(score, feedback, details, threshold);
    }
    /**
     * Evaluate accuracy
     */
    evaluateAccuracy(result, expectedOutcome, steps, threshold) {
        let score = 0.5; // Base score when no expected outcome
        const details = {};
        if (expectedOutcome && result) {
            // Compare result with expected outcome
            const accuracy = this.compareWithExpectedOutcome(result, expectedOutcome);
            score = accuracy;
            details.expectedOutcomeMatch = accuracy;
        }
        // Check consistency across steps
        if (steps && steps.length > 1) {
            const consistencyScore = this.evaluateStepConsistency(steps);
            score = (score + consistencyScore) / 2;
            details.stepConsistency = consistencyScore;
        }
        // Check for logical errors in reasoning
        if (steps) {
            const logicalConsistency = this.evaluateLogicalConsistency(steps);
            score = (score * 0.7) + (logicalConsistency * 0.3);
            details.logicalConsistency = logicalConsistency;
        }
        let feedback = '';
        if (score < 0.5) {
            feedback = 'Agent outputs contain significant inaccuracies';
        }
        else if (score < 0.8) {
            feedback = 'Agent outputs are mostly accurate with minor issues';
        }
        else {
            feedback = 'Agent outputs are highly accurate';
        }
        return this.createResult(score, feedback, details, threshold);
    }
    /**
     * Evaluate reliability
     */
    evaluateReliability(steps, errors, threshold) {
        let score = 1.0; // Start with perfect score
        const details = {};
        if (steps && steps.length > 0) {
            const failedSteps = steps.filter(step => !step.success).length;
            const failureRate = failedSteps / steps.length;
            score -= failureRate * 0.6;
            details.failureRate = failureRate;
            details.failedSteps = failedSteps;
            details.totalSteps = steps.length;
        }
        if (errors && errors.length > 0) {
            // Penalize based on number and severity of errors
            const errorPenalty = Math.min(0.4, errors.length * 0.1);
            score -= errorPenalty;
            details.errorCount = errors.length;
            details.errorPenalty = errorPenalty;
        }
        // Check for recovery from failures
        if (steps) {
            const recoveryScore = this.evaluateRecoveryCapability(steps);
            score += recoveryScore * 0.2;
            details.recoveryScore = recoveryScore;
        }
        score = Math.max(0, score);
        let feedback = '';
        if (score < 0.5) {
            feedback = 'Agent showed poor reliability with frequent failures';
        }
        else if (score < 0.8) {
            feedback = 'Agent showed moderate reliability with some failures';
        }
        else {
            feedback = 'Agent demonstrated high reliability';
        }
        return this.createResult(score, feedback, details, threshold);
    }
    /**
     * Evaluate resource optimization
     */
    evaluateResourceOptimization(resourceUsage, steps, threshold) {
        let score = 0.5; // Default score when no resource data
        const details = {};
        if (resourceUsage) {
            // Evaluate memory efficiency
            if (resourceUsage.memoryUsed !== undefined) {
                const memoryScore = this.evaluateMemoryUsage(resourceUsage.memoryUsed);
                score += memoryScore * 0.3;
                details.memoryScore = memoryScore;
            }
            // Evaluate API call efficiency
            if (resourceUsage.apiCalls !== undefined && steps) {
                const apiEfficiency = this.evaluateApiEfficiency(resourceUsage.apiCalls, steps.length);
                score += apiEfficiency * 0.3;
                details.apiEfficiency = apiEfficiency;
            }
            // Evaluate cost efficiency
            if (resourceUsage.cost !== undefined) {
                const costEfficiency = this.evaluateCostEfficiency(resourceUsage.cost);
                score += costEfficiency * 0.2;
                details.costEfficiency = costEfficiency;
            }
            // Evaluate token usage efficiency
            if (resourceUsage.tokensUsed !== undefined) {
                const tokenEfficiency = this.evaluateTokenEfficiency(resourceUsage.tokensUsed);
                score += tokenEfficiency * 0.2;
                details.tokenEfficiency = tokenEfficiency;
            }
            details.resourceUsage = resourceUsage;
        }
        let feedback = '';
        if (score < 0.4) {
            feedback = 'Agent used resources inefficiently';
        }
        else if (score < 0.7) {
            feedback = 'Agent showed moderate resource optimization';
        }
        else {
            feedback = 'Agent demonstrated excellent resource optimization';
        }
        return this.createResult(score, feedback, details, threshold);
    }
    /**
     * Evaluate error handling
     */
    evaluateErrorHandling(steps, errors, threshold) {
        let score = 0.8; // Default good score when no errors
        const details = {};
        if (errors && errors.length > 0) {
            // Check if agent recovered from errors
            const recoveryAttempts = this.countRecoveryAttempts(steps, errors);
            const recoveryRate = recoveryAttempts / errors.length;
            score = recoveryRate * 0.7 + 0.3; // Base score for attempting recovery
            details.recoveryRate = recoveryRate;
            details.recoveryAttempts = recoveryAttempts;
            details.totalErrors = errors.length;
        }
        // Check for graceful degradation
        if (steps) {
            const gracefulDegradation = this.evaluateGracefulDegradation(steps);
            score = (score + gracefulDegradation) / 2;
            details.gracefulDegradation = gracefulDegradation;
        }
        let feedback = '';
        if (score < 0.4) {
            feedback = 'Agent showed poor error handling and recovery';
        }
        else if (score < 0.7) {
            feedback = 'Agent showed adequate error handling';
        }
        else {
            feedback = 'Agent demonstrated excellent error handling and recovery';
        }
        return this.createResult(score, feedback, details, threshold);
    }
    // Helper methods
    compareWithExpectedOutcome(result, expectedOutcome) {
        if (typeof result === 'string') {
            return this.calculateTextSimilarity(result, expectedOutcome);
        }
        if (typeof result === 'object') {
            const resultStr = JSON.stringify(result);
            return this.calculateTextSimilarity(resultStr, expectedOutcome);
        }
        return result?.toString() === expectedOutcome ? 1 : 0;
    }
    calculateTextSimilarity(text1, text2) {
        const words1 = text1.toLowerCase().split(/\s+/);
        const words2 = text2.toLowerCase().split(/\s+/);
        const set1 = new Set(words1);
        const set2 = new Set(words2);
        const intersection = new Set([...set1].filter(x => set2.has(x)));
        const union = new Set([...set1, ...set2]);
        return union.size > 0 ? intersection.size / union.size : 0;
    }
    evaluateStepConsistency(steps) {
        // Check if similar actions produce similar outputs
        const actionGroups = new Map();
        for (const step of steps) {
            if (!actionGroups.has(step.action)) {
                actionGroups.set(step.action, []);
            }
            actionGroups.get(step.action).push(step);
        }
        let totalConsistency = 0;
        let groupCount = 0;
        for (const [action, groupSteps] of actionGroups) {
            if (groupSteps.length > 1) {
                const consistency = this.calculateGroupConsistency(groupSteps);
                totalConsistency += consistency;
                groupCount++;
            }
        }
        return groupCount > 0 ? totalConsistency / groupCount : 1;
    }
    calculateGroupConsistency(steps) {
        // Simple consistency check based on success rate
        const successCount = steps.filter(step => step.success).length;
        return successCount / steps.length;
    }
    evaluateLogicalConsistency(steps) {
        // Check for logical flow and dependencies
        let consistencyScore = 1;
        for (let i = 1; i < steps.length; i++) {
            const prevStep = steps[i - 1];
            const currentStep = steps[i];
            // If previous step failed, current step should handle it
            if (!prevStep.success && currentStep.action === prevStep.action) {
                consistencyScore -= 0.1; // Penalty for repeating failed action without modification
            }
        }
        return Math.max(0, consistencyScore);
    }
    evaluateRecoveryCapability(steps) {
        let recoveryScore = 0;
        let failureCount = 0;
        let recoveryCount = 0;
        for (let i = 0; i < steps.length - 1; i++) {
            if (!steps[i].success) {
                failureCount++;
                // Check if next step attempts recovery
                if (steps[i + 1].success) {
                    recoveryCount++;
                }
            }
        }
        return failureCount > 0 ? recoveryCount / failureCount : 1;
    }
    evaluateMemoryUsage(memoryUsed) {
        // Normalize memory usage (assuming reasonable limits)
        const maxReasonableMemory = 1024 * 1024 * 1024; // 1GB
        return Math.max(0, 1 - (memoryUsed / maxReasonableMemory));
    }
    evaluateApiEfficiency(apiCalls, stepCount) {
        // Ideal ratio is close to 1:1 (one API call per step)
        const ratio = apiCalls / Math.max(1, stepCount);
        return Math.max(0, 1 - Math.abs(ratio - 1));
    }
    evaluateCostEfficiency(cost) {
        // Normalize cost (this would need domain-specific thresholds)
        const maxReasonableCost = 10; // $10 as example threshold
        return Math.max(0, 1 - (cost / maxReasonableCost));
    }
    evaluateTokenEfficiency(tokensUsed) {
        // Normalize token usage
        const maxReasonableTokens = 100000; // 100k tokens as example
        return Math.max(0, 1 - (tokensUsed / maxReasonableTokens));
    }
    countRecoveryAttempts(steps, errors) {
        // Count how many times agent attempted to recover from errors
        let recoveryAttempts = 0;
        for (let i = 1; i < steps.length; i++) {
            const prevStep = steps[i - 1];
            const currentStep = steps[i];
            if (!prevStep.success && currentStep.action !== prevStep.action) {
                recoveryAttempts++;
            }
        }
        return recoveryAttempts;
    }
    evaluateGracefulDegradation(steps) {
        // Check if agent gracefully handles failures by adjusting approach
        let degradationScore = 1;
        for (let i = 1; i < steps.length; i++) {
            const prevStep = steps[i - 1];
            const currentStep = steps[i];
            if (!prevStep.success) {
                // Good: trying different approach
                if (currentStep.action !== prevStep.action) {
                    degradationScore += 0.1;
                }
                // Bad: giving up completely
                else if (currentStep.action === 'abort' || currentStep.action === 'fail') {
                    degradationScore -= 0.2;
                }
            }
        }
        return Math.max(0, Math.min(1, degradationScore));
    }
}
exports.AgentEvaluator = AgentEvaluator;
//# sourceMappingURL=agent-evaluator.js.map