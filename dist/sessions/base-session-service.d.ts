import { Session } from './session';
import { SessionConfig, SessionService, SessionStats, SessionQueryOptions, SessionBackup, SessionRestoreOptions } from './types';
/**
 * Abstract base class for session services
 */
export declare abstract class BaseSessionService implements SessionService {
    /**
     * Creates a new session
     */
    abstract createSession(config: Omit<SessionConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<Session>;
    /**
     * Retrieves a session by ID
     */
    abstract getSession(appName: string, userId: string, sessionId: string): Promise<Session | null>;
    /**
     * Updates an existing session
     */
    abstract updateSession(session: Session): Promise<void>;
    /**
     * Deletes a session
     */
    abstract deleteSession(appName: string, userId: string, sessionId: string): Promise<void>;
    /**
     * Lists sessions for a user
     */
    abstract listSessions(appName: string, userId: string, options?: SessionQueryOptions): Promise<Session[]>;
    /**
     * Checks if a session exists
     */
    abstract sessionExists(appName: string, userId: string, sessionId: string): Promise<boolean>;
    /**
     * Cleans up expired sessions
     */
    abstract cleanupExpiredSessions(): Promise<number>;
    /**
     * Gets session statistics
     */
    abstract getSessionStats(appName?: string, userId?: string): Promise<SessionStats>;
    /**
     * Lists all sessions with optional filtering
     */
    abstract listAllSessions(options?: SessionQueryOptions): Promise<Session[]>;
    /**
     * Gets sessions by app name
     */
    abstract getSessionsByApp(appName: string, options?: SessionQueryOptions): Promise<Session[]>;
    /**
     * Gets sessions by user ID across all apps
     */
    abstract getSessionsByUser(userId: string, options?: SessionQueryOptions): Promise<Session[]>;
    /**
     * Counts sessions matching criteria
     */
    abstract countSessions(appName?: string, userId?: string, options?: SessionQueryOptions): Promise<number>;
    /**
     * Backs up sessions to a data structure
     */
    abstract backupSessions(appName?: string, userId?: string): Promise<SessionBackup>;
    /**
     * Restores sessions from backup data
     */
    abstract restoreSessions(backup: SessionBackup, options?: SessionRestoreOptions): Promise<number>;
    /**
     * Validates session service configuration
     */
    abstract validateConfiguration(): Promise<boolean>;
    /**
     * Gets service health status
     */
    abstract getHealthStatus(): Promise<{
        healthy: boolean;
        details: Record<string, any>;
    }>;
    /**
     * Initializes the session service
     */
    abstract initialize(): Promise<void>;
    /**
     * Shuts down the session service
     */
    abstract shutdown(): Promise<void>;
    /**
     * Helper method to generate a unique session ID
     */
    protected generateSessionId(): string;
    /**
     * Helper method to validate session configuration
     */
    protected validateSessionConfig(config: Partial<SessionConfig>): string[];
    /**
     * Helper method to check if a session matches query options
     */
    protected matchesQueryOptions(session: Session, options?: SessionQueryOptions): boolean;
    /**
     * Helper method to sort sessions based on query options
     */
    protected sortSessions(sessions: Session[], options?: SessionQueryOptions): Session[];
    /**
     * Helper method to apply pagination to sessions
     */
    protected paginateSessions(sessions: Session[], options?: SessionQueryOptions): Session[];
    /**
     * Helper method to calculate session statistics
     */
    protected calculateStats(sessions: Session[]): SessionStats;
    /**
     * Helper method to create a session backup
     */
    protected createBackup(sessions: Session[]): SessionBackup;
}
//# sourceMappingURL=base-session-service.d.ts.map