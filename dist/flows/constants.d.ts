/**
 * Flow constants and default configurations
 */
import { FlowManagerConfig, FlowExecutorConfig, FlowRetryConfig } from './types';
/**
 * Default flow timeouts (in milliseconds)
 */
export declare const DEFAULT_FLOW_TIMEOUTS: {
    /** Default flow execution timeout */
    readonly FLOW_TIMEOUT: number;
    /** Default step execution timeout */
    readonly STEP_TIMEOUT: number;
    /** Default condition evaluation timeout */
    readonly CONDITION_TIMEOUT: number;
    /** Default retry delay */
    readonly RETRY_DELAY: 1000;
    /** Maximum retry delay */
    readonly MAX_RETRY_DELAY: number;
};
/**
 * Default flow limits
 */
export declare const DEFAULT_FLOW_LIMITS: {
    /** Maximum concurrent executions */
    readonly MAX_CONCURRENT_EXECUTIONS: 10;
    /** Maximum concurrent steps */
    readonly MAX_CONCURRENT_STEPS: 5;
    /** Maximum flow steps */
    readonly MAX_FLOW_STEPS: 100;
    /** Maximum retry attempts */
    readonly MAX_RETRY_ATTEMPTS: 3;
    /** Maximum flow nesting depth */
    readonly MAX_NESTING_DEPTH: 10;
    /** Maximum variable size */
    readonly MAX_VARIABLE_SIZE: number;
    /** Maximum context size */
    readonly MAX_CONTEXT_SIZE: number;
};
/**
 * Default flow manager configuration
 */
export declare const DEFAULT_FLOW_MANAGER_CONFIG: FlowManagerConfig;
/**
 * Default flow executor configuration
 */
export declare const DEFAULT_FLOW_EXECUTOR_CONFIG: FlowExecutorConfig;
/**
 * Default retry configuration
 */
export declare const DEFAULT_RETRY_CONFIG: FlowRetryConfig;
/**
 * Flow priority weights for scheduling
 */
export declare const FLOW_PRIORITY_WEIGHTS: {
    readonly low: 1;
    readonly normal: 2;
    readonly high: 3;
    readonly critical: 4;
};
/**
 * Flow execution mode configurations
 */
export declare const FLOW_EXECUTION_MODES: {
    readonly sequential: {
        readonly allowParallel: false;
        readonly requiresOrder: true;
        readonly supportsConditions: true;
        readonly supportsLoops: false;
    };
    readonly parallel: {
        readonly allowParallel: true;
        readonly requiresOrder: false;
        readonly supportsConditions: true;
        readonly supportsLoops: false;
    };
    readonly conditional: {
        readonly allowParallel: false;
        readonly requiresOrder: false;
        readonly supportsConditions: true;
        readonly supportsLoops: false;
    };
    readonly loop: {
        readonly allowParallel: false;
        readonly requiresOrder: true;
        readonly supportsConditions: true;
        readonly supportsLoops: true;
    };
};
/**
 * Built-in step types
 */
export declare const BUILT_IN_STEP_TYPES: {
    /** LLM model execution */
    readonly LLM: "llm";
    /** Tool execution */
    readonly TOOL: "tool";
    /** Agent execution */
    readonly AGENT: "agent";
    /** Condition evaluation */
    readonly CONDITION: "condition";
    /** Variable assignment */
    readonly ASSIGN: "assign";
    /** Data transformation */
    readonly TRANSFORM: "transform";
    /** HTTP request */
    readonly HTTP: "http";
    /** Delay/wait */
    readonly DELAY: "delay";
    /** Log message */
    readonly LOG: "log";
    /** Custom function */
    readonly FUNCTION: "function";
    /** Nested flow */
    readonly SUBFLOW: "subflow";
};
/**
 * Flow validation rules
 */
export declare const FLOW_VALIDATION_RULES: {
    /** Minimum flow name length */
    readonly MIN_NAME_LENGTH: 1;
    /** Maximum flow name length */
    readonly MAX_NAME_LENGTH: 100;
    /** Minimum flow description length */
    readonly MIN_DESCRIPTION_LENGTH: 0;
    /** Maximum flow description length */
    readonly MAX_DESCRIPTION_LENGTH: 1000;
    /** Valid flow ID pattern */
    readonly FLOW_ID_PATTERN: RegExp;
    /** Valid step ID pattern */
    readonly STEP_ID_PATTERN: RegExp;
    /** Valid variable name pattern */
    readonly VARIABLE_NAME_PATTERN: RegExp;
    /** Maximum tags per flow */
    readonly MAX_TAGS: 20;
    /** Maximum tag length */
    readonly MAX_TAG_LENGTH: 50;
};
/**
 * Flow error codes
 */
export declare const FLOW_ERROR_CODES: {
    /** Flow not found */
    readonly FLOW_NOT_FOUND: "FLOW_NOT_FOUND";
    /** Flow validation failed */
    readonly FLOW_VALIDATION_FAILED: "FLOW_VALIDATION_FAILED";
    /** Flow execution failed */
    readonly FLOW_EXECUTION_FAILED: "FLOW_EXECUTION_FAILED";
    /** Flow timeout */
    readonly FLOW_TIMEOUT: "FLOW_TIMEOUT";
    /** Flow cancelled */
    readonly FLOW_CANCELLED: "FLOW_CANCELLED";
    /** Step not found */
    readonly STEP_NOT_FOUND: "STEP_NOT_FOUND";
    /** Step validation failed */
    readonly STEP_VALIDATION_FAILED: "STEP_VALIDATION_FAILED";
    /** Step execution failed */
    readonly STEP_EXECUTION_FAILED: "STEP_EXECUTION_FAILED";
    /** Step timeout */
    readonly STEP_TIMEOUT: "STEP_TIMEOUT";
    /** Condition evaluation failed */
    readonly CONDITION_FAILED: "CONDITION_FAILED";
    /** Dependency not met */
    readonly DEPENDENCY_NOT_MET: "DEPENDENCY_NOT_MET";
    /** Circular dependency */
    readonly CIRCULAR_DEPENDENCY: "CIRCULAR_DEPENDENCY";
    /** Invalid configuration */
    readonly INVALID_CONFIG: "INVALID_CONFIG";
    /** Resource limit exceeded */
    readonly RESOURCE_LIMIT_EXCEEDED: "RESOURCE_LIMIT_EXCEEDED";
    /** Storage error */
    readonly STORAGE_ERROR: "STORAGE_ERROR";
    /** Network error */
    readonly NETWORK_ERROR: "NETWORK_ERROR";
    /** Authentication error */
    readonly AUTH_ERROR: "AUTH_ERROR";
    /** Permission denied */
    readonly PERMISSION_DENIED: "PERMISSION_DENIED";
};
/**
 * Flow storage types
 */
export declare const FLOW_STORAGE_TYPES: {
    /** In-memory storage */
    readonly MEMORY: "memory";
    /** File system storage */
    readonly FILE: "file";
    /** Database storage */
    readonly DATABASE: "database";
    /** Cloud storage */
    readonly CLOUD: "cloud";
};
/**
 * Flow backup formats
 */
export declare const FLOW_BACKUP_FORMATS: {
    /** JSON format */
    readonly JSON: "json";
    /** YAML format */
    readonly YAML: "yaml";
    /** Binary format */
    readonly BINARY: "binary";
};
/**
 * Flow metrics intervals (in milliseconds)
 */
export declare const FLOW_METRICS_INTERVALS: {
    /** Real-time metrics */
    readonly REAL_TIME: 1000;
    /** Short-term metrics */
    readonly SHORT_TERM: number;
    /** Medium-term metrics */
    readonly MEDIUM_TERM: number;
    /** Long-term metrics */
    readonly LONG_TERM: number;
};
/**
 * Flow event buffer sizes
 */
export declare const FLOW_EVENT_BUFFER_SIZES: {
    /** Small buffer */
    readonly SMALL: 100;
    /** Medium buffer */
    readonly MEDIUM: 500;
    /** Large buffer */
    readonly LARGE: 1000;
    /** Extra large buffer */
    readonly EXTRA_LARGE: 5000;
};
/**
 * Flow cleanup strategies
 */
export declare const FLOW_CLEANUP_STRATEGIES: {
    /** Immediate cleanup */
    readonly IMMEDIATE: "immediate";
    /** Delayed cleanup */
    readonly DELAYED: "delayed";
    /** Manual cleanup */
    readonly MANUAL: "manual";
    /** Automatic cleanup */
    readonly AUTOMATIC: "automatic";
};
/**
 * Flow compression algorithms
 */
export declare const FLOW_COMPRESSION_ALGORITHMS: {
    /** No compression */
    readonly NONE: "none";
    /** GZIP compression */
    readonly GZIP: "gzip";
    /** LZ4 compression */
    readonly LZ4: "lz4";
    /** Brotli compression */
    readonly BROTLI: "brotli";
};
/**
 * Flow encryption algorithms
 */
export declare const FLOW_ENCRYPTION_ALGORITHMS: {
    /** No encryption */
    readonly NONE: "none";
    /** AES-256-GCM encryption */
    readonly AES_256_GCM: "aes-256-gcm";
    /** ChaCha20-Poly1305 encryption */
    readonly CHACHA20_POLY1305: "chacha20-poly1305";
};
/**
 * Flow serialization formats
 */
export declare const FLOW_SERIALIZATION_FORMATS: {
    /** JSON serialization */
    readonly JSON: "json";
    /** MessagePack serialization */
    readonly MSGPACK: "msgpack";
    /** Protocol Buffers serialization */
    readonly PROTOBUF: "protobuf";
    /** Avro serialization */
    readonly AVRO: "avro";
};
/**
 * Flow indexing strategies
 */
export declare const FLOW_INDEXING_STRATEGIES: {
    /** No indexing */
    readonly NONE: "none";
    /** Hash-based indexing */
    readonly HASH: "hash";
    /** Tree-based indexing */
    readonly TREE: "tree";
    /** Full-text indexing */
    readonly FULL_TEXT: "full_text";
};
/**
 * Flow replication modes
 */
export declare const FLOW_REPLICATION_MODES: {
    /** No replication */
    readonly NONE: "none";
    /** Master-slave replication */
    readonly MASTER_SLAVE: "master_slave";
    /** Master-master replication */
    readonly MASTER_MASTER: "master_master";
    /** Distributed replication */
    readonly DISTRIBUTED: "distributed";
};
/**
 * Flow condition operators
 */
export declare const FLOW_CONDITION_OPERATORS: {
    /** Equality */
    readonly EQUALS: "equals";
    /** Inequality */
    readonly NOT_EQUALS: "not_equals";
    /** Greater than */
    readonly GREATER_THAN: "greater_than";
    /** Less than */
    readonly LESS_THAN: "less_than";
    /** Greater than or equal */
    readonly GREATER_THAN_OR_EQUAL: "greater_than_or_equal";
    /** Less than or equal */
    readonly LESS_THAN_OR_EQUAL: "less_than_or_equal";
    /** Contains */
    readonly CONTAINS: "contains";
    /** Starts with */
    readonly STARTS_WITH: "starts_with";
    /** Ends with */
    readonly ENDS_WITH: "ends_with";
    /** Matches regex */
    readonly MATCHES: "matches";
    /** Exists */
    readonly EXISTS: "exists";
    /** Is null */
    readonly IS_NULL: "is_null";
    /** Is empty */
    readonly IS_EMPTY: "is_empty";
    /** Custom condition */
    readonly CUSTOM: "custom";
};
/**
 * Flow logical operators
 */
export declare const FLOW_LOGICAL_OPERATORS: {
    /** Logical AND */
    readonly AND: "and";
    /** Logical OR */
    readonly OR: "or";
    /** Logical NOT */
    readonly NOT: "not";
    /** Logical XOR */
    readonly XOR: "xor";
};
//# sourceMappingURL=constants.d.ts.map