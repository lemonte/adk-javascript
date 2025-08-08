"use strict";
/**
 * Metrics plugin for ADK JavaScript
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetricsPlugin = void 0;
const base_plugin_1 = require("./base-plugin");
const constants_1 = require("./constants");
/**
 * Plugin that collects and analyzes performance and usage metrics
 */
class MetricsPlugin extends base_plugin_1.BasePlugin {
    constructor(config = {}) {
        const fullConfig = {
            name: 'metrics-plugin',
            version: '1.0.0',
            description: 'Collects and analyzes performance and usage metrics',
            priority: constants_1.PLUGIN_PRIORITIES.MEDIUM,
            hooks: [
                'before_run',
                'after_run',
                'before_agent',
                'after_agent',
                'before_tool',
                'after_tool',
                'before_model',
                'after_model',
                'on_tool_error',
                'on_model_error',
                'on_agent_error'
            ],
            settings: {
                collectSystemMetrics: true,
                collectPerformanceMetrics: true,
                collectUsageMetrics: true,
                collectErrorMetrics: true,
                metricsRetentionDays: 30,
                aggregationInterval: 60000, // 1 minute
                enableRealTimeMetrics: true,
                exportFormat: 'json',
                exportInterval: 300000, // 5 minutes
                alertThresholds: {
                    errorRate: 0.05, // 5%
                    responseTime: 5000, // 5 seconds
                    memoryUsage: 0.8, // 80%
                    cpuUsage: 0.8 // 80%
                },
                ...config.settings
            },
            ...config
        };
        super(fullConfig);
        this.metrics = new Map();
        this.systemMetrics = [];
        this.performanceMetrics = [];
        this.usageMetrics = [];
        this.errorMetrics = [];
        this.startTimes = new Map();
        this.counters = new Map();
        this.gauges = new Map();
        const settings = fullConfig.settings;
        this.collectSystemMetrics = settings.collectSystemMetrics;
        this.collectPerformanceMetrics = settings.collectPerformanceMetrics;
        this.collectUsageMetrics = settings.collectUsageMetrics;
        this.collectErrorMetrics = settings.collectErrorMetrics;
        this.metricsRetentionDays = settings.metricsRetentionDays;
        this.aggregationInterval = settings.aggregationInterval;
        this.enableRealTimeMetrics = settings.enableRealTimeMetrics;
        this.exportFormat = settings.exportFormat;
        this.exportInterval = settings.exportInterval;
        this.exportPath = settings.exportPath;
        this.alertThresholds = settings.alertThresholds;
    }
    async onInitialize() {
        this.log('info', 'Metrics plugin initialized');
        // Initialize counters
        this.initializeCounters();
        // Start aggregation timer
        if (this.enableRealTimeMetrics) {
            this.startAggregationTimer();
        }
        // Start export timer
        if (this.exportPath) {
            this.startExportTimer();
        }
        // Start system metrics collection
        if (this.collectSystemMetrics) {
            this.startSystemMetricsCollection();
        }
    }
    async onDestroy() {
        this.log('info', 'Metrics plugin destroyed');
        // Clear timers
        if (this.aggregationTimer) {
            clearInterval(this.aggregationTimer);
        }
        if (this.exportTimer) {
            clearInterval(this.exportTimer);
        }
        // Export final metrics
        if (this.exportPath) {
            await this.exportMetrics();
        }
    }
    async beforeRunCallback(context) {
        const startTime = Date.now();
        this.startTimes.set(`run_${context.runId}`, startTime);
        this.incrementCounter('total_runs');
        this.recordMetric('run_started', 1, 'counter', { runId: context.runId });
        return context;
    }
    async afterRunCallback(context) {
        const endTime = Date.now();
        const startTime = this.startTimes.get(`run_${context.runId}`);
        if (startTime) {
            const duration = endTime - startTime;
            this.recordMetric('run_duration', duration, 'timer', { runId: context.runId });
            this.startTimes.delete(`run_${context.runId}`);
            if (this.collectPerformanceMetrics) {
                this.recordPerformanceMetric({
                    runDuration: duration,
                    agentExecutionTime: context.duration || 0,
                    toolExecutionTime: 0, // Will be aggregated from tool calls
                    modelCallTime: 0, // Will be aggregated from model calls
                    totalSteps: 0, // Will be set from agent context
                    timestamp: endTime
                });
            }
        }
        this.recordMetric('run_completed', 1, 'counter', {
            runId: context.runId,
            status: context.status || 'unknown'
        });
        return context;
    }
    async beforeAgentCallback(context) {
        const startTime = Date.now();
        this.startTimes.set(`agent_${context.agentName}`, startTime);
        this.incrementCounter('total_agent_calls');
        this.recordMetric('agent_started', 1, 'counter', { agentName: context.agentName });
        return context;
    }
    async afterAgentCallback(context) {
        const endTime = Date.now();
        const startTime = this.startTimes.get(`agent_${context.agentName}`);
        if (startTime) {
            const duration = endTime - startTime;
            this.recordMetric('agent_execution_time', duration, 'timer', {
                agentName: context.agentName
            });
            this.startTimes.delete(`agent_${context.agentName}`);
        }
        this.recordMetric('agent_completed', 1, 'counter', {
            agentName: context.agentName,
            totalSteps: context.totalSteps?.toString() || '0'
        });
        return context;
    }
    async beforeToolCallback(context) {
        const startTime = Date.now();
        this.startTimes.set(`tool_${context.toolName}`, startTime);
        this.incrementCounter('total_tool_calls');
        this.recordMetric('tool_started', 1, 'counter', { toolName: context.toolName });
        return context;
    }
    async afterToolCallback(context) {
        const endTime = Date.now();
        const startTime = this.startTimes.get(`tool_${context.toolName}`);
        if (startTime) {
            const duration = endTime - startTime;
            this.recordMetric('tool_execution_time', duration, 'timer', {
                toolName: context.toolName
            });
            this.startTimes.delete(`tool_${context.toolName}`);
        }
        this.recordMetric('tool_completed', 1, 'counter', {
            toolName: context.toolName,
            retryCount: context.retryCount?.toString() || '0'
        });
        return context;
    }
    async beforeModelCallback(context) {
        const startTime = Date.now();
        this.startTimes.set(`model_${context.modelName}`, startTime);
        this.incrementCounter('total_model_calls');
        this.recordMetric('model_started', 1, 'counter', { modelName: context.modelName });
        return context;
    }
    async afterModelCallback(context) {
        const endTime = Date.now();
        const startTime = this.startTimes.get(`model_${context.modelName}`);
        if (startTime) {
            const duration = endTime - startTime;
            this.recordMetric('model_call_time', duration, 'timer', {
                modelName: context.modelName
            });
            this.startTimes.delete(`model_${context.modelName}`);
        }
        // Record token usage
        if (context.tokens) {
            this.recordMetric('tokens_used', context.tokens.total || 0, 'counter', {
                modelName: context.modelName,
                type: 'total'
            });
            if (context.tokens.input) {
                this.recordMetric('tokens_used', context.tokens.input, 'counter', {
                    modelName: context.modelName,
                    type: 'input'
                });
            }
            if (context.tokens.output) {
                this.recordMetric('tokens_used', context.tokens.output, 'counter', {
                    modelName: context.modelName,
                    type: 'output'
                });
            }
            this.incrementCounter('total_tokens', context.tokens.total || 0);
        }
        // Record cost
        if (context.cost) {
            this.recordMetric('model_cost', context.cost, 'counter', {
                modelName: context.modelName
            });
            this.incrementCounter('total_cost', context.cost);
        }
        this.recordMetric('model_completed', 1, 'counter', {
            modelName: context.modelName
        });
        return context;
    }
    async onToolErrorCallback(context) {
        this.incrementCounter('tool_errors');
        this.incrementCounter('total_errors');
        this.recordMetric('tool_error', 1, 'counter', {
            toolName: context.toolName,
            errorType: context.error?.name || 'unknown'
        });
        return context;
    }
    async onModelErrorCallback(context) {
        this.incrementCounter('model_errors');
        this.incrementCounter('total_errors');
        this.recordMetric('model_error', 1, 'counter', {
            modelName: context.modelName,
            errorType: context.error?.name || 'unknown'
        });
        return context;
    }
    async onAgentErrorCallback(context) {
        this.incrementCounter('agent_errors');
        this.incrementCounter('total_errors');
        this.recordMetric('agent_error', 1, 'counter', {
            agentName: context.agentName,
            errorType: context.error?.name || 'unknown'
        });
        return context;
    }
    /**
     * Record a metric
     */
    recordMetric(name, value, type, tags = {}) {
        const metric = {
            timestamp: Date.now(),
            name,
            value,
            unit: this.getMetricUnit(name, type),
            tags,
            type
        };
        if (!this.metrics.has(name)) {
            this.metrics.set(name, []);
        }
        this.metrics.get(name).push(metric);
        // Update real-time counters and gauges
        if (type === 'counter') {
            this.incrementCounter(name, value);
        }
        else if (type === 'gauge') {
            this.setGauge(name, value);
        }
        // Check for alerts
        this.checkAlerts(metric);
    }
    /**
     * Get metric unit based on name and type
     */
    getMetricUnit(name, type) {
        if (name.includes('time') || name.includes('duration') || name.includes('latency')) {
            return 'ms';
        }
        if (name.includes('cost')) {
            return 'usd';
        }
        if (name.includes('tokens')) {
            return 'tokens';
        }
        if (name.includes('memory')) {
            return 'bytes';
        }
        if (name.includes('cpu')) {
            return 'percent';
        }
        if (type === 'counter') {
            return 'count';
        }
        return 'unit';
    }
    /**
     * Initialize counters
     */
    initializeCounters() {
        const counterNames = [
            'total_runs',
            'total_agent_calls',
            'total_tool_calls',
            'total_model_calls',
            'total_tokens',
            'total_cost',
            'total_errors',
            'agent_errors',
            'tool_errors',
            'model_errors'
        ];
        for (const name of counterNames) {
            this.counters.set(name, 0);
        }
    }
    /**
     * Increment a counter
     */
    incrementCounter(name, value = 1) {
        const current = this.counters.get(name) || 0;
        this.counters.set(name, current + value);
    }
    /**
     * Set a gauge value
     */
    setGauge(name, value) {
        this.gauges.set(name, value);
    }
    /**
     * Start aggregation timer
     */
    startAggregationTimer() {
        this.aggregationTimer = setInterval(() => {
            this.aggregateMetrics();
        }, this.aggregationInterval);
    }
    /**
     * Start export timer
     */
    startExportTimer() {
        this.exportTimer = setInterval(() => {
            this.exportMetrics();
        }, this.exportInterval);
    }
    /**
     * Start system metrics collection
     */
    startSystemMetricsCollection() {
        setInterval(() => {
            this.collectSystemMetricsData();
        }, 10000); // Every 10 seconds
    }
    /**
     * Collect system metrics data
     */
    collectSystemMetricsData() {
        try {
            // In a real implementation, you would use process.memoryUsage() and os.cpus()
            const memoryUsage = {
                used: Math.random() * 1000000000, // Mock data
                total: 2000000000,
                percentage: Math.random()
            };
            const cpuUsage = Math.random();
            const systemMetric = {
                memoryUsage,
                cpuUsage,
                timestamp: Date.now()
            };
            this.systemMetrics.push(systemMetric);
            // Record as regular metrics
            this.recordMetric('system_memory_used', memoryUsage.used, 'gauge');
            this.recordMetric('system_memory_percentage', memoryUsage.percentage, 'gauge');
            this.recordMetric('system_cpu_usage', cpuUsage, 'gauge');
        }
        catch (error) {
            this.log('error', 'Failed to collect system metrics:', error);
        }
    }
    /**
     * Record performance metric
     */
    recordPerformanceMetric(metric) {
        if (this.collectPerformanceMetrics) {
            this.performanceMetrics.push(metric);
        }
    }
    /**
     * Aggregate metrics
     */
    aggregateMetrics() {
        try {
            // Clean old metrics
            this.cleanOldMetrics();
            // Update usage metrics
            if (this.collectUsageMetrics) {
                const usageMetric = {
                    totalRuns: this.counters.get('total_runs') || 0,
                    totalAgentCalls: this.counters.get('total_agent_calls') || 0,
                    totalToolCalls: this.counters.get('total_tool_calls') || 0,
                    totalModelCalls: this.counters.get('total_model_calls') || 0,
                    totalTokens: this.counters.get('total_tokens') || 0,
                    totalCost: this.counters.get('total_cost') || 0,
                    timestamp: Date.now()
                };
                this.usageMetrics.push(usageMetric);
            }
            // Update error metrics
            if (this.collectErrorMetrics) {
                const totalCalls = (this.counters.get('total_runs') || 0) +
                    (this.counters.get('total_agent_calls') || 0) +
                    (this.counters.get('total_tool_calls') || 0) +
                    (this.counters.get('total_model_calls') || 0);
                const errorMetric = {
                    totalErrors: this.counters.get('total_errors') || 0,
                    agentErrors: this.counters.get('agent_errors') || 0,
                    toolErrors: this.counters.get('tool_errors') || 0,
                    modelErrors: this.counters.get('model_errors') || 0,
                    errorRate: totalCalls > 0 ? (this.counters.get('total_errors') || 0) / totalCalls : 0,
                    timestamp: Date.now()
                };
                this.errorMetrics.push(errorMetric);
            }
        }
        catch (error) {
            this.log('error', 'Failed to aggregate metrics:', error);
        }
    }
    /**
     * Clean old metrics based on retention policy
     */
    cleanOldMetrics() {
        const cutoffTime = Date.now() - (this.metricsRetentionDays * 24 * 60 * 60 * 1000);
        // Clean metrics
        for (const [name, metricList] of this.metrics.entries()) {
            const filtered = metricList.filter(metric => metric.timestamp > cutoffTime);
            this.metrics.set(name, filtered);
        }
        // Clean system metrics
        this.systemMetrics = this.systemMetrics.filter(metric => metric.timestamp > cutoffTime);
        // Clean performance metrics
        this.performanceMetrics = this.performanceMetrics.filter(metric => metric.timestamp > cutoffTime);
        // Clean usage metrics
        this.usageMetrics = this.usageMetrics.filter(metric => metric.timestamp > cutoffTime);
        // Clean error metrics
        this.errorMetrics = this.errorMetrics.filter(metric => metric.timestamp > cutoffTime);
    }
    /**
     * Check for alerts based on thresholds
     */
    checkAlerts(metric) {
        try {
            if (metric.name === 'system_memory_percentage' &&
                metric.value > this.alertThresholds.memoryUsage) {
                this.log('warn', `High memory usage alert: ${(metric.value * 100).toFixed(1)}%`);
            }
            if (metric.name === 'system_cpu_usage' &&
                metric.value > this.alertThresholds.cpuUsage) {
                this.log('warn', `High CPU usage alert: ${(metric.value * 100).toFixed(1)}%`);
            }
            if ((metric.name.includes('execution_time') || metric.name.includes('duration')) &&
                metric.value > this.alertThresholds.responseTime) {
                this.log('warn', `High response time alert: ${metric.value}ms for ${metric.name}`);
            }
        }
        catch (error) {
            this.log('error', 'Failed to check alerts:', error);
        }
    }
    /**
     * Export metrics to configured format and path
     */
    async exportMetrics() {
        if (!this.exportPath) {
            return;
        }
        try {
            const exportData = this.prepareExportData();
            switch (this.exportFormat) {
                case 'json':
                    await this.exportAsJson(exportData);
                    break;
                case 'csv':
                    await this.exportAsCsv(exportData);
                    break;
                case 'prometheus':
                    await this.exportAsPrometheus(exportData);
                    break;
            }
        }
        catch (error) {
            this.log('error', 'Failed to export metrics:', error);
        }
    }
    /**
     * Prepare data for export
     */
    prepareExportData() {
        return {
            timestamp: Date.now(),
            counters: Object.fromEntries(this.counters),
            gauges: Object.fromEntries(this.gauges),
            metrics: Object.fromEntries(this.metrics),
            systemMetrics: this.systemMetrics.slice(-100), // Last 100 entries
            performanceMetrics: this.performanceMetrics.slice(-100),
            usageMetrics: this.usageMetrics.slice(-100),
            errorMetrics: this.errorMetrics.slice(-100)
        };
    }
    /**
     * Export as JSON
     */
    async exportAsJson(data) {
        // In a real implementation, you would write to file system
        this.log('info', `Exporting metrics as JSON to ${this.exportPath}`);
    }
    /**
     * Export as CSV
     */
    async exportAsCsv(data) {
        // In a real implementation, you would convert to CSV and write to file system
        this.log('info', `Exporting metrics as CSV to ${this.exportPath}`);
    }
    /**
     * Export as Prometheus format
     */
    async exportAsPrometheus(data) {
        // In a real implementation, you would convert to Prometheus format
        this.log('info', `Exporting metrics as Prometheus format to ${this.exportPath}`);
    }
    /**
     * Get aggregated metrics for a specific metric name
     */
    getAggregatedMetrics(metricName) {
        const metricData = this.metrics.get(metricName);
        if (!metricData || metricData.length === 0) {
            return null;
        }
        const values = metricData.map(m => m.value).sort((a, b) => a - b);
        const count = values.length;
        const sum = values.reduce((a, b) => a + b, 0);
        return {
            count,
            sum,
            avg: sum / count,
            min: values[0],
            max: values[count - 1],
            p50: values[Math.floor(count * 0.5)],
            p95: values[Math.floor(count * 0.95)],
            p99: values[Math.floor(count * 0.99)]
        };
    }
    /**
     * Get current counters
     */
    getCounters() {
        return Object.fromEntries(this.counters);
    }
    /**
     * Get current gauges
     */
    getGauges() {
        return Object.fromEntries(this.gauges);
    }
    /**
     * Get recent system metrics
     */
    getRecentSystemMetrics(limit = 10) {
        return this.systemMetrics.slice(-limit);
    }
    /**
     * Get recent performance metrics
     */
    getRecentPerformanceMetrics(limit = 10) {
        return this.performanceMetrics.slice(-limit);
    }
    /**
     * Get recent usage metrics
     */
    getRecentUsageMetrics(limit = 10) {
        return this.usageMetrics.slice(-limit);
    }
    /**
     * Get recent error metrics
     */
    getRecentErrorMetrics(limit = 10) {
        return this.errorMetrics.slice(-limit);
    }
    /**
     * Reset all metrics
     */
    resetMetrics() {
        this.metrics.clear();
        this.systemMetrics = [];
        this.performanceMetrics = [];
        this.usageMetrics = [];
        this.errorMetrics = [];
        this.counters.clear();
        this.gauges.clear();
        this.startTimes.clear();
        this.initializeCounters();
        this.log('info', 'All metrics have been reset');
    }
    async performHealthCheck() {
        return {
            metricsCount: this.metrics.size,
            totalDataPoints: Array.from(this.metrics.values()).reduce((sum, arr) => sum + arr.length, 0),
            systemMetricsCount: this.systemMetrics.length,
            performanceMetricsCount: this.performanceMetrics.length,
            usageMetricsCount: this.usageMetrics.length,
            errorMetricsCount: this.errorMetrics.length,
            counters: this.getCounters(),
            gauges: this.getGauges(),
            aggregationTimerActive: !!this.aggregationTimer,
            exportTimerActive: !!this.exportTimer
        };
    }
}
exports.MetricsPlugin = MetricsPlugin;
//# sourceMappingURL=metrics-plugin.js.map