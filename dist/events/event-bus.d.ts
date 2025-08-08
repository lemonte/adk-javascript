import { BaseEvent, ProcessedEvent, EventBusConfig, EventLifecycleHooks, EventQueryOptions, EventStats, EventMetrics, EventBackup, EventRestoreOptions, IEventStore } from './types';
import { BaseEventEmitter } from './base-event-emitter';
/**
 * Event bus for managing event flow and processing
 */
export declare class EventBus extends BaseEventEmitter {
    private busConfig;
    private eventStore?;
    private processingQueue;
    private activeProcessors;
    private retryQueue;
    private eventBuffer;
    private metrics;
    private hooks;
    private metricsInterval?;
    private bufferFlushInterval?;
    private cleanupInterval?;
    constructor(config?: EventBusConfig);
    /**
     * Sets the event store for persistence
     */
    setEventStore(eventStore: IEventStore): void;
    /**
     * Sets lifecycle hooks
     */
    setLifecycleHooks(hooks: EventLifecycleHooks): void;
    /**
     * Initializes the event bus
     */
    protected onInitialize(): Promise<void>;
    /**
     * Shuts down the event bus
     */
    protected onShutdown(): Promise<void>;
    /**
     * Emits an event through the bus
     */
    emit(event: BaseEvent): Promise<void>;
    /**
     * Processes an event
     */
    private processEvent;
    /**
     * Internal event processing logic
     */
    private processEventInternal;
    /**
     * Executes the actual event processing (emitting to listeners)
     */
    private executeEventProcessing;
    /**
     * Handles processing errors
     */
    private handleProcessingError;
    /**
     * Checks if an event should be retried
     */
    private shouldRetryEvent;
    /**
     * Schedules an event for retry
     */
    private scheduleRetry;
    /**
     * Calculates retry delay with exponential backoff and jitter
     */
    private calculateRetryDelay;
    /**
     * Gets event statistics
     */
    getEventStats(): Promise<EventStats>;
    /**
     * Gets metrics for a specific event type
     */
    getEventMetrics(eventType: string): EventMetrics | undefined;
    /**
     * Gets metrics for all event types
     */
    getAllEventMetrics(): Map<string, EventMetrics>;
    /**
     * Queries events from the store
     */
    queryEvents(options: EventQueryOptions): Promise<ProcessedEvent[]>;
    /**
     * Backs up events
     */
    backupEvents(): Promise<EventBackup>;
    /**
     * Restores events from backup
     */
    restoreEvents(backup: EventBackup, options?: EventRestoreOptions): Promise<number>;
    /**
     * Gets the current configuration
     */
    getBusConfiguration(): EventBusConfig;
    /**
     * Updates the configuration
     */
    updateBusConfiguration(config: Partial<EventBusConfig>): void;
    /**
     * Gets health status
     */
    getBusHealthStatus(): {
        healthy: boolean;
        details: Record<string, any>;
    };
    /**
     * Starts metrics collection
     */
    private startMetricsCollection;
    /**
     * Starts buffer flushing
     */
    private startBufferFlushing;
    /**
     * Starts cleanup process
     */
    private startCleanupProcess;
    /**
     * Flushes events from buffer to processing
     */
    private flushEventBuffer;
    /**
     * Cleans up expired events
     */
    private cleanupExpiredEvents;
    /**
     * Waits for all active processors to complete
     */
    private waitForActiveProcessors;
    /**
     * Collects metrics
     */
    private collectMetrics;
    /**
     * Updates metrics for an event
     */
    private updateEventMetrics;
    /**
     * Filters events based on query options
     */
    private filterEvents;
    /**
     * Emits a system event
     */
    private emitSystemEvent;
    /**
     * Creates a timeout promise
     */
    private createTimeoutPromise;
    /**
     * Generates a unique event ID
     */
    private generateEventId;
    /**
     * Creates an error with context
     */
    private createError;
}
//# sourceMappingURL=event-bus.d.ts.map