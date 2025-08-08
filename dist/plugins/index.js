"use strict";
/**
 * Plugin system for ADK JavaScript
 *
 * This module provides a plugin architecture that allows extending
 * ADK functionality through custom plugins.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pluginUtils = exports.PluginUtils = exports.SecurityPlugin = exports.RateLimitPlugin = exports.RetryPlugin = exports.ValidationPlugin = exports.CachingPlugin = exports.MetricsPlugin = exports.LoggingPlugin = exports.PluginManager = exports.BasePlugin = void 0;
// Core plugin system exports
var base_plugin_1 = require("./base-plugin");
Object.defineProperty(exports, "BasePlugin", { enumerable: true, get: function () { return base_plugin_1.BasePlugin; } });
var plugin_manager_1 = require("./plugin-manager");
Object.defineProperty(exports, "PluginManager", { enumerable: true, get: function () { return plugin_manager_1.PluginManager; } });
// Built-in plugins
var logging_plugin_1 = require("./logging-plugin");
Object.defineProperty(exports, "LoggingPlugin", { enumerable: true, get: function () { return logging_plugin_1.LoggingPlugin; } });
var metrics_plugin_1 = require("./metrics-plugin");
Object.defineProperty(exports, "MetricsPlugin", { enumerable: true, get: function () { return metrics_plugin_1.MetricsPlugin; } });
var caching_plugin_1 = require("./caching-plugin");
Object.defineProperty(exports, "CachingPlugin", { enumerable: true, get: function () { return caching_plugin_1.CachingPlugin; } });
var validation_plugin_1 = require("./validation-plugin");
Object.defineProperty(exports, "ValidationPlugin", { enumerable: true, get: function () { return validation_plugin_1.ValidationPlugin; } });
var retry_plugin_1 = require("./retry-plugin");
Object.defineProperty(exports, "RetryPlugin", { enumerable: true, get: function () { return retry_plugin_1.RetryPlugin; } });
var rate_limit_plugin_1 = require("./rate-limit-plugin");
Object.defineProperty(exports, "RateLimitPlugin", { enumerable: true, get: function () { return rate_limit_plugin_1.RateLimitPlugin; } });
var security_plugin_1 = require("./security-plugin");
Object.defineProperty(exports, "SecurityPlugin", { enumerable: true, get: function () { return security_plugin_1.SecurityPlugin; } });
// Plugin utilities
var plugin_utils_1 = require("./plugin-utils");
Object.defineProperty(exports, "PluginUtils", { enumerable: true, get: function () { return plugin_utils_1.PluginUtils; } });
Object.defineProperty(exports, "pluginUtils", { enumerable: true, get: function () { return plugin_utils_1.pluginUtils; } });
// Types and interfaces
__exportStar(require("./types"), exports);
// Constants
__exportStar(require("./constants"), exports);
//# sourceMappingURL=index.js.map