"use strict";
/**
 * Response evaluator for evaluating AI model responses
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseEvaluator = void 0;
const base_evaluator_1 = require("./base-evaluator");
/**
 * Evaluator for AI model responses
 */
class ResponseEvaluator extends base_evaluator_1.BaseEvaluator {
    constructor(config) {
        const defaultConfig = {
            criteria: [
                {
                    name: 'relevance',
                    description: 'How relevant is the response to the input prompt',
                    weight: 0.25,
                    threshold: 0.6,
                    required: true
                },
                {
                    name: 'accuracy',
                    description: 'How accurate is the information in the response',
                    weight: 0.25,
                    threshold: 0.7
                },
                {
                    name: 'completeness',
                    description: 'How complete is the response in addressing the prompt',
                    weight: 0.2,
                    threshold: 0.6
                },
                {
                    name: 'clarity',
                    description: 'How clear and understandable is the response',
                    weight: 0.15,
                    threshold: 0.6
                },
                {
                    name: 'coherence',
                    description: 'How coherent and well-structured is the response',
                    weight: 0.15,
                    threshold: 0.6
                }
            ],
            passingThreshold: 0.7,
            aggregationMethod: 'weighted_average'
        };
        const mergedConfig = {
            ...defaultConfig,
            ...config,
            criteria: config?.criteria || defaultConfig.criteria
        };
        super('ResponseEvaluator', mergedConfig);
    }
    /**
     * Evaluate a single criterion for response evaluation
     */
    async evaluateCriterion(criterion, context) {
        const responseContext = context;
        if (!responseContext.input?.prompt || !responseContext.output?.response) {
            return this.createResult(0, 'Missing required input prompt or output response');
        }
        const { prompt, expectedResponse, referenceAnswers } = responseContext.input;
        const { response } = responseContext.output;
        switch (criterion.name) {
            case 'relevance':
                return this.evaluateRelevance(prompt, response, criterion.threshold);
            case 'accuracy':
                return this.evaluateAccuracy(response, expectedResponse, referenceAnswers, criterion.threshold);
            case 'completeness':
                return this.evaluateCompleteness(prompt, response, criterion.threshold);
            case 'clarity':
                return this.evaluateClarity(response, criterion.threshold);
            case 'coherence':
                return this.evaluateCoherence(response, criterion.threshold);
            case 'factualness':
                return this.evaluateFactualness(response, criterion.threshold);
            case 'helpfulness':
                return this.evaluateHelpfulness(prompt, response, criterion.threshold);
            default:
                return this.createResult(0, `Unknown criterion: ${criterion.name}`);
        }
    }
    /**
     * Evaluate relevance of response to prompt
     */
    evaluateRelevance(prompt, response, threshold) {
        // Extract key terms from prompt
        const promptTerms = this.extractKeyTerms(prompt);
        const responseTerms = this.extractKeyTerms(response);
        // Calculate term overlap
        const overlap = this.calculateTermOverlap(promptTerms, responseTerms);
        // Check for direct addressing of prompt
        const directAddressing = this.checkDirectAddressing(prompt, response);
        // Combine scores
        const score = (overlap * 0.6) + (directAddressing * 0.4);
        let feedback = '';
        if (score < 0.5) {
            feedback = 'Response does not adequately address the prompt';
        }
        else if (score < 0.7) {
            feedback = 'Response partially addresses the prompt but could be more focused';
        }
        else {
            feedback = 'Response is highly relevant to the prompt';
        }
        return this.createResult(score, feedback, { overlap, directAddressing }, threshold);
    }
    /**
     * Evaluate accuracy against expected response or reference answers
     */
    evaluateAccuracy(response, expectedResponse, referenceAnswers, threshold) {
        if (!expectedResponse && (!referenceAnswers || referenceAnswers.length === 0)) {
            return this.createResult(0.5, 'No reference material provided for accuracy evaluation');
        }
        let maxSimilarity = 0;
        let bestMatch = '';
        // Compare with expected response
        if (expectedResponse) {
            const similarity = this.calculateSemanticSimilarity(response, expectedResponse);
            if (similarity > maxSimilarity) {
                maxSimilarity = similarity;
                bestMatch = 'expected response';
            }
        }
        // Compare with reference answers
        if (referenceAnswers) {
            for (let i = 0; i < referenceAnswers.length; i++) {
                const similarity = this.calculateSemanticSimilarity(response, referenceAnswers[i]);
                if (similarity > maxSimilarity) {
                    maxSimilarity = similarity;
                    bestMatch = `reference answer ${i + 1}`;
                }
            }
        }
        let feedback = '';
        if (maxSimilarity < 0.3) {
            feedback = 'Response significantly differs from reference material';
        }
        else if (maxSimilarity < 0.6) {
            feedback = `Response partially matches ${bestMatch}`;
        }
        else {
            feedback = `Response closely matches ${bestMatch}`;
        }
        return this.createResult(maxSimilarity, feedback, { bestMatch, similarity: maxSimilarity }, threshold);
    }
    /**
     * Evaluate completeness of response
     */
    evaluateCompleteness(prompt, response, threshold) {
        // Extract questions or requirements from prompt
        const requirements = this.extractRequirements(prompt);
        // Check how many requirements are addressed
        const addressedCount = requirements.filter(req => this.isRequirementAddressed(req, response)).length;
        const score = requirements.length > 0 ? addressedCount / requirements.length : 0.8;
        let feedback = '';
        if (score < 0.5) {
            feedback = `Response addresses only ${addressedCount}/${requirements.length} requirements`;
        }
        else if (score < 0.8) {
            feedback = `Response addresses most requirements (${addressedCount}/${requirements.length})`;
        }
        else {
            feedback = 'Response comprehensively addresses all requirements';
        }
        return this.createResult(score, feedback, {
            totalRequirements: requirements.length,
            addressedRequirements: addressedCount
        }, threshold);
    }
    /**
     * Evaluate clarity of response
     */
    evaluateClarity(response, threshold) {
        const metrics = {
            sentenceLength: this.calculateAverageSentenceLength(response),
            readabilityScore: this.calculateReadabilityScore(response),
            structureScore: this.evaluateStructure(response)
        };
        // Normalize and combine scores
        const lengthScore = this.normalizeScore(metrics.sentenceLength, 10, 30); // Optimal 10-30 words
        const readabilityNormalized = this.normalizeScore(metrics.readabilityScore, 0, 100);
        const score = (lengthScore * 0.3) + (readabilityNormalized * 0.4) + (metrics.structureScore * 0.3);
        let feedback = '';
        if (score < 0.5) {
            feedback = 'Response is difficult to understand and poorly structured';
        }
        else if (score < 0.7) {
            feedback = 'Response is moderately clear but could be improved';
        }
        else {
            feedback = 'Response is clear and well-structured';
        }
        return this.createResult(score, feedback, metrics, threshold);
    }
    /**
     * Evaluate coherence of response
     */
    evaluateCoherence(response, threshold) {
        const sentences = this.splitIntoSentences(response);
        if (sentences.length < 2) {
            return this.createResult(0.8, 'Single sentence response - coherence not applicable');
        }
        let coherenceScore = 0;
        let transitionScore = 0;
        // Check sentence-to-sentence coherence
        for (let i = 1; i < sentences.length; i++) {
            const similarity = this.calculateSemanticSimilarity(sentences[i - 1], sentences[i]);
            coherenceScore += similarity;
        }
        coherenceScore /= (sentences.length - 1);
        // Check for transition words and logical flow
        transitionScore = this.evaluateTransitions(response);
        const score = (coherenceScore * 0.7) + (transitionScore * 0.3);
        let feedback = '';
        if (score < 0.5) {
            feedback = 'Response lacks coherence and logical flow';
        }
        else if (score < 0.7) {
            feedback = 'Response is moderately coherent with some logical gaps';
        }
        else {
            feedback = 'Response is highly coherent with good logical flow';
        }
        return this.createResult(score, feedback, { coherenceScore, transitionScore }, threshold);
    }
    /**
     * Evaluate factualness (basic implementation)
     */
    evaluateFactualness(response, threshold) {
        // This is a simplified implementation
        // In practice, this would require fact-checking against knowledge bases
        const factualIndicators = {
            hasNumbers: /\d+/.test(response),
            hasSpecificDates: /\b\d{4}\b|\b(January|February|March|April|May|June|July|August|September|October|November|December)\b/.test(response),
            hasQualifiers: /(approximately|about|roughly|estimated|likely|probably)/.test(response.toLowerCase()),
            hasUncertainty: /(might|could|may|possibly|perhaps)/.test(response.toLowerCase())
        };
        // Simple heuristic scoring
        let score = 0.5; // Base score
        if (factualIndicators.hasNumbers)
            score += 0.1;
        if (factualIndicators.hasSpecificDates)
            score += 0.1;
        if (factualIndicators.hasQualifiers)
            score += 0.1;
        if (factualIndicators.hasUncertainty)
            score += 0.2; // Good to show uncertainty
        const feedback = 'Factualness evaluation requires domain-specific knowledge validation';
        return this.createResult(score, feedback, factualIndicators, threshold);
    }
    /**
     * Evaluate helpfulness of response
     */
    evaluateHelpfulness(prompt, response, threshold) {
        const helpfulnessIndicators = {
            providesExamples: /(for example|such as|e\.g\.|like|including)/.test(response.toLowerCase()),
            offersNextSteps: /(next|then|after|following|step)/.test(response.toLowerCase()),
            acknowledgesLimitations: /(however|but|although|limitation|cannot|unable)/.test(response.toLowerCase()),
            isActionable: /(should|can|try|consider|recommend)/.test(response.toLowerCase())
        };
        let score = 0.4; // Base score
        if (helpfulnessIndicators.providesExamples)
            score += 0.2;
        if (helpfulnessIndicators.offersNextSteps)
            score += 0.2;
        if (helpfulnessIndicators.acknowledgesLimitations)
            score += 0.1;
        if (helpfulnessIndicators.isActionable)
            score += 0.1;
        let feedback = '';
        if (score < 0.5) {
            feedback = 'Response provides minimal helpful information';
        }
        else if (score < 0.7) {
            feedback = 'Response is moderately helpful';
        }
        else {
            feedback = 'Response is very helpful with actionable information';
        }
        return this.createResult(score, feedback, helpfulnessIndicators, threshold);
    }
    // Helper methods
    extractKeyTerms(text) {
        return text.toLowerCase()
            .replace(/[^\w\s]/g, '')
            .split(/\s+/)
            .filter(word => word.length > 3)
            .filter(word => !this.isStopWord(word));
    }
    isStopWord(word) {
        const stopWords = ['this', 'that', 'with', 'have', 'will', 'from', 'they', 'know', 'want', 'been', 'good', 'much', 'some', 'time', 'very', 'when', 'come', 'here', 'just', 'like', 'long', 'make', 'many', 'over', 'such', 'take', 'than', 'them', 'well', 'were'];
        return stopWords.includes(word);
    }
    calculateTermOverlap(terms1, terms2) {
        const set1 = new Set(terms1);
        const set2 = new Set(terms2);
        const intersection = new Set([...set1].filter(x => set2.has(x)));
        const union = new Set([...set1, ...set2]);
        return union.size > 0 ? intersection.size / union.size : 0;
    }
    checkDirectAddressing(prompt, response) {
        // Simple heuristic for direct addressing
        const promptQuestions = (prompt.match(/\?/g) || []).length;
        const responseAnswers = (response.match(/\.|!|;/g) || []).length;
        if (promptQuestions === 0)
            return 0.8; // Not a question-based prompt
        return Math.min(1, responseAnswers / promptQuestions);
    }
    calculateSemanticSimilarity(text1, text2) {
        // Simplified semantic similarity using word overlap
        const words1 = this.extractKeyTerms(text1);
        const words2 = this.extractKeyTerms(text2);
        return this.calculateTermOverlap(words1, words2);
    }
    extractRequirements(prompt) {
        const requirements = [];
        // Extract questions
        const questions = prompt.split(/[.!]/).filter(s => s.includes('?'));
        requirements.push(...questions);
        // Extract numbered/bulleted items
        const numberedItems = prompt.match(/\d+\.[^\d].*?(?=\d+\.|$)/g) || [];
        requirements.push(...numberedItems);
        // Extract items starting with action words
        const actionItems = prompt.match(/(explain|describe|list|provide|give|show|tell|identify)\s+[^.!?]*[.!?]/gi) || [];
        requirements.push(...actionItems);
        return requirements.filter(req => req.trim().length > 0);
    }
    isRequirementAddressed(requirement, response) {
        const reqTerms = this.extractKeyTerms(requirement);
        const respTerms = this.extractKeyTerms(response);
        const overlap = this.calculateTermOverlap(reqTerms, respTerms);
        return overlap > 0.3; // Threshold for considering requirement addressed
    }
    calculateAverageSentenceLength(text) {
        const sentences = this.splitIntoSentences(text);
        if (sentences.length === 0)
            return 0;
        const totalWords = sentences.reduce((sum, sentence) => {
            return sum + sentence.split(/\s+/).length;
        }, 0);
        return totalWords / sentences.length;
    }
    calculateReadabilityScore(text) {
        // Simplified Flesch Reading Ease score
        const sentences = this.splitIntoSentences(text);
        const words = text.split(/\s+/);
        const syllables = words.reduce((sum, word) => sum + this.countSyllables(word), 0);
        if (sentences.length === 0 || words.length === 0)
            return 0;
        const avgSentenceLength = words.length / sentences.length;
        const avgSyllablesPerWord = syllables / words.length;
        return 206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllablesPerWord);
    }
    countSyllables(word) {
        // Simplified syllable counting
        const vowels = word.toLowerCase().match(/[aeiouy]+/g);
        return vowels ? vowels.length : 1;
    }
    evaluateStructure(text) {
        let score = 0.5; // Base score
        // Check for paragraphs
        if (text.includes('\n\n') || text.includes('\n\r\n'))
            score += 0.2;
        // Check for lists or bullet points
        if (/[•\-\*]|\d+\./.test(text))
            score += 0.1;
        // Check for headers or emphasis
        if (/\*\*|__|#/.test(text))
            score += 0.1;
        // Check for logical connectors
        if (/(first|second|finally|however|therefore|moreover)/.test(text.toLowerCase()))
            score += 0.1;
        return Math.min(1, score);
    }
    splitIntoSentences(text) {
        return text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    }
    evaluateTransitions(text) {
        const transitionWords = [
            'however', 'therefore', 'moreover', 'furthermore', 'additionally',
            'consequently', 'meanwhile', 'nevertheless', 'nonetheless', 'thus',
            'first', 'second', 'third', 'finally', 'in conclusion', 'for example'
        ];
        const sentences = this.splitIntoSentences(text);
        if (sentences.length < 2)
            return 1;
        let transitionCount = 0;
        for (const word of transitionWords) {
            if (text.toLowerCase().includes(word)) {
                transitionCount++;
            }
        }
        return Math.min(1, transitionCount / Math.max(1, sentences.length - 1));
    }
}
exports.ResponseEvaluator = ResponseEvaluator;
//# sourceMappingURL=response-evaluator.js.map