import { BaseEvent, ProcessedEvent, EventEmitterConfig, EventBusConfig, EventStoreConfig, EventQueryOptions, EventStats, EventValidationResult } from './types';
/**
 * Generates a unique event ID
 */
export declare function generateEventId(): string;
/**
 * Validates an event ID
 */
export declare function validateEventId(eventId: string): boolean;
/**
 * Validates an event type
 */
export declare function validateEventType(eventType: string): boolean;
/**
 * Validates a base event
 */
export declare function validateEvent(event: BaseEvent): EventValidationResult;
/**
 * Validates an event emitter configuration
 */
export declare function validateEventEmitterConfig(config: EventEmitterConfig): EventValidationResult;
/**
 * Validates an event bus configuration
 */
export declare function validateEventBusConfig(config: EventBusConfig): EventValidationResult;
/**
 * Validates an event store configuration
 */
export declare function validateEventStoreConfig(config: EventStoreConfig): EventValidationResult;
/**
 * Sanitizes event data by removing sensitive information
 */
export declare function sanitizeEvent(event: BaseEvent): BaseEvent;
/**
 * Calculates event processing statistics
 */
export declare function calculateEventStats(events: ProcessedEvent[]): EventStats;
/**
 * Filters events based on query options
 */
export declare function filterEvents(events: ProcessedEvent[], options: EventQueryOptions): ProcessedEvent[];
/**
 * Sorts events based on criteria
 */
export declare function sortEvents(events: ProcessedEvent[], sortBy: 'timestamp' | 'priority' | 'type', sortOrder?: 'asc' | 'desc'): ProcessedEvent[];
/**
 * Paginates events
 */
export declare function paginateEvents(events: ProcessedEvent[], offset?: number, limit?: number): ProcessedEvent[];
/**
 * Merges event configurations with defaults
 */
export declare function mergeEventEmitterConfig(config: EventEmitterConfig): Required<EventEmitterConfig>;
/**
 * Merges event bus configurations with defaults
 */
export declare function mergeEventBusConfig(config: EventBusConfig): Required<EventBusConfig>;
/**
 * Merges event store configurations with defaults
 */
export declare function mergeEventStoreConfig(config: EventStoreConfig): Required<EventStoreConfig>;
/**
 * Compares two events for equality
 */
export declare function compareEvents(event1: BaseEvent, event2: BaseEvent): boolean;
/**
 * Creates a correlation ID for event tracking
 */
export declare function createCorrelationId(): string;
/**
 * Creates a causation ID for event tracking
 */
export declare function createCausationId(): string;
/**
 * Formats duration in milliseconds to human-readable string
 */
export declare function formatDuration(milliseconds: number): string;
/**
 * Formats memory size in bytes to human-readable string
 */
export declare function formatMemorySize(bytes: number): string;
/**
 * Deep clones an object
 */
export declare function deepClone<T>(obj: T): T;
/**
 * Calculates memory usage of an object
 */
export declare function calculateMemoryUsage(obj: any): number;
/**
 * Validates event integrity
 */
export declare function validateEventIntegrity(event: ProcessedEvent): boolean;
//# sourceMappingURL=utils.d.ts.map