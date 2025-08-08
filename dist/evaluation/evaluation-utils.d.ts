/**
 * Utility functions for evaluation operations
 */
import { EvaluationResult, EvaluationContext, EvaluationReport } from './base-evaluator';
export interface EvaluationDataset {
    id: string;
    name: string;
    description: string;
    contexts: EvaluationContext[];
    groundTruth?: Array<{
        contextId: string;
        expectedScore: number;
        expectedPassed: boolean;
        expertJudgment?: string;
        metadata?: Record<string, any>;
    }>;
    metadata: {
        createdAt: string;
        version: string;
        size: number;
        domain?: string;
        difficulty?: 'easy' | 'medium' | 'hard' | 'mixed';
        tags?: string[];
    };
}
export interface EvaluationBenchmark {
    id: string;
    name: string;
    description: string;
    datasets: EvaluationDataset[];
    baselines: Array<{
        name: string;
        results: EvaluationResult[];
        metadata: Record<string, any>;
    }>;
    metrics: string[];
    leaderboard?: Array<{
        rank: number;
        name: string;
        score: number;
        results: EvaluationResult[];
        submissionDate: string;
    }>;
}
export interface EvaluationExport {
    format: 'json' | 'csv' | 'xlsx' | 'pdf';
    data: EvaluationResult[] | EvaluationReport | EvaluationBenchmark;
    options?: {
        includeDetails?: boolean;
        includeMetadata?: boolean;
        groupBy?: string;
        sortBy?: string;
        filterBy?: Record<string, any>;
    };
}
export interface EvaluationImport {
    format: 'json' | 'csv' | 'xlsx';
    data: string | ArrayBuffer;
    mapping?: Record<string, string>;
    validation?: {
        required: string[];
        types: Record<string, string>;
        ranges: Record<string, [number, number]>;
    };
}
export interface EvaluationVisualization {
    type: 'histogram' | 'scatter' | 'line' | 'box' | 'heatmap' | 'radar';
    data: any[];
    config: {
        title: string;
        xAxis?: string;
        yAxis?: string;
        groupBy?: string;
        colorBy?: string;
        width?: number;
        height?: number;
    };
}
/**
 * Main utility class for evaluation operations
 */
export declare class EvaluationUtils {
    /**
     * Create a dataset from evaluation contexts
     */
    static createDataset(name: string, contexts: EvaluationContext[], options?: {
        description?: string;
        domain?: string;
        difficulty?: 'easy' | 'medium' | 'hard' | 'mixed';
        tags?: string[];
        groundTruth?: EvaluationDataset['groundTruth'];
    }): EvaluationDataset;
    /**
     * Merge multiple datasets
     */
    static mergeDatasets(datasets: EvaluationDataset[], name: string): EvaluationDataset;
    /**
     * Split dataset into train/validation/test sets
     */
    static splitDataset(dataset: EvaluationDataset, splits: {
        train: number;
        validation: number;
        test: number;
    }): {
        train: EvaluationDataset;
        validation: EvaluationDataset;
        test: EvaluationDataset;
    };
    /**
     * Filter evaluation results based on criteria
     */
    static filterResults(results: EvaluationResult[], filters: {
        minScore?: number;
        maxScore?: number;
        passed?: boolean;
        evaluationType?: string;
        dateRange?: {
            start: Date;
            end: Date;
        };
        customFilter?: (result: EvaluationResult) => boolean;
    }): EvaluationResult[];
    /**
     * Group evaluation results by a specified field
     */
    static groupResults(results: EvaluationResult[], groupBy: string): Record<string, EvaluationResult[]>;
    /**
     * Calculate aggregate statistics for grouped results
     */
    static calculateGroupStatistics(groupedResults: Record<string, EvaluationResult[]>): Record<string, {
        count: number;
        averageScore: number;
        passRate: number;
        minScore: number;
        maxScore: number;
        standardDeviation: number;
    }>;
    /**
     * Generate evaluation summary report
     */
    static generateSummaryReport(results: EvaluationResult[], options?: {
        includeDistribution?: boolean;
        includeCorrelations?: boolean;
        includeTrends?: boolean;
        groupBy?: string;
    }): {
        overview: {
            totalEvaluations: number;
            averageScore: number;
            passRate: number;
            scoreDistribution: Record<string, number>;
        };
        groups?: Record<string, any>;
        trends?: any;
        recommendations: string[];
    };
    /**
     * Generate recommendations based on evaluation results
     */
    private static generateRecommendations;
    /**
     * Analyze failure patterns in evaluation results
     */
    private static analyzeFailurePatterns;
    /**
     * Export evaluation results to different formats
     */
    static exportResults(exportConfig: EvaluationExport): string;
    /**
     * Import evaluation results from different formats
     */
    static importResults(importConfig: EvaluationImport): EvaluationResult[];
    /**
     * Create visualization data for evaluation results
     */
    static createVisualization(results: EvaluationResult[], type: EvaluationVisualization['type'], config: Partial<EvaluationVisualization['config']>): EvaluationVisualization;
    private static exportToJSON;
    private static exportToCSV;
    private static importFromJSON;
    private static importFromCSV;
    private static parseCSVLine;
    private static mapAndValidateResult;
    private static createHistogramData;
    private static createScatterData;
    private static createLineData;
    private static createBoxPlotData;
    private static createHeatmapData;
    private static createRadarData;
}
/**
 * Specialized utilities for different evaluation domains
 */
export declare class DomainSpecificUtils {
    /**
     * Utilities for NLP evaluation
     */
    static nlp: {
        calculateBLEU: (reference: string, candidate: string) => number;
        calculateROUGE: (reference: string, candidate: string) => number;
        calculateSemanticSimilarity: (text1: string, text2: string) => number;
    };
    /**
     * Utilities for code evaluation
     */
    static code: {
        calculateCodeSimilarity: (code1: string, code2: string) => number;
        calculateEditDistance: (str1: string, str2: string) => number;
    };
    /**
     * Utilities for multimodal evaluation
     */
    static multimodal: {
        calculateImageSimilarity: (image1Desc: string, image2Desc: string) => number;
        calculateAudioSimilarity: (audio1Desc: string, audio2Desc: string) => number;
    };
}
//# sourceMappingURL=evaluation-utils.d.ts.map