/**
 * Metrics plugin for ADK JavaScript
 */
import { BasePlugin } from './base-plugin';
import { PluginConfig, InvocationContext, ToolContext, ModelContext, AgentContext } from './types';
export interface MetricsPluginConfig extends PluginConfig {
    settings?: {
        collectSystemMetrics?: boolean;
        collectPerformanceMetrics?: boolean;
        collectUsageMetrics?: boolean;
        collectErrorMetrics?: boolean;
        metricsRetentionDays?: number;
        aggregationInterval?: number;
        enableRealTimeMetrics?: boolean;
        exportFormat?: 'json' | 'csv' | 'prometheus';
        exportInterval?: number;
        exportPath?: string;
        alertThresholds?: {
            errorRate?: number;
            responseTime?: number;
            memoryUsage?: number;
            cpuUsage?: number;
        };
    };
}
export interface MetricData {
    timestamp: number;
    name: string;
    value: number;
    unit: string;
    tags: Record<string, string>;
    type: 'counter' | 'gauge' | 'histogram' | 'timer';
}
export interface AggregatedMetrics {
    count: number;
    sum: number;
    avg: number;
    min: number;
    max: number;
    p50: number;
    p95: number;
    p99: number;
}
export interface SystemMetrics {
    memoryUsage: {
        used: number;
        total: number;
        percentage: number;
    };
    cpuUsage: number;
    timestamp: number;
}
export interface PerformanceMetrics {
    runDuration: number;
    agentExecutionTime: number;
    toolExecutionTime: number;
    modelCallTime: number;
    totalSteps: number;
    timestamp: number;
}
export interface UsageMetrics {
    totalRuns: number;
    totalAgentCalls: number;
    totalToolCalls: number;
    totalModelCalls: number;
    totalTokens: number;
    totalCost: number;
    timestamp: number;
}
export interface ErrorMetrics {
    totalErrors: number;
    agentErrors: number;
    toolErrors: number;
    modelErrors: number;
    errorRate: number;
    timestamp: number;
}
/**
 * Plugin that collects and analyzes performance and usage metrics
 */
export declare class MetricsPlugin extends BasePlugin {
    private metrics;
    private systemMetrics;
    private performanceMetrics;
    private usageMetrics;
    private errorMetrics;
    private aggregationTimer?;
    private exportTimer?;
    private startTimes;
    private counters;
    private gauges;
    private collectSystemMetrics;
    private collectPerformanceMetrics;
    private collectUsageMetrics;
    private collectErrorMetrics;
    private metricsRetentionDays;
    private aggregationInterval;
    private enableRealTimeMetrics;
    private exportFormat;
    private exportInterval;
    private exportPath?;
    private alertThresholds;
    constructor(config?: Partial<MetricsPluginConfig>);
    protected onInitialize(): Promise<void>;
    protected onDestroy(): Promise<void>;
    beforeRunCallback(context: InvocationContext): Promise<InvocationContext>;
    afterRunCallback(context: InvocationContext): Promise<InvocationContext>;
    beforeAgentCallback(context: AgentContext): Promise<AgentContext>;
    afterAgentCallback(context: AgentContext): Promise<AgentContext>;
    beforeToolCallback(context: ToolContext): Promise<ToolContext>;
    afterToolCallback(context: ToolContext): Promise<ToolContext>;
    beforeModelCallback(context: ModelContext): Promise<ModelContext>;
    afterModelCallback(context: ModelContext): Promise<ModelContext>;
    onToolErrorCallback(context: ToolContext): Promise<ToolContext>;
    onModelErrorCallback(context: ModelContext): Promise<ModelContext>;
    onAgentErrorCallback(context: AgentContext): Promise<AgentContext>;
    /**
     * Record a metric
     */
    private recordMetric;
    /**
     * Get metric unit based on name and type
     */
    private getMetricUnit;
    /**
     * Initialize counters
     */
    private initializeCounters;
    /**
     * Increment a counter
     */
    private incrementCounter;
    /**
     * Set a gauge value
     */
    private setGauge;
    /**
     * Start aggregation timer
     */
    private startAggregationTimer;
    /**
     * Start export timer
     */
    private startExportTimer;
    /**
     * Start system metrics collection
     */
    private startSystemMetricsCollection;
    /**
     * Collect system metrics data
     */
    private collectSystemMetricsData;
    /**
     * Record performance metric
     */
    private recordPerformanceMetric;
    /**
     * Aggregate metrics
     */
    private aggregateMetrics;
    /**
     * Clean old metrics based on retention policy
     */
    private cleanOldMetrics;
    /**
     * Check for alerts based on thresholds
     */
    private checkAlerts;
    /**
     * Export metrics to configured format and path
     */
    private exportMetrics;
    /**
     * Prepare data for export
     */
    private prepareExportData;
    /**
     * Export as JSON
     */
    private exportAsJson;
    /**
     * Export as CSV
     */
    private exportAsCsv;
    /**
     * Export as Prometheus format
     */
    private exportAsPrometheus;
    /**
     * Get aggregated metrics for a specific metric name
     */
    getAggregatedMetrics(metricName: string): AggregatedMetrics | null;
    /**
     * Get current counters
     */
    getCounters(): Record<string, number>;
    /**
     * Get current gauges
     */
    getGauges(): Record<string, number>;
    /**
     * Get recent system metrics
     */
    getRecentSystemMetrics(limit?: number): SystemMetrics[];
    /**
     * Get recent performance metrics
     */
    getRecentPerformanceMetrics(limit?: number): PerformanceMetrics[];
    /**
     * Get recent usage metrics
     */
    getRecentUsageMetrics(limit?: number): UsageMetrics[];
    /**
     * Get recent error metrics
     */
    getRecentErrorMetrics(limit?: number): ErrorMetrics[];
    /**
     * Reset all metrics
     */
    resetMetrics(): void;
    protected performHealthCheck(): Promise<Record<string, any>>;
}
//# sourceMappingURL=metrics-plugin.d.ts.map