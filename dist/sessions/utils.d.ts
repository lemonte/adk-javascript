import { Session } from './session';
import { SessionConfig, SessionData, SessionQueryOptions, SessionStats } from './types';
/**
 * Utility functions for session management
 */
export declare class SessionUtils {
    /**
     * Generates a unique session ID
     */
    static generateSessionId(): string;
    /**
     * Validates a session ID format
     */
    static isValidSessionId(sessionId: string): boolean;
    /**
     * Validates session configuration
     */
    static validateSessionConfig(config: Partial<SessionConfig>): {
        valid: boolean;
        errors: string[];
    };
    /**
     * Sanitizes session data by removing sensitive information
     */
    static sanitizeSessionData(data: SessionData): SessionData;
    /**
     * Checks if a key is considered sensitive
     */
    static isSensitiveKey(key: string): boolean;
    /**
     * Calculates session memory usage
     */
    static calculateSessionMemoryUsage(session: Session): number;
    /**
     * Calculates the approximate size of an object in bytes
     */
    static calculateObjectSize(obj: any): number;
    /**
     * Filters sessions based on query options
     */
    static filterSessions(sessions: Session[], options: SessionQueryOptions): Session[];
    /**
     * Sorts sessions based on query options
     */
    static sortSessions(sessions: Session[], options: SessionQueryOptions): Session[];
    /**
     * Paginates sessions based on query options
     */
    static paginateSessions(sessions: Session[], options: SessionQueryOptions): Session[];
    /**
     * Calculates statistics for a collection of sessions
     */
    static calculateSessionStats(sessions: Session[]): SessionStats;
    /**
     * Merges session configurations with defaults
     */
    static mergeSessionConfig(config: Partial<SessionConfig>, defaults: SessionConfig): SessionConfig;
    /**
     * Compares two sessions for equality
     */
    static compareSessions(session1: Session, session2: Session): boolean;
    /**
     * Creates a session key for storage
     */
    static createSessionKey(appName: string, userId: string, sessionId: string): string;
    /**
     * Parses a session key
     */
    static parseSessionKey(key: string): {
        appName: string;
        userId: string;
        sessionId: string;
    } | null;
    /**
     * Formats session duration in human-readable format
     */
    static formatDuration(milliseconds: number): string;
    /**
     * Formats memory size in human-readable format
     */
    static formatMemorySize(bytes: number): string;
    /**
     * Creates a deep copy of session data
     */
    static deepClone<T>(obj: T): T;
    /**
     * Validates session data integrity
     */
    static validateSessionIntegrity(session: Session): {
        valid: boolean;
        errors: string[];
    };
}
/**
 * Session utility functions (exported as individual functions)
 */
export declare const generateSessionId: typeof SessionUtils.generateSessionId;
export declare const isValidSessionId: typeof SessionUtils.isValidSessionId;
export declare const validateSessionConfig: typeof SessionUtils.validateSessionConfig;
export declare const sanitizeSessionData: typeof SessionUtils.sanitizeSessionData;
export declare const calculateSessionMemoryUsage: typeof SessionUtils.calculateSessionMemoryUsage;
export declare const filterSessions: typeof SessionUtils.filterSessions;
export declare const sortSessions: typeof SessionUtils.sortSessions;
export declare const paginateSessions: typeof SessionUtils.paginateSessions;
export declare const calculateSessionStats: typeof SessionUtils.calculateSessionStats;
export declare const mergeSessionConfig: typeof SessionUtils.mergeSessionConfig;
export declare const compareSessions: typeof SessionUtils.compareSessions;
export declare const createSessionKey: typeof SessionUtils.createSessionKey;
export declare const parseSessionKey: typeof SessionUtils.parseSessionKey;
export declare const formatDuration: typeof SessionUtils.formatDuration;
export declare const formatMemorySize: typeof SessionUtils.formatMemorySize;
export declare const deepClone: typeof SessionUtils.deepClone;
export declare const validateSessionIntegrity: typeof SessionUtils.validateSessionIntegrity;
//# sourceMappingURL=utils.d.ts.map