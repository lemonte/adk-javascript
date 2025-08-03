/**
 * Logger utility for the ADK JavaScript SDK
 */

// Declare window for environments where it might not be available
declare global {
  var window: any;
}

/**
 * Log levels
 */
export enum LogLevel {
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
export class Logger {
  private readonly context: string;
  private readonly config: Required<LoggerConfig>;
  private static globalConfig: LoggerConfig = {
    level: LogLevel.INFO,
    enableConsole: true,
    enableFile: false,
    format: 'text',
    includeTimestamp: true,
    includeContext: true
  };

  constructor(context: string = 'ADK', config?: Partial<LoggerConfig>) {
    this.context = context;
    this.config = {
      ...Logger.globalConfig,
      ...config
    } as Required<LoggerConfig>;
  }

  /**
   * Set global logger configuration
   */
  static configure(config: Partial<LoggerConfig>): void {
    Logger.globalConfig = {
      ...Logger.globalConfig,
      ...config
    };
  }

  /**
   * Log debug message
   */
  debug(message: string, data?: any): void {
    this.log(LogLevel.DEBUG, message, data);
  }

  /**
   * Log info message
   */
  info(message: string, data?: any): void {
    this.log(LogLevel.INFO, message, data);
  }

  /**
   * Log warning message
   */
  warn(message: string, data?: any): void {
    this.log(LogLevel.WARN, message, data);
  }

  /**
   * Log error message
   */
  error(message: string, error?: any): void {
    const errorObj = error instanceof Error ? error : 
                     typeof error === 'string' ? new Error(error) : 
                     error ? new Error(JSON.stringify(error)) : undefined;
    
    this.log(LogLevel.ERROR, message, undefined, errorObj);
  }

  /**
   * Log message with specified level
   */
  private log(level: LogLevel, message: string, data?: any, error?: Error): void {
    if (level < this.config.level) {
      return;
    }

    const entry: LogEntry = {
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
  private logToConsole(entry: LogEntry): void {
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
  private logToFile(entry: LogEntry): void {
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
      const dir = path.dirname(this.config.filePath!);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      fs.appendFileSync(this.config.filePath!, formatted);
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }

  /**
   * Format log entry for display
   */
  private formatEntry(entry: LogEntry): string {
    const parts: string[] = [];
    
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
  child(context: string): Logger {
    return new Logger(`${this.context}:${context}`, this.config);
  }

  /**
   * Get current log level
   */
  getLevel(): LogLevel {
    return this.config.level;
  }

  /**
   * Set log level
   */
  setLevel(level: LogLevel): void {
    this.config.level = level;
  }

  /**
   * Check if level is enabled
   */
  isLevelEnabled(level: LogLevel): boolean {
    return level >= this.config.level;
  }
}

/**
 * Default logger instance
 */
export const logger = new Logger('ADK');

/**
 * Create a logger with context
 */
export function createLogger(context: string, config?: Partial<LoggerConfig>): Logger {
  return new Logger(context, config);
}

/**
 * Configure global logging
 */
export function configureLogging(config: Partial<LoggerConfig>): void {
  Logger.configure(config);
}