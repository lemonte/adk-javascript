import { EventPriority, EventDeliveryMode, EventPersistenceMode } from './types';
/**
 * Default event configuration values
 */
export declare const EVENT_DEFAULTS: {
    readonly MAX_LISTENERS: 100;
    readonly MEMORY_LEAK_WARNING: true;
    readonly CAPTURE_STACK_TRACE: false;
    readonly DEFAULT_PRIORITY: EventPriority.MEDIUM;
    readonly ASYNC_ERROR_HANDLING: true;
    readonly PERSISTENCE_MODE: EventPersistenceMode.MEMORY;
    readonly DELIVERY_MODE: EventDeliveryMode.FIRE_AND_FORGET;
    readonly MAX_CONCURRENT_PROCESSORS: 10;
    readonly PROCESSING_TIMEOUT: 30000;
    readonly ENABLE_METRICS: true;
    readonly METRICS_INTERVAL: 60000;
    readonly BUFFER_SIZE: 1000;
    readonly BUFFER_FLUSH_INTERVAL: 5000;
    readonly MAX_RETRY_ATTEMPTS: 3;
    readonly INITIAL_RETRY_DELAY: 1000;
    readonly BACKOFF_MULTIPLIER: 2;
    readonly MAX_RETRY_DELAY: 30000;
    readonly JITTER_FACTOR: 0.1;
    readonly MAX_EVENTS: 100000;
    readonly RETENTION_PERIOD: number;
    readonly COMPRESSION: false;
    readonly ENCRYPTION: false;
    readonly BATCH_SIZE: 100;
    readonly MAX_CONCURRENT_DISPATCHES: 50;
    readonly DISPATCH_TIMEOUT: 10000;
    readonly ENABLE_DISPATCH_METRICS: true;
    readonly ENABLE_DISPATCH_LOGGING: false;
    readonly MAX_ROUTES: 1000;
    readonly ENABLE_ROUTE_METRICS: true;
    readonly ENABLE_ROUTE_LOGGING: false;
};
/**
 * Event validation rules
 */
export declare const EVENT_VALIDATION_RULES: {
    readonly MIN_EVENT_ID_LENGTH: 1;
    readonly MAX_EVENT_ID_LENGTH: 255;
    readonly MIN_EVENT_TYPE_LENGTH: 1;
    readonly MAX_EVENT_TYPE_LENGTH: 100;
    readonly MAX_EVENT_DATA_SIZE: number;
    readonly MAX_METADATA_SIZE: number;
    readonly MAX_TAGS_COUNT: 50;
    readonly MAX_TAG_LENGTH: 50;
    readonly MIN_PRIORITY_VALUE: 0;
    readonly MAX_PRIORITY_VALUE: 100;
    readonly MAX_CORRELATION_ID_LENGTH: 255;
    readonly MAX_CAUSATION_ID_LENGTH: 255;
    readonly MAX_VERSION_LENGTH: 20;
    readonly MAX_SOURCE_LENGTH: 255;
};
/**
 * Event error codes
 */
export declare const EVENT_ERROR_CODES: {
    readonly INVALID_EVENT_ID: "INVALID_EVENT_ID";
    readonly INVALID_EVENT_TYPE: "INVALID_EVENT_TYPE";
    readonly INVALID_EVENT_DATA: "INVALID_EVENT_DATA";
    readonly INVALID_EVENT_TIMESTAMP: "INVALID_EVENT_TIMESTAMP";
    readonly INVALID_EVENT_PRIORITY: "INVALID_EVENT_PRIORITY";
    readonly INVALID_EVENT_STATUS: "INVALID_EVENT_STATUS";
    readonly EVENT_NOT_FOUND: "EVENT_NOT_FOUND";
    readonly EVENT_ALREADY_EXISTS: "EVENT_ALREADY_EXISTS";
    readonly EVENT_PROCESSING_FAILED: "EVENT_PROCESSING_FAILED";
    readonly EVENT_PROCESSING_TIMEOUT: "EVENT_PROCESSING_TIMEOUT";
    readonly EVENT_STORE_ERROR: "EVENT_STORE_ERROR";
    readonly EVENT_LISTENER_ERROR: "EVENT_LISTENER_ERROR";
    readonly EVENT_FILTER_ERROR: "EVENT_FILTER_ERROR";
    readonly EVENT_ROUTER_ERROR: "EVENT_ROUTER_ERROR";
    readonly EVENT_DISPATCHER_ERROR: "EVENT_DISPATCHER_ERROR";
    readonly MAX_LISTENERS_EXCEEDED: "MAX_LISTENERS_EXCEEDED";
    readonly MAX_EVENTS_EXCEEDED: "MAX_EVENTS_EXCEEDED";
    readonly RESOURCE_LIMIT_EXCEEDED: "RESOURCE_LIMIT_EXCEEDED";
    readonly CONFIGURATION_ERROR: "CONFIGURATION_ERROR";
    readonly SERIALIZATION_ERROR: "SERIALIZATION_ERROR";
    readonly DESERIALIZATION_ERROR: "DESERIALIZATION_ERROR";
};
/**
 * Event ID pattern for validation
 */
export declare const EVENT_ID_PATTERN: RegExp;
/**
 * Event type pattern for validation
 */
export declare const EVENT_TYPE_PATTERN: RegExp;
/**
 * Event priority weights for sorting
 */
export declare const EVENT_PRIORITY_WEIGHTS: {
    readonly low: 1;
    readonly medium: 2;
    readonly high: 3;
    readonly critical: 4;
};
/**
 * Event status priorities for processing order
 */
export declare const EVENT_STATUS_PRIORITIES: {
    readonly pending: 1;
    readonly processing: 2;
    readonly failed: 3;
    readonly processed: 4;
    readonly cancelled: 5;
};
/**
 * Built-in event types
 */
export declare const BUILT_IN_EVENT_TYPES: {
    readonly SYSTEM_STARTED: "system.started";
    readonly SYSTEM_STOPPED: "system.stopped";
    readonly SYSTEM_ERROR: "system.error";
    readonly EVENT_EMITTED: "event.emitted";
    readonly EVENT_PROCESSED: "event.processed";
    readonly EVENT_FAILED: "event.failed";
    readonly LISTENER_ADDED: "listener.added";
    readonly LISTENER_REMOVED: "listener.removed";
    readonly FILTER_ADDED: "filter.added";
    readonly FILTER_REMOVED: "filter.removed";
    readonly ROUTE_ADDED: "route.added";
    readonly ROUTE_REMOVED: "route.removed";
    readonly METRICS_COLLECTED: "metrics.collected";
    readonly BACKUP_CREATED: "backup.created";
    readonly BACKUP_RESTORED: "backup.restored";
};
/**
 * Event storage types
 */
export declare const EVENT_STORAGE_TYPES: {
    readonly MEMORY: "memory";
    readonly FILE: "file";
    readonly DATABASE: "database";
};
/**
 * Event backup formats
 */
export declare const EVENT_BACKUP_FORMATS: {
    readonly JSON: "json";
    readonly BINARY: "binary";
    readonly COMPRESSED: "compressed";
};
/**
 * Event metrics intervals (in milliseconds)
 */
export declare const EVENT_METRICS_INTERVALS: {
    readonly REAL_TIME: 1000;
    readonly FAST: 5000;
    readonly NORMAL: 30000;
    readonly SLOW: 60000;
    readonly VERY_SLOW: 300000;
};
/**
 * Event buffer sizes
 */
export declare const EVENT_BUFFER_SIZES: {
    readonly SMALL: 100;
    readonly MEDIUM: 500;
    readonly LARGE: 1000;
    readonly EXTRA_LARGE: 5000;
};
/**
 * Event cleanup strategies
 */
export declare const EVENT_CLEANUP_STRATEGIES: {
    readonly FIFO: "fifo";
    readonly LIFO: "lifo";
    readonly LRU: "lru";
    readonly PRIORITY: "priority";
    readonly TTL: "ttl";
};
/**
 * Event compression algorithms
 */
export declare const EVENT_COMPRESSION_ALGORITHMS: {
    readonly GZIP: "gzip";
    readonly DEFLATE: "deflate";
    readonly BROTLI: "brotli";
    readonly LZ4: "lz4";
};
/**
 * Event encryption algorithms
 */
export declare const EVENT_ENCRYPTION_ALGORITHMS: {
    readonly AES_256_GCM: "aes-256-gcm";
    readonly AES_256_CBC: "aes-256-cbc";
    readonly CHACHA20_POLY1305: "chacha20-poly1305";
};
/**
 * Event serialization formats
 */
export declare const EVENT_SERIALIZATION_FORMATS: {
    readonly JSON: "json";
    readonly MSGPACK: "msgpack";
    readonly PROTOBUF: "protobuf";
    readonly AVRO: "avro";
};
/**
 * Event indexing strategies
 */
export declare const EVENT_INDEXING_STRATEGIES: {
    readonly NONE: "none";
    readonly TYPE: "type";
    readonly TIMESTAMP: "timestamp";
    readonly PRIORITY: "priority";
    readonly SOURCE: "source";
    readonly CORRELATION_ID: "correlation_id";
    readonly COMPOSITE: "composite";
};
/**
 * Event replication modes
 */
export declare const EVENT_REPLICATION_MODES: {
    readonly NONE: "none";
    readonly SYNC: "sync";
    readonly ASYNC: "async";
    readonly EVENTUAL: "eventual";
};
/**
 * Event filter operators
 */
export declare const EVENT_FILTER_OPERATORS: {
    readonly EQUALS: "eq";
    readonly NOT_EQUALS: "ne";
    readonly GREATER_THAN: "gt";
    readonly GREATER_THAN_OR_EQUAL: "gte";
    readonly LESS_THAN: "lt";
    readonly LESS_THAN_OR_EQUAL: "lte";
    readonly IN: "in";
    readonly NOT_IN: "nin";
    readonly CONTAINS: "contains";
    readonly NOT_CONTAINS: "not_contains";
    readonly STARTS_WITH: "starts_with";
    readonly ENDS_WITH: "ends_with";
    readonly REGEX: "regex";
    readonly EXISTS: "exists";
    readonly NOT_EXISTS: "not_exists";
};
/**
 * Event logical operators
 */
export declare const EVENT_LOGICAL_OPERATORS: {
    readonly AND: "and";
    readonly OR: "or";
    readonly NOT: "not";
};
/**
 * Event manager configuration defaults
 */
export declare const EVENT_MANAGER_DEFAULTS: {
    readonly MAX_CONCURRENT_EVENTS: 1000;
    readonly EVENT_TIMEOUT: 30000;
    readonly ENABLE_PERSISTENCE: true;
    readonly ENABLE_METRICS: true;
    readonly ENABLE_LOGGING: false;
    readonly CLEANUP_INTERVAL: 300000;
    readonly METRICS_INTERVAL: 60000;
    readonly BACKUP_INTERVAL: 3600000;
    readonly MAX_EVENT_HISTORY: 10000;
    readonly EVENT_BATCH_SIZE: 100;
};
/**
 * Event executor configuration defaults
 */
export declare const EVENT_EXECUTOR_DEFAULTS: {
    readonly MAX_CONCURRENT_EXECUTIONS: 50;
    readonly EXECUTION_TIMEOUT: 10000;
    readonly ENABLE_RETRY: true;
    readonly ENABLE_CIRCUIT_BREAKER: false;
    readonly CIRCUIT_BREAKER_THRESHOLD: 5;
    readonly CIRCUIT_BREAKER_TIMEOUT: 60000;
    readonly ENABLE_RATE_LIMITING: false;
    readonly RATE_LIMIT: 100;
    readonly ENABLE_METRICS: true;
};
//# sourceMappingURL=constants.d.ts.map