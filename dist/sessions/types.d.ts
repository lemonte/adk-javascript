import { BaseEvent } from '../events';
import { Memory } from '../memory';
/**
 * Configuration for session management
 */
export interface SessionConfig {
    /** Session ID */
    id: string;
    /** User ID associated with the session */
    userId: string;
    /** Application name */
    appName: string;
    /** Session metadata */
    metadata?: Record<string, any>;
    /** Session timeout in milliseconds */
    timeout?: number;
    /** Maximum number of events to store */
    maxEvents?: number;
    /** Whether to persist session data */
    persistent?: boolean;
    /** Session creation timestamp */
    createdAt?: Date;
    /** Session last updated timestamp */
    updatedAt?: Date;
    /** Session expiration timestamp */
    expiresAt?: Date;
}
/**
 * Session data structure
 */
export interface SessionData {
    /** Session configuration */
    config: SessionConfig;
    /** Session events history */
    events: BaseEvent[];
    /** Session memory/context */
    memory?: Memory;
    /** Session state */
    state: SessionState;
    /** Custom session data */
    data?: Record<string, any>;
}
/**
 * Session state enumeration
 */
export declare enum SessionState {
    ACTIVE = "active",
    INACTIVE = "inactive",
    EXPIRED = "expired",
    TERMINATED = "terminated"
}
/**
 * Session service interface
 */
export interface SessionService {
    /**
     * Creates a new session
     */
    createSession(config: Omit<SessionConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<Session>;
    /**
     * Retrieves a session by ID
     */
    getSession(appName: string, userId: string, sessionId: string): Promise<Session | null>;
    /**
     * Updates an existing session
     */
    updateSession(session: Session): Promise<void>;
    /**
     * Deletes a session
     */
    deleteSession(appName: string, userId: string, sessionId: string): Promise<void>;
    /**
     * Lists sessions for a user
     */
    listSessions(appName: string, userId: string): Promise<Session[]>;
    /**
     * Checks if a session exists
     */
    sessionExists(appName: string, userId: string, sessionId: string): Promise<boolean>;
    /**
     * Cleans up expired sessions
     */
    cleanupExpiredSessions(): Promise<number>;
    /**
     * Gets session statistics
     */
    getSessionStats(appName?: string, userId?: string): Promise<SessionStats>;
}
/**
 * Session statistics
 */
export interface SessionStats {
    /** Total number of sessions */
    totalSessions: number;
    /** Number of active sessions */
    activeSessions: number;
    /** Number of expired sessions */
    expiredSessions: number;
    /** Average session duration in milliseconds */
    averageDuration: number;
    /** Sessions by state */
    sessionsByState: Record<SessionState, number>;
    /** Sessions by app */
    sessionsByApp: Record<string, number>;
    /** Memory usage statistics */
    memoryUsage: {
        totalSize: number;
        averageSize: number;
        maxSize: number;
    };
}
/**
 * Session event types
 */
export declare enum SessionEventType {
    SESSION_CREATED = "session_created",
    SESSION_UPDATED = "session_updated",
    SESSION_DELETED = "session_deleted",
    SESSION_EXPIRED = "session_expired",
    SESSION_ACTIVATED = "session_activated",
    SESSION_DEACTIVATED = "session_deactivated",
    EVENT_ADDED = "event_added",
    MEMORY_UPDATED = "memory_updated"
}
/**
 * Session event data
 */
export interface SessionEvent {
    /** Event type */
    type: SessionEventType;
    /** Session ID */
    sessionId: string;
    /** User ID */
    userId: string;
    /** Application name */
    appName: string;
    /** Event timestamp */
    timestamp: Date;
    /** Event data */
    data?: any;
}
/**
 * Session manager configuration
 */
export interface SessionManagerConfig {
    /** Default session timeout in milliseconds */
    defaultTimeout: number;
    /** Maximum number of events per session */
    maxEventsPerSession: number;
    /** Cleanup interval in milliseconds */
    cleanupInterval: number;
    /** Maximum number of sessions per user */
    maxSessionsPerUser: number;
    /** Whether to enable session persistence */
    enablePersistence: boolean;
    /** Session storage configuration */
    storage?: SessionStorageConfig;
}
/**
 * Session storage configuration
 */
export interface SessionStorageConfig {
    /** Storage type */
    type: 'memory' | 'file' | 'database' | 'redis';
    /** Storage connection string or configuration */
    connection?: string | Record<string, any>;
    /** Storage options */
    options?: Record<string, any>;
}
/**
 * Session query options
 */
export interface SessionQueryOptions {
    /** Filter by session state */
    state?: SessionState;
    /** Filter by creation date range */
    createdAfter?: Date;
    /** Filter by creation date range */
    createdBefore?: Date;
    /** Filter by last update date range */
    updatedAfter?: Date;
    /** Filter by last update date range */
    updatedBefore?: Date;
    /** Limit number of results */
    limit?: number;
    /** Offset for pagination */
    offset?: number;
    /** Sort order */
    sortBy?: 'createdAt' | 'updatedAt' | 'expiresAt';
    /** Sort direction */
    sortOrder?: 'asc' | 'desc';
}
/**
 * Session backup data
 */
export interface SessionBackup {
    /** Backup timestamp */
    timestamp: Date;
    /** Session data */
    sessions: SessionData[];
    /** Backup metadata */
    metadata: {
        version: string;
        totalSessions: number;
        appNames: string[];
        userIds: string[];
    };
}
/**
 * Session restore options
 */
export interface SessionRestoreOptions {
    /** Whether to overwrite existing sessions */
    overwrite?: boolean;
    /** Whether to validate session data */
    validate?: boolean;
    /** Filter sessions to restore */
    filter?: (session: SessionData) => boolean;
    /** Transform session data during restore */
    transform?: (session: SessionData) => SessionData;
}
/**
 * Session lifecycle hooks
 */
export interface SessionLifecycleHooks {
    /** Called before session creation */
    beforeCreate?: (config: SessionConfig) => Promise<void> | void;
    /** Called after session creation */
    afterCreate?: (session: Session) => Promise<void> | void;
    /** Called before session update */
    beforeUpdate?: (session: Session) => Promise<void> | void;
    /** Called after session update */
    afterUpdate?: (session: Session) => Promise<void> | void;
    /** Called before session deletion */
    beforeDelete?: (session: Session) => Promise<void> | void;
    /** Called after session deletion */
    afterDelete?: (sessionId: string, userId: string, appName: string) => Promise<void> | void;
    /** Called when session expires */
    onExpire?: (session: Session) => Promise<void> | void;
}
/**
 * Session validation result
 */
export interface SessionValidationResult {
    /** Whether the session is valid */
    isValid: boolean;
    /** Validation errors */
    errors: string[];
    /** Validation warnings */
    warnings: string[];
}
/**
 * Session metrics
 */
export interface SessionMetrics {
    /** Session creation rate (sessions per minute) */
    creationRate: number;
    /** Session update rate (updates per minute) */
    updateRate: number;
    /** Session deletion rate (deletions per minute) */
    deletionRate: number;
    /** Average session lifetime in milliseconds */
    averageLifetime: number;
    /** Memory usage per session */
    memoryPerSession: number;
    /** Event count per session */
    eventsPerSession: number;
    /** Error rate */
    errorRate: number;
}
//# sourceMappingURL=types.d.ts.map