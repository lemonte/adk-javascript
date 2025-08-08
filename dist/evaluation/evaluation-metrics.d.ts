/**
 * Evaluation metrics and statistical analysis utilities
 */
import { EvaluationResult } from './base-evaluator';
export interface MetricResult {
    name: string;
    value: number;
    description: string;
    interpretation?: string;
    confidence?: number;
}
export interface StatisticalSummary {
    count: number;
    mean: number;
    median: number;
    mode: number[];
    standardDeviation: number;
    variance: number;
    min: number;
    max: number;
    range: number;
    quartiles: {
        q1: number;
        q2: number;
        q3: number;
        iqr: number;
    };
    percentiles: Record<number, number>;
    skewness: number;
    kurtosis: number;
}
export interface CorrelationMatrix {
    metrics: string[];
    matrix: number[][];
    significantCorrelations: Array<{
        metric1: string;
        metric2: string;
        correlation: number;
        strength: 'weak' | 'moderate' | 'strong' | 'very strong';
    }>;
}
export interface TrendAnalysis {
    trend: 'increasing' | 'decreasing' | 'stable' | 'volatile';
    slope: number;
    rSquared: number;
    confidence: number;
    predictions: Array<{
        period: number;
        predicted: number;
        confidence_interval: [number, number];
    }>;
}
export interface PerformanceMetrics {
    accuracy: MetricResult;
    precision: MetricResult;
    recall: MetricResult;
    f1Score: MetricResult;
    specificity: MetricResult;
    sensitivity: MetricResult;
    auc?: MetricResult;
    mcc?: MetricResult;
}
export interface QualityMetrics {
    consistency: MetricResult;
    reliability: MetricResult;
    validity: MetricResult;
    robustness: MetricResult;
    fairness: MetricResult;
}
export interface EfficiencyMetrics {
    throughput: MetricResult;
    latency: MetricResult;
    resourceUtilization: MetricResult;
    costEffectiveness: MetricResult;
}
export interface ComprehensiveMetrics {
    performance: PerformanceMetrics;
    quality: QualityMetrics;
    efficiency: EfficiencyMetrics;
    custom: Record<string, MetricResult>;
}
/**
 * Main class for calculating evaluation metrics
 */
export declare class EvaluationMetrics {
    private results;
    private metadata;
    constructor(results: EvaluationResult[], metadata?: Record<string, any>);
    /**
     * Calculate basic statistical summary
     */
    calculateStatisticalSummary(values?: number[]): StatisticalSummary;
    /**
     * Calculate performance metrics
     */
    calculatePerformanceMetrics(threshold?: number): PerformanceMetrics;
    /**
     * Calculate quality metrics
     */
    calculateQualityMetrics(): QualityMetrics;
    /**
     * Calculate efficiency metrics
     */
    calculateEfficiencyMetrics(): EfficiencyMetrics;
    /**
     * Calculate comprehensive metrics
     */
    calculateComprehensiveMetrics(threshold?: number): ComprehensiveMetrics;
    /**
     * Calculate correlation matrix between different metrics
     */
    calculateCorrelationMatrix(metricNames: string[]): CorrelationMatrix;
    /**
     * Analyze trends over time
     */
    analyzeTrends(timeSeriesData: Array<{
        timestamp: number;
        value: number;
    }>): TrendAnalysis;
    private calculatePercentile;
    private calculateSkewness;
    private calculateKurtosis;
    private calculateCorrelation;
    private calculateLinearRegression;
    private calculateStandardError;
    private calculateVolatility;
    private calculateReliability;
    private calculateValidity;
    private calculateRobustness;
    private calculateFairness;
    private calculateResourceUtilization;
    private calculateCostEffectiveness;
    private calculateCustomMetrics;
    private interpretAccuracy;
    private interpretPrecision;
    private interpretRecall;
    private interpretF1Score;
    private interpretSpecificity;
    private interpretMCC;
    private interpretConsistency;
    private interpretReliability;
    private interpretValidity;
    private interpretRobustness;
    private interpretFairness;
    private interpretThroughput;
    private interpretLatency;
    private interpretResourceUtilization;
    private interpretCostEffectiveness;
    private interpretCorrelationStrength;
}
/**
 * Utility functions for evaluation metrics
 */
export declare class EvaluationMetricsUtils {
    /**
     * Compare two sets of evaluation results
     */
    static compareResults(baseline: EvaluationResult[], comparison: EvaluationResult[]): {
        improvement: number;
        significantDifference: boolean;
        pValue?: number;
        effectSize: number;
        interpretation: string;
    };
    /**
     * Calculate confidence intervals for metrics
     */
    static calculateConfidenceInterval(values: number[], confidenceLevel?: number): {
        lower: number;
        upper: number;
        margin: number;
    };
    private static calculatePooledStandardDeviation;
    private static calculateTStatistic;
    private static getTCriticalValue;
}
//# sourceMappingURL=evaluation-metrics.d.ts.map