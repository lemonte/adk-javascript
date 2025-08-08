"use strict";
/**
 * Logging plugin for ADK JavaScript
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggingPlugin = void 0;
const base_plugin_1 = require("./base-plugin");
const constants_1 = require("./constants");
/**
 * Plugin that logs important information at each callback point
 */
class LoggingPlugin extends base_plugin_1.BasePlugin {
    constructor(config = {}) {
        const fullConfig = {
            name: 'logging-plugin',
            version: '1.0.0',
            description: 'Logs important information at each callback point',
            priority: constants_1.PLUGIN_PRIORITIES.HIGH,
            hooks: [
                'before_run',
                'after_run',
                'before_agent',
                'after_agent',
                'before_tool',
                'after_tool',
                'before_model',
                'after_model',
                'on_tool_error',
                'on_model_error',
                'on_agent_error'
            ],
            settings: {
                logLevel: 'info',
                logFormat: 'detailed',
                includeTimestamp: true,
                includeContext: true,
                includeMetrics: false,
                logToConsole: true,
                logToFile: false,
                filterSensitiveData: true,
                sensitiveFields: ['password', 'token', 'key', 'secret', 'credential'],
                ...config.settings
            },
            ...config
        };
        super(fullConfig);
        this.logBuffer = [];
        const settings = fullConfig.settings;
        this.logLevel = settings.logLevel;
        this.logFormat = settings.logFormat;
        this.includeTimestamp = settings.includeTimestamp;
        this.includeContext = settings.includeContext;
        this.includeMetrics = settings.includeMetrics;
        this.logToConsole = settings.logToConsole;
        this.logToFile = settings.logToFile;
        this.logFilePath = settings.logFilePath;
        this.filterSensitiveData = settings.filterSensitiveData;
        this.sensitiveFields = settings.sensitiveFields;
    }
    async onInitialize() {
        this.log('info', 'Logging plugin initialized');
        if (this.logToFile && this.logFilePath) {
            try {
                // In a real implementation, you would open a file stream here
                this.log('info', `Log file configured: ${this.logFilePath}`);
            }
            catch (error) {
                this.log('error', 'Failed to initialize log file:', error);
                throw error;
            }
        }
    }
    async onDestroy() {
        this.log('info', 'Logging plugin destroyed');
        if (this.logFileHandle) {
            try {
                // In a real implementation, you would close the file stream here
                this.logFileHandle = undefined;
            }
            catch (error) {
                this.log('error', 'Failed to close log file:', error);
            }
        }
    }
    async beforeRunCallback(context) {
        this.logEvent('before_run', 'Run started', {
            runId: context.runId,
            agentName: context.agentName,
            startTime: context.startTime
        });
        return context;
    }
    async afterRunCallback(context) {
        this.logEvent('after_run', 'Run completed', {
            runId: context.runId,
            agentName: context.agentName,
            status: context.status,
            duration: context.duration,
            endTime: context.endTime,
            error: context.error?.message
        });
        return context;
    }
    async beforeAgentCallback(context) {
        this.logEvent('before_agent', 'Agent execution started', {
            agentName: context.agentName,
            input: this.sanitizeData(context.input)
        });
        return context;
    }
    async afterAgentCallback(context) {
        this.logEvent('after_agent', 'Agent execution completed', {
            agentName: context.agentName,
            output: this.sanitizeData(context.output),
            totalSteps: context.totalSteps,
            executionTime: context.executionTime,
            error: context.error?.message
        });
        return context;
    }
    async beforeToolCallback(context) {
        this.logEvent('before_tool', 'Tool execution started', {
            toolName: context.toolName,
            toolArgs: this.sanitizeData(context.toolArgs)
        });
        return context;
    }
    async afterToolCallback(context) {
        this.logEvent('after_tool', 'Tool execution completed', {
            toolName: context.toolName,
            toolResult: this.sanitizeData(context.toolResult),
            executionTime: context.executionTime,
            retryCount: context.retryCount,
            error: context.error?.message
        });
        return context;
    }
    async beforeModelCallback(context) {
        this.logEvent('before_model', 'Model call started', {
            modelName: context.modelName,
            prompt: this.sanitizeData(context.prompt)
        });
        return context;
    }
    async afterModelCallback(context) {
        this.logEvent('after_model', 'Model call completed', {
            modelName: context.modelName,
            response: this.sanitizeData(context.response),
            tokens: context.tokens,
            cost: context.cost,
            latency: context.latency,
            error: context.error?.message
        });
        return context;
    }
    async onToolErrorCallback(context) {
        this.logEvent('on_tool_error', 'Tool execution failed', {
            toolName: context.toolName,
            toolArgs: this.sanitizeData(context.toolArgs),
            error: context.error?.message,
            retryCount: context.retryCount
        }, 'error');
        return context;
    }
    async onModelErrorCallback(context) {
        this.logEvent('on_model_error', 'Model call failed', {
            modelName: context.modelName,
            prompt: this.sanitizeData(context.prompt),
            error: context.error?.message
        }, 'error');
        return context;
    }
    async onAgentErrorCallback(context) {
        this.logEvent('on_agent_error', 'Agent execution failed', {
            agentName: context.agentName,
            input: this.sanitizeData(context.input),
            error: context.error?.message,
            totalSteps: context.totalSteps
        }, 'error');
        return context;
    }
    /**
     * Log an event with the configured format
     */
    logEvent(hook, message, data, level = 'info') {
        if (!this.shouldLog(level)) {
            return;
        }
        const logEntry = this.formatLogEntry(hook, message, data, level);
        if (this.logToConsole) {
            this.outputToConsole(logEntry, level);
        }
        if (this.logToFile) {
            this.outputToFile(logEntry);
        }
    }
    /**
     * Check if the log level should be logged
     */
    shouldLog(level) {
        const levels = ['debug', 'info', 'warn', 'error'];
        const currentLevelIndex = levels.indexOf(this.logLevel);
        const messageLevelIndex = levels.indexOf(level);
        return messageLevelIndex >= currentLevelIndex;
    }
    /**
     * Format log entry based on configuration
     */
    formatLogEntry(hook, message, data, level) {
        const timestamp = this.includeTimestamp ? new Date().toISOString() : null;
        switch (this.logFormat) {
            case 'simple':
                return `${timestamp ? `[${timestamp}] ` : ''}${level.toUpperCase()}: ${message}`;
            case 'json':
                return JSON.stringify({
                    timestamp,
                    level,
                    plugin: this.getName(),
                    hook,
                    message,
                    ...(this.includeContext ? { data } : {}),
                    ...(this.includeMetrics ? { metrics: this.getMetrics() } : {})
                });
            case 'detailed':
            default:
                let entry = `${timestamp ? `[${timestamp}] ` : ''}${level.toUpperCase()} [${this.getName()}:${hook}]: ${message}`;
                if (this.includeContext && data && Object.keys(data).length > 0) {
                    entry += `\n  Data: ${JSON.stringify(data, null, 2).replace(/\n/g, '\n  ')}`;
                }
                if (this.includeMetrics) {
                    const metrics = this.getMetrics();
                    if (metrics.size > 0) {
                        entry += `\n  Metrics: ${JSON.stringify(Object.fromEntries(metrics), null, 2).replace(/\n/g, '\n  ')}`;
                    }
                }
                return entry;
        }
    }
    /**
     * Output log entry to console
     */
    outputToConsole(logEntry, level) {
        if (this.logger) {
            switch (level) {
                case 'debug':
                    this.logger.debug(logEntry);
                    break;
                case 'info':
                    this.logger.info(logEntry);
                    break;
                case 'warn':
                    this.logger.warn(logEntry);
                    break;
                case 'error':
                    this.logger.error(logEntry);
                    break;
            }
        }
        else {
            console.log(logEntry);
        }
    }
    /**
     * Output log entry to file
     */
    outputToFile(logEntry) {
        if (this.logFileHandle) {
            // In a real implementation, you would write to the file stream here
            this.logBuffer.push(logEntry + '\n');
        }
        else {
            // Buffer logs until file is available
            this.logBuffer.push(logEntry + '\n');
        }
    }
    /**
     * Sanitize data to remove sensitive information
     */
    sanitizeData(data) {
        if (!this.filterSensitiveData || !data) {
            return data;
        }
        if (typeof data === 'string') {
            return this.sanitizeString(data);
        }
        if (Array.isArray(data)) {
            return data.map(item => this.sanitizeData(item));
        }
        if (typeof data === 'object') {
            const sanitized = {};
            for (const [key, value] of Object.entries(data)) {
                if (this.isSensitiveField(key)) {
                    sanitized[key] = '[REDACTED]';
                }
                else {
                    sanitized[key] = this.sanitizeData(value);
                }
            }
            return sanitized;
        }
        return data;
    }
    /**
     * Check if a field name is sensitive
     */
    isSensitiveField(fieldName) {
        const lowerFieldName = fieldName.toLowerCase();
        return this.sensitiveFields.some(sensitive => lowerFieldName.includes(sensitive.toLowerCase()));
    }
    /**
     * Sanitize string data
     */
    sanitizeString(str) {
        // Simple pattern matching for common sensitive data patterns
        const patterns = [
            /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, // Email
            /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, // Credit card
            /\b(?:Bearer\s+)?[A-Za-z0-9\-_]{20,}\b/g, // Tokens
            /\b[A-Za-z0-9]{32,}\b/g // Long alphanumeric strings (potential keys)
        ];
        let sanitized = str;
        for (const pattern of patterns) {
            sanitized = sanitized.replace(pattern, '[REDACTED]');
        }
        return sanitized;
    }
    /**
     * Get log buffer (useful for testing or retrieving recent logs)
     */
    getLogBuffer() {
        return [...this.logBuffer];
    }
    /**
     * Clear log buffer
     */
    clearLogBuffer() {
        this.logBuffer = [];
    }
    /**
     * Update logging configuration
     */
    updateLoggingConfig(updates) {
        const currentSettings = this.config.settings || {};
        const newSettings = { ...currentSettings, ...updates };
        this.updateConfig({ settings: newSettings });
        // Update internal properties
        if (updates.logLevel)
            this.logLevel = updates.logLevel;
        if (updates.logFormat)
            this.logFormat = updates.logFormat;
        if (updates.includeTimestamp !== undefined)
            this.includeTimestamp = updates.includeTimestamp;
        if (updates.includeContext !== undefined)
            this.includeContext = updates.includeContext;
        if (updates.includeMetrics !== undefined)
            this.includeMetrics = updates.includeMetrics;
        if (updates.logToConsole !== undefined)
            this.logToConsole = updates.logToConsole;
        if (updates.logToFile !== undefined)
            this.logToFile = updates.logToFile;
        if (updates.logFilePath)
            this.logFilePath = updates.logFilePath;
        if (updates.filterSensitiveData !== undefined)
            this.filterSensitiveData = updates.filterSensitiveData;
        if (updates.sensitiveFields)
            this.sensitiveFields = updates.sensitiveFields;
        this.log('info', 'Logging configuration updated', updates);
    }
    async performHealthCheck() {
        return {
            logLevel: this.logLevel,
            logFormat: this.logFormat,
            logToConsole: this.logToConsole,
            logToFile: this.logToFile,
            logFilePath: this.logFilePath,
            bufferSize: this.logBuffer.length,
            fileHandleActive: !!this.logFileHandle
        };
    }
}
exports.LoggingPlugin = LoggingPlugin;
//# sourceMappingURL=logging-plugin.js.map