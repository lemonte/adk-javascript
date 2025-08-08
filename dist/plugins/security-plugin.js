"use strict";
/**
 * Security plugin for ADK JavaScript
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityPlugin = void 0;
const base_plugin_1 = require("./base-plugin");
const constants_1 = require("./constants");
/**
 * Plugin that provides comprehensive security capabilities
 */
class SecurityPlugin extends base_plugin_1.BasePlugin {
    constructor(config = {}) {
        const fullConfig = {
            name: 'security-plugin',
            version: '1.0.0',
            description: 'Provides comprehensive security capabilities',
            priority: constants_1.PLUGIN_PRIORITIES.HIGHEST,
            hooks: [
                'before_run',
                'after_run',
                'before_tool',
                'after_tool',
                'before_model',
                'after_model',
                'before_agent',
                'after_agent',
                'on_tool_error',
                'on_model_error',
                'on_agent_error'
            ],
            settings: {
                enableAuthentication: true,
                enableAuthorization: true,
                enableInputSanitization: true,
                enableOutputFiltering: true,
                enableAuditLogging: true,
                enableThreatDetection: true,
                authenticationMethods: [],
                authorizationRules: {},
                sanitizationRules: {
                    removeScripts: true,
                    removeHtml: true,
                    removeSqlInjection: true,
                    removeXss: true,
                    removePathTraversal: true,
                    removeCommandInjection: true,
                    customSanitizers: [],
                    whitelistedPatterns: [],
                    blacklistedPatterns: []
                },
                outputFilterRules: {
                    removeSensitiveData: true,
                    removePersonalInfo: true,
                    removeCredentials: true,
                    removeInternalPaths: true,
                    customFilters: [],
                    sensitivePatterns: [
                        'password',
                        'secret',
                        'token',
                        'key',
                        'credential',
                        'ssn',
                        'credit.?card',
                        'api.?key'
                    ],
                    redactionChar: '*'
                },
                threatDetectionRules: {
                    detectSqlInjection: true,
                    detectXss: true,
                    detectCommandInjection: true,
                    detectPathTraversal: true,
                    detectDataExfiltration: true,
                    detectAnomalousPatterns: true,
                    customDetectors: [],
                    suspiciousPatterns: [],
                    alertThreshold: 5
                },
                securityPolicies: {
                    passwordPolicy: {
                        minLength: 8,
                        requireUppercase: true,
                        requireLowercase: true,
                        requireNumbers: true,
                        requireSpecialChars: true,
                        maxAge: 90 * 24 * 60 * 60 * 1000, // 90 days
                        preventReuse: 5
                    },
                    sessionPolicy: {
                        maxDuration: 8 * 60 * 60 * 1000, // 8 hours
                        idleTimeout: 30 * 60 * 1000, // 30 minutes
                        requireReauth: false,
                        maxConcurrentSessions: 3
                    },
                    dataRetentionPolicy: {
                        auditLogRetention: 365 * 24 * 60 * 60 * 1000, // 1 year
                        sessionDataRetention: 30 * 24 * 60 * 60 * 1000, // 30 days
                        errorLogRetention: 90 * 24 * 60 * 60 * 1000, // 90 days
                        automaticCleanup: true
                    },
                    accessPolicy: {
                        allowedIpRanges: [],
                        deniedIpRanges: [],
                        allowedCountries: [],
                        deniedCountries: [],
                        timeBasedAccess: []
                    }
                },
                encryptionConfig: {
                    algorithm: 'AES-256-GCM',
                    keySize: 256,
                    encryptSensitiveData: true,
                    encryptAuditLogs: false,
                    keyRotationInterval: 30 * 24 * 60 * 60 * 1000 // 30 days
                },
                auditConfig: {
                    logLevel: 'standard',
                    logDestination: 'console',
                    logFormat: 'json',
                    includeRequestData: true,
                    includeResponseData: false,
                    includeSensitiveData: false
                },
                ...config.settings
            },
            ...config
        };
        super(fullConfig);
        this.securityContexts = new Map();
        this.auditEvents = [];
        this.securityViolations = [];
        this.threatDetectionStats = new Map();
        const settings = fullConfig.settings;
        this.enableAuthentication = settings.enableAuthentication;
        this.enableAuthorization = settings.enableAuthorization;
        this.enableInputSanitization = settings.enableInputSanitization;
        this.enableOutputFiltering = settings.enableOutputFiltering;
        this.enableAuditLogging = settings.enableAuditLogging;
        this.enableThreatDetection = settings.enableThreatDetection;
        this.authenticationMethods = new Map();
        this.authorizationRules = settings.authorizationRules;
        this.sanitizationRules = settings.sanitizationRules;
        this.outputFilterRules = settings.outputFilterRules;
        this.threatDetectionRules = settings.threatDetectionRules;
        this.securityPolicies = settings.securityPolicies;
        this.encryptionConfig = settings.encryptionConfig;
        this.auditConfig = settings.auditConfig;
        this.onSecurityViolation = settings.onSecurityViolation;
        this.onAuthenticationFailure = settings.onAuthenticationFailure;
        this.onAuthorizationFailure = settings.onAuthorizationFailure;
        // Initialize authentication methods
        for (const method of settings.authenticationMethods) {
            this.authenticationMethods.set(method.name, method);
        }
    }
    async onInitialize() {
        this.log('info', 'Security plugin initialized');
        // Initialize built-in security rules
        this.initializeBuiltInSecurityRules();
        // Start automatic cleanup if enabled
        if (this.securityPolicies.dataRetentionPolicy?.automaticCleanup) {
            this.startAutomaticCleanup();
        }
    }
    async onDestroy() {
        this.log('info', 'Security plugin destroyed');
        // Log final security statistics
        this.logSecurityStatistics();
    }
    async beforeRunCallback(context) {
        // Authenticate user
        if (this.enableAuthentication) {
            const authResult = await this.authenticateUser(context);
            if (!authResult.authenticated) {
                this.recordSecurityViolation({
                    type: 'authentication_failure',
                    severity: 'high',
                    description: 'Authentication failed',
                    context,
                    timestamp: Date.now(),
                    details: { reason: authResult.reason }
                });
                if (this.onAuthenticationFailure) {
                    this.onAuthenticationFailure(context, authResult.reason || 'Unknown');
                }
                context.error = new Error(`Authentication failed: ${authResult.reason}`);
                return context;
            }
            context.securityContext = authResult.securityContext;
        }
        // Check authorization
        if (this.enableAuthorization && context.securityContext) {
            const authzResult = await this.authorizeUser(context, 'run');
            if (!authzResult.authorized) {
                this.recordSecurityViolation({
                    type: 'authorization_failure',
                    severity: 'high',
                    description: 'Authorization failed',
                    context,
                    timestamp: Date.now(),
                    details: { reason: authzResult.reason }
                });
                if (this.onAuthorizationFailure) {
                    this.onAuthorizationFailure(context, authzResult.reason || 'Unknown');
                }
                context.error = new Error(`Authorization failed: ${authzResult.reason}`);
                return context;
            }
        }
        // Audit the run start
        if (this.enableAuditLogging) {
            this.recordAuditEvent({
                eventType: 'run_start',
                timestamp: Date.now(),
                userId: context.securityContext?.userId,
                sessionId: context.securityContext?.sessionId,
                ipAddress: context.securityContext?.ipAddress,
                userAgent: context.securityContext?.userAgent,
                resource: 'run',
                action: 'start',
                result: 'success',
                details: {
                    runId: context.runId,
                    input: this.auditConfig.includeRequestData ? context.input : '[REDACTED]'
                },
                securityLevel: 'medium'
            });
        }
        return context;
    }
    async afterRunCallback(context) {
        // Filter output
        if (this.enableOutputFiltering && context.output) {
            context.output = this.filterOutput(context.output);
        }
        // Audit the run completion
        if (this.enableAuditLogging) {
            this.recordAuditEvent({
                eventType: 'run_complete',
                timestamp: Date.now(),
                userId: context.securityContext?.userId,
                sessionId: context.securityContext?.sessionId,
                ipAddress: context.securityContext?.ipAddress,
                userAgent: context.securityContext?.userAgent,
                resource: 'run',
                action: 'complete',
                result: context.error ? 'failure' : 'success',
                details: {
                    runId: context.runId,
                    output: this.auditConfig.includeResponseData ? context.output : '[REDACTED]',
                    error: context.error?.message
                },
                securityLevel: context.error ? 'high' : 'low'
            });
        }
        return context;
    }
    async beforeToolCallback(context) {
        // Check tool authorization
        if (this.enableAuthorization && context.securityContext) {
            const authzResult = await this.authorizeToolAccess(context);
            if (!authzResult.authorized) {
                this.recordSecurityViolation({
                    type: 'tool_authorization_failure',
                    severity: 'medium',
                    description: `Tool access denied: ${context.toolName}`,
                    context,
                    timestamp: Date.now(),
                    details: { reason: authzResult.reason, toolName: context.toolName }
                });
                context.error = new Error(`Tool access denied: ${authzResult.reason}`);
                return context;
            }
        }
        // Sanitize input
        if (this.enableInputSanitization && context.input) {
            const sanitizedInput = this.sanitizeInput(context.input);
            if (sanitizedInput !== context.input) {
                this.log('info', `Input sanitized for tool: ${context.toolName}`);
                context.input = sanitizedInput;
            }
        }
        // Detect threats
        if (this.enableThreatDetection && context.input) {
            const threats = this.detectThreats(context.input, 'tool');
            if (threats.length > 0) {
                this.handleThreatDetection(threats, context);
            }
        }
        return context;
    }
    async beforeModelCallback(context) {
        // Check model authorization
        if (this.enableAuthorization && context.securityContext) {
            const authzResult = await this.authorizeModelAccess(context);
            if (!authzResult.authorized) {
                this.recordSecurityViolation({
                    type: 'model_authorization_failure',
                    severity: 'medium',
                    description: `Model access denied: ${context.modelName}`,
                    context,
                    timestamp: Date.now(),
                    details: { reason: authzResult.reason, modelName: context.modelName }
                });
                context.error = new Error(`Model access denied: ${authzResult.reason}`);
                return context;
            }
        }
        // Sanitize input
        if (this.enableInputSanitization && context.input) {
            const sanitizedInput = this.sanitizeInput(context.input);
            if (sanitizedInput !== context.input) {
                this.log('info', `Input sanitized for model: ${context.modelName}`);
                context.input = sanitizedInput;
            }
        }
        // Detect threats
        if (this.enableThreatDetection && context.input) {
            const threats = this.detectThreats(context.input, 'model');
            if (threats.length > 0) {
                this.handleThreatDetection(threats, context);
            }
        }
        return context;
    }
    async beforeAgentCallback(context) {
        // Check agent authorization
        if (this.enableAuthorization && context.securityContext) {
            const authzResult = await this.authorizeAgentAccess(context);
            if (!authzResult.authorized) {
                this.recordSecurityViolation({
                    type: 'agent_authorization_failure',
                    severity: 'medium',
                    description: `Agent access denied: ${context.agentName}`,
                    context,
                    timestamp: Date.now(),
                    details: { reason: authzResult.reason, agentName: context.agentName }
                });
                context.error = new Error(`Agent access denied: ${authzResult.reason}`);
                return context;
            }
        }
        // Sanitize input
        if (this.enableInputSanitization && context.input) {
            const sanitizedInput = this.sanitizeInput(context.input);
            if (sanitizedInput !== context.input) {
                this.log('info', `Input sanitized for agent: ${context.agentName}`);
                context.input = sanitizedInput;
            }
        }
        // Detect threats
        if (this.enableThreatDetection && context.input) {
            const threats = this.detectThreats(context.input, 'agent');
            if (threats.length > 0) {
                this.handleThreatDetection(threats, context);
            }
        }
        return context;
    }
    async afterToolCallback(context) {
        // Filter output
        if (this.enableOutputFiltering && context.output) {
            context.output = this.filterOutput(context.output);
        }
        return context;
    }
    async afterModelCallback(context) {
        // Filter output
        if (this.enableOutputFiltering && context.output) {
            context.output = this.filterOutput(context.output);
        }
        return context;
    }
    async afterAgentCallback(context) {
        // Filter output
        if (this.enableOutputFiltering && context.output) {
            context.output = this.filterOutput(context.output);
        }
        return context;
    }
    /**
     * Authenticate user
     */
    async authenticateUser(context) {
        // Extract authentication credentials from context
        const credentials = this.extractCredentials(context);
        if (!credentials) {
            return {
                authenticated: false,
                reason: 'No credentials provided'
            };
        }
        // Try each authentication method
        for (const method of this.authenticationMethods.values()) {
            if (!method.enabled)
                continue;
            try {
                const isValid = method.validator ?
                    await method.validator(credentials) :
                    await this.validateCredentials(method, credentials);
                if (isValid) {
                    const securityContext = {
                        userId: credentials.userId || 'anonymous',
                        roles: credentials.roles || [],
                        permissions: credentials.permissions || [],
                        ipAddress: context.ipAddress,
                        userAgent: context.userAgent,
                        sessionId: context.sessionId,
                        authMethod: method.name,
                        authenticated: true,
                        authorized: false
                    };
                    this.securityContexts.set(securityContext.sessionId || 'default', securityContext);
                    return {
                        authenticated: true,
                        securityContext
                    };
                }
            }
            catch (error) {
                this.log('error', `Authentication method '${method.name}' failed:`, error);
            }
        }
        return {
            authenticated: false,
            reason: 'Invalid credentials'
        };
    }
    /**
     * Authorize user for general access
     */
    async authorizeUser(context, action) {
        const securityContext = context.securityContext;
        const globalRule = this.authorizationRules.global;
        if (!globalRule) {
            return { authorized: true };
        }
        return this.checkAuthorizationRule(globalRule, securityContext, action);
    }
    /**
     * Authorize tool access
     */
    async authorizeToolAccess(context) {
        const securityContext = context.securityContext;
        const toolRule = this.authorizationRules.tools?.[context.toolName];
        if (!toolRule) {
            return { authorized: true };
        }
        return this.checkAuthorizationRule(toolRule, securityContext, 'use_tool');
    }
    /**
     * Authorize model access
     */
    async authorizeModelAccess(context) {
        const securityContext = context.securityContext;
        const modelRule = this.authorizationRules.models?.[context.modelName];
        if (!modelRule) {
            return { authorized: true };
        }
        return this.checkAuthorizationRule(modelRule, securityContext, 'use_model');
    }
    /**
     * Authorize agent access
     */
    async authorizeAgentAccess(context) {
        const securityContext = context.securityContext;
        const agentRule = this.authorizationRules.agents?.[context.agentName];
        if (!agentRule) {
            return { authorized: true };
        }
        return this.checkAuthorizationRule(agentRule, securityContext, 'use_agent');
    }
    /**
     * Check authorization rule
     */
    async checkAuthorizationRule(rule, securityContext, action) {
        // Check denied users
        if (rule.deniedUsers?.includes(securityContext.userId)) {
            return {
                authorized: false,
                reason: 'User is explicitly denied'
            };
        }
        // Check allowed users
        if (rule.allowedUsers && !rule.allowedUsers.includes(securityContext.userId)) {
            return {
                authorized: false,
                reason: 'User is not in allowed list'
            };
        }
        // Check required roles
        if (rule.requiredRoles) {
            const hasRequiredRole = rule.requiredRoles.some((role) => securityContext.roles?.includes(role));
            if (!hasRequiredRole) {
                return {
                    authorized: false,
                    reason: 'User does not have required role'
                };
            }
        }
        // Check required permissions
        if (rule.requiredPermissions) {
            const hasRequiredPermission = rule.requiredPermissions.some((permission) => securityContext.permissions?.includes(permission));
            if (!hasRequiredPermission) {
                return {
                    authorized: false,
                    reason: 'User does not have required permission'
                };
            }
        }
        return { authorized: true };
    }
    /**
     * Sanitize input
     */
    sanitizeInput(input) {
        if (typeof input === 'string') {
            let sanitized = input;
            // Remove scripts
            if (this.sanitizationRules.removeScripts) {
                sanitized = sanitized.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
            }
            // Remove HTML
            if (this.sanitizationRules.removeHtml) {
                sanitized = sanitized.replace(/<[^>]*>/g, '');
            }
            // Remove SQL injection patterns
            if (this.sanitizationRules.removeSqlInjection) {
                const sqlPatterns = [
                    /('|(\-\-)|(;)|(\||\|)|(\*|\*))/gi,
                    /(union|select|insert|delete|update|drop|create|alter|exec|execute)/gi
                ];
                for (const pattern of sqlPatterns) {
                    sanitized = sanitized.replace(pattern, '');
                }
            }
            // Remove XSS patterns
            if (this.sanitizationRules.removeXss) {
                const xssPatterns = [
                    /javascript:/gi,
                    /on\w+\s*=/gi,
                    /expression\s*\(/gi
                ];
                for (const pattern of xssPatterns) {
                    sanitized = sanitized.replace(pattern, '');
                }
            }
            // Remove path traversal
            if (this.sanitizationRules.removePathTraversal) {
                sanitized = sanitized.replace(/\.\.\/|\.\.\\/g, '');
            }
            // Remove command injection
            if (this.sanitizationRules.removeCommandInjection) {
                const cmdPatterns = [
                    /[;&|`$(){}\[\]]/g,
                    /(rm|del|format|shutdown|reboot)/gi
                ];
                for (const pattern of cmdPatterns) {
                    sanitized = sanitized.replace(pattern, '');
                }
            }
            // Apply custom sanitizers
            for (const sanitizer of this.sanitizationRules.customSanitizers || []) {
                if (sanitizer.enabled) {
                    sanitized = sanitized.replace(sanitizer.pattern, sanitizer.replacement);
                }
            }
            return sanitized;
        }
        if (typeof input === 'object' && input !== null) {
            const sanitized = Array.isArray(input) ? [] : {};
            for (const [key, value] of Object.entries(input)) {
                sanitized[key] = this.sanitizeInput(value);
            }
            return sanitized;
        }
        return input;
    }
    /**
     * Filter output
     */
    filterOutput(output) {
        if (typeof output === 'string') {
            let filtered = output;
            // Remove sensitive data
            if (this.outputFilterRules.removeSensitiveData) {
                for (const pattern of this.outputFilterRules.sensitivePatterns || []) {
                    const regex = new RegExp(pattern, 'gi');
                    filtered = filtered.replace(regex, (match) => this.outputFilterRules.redactionChar?.repeat(match.length) || '[REDACTED]');
                }
            }
            // Apply custom filters
            for (const filter of this.outputFilterRules.customFilters || []) {
                if (filter.enabled) {
                    switch (filter.action) {
                        case 'remove':
                            filtered = filtered.replace(filter.pattern, '');
                            break;
                        case 'redact':
                            filtered = filtered.replace(filter.pattern, '[REDACTED]');
                            break;
                        case 'replace':
                            filtered = filtered.replace(filter.pattern, filter.replacement || '');
                            break;
                    }
                }
            }
            return filtered;
        }
        if (typeof output === 'object' && output !== null) {
            const filtered = Array.isArray(output) ? [] : {};
            for (const [key, value] of Object.entries(output)) {
                filtered[key] = this.filterOutput(value);
            }
            return filtered;
        }
        return output;
    }
    /**
     * Detect threats
     */
    detectThreats(input, context) {
        const threats = [];
        const inputStr = typeof input === 'string' ? input : JSON.stringify(input);
        // SQL injection detection
        if (this.threatDetectionRules.detectSqlInjection) {
            const sqlPatterns = [
                /'\s*(or|and)\s*'\s*=\s*'/gi,
                /union\s+select/gi,
                /drop\s+table/gi,
                /insert\s+into/gi
            ];
            for (const pattern of sqlPatterns) {
                if (pattern.test(inputStr)) {
                    threats.push('sql_injection');
                    break;
                }
            }
        }
        // XSS detection
        if (this.threatDetectionRules.detectXss) {
            const xssPatterns = [
                /<script[^>]*>[\s\S]*?<\/script>/gi,
                /javascript:/gi,
                /on\w+\s*=/gi
            ];
            for (const pattern of xssPatterns) {
                if (pattern.test(inputStr)) {
                    threats.push('xss');
                    break;
                }
            }
        }
        // Command injection detection
        if (this.threatDetectionRules.detectCommandInjection) {
            const cmdPatterns = [
                /[;&|`]/g,
                /(rm|del|format|shutdown)\s/gi
            ];
            for (const pattern of cmdPatterns) {
                if (pattern.test(inputStr)) {
                    threats.push('command_injection');
                    break;
                }
            }
        }
        // Path traversal detection
        if (this.threatDetectionRules.detectPathTraversal) {
            if (/\.\.\/|\.\.\\/g.test(inputStr)) {
                threats.push('path_traversal');
            }
        }
        // Custom threat detection
        for (const detector of this.threatDetectionRules.customDetectors || []) {
            if (detector.enabled && detector.pattern.test(inputStr)) {
                threats.push(detector.name);
            }
        }
        return threats;
    }
    /**
     * Handle threat detection
     */
    handleThreatDetection(threats, context) {
        for (const threat of threats) {
            this.threatDetectionStats.set(threat, (this.threatDetectionStats.get(threat) || 0) + 1);
            const violation = {
                type: `threat_detected_${threat}`,
                severity: 'high',
                description: `Threat detected: ${threat}`,
                context,
                timestamp: Date.now(),
                userId: context.securityContext?.userId,
                ipAddress: context.securityContext?.ipAddress,
                userAgent: context.securityContext?.userAgent,
                details: { threat, input: context.input }
            };
            this.recordSecurityViolation(violation);
            // Block request if threat is critical
            const detector = this.threatDetectionRules.customDetectors?.find(d => d.name === threat);
            if (detector?.action === 'block' || detector?.severity === 'critical') {
                context.error = new Error(`Security threat detected: ${threat}`);
            }
        }
    }
    /**
     * Extract credentials from context
     */
    extractCredentials(context) {
        // This is a simplified implementation
        // In practice, you would extract credentials from headers, tokens, etc.
        return {
            userId: context.userId || context.headers?.['x-user-id'],
            token: context.token || context.headers?.['authorization'],
            apiKey: context.apiKey || context.headers?.['x-api-key'],
            roles: context.roles || [],
            permissions: context.permissions || []
        };
    }
    /**
     * Validate credentials
     */
    async validateCredentials(method, credentials) {
        // This is a simplified implementation
        // In practice, you would validate against a database, LDAP, etc.
        switch (method.type) {
            case 'api_key':
                return credentials.apiKey === method.config.validApiKey;
            case 'bearer_token':
                return this.validateBearerToken(credentials.token, method.config);
            case 'basic_auth':
                return this.validateBasicAuth(credentials, method.config);
            default:
                return false;
        }
    }
    /**
     * Validate bearer token
     */
    validateBearerToken(token, config) {
        // Simplified token validation
        if (!token || !token.startsWith('Bearer ')) {
            return false;
        }
        const actualToken = token.substring(7);
        return actualToken === config.validToken;
    }
    /**
     * Validate basic auth
     */
    validateBasicAuth(credentials, config) {
        // Simplified basic auth validation
        return credentials.username === config.validUsername &&
            credentials.password === config.validPassword;
    }
    /**
     * Record security violation
     */
    recordSecurityViolation(violation) {
        this.securityViolations.push(violation);
        // Keep only recent violations (last 1000)
        if (this.securityViolations.length > 1000) {
            this.securityViolations.splice(0, this.securityViolations.length - 1000);
        }
        this.log('warn', 'Security violation recorded:', violation);
        if (this.onSecurityViolation) {
            this.onSecurityViolation(violation);
        }
    }
    /**
     * Record audit event
     */
    recordAuditEvent(event) {
        this.auditEvents.push(event);
        // Keep only recent events based on retention policy
        const retentionTime = this.securityPolicies.dataRetentionPolicy?.auditLogRetention ||
            365 * 24 * 60 * 60 * 1000; // 1 year default
        const cutoffTime = Date.now() - retentionTime;
        this.auditEvents = this.auditEvents.filter(e => e.timestamp > cutoffTime);
        if (this.auditConfig.logLevel !== 'minimal') {
            this.log('info', 'Audit event recorded:', event);
        }
    }
    /**
     * Initialize built-in security rules
     */
    initializeBuiltInSecurityRules() {
        // Add built-in authentication methods
        if (this.authenticationMethods.size === 0) {
            this.authenticationMethods.set('default_api_key', {
                type: 'api_key',
                name: 'default_api_key',
                enabled: true,
                config: {
                    validApiKey: 'default-api-key-change-me'
                }
            });
        }
    }
    /**
     * Start automatic cleanup
     */
    startAutomaticCleanup() {
        // Run cleanup every hour
        setInterval(() => {
            this.performCleanup();
        }, 60 * 60 * 1000);
    }
    /**
     * Perform cleanup
     */
    performCleanup() {
        const now = Date.now();
        const policies = this.securityPolicies.dataRetentionPolicy;
        // Clean audit events
        if (policies.auditLogRetention) {
            const cutoffTime = now - policies.auditLogRetention;
            this.auditEvents = this.auditEvents.filter(e => e.timestamp > cutoffTime);
        }
        // Clean security violations
        const violationCutoffTime = now - (policies.errorLogRetention || 90 * 24 * 60 * 60 * 1000);
        this.securityViolations = this.securityViolations.filter(v => v.timestamp > violationCutoffTime);
        // Clean expired security contexts
        const sessionTimeout = this.securityPolicies.sessionPolicy?.maxDuration || 8 * 60 * 60 * 1000;
        for (const [sessionId, context] of this.securityContexts.entries()) {
            // Note: In a real implementation, you would track session creation time
            // For now, we'll just log that cleanup would happen
            this.log('debug', `Session cleanup would check: ${sessionId}`);
        }
        this.log('info', 'Security cleanup completed');
    }
    /**
     * Log security statistics
     */
    logSecurityStatistics() {
        const stats = {
            totalViolations: this.securityViolations.length,
            totalAuditEvents: this.auditEvents.length,
            activeSessions: this.securityContexts.size,
            threatDetectionStats: Object.fromEntries(this.threatDetectionStats),
            violationsByType: this.getViolationsByType(),
            recentViolations: this.securityViolations.filter(v => Date.now() - v.timestamp < 24 * 60 * 60 * 1000).length
        };
        this.log('info', 'Security statistics:', stats);
    }
    /**
     * Get violations by type
     */
    getViolationsByType() {
        const violationsByType = {};
        for (const violation of this.securityViolations) {
            violationsByType[violation.type] = (violationsByType[violation.type] || 0) + 1;
        }
        return violationsByType;
    }
    /**
     * Add authentication method
     */
    addAuthenticationMethod(method) {
        this.authenticationMethods.set(method.name, method);
        this.log('info', `Authentication method '${method.name}' added`);
    }
    /**
     * Remove authentication method
     */
    removeAuthenticationMethod(name) {
        const removed = this.authenticationMethods.delete(name);
        if (removed) {
            this.log('info', `Authentication method '${name}' removed`);
        }
        return removed;
    }
    /**
     * Update authorization rules
     */
    updateAuthorizationRules(rules) {
        this.authorizationRules = { ...this.authorizationRules, ...rules };
        this.log('info', 'Authorization rules updated');
    }
    /**
     * Get security violations
     */
    getSecurityViolations(limit) {
        const violations = [...this.securityViolations].reverse(); // Most recent first
        return limit ? violations.slice(0, limit) : violations;
    }
    /**
     * Get audit events
     */
    getAuditEvents(limit) {
        const events = [...this.auditEvents].reverse(); // Most recent first
        return limit ? events.slice(0, limit) : events;
    }
    /**
     * Get security statistics
     */
    getSecurityStatistics() {
        return {
            violations: {
                total: this.securityViolations.length,
                byType: this.getViolationsByType(),
                recent: this.securityViolations.filter(v => Date.now() - v.timestamp < 24 * 60 * 60 * 1000).length
            },
            auditEvents: {
                total: this.auditEvents.length,
                recent: this.auditEvents.filter(e => Date.now() - e.timestamp < 24 * 60 * 60 * 1000).length
            },
            sessions: {
                active: this.securityContexts.size
            },
            threats: {
                detectionStats: Object.fromEntries(this.threatDetectionStats)
            }
        };
    }
    async performHealthCheck() {
        const stats = this.getSecurityStatistics();
        return {
            securityEnabled: {
                authentication: this.enableAuthentication,
                authorization: this.enableAuthorization,
                inputSanitization: this.enableInputSanitization,
                outputFiltering: this.enableOutputFiltering,
                auditLogging: this.enableAuditLogging,
                threatDetection: this.enableThreatDetection
            },
            authenticationMethods: {
                total: this.authenticationMethods.size,
                enabled: Array.from(this.authenticationMethods.values())
                    .filter(m => m.enabled).length
            },
            statistics: stats,
            policies: {
                passwordPolicy: !!this.securityPolicies.passwordPolicy,
                sessionPolicy: !!this.securityPolicies.sessionPolicy,
                dataRetentionPolicy: !!this.securityPolicies.dataRetentionPolicy,
                accessPolicy: !!this.securityPolicies.accessPolicy
            },
            recentActivity: {
                violations: stats.violations.recent,
                auditEvents: stats.auditEvents.recent
            }
        };
    }
}
exports.SecurityPlugin = SecurityPlugin;
//# sourceMappingURL=security-plugin.js.map