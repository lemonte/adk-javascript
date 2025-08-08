import { SessionManagerConfig, SessionState } from './types';
/**
 * Default session timeout (24 hours in milliseconds)
 */
export declare const DEFAULT_SESSION_TIMEOUT: number;
/**
 * Default maximum events per session
 */
export declare const DEFAULT_MAX_EVENTS_PER_SESSION = 1000;
/**
 * Default cleanup interval (1 hour in milliseconds)
 */
export declare const DEFAULT_CLEANUP_INTERVAL: number;
/**
 * Default maximum sessions per user
 */
export declare const DEFAULT_MAX_SESSIONS_PER_USER = 10;
/**
 * Minimum session timeout (5 minutes in milliseconds)
 */
export declare const MIN_SESSION_TIMEOUT: number;
/**
 * Maximum session timeout (7 days in milliseconds)
 */
export declare const MAX_SESSION_TIMEOUT: number;
/**
 * Default session manager configuration
 */
export declare const DEFAULT_SESSION_MANAGER_CONFIG: SessionManagerConfig;
/**
 * Session state priorities (for cleanup ordering)
 */
export declare const SESSION_STATE_PRIORITIES: Record<SessionState, number>;
/**
 * Session ID generation patterns
 */
export declare const SESSION_ID_PATTERNS: {
    /** UUID v4 pattern */
    UUID: RegExp;
    /** Alphanumeric pattern */
    ALPHANUMERIC: RegExp;
    /** Custom pattern with prefix */
    PREFIXED: RegExp;
};
/**
 * Session validation rules
 */
export declare const SESSION_VALIDATION_RULES: {
    /** Minimum session ID length */
    MIN_SESSION_ID_LENGTH: number;
    /** Maximum session ID length */
    MAX_SESSION_ID_LENGTH: number;
    /** Minimum user ID length */
    MIN_USER_ID_LENGTH: number;
    /** Maximum user ID length */
    MAX_USER_ID_LENGTH: number;
    /** Minimum app name length */
    MIN_APP_NAME_LENGTH: number;
    /** Maximum app name length */
    MAX_APP_NAME_LENGTH: number;
    /** Maximum metadata size in bytes */
    MAX_METADATA_SIZE: number;
    /** Maximum custom data size in bytes */
    MAX_DATA_SIZE: number;
    /** Maximum number of events */
    MAX_EVENTS: number;
};
/**
 * Session error codes
 */
export declare const SESSION_ERROR_CODES: {
    /** Session not found */
    SESSION_NOT_FOUND: string;
    /** Session already exists */
    SESSION_ALREADY_EXISTS: string;
    /** Session expired */
    SESSION_EXPIRED: string;
    /** Session terminated */
    SESSION_TERMINATED: string;
    /** Invalid session configuration */
    INVALID_SESSION_CONFIG: string;
    /** Session limit exceeded */
    SESSION_LIMIT_EXCEEDED: string;
    /** Storage error */
    STORAGE_ERROR: string;
    /** Validation error */
    VALIDATION_ERROR: string;
    /** Timeout error */
    TIMEOUT_ERROR: string;
    /** Permission denied */
    PERMISSION_DENIED: string;
};
/**
 * Session storage types
 */
export declare const SESSION_STORAGE_TYPES: {
    readonly MEMORY: "memory";
    readonly FILE: "file";
    readonly DATABASE: "database";
    readonly REDIS: "redis";
};
/**
 * Session backup formats
 */
export declare const SESSION_BACKUP_FORMATS: {
    readonly JSON: "json";
    readonly BINARY: "binary";
    readonly COMPRESSED: "compressed";
};
/**
 * Session metrics collection intervals
 */
export declare const SESSION_METRICS_INTERVALS: {
    /** Real-time metrics (1 second) */
    REALTIME: number;
    /** Short-term metrics (1 minute) */
    SHORT_TERM: number;
    /** Medium-term metrics (5 minutes) */
    MEDIUM_TERM: number;
    /** Long-term metrics (1 hour) */
    LONG_TERM: number;
};
/**
 * Session event buffer sizes
 */
export declare const SESSION_EVENT_BUFFER_SIZES: {
    /** Small buffer for low-traffic sessions */
    SMALL: number;
    /** Medium buffer for normal sessions */
    MEDIUM: number;
    /** Large buffer for high-traffic sessions */
    LARGE: number;
    /** Extra large buffer for very active sessions */
    EXTRA_LARGE: number;
};
/**
 * Session cleanup strategies
 */
export declare const SESSION_CLEANUP_STRATEGIES: {
    /** Least Recently Used */
    readonly LRU: "lru";
    /** First In First Out */
    readonly FIFO: "fifo";
    /** Least Frequently Used */
    readonly LFU: "lfu";
    /** Time-based expiration */
    readonly TTL: "ttl";
    /** Size-based cleanup */
    readonly SIZE: "size";
};
/**
 * Session compression algorithms
 */
export declare const SESSION_COMPRESSION_ALGORITHMS: {
    readonly GZIP: "gzip";
    readonly DEFLATE: "deflate";
    readonly BROTLI: "brotli";
    readonly LZ4: "lz4";
};
/**
 * Session encryption algorithms
 */
export declare const SESSION_ENCRYPTION_ALGORITHMS: {
    readonly AES_256_GCM: "aes-256-gcm";
    readonly AES_192_GCM: "aes-192-gcm";
    readonly AES_128_GCM: "aes-128-gcm";
    readonly CHACHA20_POLY1305: "chacha20-poly1305";
};
/**
 * Session serialization formats
 */
export declare const SESSION_SERIALIZATION_FORMATS: {
    readonly JSON: "json";
    readonly MSGPACK: "msgpack";
    readonly PROTOBUF: "protobuf";
    readonly AVRO: "avro";
};
/**
 * Session indexing strategies
 */
export declare const SESSION_INDEXING_STRATEGIES: {
    /** Index by session ID */
    readonly BY_ID: "by_id";
    /** Index by user ID */
    readonly BY_USER: "by_user";
    /** Index by app name */
    readonly BY_APP: "by_app";
    /** Index by creation time */
    readonly BY_CREATED_AT: "by_created_at";
    /** Index by update time */
    readonly BY_UPDATED_AT: "by_updated_at";
    /** Index by expiration time */
    readonly BY_EXPIRES_AT: "by_expires_at";
    /** Composite index */
    readonly COMPOSITE: "composite";
};
/**
 * Session replication modes
 */
export declare const SESSION_REPLICATION_MODES: {
    /** No replication */
    readonly NONE: "none";
    /** Synchronous replication */
    readonly SYNC: "sync";
    /** Asynchronous replication */
    readonly ASYNC: "async";
    /** Eventually consistent */
    readonly EVENTUAL: "eventual";
};
//# sourceMappingURL=constants.d.ts.map