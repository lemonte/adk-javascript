"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseSessionService = void 0;
/**
 * Abstract base class for session services
 */
class BaseSessionService {
    /**
     * Helper method to generate a unique session ID
     */
    generateSessionId() {
        // Generate a UUID v4
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
    /**
     * Helper method to validate session configuration
     */
    validateSessionConfig(config) {
        const errors = [];
        if (!config.userId || typeof config.userId !== 'string') {
            errors.push('User ID is required and must be a string');
        }
        if (!config.appName || typeof config.appName !== 'string') {
            errors.push('App name is required and must be a string');
        }
        if (config.timeout !== undefined && (typeof config.timeout !== 'number' || config.timeout <= 0)) {
            errors.push('Timeout must be a positive number');
        }
        if (config.maxEvents !== undefined && (typeof config.maxEvents !== 'number' || config.maxEvents <= 0)) {
            errors.push('Max events must be a positive number');
        }
        return errors;
    }
    /**
     * Helper method to check if a session matches query options
     */
    matchesQueryOptions(session, options) {
        if (!options)
            return true;
        // Filter by state
        if (options.state && session.state !== options.state) {
            return false;
        }
        // Filter by creation date
        if (options.createdAfter && session.createdAt < options.createdAfter) {
            return false;
        }
        if (options.createdBefore && session.createdAt > options.createdBefore) {
            return false;
        }
        // Filter by update date
        if (options.updatedAfter && session.updatedAt < options.updatedAfter) {
            return false;
        }
        if (options.updatedBefore && session.updatedAt > options.updatedBefore) {
            return false;
        }
        return true;
    }
    /**
     * Helper method to sort sessions based on query options
     */
    sortSessions(sessions, options) {
        if (!options?.sortBy)
            return sessions;
        const sorted = [...sessions].sort((a, b) => {
            let aValue;
            let bValue;
            switch (options.sortBy) {
                case 'createdAt':
                    aValue = a.createdAt;
                    bValue = b.createdAt;
                    break;
                case 'updatedAt':
                    aValue = a.updatedAt;
                    bValue = b.updatedAt;
                    break;
                case 'expiresAt':
                    aValue = a.expiresAt || new Date(0);
                    bValue = b.expiresAt || new Date(0);
                    break;
                default:
                    return 0;
            }
            const comparison = aValue.getTime() - bValue.getTime();
            return options.sortOrder === 'desc' ? -comparison : comparison;
        });
        return sorted;
    }
    /**
     * Helper method to apply pagination to sessions
     */
    paginateSessions(sessions, options) {
        if (!options)
            return sessions;
        let result = sessions;
        // Apply offset
        if (options.offset && options.offset > 0) {
            result = result.slice(options.offset);
        }
        // Apply limit
        if (options.limit && options.limit > 0) {
            result = result.slice(0, options.limit);
        }
        return result;
    }
    /**
     * Helper method to calculate session statistics
     */
    calculateStats(sessions) {
        const stats = {
            totalSessions: sessions.length,
            activeSessions: 0,
            expiredSessions: 0,
            averageDuration: 0,
            sessionsByState: {
                active: 0,
                inactive: 0,
                expired: 0,
                terminated: 0
            },
            sessionsByApp: {},
            memoryUsage: {
                totalSize: 0,
                averageSize: 0,
                maxSize: 0
            }
        };
        if (sessions.length === 0) {
            return stats;
        }
        let totalDuration = 0;
        let totalSize = 0;
        let maxSize = 0;
        for (const session of sessions) {
            // Count by state
            stats.sessionsByState[session.state]++;
            if (session.isActive)
                stats.activeSessions++;
            if (session.isExpired)
                stats.expiredSessions++;
            // Count by app
            if (!stats.sessionsByApp[session.appName]) {
                stats.sessionsByApp[session.appName] = 0;
            }
            stats.sessionsByApp[session.appName]++;
            // Calculate duration
            const duration = session.updatedAt.getTime() - session.createdAt.getTime();
            totalDuration += duration;
            // Calculate size
            const size = session.size;
            totalSize += size;
            maxSize = Math.max(maxSize, size);
        }
        stats.averageDuration = totalDuration / sessions.length;
        stats.memoryUsage.totalSize = totalSize;
        stats.memoryUsage.averageSize = totalSize / sessions.length;
        stats.memoryUsage.maxSize = maxSize;
        return stats;
    }
    /**
     * Helper method to create a session backup
     */
    createBackup(sessions) {
        const appNames = [...new Set(sessions.map(s => s.appName))];
        const userIds = [...new Set(sessions.map(s => s.userId))];
        return {
            timestamp: new Date(),
            sessions: sessions.map(s => s.toData()),
            metadata: {
                version: '1.0.0',
                totalSessions: sessions.length,
                appNames,
                userIds
            }
        };
    }
}
exports.BaseSessionService = BaseSessionService;
//# sourceMappingURL=base-session-service.js.map