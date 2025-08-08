/**
 * Plugin manager for ADK JavaScript
 */
import { EventEmitter } from 'events';
import { PluginContext, PluginHook, PluginManagerConfig, PluginMetrics, InvocationContext, ToolContext, ModelContext, AgentContext } from './types';
import { BasePlugin } from './base-plugin';
/**
 * Plugin manager class that handles plugin lifecycle and execution
 */
export declare class PluginManager extends EventEmitter {
    private config;
    private registry;
    private loadOrder;
    private initialized;
    private logger?;
    constructor(config?: Partial<PluginManagerConfig>);
    /**
     * Set logger for the plugin manager
     */
    setLogger(logger: Console): void;
    /**
     * Initialize the plugin manager
     */
    initialize(): Promise<void>;
    /**
     * Destroy the plugin manager
     */
    destroy(): Promise<void>;
    /**
     * Register a plugin
     */
    registerPlugin(plugin: BasePlugin): Promise<void>;
    /**
     * Unregister a plugin
     */
    unregisterPlugin(name: string): Promise<void>;
    /**
     * Get a registered plugin
     */
    getPlugin(name: string): BasePlugin | undefined;
    /**
     * Get all registered plugins
     */
    getPlugins(): BasePlugin[];
    /**
     * Get plugins by hook
     */
    getPluginsByHook(hook: PluginHook): BasePlugin[];
    /**
     * Check if a plugin is registered
     */
    hasPlugin(name: string): boolean;
    /**
     * Enable a plugin
     */
    enablePlugin(name: string): Promise<void>;
    /**
     * Disable a plugin
     */
    disablePlugin(name: string): Promise<void>;
    /**
     * Execute before_run callbacks
     */
    runBeforeRunCallback(context: InvocationContext): Promise<InvocationContext>;
    /**
     * Execute after_run callbacks
     */
    runAfterRunCallback(context: InvocationContext): Promise<InvocationContext>;
    /**
     * Execute on_event callbacks
     */
    runOnEventCallback(context: PluginContext, event: any): Promise<any>;
    /**
     * Execute before_agent callbacks
     */
    runBeforeAgentCallback(context: AgentContext): Promise<AgentContext>;
    /**
     * Execute after_agent callbacks
     */
    runAfterAgentCallback(context: AgentContext): Promise<AgentContext>;
    /**
     * Execute before_tool callbacks
     */
    runBeforeToolCallback(context: ToolContext): Promise<ToolContext>;
    /**
     * Execute after_tool callbacks
     */
    runAfterToolCallback(context: ToolContext): Promise<ToolContext>;
    /**
     * Execute before_model callbacks
     */
    runBeforeModelCallback(context: ModelContext): Promise<ModelContext>;
    /**
     * Execute after_model callbacks
     */
    runAfterModelCallback(context: ModelContext): Promise<ModelContext>;
    /**
     * Execute on_tool_error callbacks
     */
    runOnToolErrorCallback(context: ToolContext): Promise<ToolContext>;
    /**
     * Execute on_model_error callbacks
     */
    runOnModelErrorCallback(context: ModelContext): Promise<ModelContext>;
    /**
     * Execute on_agent_error callbacks
     */
    runOnAgentErrorCallback(context: AgentContext): Promise<AgentContext>;
    /**
     * Get plugin metrics
     */
    getPluginMetrics(name?: string): Map<string, Map<PluginHook, PluginMetrics>>;
    /**
     * Get plugin manager status
     */
    getStatus(): {
        initialized: boolean;
        pluginCount: number;
        enabledPlugins: number;
        disabledPlugins: number;
        loadOrder: string[];
        hooks: Record<PluginHook, number>;
    };
    /**
     * Perform health check on all plugins
     */
    healthCheck(): Promise<Record<string, any>>;
    private initializePlugin;
    private destroyPlugin;
    private executeHookCallbacks;
    private validateDependencies;
    private checkCircularDependencies;
    private updateLoadOrder;
    private findDependents;
    private createPluginError;
    private withTimeout;
    private log;
}
//# sourceMappingURL=plugin-manager.d.ts.map