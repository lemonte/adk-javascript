import { ProcessedEvent, EventStoreConfig, EventQueryOptions, EventStats, IEventStore } from './types';
/**
 * In-memory event store implementation
 */
export declare class InMemoryEventStore implements IEventStore {
    private config;
    private events;
    private eventsByType;
    private eventsByStatus;
    private eventsBySource;
    private eventsByCorrelation;
    private eventsByCausation;
    private isInitialized;
    private cleanupInterval?;
    constructor(config?: EventStoreConfig);
    /**
     * Initializes the event store
     */
    initialize(): Promise<void>;
    /**
     * Shuts down the event store
     */
    shutdown(): Promise<void>;
    /**
     * Stores an event
     */
    store(event: ProcessedEvent): Promise<void>;
    /**
     * Retrieves an event by ID
     */
    get(eventId: string): Promise<ProcessedEvent | undefined>;
    /**
     * Queries events based on criteria
     */
    query(options: EventQueryOptions): Promise<ProcessedEvent[]>;
    /**
     * Deletes an event
     */
    delete(eventId: string): Promise<boolean>;
    /**
     * Deletes multiple events
     */
    deleteMany(eventIds: string[]): Promise<number>;
    /**
     * Clears all events
     */
    clear(): Promise<void>;
    /**
     * Gets event statistics
     */
    getStats(): Promise<EventStats>;
    /**
     * Gets the current configuration
     */
    getConfiguration(): EventStoreConfig;
    /**
     * Updates the configuration
     */
    updateConfiguration(config: Partial<EventStoreConfig>): void;
    /**
     * Gets health status
     */
    getHealthStatus(): {
        healthy: boolean;
        details: Record<string, any>;
    };
    /**
     * Enforces storage limits by removing old events
     */
    private enforceStorageLimit;
    /**
     * Updates indexes for an event
     */
    private updateIndexes;
    /**
     * Removes an event from indexes
     */
    private removeFromIndexes;
    /**
     * Clears all indexes
     */
    private clearIndexes;
    /**
     * Gets event IDs from indexes based on query options
     */
    private getEventIdsFromIndexes;
    /**
     * Applies filters to events
     */
    private applyFilters;
    /**
     * Sorts events based on options
     */
    private sortEvents;
    /**
     * Starts the cleanup process
     */
    private startCleanupProcess;
    /**
     * Cleans up expired events
     */
    private cleanupExpiredEvents;
    /**
     * Creates an error with context
     */
    private createError;
}
/**
 * File-based event store implementation (placeholder)
 */
export declare class FileEventStore implements IEventStore {
    private config;
    private filePath;
    private isInitialized;
    constructor(filePath: string, config?: EventStoreConfig);
    initialize(): Promise<void>;
    shutdown(): Promise<void>;
    store(event: ProcessedEvent): Promise<void>;
    get(eventId: string): Promise<ProcessedEvent | undefined>;
    query(options: EventQueryOptions): Promise<ProcessedEvent[]>;
    delete(eventId: string): Promise<boolean>;
    deleteMany(eventIds: string[]): Promise<number>;
    clear(): Promise<void>;
    getStats(): Promise<EventStats>;
    getConfiguration(): EventStoreConfig;
    updateConfiguration(config: Partial<EventStoreConfig>): void;
    getHealthStatus(): {
        healthy: boolean;
        details: Record<string, any>;
    };
}
//# sourceMappingURL=event-store.d.ts.map