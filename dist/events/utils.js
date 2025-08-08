"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateEventId = generateEventId;
exports.validateEventId = validateEventId;
exports.validateEventType = validateEventType;
exports.validateEvent = validateEvent;
exports.validateEventEmitterConfig = validateEventEmitterConfig;
exports.validateEventBusConfig = validateEventBusConfig;
exports.validateEventStoreConfig = validateEventStoreConfig;
exports.sanitizeEvent = sanitizeEvent;
exports.calculateEventStats = calculateEventStats;
exports.filterEvents = filterEvents;
exports.sortEvents = sortEvents;
exports.paginateEvents = paginateEvents;
exports.mergeEventEmitterConfig = mergeEventEmitterConfig;
exports.mergeEventBusConfig = mergeEventBusConfig;
exports.mergeEventStoreConfig = mergeEventStoreConfig;
exports.compareEvents = compareEvents;
exports.createCorrelationId = createCorrelationId;
exports.createCausationId = createCausationId;
exports.formatDuration = formatDuration;
exports.formatMemorySize = formatMemorySize;
exports.deepClone = deepClone;
exports.calculateMemoryUsage = calculateMemoryUsage;
exports.validateEventIntegrity = validateEventIntegrity;
const types_1 = require("./types");
const constants_1 = require("./constants");
/**
 * Generates a unique event ID
 */
function generateEventId() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 15);
    return `event_${timestamp}_${random}`;
}
/**
 * Validates an event ID
 */
function validateEventId(eventId) {
    if (!eventId || typeof eventId !== 'string') {
        return false;
    }
    return constants_1.EVENT_ID_PATTERN.test(eventId);
}
/**
 * Validates an event type
 */
function validateEventType(eventType) {
    if (!eventType || typeof eventType !== 'string') {
        return false;
    }
    return constants_1.EVENT_TYPE_PATTERN.test(eventType) &&
        eventType.length >= constants_1.EVENT_VALIDATION_RULES.MIN_TYPE_LENGTH &&
        eventType.length <= constants_1.EVENT_VALIDATION_RULES.MAX_TYPE_LENGTH;
}
/**
 * Validates a base event
 */
function validateEvent(event) {
    const errors = [];
    const warnings = [];
    // Validate required fields
    if (!event.id) {
        errors.push('Event ID is required');
    }
    else if (!validateEventId(event.id)) {
        errors.push('Event ID format is invalid');
    }
    if (!event.type) {
        errors.push('Event type is required');
    }
    else if (!validateEventType(event.type)) {
        errors.push('Event type format is invalid or length is out of bounds');
    }
    if (!event.timestamp) {
        errors.push('Event timestamp is required');
    }
    else if (!(event.timestamp instanceof Date)) {
        errors.push('Event timestamp must be a Date object');
    }
    else if (isNaN(event.timestamp.getTime())) {
        errors.push('Event timestamp is invalid');
    }
    // Validate optional fields
    if (event.source && typeof event.source !== 'string') {
        errors.push('Event source must be a string');
    }
    if (event.correlationId && typeof event.correlationId !== 'string') {
        errors.push('Event correlation ID must be a string');
    }
    if (event.causationId && typeof event.causationId !== 'string') {
        errors.push('Event causation ID must be a string');
    }
    if (event.priority && !Object.values(types_1.EventPriority).includes(event.priority)) {
        errors.push('Event priority is invalid');
    }
    if (event.metadata && typeof event.metadata !== 'object') {
        errors.push('Event metadata must be an object');
    }
    // Validate data size
    if (event.data) {
        const dataSize = JSON.stringify(event.data).length;
        if (dataSize > constants_1.EVENT_VALIDATION_RULES.MAX_DATA_SIZE) {
            errors.push(`Event data size (${dataSize}) exceeds maximum allowed size (${constants_1.EVENT_VALIDATION_RULES.MAX_DATA_SIZE})`);
        }
    }
    // Validate metadata size
    if (event.metadata) {
        const metadataSize = JSON.stringify(event.metadata).length;
        if (metadataSize > constants_1.EVENT_VALIDATION_RULES.MAX_METADATA_SIZE) {
            errors.push(`Event metadata size (${metadataSize}) exceeds maximum allowed size (${constants_1.EVENT_VALIDATION_RULES.MAX_METADATA_SIZE})`);
        }
    }
    // Check for future timestamps
    if (event.timestamp && event.timestamp.getTime() > Date.now() + 60000) { // 1 minute tolerance
        warnings.push('Event timestamp is in the future');
    }
    return {
        valid: errors.length === 0,
        errors,
        warnings
    };
}
/**
 * Validates an event emitter configuration
 */
function validateEventEmitterConfig(config) {
    const errors = [];
    const warnings = [];
    if (config.maxListeners !== undefined) {
        if (typeof config.maxListeners !== 'number' || config.maxListeners < 0) {
            errors.push('maxListeners must be a non-negative number');
        }
        else if (config.maxListeners > 1000) {
            warnings.push('maxListeners is very high, consider if this is intentional');
        }
    }
    if (config.enableWildcard !== undefined && typeof config.enableWildcard !== 'boolean') {
        errors.push('enableWildcard must be a boolean');
    }
    if (config.delimiter !== undefined) {
        if (typeof config.delimiter !== 'string' || config.delimiter.length === 0) {
            errors.push('delimiter must be a non-empty string');
        }
    }
    if (config.verboseMemoryLeak !== undefined && typeof config.verboseMemoryLeak !== 'boolean') {
        errors.push('verboseMemoryLeak must be a boolean');
    }
    if (config.ignoreErrors !== undefined && typeof config.ignoreErrors !== 'boolean') {
        errors.push('ignoreErrors must be a boolean');
    }
    return {
        valid: errors.length === 0,
        errors,
        warnings
    };
}
/**
 * Validates an event bus configuration
 */
function validateEventBusConfig(config) {
    const errors = [];
    const warnings = [];
    // Validate emitter config
    if (config.emitterConfig) {
        const emitterValidation = validateEventEmitterConfig(config.emitterConfig);
        errors.push(...emitterValidation.errors);
        warnings.push(...emitterValidation.warnings);
    }
    // Validate persistence mode
    if (config.persistenceMode !== undefined &&
        !Object.values(types_1.EventPersistenceMode).includes(config.persistenceMode)) {
        errors.push('persistenceMode is invalid');
    }
    // Validate delivery mode
    if (config.deliveryMode !== undefined &&
        !Object.values(types_1.EventDeliveryMode).includes(config.deliveryMode)) {
        errors.push('deliveryMode is invalid');
    }
    // Validate numeric fields
    if (config.maxConcurrentProcessors !== undefined) {
        if (typeof config.maxConcurrentProcessors !== 'number' || config.maxConcurrentProcessors <= 0) {
            errors.push('maxConcurrentProcessors must be a positive number');
        }
    }
    if (config.processingTimeout !== undefined) {
        if (typeof config.processingTimeout !== 'number' || config.processingTimeout <= 0) {
            errors.push('processingTimeout must be a positive number');
        }
    }
    if (config.bufferSize !== undefined) {
        if (typeof config.bufferSize !== 'number' || config.bufferSize < 0) {
            errors.push('bufferSize must be a non-negative number');
        }
    }
    if (config.bufferFlushInterval !== undefined) {
        if (typeof config.bufferFlushInterval !== 'number' || config.bufferFlushInterval <= 0) {
            errors.push('bufferFlushInterval must be a positive number');
        }
    }
    if (config.metricsInterval !== undefined) {
        if (typeof config.metricsInterval !== 'number' || config.metricsInterval <= 0) {
            errors.push('metricsInterval must be a positive number');
        }
    }
    // Validate retry config
    if (config.retryConfig) {
        const retryConfig = config.retryConfig;
        if (retryConfig.maxAttempts !== undefined) {
            if (typeof retryConfig.maxAttempts !== 'number' || retryConfig.maxAttempts < 0) {
                errors.push('retryConfig.maxAttempts must be a non-negative number');
            }
        }
        if (retryConfig.initialDelay !== undefined) {
            if (typeof retryConfig.initialDelay !== 'number' || retryConfig.initialDelay < 0) {
                errors.push('retryConfig.initialDelay must be a non-negative number');
            }
        }
        if (retryConfig.backoffMultiplier !== undefined) {
            if (typeof retryConfig.backoffMultiplier !== 'number' || retryConfig.backoffMultiplier < 1) {
                errors.push('retryConfig.backoffMultiplier must be a number >= 1');
            }
        }
        if (retryConfig.maxDelay !== undefined) {
            if (typeof retryConfig.maxDelay !== 'number' || retryConfig.maxDelay < 0) {
                errors.push('retryConfig.maxDelay must be a non-negative number');
            }
        }
        if (retryConfig.jitterFactor !== undefined) {
            if (typeof retryConfig.jitterFactor !== 'number' ||
                retryConfig.jitterFactor < 0 || retryConfig.jitterFactor > 1) {
                errors.push('retryConfig.jitterFactor must be a number between 0 and 1');
            }
        }
    }
    return {
        valid: errors.length === 0,
        errors,
        warnings
    };
}
/**
 * Validates an event store configuration
 */
function validateEventStoreConfig(config) {
    const errors = [];
    const warnings = [];
    if (config.maxEvents !== undefined) {
        if (typeof config.maxEvents !== 'number' || config.maxEvents <= 0) {
            errors.push('maxEvents must be a positive number');
        }
        else if (config.maxEvents > 1000000) {
            warnings.push('maxEvents is very high, consider memory implications');
        }
    }
    if (config.retentionPeriod !== undefined) {
        if (typeof config.retentionPeriod !== 'number' || config.retentionPeriod <= 0) {
            errors.push('retentionPeriod must be a positive number');
        }
    }
    if (config.cleanupInterval !== undefined) {
        if (typeof config.cleanupInterval !== 'number' || config.cleanupInterval <= 0) {
            errors.push('cleanupInterval must be a positive number');
        }
    }
    if (config.backupInterval !== undefined) {
        if (typeof config.backupInterval !== 'number' || config.backupInterval <= 0) {
            errors.push('backupInterval must be a positive number');
        }
    }
    // Validate boolean fields
    const booleanFields = ['enableIndexing', 'compressionEnabled', 'encryptionEnabled', 'backupEnabled'];
    for (const field of booleanFields) {
        if (config[field] !== undefined &&
            typeof config[field] !== 'boolean') {
            errors.push(`${field} must be a boolean`);
        }
    }
    return {
        valid: errors.length === 0,
        errors,
        warnings
    };
}
/**
 * Sanitizes event data by removing sensitive information
 */
function sanitizeEvent(event) {
    const sanitized = { ...event };
    // Remove sensitive fields from data
    if (sanitized.data && typeof sanitized.data === 'object') {
        sanitized.data = sanitizeObject(sanitized.data);
    }
    // Remove sensitive fields from metadata
    if (sanitized.metadata && typeof sanitized.metadata === 'object') {
        sanitized.metadata = sanitizeObject(sanitized.metadata);
    }
    return sanitized;
}
/**
 * Sanitizes an object by removing sensitive fields
 */
function sanitizeObject(obj) {
    const sensitiveFields = ['password', 'token', 'secret', 'key', 'auth', 'credential'];
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
        const lowerKey = key.toLowerCase();
        const isSensitive = sensitiveFields.some(field => lowerKey.includes(field));
        if (isSensitive) {
            sanitized[key] = '[REDACTED]';
        }
        else if (value && typeof value === 'object' && !Array.isArray(value)) {
            sanitized[key] = sanitizeObject(value);
        }
        else {
            sanitized[key] = value;
        }
    }
    return sanitized;
}
/**
 * Calculates event processing statistics
 */
function calculateEventStats(events) {
    const totalEvents = events.length;
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
    for (const event of events) {
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
    const recentEvents = events.filter(e => e.processedAt && e.processedAt.getTime() > oneMinuteAgo).length;
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
 * Filters events based on query options
 */
function filterEvents(events, options) {
    let filtered = events;
    if (options.types && options.types.length > 0) {
        filtered = filtered.filter(e => options.types.includes(e.type));
    }
    if (options.sources && options.sources.length > 0) {
        filtered = filtered.filter(e => e.source && options.sources.includes(e.source));
    }
    if (options.status) {
        filtered = filtered.filter(e => e.status === options.status);
    }
    if (options.priority) {
        filtered = filtered.filter(e => (e.priority || types_1.EventPriority.MEDIUM) === options.priority);
    }
    if (options.startTime) {
        filtered = filtered.filter(e => e.timestamp >= options.startTime);
    }
    if (options.endTime) {
        filtered = filtered.filter(e => e.timestamp <= options.endTime);
    }
    if (options.correlationId) {
        filtered = filtered.filter(e => e.correlationId === options.correlationId);
    }
    if (options.causationId) {
        filtered = filtered.filter(e => e.causationId === options.causationId);
    }
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
 * Sorts events based on criteria
 */
function sortEvents(events, sortBy, sortOrder = 'asc') {
    return events.sort((a, b) => {
        let aValue;
        let bValue;
        switch (sortBy) {
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
        const direction = sortOrder === 'desc' ? -1 : 1;
        if (aValue < bValue)
            return -1 * direction;
        if (aValue > bValue)
            return 1 * direction;
        return 0;
    });
}
/**
 * Paginates events
 */
function paginateEvents(events, offset = 0, limit) {
    if (limit) {
        return events.slice(offset, offset + limit);
    }
    else if (offset > 0) {
        return events.slice(offset);
    }
    return events;
}
/**
 * Merges event configurations with defaults
 */
function mergeEventEmitterConfig(config) {
    return {
        maxListeners: config.maxListeners ?? constants_1.EVENT_DEFAULTS.MAX_LISTENERS,
        memoryLeakWarning: config.memoryLeakWarning ?? constants_1.EVENT_DEFAULTS.MEMORY_LEAK_WARNING,
        captureStackTrace: config.captureStackTrace ?? constants_1.EVENT_DEFAULTS.CAPTURE_STACK_TRACE,
        defaultPriority: config.defaultPriority ?? constants_1.EVENT_DEFAULTS.DEFAULT_PRIORITY,
        asyncErrorHandling: config.asyncErrorHandling ?? constants_1.EVENT_DEFAULTS.ASYNC_ERROR_HANDLING
    };
}
/**
 * Merges event bus configurations with defaults
 */
function mergeEventBusConfig(config) {
    return {
        emitterConfig: mergeEventEmitterConfig(config.emitterConfig || {}),
        persistenceMode: config.persistenceMode ?? constants_1.EVENT_DEFAULTS.PERSISTENCE_MODE,
        deliveryMode: config.deliveryMode ?? constants_1.EVENT_DEFAULTS.DELIVERY_MODE,
        maxConcurrentProcessors: config.maxConcurrentProcessors ?? constants_1.EVENT_DEFAULTS.MAX_CONCURRENT_PROCESSORS,
        processingTimeout: config.processingTimeout ?? constants_1.EVENT_DEFAULTS.PROCESSING_TIMEOUT,
        retryConfig: {
            maxAttempts: config.retryConfig?.maxAttempts ?? constants_1.EVENT_DEFAULTS.MAX_RETRY_ATTEMPTS,
            initialDelay: config.retryConfig?.initialDelay ?? constants_1.EVENT_DEFAULTS.INITIAL_RETRY_DELAY,
            backoffMultiplier: config.retryConfig?.backoffMultiplier ?? constants_1.EVENT_DEFAULTS.BACKOFF_MULTIPLIER,
            maxDelay: config.retryConfig?.maxDelay ?? constants_1.EVENT_DEFAULTS.MAX_RETRY_DELAY,
            jitterFactor: config.retryConfig?.jitterFactor ?? constants_1.EVENT_DEFAULTS.JITTER_FACTOR
        },
        enableMetrics: config.enableMetrics ?? constants_1.EVENT_DEFAULTS.ENABLE_METRICS,
        metricsInterval: config.metricsInterval ?? constants_1.EVENT_DEFAULTS.METRICS_INTERVAL,
        bufferSize: config.bufferSize ?? constants_1.EVENT_DEFAULTS.BUFFER_SIZE,
        bufferFlushInterval: config.bufferFlushInterval ?? constants_1.EVENT_DEFAULTS.BUFFER_FLUSH_INTERVAL
    };
}
/**
 * Merges event store configurations with defaults
 */
function mergeEventStoreConfig(config) {
    return {
        storageType: config.storageType ?? 'memory',
        connectionString: config.connectionString,
        maxEvents: config.maxEvents ?? constants_1.EVENT_DEFAULTS.MAX_EVENTS,
        retentionPeriod: config.retentionPeriod ?? constants_1.EVENT_DEFAULTS.RETENTION_PERIOD,
        compression: config.compression ?? constants_1.EVENT_DEFAULTS.COMPRESSION,
        encryption: config.encryption ?? constants_1.EVENT_DEFAULTS.ENCRYPTION,
        batchSize: config.batchSize ?? constants_1.EVENT_DEFAULTS.BATCH_SIZE
    };
}
/**
 * Compares two events for equality
 */
function compareEvents(event1, event2) {
    return event1.id === event2.id &&
        event1.type === event2.type &&
        event1.timestamp.getTime() === event2.timestamp.getTime() &&
        event1.source === event2.source &&
        event1.correlationId === event2.correlationId &&
        event1.causationId === event2.causationId &&
        event1.priority === event2.priority &&
        JSON.stringify(event1.data) === JSON.stringify(event2.data) &&
        JSON.stringify(event1.metadata) === JSON.stringify(event2.metadata);
}
/**
 * Creates a correlation ID for event tracking
 */
function createCorrelationId() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 15);
    return `corr_${timestamp}_${random}`;
}
/**
 * Creates a causation ID for event tracking
 */
function createCausationId() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 15);
    return `cause_${timestamp}_${random}`;
}
/**
 * Formats duration in milliseconds to human-readable string
 */
function formatDuration(milliseconds) {
    if (milliseconds < 1000) {
        return `${milliseconds}ms`;
    }
    else if (milliseconds < 60000) {
        return `${(milliseconds / 1000).toFixed(2)}s`;
    }
    else if (milliseconds < 3600000) {
        return `${(milliseconds / 60000).toFixed(2)}m`;
    }
    else {
        return `${(milliseconds / 3600000).toFixed(2)}h`;
    }
}
/**
 * Formats memory size in bytes to human-readable string
 */
function formatMemorySize(bytes) {
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
 * Deep clones an object
 */
function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }
    if (obj instanceof Date) {
        return new Date(obj.getTime());
    }
    if (obj instanceof Array) {
        return obj.map(item => deepClone(item));
    }
    if (typeof obj === 'object') {
        const cloned = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                cloned[key] = deepClone(obj[key]);
            }
        }
        return cloned;
    }
    return obj;
}
/**
 * Calculates memory usage of an object
 */
function calculateMemoryUsage(obj) {
    const seen = new WeakSet();
    function sizeOf(obj) {
        if (obj === null || obj === undefined) {
            return 0;
        }
        if (typeof obj === 'boolean') {
            return 4;
        }
        if (typeof obj === 'number') {
            return 8;
        }
        if (typeof obj === 'string') {
            return obj.length * 2;
        }
        if (typeof obj === 'object') {
            if (seen.has(obj)) {
                return 0;
            }
            seen.add(obj);
            let size = 0;
            if (Array.isArray(obj)) {
                for (const item of obj) {
                    size += sizeOf(item);
                }
            }
            else {
                for (const key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        size += sizeOf(key) + sizeOf(obj[key]);
                    }
                }
            }
            return size;
        }
        return 0;
    }
    return sizeOf(obj);
}
/**
 * Validates event integrity
 */
function validateEventIntegrity(event) {
    try {
        // Check required fields
        if (!event.id || !event.type || !event.timestamp || !event.status) {
            return false;
        }
        // Check timestamp validity
        if (!(event.timestamp instanceof Date) || isNaN(event.timestamp.getTime())) {
            return false;
        }
        // Check status validity
        if (!Object.values(types_1.EventStatus).includes(event.status)) {
            return false;
        }
        // Check priority validity if present
        if (event.priority && !Object.values(types_1.EventPriority).includes(event.priority)) {
            return false;
        }
        // Check attempts validity
        if (event.attempts !== undefined && (typeof event.attempts !== 'number' || event.attempts < 0)) {
            return false;
        }
        // Check processing duration validity
        if (event.processingDuration !== undefined &&
            (typeof event.processingDuration !== 'number' || event.processingDuration < 0)) {
            return false;
        }
        return true;
    }
    catch {
        return false;
    }
}
//# sourceMappingURL=utils.js.map