import { Session } from './session';
import { Event } from '../events/event';
/**
 * Configuration for getting a session.
 */
export interface GetSessionConfig {
    numRecentEvents?: number;
    afterTimestamp?: number;
}
/**
 * Response for listing sessions.
 */
export interface ListSessionsResponse {
    sessions: Session[];
}
/**
 * An in-memory implementation of the session service.
 *
 * It is not suitable for multi-threaded production environments. Use it for
 * testing and development only.
 */
export declare class InMemorySessionService {
    private sessions;
    private userState;
    private appState;
    /**
     * Creates a new session.
     */
    createSession({ appName, userId, state, sessionId }: {
        appName: string;
        userId: string;
        state?: Record<string, any>;
        sessionId?: string;
    }): Promise<Session>;
    /**
     * Gets a session by ID.
     */
    getSession({ appName, userId, sessionId, config }: {
        appName: string;
        userId: string;
        sessionId: string;
        config?: GetSessionConfig;
    }): Promise<Session | null>;
    /**
     * Lists all sessions for a user.
     */
    listSessions({ appName, userId }: {
        appName: string;
        userId: string;
    }): Promise<ListSessionsResponse>;
    /**
     * Deletes a session.
     */
    deleteSession({ appName, userId, sessionId }: {
        appName: string;
        userId: string;
        sessionId: string;
    }): Promise<void>;
    /**
     * Adds an event to a session.
     */
    addEvent({ appName, userId, sessionId, event }: {
        appName: string;
        userId: string;
        sessionId: string;
        event: Event;
    }): Promise<void>;
    /**
     * Merges app and user state into the session.
     */
    private mergeState;
    /**
     * Sets app-level state.
     */
    setAppState(appName: string, key: string, value: any): Promise<void>;
    /**
     * Sets user-level state.
     */
    setUserState(appName: string, userId: string, key: string, value: any): Promise<void>;
}
//# sourceMappingURL=in-memory-session-service.d.ts.map