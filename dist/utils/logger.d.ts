/**
 * Logger utility for the ADK JavaScript SDK
 */
declare global {
    var window: any;
}
/**
 * Log levels
 */
export declare enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3,
    NONE = 4
}
/**
 * Log entry interface
 */
export interface LogEntry {
    level: LogLevel;
    message: string;
    timestamp: Date;
    context?: string;
    data?: any;
    error?: Error;
}
/**
 * Logger configuration
 */
export interface LoggerConfig {
    level?: LogLevel;
    enableConsole?: boolean;
    enableFile?: boolean;
    filePath?: string;
    maxFileSize?: number;
    maxFiles?: number;
    format?: 'json' | 'text';
    includeTimestamp?: boolean;
    includeContext?: boolean;
}
/**
 * Logger class for structured logging
 */
export declare class Logger {
    private readonly context;
    private readonly config;
    private static globalConfig;
    constructor(context?: string, config?: Partial<LoggerConfig>);
    /**
     * Set global logger configuration
     */
    static configure(config: Partial<LoggerConfig>): void;
    /**
     * Log debug message
     */
    debug(message: string, data?: any): void;
    /**
     * Log info message
     */
    info(message: string, data?: any): void;
    /**
     * Log warning message
     */
    warn(message: string, data?: any): void;
    /**
     * Log error message
     */
    error(message: string, error?: any): void;
    /**
     * Log message with specified level
     */
    private log;
    /**
     * Log to console
     */
    private logToConsole;
    /**
     * Log to file (Node.js only)
     */
    private logToFile;
    /**
     * Format log entry for display
     */
    private formatEntry;
    /**
     * Create child logger with extended context
     */
    child(context: string): Logger;
    /**
     * Get current log level
     */
    getLevel(): LogLevel;
    /**
     * Set log level
     */
    setLevel(level: LogLevel): void;
    /**
     * Check if level is enabled
     */
    isLevelEnabled(level: LogLevel): boolean;
}
/**
 * Default logger instance
 */
export declare const logger: Logger;
/**
 * Create a logger with context
 */
export declare function createLogger(context: string, config?: Partial<LoggerConfig>): Logger;
/**
 * Configure global logging
 */
export declare function configureLogging(config: Partial<LoggerConfig>): void;
//# sourceMappingURL=logger.d.ts.map