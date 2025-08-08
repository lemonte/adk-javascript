"use strict";
/**
 * Flow constants and default configurations
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.FLOW_LOGICAL_OPERATORS = exports.FLOW_CONDITION_OPERATORS = exports.FLOW_REPLICATION_MODES = exports.FLOW_INDEXING_STRATEGIES = exports.FLOW_SERIALIZATION_FORMATS = exports.FLOW_ENCRYPTION_ALGORITHMS = exports.FLOW_COMPRESSION_ALGORITHMS = exports.FLOW_CLEANUP_STRATEGIES = exports.FLOW_EVENT_BUFFER_SIZES = exports.FLOW_METRICS_INTERVALS = exports.FLOW_BACKUP_FORMATS = exports.FLOW_STORAGE_TYPES = exports.FLOW_ERROR_CODES = exports.FLOW_VALIDATION_RULES = exports.BUILT_IN_STEP_TYPES = exports.FLOW_EXECUTION_MODES = exports.FLOW_PRIORITY_WEIGHTS = exports.DEFAULT_RETRY_CONFIG = exports.DEFAULT_FLOW_EXECUTOR_CONFIG = exports.DEFAULT_FLOW_MANAGER_CONFIG = exports.DEFAULT_FLOW_LIMITS = exports.DEFAULT_FLOW_TIMEOUTS = void 0;
const types_1 = require("./types");
/**
 * Default flow timeouts (in milliseconds)
 */
exports.DEFAULT_FLOW_TIMEOUTS = {
    /** Default flow execution timeout */
    FLOW_TIMEOUT: 30 * 60 * 1000, // 30 minutes
    /** Default step execution timeout */
    STEP_TIMEOUT: 5 * 60 * 1000, // 5 minutes
    /** Default condition evaluation timeout */
    CONDITION_TIMEOUT: 10 * 1000, // 10 seconds
    /** Default retry delay */
    RETRY_DELAY: 1000, // 1 second
    /** Maximum retry delay */
    MAX_RETRY_DELAY: 60 * 1000, // 1 minute
};
/**
 * Default flow limits
 */
exports.DEFAULT_FLOW_LIMITS = {
    /** Maximum concurrent executions */
    MAX_CONCURRENT_EXECUTIONS: 10,
    /** Maximum concurrent steps */
    MAX_CONCURRENT_STEPS: 5,
    /** Maximum flow steps */
    MAX_FLOW_STEPS: 100,
    /** Maximum retry attempts */
    MAX_RETRY_ATTEMPTS: 3,
    /** Maximum flow nesting depth */
    MAX_NESTING_DEPTH: 10,
    /** Maximum variable size */
    MAX_VARIABLE_SIZE: 1024 * 1024, // 1MB
    /** Maximum context size */
    MAX_CONTEXT_SIZE: 10 * 1024 * 1024, // 10MB
};
/**
 * Default flow manager configuration
 */
exports.DEFAULT_FLOW_MANAGER_CONFIG = {
    maxConcurrentExecutions: exports.DEFAULT_FLOW_LIMITS.MAX_CONCURRENT_EXECUTIONS,
    defaultTimeout: exports.DEFAULT_FLOW_TIMEOUTS.FLOW_TIMEOUT,
    defaultRetry: {
        maxRetries: exports.DEFAULT_FLOW_LIMITS.MAX_RETRY_ATTEMPTS,
        delay: exports.DEFAULT_FLOW_TIMEOUTS.RETRY_DELAY,
        backoff: 'exponential',
        maxDelay: exports.DEFAULT_FLOW_TIMEOUTS.MAX_RETRY_DELAY,
    },
    enablePersistence: false,
    enableMetrics: true,
    metricsInterval: 60 * 1000, // 1 minute
    enableEvents: true,
    eventBufferSize: 1000,
};
/**
 * Default flow executor configuration
 */
exports.DEFAULT_FLOW_EXECUTOR_CONFIG = {
    maxConcurrentSteps: exports.DEFAULT_FLOW_LIMITS.MAX_CONCURRENT_STEPS,
    stepTimeout: exports.DEFAULT_FLOW_TIMEOUTS.STEP_TIMEOUT,
    enableRetry: true,
    defaultStepRetry: {
        maxRetries: exports.DEFAULT_FLOW_LIMITS.MAX_RETRY_ATTEMPTS,
        delay: exports.DEFAULT_FLOW_TIMEOUTS.RETRY_DELAY,
        backoff: 'exponential',
        maxDelay: exports.DEFAULT_FLOW_TIMEOUTS.MAX_RETRY_DELAY,
    },
    enableCaching: false,
    cacheTtl: 5 * 60 * 1000, // 5 minutes
};
/**
 * Default retry configuration
 */
exports.DEFAULT_RETRY_CONFIG = {
    maxRetries: exports.DEFAULT_FLOW_LIMITS.MAX_RETRY_ATTEMPTS,
    delay: exports.DEFAULT_FLOW_TIMEOUTS.RETRY_DELAY,
    backoff: 'exponential',
    maxDelay: exports.DEFAULT_FLOW_TIMEOUTS.MAX_RETRY_DELAY,
};
/**
 * Flow priority weights for scheduling
 */
exports.FLOW_PRIORITY_WEIGHTS = {
    [types_1.FlowPriority.LOW]: 1,
    [types_1.FlowPriority.NORMAL]: 2,
    [types_1.FlowPriority.HIGH]: 3,
    [types_1.FlowPriority.CRITICAL]: 4,
};
/**
 * Flow execution mode configurations
 */
exports.FLOW_EXECUTION_MODES = {
    [types_1.FlowExecutionMode.SEQUENTIAL]: {
        allowParallel: false,
        requiresOrder: true,
        supportsConditions: true,
        supportsLoops: false,
    },
    [types_1.FlowExecutionMode.PARALLEL]: {
        allowParallel: true,
        requiresOrder: false,
        supportsConditions: true,
        supportsLoops: false,
    },
    [types_1.FlowExecutionMode.CONDITIONAL]: {
        allowParallel: false,
        requiresOrder: false,
        supportsConditions: true,
        supportsLoops: false,
    },
    [types_1.FlowExecutionMode.LOOP]: {
        allowParallel: false,
        requiresOrder: true,
        supportsConditions: true,
        supportsLoops: true,
    },
};
/**
 * Built-in step types
 */
exports.BUILT_IN_STEP_TYPES = {
    /** LLM model execution */
    LLM: 'llm',
    /** Tool execution */
    TOOL: 'tool',
    /** Agent execution */
    AGENT: 'agent',
    /** Condition evaluation */
    CONDITION: 'condition',
    /** Variable assignment */
    ASSIGN: 'assign',
    /** Data transformation */
    TRANSFORM: 'transform',
    /** HTTP request */
    HTTP: 'http',
    /** Delay/wait */
    DELAY: 'delay',
    /** Log message */
    LOG: 'log',
    /** Custom function */
    FUNCTION: 'function',
    /** Nested flow */
    SUBFLOW: 'subflow',
};
/**
 * Flow validation rules
 */
exports.FLOW_VALIDATION_RULES = {
    /** Minimum flow name length */
    MIN_NAME_LENGTH: 1,
    /** Maximum flow name length */
    MAX_NAME_LENGTH: 100,
    /** Minimum flow description length */
    MIN_DESCRIPTION_LENGTH: 0,
    /** Maximum flow description length */
    MAX_DESCRIPTION_LENGTH: 1000,
    /** Valid flow ID pattern */
    FLOW_ID_PATTERN: /^[a-zA-Z0-9_-]+$/,
    /** Valid step ID pattern */
    STEP_ID_PATTERN: /^[a-zA-Z0-9_-]+$/,
    /** Valid variable name pattern */
    VARIABLE_NAME_PATTERN: /^[a-zA-Z_][a-zA-Z0-9_]*$/,
    /** Maximum tags per flow */
    MAX_TAGS: 20,
    /** Maximum tag length */
    MAX_TAG_LENGTH: 50,
};
/**
 * Flow error codes
 */
exports.FLOW_ERROR_CODES = {
    /** Flow not found */
    FLOW_NOT_FOUND: 'FLOW_NOT_FOUND',
    /** Flow validation failed */
    FLOW_VALIDATION_FAILED: 'FLOW_VALIDATION_FAILED',
    /** Flow execution failed */
    FLOW_EXECUTION_FAILED: 'FLOW_EXECUTION_FAILED',
    /** Flow timeout */
    FLOW_TIMEOUT: 'FLOW_TIMEOUT',
    /** Flow cancelled */
    FLOW_CANCELLED: 'FLOW_CANCELLED',
    /** Step not found */
    STEP_NOT_FOUND: 'STEP_NOT_FOUND',
    /** Step validation failed */
    STEP_VALIDATION_FAILED: 'STEP_VALIDATION_FAILED',
    /** Step execution failed */
    STEP_EXECUTION_FAILED: 'STEP_EXECUTION_FAILED',
    /** Step timeout */
    STEP_TIMEOUT: 'STEP_TIMEOUT',
    /** Condition evaluation failed */
    CONDITION_FAILED: 'CONDITION_FAILED',
    /** Dependency not met */
    DEPENDENCY_NOT_MET: 'DEPENDENCY_NOT_MET',
    /** Circular dependency */
    CIRCULAR_DEPENDENCY: 'CIRCULAR_DEPENDENCY',
    /** Invalid configuration */
    INVALID_CONFIG: 'INVALID_CONFIG',
    /** Resource limit exceeded */
    RESOURCE_LIMIT_EXCEEDED: 'RESOURCE_LIMIT_EXCEEDED',
    /** Storage error */
    STORAGE_ERROR: 'STORAGE_ERROR',
    /** Network error */
    NETWORK_ERROR: 'NETWORK_ERROR',
    /** Authentication error */
    AUTH_ERROR: 'AUTH_ERROR',
    /** Permission denied */
    PERMISSION_DENIED: 'PERMISSION_DENIED',
};
/**
 * Flow storage types
 */
exports.FLOW_STORAGE_TYPES = {
    /** In-memory storage */
    MEMORY: 'memory',
    /** File system storage */
    FILE: 'file',
    /** Database storage */
    DATABASE: 'database',
    /** Cloud storage */
    CLOUD: 'cloud',
};
/**
 * Flow backup formats
 */
exports.FLOW_BACKUP_FORMATS = {
    /** JSON format */
    JSON: 'json',
    /** YAML format */
    YAML: 'yaml',
    /** Binary format */
    BINARY: 'binary',
};
/**
 * Flow metrics intervals (in milliseconds)
 */
exports.FLOW_METRICS_INTERVALS = {
    /** Real-time metrics */
    REAL_TIME: 1000, // 1 second
    /** Short-term metrics */
    SHORT_TERM: 60 * 1000, // 1 minute
    /** Medium-term metrics */
    MEDIUM_TERM: 5 * 60 * 1000, // 5 minutes
    /** Long-term metrics */
    LONG_TERM: 60 * 60 * 1000, // 1 hour
};
/**
 * Flow event buffer sizes
 */
exports.FLOW_EVENT_BUFFER_SIZES = {
    /** Small buffer */
    SMALL: 100,
    /** Medium buffer */
    MEDIUM: 500,
    /** Large buffer */
    LARGE: 1000,
    /** Extra large buffer */
    EXTRA_LARGE: 5000,
};
/**
 * Flow cleanup strategies
 */
exports.FLOW_CLEANUP_STRATEGIES = {
    /** Immediate cleanup */
    IMMEDIATE: 'immediate',
    /** Delayed cleanup */
    DELAYED: 'delayed',
    /** Manual cleanup */
    MANUAL: 'manual',
    /** Automatic cleanup */
    AUTOMATIC: 'automatic',
};
/**
 * Flow compression algorithms
 */
exports.FLOW_COMPRESSION_ALGORITHMS = {
    /** No compression */
    NONE: 'none',
    /** GZIP compression */
    GZIP: 'gzip',
    /** LZ4 compression */
    LZ4: 'lz4',
    /** Brotli compression */
    BROTLI: 'brotli',
};
/**
 * Flow encryption algorithms
 */
exports.FLOW_ENCRYPTION_ALGORITHMS = {
    /** No encryption */
    NONE: 'none',
    /** AES-256-GCM encryption */
    AES_256_GCM: 'aes-256-gcm',
    /** ChaCha20-Poly1305 encryption */
    CHACHA20_POLY1305: 'chacha20-poly1305',
};
/**
 * Flow serialization formats
 */
exports.FLOW_SERIALIZATION_FORMATS = {
    /** JSON serialization */
    JSON: 'json',
    /** MessagePack serialization */
    MSGPACK: 'msgpack',
    /** Protocol Buffers serialization */
    PROTOBUF: 'protobuf',
    /** Avro serialization */
    AVRO: 'avro',
};
/**
 * Flow indexing strategies
 */
exports.FLOW_INDEXING_STRATEGIES = {
    /** No indexing */
    NONE: 'none',
    /** Hash-based indexing */
    HASH: 'hash',
    /** Tree-based indexing */
    TREE: 'tree',
    /** Full-text indexing */
    FULL_TEXT: 'full_text',
};
/**
 * Flow replication modes
 */
exports.FLOW_REPLICATION_MODES = {
    /** No replication */
    NONE: 'none',
    /** Master-slave replication */
    MASTER_SLAVE: 'master_slave',
    /** Master-master replication */
    MASTER_MASTER: 'master_master',
    /** Distributed replication */
    DISTRIBUTED: 'distributed',
};
/**
 * Flow condition operators
 */
exports.FLOW_CONDITION_OPERATORS = {
    /** Equality */
    EQUALS: 'equals',
    /** Inequality */
    NOT_EQUALS: 'not_equals',
    /** Greater than */
    GREATER_THAN: 'greater_than',
    /** Less than */
    LESS_THAN: 'less_than',
    /** Greater than or equal */
    GREATER_THAN_OR_EQUAL: 'greater_than_or_equal',
    /** Less than or equal */
    LESS_THAN_OR_EQUAL: 'less_than_or_equal',
    /** Contains */
    CONTAINS: 'contains',
    /** Starts with */
    STARTS_WITH: 'starts_with',
    /** Ends with */
    ENDS_WITH: 'ends_with',
    /** Matches regex */
    MATCHES: 'matches',
    /** Exists */
    EXISTS: 'exists',
    /** Is null */
    IS_NULL: 'is_null',
    /** Is empty */
    IS_EMPTY: 'is_empty',
    /** Custom condition */
    CUSTOM: 'custom',
};
/**
 * Flow logical operators
 */
exports.FLOW_LOGICAL_OPERATORS = {
    /** Logical AND */
    AND: 'and',
    /** Logical OR */
    OR: 'or',
    /** Logical NOT */
    NOT: 'not',
    /** Logical XOR */
    XOR: 'xor',
};
//# sourceMappingURL=constants.js.map