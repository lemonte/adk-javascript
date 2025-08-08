import { PluginConfig, PluginMetadata, PluginValidationResult, PluginError, PluginConfigSchema } from './types';
/**
 * Utility functions for plugin management and operations
 */
export declare class PluginUtils {
    /**
     * Validates plugin configuration against schema
     */
    static validatePluginConfig(config: PluginConfig, schema?: PluginConfigSchema): PluginValidationResult;
    /**
     * Validates configuration against a schema
     */
    private static validateAgainstSchema;
    /**
     * Validates field type against schema
     */
    private static validateFieldType;
    /**
     * Sanitizes plugin configuration
     */
    static sanitizeConfig(config: PluginConfig): PluginConfig;
    /**
     * Generates plugin metadata from configuration
     */
    static generateMetadata(config: PluginConfig): PluginMetadata;
    /**
     * Merges plugin configurations with defaults
     */
    static mergeConfigs(base: PluginConfig, override: Partial<PluginConfig>): PluginConfig;
    /**
     * Compares plugin versions
     */
    static compareVersions(version1: string, version2: string): number;
    /**
     * Checks if version satisfies requirement
     */
    static satisfiesVersion(version: string, requirement: string): boolean;
    /**
     * Validates version format
     */
    static isValidVersion(version: string): boolean;
    /**
     * Creates a plugin error
     */
    static createError(code: string, message: string, pluginName?: string, details?: any): PluginError;
    /**
     * Formats plugin error for display
     */
    static formatError(error: PluginError): string;
    /**
     * Generates unique plugin ID
     */
    static generatePluginId(name: string, version: string): string;
    /**
     * Parses plugin ID into name and version
     */
    static parsePluginId(id: string): {
        name: string;
        version: string;
    };
    /**
     * Normalizes plugin name
     */
    static normalizePluginName(name: string): string;
    /**
     * Checks if plugin name is valid
     */
    static isValidPluginName(name: string): boolean;
    /**
     * Deep clones an object
     */
    static deepClone<T>(obj: T): T;
    /**
     * Debounces a function
     */
    static debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void;
    /**
     * Throttles a function
     */
    static throttle<T extends (...args: any[]) => any>(func: T, limit: number): (...args: Parameters<T>) => void;
    /**
     * Creates a timeout promise
     */
    static timeout(ms: number): Promise<never>;
    /**
     * Retries a function with exponential backoff
     */
    static retry<T>(fn: () => Promise<T>, maxRetries?: number, baseDelay?: number): Promise<T>;
    /**
     * Measures execution time of a function
     */
    static measureTime<T>(fn: () => Promise<T>): Promise<{
        result: T;
        duration: number;
    }>;
    /**
     * Converts bytes to human readable format
     */
    static formatBytes(bytes: number): string;
    /**
     * Generates a simple hash for a string
     */
    static simpleHash(str: string): string;
}
/**
 * Plugin utility functions for common operations
 */
export declare const pluginUtils: {
    validate: typeof PluginUtils.validatePluginConfig;
    sanitize: typeof PluginUtils.sanitizeConfig;
    merge: typeof PluginUtils.mergeConfigs;
    compareVersions: typeof PluginUtils.compareVersions;
    satisfiesVersion: typeof PluginUtils.satisfiesVersion;
    createError: typeof PluginUtils.createError;
    formatError: typeof PluginUtils.formatError;
    generateId: typeof PluginUtils.generatePluginId;
    parseId: typeof PluginUtils.parsePluginId;
    normalizeName: typeof PluginUtils.normalizePluginName;
    isValidName: typeof PluginUtils.isValidPluginName;
    deepClone: typeof PluginUtils.deepClone;
    debounce: typeof PluginUtils.debounce;
    throttle: typeof PluginUtils.throttle;
    timeout: typeof PluginUtils.timeout;
    retry: typeof PluginUtils.retry;
    measureTime: typeof PluginUtils.measureTime;
    formatBytes: typeof PluginUtils.formatBytes;
    hash: typeof PluginUtils.simpleHash;
};
//# sourceMappingURL=plugin-utils.d.ts.map