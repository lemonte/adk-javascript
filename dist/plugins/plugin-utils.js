"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pluginUtils = exports.PluginUtils = void 0;
/**
 * Utility functions for plugin management and operations
 */
class PluginUtils {
    /**
     * Validates plugin configuration against schema
     */
    static validatePluginConfig(config, schema) {
        const errors = [];
        const warnings = [];
        // Basic validation
        if (!config.name || typeof config.name !== 'string') {
            errors.push('Plugin name is required and must be a string');
        }
        if (!config.version || typeof config.version !== 'string') {
            errors.push('Plugin version is required and must be a string');
        }
        if (config.enabled !== undefined && typeof config.enabled !== 'boolean') {
            errors.push('Plugin enabled flag must be a boolean');
        }
        if (config.priority !== undefined && typeof config.priority !== 'number') {
            errors.push('Plugin priority must be a number');
        }
        if (config.dependencies && !Array.isArray(config.dependencies)) {
            errors.push('Plugin dependencies must be an array');
        }
        if (config.hooks && typeof config.hooks !== 'object') {
            errors.push('Plugin hooks must be an object');
        }
        // Schema validation if provided
        if (schema) {
            const schemaErrors = this.validateAgainstSchema(config, schema);
            errors.push(...schemaErrors);
        }
        // Validate version format
        if (config.version && !this.isValidVersion(config.version)) {
            warnings.push('Plugin version should follow semantic versioning (x.y.z)');
        }
        // Validate priority range
        if (config.priority !== undefined && (config.priority < 0 || config.priority > 100)) {
            warnings.push('Plugin priority should be between 0 and 100');
        }
        return {
            isValid: errors.length === 0,
            errors,
            warnings,
            sanitizedConfig: this.sanitizeConfig(config)
        };
    }
    /**
     * Validates configuration against a schema
     */
    static validateAgainstSchema(config, schema) {
        const errors = [];
        // Validate required fields
        if (schema.required) {
            for (const field of schema.required) {
                if (!(field in config)) {
                    errors.push(`Required field '${field}' is missing`);
                }
            }
        }
        // Validate field types
        if (schema.properties) {
            for (const [field, fieldSchema] of Object.entries(schema.properties)) {
                if (field in config) {
                    const value = config[field];
                    if (!this.validateFieldType(value, fieldSchema)) {
                        errors.push(`Field '${field}' has invalid type`);
                    }
                }
            }
        }
        return errors;
    }
    /**
     * Validates field type against schema
     */
    static validateFieldType(value, schema) {
        if (schema.type) {
            const actualType = Array.isArray(value) ? 'array' : typeof value;
            if (actualType !== schema.type) {
                return false;
            }
        }
        if (schema.enum && !schema.enum.includes(value)) {
            return false;
        }
        if (schema.minimum !== undefined && typeof value === 'number' && value < schema.minimum) {
            return false;
        }
        if (schema.maximum !== undefined && typeof value === 'number' && value > schema.maximum) {
            return false;
        }
        return true;
    }
    /**
     * Sanitizes plugin configuration
     */
    static sanitizeConfig(config) {
        const sanitized = { ...config };
        // Ensure enabled is boolean
        if (sanitized.enabled === undefined) {
            sanitized.enabled = true;
        }
        // Ensure priority is within valid range
        if (sanitized.priority !== undefined) {
            sanitized.priority = Math.max(0, Math.min(100, sanitized.priority));
        }
        // Ensure dependencies is array
        if (!sanitized.dependencies) {
            sanitized.dependencies = [];
        }
        // Ensure hooks is object
        if (!sanitized.hooks) {
            sanitized.hooks = {};
        }
        return sanitized;
    }
    /**
     * Generates plugin metadata from configuration
     */
    static generateMetadata(config) {
        return {
            name: config.name,
            version: config.version,
            description: config.description || '',
            author: config.author || 'Unknown',
            license: config.license || 'MIT',
            homepage: config.homepage,
            repository: config.repository,
            keywords: config.keywords || [],
            dependencies: config.dependencies || [],
            peerDependencies: config.peerDependencies || [],
            engines: config.engines,
            os: config.os,
            cpu: config.cpu,
            main: config.main,
            types: config.types,
            files: config.files || [],
            scripts: config.scripts || {},
            config: config.config || {},
            createdAt: new Date(),
            updatedAt: new Date()
        };
    }
    /**
     * Merges plugin configurations with defaults
     */
    static mergeConfigs(base, override) {
        const merged = { ...base };
        // Merge simple properties
        Object.keys(override).forEach(key => {
            const value = override[key];
            if (value !== undefined) {
                if (typeof value === 'object' && !Array.isArray(value) && value !== null) {
                    // Deep merge objects
                    merged[key] = { ...merged[key], ...value };
                }
                else {
                    // Replace primitives and arrays
                    merged[key] = value;
                }
            }
        });
        return merged;
    }
    /**
     * Compares plugin versions
     */
    static compareVersions(version1, version2) {
        const v1Parts = version1.split('.').map(Number);
        const v2Parts = version2.split('.').map(Number);
        const maxLength = Math.max(v1Parts.length, v2Parts.length);
        for (let i = 0; i < maxLength; i++) {
            const v1Part = v1Parts[i] || 0;
            const v2Part = v2Parts[i] || 0;
            if (v1Part > v2Part)
                return 1;
            if (v1Part < v2Part)
                return -1;
        }
        return 0;
    }
    /**
     * Checks if version satisfies requirement
     */
    static satisfiesVersion(version, requirement) {
        // Simple implementation - can be enhanced with semver library
        if (requirement.startsWith('^')) {
            const reqVersion = requirement.slice(1);
            return this.compareVersions(version, reqVersion) >= 0;
        }
        if (requirement.startsWith('~')) {
            const reqVersion = requirement.slice(1);
            const versionParts = version.split('.');
            const reqParts = reqVersion.split('.');
            return versionParts[0] === reqParts[0] &&
                versionParts[1] === reqParts[1] &&
                this.compareVersions(version, reqVersion) >= 0;
        }
        if (requirement.startsWith('>=')) {
            const reqVersion = requirement.slice(2);
            return this.compareVersions(version, reqVersion) >= 0;
        }
        if (requirement.startsWith('<=')) {
            const reqVersion = requirement.slice(2);
            return this.compareVersions(version, reqVersion) <= 0;
        }
        if (requirement.startsWith('>')) {
            const reqVersion = requirement.slice(1);
            return this.compareVersions(version, reqVersion) > 0;
        }
        if (requirement.startsWith('<')) {
            const reqVersion = requirement.slice(1);
            return this.compareVersions(version, reqVersion) < 0;
        }
        // Exact match
        return version === requirement;
    }
    /**
     * Validates version format
     */
    static isValidVersion(version) {
        const semverRegex = /^\d+\.\d+\.\d+(?:-[\w.-]+)?(?:\+[\w.-]+)?$/;
        return semverRegex.test(version);
    }
    /**
     * Creates a plugin error
     */
    static createError(code, message, pluginName, details) {
        return {
            code,
            message,
            pluginName,
            details,
            timestamp: new Date(),
            stack: new Error().stack
        };
    }
    /**
     * Formats plugin error for display
     */
    static formatError(error) {
        let formatted = `[${error.code}]`;
        if (error.pluginName) {
            formatted += ` Plugin '${error.pluginName}':`;
            ;
        }
        formatted += ` ${error.message}`;
        if (error.details) {
            formatted += ` (${JSON.stringify(error.details)})`;
        }
        return formatted;
    }
    /**
     * Generates unique plugin ID
     */
    static generatePluginId(name, version) {
        return `${name}@${version}`;
    }
    /**
     * Parses plugin ID into name and version
     */
    static parsePluginId(id) {
        const lastAtIndex = id.lastIndexOf('@');
        if (lastAtIndex === -1) {
            return { name: id, version: 'latest' };
        }
        return {
            name: id.slice(0, lastAtIndex),
            version: id.slice(lastAtIndex + 1)
        };
    }
    /**
     * Normalizes plugin name
     */
    static normalizePluginName(name) {
        return name.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    }
    /**
     * Checks if plugin name is valid
     */
    static isValidPluginName(name) {
        const nameRegex = /^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$/;
        return nameRegex.test(name) && name.length >= 1 && name.length <= 50;
    }
    /**
     * Deep clones an object
     */
    static deepClone(obj) {
        if (obj === null || typeof obj !== 'object') {
            return obj;
        }
        if (obj instanceof Date) {
            return new Date(obj.getTime());
        }
        if (obj instanceof Array) {
            return obj.map(item => this.deepClone(item));
        }
        if (typeof obj === 'object') {
            const cloned = {};
            Object.keys(obj).forEach(key => {
                cloned[key] = this.deepClone(obj[key]);
            });
            return cloned;
        }
        return obj;
    }
    /**
     * Debounces a function
     */
    static debounce(func, wait) {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }
    /**
     * Throttles a function
     */
    static throttle(func, limit) {
        let inThrottle;
        return (...args) => {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
    /**
     * Creates a timeout promise
     */
    static timeout(ms) {
        return new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Timeout')), ms);
        });
    }
    /**
     * Retries a function with exponential backoff
     */
    static async retry(fn, maxRetries = 3, baseDelay = 1000) {
        let lastError;
        for (let i = 0; i <= maxRetries; i++) {
            try {
                return await fn();
            }
            catch (error) {
                lastError = error;
                if (i === maxRetries) {
                    throw lastError;
                }
                const delay = baseDelay * Math.pow(2, i);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
        throw lastError;
    }
    /**
     * Measures execution time of a function
     */
    static async measureTime(fn) {
        const start = Date.now();
        const result = await fn();
        const duration = Date.now() - start;
        return { result, duration };
    }
    /**
     * Converts bytes to human readable format
     */
    static formatBytes(bytes) {
        if (bytes === 0)
            return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    /**
     * Generates a simple hash for a string
     */
    static simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash).toString(36);
    }
}
exports.PluginUtils = PluginUtils;
/**
 * Plugin utility functions for common operations
 */
exports.pluginUtils = {
    validate: PluginUtils.validatePluginConfig,
    sanitize: PluginUtils.sanitizeConfig,
    merge: PluginUtils.mergeConfigs,
    compareVersions: PluginUtils.compareVersions,
    satisfiesVersion: PluginUtils.satisfiesVersion,
    createError: PluginUtils.createError,
    formatError: PluginUtils.formatError,
    generateId: PluginUtils.generatePluginId,
    parseId: PluginUtils.parsePluginId,
    normalizeName: PluginUtils.normalizePluginName,
    isValidName: PluginUtils.isValidPluginName,
    deepClone: PluginUtils.deepClone,
    debounce: PluginUtils.debounce,
    throttle: PluginUtils.throttle,
    timeout: PluginUtils.timeout,
    retry: PluginUtils.retry,
    measureTime: PluginUtils.measureTime,
    formatBytes: PluginUtils.formatBytes,
    hash: PluginUtils.simpleHash
};
//# sourceMappingURL=plugin-utils.js.map