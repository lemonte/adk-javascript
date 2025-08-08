/**
 * Base plugin class for ADK JavaScript
 */
import { PluginConfig, PluginContext, PluginHook, PluginResult, PluginValidationResult, PluginMetrics, PluginCache, InvocationContext, ToolContext, ModelContext, AgentContext } from './types';
/**
 * Abstract base class for all ADK plugins
 */
export declare abstract class BasePlugin {
    protected config: PluginConfig;
    protected enabled: boolean;
    protected initialized: boolean;
    protected metrics: Map<PluginHook, PluginMetrics>;
    protected cache?: PluginCache;
    protected logger?: Console;
    constructor(config: PluginConfig);
    /**
     * Get plugin name
     */
    getName(): string;
    /**
     * Get plugin version
     */
    getVersion(): string;
    /**
     * Get plugin description
     */
    getDescription(): string;
    /**
     * Get plugin priority
     */
    getPriority(): number;
    /**
     * Get plugin dependencies
     */
    getDependencies(): string[];
    /**
     * Get plugin hooks
     */
    getHooks(): PluginHook[];
    /**
     * Check if plugin is enabled
     */
    isEnabled(): boolean;
    /**
     * Check if plugin is initialized
     */
    isInitialized(): boolean;
    /**
     * Enable the plugin
     */
    enable(): void;
    /**
     * Disable the plugin
     */
    disable(): void;
    /**
     * Get plugin configuration
     */
    getConfig(): PluginConfig;
    /**
     * Update plugin configuration
     */
    updateConfig(updates: Partial<PluginConfig>): void;
    /**
     * Set plugin cache
     */
    setCache(cache: PluginCache): void;
    /**
     * Set plugin logger
     */
    setLogger(logger: Console): void;
    /**
     * Initialize the plugin
     */
    initialize(): Promise<void>;
    /**
     * Destroy the plugin
     */
    destroy(): Promise<void>;
    /**
     * Validate plugin configuration
     */
    validateConfig(config: PluginConfig): PluginValidationResult;
    /**
     * Get plugin metrics
     */
    getMetrics(): Map<PluginHook, PluginMetrics>;
    /**
     * Record execution metrics
     */
    protected recordMetrics(hookName: PluginHook, executionTime: number, success: boolean): void;
    /**
     * Log message with plugin context
     */
    protected log(level: 'debug' | 'info' | 'warn' | 'error', message: string, ...args: any[]): void;
    /**
     * Execute a hook with error handling and metrics
     */
    protected executeHook<T>(hookName: PluginHook, context: PluginContext, data: T, hookFunction: (context: PluginContext, data: T) => Promise<T | void> | T | void): Promise<PluginResult<T>>;
    protected onInitialize(): Promise<void>;
    protected onDestroy(): Promise<void>;
    beforeRunCallback(context: InvocationContext): Promise<InvocationContext | void>;
    afterRunCallback(context: InvocationContext): Promise<InvocationContext | void>;
    onEventCallback(context: PluginContext, event: any): Promise<any>;
    beforeAgentCallback(context: AgentContext): Promise<AgentContext | void>;
    afterAgentCallback(context: AgentContext): Promise<AgentContext | void>;
    beforeToolCallback(context: ToolContext): Promise<ToolContext | void>;
    afterToolCallback(context: ToolContext): Promise<ToolContext | void>;
    beforeModelCallback(context: ModelContext): Promise<ModelContext | void>;
    afterModelCallback(context: ModelContext): Promise<ModelContext | void>;
    onToolErrorCallback(context: ToolContext): Promise<ToolContext | void>;
    onModelErrorCallback(context: ModelContext): Promise<ModelContext | void>;
    onAgentErrorCallback(context: AgentContext): Promise<AgentContext | void>;
    /**
     * Health check for the plugin
     */
    healthCheck(): Promise<{
        healthy: boolean;
        message?: string;
        details?: Record<string, any>;
    }>;
    /**
     * Custom health check implementation (to be overridden by subclasses)
     */
    protected performHealthCheck(): Promise<Record<string, any>>;
    /**
     * Get plugin information
     */
    getInfo(): {
        name: string;
        version: string;
        description: string;
        enabled: boolean;
        initialized: boolean;
        priority: number;
        dependencies: string[];
        hooks: PluginHook[];
        metadata?: any;
    };
}
//# sourceMappingURL=base-plugin.d.ts.map