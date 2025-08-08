"use strict";
/**
 * Constants for the plugin system
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PLUGIN_METRICS_INTERVALS = exports.PLUGIN_VALIDATION_RULES = exports.PLUGIN_CACHE_SETTINGS = exports.PLUGIN_TIMEOUTS = exports.PLUGIN_SOURCES = exports.PLUGIN_SECURITY_LEVELS = exports.PLUGIN_ERROR_CODES = exports.PLUGIN_CATEGORIES = exports.PLUGIN_LIFECYCLE = exports.DEFAULT_PLUGIN_CONFIG = exports.PLUGIN_EVENTS = exports.PLUGIN_PRIORITIES = exports.PLUGIN_HOOKS = void 0;
/**
 * Available plugin hooks
 */
exports.PLUGIN_HOOKS = [
    'before_run',
    'after_run',
    'on_event',
    'before_agent',
    'after_agent',
    'before_tool',
    'after_tool',
    'before_model',
    'after_model',
    'on_tool_error',
    'on_model_error',
    'on_agent_error',
    'on_validation_error',
    'on_retry',
    'on_rate_limit',
    'on_cache_hit',
    'on_cache_miss'
];
/**
 * Plugin execution priorities
 */
exports.PLUGIN_PRIORITIES = {
    HIGHEST: 1000,
    HIGH: 750,
    NORMAL: 500,
    LOW: 250,
    LOWEST: 1
};
/**
 * Plugin event types
 */
exports.PLUGIN_EVENTS = {
    PLUGIN_LOADED: 'plugin_loaded',
    PLUGIN_UNLOADED: 'plugin_unloaded',
    PLUGIN_ENABLED: 'plugin_enabled',
    PLUGIN_DISABLED: 'plugin_disabled',
    PLUGIN_ERROR: 'plugin_error',
    PLUGIN_WARNING: 'plugin_warning',
    HOOK_EXECUTED: 'hook_executed',
    HOOK_FAILED: 'hook_failed'
};
/**
 * Default plugin manager configuration
 */
exports.DEFAULT_PLUGIN_CONFIG = {
    autoLoad: true,
    enableHotReload: false,
    maxRetries: 3,
    timeout: 30000, // 30 seconds
    errorHandling: 'lenient',
    logging: {
        enabled: true,
        level: 'info',
        includeContext: false
    },
    performance: {
        trackMetrics: true,
        maxExecutionTime: 5000, // 5 seconds
        memoryThreshold: 100 * 1024 * 1024 // 100MB
    }
};
/**
 * Plugin lifecycle phases
 */
exports.PLUGIN_LIFECYCLE = {
    INITIALIZE: 'initialize',
    CONFIGURE: 'configure',
    ACTIVATE: 'activate',
    DEACTIVATE: 'deactivate',
    DESTROY: 'destroy'
};
/**
 * Plugin categories
 */
exports.PLUGIN_CATEGORIES = {
    AUTHENTICATION: 'authentication',
    AUTHORIZATION: 'authorization',
    CACHING: 'caching',
    LOGGING: 'logging',
    METRICS: 'metrics',
    MONITORING: 'monitoring',
    SECURITY: 'security',
    VALIDATION: 'validation',
    TRANSFORMATION: 'transformation',
    INTEGRATION: 'integration',
    UTILITY: 'utility',
    CUSTOM: 'custom'
};
/**
 * Plugin error codes
 */
exports.PLUGIN_ERROR_CODES = {
    PLUGIN_NOT_FOUND: 'PLUGIN_NOT_FOUND',
    PLUGIN_LOAD_FAILED: 'PLUGIN_LOAD_FAILED',
    PLUGIN_INIT_FAILED: 'PLUGIN_INIT_FAILED',
    PLUGIN_CONFIG_INVALID: 'PLUGIN_CONFIG_INVALID',
    PLUGIN_DEPENDENCY_MISSING: 'PLUGIN_DEPENDENCY_MISSING',
    PLUGIN_HOOK_FAILED: 'PLUGIN_HOOK_FAILED',
    PLUGIN_TIMEOUT: 'PLUGIN_TIMEOUT',
    PLUGIN_PERMISSION_DENIED: 'PLUGIN_PERMISSION_DENIED',
    PLUGIN_VERSION_MISMATCH: 'PLUGIN_VERSION_MISMATCH',
    PLUGIN_CIRCULAR_DEPENDENCY: 'PLUGIN_CIRCULAR_DEPENDENCY'
};
/**
 * Plugin security levels
 */
exports.PLUGIN_SECURITY_LEVELS = {
    TRUSTED: 'trusted',
    SANDBOXED: 'sandboxed',
    RESTRICTED: 'restricted',
    UNTRUSTED: 'untrusted'
};
/**
 * Plugin installation sources
 */
exports.PLUGIN_SOURCES = {
    NPM: 'npm',
    GIT: 'git',
    LOCAL: 'local',
    URL: 'url'
};
/**
 * Default plugin timeouts (in milliseconds)
 */
exports.PLUGIN_TIMEOUTS = {
    INITIALIZATION: 10000, // 10 seconds
    HOOK_EXECUTION: 5000, // 5 seconds
    CLEANUP: 3000, // 3 seconds
    HEALTH_CHECK: 1000 // 1 second
};
/**
 * Plugin cache settings
 */
exports.PLUGIN_CACHE_SETTINGS = {
    DEFAULT_TTL: 300000, // 5 minutes
    MAX_SIZE: 1000, // Maximum number of cached items
    CLEANUP_INTERVAL: 60000 // 1 minute
};
/**
 * Plugin validation rules
 */
exports.PLUGIN_VALIDATION_RULES = {
    NAME_PATTERN: /^[a-zA-Z][a-zA-Z0-9_-]*$/,
    VERSION_PATTERN: /^\d+\.\d+\.\d+(-[a-zA-Z0-9-]+)?$/,
    MIN_NAME_LENGTH: 3,
    MAX_NAME_LENGTH: 50,
    MAX_DESCRIPTION_LENGTH: 500,
    ALLOWED_FILE_EXTENSIONS: ['.js', '.ts', '.mjs'],
    REQUIRED_FIELDS: ['name', 'version']
};
/**
 * Plugin metrics collection intervals
 */
exports.PLUGIN_METRICS_INTERVALS = {
    COLLECTION: 60000, // 1 minute
    AGGREGATION: 300000, // 5 minutes
    CLEANUP: 3600000 // 1 hour
};
//# sourceMappingURL=constants.js.map