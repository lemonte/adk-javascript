"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileEventStore = exports.InMemoryEventStore = void 0;
const types_1 = require("./types");
const constants_1 = require("./constants");
/**
 * In-memory event store implementation
 */
class InMemoryEventStore {
    constructor(config = {}) {
        this.config = {
            maxEvents: config.maxEvents ?? constants_1.EVENT_DEFAULTS.MAX_EVENTS,
            retentionPeriod: config.retentionPeriod ?? constants_1.EVENT_DEFAULTS.RETENTION_PERIOD,
            enableIndexing: config.enableIndexing ?? constants_1.EVENT_DEFAULTS.ENABLE_INDEXING,
            compressionEnabled: config.compressionEnabled ?? constants_1.EVENT_DEFAULTS.COMPRESSION_ENABLED,
            encryptionEnabled: config.encryptionEnabled ?? constants_1.EVENT_DEFAULTS.ENCRYPTION_ENABLED,
            backupEnabled: config.backupEnabled ?? constants_1.EVENT_DEFAULTS.BACKUP_ENABLED,
            backupInterval: config.backupInterval ?? constants_1.EVENT_DEFAULTS.BACKUP_INTERVAL,
            cleanupInterval: config.cleanupInterval ?? constants_1.EVENT_DEFAULTS.CLEANUP_INTERVAL
        };
        this.events = new Map();
        this.eventsByType = new Map();
        this.eventsByStatus = new Map();
        this.eventsBySource = new Map();
        this.eventsByCorrelation = new Map();
        this.eventsByCausation = new Map();
        this.isInitialized = false;
    }
    /**
     * Initializes the event store
     */
    async initialize() {
        if (this.isInitialized) {
            return;
        }
        // Start cleanup process
        if (this.config.cleanupInterval > 0) {
            this.startCleanupProcess();
        }
        this.isInitialized = true;
    }
    /**
     * Shuts down the event store
     */
    async shutdown() {
        if (!this.isInitialized) {
            return;
        }
        // Stop cleanup process
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = undefined;
        }
        this.isInitialized = false;
    }
    /**
     * Stores an event
     */
    async store(event) {
        if (!this.isInitialized) {
            throw this.createError(constants_1.EVENT_ERROR_CODES.STORE_NOT_INITIALIZED, 'Event store is not initialized');
        }
        // Check storage limits
        if (this.events.size >= this.config.maxEvents) {
            await this.enforceStorageLimit();
        }
        // Store the event
        this.events.set(event.id, { ...event });
        // Update indexes if enabled
        if (this.config.enableIndexing) {
            this.updateIndexes(event);
        }
    }
    /**
     * Retrieves an event by ID
     */
    async get(eventId) {
        if (!this.isInitialized) {
            throw this.createError(constants_1.EVENT_ERROR_CODES.STORE_NOT_INITIALIZED, 'Event store is not initialized');
        }
        const event = this.events.get(eventId);
        return event ? { ...event } : undefined;
    }
    /**
     * Queries events based on criteria
     */
    async query(options) {
        if (!this.isInitialized) {
            throw this.createError(constants_1.EVENT_ERROR_CODES.STORE_NOT_INITIALIZED, 'Event store is not initialized');
        }
        let candidateIds;
        // Use indexes for efficient querying if available
        if (this.config.enableIndexing) {
            candidateIds = this.getEventIdsFromIndexes(options);
        }
        // Get events to filter
        const eventsToFilter = candidateIds
            ? Array.from(candidateIds).map(id => this.events.get(id)).filter(Boolean)
            : Array.from(this.events.values());
        // Apply filters
        let filtered = this.applyFilters(eventsToFilter, options);
        // Sort events
        if (options.sortBy) {
            filtered = this.sortEvents(filtered, options);
        }
        // Apply pagination
        const offset = options.offset || 0;
        if (options.limit) {
            filtered = filtered.slice(offset, offset + options.limit);
        }
        else if (offset > 0) {
            filtered = filtered.slice(offset);
        }
        // Return copies to prevent external modification
        return filtered.map(event => ({ ...event }));
    }
    /**
     * Deletes an event
     */
    async delete(eventId) {
        if (!this.isInitialized) {
            throw this.createError(constants_1.EVENT_ERROR_CODES.STORE_NOT_INITIALIZED, 'Event store is not initialized');
        }
        const event = this.events.get(eventId);
        if (!event) {
            return false;
        }
        // Remove from main storage
        this.events.delete(eventId);
        // Remove from indexes
        if (this.config.enableIndexing) {
            this.removeFromIndexes(event);
        }
        return true;
    }
    /**
     * Deletes multiple events
     */
    async deleteMany(eventIds) {
        if (!this.isInitialized) {
            throw this.createError(constants_1.EVENT_ERROR_CODES.STORE_NOT_INITIALIZED, 'Event store is not initialized');
        }
        let deletedCount = 0;
        for (const eventId of eventIds) {
            const deleted = await this.delete(eventId);
            if (deleted) {
                deletedCount++;
            }
        }
        return deletedCount;
    }
    /**
     * Clears all events
     */
    async clear() {
        if (!this.isInitialized) {
            throw this.createError(constants_1.EVENT_ERROR_CODES.STORE_NOT_INITIALIZED, 'Event store is not initialized');
        }
        this.events.clear();
        this.clearIndexes();
    }
    /**
     * Gets event statistics
     */
    async getStats() {
        if (!this.isInitialized) {
            throw this.createError(constants_1.EVENT_ERROR_CODES.STORE_NOT_INITIALIZED, 'Event store is not initialized');
        }
        const allEvents = Array.from(this.events.values());
        const totalEvents = allEvents.length;
        // Initialize counters
        const eventsByType = {};
        const eventsByStatus = {
            [types_1.EventStatus.PENDING]: 0,
            [types_1.EventStatus.PROCESSING]: 0,
            [types_1.EventStatus.PROCESSED]: 0,
            [types_1.EventStatus.FAILED]: 0,
            [types_1.EventStatus.CANCELLED]: 0
        };
        const eventsByPriority = {
            [types_1.EventPriority.LOW]: 0,
            [types_1.EventPriority.MEDIUM]: 0,
            [types_1.EventPriority.HIGH]: 0,
            [types_1.EventPriority.CRITICAL]: 0
        };
        let totalProcessingTime = 0;
        let processedCount = 0;
        let failedCount = 0;
        // Calculate statistics
        for (const event of allEvents) {
            // Count by type
            eventsByType[event.type] = (eventsByType[event.type] || 0) + 1;
            // Count by status
            eventsByStatus[event.status]++;
            // Count by priority
            const priority = event.priority || types_1.EventPriority.MEDIUM;
            eventsByPriority[priority]++;
            // Calculate processing metrics
            if (event.processingDuration !== undefined) {
                totalProcessingTime += event.processingDuration;
                processedCount++;
            }
            if (event.status === types_1.EventStatus.FAILED) {
                failedCount++;
            }
        }
        const averageProcessingTime = processedCount > 0 ? totalProcessingTime / processedCount : 0;
        const successRate = totalEvents > 0 ? ((totalEvents - failedCount) / totalEvents) * 100 : 0;
        const errorRate = totalEvents > 0 ? (failedCount / totalEvents) * 100 : 0;
        // Calculate throughput (events per second in the last minute)
        const now = Date.now();
        const oneMinuteAgo = now - 60000;
        const recentEvents = allEvents.filter(e => e.processedAt && e.processedAt.getTime() > oneMinuteAgo).length;
        const throughput = recentEvents / 60; // events per second
        return {
            totalEvents,
            eventsByType,
            eventsByStatus,
            eventsByPriority,
            averageProcessingTime,
            throughput,
            errorRate,
            successRate
        };
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
     * Gets health status
     */
    getHealthStatus() {
        const eventCount = this.events.size;
        const maxEvents = this.config.maxEvents;
        const utilizationPercentage = (eventCount / maxEvents) * 100;
        return {
            healthy: this.isInitialized && utilizationPercentage < 90,
            details: {
                initialized: this.isInitialized,
                eventCount,
                maxEvents,
                utilizationPercentage,
                indexingEnabled: this.config.enableIndexing,
                retentionPeriod: this.config.retentionPeriod
            }
        };
    }
    /**
     * Enforces storage limits by removing old events
     */
    async enforceStorageLimit() {
        const eventsToRemove = this.events.size - this.config.maxEvents + 1;
        if (eventsToRemove <= 0) {
            return;
        }
        // Get oldest events
        const allEvents = Array.from(this.events.values());
        allEvents.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
        // Remove oldest events
        for (let i = 0; i < eventsToRemove; i++) {
            const event = allEvents[i];
            if (event) {
                await this.delete(event.id);
            }
        }
    }
    /**
     * Updates indexes for an event
     */
    updateIndexes(event) {
        // Index by type
        if (!this.eventsByType.has(event.type)) {
            this.eventsByType.set(event.type, new Set());
        }
        this.eventsByType.get(event.type).add(event.id);
        // Index by status
        if (!this.eventsByStatus.has(event.status)) {
            this.eventsByStatus.set(event.status, new Set());
        }
        this.eventsByStatus.get(event.status).add(event.id);
        // Index by source
        if (event.source) {
            if (!this.eventsBySource.has(event.source)) {
                this.eventsBySource.set(event.source, new Set());
            }
            this.eventsBySource.get(event.source).add(event.id);
        }
        // Index by correlation ID
        if (event.correlationId) {
            if (!this.eventsByCorrelation.has(event.correlationId)) {
                this.eventsByCorrelation.set(event.correlationId, new Set());
            }
            this.eventsByCorrelation.get(event.correlationId).add(event.id);
        }
        // Index by causation ID
        if (event.causationId) {
            if (!this.eventsByCausation.has(event.causationId)) {
                this.eventsByCausation.set(event.causationId, new Set());
            }
            this.eventsByCausation.get(event.causationId).add(event.id);
        }
    }
    /**
     * Removes an event from indexes
     */
    removeFromIndexes(event) {
        // Remove from type index
        const typeSet = this.eventsByType.get(event.type);
        if (typeSet) {
            typeSet.delete(event.id);
            if (typeSet.size === 0) {
                this.eventsByType.delete(event.type);
            }
        }
        // Remove from status index
        const statusSet = this.eventsByStatus.get(event.status);
        if (statusSet) {
            statusSet.delete(event.id);
            if (statusSet.size === 0) {
                this.eventsByStatus.delete(event.status);
            }
        }
        // Remove from source index
        if (event.source) {
            const sourceSet = this.eventsBySource.get(event.source);
            if (sourceSet) {
                sourceSet.delete(event.id);
                if (sourceSet.size === 0) {
                    this.eventsBySource.delete(event.source);
                }
            }
        }
        // Remove from correlation index
        if (event.correlationId) {
            const correlationSet = this.eventsByCorrelation.get(event.correlationId);
            if (correlationSet) {
                correlationSet.delete(event.id);
                if (correlationSet.size === 0) {
                    this.eventsByCorrelation.delete(event.correlationId);
                }
            }
        }
        // Remove from causation index
        if (event.causationId) {
            const causationSet = this.eventsByCausation.get(event.causationId);
            if (causationSet) {
                causationSet.delete(event.id);
                if (causationSet.size === 0) {
                    this.eventsByCausation.delete(event.causationId);
                }
            }
        }
    }
    /**
     * Clears all indexes
     */
    clearIndexes() {
        this.eventsByType.clear();
        this.eventsByStatus.clear();
        this.eventsBySource.clear();
        this.eventsByCorrelation.clear();
        this.eventsByCausation.clear();
    }
    /**
     * Gets event IDs from indexes based on query options
     */
    getEventIdsFromIndexes(options) {
        const candidateSets = [];
        // Get candidates from type index
        if (options.types && options.types.length > 0) {
            const typeIds = new Set();
            for (const type of options.types) {
                const typeSet = this.eventsByType.get(type);
                if (typeSet) {
                    typeSet.forEach(id => typeIds.add(id));
                }
            }
            if (typeIds.size > 0) {
                candidateSets.push(typeIds);
            }
        }
        // Get candidates from status index
        if (options.status) {
            const statusSet = this.eventsByStatus.get(options.status);
            if (statusSet && statusSet.size > 0) {
                candidateSets.push(new Set(statusSet));
            }
        }
        // Get candidates from source index
        if (options.sources && options.sources.length > 0) {
            const sourceIds = new Set();
            for (const source of options.sources) {
                const sourceSet = this.eventsBySource.get(source);
                if (sourceSet) {
                    sourceSet.forEach(id => sourceIds.add(id));
                }
            }
            if (sourceIds.size > 0) {
                candidateSets.push(sourceIds);
            }
        }
        // Get candidates from correlation index
        if (options.correlationId) {
            const correlationSet = this.eventsByCorrelation.get(options.correlationId);
            if (correlationSet && correlationSet.size > 0) {
                candidateSets.push(new Set(correlationSet));
            }
        }
        // Get candidates from causation index
        if (options.causationId) {
            const causationSet = this.eventsByCausation.get(options.causationId);
            if (causationSet && causationSet.size > 0) {
                candidateSets.push(new Set(causationSet));
            }
        }
        // If no index-based filtering, return undefined to use all events
        if (candidateSets.length === 0) {
            return undefined;
        }
        // Intersect all candidate sets
        let result = candidateSets[0];
        for (let i = 1; i < candidateSets.length; i++) {
            const intersection = new Set();
            for (const id of result) {
                if (candidateSets[i].has(id)) {
                    intersection.add(id);
                }
            }
            result = intersection;
        }
        return result;
    }
    /**
     * Applies filters to events
     */
    applyFilters(events, options) {
        let filtered = events;
        // Filter by time range
        if (options.startTime) {
            filtered = filtered.filter(e => e.timestamp >= options.startTime);
        }
        if (options.endTime) {
            filtered = filtered.filter(e => e.timestamp <= options.endTime);
        }
        // Filter by priority
        if (options.priority) {
            filtered = filtered.filter(e => (e.priority || types_1.EventPriority.MEDIUM) === options.priority);
        }
        // Filter by metadata
        if (options.metadata) {
            filtered = filtered.filter(e => {
                if (!e.metadata)
                    return false;
                for (const [key, value] of Object.entries(options.metadata)) {
                    if (e.metadata[key] !== value) {
                        return false;
                    }
                }
                return true;
            });
        }
        return filtered;
    }
    /**
     * Sorts events based on options
     */
    sortEvents(events, options) {
        return events.sort((a, b) => {
            let aValue;
            let bValue;
            switch (options.sortBy) {
                case 'timestamp':
                    aValue = a.timestamp.getTime();
                    bValue = b.timestamp.getTime();
                    break;
                case 'priority':
                    aValue = a.priority || types_1.EventPriority.MEDIUM;
                    bValue = b.priority || types_1.EventPriority.MEDIUM;
                    break;
                case 'type':
                    aValue = a.type;
                    bValue = b.type;
                    break;
                default:
                    return 0;
            }
            const direction = options.sortOrder === 'desc' ? -1 : 1;
            if (aValue < bValue)
                return -1 * direction;
            if (aValue > bValue)
                return 1 * direction;
            return 0;
        });
    }
    /**
     * Starts the cleanup process
     */
    startCleanupProcess() {
        this.cleanupInterval = setInterval(() => {
            this.cleanupExpiredEvents();
        }, this.config.cleanupInterval);
    }
    /**
     * Cleans up expired events
     */
    cleanupExpiredEvents() {
        const now = Date.now();
        const retentionPeriod = this.config.retentionPeriod;
        const cutoffTime = now - retentionPeriod;
        const eventsToDelete = [];
        for (const [eventId, event] of this.events) {
            if (event.timestamp.getTime() < cutoffTime) {
                eventsToDelete.push(eventId);
            }
        }
        // Delete expired events
        for (const eventId of eventsToDelete) {
            this.delete(eventId).catch(error => {
                console.error(`Failed to delete expired event '${eventId}':`, error);
            });
        }
    }
    /**
     * Creates an error with context
     */
    createError(code, message) {
        const error = new Error(message);
        error.code = code;
        return error;
    }
}
exports.InMemoryEventStore = InMemoryEventStore;
/**
 * File-based event store implementation (placeholder)
 */
class FileEventStore {
    constructor(filePath, config = {}) {
        this.filePath = filePath;
        this.config = {
            maxEvents: config.maxEvents ?? constants_1.EVENT_DEFAULTS.MAX_EVENTS,
            retentionPeriod: config.retentionPeriod ?? constants_1.EVENT_DEFAULTS.RETENTION_PERIOD,
            enableIndexing: config.enableIndexing ?? constants_1.EVENT_DEFAULTS.ENABLE_INDEXING,
            compressionEnabled: config.compressionEnabled ?? constants_1.EVENT_DEFAULTS.COMPRESSION_ENABLED,
            encryptionEnabled: config.encryptionEnabled ?? constants_1.EVENT_DEFAULTS.ENCRYPTION_ENABLED,
            backupEnabled: config.backupEnabled ?? constants_1.EVENT_DEFAULTS.BACKUP_ENABLED,
            backupInterval: config.backupInterval ?? constants_1.EVENT_DEFAULTS.BACKUP_INTERVAL,
            cleanupInterval: config.cleanupInterval ?? constants_1.EVENT_DEFAULTS.CLEANUP_INTERVAL
        };
        this.isInitialized = false;
    }
    async initialize() {
        // TODO: Implement file-based initialization
        this.isInitialized = true;
    }
    async shutdown() {
        // TODO: Implement file-based shutdown
        this.isInitialized = false;
    }
    async store(event) {
        // TODO: Implement file-based storage
        throw new Error('FileEventStore not yet implemented');
    }
    async get(eventId) {
        // TODO: Implement file-based retrieval
        throw new Error('FileEventStore not yet implemented');
    }
    async query(options) {
        // TODO: Implement file-based querying
        throw new Error('FileEventStore not yet implemented');
    }
    async delete(eventId) {
        // TODO: Implement file-based deletion
        throw new Error('FileEventStore not yet implemented');
    }
    async deleteMany(eventIds) {
        // TODO: Implement file-based bulk deletion
        throw new Error('FileEventStore not yet implemented');
    }
    async clear() {
        // TODO: Implement file-based clearing
        throw new Error('FileEventStore not yet implemented');
    }
    async getStats() {
        // TODO: Implement file-based statistics
        throw new Error('FileEventStore not yet implemented');
    }
    getConfiguration() {
        return { ...this.config };
    }
    updateConfiguration(config) {
        this.config = { ...this.config, ...config };
    }
    getHealthStatus() {
        return {
            healthy: this.isInitialized,
            details: {
                initialized: this.isInitialized,
                filePath: this.filePath,
                implementation: 'file-based'
            }
        };
    }
}
exports.FileEventStore = FileEventStore;
//# sourceMappingURL=event-store.js.map