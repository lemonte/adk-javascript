"use strict";
/**
 * Base evaluator interface and abstract implementation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseEvaluator = void 0;
/**
 * Abstract base class for all evaluators
 */
class BaseEvaluator {
    constructor(name, config, version = '1.0.0') {
        this.name = name;
        this.config = this.validateConfig(config);
        this.version = version;
    }
    /**
     * Evaluate the given context against all criteria
     */
    async evaluate(context) {
        const criteriaResults = new Map();
        const scores = [];
        const weights = [];
        // Evaluate each criterion
        for (const criterion of this.config.criteria) {
            try {
                const result = await this.evaluateCriterion(criterion, context);
                criteriaResults.set(criterion.name, result);
                scores.push(result.score);
                weights.push(criterion.weight);
            }
            catch (error) {
                const errorResult = {
                    score: 0,
                    passed: false,
                    feedback: `Evaluation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
                    timestamp: new Date()
                };
                criteriaResults.set(criterion.name, errorResult);
                scores.push(0);
                weights.push(criterion.weight);
            }
        }
        // Calculate overall score
        const overallScore = this.aggregateScores(scores, weights);
        const passingThreshold = this.config.passingThreshold || 0.7;
        const passed = overallScore >= passingThreshold && this.checkRequiredCriteria(criteriaResults);
        // Generate summary and recommendations
        const summary = this.generateSummary(overallScore, passed, criteriaResults);
        const recommendations = this.generateRecommendations(criteriaResults);
        return {
            overallScore,
            passed,
            criteriaResults,
            summary,
            recommendations,
            timestamp: new Date(),
            evaluatorInfo: {
                name: this.name,
                version: this.version,
                config: this.config
            }
        };
    }
    /**
     * Validate the evaluation configuration
     */
    validateConfig(config) {
        if (!config.criteria || config.criteria.length === 0) {
            throw new Error('At least one evaluation criterion is required');
        }
        // Validate criteria
        for (const criterion of config.criteria) {
            if (!criterion.name || criterion.name.trim() === '') {
                throw new Error('Criterion name is required');
            }
            if (criterion.weight < 0 || criterion.weight > 1) {
                throw new Error(`Criterion weight must be between 0 and 1: ${criterion.name}`);
            }
            if (criterion.threshold !== undefined && (criterion.threshold < 0 || criterion.threshold > 1)) {
                throw new Error(`Criterion threshold must be between 0 and 1: ${criterion.name}`);
            }
        }
        // Normalize weights if they don't sum to 1
        const totalWeight = config.criteria.reduce((sum, c) => sum + c.weight, 0);
        if (Math.abs(totalWeight - 1) > 0.001) {
            config.criteria.forEach(c => c.weight = c.weight / totalWeight);
        }
        return {
            passingThreshold: 0.7,
            aggregationMethod: 'weighted_average',
            ...config
        };
    }
    /**
     * Aggregate scores based on the configured method
     */
    aggregateScores(scores, weights) {
        if (scores.length === 0) {
            return 0;
        }
        switch (this.config.aggregationMethod) {
            case 'weighted_average':
                return scores.reduce((sum, score, i) => sum + score * weights[i], 0);
            case 'minimum':
                return Math.min(...scores);
            case 'maximum':
                return Math.max(...scores);
            case 'custom':
                if (this.config.customAggregator) {
                    return this.config.customAggregator(scores, weights);
                }
                throw new Error('Custom aggregator function not provided');
            default:
                return scores.reduce((sum, score, i) => sum + score * weights[i], 0);
        }
    }
    /**
     * Check if all required criteria passed
     */
    checkRequiredCriteria(results) {
        for (const criterion of this.config.criteria) {
            if (criterion.required) {
                const result = results.get(criterion.name);
                if (!result || !result.passed) {
                    return false;
                }
            }
        }
        return true;
    }
    /**
     * Generate a summary of the evaluation
     */
    generateSummary(overallScore, passed, results) {
        const scorePercentage = Math.round(overallScore * 100);
        const status = passed ? 'PASSED' : 'FAILED';
        const passedCriteria = Array.from(results.values()).filter(r => r.passed).length;
        const totalCriteria = results.size;
        return `Evaluation ${status} with overall score of ${scorePercentage}%. ` +
            `${passedCriteria}/${totalCriteria} criteria passed.`;
    }
    /**
     * Generate recommendations based on evaluation results
     */
    generateRecommendations(results) {
        const recommendations = [];
        for (const [criterionName, result] of results) {
            if (!result.passed && result.feedback) {
                recommendations.push(`${criterionName}: ${result.feedback}`);
            }
        }
        return recommendations;
    }
    /**
     * Get evaluator information
     */
    getInfo() {
        return {
            name: this.name,
            version: this.version,
            config: this.config
        };
    }
    /**
     * Update evaluator configuration
     */
    updateConfig(newConfig) {
        this.config = this.validateConfig({ ...this.config, ...newConfig });
    }
    /**
     * Add a new criterion
     */
    addCriterion(criterion) {
        const updatedCriteria = [...this.config.criteria, criterion];
        this.updateConfig({ criteria: updatedCriteria });
    }
    /**
     * Remove a criterion by name
     */
    removeCriterion(name) {
        const updatedCriteria = this.config.criteria.filter(c => c.name !== name);
        if (updatedCriteria.length === this.config.criteria.length) {
            return false; // Criterion not found
        }
        this.updateConfig({ criteria: updatedCriteria });
        return true;
    }
    /**
     * Get criterion by name
     */
    getCriterion(name) {
        return this.config.criteria.find(c => c.name === name);
    }
    /**
     * List all criteria names
     */
    listCriteria() {
        return this.config.criteria.map(c => c.name);
    }
    /**
     * Create a normalized score (0-1) from any numeric value
     */
    normalizeScore(value, min = 0, max = 1) {
        if (max === min) {
            return 1;
        }
        return Math.max(0, Math.min(1, (value - min) / (max - min)));
    }
    /**
     * Create an evaluation result
     */
    createResult(score, feedback, details, threshold) {
        const normalizedScore = Math.max(0, Math.min(1, score));
        const passed = threshold ? normalizedScore >= threshold : normalizedScore >= 0.5;
        return {
            score: normalizedScore,
            passed,
            feedback,
            details,
            timestamp: new Date()
        };
    }
}
exports.BaseEvaluator = BaseEvaluator;
//# sourceMappingURL=base-evaluator.js.map