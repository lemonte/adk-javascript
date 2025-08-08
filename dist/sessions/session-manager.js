"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionManager = void 0;
const in_memory_session_service_1 = require("./in-memory-session-service");
const types_1 = require("./types");
const constants_1 = require("./constants");
/**
 * Session manager that provides high-level session management capabilities
 */
class SessionManager {
    constructor(service, config, hooks) {
        this.eventListeners = new Map();
        this.isInitialized = false;
        this.service = service || new in_memory_session_service_1.InMemorySessionService(config);
        this.config = { ...constants_1.DEFAULT_SESSION_MANAGER_CONFIG, ...config };
        this.hooks = hooks || {};
        this.metrics = this.initializeMetrics();
    }
    /**
     * Initializes the session manager
     */
    async initialize() {
        if (this.isInitialized) {
            return;
        }
        await this.service.initialize();
        // Start metrics collection
        this.startMetricsCollection();
        this.isInitialized = true;
    }
    /**
     * Shuts down the session manager
     */
    async shutdown() {
        if (this.metricsInterval) {
            clearInterval(this.metricsInterval);
            this.metricsInterval = undefined;
        }
        await this.service.shutdown();
        this.eventListeners.clear();
        this.isInitialized = false;
    }
    /**
     * Creates a new session with lifecycle hooks
     */
    async createSession(config) {
        // Execute before create hook
        if (this.hooks.beforeCreate) {
            await this.hooks.beforeCreate(config);
        }
        const session = await this.service.createSession(config);
        // Execute after create hook
        if (this.hooks.afterCreate) {
            await this.hooks.afterCreate(session);
        }
        // Emit session created event
        this.emitEvent({
            type: types_1.SessionEventType.SESSION_CREATED,
            sessionId: session.id,
            userId: session.userId,
            appName: session.appName,
            timestamp: new Date(),
            data: { config: session.config }
        });
        // Update metrics
        this.updateMetrics('create');
        return session;
    }
    /**
     * Gets a session with automatic expiration handling
     */
    async getSession(appName, userId, sessionId) {
        const session = await this.service.getSession(appName, userId, sessionId);
        if (session && session.isExpired) {
            // Handle expired session
            if (this.hooks.onExpire) {
                await this.hooks.onExpire(session);
            }
            this.emitEvent({
                type: types_1.SessionEventType.SESSION_EXPIRED,
                sessionId: session.id,
                userId: session.userId,
                appName: session.appName,
                timestamp: new Date()
            });
            await this.service.deleteSession(appName, userId, sessionId);
            return null;
        }
        return session;
    }
    /**
     * Updates a session with lifecycle hooks
     */
    async updateSession(session) {
        // Execute before update hook
        if (this.hooks.beforeUpdate) {
            await this.hooks.beforeUpdate(session);
        }
        await this.service.updateSession(session);
        // Execute after update hook
        if (this.hooks.afterUpdate) {
            await this.hooks.afterUpdate(session);
        }
        // Emit session updated event
        this.emitEvent({
            type: types_1.SessionEventType.SESSION_UPDATED,
            sessionId: session.id,
            userId: session.userId,
            appName: session.appName,
            timestamp: new Date(),
            data: { config: session.config }
        });
        // Update metrics
        this.updateMetrics('update');
    }
    /**
     * Deletes a session with lifecycle hooks
     */
    async deleteSession(appName, userId, sessionId) {
        const session = await this.service.getSession(appName, userId, sessionId);
        // Execute before delete hook
        if (session && this.hooks.beforeDelete) {
            await this.hooks.beforeDelete(session);
        }
        await this.service.deleteSession(appName, userId, sessionId);
        // Execute after delete hook
        if (this.hooks.afterDelete) {
            await this.hooks.afterDelete(sessionId, userId, appName);
        }
        // Emit session deleted event
        this.emitEvent({
            type: types_1.SessionEventType.SESSION_DELETED,
            sessionId,
            userId,
            appName,
            timestamp: new Date()
        });
        // Update metrics
        this.updateMetrics('delete');
    }
    /**
     * Lists sessions with enhanced filtering
     */
    async listSessions(appName, userId, options) {
        return this.service.listSessions(appName, userId, options);
    }
    /**
     * Gets session statistics
     */
    async getSessionStats(appName, userId) {
        return this.service.getSessionStats(appName, userId);
    }
    /**
     * Gets current metrics
     */
    getMetrics() {
        return { ...this.metrics };
    }
    /**
     * Resets metrics
     */
    resetMetrics() {
        this.metrics = this.initializeMetrics();
    }
    /**
     * Adds an event listener
     */
    addEventListener(eventType, listener) {
        if (!this.eventListeners.has(eventType)) {
            this.eventListeners.set(eventType, []);
        }
        this.eventListeners.get(eventType).push(listener);
    }
    /**
     * Removes an event listener
     */
    removeEventListener(eventType, listener) {
        const listeners = this.eventListeners.get(eventType);
        if (listeners) {
            const index = listeners.indexOf(listener);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        }
    }
    /**
     * Removes all event listeners for a type
     */
    removeAllEventListeners(eventType) {
        if (eventType) {
            this.eventListeners.delete(eventType);
        }
        else {
            this.eventListeners.clear();
        }
    }
    /**
     * Activates a session
     */
    async activateSession(appName, userId, sessionId) {
        const session = await this.getSession(appName, userId, sessionId);
        if (session) {
            session.activate();
            await this.updateSession(session);
            this.emitEvent({
                type: types_1.SessionEventType.SESSION_ACTIVATED,
                sessionId,
                userId,
                appName,
                timestamp: new Date()
            });
        }
    }
    /**
     * Deactivates a session
     */
    async deactivateSession(appName, userId, sessionId) {
        const session = await this.getSession(appName, userId, sessionId);
        if (session) {
            session.deactivate();
            await this.updateSession(session);
            this.emitEvent({
                type: types_1.SessionEventType.SESSION_DEACTIVATED,
                sessionId,
                userId,
                appName,
                timestamp: new Date()
            });
        }
    }
    /**
     * Extends a session's expiration time
     */
    async extendSession(appName, userId, sessionId, additionalTime) {
        const session = await this.getSession(appName, userId, sessionId);
        if (session) {
            session.extend(additionalTime);
            await this.updateSession(session);
        }
    }
    /**
     * Refreshes a session (resets expiration)
     */
    async refreshSession(appName, userId, sessionId) {
        const session = await this.getSession(appName, userId, sessionId);
        if (session) {
            session.refresh();
            await this.updateSession(session);
        }
    }
    /**
     * Cleans up expired sessions
     */
    async cleanupExpiredSessions() {
        return this.service.cleanupExpiredSessions();
    }
    /**
     * Backs up sessions
     */
    async backupSessions(appName, userId) {
        return this.service.backupSessions(appName, userId);
    }
    /**
     * Restores sessions from backup
     */
    async restoreSessions(backup, options) {
        return this.service.restoreSessions(backup, options);
    }
    /**
     * Gets service health status
     */
    async getHealthStatus() {
        const serviceHealth = await this.service.getHealthStatus();
        return {
            healthy: this.isInitialized && serviceHealth.healthy,
            details: {
                ...serviceHealth.details,
                manager: {
                    initialized: this.isInitialized,
                    metrics: this.metrics,
                    eventListeners: Object.fromEntries(Array.from(this.eventListeners.entries()).map(([type, listeners]) => [
                        type,
                        listeners.length
                    ]))
                }
            }
        };
    }
    /**
     * Gets the underlying session service
     */
    getService() {
        return this.service;
    }
    /**
     * Gets the current configuration
     */
    getConfiguration() {
        return { ...this.config };
    }
    /**
     * Updates the configuration
     */
    updateConfiguration(config) {
        this.config = { ...this.config, ...config };
    }
    /**
     * Gets the current hooks
     */
    getHooks() {
        return { ...this.hooks };
    }
    /**
     * Updates the hooks
     */
    updateHooks(hooks) {
        this.hooks = { ...this.hooks, ...hooks };
    }
    /**
     * Emits a session event
     */
    emitEvent(event) {
        const listeners = this.eventListeners.get(event.type);
        if (listeners) {
            for (const listener of listeners) {
                try {
                    listener(event);
                }
                catch (error) {
                    // Log error but don't throw to prevent disrupting the flow
                    console.error('Error in session event listener:', error);
                }
            }
        }
    }
    /**
     * Initializes metrics
     */
    initializeMetrics() {
        return {
            creationRate: 0,
            updateRate: 0,
            deletionRate: 0,
            averageLifetime: 0,
            memoryPerSession: 0,
            eventsPerSession: 0,
            errorRate: 0
        };
    }
    /**
     * Updates metrics
     */
    updateMetrics(operation) {
        const now = Date.now();
        const minute = Math.floor(now / 60000);
        // Simple rate calculation (operations per minute)
        switch (operation) {
            case 'create':
                this.metrics.creationRate++;
                break;
            case 'update':
                this.metrics.updateRate++;
                break;
            case 'delete':
                this.metrics.deletionRate++;
                break;
            case 'error':
                this.metrics.errorRate++;
                break;
        }
    }
    /**
     * Starts metrics collection
     */
    startMetricsCollection() {
        if (this.metricsInterval) {
            clearInterval(this.metricsInterval);
        }
        this.metricsInterval = setInterval(async () => {
            try {
                const stats = await this.getSessionStats();
                // Update calculated metrics
                this.metrics.memoryPerSession = stats.totalSessions > 0
                    ? stats.memoryUsage.totalSize / stats.totalSessions
                    : 0;
                // Reset rate counters (they represent operations in the last interval)
                this.metrics.creationRate = 0;
                this.metrics.updateRate = 0;
                this.metrics.deletionRate = 0;
                this.metrics.errorRate = 0;
            }
            catch (error) {
                this.updateMetrics('error');
            }
        }, constants_1.SESSION_METRICS_INTERVALS.SHORT_TERM);
    }
}
exports.SessionManager = SessionManager;
//# sourceMappingURL=session-manager.js.map