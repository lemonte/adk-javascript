"use strict";
/**
 * Base plugin class for ADK JavaScript
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BasePlugin = void 0;
const constants_1 = require("./constants");
/**
 * Abstract base class for all ADK plugins
 */
class BasePlugin {
    constructor(config) {
        this.enabled = true;
        this.initialized = false;
        this.metrics = new Map();
        this.validateConfig(config);
        this.config = {
            priority: constants_1.PLUGIN_PRIORITIES.NORMAL,
            enabled: true,
            ...config
        };
        this.enabled = this.config.enabled ?? true;
    }
    /**
     * Get plugin name
     */
    getName() {
        return this.config.name;
    }
    /**
     * Get plugin version
     */
    getVersion() {
        return this.config.version || '1.0.0';
    }
    /**
     * Get plugin description
     */
    getDescription() {
        return this.config.description || '';
    }
    /**
     * Get plugin priority
     */
    getPriority() {
        return this.config.priority || constants_1.PLUGIN_PRIORITIES.NORMAL;
    }
    /**
     * Get plugin dependencies
     */
    getDependencies() {
        return this.config.dependencies || [];
    }
    /**
     * Get plugin hooks
     */
    getHooks() {
        return this.config.hooks || [];
    }
    /**
     * Check if plugin is enabled
     */
    isEnabled() {
        return this.enabled;
    }
    /**
     * Check if plugin is initialized
     */
    isInitialized() {
        return this.initialized;
    }
    /**
     * Enable the plugin
     */
    enable() {
        this.enabled = true;
        this.config.enabled = true;
    }
    /**
     * Disable the plugin
     */
    disable() {
        this.enabled = false;
        this.config.enabled = false;
    }
    /**
     * Get plugin configuration
     */
    getConfig() {
        return { ...this.config };
    }
    /**
     * Update plugin configuration
     */
    updateConfig(updates) {
        this.config = { ...this.config, ...updates };
        if (updates.enabled !== undefined) {
            this.enabled = updates.enabled;
        }
    }
    /**
     * Set plugin cache
     */
    setCache(cache) {
        this.cache = cache;
    }
    /**
     * Set plugin logger
     */
    setLogger(logger) {
        this.logger = logger;
    }
    /**
     * Initialize the plugin
     */
    async initialize() {
        if (this.initialized) {
            return;
        }
        try {
            await this.onInitialize();
            this.initialized = true;
            this.log('info', `Plugin ${this.getName()} initialized successfully`);
        }
        catch (error) {
            this.log('error', `Failed to initialize plugin ${this.getName()}:`, error);
            throw error;
        }
    }
    /**
     * Destroy the plugin
     */
    async destroy() {
        if (!this.initialized) {
            return;
        }
        try {
            await this.onDestroy();
            this.initialized = false;
            this.enabled = false;
            this.metrics.clear();
            this.log('info', `Plugin ${this.getName()} destroyed successfully`);
        }
        catch (error) {
            this.log('error', `Failed to destroy plugin ${this.getName()}:`, error);
            throw error;
        }
    }
    /**
     * Validate plugin configuration
     */
    validateConfig(config) {
        const errors = [];
        const warnings = [];
        const suggestions = [];
        // Validate required fields
        for (const field of constants_1.PLUGIN_VALIDATION_RULES.REQUIRED_FIELDS) {
            if (!config[field]) {
                errors.push(`Missing required field: ${field}`);
            }
        }
        // Validate name
        if (config.name) {
            if (!constants_1.PLUGIN_VALIDATION_RULES.NAME_PATTERN.test(config.name)) {
                errors.push('Plugin name must start with a letter and contain only letters, numbers, hyphens, and underscores');
            }
            if (config.name.length < constants_1.PLUGIN_VALIDATION_RULES.MIN_NAME_LENGTH) {
                errors.push(`Plugin name must be at least ${constants_1.PLUGIN_VALIDATION_RULES.MIN_NAME_LENGTH} characters long`);
            }
            if (config.name.length > constants_1.PLUGIN_VALIDATION_RULES.MAX_NAME_LENGTH) {
                errors.push(`Plugin name must be no more than ${constants_1.PLUGIN_VALIDATION_RULES.MAX_NAME_LENGTH} characters long`);
            }
        }
        // Validate version
        if (config.version && !constants_1.PLUGIN_VALIDATION_RULES.VERSION_PATTERN.test(config.version)) {
            errors.push('Plugin version must follow semantic versioning (e.g., 1.0.0)');
        }
        // Validate description length
        if (config.description && config.description.length > constants_1.PLUGIN_VALIDATION_RULES.MAX_DESCRIPTION_LENGTH) {
            warnings.push(`Plugin description is longer than recommended ${constants_1.PLUGIN_VALIDATION_RULES.MAX_DESCRIPTION_LENGTH} characters`);
        }
        // Validate priority
        if (config.priority !== undefined && (config.priority < 1 || config.priority > 1000)) {
            warnings.push('Plugin priority should be between 1 and 1000');
        }
        // Suggestions
        if (!config.description) {
            suggestions.push('Consider adding a description to help users understand the plugin purpose');
        }
        if (!config.version) {
            suggestions.push('Consider adding a version to track plugin updates');
        }
        const result = {
            valid: errors.length === 0,
            errors,
            warnings,
            suggestions
        };
        if (!result.valid) {
            throw new Error(`Plugin configuration validation failed: ${errors.join(', ')}`);
        }
        return result;
    }
    /**
     * Get plugin metrics
     */
    getMetrics() {
        return new Map(this.metrics);
    }
    /**
     * Record execution metrics
     */
    recordMetrics(hookName, executionTime, success) {
        const existing = this.metrics.get(hookName);
        if (existing) {
            existing.executionCount++;
            existing.totalExecutionTime += executionTime;
            existing.averageExecutionTime = existing.totalExecutionTime / existing.executionCount;
            existing.minExecutionTime = Math.min(existing.minExecutionTime, executionTime);
            existing.maxExecutionTime = Math.max(existing.maxExecutionTime, executionTime);
            existing.lastExecuted = new Date().toISOString();
            if (success) {
                existing.successCount++;
            }
            else {
                existing.errorCount++;
            }
        }
        else {
            this.metrics.set(hookName, {
                pluginName: this.getName(),
                hookName,
                executionCount: 1,
                totalExecutionTime: executionTime,
                averageExecutionTime: executionTime,
                minExecutionTime: executionTime,
                maxExecutionTime: executionTime,
                errorCount: success ? 0 : 1,
                successCount: success ? 1 : 0,
                lastExecuted: new Date().toISOString()
            });
        }
    }
    /**
     * Log message with plugin context
     */
    log(level, message, ...args) {
        if (this.logger) {
            const prefix = `[Plugin:${this.getName()}]`;
            switch (level) {
                case 'debug':
                    this.logger.debug(prefix, message, ...args);
                    break;
                case 'info':
                    this.logger.info(prefix, message, ...args);
                    break;
                case 'warn':
                    this.logger.warn(prefix, message, ...args);
                    break;
                case 'error':
                    this.logger.error(prefix, message, ...args);
                    break;
            }
        }
    }
    /**
     * Execute a hook with error handling and metrics
     */
    async executeHook(hookName, context, data, hookFunction) {
        if (!this.enabled || !this.initialized) {
            return { success: false, error: new Error('Plugin is not enabled or initialized') };
        }
        const startTime = Date.now();
        let success = false;
        let result;
        let error;
        try {
            result = await hookFunction(context, data);
            success = true;
        }
        catch (err) {
            error = err instanceof Error ? err : new Error(String(err));
            this.log('error', `Hook ${hookName} failed:`, error);
        }
        finally {
            const executionTime = Date.now() - startTime;
            this.recordMetrics(hookName, executionTime, success);
        }
        return {
            success,
            data: result !== undefined ? result : data,
            error,
            metadata: {
                executionTime: Date.now() - startTime,
                hookName,
                pluginName: this.getName()
            }
        };
    }
    // Lifecycle hooks (to be implemented by subclasses)
    async onInitialize() {
        // Override in subclasses
    }
    async onDestroy() {
        // Override in subclasses
    }
    // Plugin callback hooks (to be implemented by subclasses)
    async beforeRunCallback(context) {
        // Override in subclasses
        return context;
    }
    async afterRunCallback(context) {
        // Override in subclasses
        return context;
    }
    async onEventCallback(context, event) {
        // Override in subclasses
        return event;
    }
    async beforeAgentCallback(context) {
        // Override in subclasses
        return context;
    }
    async afterAgentCallback(context) {
        // Override in subclasses
        return context;
    }
    async beforeToolCallback(context) {
        // Override in subclasses
        return context;
    }
    async afterToolCallback(context) {
        // Override in subclasses
        return context;
    }
    async beforeModelCallback(context) {
        // Override in subclasses
        return context;
    }
    async afterModelCallback(context) {
        // Override in subclasses
        return context;
    }
    async onToolErrorCallback(context) {
        // Override in subclasses
        return context;
    }
    async onModelErrorCallback(context) {
        // Override in subclasses
        return context;
    }
    async onAgentErrorCallback(context) {
        // Override in subclasses
        return context;
    }
    /**
     * Health check for the plugin
     */
    async healthCheck() {
        try {
            if (!this.initialized) {
                return {
                    healthy: false,
                    message: 'Plugin is not initialized'
                };
            }
            if (!this.enabled) {
                return {
                    healthy: false,
                    message: 'Plugin is disabled'
                };
            }
            // Perform custom health checks
            const customCheck = await this.performHealthCheck();
            return {
                healthy: true,
                message: 'Plugin is healthy',
                details: {
                    name: this.getName(),
                    version: this.getVersion(),
                    enabled: this.enabled,
                    initialized: this.initialized,
                    metricsCount: this.metrics.size,
                    ...customCheck
                }
            };
        }
        catch (error) {
            return {
                healthy: false,
                message: `Health check failed: ${error instanceof Error ? error.message : String(error)}`
            };
        }
    }
    /**
     * Custom health check implementation (to be overridden by subclasses)
     */
    async performHealthCheck() {
        return {};
    }
    /**
     * Get plugin information
     */
    getInfo() {
        return {
            name: this.getName(),
            version: this.getVersion(),
            description: this.getDescription(),
            enabled: this.enabled,
            initialized: this.initialized,
            priority: this.getPriority(),
            dependencies: this.getDependencies(),
            hooks: this.getHooks(),
            metadata: this.config.metadata
        };
    }
}
exports.BasePlugin = BasePlugin;
//# sourceMappingURL=base-plugin.js.map