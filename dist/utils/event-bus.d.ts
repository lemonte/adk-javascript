/**
 * Event bus for handling application events
 */
export interface EventBusConfig {
    maxListeners?: number;
    enableLogging?: boolean;
    logLevel?: 'debug' | 'info' | 'warn' | 'error';
}
export type EventListener<T = any> = (data: T) => void | Promise<void>;
export interface EventSubscription {
    unsubscribe(): void;
}
/**
 * Simple event bus implementation
 */
export declare class EventBus {
    private listeners;
    private config;
    constructor(config?: EventBusConfig);
    /**
     * Subscribe to an event
     */
    on<T = any>(event: string, listener: EventListener<T>): EventSubscription;
    /**
     * Subscribe to an event once
     */
    once<T = any>(event: string, listener: EventListener<T>): EventSubscription;
    /**
     * Unsubscribe from an event
     */
    off<T = any>(event: string, listener: EventListener<T>): void;
    /**
     * Emit an event
     */
    emit<T = any>(event: string, data?: T): Promise<void>;
    /**
     * Emit an event synchronously (doesn't wait for async listeners)
     */
    emitSync<T = any>(event: string, data?: T): void;
    /**
     * Remove all listeners for an event
     */
    removeAllListeners(event?: string): void;
    /**
     * Get listener count for an event
     */
    listenerCount(event: string): number;
    /**
     * Get all event names that have listeners
     */
    eventNames(): string[];
    /**
     * Check if there are any listeners for an event
     */
    hasListeners(event: string): boolean;
    /**
     * Get total number of listeners across all events
     */
    getTotalListenerCount(): number;
    /**
     * Wait for an event to be emitted
     */
    waitFor<T = any>(event: string, timeout?: number): Promise<T>;
    /**
     * Create a filtered event listener
     */
    filter<T = any>(event: string, predicate: (data: T) => boolean, listener: EventListener<T>): EventSubscription;
    /**
     * Create a mapped event listener
     */
    map<T = any, U = any>(event: string, mapper: (data: T) => U, listener: EventListener<U>): EventSubscription;
    /**
     * Log messages based on configuration
     */
    private log;
}
export declare const globalEventBus: EventBus;
//# sourceMappingURL=event-bus.d.ts.map