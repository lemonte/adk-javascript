"use strict";
/**
 * Logger utility for the ADK JavaScript SDK
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = exports.Logger = exports.LogLevel = void 0;
exports.createLogger = createLogger;
exports.configureLogging = configureLogging;
/**
 * Log levels
 */
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["DEBUG"] = 0] = "DEBUG";
    LogLevel[LogLevel["INFO"] = 1] = "INFO";
    LogLevel[LogLevel["WARN"] = 2] = "WARN";
    LogLevel[LogLevel["ERROR"] = 3] = "ERROR";
    LogLevel[LogLevel["NONE"] = 4] = "NONE";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
/**
 * Logger class for structured logging
 */
class Logger {
    constructor(context = 'ADK', config) {
        this.context = context;
        this.config = {
            ...Logger.globalConfig,
            ...config
        };
    }
    /**
     * Set global logger configuration
     */
    static configure(config) {
        Logger.globalConfig = {
            ...Logger.globalConfig,
            ...config
        };
    }
    /**
     * Log debug message
     */
    debug(message, data) {
        this.log(LogLevel.DEBUG, message, data);
    }
    /**
     * Log info message
     */
    info(message, data) {
        this.log(LogLevel.INFO, message, data);
    }
    /**
     * Log warning message
     */
    warn(message, data) {
        this.log(LogLevel.WARN, message, data);
    }
    /**
     * Log error message
     */
    error(message, error) {
        const errorObj = error instanceof Error ? error :
            typeof error === 'string' ? new Error(error) :
                error ? new Error(JSON.stringify(error)) : undefined;
        this.log(LogLevel.ERROR, message, undefined, errorObj);
    }
    /**
     * Log message with specified level
     */
    log(level, message, data, error) {
        if (level < this.config.level) {
            return;
        }
        const entry = {
            level,
            message,
            timestamp: new Date(),
            context: this.context,
            data,
            error
        };
        if (this.config.enableConsole) {
            this.logToConsole(entry);
        }
        if (this.config.enableFile && this.config.filePath) {
            this.logToFile(entry);
        }
    }
    /**
     * Log to console
     */
    logToConsole(entry) {
        const formatted = this.formatEntry(entry);
        switch (entry.level) {
            case LogLevel.DEBUG:
                console.debug(formatted);
                break;
            case LogLevel.INFO:
                console.info(formatted);
                break;
            case LogLevel.WARN:
                console.warn(formatted);
                break;
            case LogLevel.ERROR:
                console.error(formatted);
                if (entry.error) {
                    console.error(entry.error);
                }
                break;
        }
    }
    /**
     * Log to file (Node.js only)
     */
    logToFile(entry) {
        if (typeof window !== 'undefined') {
            // Browser environment, skip file logging
            return;
        }
        try {
            const fs = eval('require')('fs');
            const path = eval('require')('path');
            const formatted = this.config.format === 'json' ?
                JSON.stringify(entry) + '\n' :
                this.formatEntry(entry) + '\n';
            // Ensure directory exists
            const dir = path.dirname(this.config.filePath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            fs.appendFileSync(this.config.filePath, formatted);
        }
        catch (error) {
            console.error('Failed to write to log file:', error);
        }
    }
    /**
     * Format log entry for display
     */
    formatEntry(entry) {
        const parts = [];
        if (this.config.includeTimestamp) {
            parts.push(`[${entry.timestamp.toISOString()}]`);
        }
        parts.push(`[${LogLevel[entry.level]}]`);
        if (this.config.includeContext && entry.context) {
            parts.push(`[${entry.context}]`);
        }
        parts.push(entry.message);
        if (entry.data) {
            parts.push(JSON.stringify(entry.data));
        }
        return parts.join(' ');
    }
    /**
     * Create child logger with extended context
     */
    child(context) {
        return new Logger(`${this.context}:${context}`, this.config);
    }
    /**
     * Get current log level
     */
    getLevel() {
        return this.config.level;
    }
    /**
     * Set log level
     */
    setLevel(level) {
        this.config.level = level;
    }
    /**
     * Check if level is enabled
     */
    isLevelEnabled(level) {
        return level >= this.config.level;
    }
}
exports.Logger = Logger;
Logger.globalConfig = {
    level: LogLevel.INFO,
    enableConsole: true,
    enableFile: false,
    format: 'text',
    includeTimestamp: true,
    includeContext: true
};
/**
 * Default logger instance
 */
exports.logger = new Logger('ADK');
/**
 * Create a logger with context
 */
function createLogger(context, config) {
    return new Logger(context, config);
}
/**
 * Configure global logging
 */
function configureLogging(config) {
    Logger.configure(config);
}
//# sourceMappingURL=logger.js.map