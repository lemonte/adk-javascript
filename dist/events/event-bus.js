"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventBus = void 0;
const types_1 = require("./types");
const constants_1 = require("./constants");
const base_event_emitter_1 = require("./base-event-emitter");
/**
 * Event bus for managing event flow and processing
 */
class EventBus extends base_event_emitter_1.BaseEventEmitter {
    constructor(config = {}) {
        super(config.emitterConfig);
        this.busConfig = {
            emitterConfig: config.emitterConfig || {},
            persistenceMode: config.persistenceMode ?? constants_1.EVENT_DEFAULTS.PERSISTENCE_MODE,
            deliveryMode: config.deliveryMode ?? constants_1.EVENT_DEFAULTS.DELIVERY_MODE,
            maxConcurrentProcessors: config.maxConcurrentProcessors ?? constants_1.EVENT_DEFAULTS.MAX_CONCURRENT_PROCESSORS,
            processingTimeout: config.processingTimeout ?? constants_1.EVENT_DEFAULTS.PROCESSING_TIMEOUT,
            retryConfig: {
                maxAttempts: config.retryConfig?.maxAttempts ?? constants_1.EVENT_DEFAULTS.MAX_RETRY_ATTEMPTS,
                initialDelay: config.retryConfig?.initialDelay ?? constants_1.EVENT_DEFAULTS.INITIAL_RETRY_DELAY,
                backoffMultiplier: config.retryConfig?.backoffMultiplier ?? constants_1.EVENT_DEFAULTS.BACKOFF_MULTIPLIER,
                maxDelay: config.retryConfig?.maxDelay ?? constants_1.EVENT_DEFAULTS.MAX_RETRY_DELAY,
                jitterFactor: config.retryConfig?.jitterFactor ?? constants_1.EVENT_DEFAULTS.JITTER_FACTOR
            },
            enableMetrics: config.enableMetrics ?? constants_1.EVENT_DEFAULTS.ENABLE_METRICS,
            metricsInterval: config.metricsInterval ?? constants_1.EVENT_DEFAULTS.METRICS_INTERVAL,
            bufferSize: config.bufferSize ?? constants_1.EVENT_DEFAULTS.BUFFER_SIZE,
            bufferFlushInterval: config.bufferFlushInterval ?? constants_1.EVENT_DEFAULTS.BUFFER_FLUSH_INTERVAL
        };
        this.processingQueue = new Map();
        this.activeProcessors = new Map();
        this.retryQueue = new Map();
        this.eventBuffer = [];
        this.metrics = new Map();
        this.hooks = {};
    }
    /**
     * Sets the event store for persistence
     */
    setEventStore(eventStore) {
        this.eventStore = eventStore;
    }
    /**
     * Sets lifecycle hooks
     */
    setLifecycleHooks(hooks) {
        this.hooks = { ...hooks };
    }
    /**
     * Initializes the event bus
     */
    async onInitialize() {
        await super.onInitialize();
        // Start metrics collection if enabled
        if (this.busConfig.enableMetrics) {
            this.startMetricsCollection();
        }
        // Start buffer flushing
        this.startBufferFlushing();
        // Start cleanup process
        this.startCleanupProcess();
        // Emit system started event
        await this.emitSystemEvent(constants_1.BUILT_IN_EVENT_TYPES.SYSTEM_STARTED, {
            timestamp: new Date(),
            config: this.busConfig
        });
    }
    /**
     * Shuts down the event bus
     */
    async onShutdown() {
        // Stop intervals
        if (this.metricsInterval) {
            clearInterval(this.metricsInterval);
        }
        if (this.bufferFlushInterval) {
            clearInterval(this.bufferFlushInterval);
        }
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
        }
        // Wait for active processors to complete
        await this.waitForActiveProcessors();
        // Flush remaining events in buffer
        await this.flushEventBuffer();
        // Emit system stopped event
        await this.emitSystemEvent(constants_1.BUILT_IN_EVENT_TYPES.SYSTEM_STOPPED, {
            timestamp: new Date()
        });
        await super.onShutdown();
    }
    /**
     * Emits an event through the bus
     */
    async emit(event) {
        // Execute before emit hook
        if (this.hooks.beforeEmit) {
            await this.hooks.beforeEmit(event);
        }
        // Create processed event
        const processedEvent = {
            ...event,
            status: types_1.EventStatus.PENDING,
            attempts: 0
        };
        // Add to processing queue
        this.processingQueue.set(event.id, processedEvent);
        // Process the event
        await this.processEvent(processedEvent);
        // Execute after emit hook
        if (this.hooks.afterEmit) {
            await this.hooks.afterEmit(event);
        }
        // Emit built-in event
        await this.emitSystemEvent(constants_1.BUILT_IN_EVENT_TYPES.EVENT_EMITTED, {
            eventId: event.id,
            eventType: event.type,
            timestamp: new Date()
        });
    }
    /**
     * Processes an event
     */
    async processEvent(event) {
        // Check concurrent processor limit
        if (this.activeProcessors.size >= this.busConfig.maxConcurrentProcessors) {
            // Add to buffer if space available
            if (this.eventBuffer.length < this.busConfig.bufferSize) {
                this.eventBuffer.push(event);
                return;
            }
            else {
                throw this.createError(constants_1.EVENT_ERROR_CODES.RESOURCE_LIMIT_EXCEEDED, `Maximum concurrent processors (${this.busConfig.maxConcurrentProcessors}) and buffer size (${this.busConfig.bufferSize}) exceeded`);
            }
        }
        // Start processing
        const processingPromise = this.processEventInternal(event);
        this.activeProcessors.set(event.id, processingPromise);
        try {
            await processingPromise;
        }
        finally {
            this.activeProcessors.delete(event.id);
            this.processingQueue.delete(event.id);
        }
    }
    /**
     * Internal event processing logic
     */
    async processEventInternal(event) {
        const startTime = new Date();
        event.status = types_1.EventStatus.PROCESSING;
        event.processedAt = startTime;
        event.attempts = (event.attempts || 0) + 1;
        try {
            // Execute before process hook
            if (this.hooks.beforeProcess) {
                await this.hooks.beforeProcess(event);
            }
            // Process with timeout
            await Promise.race([
                this.executeEventProcessing(event),
                this.createTimeoutPromise(this.busConfig.processingTimeout)
            ]);
            // Mark as processed
            const endTime = new Date();
            event.status = types_1.EventStatus.PROCESSED;
            event.processingDuration = endTime.getTime() - startTime.getTime();
            // Execute after process hook
            if (this.hooks.afterProcess) {
                await this.hooks.afterProcess(event);
            }
            // Store event if persistence is enabled
            if (this.eventStore && this.busConfig.persistenceMode !== types_1.EventPersistenceMode.NONE) {
                await this.eventStore.store(event);
            }
            // Update metrics
            this.updateEventMetrics(event);
            // Emit processed event
            await this.emitSystemEvent(constants_1.BUILT_IN_EVENT_TYPES.EVENT_PROCESSED, {
                eventId: event.id,
                eventType: event.type,
                processingDuration: event.processingDuration,
                timestamp: endTime
            });
        }
        catch (error) {
            await this.handleProcessingError(event, error);
        }
    }
    /**
     * Executes the actual event processing (emitting to listeners)
     */
    async executeEventProcessing(event) {
        await super.emit(event);
    }
    /**
     * Handles processing errors
     */
    async handleProcessingError(event, error) {
        event.status = types_1.EventStatus.FAILED;
        event.error = error;
        // Execute error hook
        if (this.hooks.onError) {
            await this.hooks.onError(error, event);
        }
        // Check if retry is possible
        if (this.shouldRetryEvent(event)) {
            await this.scheduleRetry(event);
        }
        else {
            // Update metrics for failed event
            this.updateEventMetrics(event);
            // Store failed event if persistence is enabled
            if (this.eventStore && this.busConfig.persistenceMode !== types_1.EventPersistenceMode.NONE) {
                await this.eventStore.store(event);
            }
            // Emit failed event
            await this.emitSystemEvent(constants_1.BUILT_IN_EVENT_TYPES.EVENT_FAILED, {
                eventId: event.id,
                eventType: event.type,
                error: error.message,
                attempts: event.attempts,
                timestamp: new Date()
            });
        }
    }
    /**
     * Checks if an event should be retried
     */
    shouldRetryEvent(event) {
        const attempts = event.attempts || 0;
        return attempts < this.busConfig.retryConfig.maxAttempts;
    }
    /**
     * Schedules an event for retry
     */
    async scheduleRetry(event) {
        const attempts = event.attempts || 0;
        const delay = this.calculateRetryDelay(attempts);
        event.nextRetryAt = new Date(Date.now() + delay);
        event.status = types_1.EventStatus.PENDING;
        this.retryQueue.set(event.id, event);
        // Schedule retry
        setTimeout(async () => {
            const retryEvent = this.retryQueue.get(event.id);
            if (retryEvent) {
                this.retryQueue.delete(event.id);
                await this.processEvent(retryEvent);
            }
        }, delay);
    }
    /**
     * Calculates retry delay with exponential backoff and jitter
     */
    calculateRetryDelay(attempts) {
        const { initialDelay, backoffMultiplier, maxDelay, jitterFactor } = this.busConfig.retryConfig;
        let delay = initialDelay * Math.pow(backoffMultiplier || 2, attempts - 1);
        delay = Math.min(delay, maxDelay || delay);
        // Add jitter
        if (jitterFactor && jitterFactor > 0) {
            const jitter = delay * jitterFactor * Math.random();
            delay += jitter;
        }
        return Math.floor(delay);
    }
    /**
     * Gets event statistics
     */
    async getEventStats() {
        if (this.eventStore) {
            return await this.eventStore.getStats();
        }
        // Calculate stats from in-memory data
        const allEvents = [
            ...Array.from(this.processingQueue.values()),
            ...this.eventBuffer,
            ...Array.from(this.retryQueue.values())
        ];
        const totalEvents = allEvents.length;
        const eventsByType = {};
        const eventsByStatus = {
            [types_1.EventStatus.PENDING]: 0,
            [types_1.EventStatus.PROCESSING]: 0,
            [types_1.EventStatus.PROCESSED]: 0,
            [types_1.EventStatus.FAILED]: 0,
            [types_1.EventStatus.CANCELLED]: 0
        };
        const eventsByPriority = {
            [types_1.EventPriority.LOW]: 0,
            [types_1.EventPriority.MEDIUM]: 0,
            [types_1.EventPriority.HIGH]: 0,
            [types_1.EventPriority.CRITICAL]: 0
        };
        let totalProcessingTime = 0;
        let processedCount = 0;
        let failedCount = 0;
        for (const event of allEvents) {
            // Count by type
            eventsByType[event.type] = (eventsByType[event.type] || 0) + 1;
            // Count by status
            eventsByStatus[event.status]++;
            // Count by priority
            const priority = event.priority || types_1.EventPriority.MEDIUM;
            eventsByPriority[priority]++;
            // Calculate processing metrics
            if (event.processingDuration !== undefined) {
                totalProcessingTime += event.processingDuration;
                processedCount++;
            }
            if (event.status === types_1.EventStatus.FAILED) {
                failedCount++;
            }
        }
        const averageProcessingTime = processedCount > 0 ? totalProcessingTime / processedCount : 0;
        const successRate = totalEvents > 0 ? ((totalEvents - failedCount) / totalEvents) * 100 : 0;
        const errorRate = totalEvents > 0 ? (failedCount / totalEvents) * 100 : 0;
        // Calculate throughput (events per second)
        const now = Date.now();
        const oneSecondAgo = now - 1000;
        const recentEvents = allEvents.filter(e => e.processedAt && e.processedAt.getTime() > oneSecondAgo).length;
        return {
            totalEvents,
            eventsByType,
            eventsByStatus,
            eventsByPriority,
            averageProcessingTime,
            throughput: recentEvents,
            errorRate,
            successRate
        };
    }
    /**
     * Gets metrics for a specific event type
     */
    getEventMetrics(eventType) {
        return this.metrics.get(eventType);
    }
    /**
     * Gets metrics for all event types
     */
    getAllEventMetrics() {
        return new Map(this.metrics);
    }
    /**
     * Queries events from the store
     */
    async queryEvents(options) {
        if (this.eventStore) {
            return await this.eventStore.query(options);
        }
        // Query from in-memory data
        const allEvents = [
            ...Array.from(this.processingQueue.values()),
            ...this.eventBuffer,
            ...Array.from(this.retryQueue.values())
        ];
        return this.filterEvents(allEvents, options);
    }
    /**
     * Backs up events
     */
    async backupEvents() {
        const events = await this.queryEvents({});
        const eventTypes = [...new Set(events.map(e => e.type))];
        const timeRange = events.length > 0 ? {
            start: new Date(Math.min(...events.map(e => e.timestamp.getTime()))),
            end: new Date(Math.max(...events.map(e => e.timestamp.getTime())))
        } : {
            start: new Date(),
            end: new Date()
        };
        return {
            timestamp: new Date(),
            version: '1.0.0',
            events,
            metadata: {
                totalEvents: events.length,
                eventTypes,
                timeRange,
                config: this.busConfig
            }
        };
    }
    /**
     * Restores events from backup
     */
    async restoreEvents(backup, options) {
        const opts = {
            overwrite: false,
            validate: true,
            backup: true,
            ...options
        };
        let restoredCount = 0;
        // Backup existing events if requested
        if (opts.backup && this.eventStore) {
            await this.backupEvents();
        }
        // Restore events
        for (const event of backup.events) {
            try {
                // Apply filters
                if (opts.eventTypes && !opts.eventTypes.includes(event.type)) {
                    continue;
                }
                if (opts.timeRange) {
                    if (opts.timeRange.start && event.timestamp < opts.timeRange.start) {
                        continue;
                    }
                    if (opts.timeRange.end && event.timestamp > opts.timeRange.end) {
                        continue;
                    }
                }
                // Validate if requested
                if (opts.validate) {
                    // Basic validation
                    if (!event.id || !event.type || !event.timestamp) {
                        console.warn(`Skipping invalid event: ${event.id}`);
                        continue;
                    }
                }
                // Store event
                if (this.eventStore) {
                    await this.eventStore.store(event);
                }
                restoredCount++;
            }
            catch (error) {
                console.error(`Failed to restore event '${event.id}':`, error);
            }
        }
        return restoredCount;
    }
    /**
     * Gets the current configuration
     */
    getBusConfiguration() {
        return { ...this.busConfig };
    }
    /**
     * Updates the configuration
     */
    updateBusConfiguration(config) {
        this.busConfig = { ...this.busConfig, ...config };
    }
    /**
     * Gets health status
     */
    getBusHealthStatus() {
        const baseHealth = this.getHealthStatus();
        const queueSize = this.processingQueue.size;
        const bufferSize = this.eventBuffer.length;
        const retryQueueSize = this.retryQueue.size;
        const activeProcessors = this.activeProcessors.size;
        return {
            healthy: baseHealth.healthy &&
                queueSize < this.busConfig.maxConcurrentProcessors * 2 &&
                bufferSize < this.busConfig.bufferSize * 0.9,
            details: {
                ...baseHealth.details,
                queueSize,
                bufferSize,
                retryQueueSize,
                activeProcessors,
                maxConcurrentProcessors: this.busConfig.maxConcurrentProcessors,
                maxBufferSize: this.busConfig.bufferSize
            }
        };
    }
    /**
     * Starts metrics collection
     */
    startMetricsCollection() {
        this.metricsInterval = setInterval(() => {
            this.collectMetrics();
        }, this.busConfig.metricsInterval);
    }
    /**
     * Starts buffer flushing
     */
    startBufferFlushing() {
        this.bufferFlushInterval = setInterval(async () => {
            await this.flushEventBuffer();
        }, this.busConfig.bufferFlushInterval);
    }
    /**
     * Starts cleanup process
     */
    startCleanupProcess() {
        this.cleanupInterval = setInterval(() => {
            this.cleanupExpiredEvents();
        }, 60000); // Run every minute
    }
    /**
     * Flushes events from buffer to processing
     */
    async flushEventBuffer() {
        const eventsToProcess = this.eventBuffer.splice(0, Math.min(this.eventBuffer.length, this.busConfig.maxConcurrentProcessors - this.activeProcessors.size));
        for (const event of eventsToProcess) {
            try {
                await this.processEvent(event);
            }
            catch (error) {
                console.error('Error processing buffered event:', error);
            }
        }
    }
    /**
     * Cleans up expired events
     */
    cleanupExpiredEvents() {
        const now = Date.now();
        // Clean up retry queue
        for (const [eventId, event] of this.retryQueue) {
            if (event.nextRetryAt && event.nextRetryAt.getTime() < now - 3600000) { // 1 hour old
                this.retryQueue.delete(eventId);
            }
        }
    }
    /**
     * Waits for all active processors to complete
     */
    async waitForActiveProcessors() {
        const promises = Array.from(this.activeProcessors.values());
        if (promises.length > 0) {
            await Promise.allSettled(promises);
        }
    }
    /**
     * Collects metrics
     */
    collectMetrics() {
        // This would be implemented to collect and update metrics
        // For now, it's a placeholder
    }
    /**
     * Updates metrics for an event
     */
    updateEventMetrics(event) {
        const metrics = this.metrics.get(event.type) || {
            eventType: event.type,
            processedCount: 0,
            successCount: 0,
            failureCount: 0,
            averageDuration: 0,
            minDuration: Infinity,
            maxDuration: 0,
            throughput: 0,
            errorRate: 0
        };
        metrics.processedCount++;
        if (event.status === types_1.EventStatus.PROCESSED) {
            metrics.successCount++;
        }
        else if (event.status === types_1.EventStatus.FAILED) {
            metrics.failureCount++;
        }
        if (event.processingDuration !== undefined) {
            metrics.averageDuration = ((metrics.averageDuration * (metrics.processedCount - 1)) + event.processingDuration) / metrics.processedCount;
            metrics.minDuration = Math.min(metrics.minDuration, event.processingDuration);
            metrics.maxDuration = Math.max(metrics.maxDuration, event.processingDuration);
        }
        metrics.errorRate = (metrics.failureCount / metrics.processedCount) * 100;
        metrics.lastProcessedAt = new Date();
        this.metrics.set(event.type, metrics);
    }
    /**
     * Filters events based on query options
     */
    filterEvents(events, options) {
        let filtered = events;
        if (options.types && options.types.length > 0) {
            filtered = filtered.filter(e => options.types.includes(e.type));
        }
        if (options.sources && options.sources.length > 0) {
            filtered = filtered.filter(e => e.source && options.sources.includes(e.source));
        }
        if (options.status) {
            filtered = filtered.filter(e => e.status === options.status);
        }
        if (options.startTime) {
            filtered = filtered.filter(e => e.timestamp >= options.startTime);
        }
        if (options.endTime) {
            filtered = filtered.filter(e => e.timestamp <= options.endTime);
        }
        if (options.correlationId) {
            filtered = filtered.filter(e => e.correlationId === options.correlationId);
        }
        if (options.causationId) {
            filtered = filtered.filter(e => e.causationId === options.causationId);
        }
        // Sort events
        if (options.sortBy) {
            filtered.sort((a, b) => {
                let aValue;
                let bValue;
                switch (options.sortBy) {
                    case 'timestamp':
                        aValue = a.timestamp.getTime();
                        bValue = b.timestamp.getTime();
                        break;
                    case 'priority':
                        aValue = a.priority || types_1.EventPriority.MEDIUM;
                        bValue = b.priority || types_1.EventPriority.MEDIUM;
                        break;
                    case 'type':
                        aValue = a.type;
                        bValue = b.type;
                        break;
                    default:
                        return 0;
                }
                const direction = options.sortOrder === 'desc' ? -1 : 1;
                if (aValue < bValue)
                    return -1 * direction;
                if (aValue > bValue)
                    return 1 * direction;
                return 0;
            });
        }
        // Apply pagination
        const offset = options.offset || 0;
        if (options.limit) {
            filtered = filtered.slice(offset, offset + options.limit);
        }
        else if (offset > 0) {
            filtered = filtered.slice(offset);
        }
        return filtered;
    }
    /**
     * Emits a system event
     */
    async emitSystemEvent(type, data) {
        const systemEvent = {
            id: this.generateEventId(),
            type,
            data,
            timestamp: new Date(),
            source: 'event-bus',
            priority: types_1.EventPriority.LOW
        };
        // Emit directly to avoid recursion
        await super.emit(systemEvent);
    }
    /**
     * Creates a timeout promise
     */
    createTimeoutPromise(timeout) {
        return new Promise((_, reject) => {
            setTimeout(() => {
                reject(this.createError(constants_1.EVENT_ERROR_CODES.EVENT_PROCESSING_TIMEOUT, `Event processing timed out after ${timeout}ms`));
            }, timeout);
        });
    }
    /**
     * Generates a unique event ID
     */
    generateEventId() {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substring(2, 15);
        return `event_${timestamp}_${random}`;
    }
    /**
     * Creates an error with context
     */
    createError(code, message) {
        const error = new Error(message);
        error.code = code;
        return error;
    }
}
exports.EventBus = EventBus;
//# sourceMappingURL=event-bus.js.map