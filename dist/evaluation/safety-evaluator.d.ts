/**
 * Safety evaluator for evaluating AI safety and ethical considerations
 */
import { BaseEvaluator, EvaluationCriteria, EvaluationContext, EvaluationResult, EvaluationConfig } from './base-evaluator';
export interface SafetyEvaluationContext extends EvaluationContext {
    input: {
        content: string;
        context?: string;
        userProfile?: UserProfile;
        contentType?: 'text' | 'code' | 'image' | 'audio' | 'video';
    };
    output: {
        response: string;
        confidence?: number;
        flags?: SafetyFlag[];
        metadata?: Record<string, any>;
    };
}
export interface UserProfile {
    age?: number;
    location?: string;
    preferences?: string[];
    restrictions?: string[];
}
export interface SafetyFlag {
    type: SafetyViolationType;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    confidence: number;
    location?: {
        start: number;
        end: number;
    };
}
export declare enum SafetyViolationType {
    HATE_SPEECH = "hate_speech",
    HARASSMENT = "harassment",
    VIOLENCE = "violence",
    SELF_HARM = "self_harm",
    SEXUAL_CONTENT = "sexual_content",
    ILLEGAL_ACTIVITY = "illegal_activity",
    PRIVACY_VIOLATION = "privacy_violation",
    MISINFORMATION = "misinformation",
    BIAS = "bias",
    TOXICITY = "toxicity",
    PROFANITY = "profanity",
    SPAM = "spam"
}
export interface SafetyMetrics {
    overallSafety: number;
    toxicityScore: number;
    biasScore: number;
    harmfulnessScore: number;
    appropriatenessScore: number;
    privacyScore: number;
}
/**
 * Evaluator for AI safety and ethical considerations
 */
export declare class SafetyEvaluator extends BaseEvaluator {
    private profanityWords;
    private biasTerms;
    private harmfulPatterns;
    constructor(config?: Partial<EvaluationConfig>);
    /**
     * Initialize safety-related data
     */
    private initializeSafetyData;
    /**
     * Evaluate a single criterion for safety evaluation
     */
    protected evaluateCriterion(criterion: EvaluationCriteria, context: EvaluationContext): Promise<EvaluationResult>;
    /**
     * Evaluate toxicity in content and response
     */
    private evaluateToxicity;
    /**
     * Evaluate bias in content and response
     */
    private evaluateBias;
    /**
     * Evaluate harmfulness
     */
    private evaluateHarmfulness;
    /**
     * Evaluate appropriateness for context and audience
     */
    private evaluateAppropriateness;
    /**
     * Evaluate privacy protection
     */
    private evaluatePrivacy;
    /**
     * Evaluate truthfulness and absence of misinformation
     */
    private evaluateTruthfulness;
    private calculateToxicityScore;
    private calculateBiasScore;
    private findProfanity;
    private findToxicPatterns;
    private identifyBiasCategories;
    private findStereotypes;
    private findHarmfulPatterns;
    private assessSelfHarmRisk;
    private assessViolenceRisk;
    private assessIllegalActivity;
    private checkAgeAppropriateness;
    private checkContextAppropriateness;
    private checkProfessionalAppropriateness;
    private findPersonalInformation;
    private findSensitiveData;
    private checkPrivacyViolations;
    private extractFactualClaims;
    private findUncertaintyMarkers;
    private assessMisinformationRisk;
}
//# sourceMappingURL=safety-evaluator.d.ts.map