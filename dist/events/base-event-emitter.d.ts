import { BaseEvent, EventListener, EventListenerConfig, EventEmitterConfig, IEventEmitter } from './types';
/**
 * Base event emitter implementation
 */
export declare abstract class BaseEventEmitter implements IEventEmitter {
    protected config: Required<EventEmitterConfig>;
    protected listeners: Map<string, EventListenerConfig[]>;
    protected isInitialized: boolean;
    constructor(config?: EventEmitterConfig);
    /**
     * Initializes the event emitter
     */
    initialize(): Promise<void>;
    /**
     * Shuts down the event emitter
     */
    shutdown(): Promise<void>;
    /**
     * Emits an event to all registered listeners
     */
    emit(event: BaseEvent): Promise<void>;
    /**
     * Adds an event listener
     */
    on<T extends BaseEvent>(eventType: string, listener: EventListener<T>): void;
    /**
     * Adds a one-time event listener
     */
    once<T extends BaseEvent>(eventType: string, listener: EventListener<T>): void;
    /**
     * Removes an event listener
     */
    off<T extends BaseEvent>(eventType: string, listener: EventListener<T>): void;
    /**
     * Removes all listeners for an event type
     */
    removeAllListeners(eventType?: string): void;
    /**
     * Gets the number of listeners for an event type
     */
    listenerCount(eventType: string): number;
    /**
     * Gets all event types with listeners
     */
    eventNames(): string[];
    /**
     * Adds a listener with configuration
     */
    addListenerWithConfig<T extends BaseEvent>(eventType: string, listener: EventListener<T>, config?: Partial<EventListenerConfig<T>>): void;
    /**
     * Gets all listeners for an event type
     */
    getListeners(eventType: string): EventListenerConfig[];
    /**
     * Checks if there are any listeners for an event type
     */
    hasListeners(eventType: string): boolean;
    /**
     * Gets the current configuration
     */
    getConfiguration(): EventEmitterConfig;
    /**
     * Updates the configuration
     */
    updateConfiguration(config: Partial<EventEmitterConfig>): void;
    /**
     * Gets health status
     */
    getHealthStatus(): {
        healthy: boolean;
        details: Record<string, any>;
    };
    /**
     * Hook for subclass initialization
     */
    protected onInitialize(): Promise<void>;
    /**
     * Hook for subclass shutdown
     */
    protected onShutdown(): Promise<void>;
    /**
     * Adds a listener with configuration
     */
    private addListener;
    /**
     * Executes a listener function
     */
    private executeListener;
    /**
     * Handles listener execution errors
     */
    private handleListenerError;
    /**
     * Removes one-time listeners after execution
     */
    private removeOneTimeListeners;
    /**
     * Validates an event
     */
    private validateEvent;
    /**
     * Creates an error with context
     */
    private createError;
}
//# sourceMappingURL=base-event-emitter.d.ts.map