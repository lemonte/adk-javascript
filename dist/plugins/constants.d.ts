/**
 * Constants for the plugin system
 */
import { PluginHook, PluginManagerConfig } from './types';
/**
 * Available plugin hooks
 */
export declare const PLUGIN_HOOKS: PluginHook[];
/**
 * Plugin execution priorities
 */
export declare const PLUGIN_PRIORITIES: {
    readonly HIGHEST: 1000;
    readonly HIGH: 750;
    readonly NORMAL: 500;
    readonly LOW: 250;
    readonly LOWEST: 1;
};
/**
 * Plugin event types
 */
export declare const PLUGIN_EVENTS: {
    readonly PLUGIN_LOADED: "plugin_loaded";
    readonly PLUGIN_UNLOADED: "plugin_unloaded";
    readonly PLUGIN_ENABLED: "plugin_enabled";
    readonly PLUGIN_DISABLED: "plugin_disabled";
    readonly PLUGIN_ERROR: "plugin_error";
    readonly PLUGIN_WARNING: "plugin_warning";
    readonly HOOK_EXECUTED: "hook_executed";
    readonly HOOK_FAILED: "hook_failed";
};
/**
 * Default plugin manager configuration
 */
export declare const DEFAULT_PLUGIN_CONFIG: PluginManagerConfig;
/**
 * Plugin lifecycle phases
 */
export declare const PLUGIN_LIFECYCLE: {
    readonly INITIALIZE: "initialize";
    readonly CONFIGURE: "configure";
    readonly ACTIVATE: "activate";
    readonly DEACTIVATE: "deactivate";
    readonly DESTROY: "destroy";
};
/**
 * Plugin categories
 */
export declare const PLUGIN_CATEGORIES: {
    readonly AUTHENTICATION: "authentication";
    readonly AUTHORIZATION: "authorization";
    readonly CACHING: "caching";
    readonly LOGGING: "logging";
    readonly METRICS: "metrics";
    readonly MONITORING: "monitoring";
    readonly SECURITY: "security";
    readonly VALIDATION: "validation";
    readonly TRANSFORMATION: "transformation";
    readonly INTEGRATION: "integration";
    readonly UTILITY: "utility";
    readonly CUSTOM: "custom";
};
/**
 * Plugin error codes
 */
export declare const PLUGIN_ERROR_CODES: {
    readonly PLUGIN_NOT_FOUND: "PLUGIN_NOT_FOUND";
    readonly PLUGIN_LOAD_FAILED: "PLUGIN_LOAD_FAILED";
    readonly PLUGIN_INIT_FAILED: "PLUGIN_INIT_FAILED";
    readonly PLUGIN_CONFIG_INVALID: "PLUGIN_CONFIG_INVALID";
    readonly PLUGIN_DEPENDENCY_MISSING: "PLUGIN_DEPENDENCY_MISSING";
    readonly PLUGIN_HOOK_FAILED: "PLUGIN_HOOK_FAILED";
    readonly PLUGIN_TIMEOUT: "PLUGIN_TIMEOUT";
    readonly PLUGIN_PERMISSION_DENIED: "PLUGIN_PERMISSION_DENIED";
    readonly PLUGIN_VERSION_MISMATCH: "PLUGIN_VERSION_MISMATCH";
    readonly PLUGIN_CIRCULAR_DEPENDENCY: "PLUGIN_CIRCULAR_DEPENDENCY";
};
/**
 * Plugin security levels
 */
export declare const PLUGIN_SECURITY_LEVELS: {
    readonly TRUSTED: "trusted";
    readonly SANDBOXED: "sandboxed";
    readonly RESTRICTED: "restricted";
    readonly UNTRUSTED: "untrusted";
};
/**
 * Plugin installation sources
 */
export declare const PLUGIN_SOURCES: {
    readonly NPM: "npm";
    readonly GIT: "git";
    readonly LOCAL: "local";
    readonly URL: "url";
};
/**
 * Default plugin timeouts (in milliseconds)
 */
export declare const PLUGIN_TIMEOUTS: {
    readonly INITIALIZATION: 10000;
    readonly HOOK_EXECUTION: 5000;
    readonly CLEANUP: 3000;
    readonly HEALTH_CHECK: 1000;
};
/**
 * Plugin cache settings
 */
export declare const PLUGIN_CACHE_SETTINGS: {
    readonly DEFAULT_TTL: 300000;
    readonly MAX_SIZE: 1000;
    readonly CLEANUP_INTERVAL: 60000;
};
/**
 * Plugin validation rules
 */
export declare const PLUGIN_VALIDATION_RULES: {
    readonly NAME_PATTERN: RegExp;
    readonly VERSION_PATTERN: RegExp;
    readonly MIN_NAME_LENGTH: 3;
    readonly MAX_NAME_LENGTH: 50;
    readonly MAX_DESCRIPTION_LENGTH: 500;
    readonly ALLOWED_FILE_EXTENSIONS: readonly [".js", ".ts", ".mjs"];
    readonly REQUIRED_FIELDS: readonly ["name", "version"];
};
/**
 * Plugin metrics collection intervals
 */
export declare const PLUGIN_METRICS_INTERVALS: {
    readonly COLLECTION: 60000;
    readonly AGGREGATION: 300000;
    readonly CLEANUP: 3600000;
};
//# sourceMappingURL=constants.d.ts.map