"use strict";
/**
 * Plugin manager for ADK JavaScript
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PluginManager = void 0;
const events_1 = require("events");
const constants_1 = require("./constants");
/**
 * Plugin manager class that handles plugin lifecycle and execution
 */
class PluginManager extends events_1.EventEmitter {
    constructor(config = {}) {
        super();
        this.loadOrder = [];
        this.initialized = false;
        this.config = { ...constants_1.DEFAULT_PLUGIN_CONFIG, ...config };
        this.registry = {
            plugins: new Map(),
            hooks: new Map(),
            metadata: new Map(),
            dependencies: new Map(),
            loadOrder: []
        };
        // Initialize hook maps
        for (const hook of constants_1.PLUGIN_HOOKS) {
            this.registry.hooks.set(hook, []);
        }
    }
    /**
     * Set logger for the plugin manager
     */
    setLogger(logger) {
        this.logger = logger;
    }
    /**
     * Initialize the plugin manager
     */
    async initialize() {
        if (this.initialized) {
            return;
        }
        try {
            this.log('info', 'Initializing plugin manager...');
            // Initialize all loaded plugins
            for (const pluginName of this.loadOrder) {
                const plugin = this.registry.plugins.get(pluginName);
                if (plugin && !plugin.isInitialized()) {
                    await this.initializePlugin(plugin);
                }
            }
            this.initialized = true;
            this.emit(constants_1.PLUGIN_EVENTS.PLUGIN_LOADED, { manager: this });
            this.log('info', 'Plugin manager initialized successfully');
        }
        catch (error) {
            this.log('error', 'Failed to initialize plugin manager:', error);
            throw error;
        }
    }
    /**
     * Destroy the plugin manager
     */
    async destroy() {
        if (!this.initialized) {
            return;
        }
        try {
            this.log('info', 'Destroying plugin manager...');
            // Destroy all plugins in reverse order
            const reverseOrder = [...this.loadOrder].reverse();
            for (const pluginName of reverseOrder) {
                const plugin = this.registry.plugins.get(pluginName);
                if (plugin && plugin.isInitialized()) {
                    await this.destroyPlugin(plugin);
                }
            }
            // Clear registry
            this.registry.plugins.clear();
            this.registry.hooks.clear();
            this.registry.metadata.clear();
            this.registry.dependencies.clear();
            this.loadOrder = [];
            this.registry.loadOrder = [];
            this.initialized = false;
            this.emit(constants_1.PLUGIN_EVENTS.PLUGIN_UNLOADED, { manager: this });
            this.log('info', 'Plugin manager destroyed successfully');
        }
        catch (error) {
            this.log('error', 'Failed to destroy plugin manager:', error);
            throw error;
        }
    }
    /**
     * Register a plugin
     */
    async registerPlugin(plugin) {
        const name = plugin.getName();
        if (this.registry.plugins.has(name)) {
            throw new Error(`Plugin '${name}' is already registered`);
        }
        try {
            this.log('info', `Registering plugin: ${name}`);
            // Validate dependencies
            await this.validateDependencies(plugin);
            // Register plugin
            this.registry.plugins.set(name, plugin);
            this.registry.metadata.set(name, plugin.getConfig().metadata || {});
            this.registry.dependencies.set(name, plugin.getDependencies());
            // Register hooks
            for (const hook of plugin.getHooks()) {
                const hookPlugins = this.registry.hooks.get(hook) || [];
                hookPlugins.push(plugin);
                // Sort by priority (higher priority first)
                hookPlugins.sort((a, b) => b.getPriority() - a.getPriority());
                this.registry.hooks.set(hook, hookPlugins);
            }
            // Update load order
            this.updateLoadOrder();
            // Set logger for plugin
            if (this.logger) {
                plugin.setLogger(this.logger);
            }
            // Initialize if manager is already initialized
            if (this.initialized) {
                await this.initializePlugin(plugin);
            }
            this.emit(constants_1.PLUGIN_EVENTS.PLUGIN_LOADED, { plugin, manager: this });
            this.log('info', `Plugin '${name}' registered successfully`);
        }
        catch (error) {
            this.log('error', `Failed to register plugin '${name}':`, error);
            throw error;
        }
    }
    /**
     * Unregister a plugin
     */
    async unregisterPlugin(name) {
        const plugin = this.registry.plugins.get(name);
        if (!plugin) {
            throw new Error(`Plugin '${name}' is not registered`);
        }
        try {
            this.log('info', `Unregistering plugin: ${name}`);
            // Check for dependents
            const dependents = this.findDependents(name);
            if (dependents.length > 0) {
                throw new Error(`Cannot unregister plugin '${name}' because it has dependents: ${dependents.join(', ')}`);
            }
            // Destroy plugin if initialized
            if (plugin.isInitialized()) {
                await this.destroyPlugin(plugin);
            }
            // Remove from hooks
            for (const hook of plugin.getHooks()) {
                const hookPlugins = this.registry.hooks.get(hook) || [];
                const index = hookPlugins.indexOf(plugin);
                if (index !== -1) {
                    hookPlugins.splice(index, 1);
                    this.registry.hooks.set(hook, hookPlugins);
                }
            }
            // Remove from registry
            this.registry.plugins.delete(name);
            this.registry.metadata.delete(name);
            this.registry.dependencies.delete(name);
            // Update load order
            this.updateLoadOrder();
            this.emit(constants_1.PLUGIN_EVENTS.PLUGIN_UNLOADED, { plugin, manager: this });
            this.log('info', `Plugin '${name}' unregistered successfully`);
        }
        catch (error) {
            this.log('error', `Failed to unregister plugin '${name}':`, error);
            throw error;
        }
    }
    /**
     * Get a registered plugin
     */
    getPlugin(name) {
        return this.registry.plugins.get(name);
    }
    /**
     * Get all registered plugins
     */
    getPlugins() {
        return Array.from(this.registry.plugins.values());
    }
    /**
     * Get plugins by hook
     */
    getPluginsByHook(hook) {
        return this.registry.hooks.get(hook) || [];
    }
    /**
     * Check if a plugin is registered
     */
    hasPlugin(name) {
        return this.registry.plugins.has(name);
    }
    /**
     * Enable a plugin
     */
    async enablePlugin(name) {
        const plugin = this.registry.plugins.get(name);
        if (!plugin) {
            throw new Error(`Plugin '${name}' is not registered`);
        }
        if (plugin.isEnabled()) {
            return;
        }
        try {
            plugin.enable();
            if (this.initialized && !plugin.isInitialized()) {
                await this.initializePlugin(plugin);
            }
            this.emit(constants_1.PLUGIN_EVENTS.PLUGIN_ENABLED, { plugin, manager: this });
            this.log('info', `Plugin '${name}' enabled`);
        }
        catch (error) {
            this.log('error', `Failed to enable plugin '${name}':`, error);
            throw error;
        }
    }
    /**
     * Disable a plugin
     */
    async disablePlugin(name) {
        const plugin = this.registry.plugins.get(name);
        if (!plugin) {
            throw new Error(`Plugin '${name}' is not registered`);
        }
        if (!plugin.isEnabled()) {
            return;
        }
        try {
            plugin.disable();
            this.emit(constants_1.PLUGIN_EVENTS.PLUGIN_DISABLED, { plugin, manager: this });
            this.log('info', `Plugin '${name}' disabled`);
        }
        catch (error) {
            this.log('error', `Failed to disable plugin '${name}':`, error);
            throw error;
        }
    }
    /**
     * Execute before_run callbacks
     */
    async runBeforeRunCallback(context) {
        return this.executeHookCallbacks('before_run', context, (plugin, ctx) => plugin.beforeRunCallback(ctx));
    }
    /**
     * Execute after_run callbacks
     */
    async runAfterRunCallback(context) {
        return this.executeHookCallbacks('after_run', context, (plugin, ctx) => plugin.afterRunCallback(ctx));
    }
    /**
     * Execute on_event callbacks
     */
    async runOnEventCallback(context, event) {
        return this.executeHookCallbacks('on_event', event, (plugin, data) => plugin.onEventCallback(context, data));
    }
    /**
     * Execute before_agent callbacks
     */
    async runBeforeAgentCallback(context) {
        return this.executeHookCallbacks('before_agent', context, (plugin, ctx) => plugin.beforeAgentCallback(ctx));
    }
    /**
     * Execute after_agent callbacks
     */
    async runAfterAgentCallback(context) {
        return this.executeHookCallbacks('after_agent', context, (plugin, ctx) => plugin.afterAgentCallback(ctx));
    }
    /**
     * Execute before_tool callbacks
     */
    async runBeforeToolCallback(context) {
        return this.executeHookCallbacks('before_tool', context, (plugin, ctx) => plugin.beforeToolCallback(ctx));
    }
    /**
     * Execute after_tool callbacks
     */
    async runAfterToolCallback(context) {
        return this.executeHookCallbacks('after_tool', context, (plugin, ctx) => plugin.afterToolCallback(ctx));
    }
    /**
     * Execute before_model callbacks
     */
    async runBeforeModelCallback(context) {
        return this.executeHookCallbacks('before_model', context, (plugin, ctx) => plugin.beforeModelCallback(ctx));
    }
    /**
     * Execute after_model callbacks
     */
    async runAfterModelCallback(context) {
        return this.executeHookCallbacks('after_model', context, (plugin, ctx) => plugin.afterModelCallback(ctx));
    }
    /**
     * Execute on_tool_error callbacks
     */
    async runOnToolErrorCallback(context) {
        return this.executeHookCallbacks('on_tool_error', context, (plugin, ctx) => plugin.onToolErrorCallback(ctx));
    }
    /**
     * Execute on_model_error callbacks
     */
    async runOnModelErrorCallback(context) {
        return this.executeHookCallbacks('on_model_error', context, (plugin, ctx) => plugin.onModelErrorCallback(ctx));
    }
    /**
     * Execute on_agent_error callbacks
     */
    async runOnAgentErrorCallback(context) {
        return this.executeHookCallbacks('on_agent_error', context, (plugin, ctx) => plugin.onAgentErrorCallback(ctx));
    }
    /**
     * Get plugin metrics
     */
    getPluginMetrics(name) {
        const metrics = new Map();
        if (name) {
            const plugin = this.registry.plugins.get(name);
            if (plugin) {
                metrics.set(name, plugin.getMetrics());
            }
        }
        else {
            for (const [pluginName, plugin] of this.registry.plugins) {
                metrics.set(pluginName, plugin.getMetrics());
            }
        }
        return metrics;
    }
    /**
     * Get plugin manager status
     */
    getStatus() {
        const plugins = Array.from(this.registry.plugins.values());
        const enabledPlugins = plugins.filter(p => p.isEnabled()).length;
        const disabledPlugins = plugins.length - enabledPlugins;
        const hooks = {};
        for (const [hook, hookPlugins] of this.registry.hooks) {
            hooks[hook] = hookPlugins.length;
        }
        return {
            initialized: this.initialized,
            pluginCount: plugins.length,
            enabledPlugins,
            disabledPlugins,
            loadOrder: [...this.loadOrder],
            hooks
        };
    }
    /**
     * Perform health check on all plugins
     */
    async healthCheck() {
        const results = {};
        for (const [name, plugin] of this.registry.plugins) {
            try {
                results[name] = await plugin.healthCheck();
            }
            catch (error) {
                results[name] = {
                    healthy: false,
                    message: `Health check failed: ${error instanceof Error ? error.message : String(error)}`
                };
            }
        }
        return results;
    }
    // Private methods
    async initializePlugin(plugin) {
        try {
            const timeout = this.config.timeout || constants_1.PLUGIN_TIMEOUTS.INITIALIZATION;
            await this.withTimeout(plugin.initialize(), timeout);
            this.log('info', `Plugin '${plugin.getName()}' initialized`);
        }
        catch (error) {
            const pluginError = this.createPluginError(plugin.getName(), 'before_run', error instanceof Error ? error : new Error(String(error)), constants_1.PLUGIN_ERROR_CODES.PLUGIN_INIT_FAILED);
            this.emit(constants_1.PLUGIN_EVENTS.PLUGIN_ERROR, { plugin, error: pluginError, manager: this });
            if (this.config.errorHandling === 'strict') {
                throw pluginError;
            }
            else {
                this.log('warn', `Plugin '${plugin.getName()}' initialization failed but continuing due to lenient error handling:`, error);
            }
        }
    }
    async destroyPlugin(plugin) {
        try {
            const timeout = this.config.timeout || constants_1.PLUGIN_TIMEOUTS.CLEANUP;
            await this.withTimeout(plugin.destroy(), timeout);
            this.log('info', `Plugin '${plugin.getName()}' destroyed`);
        }
        catch (error) {
            this.log('warn', `Plugin '${plugin.getName()}' destruction failed:`, error);
        }
    }
    async executeHookCallbacks(hook, data, callback) {
        const plugins = this.registry.hooks.get(hook) || [];
        let currentData = data;
        for (const plugin of plugins) {
            if (!plugin.isEnabled() || !plugin.isInitialized()) {
                continue;
            }
            try {
                const timeout = this.config.timeout || constants_1.PLUGIN_TIMEOUTS.HOOK_EXECUTION;
                const result = await this.withTimeout(callback(plugin, currentData), timeout);
                if (result !== undefined) {
                    currentData = result;
                }
                this.emit(constants_1.PLUGIN_EVENTS.HOOK_EXECUTED, {
                    plugin,
                    hook,
                    data: currentData,
                    manager: this
                });
            }
            catch (error) {
                const pluginError = this.createPluginError(plugin.getName(), hook, error instanceof Error ? error : new Error(String(error)));
                this.emit(constants_1.PLUGIN_EVENTS.HOOK_FAILED, {
                    plugin,
                    hook,
                    error: pluginError,
                    manager: this
                });
                if (this.config.errorHandling === 'strict') {
                    throw pluginError;
                }
                else {
                    this.log('warn', `Plugin '${plugin.getName()}' hook '${hook}' failed but continuing:`, error);
                }
            }
        }
        return currentData;
    }
    async validateDependencies(plugin) {
        const dependencies = plugin.getDependencies();
        for (const dependency of dependencies) {
            if (!this.registry.plugins.has(dependency)) {
                throw new Error(`Plugin '${plugin.getName()}' depends on '${dependency}' which is not registered`);
            }
        }
        // Check for circular dependencies
        this.checkCircularDependencies(plugin.getName(), dependencies);
    }
    checkCircularDependencies(pluginName, dependencies, visited = new Set()) {
        if (visited.has(pluginName)) {
            throw new Error(`Circular dependency detected involving plugin '${pluginName}'`);
        }
        visited.add(pluginName);
        for (const dependency of dependencies) {
            const depDependencies = this.registry.dependencies.get(dependency) || [];
            this.checkCircularDependencies(dependency, depDependencies, new Set(visited));
        }
    }
    updateLoadOrder() {
        const visited = new Set();
        const visiting = new Set();
        const order = [];
        const visit = (pluginName) => {
            if (visiting.has(pluginName)) {
                throw new Error(`Circular dependency detected involving plugin '${pluginName}'`);
            }
            if (visited.has(pluginName)) {
                return;
            }
            visiting.add(pluginName);
            const dependencies = this.registry.dependencies.get(pluginName) || [];
            for (const dependency of dependencies) {
                visit(dependency);
            }
            visiting.delete(pluginName);
            visited.add(pluginName);
            order.push(pluginName);
        };
        for (const pluginName of this.registry.plugins.keys()) {
            visit(pluginName);
        }
        this.loadOrder = order;
        this.registry.loadOrder = order;
    }
    findDependents(pluginName) {
        const dependents = [];
        for (const [name, dependencies] of this.registry.dependencies) {
            if (dependencies.includes(pluginName)) {
                dependents.push(name);
            }
        }
        return dependents;
    }
    createPluginError(pluginName, hookName, originalError, code) {
        const error = new Error(`Plugin '${pluginName}' hook '${hookName}' failed: ${originalError.message}`);
        error.pluginName = pluginName;
        error.hookName = hookName;
        error.originalError = originalError;
        error.code = code || constants_1.PLUGIN_ERROR_CODES.PLUGIN_HOOK_FAILED;
        error.severity = 'medium';
        return error;
    }
    async withTimeout(promise, timeoutMs) {
        return Promise.race([
            promise,
            new Promise((_, reject) => {
                setTimeout(() => {
                    reject(new Error(`Operation timed out after ${timeoutMs}ms`));
                }, timeoutMs);
            })
        ]);
    }
    log(level, message, ...args) {
        if (this.logger && this.config.logging?.enabled) {
            const prefix = '[PluginManager]';
            switch (level) {
                case 'debug':
                    if (this.config.logging.level === 'debug') {
                        this.logger.debug(prefix, message, ...args);
                    }
                    break;
                case 'info':
                    if (['debug', 'info'].includes(this.config.logging.level || 'info')) {
                        this.logger.info(prefix, message, ...args);
                    }
                    break;
                case 'warn':
                    if (['debug', 'info', 'warn'].includes(this.config.logging.level || 'info')) {
                        this.logger.warn(prefix, message, ...args);
                    }
                    break;
                case 'error':
                    this.logger.error(prefix, message, ...args);
                    break;
            }
        }
    }
}
exports.PluginManager = PluginManager;
//# sourceMappingURL=plugin-manager.js.map