/**
 * Security plugin for ADK JavaScript
 */
import { BasePlugin } from './base-plugin';
import { PluginConfig, InvocationContext, ToolContext, ModelContext, AgentContext } from './types';
export interface SecurityPluginConfig extends PluginConfig {
    settings?: {
        enableAuthentication?: boolean;
        enableAuthorization?: boolean;
        enableInputSanitization?: boolean;
        enableOutputFiltering?: boolean;
        enableAuditLogging?: boolean;
        enableThreatDetection?: boolean;
        authenticationMethods?: AuthenticationMethod[];
        authorizationRules?: AuthorizationRules;
        sanitizationRules?: SanitizationRules;
        outputFilterRules?: OutputFilterRules;
        threatDetectionRules?: ThreatDetectionRules;
        securityPolicies?: SecurityPolicies;
        encryptionConfig?: EncryptionConfig;
        auditConfig?: AuditConfig;
        onSecurityViolation?: (violation: SecurityViolation) => void;
        onAuthenticationFailure?: (context: any, reason: string) => void;
        onAuthorizationFailure?: (context: any, reason: string) => void;
    };
}
export interface AuthenticationMethod {
    type: 'api_key' | 'bearer_token' | 'basic_auth' | 'oauth' | 'custom';
    name: string;
    enabled: boolean;
    config: Record<string, any>;
    validator?: (credentials: any) => Promise<boolean>;
}
export interface AuthorizationRules {
    tools?: Record<string, ToolAuthorizationRule>;
    models?: Record<string, ModelAuthorizationRule>;
    agents?: Record<string, AgentAuthorizationRule>;
    global?: GlobalAuthorizationRule;
}
export interface ToolAuthorizationRule {
    requiredRoles?: string[];
    requiredPermissions?: string[];
    allowedUsers?: string[];
    deniedUsers?: string[];
    customValidator?: string;
    rateLimits?: Record<string, number>;
}
export interface ModelAuthorizationRule {
    requiredRoles?: string[];
    requiredPermissions?: string[];
    allowedUsers?: string[];
    deniedUsers?: string[];
    maxTokens?: number;
    allowedModels?: string[];
    customValidator?: string;
}
export interface AgentAuthorizationRule {
    requiredRoles?: string[];
    requiredPermissions?: string[];
    allowedUsers?: string[];
    deniedUsers?: string[];
    maxSteps?: number;
    allowedTools?: string[];
    customValidator?: string;
}
export interface GlobalAuthorizationRule {
    requiredRoles?: string[];
    requiredPermissions?: string[];
    allowedUsers?: string[];
    deniedUsers?: string[];
    customValidator?: string;
}
export interface SanitizationRules {
    removeScripts?: boolean;
    removeHtml?: boolean;
    removeSqlInjection?: boolean;
    removeXss?: boolean;
    removePathTraversal?: boolean;
    removeCommandInjection?: boolean;
    customSanitizers?: CustomSanitizer[];
    whitelistedPatterns?: string[];
    blacklistedPatterns?: string[];
}
export interface CustomSanitizer {
    name: string;
    pattern: RegExp;
    replacement: string;
    enabled: boolean;
}
export interface OutputFilterRules {
    removeSensitiveData?: boolean;
    removePersonalInfo?: boolean;
    removeCredentials?: boolean;
    removeInternalPaths?: boolean;
    customFilters?: CustomFilter[];
    sensitivePatterns?: string[];
    redactionChar?: string;
}
export interface CustomFilter {
    name: string;
    pattern: RegExp;
    action: 'remove' | 'redact' | 'replace';
    replacement?: string;
    enabled: boolean;
}
export interface ThreatDetectionRules {
    detectSqlInjection?: boolean;
    detectXss?: boolean;
    detectCommandInjection?: boolean;
    detectPathTraversal?: boolean;
    detectDataExfiltration?: boolean;
    detectAnomalousPatterns?: boolean;
    customDetectors?: CustomThreatDetector[];
    suspiciousPatterns?: string[];
    alertThreshold?: number;
}
export interface CustomThreatDetector {
    name: string;
    pattern: RegExp;
    severity: 'low' | 'medium' | 'high' | 'critical';
    enabled: boolean;
    action: 'log' | 'block' | 'alert';
}
export interface SecurityPolicies {
    passwordPolicy?: PasswordPolicy;
    sessionPolicy?: SessionPolicy;
    dataRetentionPolicy?: DataRetentionPolicy;
    accessPolicy?: AccessPolicy;
}
export interface PasswordPolicy {
    minLength?: number;
    requireUppercase?: boolean;
    requireLowercase?: boolean;
    requireNumbers?: boolean;
    requireSpecialChars?: boolean;
    maxAge?: number;
    preventReuse?: number;
}
export interface SessionPolicy {
    maxDuration?: number;
    idleTimeout?: number;
    requireReauth?: boolean;
    maxConcurrentSessions?: number;
}
export interface DataRetentionPolicy {
    auditLogRetention?: number;
    sessionDataRetention?: number;
    errorLogRetention?: number;
    automaticCleanup?: boolean;
}
export interface AccessPolicy {
    allowedIpRanges?: string[];
    deniedIpRanges?: string[];
    allowedCountries?: string[];
    deniedCountries?: string[];
    timeBasedAccess?: TimeBasedAccess[];
}
export interface TimeBasedAccess {
    days: string[];
    startTime: string;
    endTime: string;
    timezone: string;
}
export interface EncryptionConfig {
    algorithm?: string;
    keySize?: number;
    encryptSensitiveData?: boolean;
    encryptAuditLogs?: boolean;
    keyRotationInterval?: number;
}
export interface AuditConfig {
    logLevel?: 'minimal' | 'standard' | 'detailed' | 'verbose';
    logDestination?: 'console' | 'file' | 'database' | 'external';
    logFormat?: 'json' | 'text' | 'structured';
    includeRequestData?: boolean;
    includeResponseData?: boolean;
    includeSensitiveData?: boolean;
}
export interface SecurityViolation {
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    context: any;
    timestamp: number;
    userId?: string;
    ipAddress?: string;
    userAgent?: string;
    details: Record<string, any>;
}
export interface SecurityContext {
    userId?: string;
    roles?: string[];
    permissions?: string[];
    ipAddress?: string;
    userAgent?: string;
    sessionId?: string;
    authMethod?: string;
    authenticated: boolean;
    authorized: boolean;
}
export interface AuditEvent {
    eventType: string;
    timestamp: number;
    userId?: string;
    sessionId?: string;
    ipAddress?: string;
    userAgent?: string;
    resource: string;
    action: string;
    result: 'success' | 'failure' | 'blocked';
    details: Record<string, any>;
    securityLevel: 'low' | 'medium' | 'high' | 'critical';
}
/**
 * Plugin that provides comprehensive security capabilities
 */
export declare class SecurityPlugin extends BasePlugin {
    private enableAuthentication;
    private enableAuthorization;
    private enableInputSanitization;
    private enableOutputFiltering;
    private enableAuditLogging;
    private enableThreatDetection;
    private authenticationMethods;
    private authorizationRules;
    private sanitizationRules;
    private outputFilterRules;
    private threatDetectionRules;
    private securityPolicies;
    private encryptionConfig;
    private auditConfig;
    private onSecurityViolation?;
    private onAuthenticationFailure?;
    private onAuthorizationFailure?;
    private securityContexts;
    private auditEvents;
    private securityViolations;
    private threatDetectionStats;
    constructor(config?: Partial<SecurityPluginConfig>);
    protected onInitialize(): Promise<void>;
    protected onDestroy(): Promise<void>;
    beforeRunCallback(context: InvocationContext): Promise<InvocationContext>;
    afterRunCallback(context: InvocationContext): Promise<InvocationContext>;
    beforeToolCallback(context: ToolContext): Promise<ToolContext>;
    beforeModelCallback(context: ModelContext): Promise<ModelContext>;
    beforeAgentCallback(context: AgentContext): Promise<AgentContext>;
    afterToolCallback(context: ToolContext): Promise<ToolContext>;
    afterModelCallback(context: ModelContext): Promise<ModelContext>;
    afterAgentCallback(context: AgentContext): Promise<AgentContext>;
    /**
     * Authenticate user
     */
    private authenticateUser;
    /**
     * Authorize user for general access
     */
    private authorizeUser;
    /**
     * Authorize tool access
     */
    private authorizeToolAccess;
    /**
     * Authorize model access
     */
    private authorizeModelAccess;
    /**
     * Authorize agent access
     */
    private authorizeAgentAccess;
    /**
     * Check authorization rule
     */
    private checkAuthorizationRule;
    /**
     * Sanitize input
     */
    private sanitizeInput;
    /**
     * Filter output
     */
    private filterOutput;
    /**
     * Detect threats
     */
    private detectThreats;
    /**
     * Handle threat detection
     */
    private handleThreatDetection;
    /**
     * Extract credentials from context
     */
    private extractCredentials;
    /**
     * Validate credentials
     */
    private validateCredentials;
    /**
     * Validate bearer token
     */
    private validateBearerToken;
    /**
     * Validate basic auth
     */
    private validateBasicAuth;
    /**
     * Record security violation
     */
    private recordSecurityViolation;
    /**
     * Record audit event
     */
    private recordAuditEvent;
    /**
     * Initialize built-in security rules
     */
    private initializeBuiltInSecurityRules;
    /**
     * Start automatic cleanup
     */
    private startAutomaticCleanup;
    /**
     * Perform cleanup
     */
    private performCleanup;
    /**
     * Log security statistics
     */
    private logSecurityStatistics;
    /**
     * Get violations by type
     */
    private getViolationsByType;
    /**
     * Add authentication method
     */
    addAuthenticationMethod(method: AuthenticationMethod): void;
    /**
     * Remove authentication method
     */
    removeAuthenticationMethod(name: string): boolean;
    /**
     * Update authorization rules
     */
    updateAuthorizationRules(rules: Partial<AuthorizationRules>): void;
    /**
     * Get security violations
     */
    getSecurityViolations(limit?: number): SecurityViolation[];
    /**
     * Get audit events
     */
    getAuditEvents(limit?: number): AuditEvent[];
    /**
     * Get security statistics
     */
    getSecurityStatistics(): Record<string, any>;
    protected performHealthCheck(): Promise<Record<string, any>>;
}
//# sourceMappingURL=security-plugin.d.ts.map