"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSessionIntegrity = exports.deepClone = exports.formatMemorySize = exports.formatDuration = exports.parseSessionKey = exports.createSessionKey = exports.compareSessions = exports.mergeSessionConfig = exports.calculateSessionStats = exports.paginateSessions = exports.sortSessions = exports.filterSessions = exports.calculateSessionMemoryUsage = exports.sanitizeSessionData = exports.validateSessionConfig = exports.isValidSessionId = exports.generateSessionId = exports.SessionUtils = void 0;
const types_1 = require("./types");
const constants_1 = require("./constants");
/**
 * Utility functions for session management
 */
class SessionUtils {
    /**
     * Generates a unique session ID
     */
    static generateSessionId() {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substring(2, 15);
        return `sess_${timestamp}_${random}`;
    }
    /**
     * Validates a session ID format
     */
    static isValidSessionId(sessionId) {
        return constants_1.SESSION_ID_PATTERN.test(sessionId);
    }
    /**
     * Validates session configuration
     */
    static validateSessionConfig(config) {
        const errors = [];
        // Validate required fields
        if (!config.appName || typeof config.appName !== 'string') {
            errors.push('appName is required and must be a string');
        }
        if (!config.userId || typeof config.userId !== 'string') {
            errors.push('userId is required and must be a string');
        }
        // Validate optional fields
        if (config.maxEvents !== undefined) {
            if (!Number.isInteger(config.maxEvents) || config.maxEvents < 1) {
                errors.push('maxEvents must be a positive integer');
            }
            else if (config.maxEvents > constants_1.SESSION_VALIDATION_RULES.MAX_EVENTS) {
                errors.push(`maxEvents cannot exceed ${constants_1.SESSION_VALIDATION_RULES.MAX_EVENTS}`);
            }
        }
        if (config.timeoutMs !== undefined) {
            if (!Number.isInteger(config.timeoutMs) || config.timeoutMs < 1000) {
                errors.push('timeoutMs must be at least 1000 milliseconds');
            }
            else if (config.timeoutMs > constants_1.SESSION_VALIDATION_RULES.MAX_TIMEOUT_MS) {
                errors.push(`timeoutMs cannot exceed ${constants_1.SESSION_VALIDATION_RULES.MAX_TIMEOUT_MS}`);
            }
        }
        if (config.metadata !== undefined && typeof config.metadata !== 'object') {
            errors.push('metadata must be an object');
        }
        return {
            valid: errors.length === 0,
            errors
        };
    }
    /**
     * Sanitizes session data by removing sensitive information
     */
    static sanitizeSessionData(data) {
        const sanitized = {};
        for (const [key, value] of Object.entries(data)) {
            // Skip sensitive keys
            if (this.isSensitiveKey(key)) {
                continue;
            }
            // Deep sanitize objects
            if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                sanitized[key] = this.sanitizeSessionData(value);
            }
            else {
                sanitized[key] = value;
            }
        }
        return sanitized;
    }
    /**
     * Checks if a key is considered sensitive
     */
    static isSensitiveKey(key) {
        const sensitivePatterns = [
            /password/i,
            /secret/i,
            /token/i,
            /key/i,
            /auth/i,
            /credential/i,
            /private/i
        ];
        return sensitivePatterns.some(pattern => pattern.test(key));
    }
    /**
     * Calculates session memory usage
     */
    static calculateSessionMemoryUsage(session) {
        const sessionData = session.toData();
        return this.calculateObjectSize(sessionData);
    }
    /**
     * Calculates the approximate size of an object in bytes
     */
    static calculateObjectSize(obj) {
        let size = 0;
        if (obj === null || obj === undefined) {
            return 0;
        }
        if (typeof obj === 'string') {
            size += obj.length * 2; // UTF-16 encoding
        }
        else if (typeof obj === 'number') {
            size += 8; // 64-bit number
        }
        else if (typeof obj === 'boolean') {
            size += 4; // 32-bit boolean
        }
        else if (obj instanceof Date) {
            size += 8; // 64-bit timestamp
        }
        else if (Array.isArray(obj)) {
            size += obj.reduce((acc, item) => acc + this.calculateObjectSize(item), 0);
        }
        else if (typeof obj === 'object') {
            for (const [key, value] of Object.entries(obj)) {
                size += key.length * 2; // Key size
                size += this.calculateObjectSize(value); // Value size
            }
        }
        return size;
    }
    /**
     * Filters sessions based on query options
     */
    static filterSessions(sessions, options) {
        let filtered = [...sessions];
        // Filter by state
        if (options.state !== undefined) {
            filtered = filtered.filter(session => session.state === options.state);
        }
        // Filter by active status
        if (options.active !== undefined) {
            filtered = filtered.filter(session => session.isActive === options.active);
        }
        // Filter by creation date range
        if (options.createdAfter) {
            filtered = filtered.filter(session => session.createdAt >= options.createdAfter);
        }
        if (options.createdBefore) {
            filtered = filtered.filter(session => session.createdAt <= options.createdBefore);
        }
        // Filter by update date range
        if (options.updatedAfter) {
            filtered = filtered.filter(session => session.updatedAt >= options.updatedAfter);
        }
        if (options.updatedBefore) {
            filtered = filtered.filter(session => session.updatedAt <= options.updatedBefore);
        }
        // Filter by metadata
        if (options.metadata) {
            filtered = filtered.filter(session => {
                return Object.entries(options.metadata).every(([key, value]) => {
                    return session.config.metadata?.[key] === value;
                });
            });
        }
        return filtered;
    }
    /**
     * Sorts sessions based on query options
     */
    static sortSessions(sessions, options) {
        if (!options.sortBy) {
            return sessions;
        }
        const sorted = [...sessions];
        const direction = options.sortOrder === 'desc' ? -1 : 1;
        sorted.sort((a, b) => {
            let aValue;
            let bValue;
            switch (options.sortBy) {
                case 'createdAt':
                    aValue = a.createdAt.getTime();
                    bValue = b.createdAt.getTime();
                    break;
                case 'updatedAt':
                    aValue = a.updatedAt.getTime();
                    bValue = b.updatedAt.getTime();
                    break;
                case 'accessedAt':
                    aValue = a.accessedAt?.getTime() || 0;
                    bValue = b.accessedAt?.getTime() || 0;
                    break;
                case 'id':
                    aValue = a.id;
                    bValue = b.id;
                    break;
                default:
                    return 0;
            }
            if (aValue < bValue)
                return -1 * direction;
            if (aValue > bValue)
                return 1 * direction;
            return 0;
        });
        return sorted;
    }
    /**
     * Paginates sessions based on query options
     */
    static paginateSessions(sessions, options) {
        if (!options.limit && !options.offset) {
            return sessions;
        }
        const offset = options.offset || 0;
        const limit = options.limit;
        if (limit) {
            return sessions.slice(offset, offset + limit);
        }
        else {
            return sessions.slice(offset);
        }
    }
    /**
     * Calculates statistics for a collection of sessions
     */
    static calculateSessionStats(sessions) {
        const now = new Date();
        const totalSessions = sessions.length;
        if (totalSessions === 0) {
            return {
                totalSessions: 0,
                activeSessions: 0,
                expiredSessions: 0,
                averageLifetime: 0,
                totalEvents: 0,
                averageEventsPerSession: 0,
                memoryUsage: {
                    totalSize: 0,
                    averageSize: 0,
                    maxSize: 0,
                    minSize: 0
                },
                stateDistribution: {
                    [types_1.SessionState.ACTIVE]: 0,
                    [types_1.SessionState.INACTIVE]: 0,
                    [types_1.SessionState.TERMINATED]: 0
                }
            };
        }
        let activeSessions = 0;
        let expiredSessions = 0;
        let totalLifetime = 0;
        let totalEvents = 0;
        let totalMemoryUsage = 0;
        let maxMemoryUsage = 0;
        let minMemoryUsage = Infinity;
        const stateDistribution = {
            [types_1.SessionState.ACTIVE]: 0,
            [types_1.SessionState.INACTIVE]: 0,
            [types_1.SessionState.TERMINATED]: 0
        };
        for (const session of sessions) {
            // Count active and expired sessions
            if (session.isActive) {
                activeSessions++;
            }
            if (session.isExpired) {
                expiredSessions++;
            }
            // Calculate lifetime
            const lifetime = now.getTime() - session.createdAt.getTime();
            totalLifetime += lifetime;
            // Count events
            totalEvents += session.events.length;
            // Calculate memory usage
            const memoryUsage = this.calculateSessionMemoryUsage(session);
            totalMemoryUsage += memoryUsage;
            maxMemoryUsage = Math.max(maxMemoryUsage, memoryUsage);
            minMemoryUsage = Math.min(minMemoryUsage, memoryUsage);
            // Count state distribution
            stateDistribution[session.state]++;
        }
        return {
            totalSessions,
            activeSessions,
            expiredSessions,
            averageLifetime: totalLifetime / totalSessions,
            totalEvents,
            averageEventsPerSession: totalEvents / totalSessions,
            memoryUsage: {
                totalSize: totalMemoryUsage,
                averageSize: totalMemoryUsage / totalSessions,
                maxSize: maxMemoryUsage,
                minSize: minMemoryUsage === Infinity ? 0 : minMemoryUsage
            },
            stateDistribution
        };
    }
    /**
     * Merges session configurations with defaults
     */
    static mergeSessionConfig(config, defaults) {
        return {
            ...defaults,
            ...config,
            metadata: {
                ...defaults.metadata,
                ...config.metadata
            }
        };
    }
    /**
     * Compares two sessions for equality
     */
    static compareSessions(session1, session2) {
        return (session1.id === session2.id &&
            session1.userId === session2.userId &&
            session1.appName === session2.appName &&
            session1.state === session2.state &&
            session1.createdAt.getTime() === session2.createdAt.getTime() &&
            session1.updatedAt.getTime() === session2.updatedAt.getTime() &&
            JSON.stringify(session1.config) === JSON.stringify(session2.config));
    }
    /**
     * Creates a session key for storage
     */
    static createSessionKey(appName, userId, sessionId) {
        return `${appName}:${userId}:${sessionId}`;
    }
    /**
     * Parses a session key
     */
    static parseSessionKey(key) {
        const parts = key.split(':');
        if (parts.length !== 3) {
            return null;
        }
        return {
            appName: parts[0],
            userId: parts[1],
            sessionId: parts[2]
        };
    }
    /**
     * Formats session duration in human-readable format
     */
    static formatDuration(milliseconds) {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        if (days > 0) {
            return `${days}d ${hours % 24}h ${minutes % 60}m`;
        }
        else if (hours > 0) {
            return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
        }
        else if (minutes > 0) {
            return `${minutes}m ${seconds % 60}s`;
        }
        else {
            return `${seconds}s`;
        }
    }
    /**
     * Formats memory size in human-readable format
     */
    static formatMemorySize(bytes) {
        const units = ['B', 'KB', 'MB', 'GB', 'TB'];
        let size = bytes;
        let unitIndex = 0;
        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }
        return `${size.toFixed(2)} ${units[unitIndex]}`;
    }
    /**
     * Creates a deep copy of session data
     */
    static deepClone(obj) {
        if (obj === null || typeof obj !== 'object') {
            return obj;
        }
        if (obj instanceof Date) {
            return new Date(obj.getTime());
        }
        if (Array.isArray(obj)) {
            return obj.map(item => this.deepClone(item));
        }
        const cloned = {};
        for (const [key, value] of Object.entries(obj)) {
            cloned[key] = this.deepClone(value);
        }
        return cloned;
    }
    /**
     * Validates session data integrity
     */
    static validateSessionIntegrity(session) {
        const errors = [];
        // Check required fields
        if (!session.id) {
            errors.push('Session ID is missing');
        }
        else if (!this.isValidSessionId(session.id)) {
            errors.push('Session ID format is invalid');
        }
        if (!session.userId) {
            errors.push('User ID is missing');
        }
        if (!session.appName) {
            errors.push('App name is missing');
        }
        // Check timestamps
        if (!session.createdAt || !(session.createdAt instanceof Date)) {
            errors.push('Created timestamp is invalid');
        }
        if (!session.updatedAt || !(session.updatedAt instanceof Date)) {
            errors.push('Updated timestamp is invalid');
        }
        if (session.createdAt && session.updatedAt && session.createdAt > session.updatedAt) {
            errors.push('Created timestamp cannot be after updated timestamp');
        }
        // Check state
        if (!Object.values(types_1.SessionState).includes(session.state)) {
            errors.push('Session state is invalid');
        }
        // Check events array
        if (!Array.isArray(session.events)) {
            errors.push('Events must be an array');
        }
        // Check data object
        if (session.data && typeof session.data !== 'object') {
            errors.push('Session data must be an object');
        }
        return {
            valid: errors.length === 0,
            errors
        };
    }
}
exports.SessionUtils = SessionUtils;
/**
 * Session utility functions (exported as individual functions)
 */
exports.generateSessionId = SessionUtils.generateSessionId;
exports.isValidSessionId = SessionUtils.isValidSessionId;
exports.validateSessionConfig = SessionUtils.validateSessionConfig;
exports.sanitizeSessionData = SessionUtils.sanitizeSessionData;
exports.calculateSessionMemoryUsage = SessionUtils.calculateSessionMemoryUsage;
exports.filterSessions = SessionUtils.filterSessions;
exports.sortSessions = SessionUtils.sortSessions;
exports.paginateSessions = SessionUtils.paginateSessions;
exports.calculateSessionStats = SessionUtils.calculateSessionStats;
exports.mergeSessionConfig = SessionUtils.mergeSessionConfig;
exports.compareSessions = SessionUtils.compareSessions;
exports.createSessionKey = SessionUtils.createSessionKey;
exports.parseSessionKey = SessionUtils.parseSessionKey;
exports.formatDuration = SessionUtils.formatDuration;
exports.formatMemorySize = SessionUtils.formatMemorySize;
exports.deepClone = SessionUtils.deepClone;
exports.validateSessionIntegrity = SessionUtils.validateSessionIntegrity;
//# sourceMappingURL=utils.js.map