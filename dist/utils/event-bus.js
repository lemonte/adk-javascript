"use strict";
/**
 * Event bus for handling application events
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalEventBus = exports.EventBus = void 0;
/**
 * Simple event bus implementation
 */
class EventBus {
    constructor(config = {}) {
        this.listeners = new Map();
        this.config = {
            maxListeners: config.maxListeners ?? 100,
            enableLogging: config.enableLogging ?? false,
            logLevel: config.logLevel ?? 'info',
        };
    }
    /**
     * Subscribe to an event
     */
    on(event, listener) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        const eventListeners = this.listeners.get(event);
        if (eventListeners.size >= this.config.maxListeners) {
            throw new Error(`Maximum number of listeners (${this.config.maxListeners}) exceeded for event: ${event}`);
        }
        eventListeners.add(listener);
        if (this.config.enableLogging) {
            this.log('debug', `Listener added for event: ${event}`);
        }
        return {
            unsubscribe: () => this.off(event, listener),
        };
    }
    /**
     * Subscribe to an event once
     */
    once(event, listener) {
        const onceListener = async (data) => {
            this.off(event, onceListener);
            await listener(data);
        };
        return this.on(event, onceListener);
    }
    /**
     * Unsubscribe from an event
     */
    off(event, listener) {
        const eventListeners = this.listeners.get(event);
        if (eventListeners) {
            eventListeners.delete(listener);
            if (eventListeners.size === 0) {
                this.listeners.delete(event);
            }
            if (this.config.enableLogging) {
                this.log('debug', `Listener removed for event: ${event}`);
            }
        }
    }
    /**
     * Emit an event
     */
    async emit(event, data) {
        const eventListeners = this.listeners.get(event);
        if (!eventListeners || eventListeners.size === 0) {
            if (this.config.enableLogging) {
                this.log('debug', `No listeners for event: ${event}`);
            }
            return;
        }
        if (this.config.enableLogging) {
            this.log('debug', `Emitting event: ${event} to ${eventListeners.size} listeners`);
        }
        const promises = [];
        for (const listener of eventListeners) {
            try {
                const result = listener(data);
                if (result instanceof Promise) {
                    promises.push(result);
                }
            }
            catch (error) {
                if (this.config.enableLogging) {
                    this.log('error', `Error in event listener for ${event}:`, error);
                }
                // Continue with other listeners even if one fails
            }
        }
        // Wait for all async listeners to complete
        if (promises.length > 0) {
            try {
                await Promise.all(promises);
            }
            catch (error) {
                if (this.config.enableLogging) {
                    this.log('error', `Error in async event listeners for ${event}:`, error);
                }
            }
        }
    }
    /**
     * Emit an event synchronously (doesn't wait for async listeners)
     */
    emitSync(event, data) {
        const eventListeners = this.listeners.get(event);
        if (!eventListeners || eventListeners.size === 0) {
            if (this.config.enableLogging) {
                this.log('debug', `No listeners for event: ${event}`);
            }
            return;
        }
        if (this.config.enableLogging) {
            this.log('debug', `Emitting event synchronously: ${event} to ${eventListeners.size} listeners`);
        }
        for (const listener of eventListeners) {
            try {
                listener(data);
            }
            catch (error) {
                if (this.config.enableLogging) {
                    this.log('error', `Error in event listener for ${event}:`, error);
                }
                // Continue with other listeners even if one fails
            }
        }
    }
    /**
     * Remove all listeners for an event
     */
    removeAllListeners(event) {
        if (event) {
            this.listeners.delete(event);
            if (this.config.enableLogging) {
                this.log('debug', `All listeners removed for event: ${event}`);
            }
        }
        else {
            this.listeners.clear();
            if (this.config.enableLogging) {
                this.log('debug', 'All listeners removed for all events');
            }
        }
    }
    /**
     * Get listener count for an event
     */
    listenerCount(event) {
        const eventListeners = this.listeners.get(event);
        return eventListeners ? eventListeners.size : 0;
    }
    /**
     * Get all event names that have listeners
     */
    eventNames() {
        return Array.from(this.listeners.keys());
    }
    /**
     * Check if there are any listeners for an event
     */
    hasListeners(event) {
        return this.listenerCount(event) > 0;
    }
    /**
     * Get total number of listeners across all events
     */
    getTotalListenerCount() {
        let total = 0;
        for (const listeners of this.listeners.values()) {
            total += listeners.size;
        }
        return total;
    }
    /**
     * Wait for an event to be emitted
     */
    waitFor(event, timeout) {
        return new Promise((resolve, reject) => {
            let timeoutId;
            const subscription = this.once(event, (data) => {
                if (timeoutId) {
                    clearTimeout(timeoutId);
                }
                resolve(data);
            });
            if (timeout) {
                timeoutId = setTimeout(() => {
                    subscription.unsubscribe();
                    reject(new Error(`Timeout waiting for event: ${event}`));
                }, timeout);
            }
        });
    }
    /**
     * Create a filtered event listener
     */
    filter(event, predicate, listener) {
        const filteredListener = (data) => {
            if (predicate(data)) {
                listener(data);
            }
        };
        return this.on(event, filteredListener);
    }
    /**
     * Create a mapped event listener
     */
    map(event, mapper, listener) {
        const mappedListener = (data) => {
            try {
                const mappedData = mapper(data);
                listener(mappedData);
            }
            catch (error) {
                if (this.config.enableLogging) {
                    this.log('error', `Error in event mapper for ${event}:`, error);
                }
            }
        };
        return this.on(event, mappedListener);
    }
    /**
     * Log messages based on configuration
     */
    log(level, message, ...args) {
        if (!this.config.enableLogging)
            return;
        const levels = ['debug', 'info', 'warn', 'error'];
        const currentLevelIndex = levels.indexOf(this.config.logLevel);
        const messageLevelIndex = levels.indexOf(level);
        if (messageLevelIndex >= currentLevelIndex) {
            const logMethod = console[level] || console.log;
            logMethod(`[EventBus] ${message}`, ...args);
        }
    }
}
exports.EventBus = EventBus;
// Default global event bus instance
exports.globalEventBus = new EventBus();
//# sourceMappingURL=event-bus.js.map