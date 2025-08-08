/**
 * Event system types and interfaces
 */
/**
 * Event priority levels
 */
export declare enum EventPriority {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    CRITICAL = "critical"
}
/**
 * Event status
 */
export declare enum EventStatus {
    PENDING = "pending",
    PROCESSING = "processing",
    PROCESSED = "processed",
    FAILED = "failed",
    CANCELLED = "cancelled"
}
/**
 * Event delivery modes
 */
export declare enum EventDeliveryMode {
    FIRE_AND_FORGET = "fire_and_forget",
    AT_LEAST_ONCE = "at_least_once",
    EXACTLY_ONCE = "exactly_once"
}
/**
 * Event persistence modes
 */
export declare enum EventPersistenceMode {
    NONE = "none",
    MEMORY = "memory",
    DISK = "disk",
    DATABASE = "database"
}
/**
 * Base event interface
 */
export interface BaseEvent {
    /** Unique event identifier */
    id: string;
    /** Event type/name */
    type: string;
    /** Event data payload */
    data: Record<string, any>;
    /** Event timestamp */
    timestamp: Date;
    /** Event source/origin */
    source?: string;
    /** Event priority */
    priority?: EventPriority;
    /** Event metadata */
    metadata?: Record<string, any>;
    /** Event correlation ID for tracking related events */
    correlationId?: string;
    /** Event causation ID for tracking event chains */
    causationId?: string;
    /** Event version for schema evolution */
    version?: string;
    /** Event tags for categorization */
    tags?: string[];
}
/**
 * Event with processing information
 */
export interface ProcessedEvent extends BaseEvent {
    /** Processing status */
    status: EventStatus;
    /** Processing start time */
    processedAt?: Date;
    /** Processing duration in milliseconds */
    processingDuration?: number;
    /** Processing error if failed */
    error?: Error;
    /** Number of processing attempts */
    attempts?: number;
    /** Next retry time if failed */
    nextRetryAt?: Date;
}
/**
 * Event listener function
 */
export type EventListener<T extends BaseEvent = BaseEvent> = (event: T) => void | Promise<void>;
/**
 * Event listener with options
 */
export interface EventListenerConfig<T extends BaseEvent = BaseEvent> {
    /** The listener function */
    listener: EventListener<T>;
    /** Listener priority (higher priority listeners are called first) */
    priority?: number;
    /** Whether the listener should only be called once */
    once?: boolean;
    /** Whether the listener is active */
    active?: boolean;
    /** Listener metadata */
    metadata?: Record<string, any>;
}
/**
 * Event filter function
 */
export type EventFilter<T extends BaseEvent = BaseEvent> = (event: T) => boolean;
/**
 * Event transformer function
 */
export type EventTransformer<T extends BaseEvent = BaseEvent, R extends BaseEvent = BaseEvent> = (event: T) => R | Promise<R>;
/**
 * Event middleware function
 */
export type EventMiddleware<T extends BaseEvent = BaseEvent> = (event: T, next: () => void | Promise<void>) => void | Promise<void>;
/**
 * Event emitter configuration
 */
export interface EventEmitterConfig {
    /** Maximum number of listeners per event type */
    maxListeners?: number;
    /** Whether to emit warnings for memory leaks */
    memoryLeakWarning?: boolean;
    /** Whether to capture stack traces for debugging */
    captureStackTrace?: boolean;
    /** Default event priority */
    defaultPriority?: EventPriority;
    /** Whether to enable async error handling */
    asyncErrorHandling?: boolean;
}
/**
 * Event bus configuration
 */
export interface EventBusConfig {
    /** Event emitter configuration */
    emitterConfig?: EventEmitterConfig;
    /** Event persistence mode */
    persistenceMode?: EventPersistenceMode;
    /** Event delivery mode */
    deliveryMode?: EventDeliveryMode;
    /** Maximum number of concurrent event processors */
    maxConcurrentProcessors?: number;
    /** Event processing timeout in milliseconds */
    processingTimeout?: number;
    /** Event retry configuration */
    retryConfig?: EventRetryConfig;
    /** Whether to enable event metrics */
    enableMetrics?: boolean;
    /** Metrics collection interval in milliseconds */
    metricsInterval?: number;
    /** Event buffer size for batching */
    bufferSize?: number;
    /** Buffer flush interval in milliseconds */
    bufferFlushInterval?: number;
}
/**
 * Event retry configuration
 */
export interface EventRetryConfig {
    /** Maximum number of retry attempts */
    maxAttempts: number;
    /** Initial retry delay in milliseconds */
    initialDelay: number;
    /** Backoff multiplier for exponential backoff */
    backoffMultiplier?: number;
    /** Maximum retry delay in milliseconds */
    maxDelay?: number;
    /** Jitter factor for randomizing retry delays */
    jitterFactor?: number;
}
/**
 * Event store configuration
 */
export interface EventStoreConfig {
    /** Storage backend type */
    storageType: 'memory' | 'file' | 'database';
    /** Storage connection string or path */
    connectionString?: string;
    /** Maximum number of events to store */
    maxEvents?: number;
    /** Event retention period in milliseconds */
    retentionPeriod?: number;
    /** Whether to compress stored events */
    compression?: boolean;
    /** Whether to encrypt stored events */
    encryption?: boolean;
    /** Batch size for bulk operations */
    batchSize?: number;
}
/**
 * Event query options
 */
export interface EventQueryOptions {
    /** Event types to include */
    types?: string[];
    /** Event sources to include */
    sources?: string[];
    /** Event tags to include */
    tags?: string[];
    /** Minimum event priority */
    minPriority?: EventPriority;
    /** Event status filter */
    status?: EventStatus;
    /** Start time for time range query */
    startTime?: Date;
    /** End time for time range query */
    endTime?: Date;
    /** Correlation ID filter */
    correlationId?: string;
    /** Causation ID filter */
    causationId?: string;
    /** Maximum number of events to return */
    limit?: number;
    /** Number of events to skip */
    offset?: number;
    /** Sort field */
    sortBy?: 'timestamp' | 'priority' | 'type';
    /** Sort order */
    sortOrder?: 'asc' | 'desc';
}
/**
 * Event statistics
 */
export interface EventStats {
    /** Total number of events */
    totalEvents: number;
    /** Number of events by type */
    eventsByType: Record<string, number>;
    /** Number of events by status */
    eventsByStatus: Record<EventStatus, number>;
    /** Number of events by priority */
    eventsByPriority: Record<EventPriority, number>;
    /** Average processing time in milliseconds */
    averageProcessingTime: number;
    /** Event throughput (events per second) */
    throughput: number;
    /** Error rate percentage */
    errorRate: number;
    /** Success rate percentage */
    successRate: number;
}
/**
 * Event metrics
 */
export interface EventMetrics {
    /** Event type */
    eventType: string;
    /** Number of events processed */
    processedCount: number;
    /** Number of successful events */
    successCount: number;
    /** Number of failed events */
    failureCount: number;
    /** Average processing duration in milliseconds */
    averageDuration: number;
    /** Minimum processing duration in milliseconds */
    minDuration: number;
    /** Maximum processing duration in milliseconds */
    maxDuration: number;
    /** Event throughput (events per minute) */
    throughput: number;
    /** Error rate percentage */
    errorRate: number;
    /** Last processing time */
    lastProcessedAt?: Date;
}
/**
 * Event backup data
 */
export interface EventBackup {
    /** Backup timestamp */
    timestamp: Date;
    /** Backup version */
    version: string;
    /** Backed up events */
    events: ProcessedEvent[];
    /** Backup metadata */
    metadata: {
        totalEvents: number;
        eventTypes: string[];
        timeRange: {
            start: Date;
            end: Date;
        };
        config: EventBusConfig;
    };
}
/**
 * Event restore options
 */
export interface EventRestoreOptions {
    /** Whether to overwrite existing events */
    overwrite?: boolean;
    /** Whether to validate events before restoring */
    validate?: boolean;
    /** Whether to backup existing events before restoring */
    backup?: boolean;
    /** Event types to restore (if not specified, all types are restored) */
    eventTypes?: string[];
    /** Time range for events to restore */
    timeRange?: {
        start?: Date;
        end?: Date;
    };
}
/**
 * Event validation result
 */
export interface EventValidationResult {
    /** Whether the event is valid */
    valid: boolean;
    /** Validation errors */
    errors: string[];
}
/**
 * Event dispatcher configuration
 */
export interface EventDispatcherConfig {
    /** Maximum number of concurrent dispatches */
    maxConcurrentDispatches?: number;
    /** Dispatch timeout in milliseconds */
    dispatchTimeout?: number;
    /** Whether to enable dispatch metrics */
    enableMetrics?: boolean;
    /** Whether to enable dispatch logging */
    enableLogging?: boolean;
    /** Dispatch retry configuration */
    retryConfig?: EventRetryConfig;
}
/**
 * Event router configuration
 */
export interface EventRouterConfig {
    /** Default route for unmatched events */
    defaultRoute?: string;
    /** Whether to enable route metrics */
    enableMetrics?: boolean;
    /** Whether to enable route logging */
    enableLogging?: boolean;
    /** Maximum number of routes */
    maxRoutes?: number;
}
/**
 * Event route definition
 */
export interface EventRoute {
    /** Route identifier */
    id: string;
    /** Route name */
    name: string;
    /** Event filter for this route */
    filter: EventFilter;
    /** Target destination for matched events */
    target: string;
    /** Route priority (higher priority routes are checked first) */
    priority?: number;
    /** Whether the route is active */
    active?: boolean;
    /** Route metadata */
    metadata?: Record<string, any>;
}
/**
 * Event lifecycle hooks
 */
export interface EventLifecycleHooks {
    /** Called before an event is emitted */
    beforeEmit?: (event: BaseEvent) => void | Promise<void>;
    /** Called after an event is emitted */
    afterEmit?: (event: BaseEvent) => void | Promise<void>;
    /** Called before an event is processed */
    beforeProcess?: (event: ProcessedEvent) => void | Promise<void>;
    /** Called after an event is processed */
    afterProcess?: (event: ProcessedEvent) => void | Promise<void>;
    /** Called when an event processing fails */
    onError?: (error: Error, event: ProcessedEvent) => void | Promise<void>;
}
/**
 * Event emitter interface
 */
export interface IEventEmitter {
    /** Emit an event */
    emit(event: BaseEvent): void | Promise<void>;
    /** Add an event listener */
    on<T extends BaseEvent>(eventType: string, listener: EventListener<T>): void;
    /** Add a one-time event listener */
    once<T extends BaseEvent>(eventType: string, listener: EventListener<T>): void;
    /** Remove an event listener */
    off<T extends BaseEvent>(eventType: string, listener: EventListener<T>): void;
    /** Remove all listeners for an event type */
    removeAllListeners(eventType?: string): void;
    /** Get the number of listeners for an event type */
    listenerCount(eventType: string): number;
    /** Get all event types with listeners */
    eventNames(): string[];
}
/**
 * Event store interface
 */
export interface IEventStore {
    /** Store an event */
    store(event: ProcessedEvent): Promise<void>;
    /** Retrieve an event by ID */
    get(eventId: string): Promise<ProcessedEvent | undefined>;
    /** Query events */
    query(options: EventQueryOptions): Promise<ProcessedEvent[]>;
    /** Count events */
    count(options?: EventQueryOptions): Promise<number>;
    /** Delete an event */
    delete(eventId: string): Promise<boolean>;
    /** Clear all events */
    clear(): Promise<void>;
    /** Get event statistics */
    getStats(): Promise<EventStats>;
}
/**
 * Event filter interface
 */
export interface IEventFilter {
    /** Add a filter */
    addFilter(name: string, filter: EventFilter): void;
    /** Remove a filter */
    removeFilter(name: string): void;
    /** Apply filters to an event */
    apply(event: BaseEvent): boolean;
    /** Get all filter names */
    getFilterNames(): string[];
}
/**
 * Event router interface
 */
export interface IEventRouter {
    /** Add a route */
    addRoute(route: EventRoute): void;
    /** Remove a route */
    removeRoute(routeId: string): void;
    /** Route an event */
    route(event: BaseEvent): string | undefined;
    /** Get all routes */
    getRoutes(): EventRoute[];
}
//# sourceMappingURL=types.d.ts.map