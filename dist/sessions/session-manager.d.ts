import { Session } from './session';
import { SessionConfig, SessionManagerConfig, SessionService, SessionStats, SessionQueryOptions, SessionBackup, SessionRestoreOptions, SessionLifecycleHooks, SessionEvent, SessionEventType, SessionMetrics } from './types';
/**
 * Session manager that provides high-level session management capabilities
 */
export declare class SessionManager {
    private service;
    private config;
    private hooks;
    private eventListeners;
    private metrics;
    private metricsInterval?;
    private isInitialized;
    constructor(service?: SessionService, config?: Partial<SessionManagerConfig>, hooks?: SessionLifecycleHooks);
    /**
     * Initializes the session manager
     */
    initialize(): Promise<void>;
    /**
     * Shuts down the session manager
     */
    shutdown(): Promise<void>;
    /**
     * Creates a new session with lifecycle hooks
     */
    createSession(config: Omit<SessionConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<Session>;
    /**
     * Gets a session with automatic expiration handling
     */
    getSession(appName: string, userId: string, sessionId: string): Promise<Session | null>;
    /**
     * Updates a session with lifecycle hooks
     */
    updateSession(session: Session): Promise<void>;
    /**
     * Deletes a session with lifecycle hooks
     */
    deleteSession(appName: string, userId: string, sessionId: string): Promise<void>;
    /**
     * Lists sessions with enhanced filtering
     */
    listSessions(appName: string, userId: string, options?: SessionQueryOptions): Promise<Session[]>;
    /**
     * Gets session statistics
     */
    getSessionStats(appName?: string, userId?: string): Promise<SessionStats>;
    /**
     * Gets current metrics
     */
    getMetrics(): SessionMetrics;
    /**
     * Resets metrics
     */
    resetMetrics(): void;
    /**
     * Adds an event listener
     */
    addEventListener(eventType: SessionEventType, listener: (event: SessionEvent) => void): void;
    /**
     * Removes an event listener
     */
    removeEventListener(eventType: SessionEventType, listener: (event: SessionEvent) => void): void;
    /**
     * Removes all event listeners for a type
     */
    removeAllEventListeners(eventType?: SessionEventType): void;
    /**
     * Activates a session
     */
    activateSession(appName: string, userId: string, sessionId: string): Promise<void>;
    /**
     * Deactivates a session
     */
    deactivateSession(appName: string, userId: string, sessionId: string): Promise<void>;
    /**
     * Extends a session's expiration time
     */
    extendSession(appName: string, userId: string, sessionId: string, additionalTime: number): Promise<void>;
    /**
     * Refreshes a session (resets expiration)
     */
    refreshSession(appName: string, userId: string, sessionId: string): Promise<void>;
    /**
     * Cleans up expired sessions
     */
    cleanupExpiredSessions(): Promise<number>;
    /**
     * Backs up sessions
     */
    backupSessions(appName?: string, userId?: string): Promise<SessionBackup>;
    /**
     * Restores sessions from backup
     */
    restoreSessions(backup: SessionBackup, options?: SessionRestoreOptions): Promise<number>;
    /**
     * Gets service health status
     */
    getHealthStatus(): Promise<{
        healthy: boolean;
        details: Record<string, any>;
    }>;
    /**
     * Gets the underlying session service
     */
    getService(): SessionService;
    /**
     * Gets the current configuration
     */
    getConfiguration(): SessionManagerConfig;
    /**
     * Updates the configuration
     */
    updateConfiguration(config: Partial<SessionManagerConfig>): void;
    /**
     * Gets the current hooks
     */
    getHooks(): SessionLifecycleHooks;
    /**
     * Updates the hooks
     */
    updateHooks(hooks: Partial<SessionLifecycleHooks>): void;
    /**
     * Emits a session event
     */
    private emitEvent;
    /**
     * Initializes metrics
     */
    private initializeMetrics;
    /**
     * Updates metrics
     */
    private updateMetrics;
    /**
     * Starts metrics collection
     */
    private startMetricsCollection;
}
//# sourceMappingURL=session-manager.d.ts.map