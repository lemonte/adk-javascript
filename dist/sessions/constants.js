"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SESSION_REPLICATION_MODES = exports.SESSION_INDEXING_STRATEGIES = exports.SESSION_SERIALIZATION_FORMATS = exports.SESSION_ENCRYPTION_ALGORITHMS = exports.SESSION_COMPRESSION_ALGORITHMS = exports.SESSION_CLEANUP_STRATEGIES = exports.SESSION_EVENT_BUFFER_SIZES = exports.SESSION_METRICS_INTERVALS = exports.SESSION_BACKUP_FORMATS = exports.SESSION_STORAGE_TYPES = exports.SESSION_ERROR_CODES = exports.SESSION_VALIDATION_RULES = exports.SESSION_ID_PATTERNS = exports.SESSION_STATE_PRIORITIES = exports.DEFAULT_SESSION_MANAGER_CONFIG = exports.MAX_SESSION_TIMEOUT = exports.MIN_SESSION_TIMEOUT = exports.DEFAULT_MAX_SESSIONS_PER_USER = exports.DEFAULT_CLEANUP_INTERVAL = exports.DEFAULT_MAX_EVENTS_PER_SESSION = exports.DEFAULT_SESSION_TIMEOUT = void 0;
const types_1 = require("./types");
/**
 * Default session timeout (24 hours in milliseconds)
 */
exports.DEFAULT_SESSION_TIMEOUT = 24 * 60 * 60 * 1000;
/**
 * Default maximum events per session
 */
exports.DEFAULT_MAX_EVENTS_PER_SESSION = 1000;
/**
 * Default cleanup interval (1 hour in milliseconds)
 */
exports.DEFAULT_CLEANUP_INTERVAL = 60 * 60 * 1000;
/**
 * Default maximum sessions per user
 */
exports.DEFAULT_MAX_SESSIONS_PER_USER = 10;
/**
 * Minimum session timeout (5 minutes in milliseconds)
 */
exports.MIN_SESSION_TIMEOUT = 5 * 60 * 1000;
/**
 * Maximum session timeout (7 days in milliseconds)
 */
exports.MAX_SESSION_TIMEOUT = 7 * 24 * 60 * 60 * 1000;
/**
 * Default session manager configuration
 */
exports.DEFAULT_SESSION_MANAGER_CONFIG = {
    defaultTimeout: exports.DEFAULT_SESSION_TIMEOUT,
    maxEventsPerSession: exports.DEFAULT_MAX_EVENTS_PER_SESSION,
    cleanupInterval: exports.DEFAULT_CLEANUP_INTERVAL,
    maxSessionsPerUser: exports.DEFAULT_MAX_SESSIONS_PER_USER,
    enablePersistence: false,
    storage: {
        type: 'memory'
    }
};
/**
 * Session state priorities (for cleanup ordering)
 */
exports.SESSION_STATE_PRIORITIES = {
    [types_1.SessionState.EXPIRED]: 1,
    [types_1.SessionState.TERMINATED]: 2,
    [types_1.SessionState.INACTIVE]: 3,
    [types_1.SessionState.ACTIVE]: 4
};
/**
 * Session ID generation patterns
 */
exports.SESSION_ID_PATTERNS = {
    /** UUID v4 pattern */
    UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    /** Alphanumeric pattern */
    ALPHANUMERIC: /^[a-zA-Z0-9]{8,32}$/,
    /** Custom pattern with prefix */
    PREFIXED: /^sess_[a-zA-Z0-9]{16,}$/
};
/**
 * Session validation rules
 */
exports.SESSION_VALIDATION_RULES = {
    /** Minimum session ID length */
    MIN_SESSION_ID_LENGTH: 8,
    /** Maximum session ID length */
    MAX_SESSION_ID_LENGTH: 64,
    /** Minimum user ID length */
    MIN_USER_ID_LENGTH: 1,
    /** Maximum user ID length */
    MAX_USER_ID_LENGTH: 128,
    /** Minimum app name length */
    MIN_APP_NAME_LENGTH: 1,
    /** Maximum app name length */
    MAX_APP_NAME_LENGTH: 64,
    /** Maximum metadata size in bytes */
    MAX_METADATA_SIZE: 64 * 1024, // 64KB
    /** Maximum custom data size in bytes */
    MAX_DATA_SIZE: 1024 * 1024, // 1MB
    /** Maximum number of events */
    MAX_EVENTS: 10000
};
/**
 * Session error codes
 */
exports.SESSION_ERROR_CODES = {
    /** Session not found */
    SESSION_NOT_FOUND: 'SESSION_NOT_FOUND',
    /** Session already exists */
    SESSION_ALREADY_EXISTS: 'SESSION_ALREADY_EXISTS',
    /** Session expired */
    SESSION_EXPIRED: 'SESSION_EXPIRED',
    /** Session terminated */
    SESSION_TERMINATED: 'SESSION_TERMINATED',
    /** Invalid session configuration */
    INVALID_SESSION_CONFIG: 'INVALID_SESSION_CONFIG',
    /** Session limit exceeded */
    SESSION_LIMIT_EXCEEDED: 'SESSION_LIMIT_EXCEEDED',
    /** Storage error */
    STORAGE_ERROR: 'STORAGE_ERROR',
    /** Validation error */
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    /** Timeout error */
    TIMEOUT_ERROR: 'TIMEOUT_ERROR',
    /** Permission denied */
    PERMISSION_DENIED: 'PERMISSION_DENIED'
};
/**
 * Session storage types
 */
exports.SESSION_STORAGE_TYPES = {
    MEMORY: 'memory',
    FILE: 'file',
    DATABASE: 'database',
    REDIS: 'redis'
};
/**
 * Session backup formats
 */
exports.SESSION_BACKUP_FORMATS = {
    JSON: 'json',
    BINARY: 'binary',
    COMPRESSED: 'compressed'
};
/**
 * Session metrics collection intervals
 */
exports.SESSION_METRICS_INTERVALS = {
    /** Real-time metrics (1 second) */
    REALTIME: 1000,
    /** Short-term metrics (1 minute) */
    SHORT_TERM: 60 * 1000,
    /** Medium-term metrics (5 minutes) */
    MEDIUM_TERM: 5 * 60 * 1000,
    /** Long-term metrics (1 hour) */
    LONG_TERM: 60 * 60 * 1000
};
/**
 * Session event buffer sizes
 */
exports.SESSION_EVENT_BUFFER_SIZES = {
    /** Small buffer for low-traffic sessions */
    SMALL: 100,
    /** Medium buffer for normal sessions */
    MEDIUM: 500,
    /** Large buffer for high-traffic sessions */
    LARGE: 1000,
    /** Extra large buffer for very active sessions */
    EXTRA_LARGE: 2000
};
/**
 * Session cleanup strategies
 */
exports.SESSION_CLEANUP_STRATEGIES = {
    /** Least Recently Used */
    LRU: 'lru',
    /** First In First Out */
    FIFO: 'fifo',
    /** Least Frequently Used */
    LFU: 'lfu',
    /** Time-based expiration */
    TTL: 'ttl',
    /** Size-based cleanup */
    SIZE: 'size'
};
/**
 * Session compression algorithms
 */
exports.SESSION_COMPRESSION_ALGORITHMS = {
    GZIP: 'gzip',
    DEFLATE: 'deflate',
    BROTLI: 'brotli',
    LZ4: 'lz4'
};
/**
 * Session encryption algorithms
 */
exports.SESSION_ENCRYPTION_ALGORITHMS = {
    AES_256_GCM: 'aes-256-gcm',
    AES_192_GCM: 'aes-192-gcm',
    AES_128_GCM: 'aes-128-gcm',
    CHACHA20_POLY1305: 'chacha20-poly1305'
};
/**
 * Session serialization formats
 */
exports.SESSION_SERIALIZATION_FORMATS = {
    JSON: 'json',
    MSGPACK: 'msgpack',
    PROTOBUF: 'protobuf',
    AVRO: 'avro'
};
/**
 * Session indexing strategies
 */
exports.SESSION_INDEXING_STRATEGIES = {
    /** Index by session ID */
    BY_ID: 'by_id',
    /** Index by user ID */
    BY_USER: 'by_user',
    /** Index by app name */
    BY_APP: 'by_app',
    /** Index by creation time */
    BY_CREATED_AT: 'by_created_at',
    /** Index by update time */
    BY_UPDATED_AT: 'by_updated_at',
    /** Index by expiration time */
    BY_EXPIRES_AT: 'by_expires_at',
    /** Composite index */
    COMPOSITE: 'composite'
};
/**
 * Session replication modes
 */
exports.SESSION_REPLICATION_MODES = {
    /** No replication */
    NONE: 'none',
    /** Synchronous replication */
    SYNC: 'sync',
    /** Asynchronous replication */
    ASYNC: 'async',
    /** Eventually consistent */
    EVENTUAL: 'eventual'
};
//# sourceMappingURL=constants.js.map