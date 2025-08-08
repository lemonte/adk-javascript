/**
 * Logging plugin for ADK JavaScript
 */
import { BasePlugin } from './base-plugin';
import { PluginConfig, InvocationContext, ToolContext, ModelContext, AgentContext } from './types';
export interface LoggingPluginConfig extends PluginConfig {
    settings?: {
        logLevel?: 'debug' | 'info' | 'warn' | 'error';
        logFormat?: 'simple' | 'detailed' | 'json';
        includeTimestamp?: boolean;
        includeContext?: boolean;
        includeMetrics?: boolean;
        logToConsole?: boolean;
        logToFile?: boolean;
        logFilePath?: string;
        maxLogFileSize?: number;
        rotateLogFiles?: boolean;
        filterSensitiveData?: boolean;
        sensitiveFields?: string[];
    };
}
/**
 * Plugin that logs important information at each callback point
 */
export declare class LoggingPlugin extends BasePlugin {
    private logLevel;
    private logFormat;
    private includeTimestamp;
    private includeContext;
    private includeMetrics;
    private logToConsole;
    private logToFile;
    private logFilePath?;
    private filterSensitiveData;
    private sensitiveFields;
    private logBuffer;
    private logFileHandle?;
    constructor(config?: Partial<LoggingPluginConfig>);
    protected onInitialize(): Promise<void>;
    protected onDestroy(): Promise<void>;
    beforeRunCallback(context: InvocationContext): Promise<InvocationContext>;
    afterRunCallback(context: InvocationContext): Promise<InvocationContext>;
    beforeAgentCallback(context: AgentContext): Promise<AgentContext>;
    afterAgentCallback(context: AgentContext): Promise<AgentContext>;
    beforeToolCallback(context: ToolContext): Promise<ToolContext>;
    afterToolCallback(context: ToolContext): Promise<ToolContext>;
    beforeModelCallback(context: ModelContext): Promise<ModelContext>;
    afterModelCallback(context: ModelContext): Promise<ModelContext>;
    onToolErrorCallback(context: ToolContext): Promise<ToolContext>;
    onModelErrorCallback(context: ModelContext): Promise<ModelContext>;
    onAgentErrorCallback(context: AgentContext): Promise<AgentContext>;
    /**
     * Log an event with the configured format
     */
    private logEvent;
    /**
     * Check if the log level should be logged
     */
    private shouldLog;
    /**
     * Format log entry based on configuration
     */
    private formatLogEntry;
    /**
     * Output log entry to console
     */
    private outputToConsole;
    /**
     * Output log entry to file
     */
    private outputToFile;
    /**
     * Sanitize data to remove sensitive information
     */
    private sanitizeData;
    /**
     * Check if a field name is sensitive
     */
    private isSensitiveField;
    /**
     * Sanitize string data
     */
    private sanitizeString;
    /**
     * Get log buffer (useful for testing or retrieving recent logs)
     */
    getLogBuffer(): string[];
    /**
     * Clear log buffer
     */
    clearLogBuffer(): void;
    /**
     * Update logging configuration
     */
    updateLoggingConfig(updates: Partial<LoggingPluginConfig['settings']>): void;
    protected performHealthCheck(): Promise<Record<string, any>>;
}
//# sourceMappingURL=logging-plugin.d.ts.map