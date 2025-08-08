/**
 * Promise utilities for async operations and promise handling
 */
declare global {
    class AggregateError extends Error {
        errors: any[];
        constructor(errors: any[], message?: string);
    }
}
export interface DelayOptions {
    signal?: AbortSignal;
}
export interface TimeoutOptions {
    message?: string;
    signal?: AbortSignal;
}
export interface RetryOptions {
    attempts?: number;
    delay?: number;
    backoff?: 'linear' | 'exponential';
    factor?: number;
    maxDelay?: number;
    signal?: AbortSignal;
    shouldRetry?: (error: any, attempt: number) => boolean;
}
export interface PromiseResult<T> {
    status: 'fulfilled' | 'rejected';
    value?: T;
    reason?: any;
}
export interface ConcurrencyOptions {
    concurrency?: number;
    signal?: AbortSignal;
}
export interface PoolOptions extends ConcurrencyOptions {
    maxRetries?: number;
    retryDelay?: number;
}
/**
 * Promise utilities class
 */
export declare class PromiseUtils {
    /**
     * Create a delay (sleep) promise
     */
    static delay(ms: number, options?: DelayOptions): Promise<void>;
    /**
     * Add timeout to promise
     */
    static timeout<T>(promise: Promise<T>, ms: number, options?: TimeoutOptions): Promise<T>;
    /**
     * Retry promise with backoff
     */
    static retry<T>(fn: () => Promise<T>, options?: RetryOptions): Promise<T>;
    /**
     * Execute promises with limited concurrency
     */
    static concurrent<T>(tasks: (() => Promise<T>)[], options?: ConcurrencyOptions): Promise<T[]>;
    /**
     * Execute promises in batches
     */
    static batch<T>(tasks: (() => Promise<T>)[], batchSize: number, options?: {
        signal?: AbortSignal;
    }): Promise<T[]>;
    /**
     * Execute promises sequentially
     */
    static sequential<T>(tasks: (() => Promise<T>)[], options?: {
        signal?: AbortSignal;
    }): Promise<T[]>;
    /**
     * Race promises with timeout
     */
    static raceWithTimeout<T>(promises: Promise<T>[], timeoutMs: number, options?: {
        signal?: AbortSignal;
    }): Promise<T>;
    /**
     * Settle all promises and return results
     */
    static allSettled<T>(promises: Promise<T>[]): Promise<PromiseResult<T>[]>;
    /**
     * Execute promises and return first successful result
     */
    static any<T>(promises: Promise<T>[]): Promise<T>;
    /**
     * Create a deferred promise
     */
    static deferred<T>(): {
        promise: Promise<T>;
        resolve: (value: T | PromiseLike<T>) => void;
        reject: (reason?: any) => void;
    };
    /**
     * Convert callback-style function to promise
     */
    static promisify<T>(fn: (...args: any[]) => void): (...args: any[]) => Promise<T>;
    /**
     * Create a promise that resolves after all microtasks
     */
    static nextTick(): Promise<void>;
    /**
     * Create a promise that resolves on next event loop
     */
    static nextMacroTask(): Promise<void>;
    /**
     * Memoize async function results
     */
    static memoizeAsync<T extends (...args: any[]) => Promise<any>>(fn: T, options?: {
        keyFn?: (...args: Parameters<T>) => string;
        ttl?: number;
    }): T;
    /**
     * Create a circuit breaker for promises
     */
    static circuitBreaker<T extends (...args: any[]) => Promise<any>>(fn: T, options?: {
        failureThreshold?: number;
        resetTimeout?: number;
        monitoringPeriod?: number;
    }): T & {
        getState: () => 'closed' | 'open' | 'half-open';
    };
    /**
     * Create a promise pool for managing concurrent operations
     */
    static createPool<T>(options?: PoolOptions): {
        add: (task: () => Promise<T>) => Promise<T>;
        size: () => number;
        running: () => number;
        clear: () => void;
    };
    /**
     * Create a debounced async function
     */
    static debounceAsync<T extends (...args: any[]) => Promise<any>>(fn: T, delay: number): T;
    /**
     * Create a throttled async function
     */
    static throttleAsync<T extends (...args: any[]) => Promise<any>>(fn: T, delay: number): T;
    /**
     * Check if value is a promise
     */
    static isPromise(value: any): value is Promise<any>;
    /**
     * Wrap value in promise if not already a promise
     */
    static resolve<T>(value: T | Promise<T>): Promise<T>;
    /**
     * Create rejected promise
     */
    static reject<T = never>(reason?: any): Promise<T>;
}
export declare const delay: typeof PromiseUtils.delay, timeout: typeof PromiseUtils.timeout, retry: typeof PromiseUtils.retry, concurrent: typeof PromiseUtils.concurrent, batch: typeof PromiseUtils.batch, sequential: typeof PromiseUtils.sequential, raceWithTimeout: typeof PromiseUtils.raceWithTimeout, allSettled: typeof PromiseUtils.allSettled, any: typeof PromiseUtils.any, deferred: typeof PromiseUtils.deferred, promisify: typeof PromiseUtils.promisify, nextTick: typeof PromiseUtils.nextTick, nextMacroTask: typeof PromiseUtils.nextMacroTask, memoizeAsync: typeof PromiseUtils.memoizeAsync, circuitBreaker: typeof PromiseUtils.circuitBreaker, createPool: typeof PromiseUtils.createPool, debounceAsync: typeof PromiseUtils.debounceAsync, throttleAsync: typeof PromiseUtils.throttleAsync, isPromise: typeof PromiseUtils.isPromise, resolve: typeof PromiseUtils.resolve, reject: typeof PromiseUtils.reject;
//# sourceMappingURL=promise-utils.d.ts.map