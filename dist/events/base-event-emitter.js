"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseEventEmitter = void 0;
const types_1 = require("./types");
const constants_1 = require("./constants");
/**
 * Base event emitter implementation
 */
class BaseEventEmitter {
    constructor(config = {}) {
        this.isInitialized = false;
        this.config = {
            maxListeners: config.maxListeners ?? constants_1.EVENT_DEFAULTS.MAX_LISTENERS,
            memoryLeakWarning: config.memoryLeakWarning ?? constants_1.EVENT_DEFAULTS.MEMORY_LEAK_WARNING,
            captureStackTrace: config.captureStackTrace ?? constants_1.EVENT_DEFAULTS.CAPTURE_STACK_TRACE,
            defaultPriority: config.defaultPriority ?? constants_1.EVENT_DEFAULTS.DEFAULT_PRIORITY,
            asyncErrorHandling: config.asyncErrorHandling ?? constants_1.EVENT_DEFAULTS.ASYNC_ERROR_HANDLING
        };
        this.listeners = new Map();
    }
    /**
     * Initializes the event emitter
     */
    async initialize() {
        if (this.isInitialized) {
            return;
        }
        await this.onInitialize();
        this.isInitialized = true;
    }
    /**
     * Shuts down the event emitter
     */
    async shutdown() {
        if (!this.isInitialized) {
            return;
        }
        await this.onShutdown();
        this.listeners.clear();
        this.isInitialized = false;
    }
    /**
     * Emits an event to all registered listeners
     */
    async emit(event) {
        if (!this.isInitialized) {
            throw this.createError(constants_1.EVENT_ERROR_CODES.CONFIGURATION_ERROR, 'Event emitter not initialized');
        }
        // Validate event
        this.validateEvent(event);
        // Get listeners for this event type
        const eventListeners = this.listeners.get(event.type) || [];
        if (eventListeners.length === 0) {
            return;
        }
        // Sort listeners by priority (higher priority first)
        const sortedListeners = [...eventListeners]
            .filter(config => config.active !== false)
            .sort((a, b) => (b.priority || 0) - (a.priority || 0));
        // Execute listeners
        const promises = [];
        const listenersToRemove = [];
        for (const listenerConfig of sortedListeners) {
            try {
                const promise = this.executeListener(listenerConfig.listener, event);
                promises.push(promise);
                // Mark one-time listeners for removal
                if (listenerConfig.once) {
                    listenersToRemove.push(listenerConfig);
                }
            }
            catch (error) {
                if (this.config.asyncErrorHandling) {
                    this.handleListenerError(error, event, listenerConfig);
                }
                else {
                    throw error;
                }
            }
        }
        // Wait for all listeners to complete
        if (promises.length > 0) {
            await Promise.allSettled(promises);
        }
        // Remove one-time listeners
        this.removeOneTimeListeners(event.type, listenersToRemove);
    }
    /**
     * Adds an event listener
     */
    on(eventType, listener) {
        this.addListener(eventType, listener, { once: false });
    }
    /**
     * Adds a one-time event listener
     */
    once(eventType, listener) {
        this.addListener(eventType, listener, { once: true });
    }
    /**
     * Removes an event listener
     */
    off(eventType, listener) {
        const eventListeners = this.listeners.get(eventType);
        if (!eventListeners) {
            return;
        }
        const index = eventListeners.findIndex(config => config.listener === listener);
        if (index > -1) {
            eventListeners.splice(index, 1);
            if (eventListeners.length === 0) {
                this.listeners.delete(eventType);
            }
        }
    }
    /**
     * Removes all listeners for an event type
     */
    removeAllListeners(eventType) {
        if (eventType) {
            this.listeners.delete(eventType);
        }
        else {
            this.listeners.clear();
        }
    }
    /**
     * Gets the number of listeners for an event type
     */
    listenerCount(eventType) {
        const eventListeners = this.listeners.get(eventType);
        return eventListeners ? eventListeners.length : 0;
    }
    /**
     * Gets all event types with listeners
     */
    eventNames() {
        return Array.from(this.listeners.keys());
    }
    /**
     * Adds a listener with configuration
     */
    addListenerWithConfig(eventType, listener, config = {}) {
        this.addListener(eventType, listener, config);
    }
    /**
     * Gets all listeners for an event type
     */
    getListeners(eventType) {
        return [...(this.listeners.get(eventType) || [])];
    }
    /**
     * Checks if there are any listeners for an event type
     */
    hasListeners(eventType) {
        return this.listenerCount(eventType) > 0;
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
        const totalListeners = Array.from(this.listeners.values())
            .reduce((sum, listeners) => sum + listeners.length, 0);
        return {
            healthy: this.isInitialized && totalListeners <= this.config.maxListeners * this.listeners.size,
            details: {
                initialized: this.isInitialized,
                eventTypes: this.listeners.size,
                totalListeners,
                maxListeners: this.config.maxListeners,
                config: this.config
            }
        };
    }
    /**
     * Hook for subclass initialization
     */
    async onInitialize() {
        // Override in subclasses
    }
    /**
     * Hook for subclass shutdown
     */
    async onShutdown() {
        // Override in subclasses
    }
    /**
     * Adds a listener with configuration
     */
    addListener(eventType, listener, config) {
        if (!eventType || typeof eventType !== 'string') {
            throw this.createError(constants_1.EVENT_ERROR_CODES.INVALID_EVENT_TYPE, 'Event type must be a non-empty string');
        }
        if (typeof listener !== 'function') {
            throw this.createError(constants_1.EVENT_ERROR_CODES.EVENT_LISTENER_ERROR, 'Listener must be a function');
        }
        // Check listener limit
        const currentListeners = this.listeners.get(eventType) || [];
        if (currentListeners.length >= this.config.maxListeners) {
            if (this.config.memoryLeakWarning) {
                console.warn(`Maximum number of listeners (${this.config.maxListeners}) exceeded for event type '${eventType}'`);
            }
            throw this.createError(constants_1.EVENT_ERROR_CODES.MAX_LISTENERS_EXCEEDED, `Maximum number of listeners (${this.config.maxListeners}) exceeded for event type '${eventType}'`);
        }
        // Create listener configuration
        const listenerConfig = {
            listener,
            priority: config.priority || 0,
            once: config.once || false,
            active: config.active !== false,
            metadata: { ...config.metadata }
        };
        // Add listener
        if (!this.listeners.has(eventType)) {
            this.listeners.set(eventType, []);
        }
        this.listeners.get(eventType).push(listenerConfig);
    }
    /**
     * Executes a listener function
     */
    async executeListener(listener, event) {
        const result = listener(event);
        if (result instanceof Promise) {
            await result;
        }
    }
    /**
     * Handles listener execution errors
     */
    handleListenerError(error, event, listenerConfig) {
        console.error(`Error in event listener for event type '${event.type}':`, error, {
            event,
            listenerConfig,
            stack: this.config.captureStackTrace ? error.stack : undefined
        });
    }
    /**
     * Removes one-time listeners after execution
     */
    removeOneTimeListeners(eventType, listenersToRemove) {
        if (listenersToRemove.length === 0) {
            return;
        }
        const eventListeners = this.listeners.get(eventType);
        if (!eventListeners) {
            return;
        }
        for (const listenerToRemove of listenersToRemove) {
            const index = eventListeners.indexOf(listenerToRemove);
            if (index > -1) {
                eventListeners.splice(index, 1);
            }
        }
        if (eventListeners.length === 0) {
            this.listeners.delete(eventType);
        }
    }
    /**
     * Validates an event
     */
    validateEvent(event) {
        if (!event) {
            throw this.createError(constants_1.EVENT_ERROR_CODES.INVALID_EVENT_DATA, 'Event cannot be null or undefined');
        }
        if (!event.id || typeof event.id !== 'string') {
            throw this.createError(constants_1.EVENT_ERROR_CODES.INVALID_EVENT_ID, 'Event ID must be a non-empty string');
        }
        if (!event.type || typeof event.type !== 'string') {
            throw this.createError(constants_1.EVENT_ERROR_CODES.INVALID_EVENT_TYPE, 'Event type must be a non-empty string');
        }
        if (!event.timestamp || !(event.timestamp instanceof Date)) {
            throw this.createError(constants_1.EVENT_ERROR_CODES.INVALID_EVENT_TIMESTAMP, 'Event timestamp must be a valid Date object');
        }
        if (event.priority && !Object.values(types_1.EventPriority).includes(event.priority)) {
            throw this.createError(constants_1.EVENT_ERROR_CODES.INVALID_EVENT_PRIORITY, 'Event priority must be a valid EventPriority value');
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
exports.BaseEventEmitter = BaseEventEmitter;
//# sourceMappingURL=base-event-emitter.js.map