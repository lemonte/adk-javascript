"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EVENT_EXECUTOR_DEFAULTS = exports.EVENT_MANAGER_DEFAULTS = exports.EVENT_LOGICAL_OPERATORS = exports.EVENT_FILTER_OPERATORS = exports.EVENT_REPLICATION_MODES = exports.EVENT_INDEXING_STRATEGIES = exports.EVENT_SERIALIZATION_FORMATS = exports.EVENT_ENCRYPTION_ALGORITHMS = exports.EVENT_COMPRESSION_ALGORITHMS = exports.EVENT_CLEANUP_STRATEGIES = exports.EVENT_BUFFER_SIZES = exports.EVENT_METRICS_INTERVALS = exports.EVENT_BACKUP_FORMATS = exports.EVENT_STORAGE_TYPES = exports.BUILT_IN_EVENT_TYPES = exports.EVENT_STATUS_PRIORITIES = exports.EVENT_PRIORITY_WEIGHTS = exports.EVENT_TYPE_PATTERN = exports.EVENT_ID_PATTERN = exports.EVENT_ERROR_CODES = exports.EVENT_VALIDATION_RULES = exports.EVENT_DEFAULTS = void 0;
const types_1 = require("./types");
/**
 * Default event configuration values
 */
exports.EVENT_DEFAULTS = {
    // Event emitter defaults
    MAX_LISTENERS: 100,
    MEMORY_LEAK_WARNING: true,
    CAPTURE_STACK_TRACE: false,
    DEFAULT_PRIORITY: types_1.EventPriority.MEDIUM,
    ASYNC_ERROR_HANDLING: true,
    // Event bus defaults
    PERSISTENCE_MODE: types_1.EventPersistenceMode.MEMORY,
    DELIVERY_MODE: types_1.EventDeliveryMode.FIRE_AND_FORGET,
    MAX_CONCURRENT_PROCESSORS: 10,
    PROCESSING_TIMEOUT: 30000, // 30 seconds
    ENABLE_METRICS: true,
    METRICS_INTERVAL: 60000, // 1 minute
    BUFFER_SIZE: 1000,
    BUFFER_FLUSH_INTERVAL: 5000, // 5 seconds
    // Retry defaults
    MAX_RETRY_ATTEMPTS: 3,
    INITIAL_RETRY_DELAY: 1000, // 1 second
    BACKOFF_MULTIPLIER: 2,
    MAX_RETRY_DELAY: 30000, // 30 seconds
    JITTER_FACTOR: 0.1,
    // Event store defaults
    MAX_EVENTS: 100000,
    RETENTION_PERIOD: 7 * 24 * 60 * 60 * 1000, // 7 days
    COMPRESSION: false,
    ENCRYPTION: false,
    BATCH_SIZE: 100,
    // Event dispatcher defaults
    MAX_CONCURRENT_DISPATCHES: 50,
    DISPATCH_TIMEOUT: 10000, // 10 seconds
    ENABLE_DISPATCH_METRICS: true,
    ENABLE_DISPATCH_LOGGING: false,
    // Event router defaults
    MAX_ROUTES: 1000,
    ENABLE_ROUTE_METRICS: true,
    ENABLE_ROUTE_LOGGING: false
};
/**
 * Event validation rules
 */
exports.EVENT_VALIDATION_RULES = {
    MIN_EVENT_ID_LENGTH: 1,
    MAX_EVENT_ID_LENGTH: 255,
    MIN_EVENT_TYPE_LENGTH: 1,
    MAX_EVENT_TYPE_LENGTH: 100,
    MAX_EVENT_DATA_SIZE: 1024 * 1024, // 1MB
    MAX_METADATA_SIZE: 64 * 1024, // 64KB
    MAX_TAGS_COUNT: 50,
    MAX_TAG_LENGTH: 50,
    MIN_PRIORITY_VALUE: 0,
    MAX_PRIORITY_VALUE: 100,
    MAX_CORRELATION_ID_LENGTH: 255,
    MAX_CAUSATION_ID_LENGTH: 255,
    MAX_VERSION_LENGTH: 20,
    MAX_SOURCE_LENGTH: 255
};
/**
 * Event error codes
 */
exports.EVENT_ERROR_CODES = {
    INVALID_EVENT_ID: 'INVALID_EVENT_ID',
    INVALID_EVENT_TYPE: 'INVALID_EVENT_TYPE',
    INVALID_EVENT_DATA: 'INVALID_EVENT_DATA',
    INVALID_EVENT_TIMESTAMP: 'INVALID_EVENT_TIMESTAMP',
    INVALID_EVENT_PRIORITY: 'INVALID_EVENT_PRIORITY',
    INVALID_EVENT_STATUS: 'INVALID_EVENT_STATUS',
    EVENT_NOT_FOUND: 'EVENT_NOT_FOUND',
    EVENT_ALREADY_EXISTS: 'EVENT_ALREADY_EXISTS',
    EVENT_PROCESSING_FAILED: 'EVENT_PROCESSING_FAILED',
    EVENT_PROCESSING_TIMEOUT: 'EVENT_PROCESSING_TIMEOUT',
    EVENT_STORE_ERROR: 'EVENT_STORE_ERROR',
    EVENT_LISTENER_ERROR: 'EVENT_LISTENER_ERROR',
    EVENT_FILTER_ERROR: 'EVENT_FILTER_ERROR',
    EVENT_ROUTER_ERROR: 'EVENT_ROUTER_ERROR',
    EVENT_DISPATCHER_ERROR: 'EVENT_DISPATCHER_ERROR',
    MAX_LISTENERS_EXCEEDED: 'MAX_LISTENERS_EXCEEDED',
    MAX_EVENTS_EXCEEDED: 'MAX_EVENTS_EXCEEDED',
    RESOURCE_LIMIT_EXCEEDED: 'RESOURCE_LIMIT_EXCEEDED',
    CONFIGURATION_ERROR: 'CONFIGURATION_ERROR',
    SERIALIZATION_ERROR: 'SERIALIZATION_ERROR',
    DESERIALIZATION_ERROR: 'DESERIALIZATION_ERROR'
};
/**
 * Event ID pattern for validation
 */
exports.EVENT_ID_PATTERN = /^[a-zA-Z0-9_-]+$/;
/**
 * Event type pattern for validation
 */
exports.EVENT_TYPE_PATTERN = /^[a-zA-Z0-9._-]+$/;
/**
 * Event priority weights for sorting
 */
exports.EVENT_PRIORITY_WEIGHTS = {
    [types_1.EventPriority.LOW]: 1,
    [types_1.EventPriority.MEDIUM]: 2,
    [types_1.EventPriority.HIGH]: 3,
    [types_1.EventPriority.CRITICAL]: 4
};
/**
 * Event status priorities for processing order
 */
exports.EVENT_STATUS_PRIORITIES = {
    [types_1.EventStatus.PENDING]: 1,
    [types_1.EventStatus.PROCESSING]: 2,
    [types_1.EventStatus.FAILED]: 3,
    [types_1.EventStatus.PROCESSED]: 4,
    [types_1.EventStatus.CANCELLED]: 5
};
/**
 * Built-in event types
 */
exports.BUILT_IN_EVENT_TYPES = {
    SYSTEM_STARTED: 'system.started',
    SYSTEM_STOPPED: 'system.stopped',
    SYSTEM_ERROR: 'system.error',
    EVENT_EMITTED: 'event.emitted',
    EVENT_PROCESSED: 'event.processed',
    EVENT_FAILED: 'event.failed',
    LISTENER_ADDED: 'listener.added',
    LISTENER_REMOVED: 'listener.removed',
    FILTER_ADDED: 'filter.added',
    FILTER_REMOVED: 'filter.removed',
    ROUTE_ADDED: 'route.added',
    ROUTE_REMOVED: 'route.removed',
    METRICS_COLLECTED: 'metrics.collected',
    BACKUP_CREATED: 'backup.created',
    BACKUP_RESTORED: 'backup.restored'
};
/**
 * Event storage types
 */
exports.EVENT_STORAGE_TYPES = {
    MEMORY: 'memory',
    FILE: 'file',
    DATABASE: 'database'
};
/**
 * Event backup formats
 */
exports.EVENT_BACKUP_FORMATS = {
    JSON: 'json',
    BINARY: 'binary',
    COMPRESSED: 'compressed'
};
/**
 * Event metrics intervals (in milliseconds)
 */
exports.EVENT_METRICS_INTERVALS = {
    REAL_TIME: 1000, // 1 second
    FAST: 5000, // 5 seconds
    NORMAL: 30000, // 30 seconds
    SLOW: 60000, // 1 minute
    VERY_SLOW: 300000 // 5 minutes
};
/**
 * Event buffer sizes
 */
exports.EVENT_BUFFER_SIZES = {
    SMALL: 100,
    MEDIUM: 500,
    LARGE: 1000,
    EXTRA_LARGE: 5000
};
/**
 * Event cleanup strategies
 */
exports.EVENT_CLEANUP_STRATEGIES = {
    FIFO: 'fifo', // First In, First Out
    LIFO: 'lifo', // Last In, First Out
    LRU: 'lru', // Least Recently Used
    PRIORITY: 'priority', // Based on event priority
    TTL: 'ttl' // Time To Live
};
/**
 * Event compression algorithms
 */
exports.EVENT_COMPRESSION_ALGORITHMS = {
    GZIP: 'gzip',
    DEFLATE: 'deflate',
    BROTLI: 'brotli',
    LZ4: 'lz4'
};
/**
 * Event encryption algorithms
 */
exports.EVENT_ENCRYPTION_ALGORITHMS = {
    AES_256_GCM: 'aes-256-gcm',
    AES_256_CBC: 'aes-256-cbc',
    CHACHA20_POLY1305: 'chacha20-poly1305'
};
/**
 * Event serialization formats
 */
exports.EVENT_SERIALIZATION_FORMATS = {
    JSON: 'json',
    MSGPACK: 'msgpack',
    PROTOBUF: 'protobuf',
    AVRO: 'avro'
};
/**
 * Event indexing strategies
 */
exports.EVENT_INDEXING_STRATEGIES = {
    NONE: 'none',
    TYPE: 'type',
    TIMESTAMP: 'timestamp',
    PRIORITY: 'priority',
    SOURCE: 'source',
    CORRELATION_ID: 'correlation_id',
    COMPOSITE: 'composite'
};
/**
 * Event replication modes
 */
exports.EVENT_REPLICATION_MODES = {
    NONE: 'none',
    SYNC: 'sync',
    ASYNC: 'async',
    EVENTUAL: 'eventual'
};
/**
 * Event filter operators
 */
exports.EVENT_FILTER_OPERATORS = {
    EQUALS: 'eq',
    NOT_EQUALS: 'ne',
    GREATER_THAN: 'gt',
    GREATER_THAN_OR_EQUAL: 'gte',
    LESS_THAN: 'lt',
    LESS_THAN_OR_EQUAL: 'lte',
    IN: 'in',
    NOT_IN: 'nin',
    CONTAINS: 'contains',
    NOT_CONTAINS: 'not_contains',
    STARTS_WITH: 'starts_with',
    ENDS_WITH: 'ends_with',
    REGEX: 'regex',
    EXISTS: 'exists',
    NOT_EXISTS: 'not_exists'
};
/**
 * Event logical operators
 */
exports.EVENT_LOGICAL_OPERATORS = {
    AND: 'and',
    OR: 'or',
    NOT: 'not'
};
/**
 * Event manager configuration defaults
 */
exports.EVENT_MANAGER_DEFAULTS = {
    MAX_CONCURRENT_EVENTS: 1000,
    EVENT_TIMEOUT: 30000, // 30 seconds
    ENABLE_PERSISTENCE: true,
    ENABLE_METRICS: true,
    ENABLE_LOGGING: false,
    CLEANUP_INTERVAL: 300000, // 5 minutes
    METRICS_INTERVAL: 60000, // 1 minute
    BACKUP_INTERVAL: 3600000, // 1 hour
    MAX_EVENT_HISTORY: 10000,
    EVENT_BATCH_SIZE: 100
};
/**
 * Event executor configuration defaults
 */
exports.EVENT_EXECUTOR_DEFAULTS = {
    MAX_CONCURRENT_EXECUTIONS: 50,
    EXECUTION_TIMEOUT: 10000, // 10 seconds
    ENABLE_RETRY: true,
    ENABLE_CIRCUIT_BREAKER: false,
    CIRCUIT_BREAKER_THRESHOLD: 5,
    CIRCUIT_BREAKER_TIMEOUT: 60000, // 1 minute
    ENABLE_RATE_LIMITING: false,
    RATE_LIMIT: 100, // events per second
    ENABLE_METRICS: true
};
//# sourceMappingURL=constants.js.map