"use strict";
/**
 * Utility functions for evaluation operations
 */
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DomainSpecificUtils = exports.EvaluationUtils = void 0;
/**
 * Main utility class for evaluation operations
 */
class EvaluationUtils {
    /**
     * Create a dataset from evaluation contexts
     */
    static createDataset(name, contexts, options = {}) {
        return {
            id: `dataset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name,
            description: options.description || `Dataset with ${contexts.length} evaluation contexts`,
            contexts,
            groundTruth: options.groundTruth,
            metadata: {
                createdAt: new Date().toISOString(),
                version: '1.0.0',
                size: contexts.length,
                domain: options.domain,
                difficulty: options.difficulty,
                tags: options.tags
            }
        };
    }
    /**
     * Merge multiple datasets
     */
    static mergeDatasets(datasets, name) {
        const allContexts = datasets.flatMap(d => d.contexts);
        const allGroundTruth = datasets.flatMap(d => d.groundTruth || []);
        const allTags = [...new Set(datasets.flatMap(d => d.metadata.tags || []))];
        return {
            id: `merged-dataset-${Date.now()}`,
            name,
            description: `Merged dataset from ${datasets.length} source datasets`,
            contexts: allContexts,
            groundTruth: allGroundTruth.length > 0 ? allGroundTruth : undefined,
            metadata: {
                createdAt: new Date().toISOString(),
                version: '1.0.0',
                size: allContexts.length,
                difficulty: 'mixed',
                tags: allTags,
                sourceDatasets: datasets.map(d => ({ id: d.id, name: d.name, size: d.metadata.size }))
            }
        };
    }
    /**
     * Split dataset into train/validation/test sets
     */
    static splitDataset(dataset, splits) {
        // Validate splits
        const total = splits.train + splits.validation + splits.test;
        if (Math.abs(total - 1.0) > 0.001) {
            throw new Error('Split ratios must sum to 1.0');
        }
        // Shuffle contexts for random split
        const shuffled = [...dataset.contexts].sort(() => Math.random() - 0.5);
        const size = shuffled.length;
        const trainSize = Math.floor(size * splits.train);
        const validationSize = Math.floor(size * splits.validation);
        const testSize = size - trainSize - validationSize;
        const trainContexts = shuffled.slice(0, trainSize);
        const validationContexts = shuffled.slice(trainSize, trainSize + validationSize);
        const testContexts = shuffled.slice(trainSize + validationSize);
        return {
            train: {
                ...dataset,
                id: `${dataset.id}-train`,
                name: `${dataset.name} (Train)`,
                contexts: trainContexts,
                metadata: {
                    ...dataset.metadata,
                    size: trainContexts.length,
                    split: 'train',
                    parentDataset: dataset.id
                }
            },
            validation: {
                ...dataset,
                id: `${dataset.id}-validation`,
                name: `${dataset.name} (Validation)`,
                contexts: validationContexts,
                metadata: {
                    ...dataset.metadata,
                    size: validationContexts.length,
                    split: 'validation',
                    parentDataset: dataset.id
                }
            },
            test: {
                ...dataset,
                id: `${dataset.id}-test`,
                name: `${dataset.name} (Test)`,
                contexts: testContexts,
                metadata: {
                    ...dataset.metadata,
                    size: testContexts.length,
                    split: 'test',
                    parentDataset: dataset.id
                }
            }
        };
    }
    /**
     * Filter evaluation results based on criteria
     */
    static filterResults(results, filters) {
        return results.filter(result => {
            // Score filters
            if (filters.minScore !== undefined && result.score < filters.minScore) {
                return false;
            }
            if (filters.maxScore !== undefined && result.score > filters.maxScore) {
                return false;
            }
            // Passed filter
            if (filters.passed !== undefined && result.passed !== filters.passed) {
                return false;
            }
            // Evaluation type filter
            if (filters.evaluationType && result.details?.evaluationType !== filters.evaluationType) {
                return false;
            }
            // Date range filter
            if (filters.dateRange && result.details?.timestamp) {
                const resultDate = new Date(result.details.timestamp);
                if (resultDate < filters.dateRange.start || resultDate > filters.dateRange.end) {
                    return false;
                }
            }
            // Custom filter
            if (filters.customFilter && !filters.customFilter(result)) {
                return false;
            }
            return true;
        });
    }
    /**
     * Group evaluation results by a specified field
     */
    static groupResults(results, groupBy) {
        const groups = {};
        for (const result of results) {
            let groupKey;
            switch (groupBy) {
                case 'passed':
                    groupKey = result.passed ? 'passed' : 'failed';
                    break;
                case 'evaluationType':
                    groupKey = result.details?.evaluationType || 'unknown';
                    break;
                case 'scoreRange':
                    if (result.score >= 0.8)
                        groupKey = 'excellent';
                    else if (result.score >= 0.6)
                        groupKey = 'good';
                    else if (result.score >= 0.4)
                        groupKey = 'fair';
                    else
                        groupKey = 'poor';
                    break;
                case 'date':
                    const date = result.details?.timestamp ? new Date(result.details.timestamp) : new Date();
                    groupKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
                    break;
                default:
                    groupKey = result.details?.[groupBy]?.toString() || 'unknown';
            }
            if (!groups[groupKey]) {
                groups[groupKey] = [];
            }
            groups[groupKey].push(result);
        }
        return groups;
    }
    /**
     * Calculate aggregate statistics for grouped results
     */
    static calculateGroupStatistics(groupedResults) {
        const statistics = {};
        for (const [group, results] of Object.entries(groupedResults)) {
            const scores = results.map(r => r.score);
            const passedCount = results.filter(r => r.passed).length;
            const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
            const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
            const standardDeviation = Math.sqrt(variance);
            statistics[group] = {
                count: results.length,
                averageScore: mean,
                passRate: passedCount / results.length,
                minScore: Math.min(...scores),
                maxScore: Math.max(...scores),
                standardDeviation
            };
        }
        return statistics;
    }
    /**
     * Generate evaluation summary report
     */
    static generateSummaryReport(results, options = {}) {
        const totalEvaluations = results.length;
        const averageScore = results.reduce((sum, r) => sum + r.score, 0) / totalEvaluations;
        const passedCount = results.filter(r => r.passed).length;
        const passRate = passedCount / totalEvaluations;
        // Score distribution
        const scoreDistribution = {
            'excellent (0.8-1.0)': results.filter(r => r.score >= 0.8).length,
            'good (0.6-0.8)': results.filter(r => r.score >= 0.6 && r.score < 0.8).length,
            'fair (0.4-0.6)': results.filter(r => r.score >= 0.4 && r.score < 0.6).length,
            'poor (0.0-0.4)': results.filter(r => r.score < 0.4).length
        };
        const overview = {
            totalEvaluations,
            averageScore,
            passRate,
            scoreDistribution
        };
        // Group analysis
        let groups;
        if (options.groupBy) {
            const groupedResults = this.groupResults(results, options.groupBy);
            groups = this.calculateGroupStatistics(groupedResults);
        }
        // Generate recommendations
        const recommendations = this.generateRecommendations(results, { averageScore, passRate, scoreDistribution });
        return {
            overview,
            groups,
            recommendations
        };
    }
    /**
     * Generate recommendations based on evaluation results
     */
    static generateRecommendations(results, summary) {
        const recommendations = [];
        // Score-based recommendations
        if (summary.averageScore < 0.6) {
            recommendations.push('Overall performance is below acceptable levels. Consider reviewing evaluation criteria or improving the system.');
        }
        else if (summary.averageScore < 0.8) {
            recommendations.push('Performance is acceptable but has room for improvement. Focus on addressing common failure patterns.');
        }
        // Pass rate recommendations
        if (summary.passRate < 0.7) {
            recommendations.push('Low pass rate indicates systematic issues. Review failed evaluations for common patterns.');
        }
        // Distribution-based recommendations
        const poorPerformance = summary.scoreDistribution['poor (0.0-0.4)'];
        const totalEvaluations = Object.values(summary.scoreDistribution).reduce((a, b) => a + b, 0);
        if (poorPerformance / totalEvaluations > 0.2) {
            recommendations.push('High proportion of poor-performing evaluations. Consider additional training or system improvements.');
        }
        // Consistency recommendations
        const scores = results.map(r => r.score);
        const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
        const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
        const standardDeviation = Math.sqrt(variance);
        if (standardDeviation > 0.3) {
            recommendations.push('High variability in scores suggests inconsistent performance. Review evaluation criteria for clarity.');
        }
        // Specific failure pattern analysis
        const failedResults = results.filter(r => !r.passed);
        if (failedResults.length > 0) {
            const commonFailureReasons = this.analyzeFailurePatterns(failedResults);
            if (commonFailureReasons.length > 0) {
                recommendations.push(`Common failure patterns identified: ${commonFailureReasons.join(', ')}`);
            }
        }
        return recommendations;
    }
    /**
     * Analyze failure patterns in evaluation results
     */
    static analyzeFailurePatterns(failedResults) {
        const patterns = [];
        // Analyze feedback for common themes
        const feedbackWords = failedResults
            .map(r => r.feedback.toLowerCase().split(/\s+/))
            .flat();
        const wordFrequency = new Map();
        feedbackWords.forEach(word => {
            if (word.length > 3) { // Filter out short words
                wordFrequency.set(word, (wordFrequency.get(word) || 0) + 1);
            }
        });
        // Find most common failure-related words
        const commonWords = Array.from(wordFrequency.entries())
            .filter(([word, count]) => count >= Math.max(2, failedResults.length * 0.3))
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([word]) => word);
        if (commonWords.length > 0) {
            patterns.push(`frequent issues with: ${commonWords.join(', ')}`);
        }
        return patterns;
    }
    /**
     * Export evaluation results to different formats
     */
    static exportResults(exportConfig) {
        const { format, data, options = {} } = exportConfig;
        switch (format) {
            case 'json':
                return this.exportToJSON(data, options);
            case 'csv':
                return this.exportToCSV(data, options);
            case 'xlsx':
                throw new Error('XLSX export not implemented - requires additional library');
            case 'pdf':
                throw new Error('PDF export not implemented - requires additional library');
            default:
                throw new Error(`Unsupported export format: ${format}`);
        }
    }
    /**
     * Import evaluation results from different formats
     */
    static importResults(importConfig) {
        const { format, data, mapping = {}, validation } = importConfig;
        switch (format) {
            case 'json':
                return this.importFromJSON(data, mapping, validation);
            case 'csv':
                return this.importFromCSV(data, mapping, validation);
            case 'xlsx':
                throw new Error('XLSX import not implemented - requires additional library');
            default:
                throw new Error(`Unsupported import format: ${format}`);
        }
    }
    /**
     * Create visualization data for evaluation results
     */
    static createVisualization(results, type, config) {
        let data;
        switch (type) {
            case 'histogram':
                data = this.createHistogramData(results);
                break;
            case 'scatter':
                data = this.createScatterData(results);
                break;
            case 'line':
                data = this.createLineData(results);
                break;
            case 'box':
                data = this.createBoxPlotData(results);
                break;
            case 'heatmap':
                data = this.createHeatmapData(results);
                break;
            case 'radar':
                data = this.createRadarData(results);
                break;
            default:
                throw new Error(`Unsupported visualization type: ${type}`);
        }
        return {
            type,
            data,
            config: {
                title: `Evaluation Results - ${type.charAt(0).toUpperCase() + type.slice(1)}`,
                width: 800,
                height: 600,
                ...config
            }
        };
    }
    // Export helper methods
    static exportToJSON(data, options) {
        if (options.includeDetails === false && Array.isArray(data)) {
            // Remove details from results
            const simplified = data.map(({ details, ...rest }) => rest);
            return JSON.stringify(simplified, null, 2);
        }
        return JSON.stringify(data, null, 2);
    }
    static exportToCSV(results, options) {
        const headers = ['score', 'passed', 'feedback'];
        if (options.includeDetails !== false) {
            headers.push('evaluationType', 'executionTime', 'timestamp');
        }
        const rows = results.map(result => {
            const row = [
                result.score.toString(),
                result.passed.toString(),
                `"${result.feedback.replace(/"/g, '""')}"` // Escape quotes
            ];
            if (options.includeDetails !== false) {
                row.push(result.details?.evaluationType || '', result.details?.executionTime?.toString() || '', result.details?.timestamp || '');
            }
            return row;
        });
        return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    }
    // Import helper methods
    static importFromJSON(data, mapping, validation) {
        const parsed = JSON.parse(data);
        if (!Array.isArray(parsed)) {
            throw new Error('JSON data must be an array of evaluation results');
        }
        return parsed.map(item => this.mapAndValidateResult(item, mapping, validation));
    }
    static importFromCSV(data, mapping, validation) {
        const lines = data.trim().split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        return lines.slice(1).map(line => {
            const values = this.parseCSVLine(line);
            const item = {};
            headers.forEach((header, index) => {
                item[header] = values[index];
            });
            return this.mapAndValidateResult(item, mapping, validation);
        });
    }
    static parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
                if (inQuotes && line[i + 1] === '"') {
                    current += '"';
                    i++; // Skip next quote
                }
                else {
                    inQuotes = !inQuotes;
                }
            }
            else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
            }
            else {
                current += char;
            }
        }
        result.push(current.trim());
        return result;
    }
    static mapAndValidateResult(item, mapping, validation) {
        // Apply field mapping
        const mapped = {};
        for (const [sourceField, targetField] of Object.entries(mapping)) {
            if (item[sourceField] !== undefined) {
                mapped[targetField] = item[sourceField];
            }
        }
        // Use mapped values or original item
        const result = Object.keys(mapping).length > 0 ? { ...item, ...mapped } : item;
        // Validate required fields
        if (validation?.required) {
            for (const field of validation.required) {
                if (result[field] === undefined) {
                    throw new Error(`Required field '${field}' is missing`);
                }
            }
        }
        // Validate types
        if (validation?.types) {
            for (const [field, expectedType] of Object.entries(validation.types)) {
                if (result[field] !== undefined) {
                    const actualType = typeof result[field];
                    if (actualType !== expectedType) {
                        // Try to convert
                        if (expectedType === 'number' && actualType === 'string') {
                            result[field] = parseFloat(result[field]);
                        }
                        else if (expectedType === 'boolean' && actualType === 'string') {
                            result[field] = result[field].toLowerCase() === 'true';
                        }
                    }
                }
            }
        }
        // Validate ranges
        if (validation?.ranges) {
            for (const [field, [min, max]] of Object.entries(validation.ranges)) {
                if (result[field] !== undefined) {
                    const value = result[field];
                    if (value < min || value > max) {
                        throw new Error(`Field '${field}' value ${value} is outside valid range [${min}, ${max}]`);
                    }
                }
            }
        }
        return {
            score: result.score || 0,
            passed: result.passed || false,
            feedback: result.feedback || '',
            details: result.details || {}
        };
    }
    // Visualization data creation methods
    static createHistogramData(results) {
        const bins = 10;
        const scores = results.map(r => r.score);
        const min = Math.min(...scores);
        const max = Math.max(...scores);
        const binSize = (max - min) / bins;
        const histogram = Array(bins).fill(0);
        scores.forEach(score => {
            const binIndex = Math.min(Math.floor((score - min) / binSize), bins - 1);
            histogram[binIndex]++;
        });
        return histogram.map((count, index) => ({
            bin: `${(min + index * binSize).toFixed(2)}-${(min + (index + 1) * binSize).toFixed(2)}`,
            count
        }));
    }
    static createScatterData(results) {
        return results.map((result, index) => ({
            x: index,
            y: result.score,
            passed: result.passed,
            feedback: result.feedback
        }));
    }
    static createLineData(results) {
        return results.map((result, index) => ({
            x: result.details?.timestamp ? new Date(result.details.timestamp) : index,
            y: result.score
        }));
    }
    static createBoxPlotData(results) {
        const scores = results.map(r => r.score).sort((a, b) => a - b);
        const q1 = scores[Math.floor(scores.length * 0.25)];
        const median = scores[Math.floor(scores.length * 0.5)];
        const q3 = scores[Math.floor(scores.length * 0.75)];
        const min = scores[0];
        const max = scores[scores.length - 1];
        return [{ min, q1, median, q3, max }];
    }
    static createHeatmapData(results) {
        // Group by evaluation type and score range
        const groups = this.groupResults(results, 'evaluationType');
        const data = [];
        for (const [type, typeResults] of Object.entries(groups)) {
            const scoreRanges = {
                'poor': typeResults.filter(r => r.score < 0.4).length,
                'fair': typeResults.filter(r => r.score >= 0.4 && r.score < 0.6).length,
                'good': typeResults.filter(r => r.score >= 0.6 && r.score < 0.8).length,
                'excellent': typeResults.filter(r => r.score >= 0.8).length
            };
            for (const [range, count] of Object.entries(scoreRanges)) {
                data.push({ x: type, y: range, value: count });
            }
        }
        return data;
    }
    static createRadarData(results) {
        // Extract criterion scores if available
        const criterionScores = {};
        results.forEach(result => {
            if (result.details?.criterionScores) {
                for (const [criterion, score] of Object.entries(result.details.criterionScores)) {
                    if (!criterionScores[criterion]) {
                        criterionScores[criterion] = [];
                    }
                    criterionScores[criterion].push(score);
                }
            }
        });
        // Calculate average scores for each criterion
        const radarData = Object.entries(criterionScores).map(([criterion, scores]) => ({
            criterion,
            score: scores.reduce((a, b) => a + b, 0) / scores.length
        }));
        return radarData;
    }
}
exports.EvaluationUtils = EvaluationUtils;
/**
 * Specialized utilities for different evaluation domains
 */
class DomainSpecificUtils {
}
exports.DomainSpecificUtils = DomainSpecificUtils;
_a = DomainSpecificUtils;
/**
 * Utilities for NLP evaluation
 */
DomainSpecificUtils.nlp = {
    calculateBLEU: (reference, candidate) => {
        // Simplified BLEU score calculation
        const refTokens = reference.toLowerCase().split(/\s+/);
        const candTokens = candidate.toLowerCase().split(/\s+/);
        const matches = candTokens.filter(token => refTokens.includes(token)).length;
        return matches / Math.max(candTokens.length, 1);
    },
    calculateROUGE: (reference, candidate) => {
        // Simplified ROUGE-1 score
        const refTokens = new Set(reference.toLowerCase().split(/\s+/));
        const candTokens = new Set(candidate.toLowerCase().split(/\s+/));
        const intersection = new Set([...candTokens].filter(x => refTokens.has(x)));
        return intersection.size / refTokens.size;
    },
    calculateSemanticSimilarity: (text1, text2) => {
        // Simplified semantic similarity (would use embeddings in practice)
        const tokens1 = new Set(text1.toLowerCase().split(/\s+/));
        const tokens2 = new Set(text2.toLowerCase().split(/\s+/));
        const intersection = new Set([...tokens1].filter(x => tokens2.has(x)));
        const union = new Set([...tokens1, ...tokens2]);
        return intersection.size / union.size; // Jaccard similarity
    }
};
/**
 * Utilities for code evaluation
 */
DomainSpecificUtils.code = {
    calculateCodeSimilarity: (code1, code2) => {
        // Simplified code similarity based on AST comparison
        const normalize = (code) => {
            return code
                .replace(/\s+/g, ' ')
                .replace(/\/\*[\s\S]*?\*\//g, '')
                .replace(/\/\/.*$/gm, '')
                .trim();
        };
        const norm1 = normalize(code1);
        const norm2 = normalize(code2);
        if (norm1 === norm2)
            return 1.0;
        // Simple edit distance approximation
        const maxLength = Math.max(norm1.length, norm2.length);
        const editDistance = _a.calculateEditDistance(norm1, norm2);
        return 1 - (editDistance / maxLength);
    },
    calculateEditDistance: (str1, str2) => {
        const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
        for (let i = 0; i <= str1.length; i++)
            matrix[0][i] = i;
        for (let j = 0; j <= str2.length; j++)
            matrix[j][0] = j;
        for (let j = 1; j <= str2.length; j++) {
            for (let i = 1; i <= str1.length; i++) {
                const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
                matrix[j][i] = Math.min(matrix[j][i - 1] + 1, matrix[j - 1][i] + 1, matrix[j - 1][i - 1] + indicator);
            }
        }
        return matrix[str2.length][str1.length];
    }
};
/**
 * Utilities for multimodal evaluation
 */
DomainSpecificUtils.multimodal = {
    calculateImageSimilarity: (image1Desc, image2Desc) => {
        // Placeholder for image similarity calculation
        // In practice, this would use computer vision models
        return _a.nlp.calculateSemanticSimilarity(image1Desc, image2Desc);
    },
    calculateAudioSimilarity: (audio1Desc, audio2Desc) => {
        // Placeholder for audio similarity calculation
        // In practice, this would use audio processing models
        return _a.nlp.calculateSemanticSimilarity(audio1Desc, audio2Desc);
    }
};
//# sourceMappingURL=evaluation-utils.js.map