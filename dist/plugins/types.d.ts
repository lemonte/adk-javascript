/**
 * Type definitions for the plugin system
 */
import { BaseTool } from '../tools/base-tool';
import { BaseModel } from '../models/base-model';
import { BaseAgent } from '../agents/base-agent';
/**
 * Plugin configuration interface
 */
export interface PluginConfig {
    name: string;
    version?: string;
    description?: string;
    enabled?: boolean;
    priority?: number;
    dependencies?: string[];
    settings?: Record<string, any>;
    hooks?: PluginHook[];
    metadata?: PluginMetadata;
}
/**
 * Plugin metadata interface
 */
export interface PluginMetadata {
    author?: string;
    license?: string;
    homepage?: string;
    repository?: string;
    keywords?: string[];
    category?: string;
    tags?: string[];
    createdAt?: string;
    updatedAt?: string;
}
/**
 * Plugin hook types
 */
export type PluginHook = 'before_run' | 'after_run' | 'on_event' | 'before_agent' | 'after_agent' | 'before_tool' | 'after_tool' | 'before_model' | 'after_model' | 'on_tool_error' | 'on_model_error' | 'on_agent_error' | 'on_validation_error' | 'on_retry' | 'on_rate_limit' | 'on_cache_hit' | 'on_cache_miss';
/**
 * Plugin lifecycle phases
 */
export type PluginLifecycle = 'initialize' | 'configure' | 'activate' | 'deactivate' | 'destroy';
/**
 * Plugin event types
 */
export type PluginEvent = 'plugin_loaded' | 'plugin_unloaded' | 'plugin_enabled' | 'plugin_disabled' | 'plugin_error' | 'plugin_warning' | 'hook_executed' | 'hook_failed';
/**
 * Context passed to plugin callbacks
 */
export interface PluginContext {
    pluginName: string;
    hookName: PluginHook;
    timestamp: string;
    requestId?: string;
    sessionId?: string;
    userId?: string;
    metadata?: Record<string, any>;
}
/**
 * Invocation context for run-level callbacks
 */
export interface InvocationContext extends PluginContext {
    runId: string;
    agentName?: string;
    startTime: string;
    endTime?: string;
    duration?: number;
    status: 'running' | 'completed' | 'failed' | 'cancelled';
    error?: Error;
    result?: any;
    metrics?: Record<string, number>;
}
/**
 * Tool context for tool-related callbacks
 */
export interface ToolContext extends PluginContext {
    tool: BaseTool;
    toolName: string;
    toolArgs: Record<string, any>;
    toolResult?: any;
    executionTime?: number;
    retryCount?: number;
    error?: Error;
}
/**
 * Model context for model-related callbacks
 */
export interface ModelContext extends PluginContext {
    model: BaseModel;
    modelName: string;
    modelConfig?: Record<string, any>;
    prompt?: string;
    response?: string;
    tokens?: {
        input: number;
        output: number;
        total: number;
    };
    cost?: number;
    latency?: number;
    error?: Error;
}
/**
 * Agent context for agent-related callbacks
 */
export interface AgentContext extends PluginContext {
    agent: BaseAgent;
    agentName: string;
    agentConfig?: Record<string, any>;
    input?: any;
    output?: any;
    steps?: Array<{
        stepId: string;
        type: string;
        input: any;
        output: any;
        duration: number;
        error?: Error;
    }>;
    totalSteps?: number;
    executionTime?: number;
    error?: Error;
}
/**
 * Plugin callback function types
 */
export type PluginCallback<T = any> = (context: PluginContext, data?: T) => Promise<T | void> | T | void;
export type BeforeRunCallback = PluginCallback<InvocationContext>;
export type AfterRunCallback = PluginCallback<InvocationContext>;
export type OnEventCallback = PluginCallback<any>;
export type BeforeAgentCallback = PluginCallback<AgentContext>;
export type AfterAgentCallback = PluginCallback<AgentContext>;
export type BeforeToolCallback = PluginCallback<ToolContext>;
export type AfterToolCallback = PluginCallback<ToolContext>;
export type BeforeModelCallback = PluginCallback<ModelContext>;
export type AfterModelCallback = PluginCallback<ModelContext>;
export type OnToolErrorCallback = PluginCallback<ToolContext>;
export type OnModelErrorCallback = PluginCallback<ModelContext>;
export type OnAgentErrorCallback = PluginCallback<AgentContext>;
/**
 * Plugin result interface
 */
export interface PluginResult<T = any> {
    success: boolean;
    data?: T;
    error?: Error;
    metadata?: Record<string, any>;
    modified?: boolean;
    stopPropagation?: boolean;
}
/**
 * Plugin error interface
 */
export interface PluginError extends Error {
    pluginName: string;
    hookName: PluginHook;
    context?: PluginContext;
    originalError?: Error;
    code?: string;
    severity?: 'low' | 'medium' | 'high' | 'critical';
}
/**
 * Plugin registry interface
 */
export interface PluginRegistry {
    plugins: Map<string, any>;
    hooks: Map<PluginHook, any[]>;
    metadata: Map<string, PluginMetadata>;
    dependencies: Map<string, string[]>;
    loadOrder: string[];
}
/**
 * Plugin manager configuration
 */
export interface PluginManagerConfig {
    autoLoad?: boolean;
    enableHotReload?: boolean;
    maxRetries?: number;
    timeout?: number;
    errorHandling?: 'strict' | 'lenient' | 'ignore';
    logging?: {
        enabled: boolean;
        level: 'debug' | 'info' | 'warn' | 'error';
        includeContext: boolean;
    };
    performance?: {
        trackMetrics: boolean;
        maxExecutionTime: number;
        memoryThreshold: number;
    };
}
/**
 * Plugin validation result
 */
export interface PluginValidationResult {
    valid: boolean;
    errors: string[];
    warnings: string[];
    suggestions: string[];
}
/**
 * Plugin metrics interface
 */
export interface PluginMetrics {
    pluginName: string;
    hookName: PluginHook;
    executionCount: number;
    totalExecutionTime: number;
    averageExecutionTime: number;
    minExecutionTime: number;
    maxExecutionTime: number;
    errorCount: number;
    successCount: number;
    lastExecuted: string;
    memoryUsage?: number;
}
/**
 * Plugin cache interface
 */
export interface PluginCache {
    get<T>(key: string): T | undefined;
    set<T>(key: string, value: T, ttl?: number): void;
    delete(key: string): boolean;
    clear(): void;
    has(key: string): boolean;
    size(): number;
    keys(): string[];
}
/**
 * Plugin security context
 */
export interface PluginSecurityContext {
    permissions: string[];
    restrictions: string[];
    sandboxed: boolean;
    trustedOrigin: boolean;
    signature?: string;
    checksum?: string;
}
/**
 * Plugin configuration schema
 */
export interface PluginConfigSchema {
    type: 'object';
    properties: Record<string, {
        type: string;
        description?: string;
        default?: any;
        required?: boolean;
        enum?: any[];
        minimum?: number;
        maximum?: number;
        pattern?: string;
    }>;
    required?: string[];
    additionalProperties?: boolean;
}
/**
 * Plugin installation info
 */
export interface PluginInstallationInfo {
    name: string;
    version: string;
    source: 'npm' | 'git' | 'local' | 'url';
    location: string;
    installedAt: string;
    dependencies: Record<string, string>;
    checksum?: string;
    signature?: string;
}
//# sourceMappingURL=types.d.ts.map