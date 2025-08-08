"use strict";
/**
 * Evaluation metrics and statistical analysis utilities
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.EvaluationMetricsUtils = exports.EvaluationMetrics = void 0;
/**
 * Main class for calculating evaluation metrics
 */
class EvaluationMetrics {
    constructor(results, metadata = {}) {
        this.results = results;
        this.metadata = metadata;
    }
    /**
     * Calculate basic statistical summary
     */
    calculateStatisticalSummary(values) {
        const scores = values || this.results.map(r => r.score);
        if (scores.length === 0) {
            throw new Error('No data available for statistical analysis');
        }
        const sorted = [...scores].sort((a, b) => a - b);
        const count = scores.length;
        const sum = scores.reduce((a, b) => a + b, 0);
        const mean = sum / count;
        // Median
        const median = count % 2 === 0
            ? (sorted[count / 2 - 1] + sorted[count / 2]) / 2
            : sorted[Math.floor(count / 2)];
        // Mode
        const frequency = new Map();
        scores.forEach(score => {
            frequency.set(score, (frequency.get(score) || 0) + 1);
        });
        const maxFreq = Math.max(...frequency.values());
        const mode = Array.from(frequency.entries())
            .filter(([, freq]) => freq === maxFreq)
            .map(([value]) => value);
        // Variance and Standard Deviation
        const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / count;
        const standardDeviation = Math.sqrt(variance);
        // Min, Max, Range
        const min = Math.min(...scores);
        const max = Math.max(...scores);
        const range = max - min;
        // Quartiles
        const q1 = this.calculatePercentile(sorted, 25);
        const q2 = median;
        const q3 = this.calculatePercentile(sorted, 75);
        const iqr = q3 - q1;
        // Percentiles
        const percentiles = {};
        [5, 10, 25, 50, 75, 90, 95, 99].forEach(p => {
            percentiles[p] = this.calculatePercentile(sorted, p);
        });
        // Skewness and Kurtosis
        const skewness = this.calculateSkewness(scores, mean, standardDeviation);
        const kurtosis = this.calculateKurtosis(scores, mean, standardDeviation);
        return {
            count,
            mean,
            median,
            mode,
            standardDeviation,
            variance,
            min,
            max,
            range,
            quartiles: { q1, q2, q3, iqr },
            percentiles,
            skewness,
            kurtosis
        };
    }
    /**
     * Calculate performance metrics
     */
    calculatePerformanceMetrics(threshold = 0.7) {
        const predictions = this.results.map(r => r.score >= threshold);
        const actuals = this.results.map(r => r.passed);
        if (predictions.length !== actuals.length) {
            throw new Error('Predictions and actuals must have the same length');
        }
        const tp = predictions.filter((pred, i) => pred && actuals[i]).length;
        const tn = predictions.filter((pred, i) => !pred && !actuals[i]).length;
        const fp = predictions.filter((pred, i) => pred && !actuals[i]).length;
        const fn = predictions.filter((pred, i) => !pred && actuals[i]).length;
        const accuracy = (tp + tn) / (tp + tn + fp + fn);
        const precision = tp / (tp + fp) || 0;
        const recall = tp / (tp + fn) || 0;
        const f1Score = 2 * (precision * recall) / (precision + recall) || 0;
        const specificity = tn / (tn + fp) || 0;
        const sensitivity = recall; // Same as recall
        // Matthews Correlation Coefficient
        const mccNumerator = (tp * tn) - (fp * fn);
        const mccDenominator = Math.sqrt((tp + fp) * (tp + fn) * (tn + fp) * (tn + fn));
        const mcc = mccDenominator === 0 ? 0 : mccNumerator / mccDenominator;
        return {
            accuracy: {
                name: 'Accuracy',
                value: accuracy,
                description: 'Proportion of correct predictions',
                interpretation: this.interpretAccuracy(accuracy)
            },
            precision: {
                name: 'Precision',
                value: precision,
                description: 'Proportion of positive predictions that were correct',
                interpretation: this.interpretPrecision(precision)
            },
            recall: {
                name: 'Recall',
                value: recall,
                description: 'Proportion of actual positives that were correctly identified',
                interpretation: this.interpretRecall(recall)
            },
            f1Score: {
                name: 'F1 Score',
                value: f1Score,
                description: 'Harmonic mean of precision and recall',
                interpretation: this.interpretF1Score(f1Score)
            },
            specificity: {
                name: 'Specificity',
                value: specificity,
                description: 'Proportion of actual negatives that were correctly identified',
                interpretation: this.interpretSpecificity(specificity)
            },
            sensitivity: {
                name: 'Sensitivity',
                value: sensitivity,
                description: 'Same as recall - proportion of actual positives correctly identified',
                interpretation: this.interpretRecall(sensitivity)
            },
            mcc: {
                name: 'Matthews Correlation Coefficient',
                value: mcc,
                description: 'Correlation between predicted and actual classifications',
                interpretation: this.interpretMCC(mcc)
            }
        };
    }
    /**
     * Calculate quality metrics
     */
    calculateQualityMetrics() {
        const scores = this.results.map(r => r.score);
        const summary = this.calculateStatisticalSummary(scores);
        // Consistency (inverse of coefficient of variation)
        const consistency = summary.mean === 0 ? 0 : 1 - (summary.standardDeviation / summary.mean);
        // Reliability (based on internal consistency)
        const reliability = this.calculateReliability();
        // Validity (correlation with expected outcomes)
        const validity = this.calculateValidity();
        // Robustness (resistance to outliers)
        const robustness = this.calculateRobustness(scores, summary);
        // Fairness (evenness of performance across groups)
        const fairness = this.calculateFairness();
        return {
            consistency: {
                name: 'Consistency',
                value: Math.max(0, consistency),
                description: 'How consistent the evaluation results are',
                interpretation: this.interpretConsistency(consistency)
            },
            reliability: {
                name: 'Reliability',
                value: reliability,
                description: 'How reliable the evaluation method is',
                interpretation: this.interpretReliability(reliability)
            },
            validity: {
                name: 'Validity',
                value: validity,
                description: 'How well the evaluation measures what it claims to measure',
                interpretation: this.interpretValidity(validity)
            },
            robustness: {
                name: 'Robustness',
                value: robustness,
                description: 'How resistant the evaluation is to outliers',
                interpretation: this.interpretRobustness(robustness)
            },
            fairness: {
                name: 'Fairness',
                value: fairness,
                description: 'How fair the evaluation is across different groups',
                interpretation: this.interpretFairness(fairness)
            }
        };
    }
    /**
     * Calculate efficiency metrics
     */
    calculateEfficiencyMetrics() {
        const executionTimes = this.results
            .map(r => r.details?.executionTime)
            .filter(time => time !== undefined);
        const avgExecutionTime = executionTimes.length > 0
            ? executionTimes.reduce((sum, time) => sum + time, 0) / executionTimes.length
            : 0;
        // Throughput (evaluations per second)
        const throughput = avgExecutionTime > 0 ? 1000 / avgExecutionTime : 0;
        // Latency (average response time)
        const latency = avgExecutionTime;
        // Resource utilization (mock calculation)
        const resourceUtilization = this.calculateResourceUtilization();
        // Cost effectiveness (mock calculation)
        const costEffectiveness = this.calculateCostEffectiveness();
        return {
            throughput: {
                name: 'Throughput',
                value: throughput,
                description: 'Number of evaluations per second',
                interpretation: this.interpretThroughput(throughput)
            },
            latency: {
                name: 'Latency',
                value: latency,
                description: 'Average evaluation time in milliseconds',
                interpretation: this.interpretLatency(latency)
            },
            resourceUtilization: {
                name: 'Resource Utilization',
                value: resourceUtilization,
                description: 'Efficiency of resource usage',
                interpretation: this.interpretResourceUtilization(resourceUtilization)
            },
            costEffectiveness: {
                name: 'Cost Effectiveness',
                value: costEffectiveness,
                description: 'Cost per evaluation unit',
                interpretation: this.interpretCostEffectiveness(costEffectiveness)
            }
        };
    }
    /**
     * Calculate comprehensive metrics
     */
    calculateComprehensiveMetrics(threshold = 0.7) {
        return {
            performance: this.calculatePerformanceMetrics(threshold),
            quality: this.calculateQualityMetrics(),
            efficiency: this.calculateEfficiencyMetrics(),
            custom: this.calculateCustomMetrics()
        };
    }
    /**
     * Calculate correlation matrix between different metrics
     */
    calculateCorrelationMatrix(metricNames) {
        const metricValues = {};
        // Extract metric values
        metricNames.forEach(name => {
            metricValues[name] = this.results.map(r => {
                // Extract metric value from result details
                return r.details?.[name] || r.score; // Fallback to score
            });
        });
        const matrix = [];
        const significantCorrelations = [];
        // Calculate correlation matrix
        for (let i = 0; i < metricNames.length; i++) {
            matrix[i] = [];
            for (let j = 0; j < metricNames.length; j++) {
                const correlation = this.calculateCorrelation(metricValues[metricNames[i]], metricValues[metricNames[j]]);
                matrix[i][j] = correlation;
                // Check for significant correlations
                if (i !== j && Math.abs(correlation) > 0.3) {
                    significantCorrelations.push({
                        metric1: metricNames[i],
                        metric2: metricNames[j],
                        correlation,
                        strength: this.interpretCorrelationStrength(Math.abs(correlation))
                    });
                }
            }
        }
        return {
            metrics: metricNames,
            matrix,
            significantCorrelations
        };
    }
    /**
     * Analyze trends over time
     */
    analyzeTrends(timeSeriesData) {
        if (timeSeriesData.length < 3) {
            throw new Error('Need at least 3 data points for trend analysis');
        }
        const n = timeSeriesData.length;
        const x = timeSeriesData.map((_, i) => i);
        const y = timeSeriesData.map(d => d.value);
        // Calculate linear regression
        const { slope, intercept, rSquared } = this.calculateLinearRegression(x, y);
        // Determine trend
        let trend;
        const slopeThreshold = 0.01;
        const volatilityThreshold = 0.3;
        const volatility = this.calculateVolatility(y);
        if (volatility > volatilityThreshold) {
            trend = 'volatile';
        }
        else if (Math.abs(slope) < slopeThreshold) {
            trend = 'stable';
        }
        else if (slope > 0) {
            trend = 'increasing';
        }
        else {
            trend = 'decreasing';
        }
        // Generate predictions
        const predictions = [];
        for (let i = 1; i <= 5; i++) {
            const futureX = n + i - 1;
            const predicted = slope * futureX + intercept;
            const standardError = this.calculateStandardError(x, y, slope, intercept);
            const margin = 1.96 * standardError; // 95% confidence interval
            predictions.push({
                period: i,
                predicted,
                confidence_interval: [predicted - margin, predicted + margin]
            });
        }
        return {
            trend,
            slope,
            rSquared,
            confidence: rSquared, // Use R² as confidence measure
            predictions
        };
    }
    // Helper methods for calculations
    calculatePercentile(sortedArray, percentile) {
        const index = (percentile / 100) * (sortedArray.length - 1);
        const lower = Math.floor(index);
        const upper = Math.ceil(index);
        const weight = index % 1;
        if (upper >= sortedArray.length) {
            return sortedArray[sortedArray.length - 1];
        }
        return sortedArray[lower] * (1 - weight) + sortedArray[upper] * weight;
    }
    calculateSkewness(values, mean, stdDev) {
        const n = values.length;
        const sum = values.reduce((acc, val) => acc + Math.pow((val - mean) / stdDev, 3), 0);
        return (n / ((n - 1) * (n - 2))) * sum;
    }
    calculateKurtosis(values, mean, stdDev) {
        const n = values.length;
        const sum = values.reduce((acc, val) => acc + Math.pow((val - mean) / stdDev, 4), 0);
        return ((n * (n + 1)) / ((n - 1) * (n - 2) * (n - 3))) * sum - (3 * Math.pow(n - 1, 2)) / ((n - 2) * (n - 3));
    }
    calculateCorrelation(x, y) {
        if (x.length !== y.length) {
            throw new Error('Arrays must have the same length');
        }
        const n = x.length;
        const sumX = x.reduce((a, b) => a + b, 0);
        const sumY = y.reduce((a, b) => a + b, 0);
        const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
        const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
        const sumYY = y.reduce((sum, yi) => sum + yi * yi, 0);
        const numerator = n * sumXY - sumX * sumY;
        const denominator = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));
        return denominator === 0 ? 0 : numerator / denominator;
    }
    calculateLinearRegression(x, y) {
        const n = x.length;
        const sumX = x.reduce((a, b) => a + b, 0);
        const sumY = y.reduce((a, b) => a + b, 0);
        const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
        const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
        const sumYY = y.reduce((sum, yi) => sum + yi * yi, 0);
        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;
        // Calculate R²
        const yMean = sumY / n;
        const totalSumSquares = y.reduce((sum, yi) => sum + Math.pow(yi - yMean, 2), 0);
        const residualSumSquares = y.reduce((sum, yi, i) => {
            const predicted = slope * x[i] + intercept;
            return sum + Math.pow(yi - predicted, 2);
        }, 0);
        const rSquared = 1 - (residualSumSquares / totalSumSquares);
        return { slope, intercept, rSquared };
    }
    calculateStandardError(x, y, slope, intercept) {
        const n = x.length;
        const residuals = y.map((yi, i) => yi - (slope * x[i] + intercept));
        const sumSquaredResiduals = residuals.reduce((sum, r) => sum + r * r, 0);
        return Math.sqrt(sumSquaredResiduals / (n - 2));
    }
    calculateVolatility(values) {
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
        return Math.sqrt(variance) / mean;
    }
    // Quality metric calculations
    calculateReliability() {
        // Mock implementation - in practice, this would use test-retest reliability or internal consistency
        const scores = this.results.map(r => r.score);
        const summary = this.calculateStatisticalSummary(scores);
        return Math.max(0, 1 - (summary.standardDeviation / summary.mean));
    }
    calculateValidity() {
        // Mock implementation - in practice, this would compare against ground truth or expert judgments
        const passedCount = this.results.filter(r => r.passed).length;
        return passedCount / this.results.length;
    }
    calculateRobustness(scores, summary) {
        // Calculate how much the mean changes when outliers are removed
        const outlierThreshold = 2; // Standard deviations
        const filteredScores = scores.filter(score => Math.abs(score - summary.mean) <= outlierThreshold * summary.standardDeviation);
        if (filteredScores.length === 0)
            return 0;
        const filteredMean = filteredScores.reduce((a, b) => a + b, 0) / filteredScores.length;
        const meanDifference = Math.abs(summary.mean - filteredMean);
        return Math.max(0, 1 - (meanDifference / summary.mean));
    }
    calculateFairness() {
        // Mock implementation - in practice, this would analyze performance across different demographic groups
        // For now, return a placeholder value
        return 0.8;
    }
    calculateResourceUtilization() {
        // Mock implementation
        return 0.75;
    }
    calculateCostEffectiveness() {
        // Mock implementation
        return 0.85;
    }
    calculateCustomMetrics() {
        // Placeholder for custom metrics
        return {};
    }
    // Interpretation methods
    interpretAccuracy(value) {
        if (value >= 0.9)
            return 'Excellent accuracy';
        if (value >= 0.8)
            return 'Good accuracy';
        if (value >= 0.7)
            return 'Acceptable accuracy';
        if (value >= 0.6)
            return 'Poor accuracy';
        return 'Very poor accuracy';
    }
    interpretPrecision(value) {
        if (value >= 0.9)
            return 'Excellent precision';
        if (value >= 0.8)
            return 'Good precision';
        if (value >= 0.7)
            return 'Acceptable precision';
        return 'Poor precision';
    }
    interpretRecall(value) {
        if (value >= 0.9)
            return 'Excellent recall';
        if (value >= 0.8)
            return 'Good recall';
        if (value >= 0.7)
            return 'Acceptable recall';
        return 'Poor recall';
    }
    interpretF1Score(value) {
        if (value >= 0.9)
            return 'Excellent F1 score';
        if (value >= 0.8)
            return 'Good F1 score';
        if (value >= 0.7)
            return 'Acceptable F1 score';
        return 'Poor F1 score';
    }
    interpretSpecificity(value) {
        if (value >= 0.9)
            return 'Excellent specificity';
        if (value >= 0.8)
            return 'Good specificity';
        if (value >= 0.7)
            return 'Acceptable specificity';
        return 'Poor specificity';
    }
    interpretMCC(value) {
        if (value >= 0.8)
            return 'Very strong correlation';
        if (value >= 0.6)
            return 'Strong correlation';
        if (value >= 0.4)
            return 'Moderate correlation';
        if (value >= 0.2)
            return 'Weak correlation';
        return 'Very weak or no correlation';
    }
    interpretConsistency(value) {
        if (value >= 0.9)
            return 'Very consistent';
        if (value >= 0.8)
            return 'Consistent';
        if (value >= 0.7)
            return 'Moderately consistent';
        return 'Inconsistent';
    }
    interpretReliability(value) {
        if (value >= 0.9)
            return 'Very reliable';
        if (value >= 0.8)
            return 'Reliable';
        if (value >= 0.7)
            return 'Moderately reliable';
        return 'Unreliable';
    }
    interpretValidity(value) {
        if (value >= 0.9)
            return 'Very valid';
        if (value >= 0.8)
            return 'Valid';
        if (value >= 0.7)
            return 'Moderately valid';
        return 'Invalid';
    }
    interpretRobustness(value) {
        if (value >= 0.9)
            return 'Very robust';
        if (value >= 0.8)
            return 'Robust';
        if (value >= 0.7)
            return 'Moderately robust';
        return 'Not robust';
    }
    interpretFairness(value) {
        if (value >= 0.9)
            return 'Very fair';
        if (value >= 0.8)
            return 'Fair';
        if (value >= 0.7)
            return 'Moderately fair';
        return 'Unfair';
    }
    interpretThroughput(value) {
        if (value >= 10)
            return 'High throughput';
        if (value >= 5)
            return 'Moderate throughput';
        if (value >= 1)
            return 'Low throughput';
        return 'Very low throughput';
    }
    interpretLatency(value) {
        if (value <= 100)
            return 'Very low latency';
        if (value <= 500)
            return 'Low latency';
        if (value <= 1000)
            return 'Moderate latency';
        if (value <= 5000)
            return 'High latency';
        return 'Very high latency';
    }
    interpretResourceUtilization(value) {
        if (value >= 0.9)
            return 'Very efficient';
        if (value >= 0.8)
            return 'Efficient';
        if (value >= 0.7)
            return 'Moderately efficient';
        return 'Inefficient';
    }
    interpretCostEffectiveness(value) {
        if (value >= 0.9)
            return 'Very cost effective';
        if (value >= 0.8)
            return 'Cost effective';
        if (value >= 0.7)
            return 'Moderately cost effective';
        return 'Not cost effective';
    }
    interpretCorrelationStrength(value) {
        if (value >= 0.8)
            return 'very strong';
        if (value >= 0.6)
            return 'strong';
        if (value >= 0.4)
            return 'moderate';
        return 'weak';
    }
}
exports.EvaluationMetrics = EvaluationMetrics;
/**
 * Utility functions for evaluation metrics
 */
class EvaluationMetricsUtils {
    /**
     * Compare two sets of evaluation results
     */
    static compareResults(baseline, comparison) {
        const baselineScores = baseline.map(r => r.score);
        const comparisonScores = comparison.map(r => r.score);
        const baselineMean = baselineScores.reduce((a, b) => a + b, 0) / baselineScores.length;
        const comparisonMean = comparisonScores.reduce((a, b) => a + b, 0) / comparisonScores.length;
        const improvement = (comparisonMean - baselineMean) / baselineMean;
        // Calculate effect size (Cohen's d)
        const pooledStd = this.calculatePooledStandardDeviation(baselineScores, comparisonScores);
        const effectSize = (comparisonMean - baselineMean) / pooledStd;
        // Simple significance test (t-test approximation)
        const tStatistic = this.calculateTStatistic(baselineScores, comparisonScores);
        const significantDifference = Math.abs(tStatistic) > 1.96; // Approximate p < 0.05
        let interpretation = '';
        if (Math.abs(effectSize) < 0.2) {
            interpretation = 'Negligible difference';
        }
        else if (Math.abs(effectSize) < 0.5) {
            interpretation = 'Small difference';
        }
        else if (Math.abs(effectSize) < 0.8) {
            interpretation = 'Medium difference';
        }
        else {
            interpretation = 'Large difference';
        }
        if (improvement > 0) {
            interpretation += ' (improvement)';
        }
        else if (improvement < 0) {
            interpretation += ' (degradation)';
        }
        return {
            improvement,
            significantDifference,
            effectSize,
            interpretation
        };
    }
    /**
     * Calculate confidence intervals for metrics
     */
    static calculateConfidenceInterval(values, confidenceLevel = 0.95) {
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const std = Math.sqrt(values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (values.length - 1));
        const standardError = std / Math.sqrt(values.length);
        // Use t-distribution critical value (approximation)
        const alpha = 1 - confidenceLevel;
        const tCritical = this.getTCriticalValue(values.length - 1, alpha / 2);
        const margin = tCritical * standardError;
        return {
            lower: mean - margin,
            upper: mean + margin,
            margin
        };
    }
    static calculatePooledStandardDeviation(group1, group2) {
        const n1 = group1.length;
        const n2 = group2.length;
        const mean1 = group1.reduce((a, b) => a + b, 0) / n1;
        const mean2 = group2.reduce((a, b) => a + b, 0) / n2;
        const ss1 = group1.reduce((sum, val) => sum + Math.pow(val - mean1, 2), 0);
        const ss2 = group2.reduce((sum, val) => sum + Math.pow(val - mean2, 2), 0);
        return Math.sqrt((ss1 + ss2) / (n1 + n2 - 2));
    }
    static calculateTStatistic(group1, group2) {
        const n1 = group1.length;
        const n2 = group2.length;
        const mean1 = group1.reduce((a, b) => a + b, 0) / n1;
        const mean2 = group2.reduce((a, b) => a + b, 0) / n2;
        const pooledStd = this.calculatePooledStandardDeviation(group1, group2);
        const standardError = pooledStd * Math.sqrt(1 / n1 + 1 / n2);
        return (mean1 - mean2) / standardError;
    }
    static getTCriticalValue(degreesOfFreedom, alpha) {
        // Simplified approximation for t-critical values
        // In practice, you'd use a proper t-distribution table or library
        if (degreesOfFreedom >= 30) {
            return 1.96; // Normal approximation
        }
        else if (degreesOfFreedom >= 20) {
            return 2.086;
        }
        else if (degreesOfFreedom >= 10) {
            return 2.228;
        }
        else {
            return 2.571;
        }
    }
}
exports.EvaluationMetricsUtils = EvaluationMetricsUtils;
//# sourceMappingURL=evaluation-metrics.js.map