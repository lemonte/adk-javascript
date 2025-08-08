"use strict";
/**
 * Promise utilities for async operations and promise handling
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.reject = exports.resolve = exports.isPromise = exports.throttleAsync = exports.debounceAsync = exports.createPool = exports.circuitBreaker = exports.memoizeAsync = exports.nextMacroTask = exports.nextTick = exports.promisify = exports.deferred = exports.any = exports.allSettled = exports.raceWithTimeout = exports.sequential = exports.batch = exports.concurrent = exports.retry = exports.timeout = exports.delay = exports.PromiseUtils = void 0;
// Create AggregateError if not available
if (typeof AggregateError === 'undefined') {
    global.AggregateError = class AggregateError extends Error {
        constructor(errors, message) {
            super(message);
            this.name = 'AggregateError';
            this.errors = errors;
        }
    };
}
/**
 * Promise utilities class
 */
class PromiseUtils {
    /**
     * Create a delay (sleep) promise
     */
    static delay(ms, options = {}) {
        const { signal } = options;
        return new Promise((resolve, reject) => {
            if (signal?.aborted) {
                reject(new Error('Aborted'));
                return;
            }
            const timeoutId = setTimeout(() => {
                cleanup();
                resolve();
            }, ms);
            const cleanup = () => {
                clearTimeout(timeoutId);
                signal?.removeEventListener('abort', onAbort);
            };
            const onAbort = () => {
                cleanup();
                reject(new Error('Aborted'));
            };
            signal?.addEventListener('abort', onAbort);
        });
    }
    /**
     * Add timeout to promise
     */
    static timeout(promise, ms, options = {}) {
        const { message = `Promise timed out after ${ms}ms`, signal } = options;
        return new Promise((resolve, reject) => {
            if (signal?.aborted) {
                reject(new Error('Aborted'));
                return;
            }
            const timeoutId = setTimeout(() => {
                cleanup();
                reject(new Error(message));
            }, ms);
            const cleanup = () => {
                clearTimeout(timeoutId);
                signal?.removeEventListener('abort', onAbort);
            };
            const onAbort = () => {
                cleanup();
                reject(new Error('Aborted'));
            };
            signal?.addEventListener('abort', onAbort);
            promise
                .then(value => {
                cleanup();
                resolve(value);
            })
                .catch(error => {
                cleanup();
                reject(error);
            });
        });
    }
    /**
     * Retry promise with backoff
     */
    static async retry(fn, options = {}) {
        const { attempts = 3, delay = 1000, backoff = 'exponential', factor = 2, maxDelay = 30000, signal, shouldRetry = () => true, } = options;
        let lastError;
        for (let attempt = 1; attempt <= attempts; attempt++) {
            if (signal?.aborted) {
                throw new Error('Aborted');
            }
            try {
                return await fn();
            }
            catch (error) {
                lastError = error;
                if (attempt === attempts || !shouldRetry(error, attempt)) {
                    throw error;
                }
                let currentDelay = delay;
                if (backoff === 'exponential') {
                    currentDelay = Math.min(delay * Math.pow(factor, attempt - 1), maxDelay);
                }
                else if (backoff === 'linear') {
                    currentDelay = Math.min(delay * attempt, maxDelay);
                }
                await this.delay(currentDelay, { signal });
            }
        }
        throw lastError;
    }
    /**
     * Execute promises with limited concurrency
     */
    static async concurrent(tasks, options = {}) {
        const { concurrency = 5, signal } = options;
        if (tasks.length === 0) {
            return [];
        }
        if (signal?.aborted) {
            throw new Error('Aborted');
        }
        const results = new Array(tasks.length);
        const executing = [];
        let index = 0;
        const executeTask = async (taskIndex) => {
            if (signal?.aborted) {
                throw new Error('Aborted');
            }
            try {
                results[taskIndex] = await tasks[taskIndex]();
            }
            catch (error) {
                throw error;
            }
        };
        while (index < tasks.length) {
            if (executing.length < concurrency) {
                const taskIndex = index++;
                const promise = executeTask(taskIndex);
                executing.push(promise);
                promise.finally(() => {
                    const executeIndex = executing.indexOf(promise);
                    if (executeIndex > -1) {
                        executing.splice(executeIndex, 1);
                    }
                });
            }
            else {
                await Promise.race(executing);
            }
        }
        await Promise.all(executing);
        return results;
    }
    /**
     * Execute promises in batches
     */
    static async batch(tasks, batchSize, options = {}) {
        const { signal } = options;
        const results = [];
        for (let i = 0; i < tasks.length; i += batchSize) {
            if (signal?.aborted) {
                throw new Error('Aborted');
            }
            const batch = tasks.slice(i, i + batchSize);
            const batchResults = await Promise.all(batch.map(task => task()));
            results.push(...batchResults);
        }
        return results;
    }
    /**
     * Execute promises sequentially
     */
    static async sequential(tasks, options = {}) {
        const { signal } = options;
        const results = [];
        for (const task of tasks) {
            if (signal?.aborted) {
                throw new Error('Aborted');
            }
            results.push(await task());
        }
        return results;
    }
    /**
     * Race promises with timeout
     */
    static raceWithTimeout(promises, timeoutMs, options = {}) {
        const { signal } = options;
        const timeoutPromise = this.delay(timeoutMs, { signal }).then(() => {
            throw new Error(`Race timed out after ${timeoutMs}ms`);
        });
        return Promise.race([...promises, timeoutPromise]);
    }
    /**
     * Settle all promises and return results
     */
    static async allSettled(promises) {
        const results = await Promise.allSettled(promises);
        return results.map(result => {
            if (result.status === 'fulfilled') {
                return {
                    status: 'fulfilled',
                    value: result.value,
                };
            }
            else {
                return {
                    status: 'rejected',
                    reason: result.reason,
                };
            }
        });
    }
    /**
     * Execute promises and return first successful result
     */
    static async any(promises) {
        if (promises.length === 0) {
            throw new Error('No promises provided');
        }
        return new Promise((resolve, reject) => {
            let rejectedCount = 0;
            const errors = [];
            promises.forEach((promise, index) => {
                promise
                    .then(resolve)
                    .catch(error => {
                    errors[index] = error;
                    rejectedCount++;
                    if (rejectedCount === promises.length) {
                        reject(new AggregateError(errors, 'All promises rejected'));
                    }
                });
            });
        });
    }
    /**
     * Create a deferred promise
     */
    static deferred() {
        let resolve;
        let reject;
        const promise = new Promise((res, rej) => {
            resolve = res;
            reject = rej;
        });
        return { promise, resolve, reject };
    }
    /**
     * Convert callback-style function to promise
     */
    static promisify(fn) {
        return (...args) => {
            return new Promise((resolve, reject) => {
                fn(...args, (error, result) => {
                    if (error) {
                        reject(error);
                    }
                    else {
                        resolve(result);
                    }
                });
            });
        };
    }
    /**
     * Create a promise that resolves after all microtasks
     */
    static nextTick() {
        return Promise.resolve();
    }
    /**
     * Create a promise that resolves on next event loop
     */
    static nextMacroTask() {
        return new Promise(resolve => setTimeout(resolve, 0));
    }
    /**
     * Memoize async function results
     */
    static memoizeAsync(fn, options = {}) {
        const { keyFn = (...args) => JSON.stringify(args), ttl } = options;
        const cache = new Map();
        return ((...args) => {
            const key = keyFn(...args);
            const cached = cache.get(key);
            if (cached) {
                if (!ttl || !cached.timestamp || Date.now() - cached.timestamp < ttl) {
                    return cached.promise;
                }
                else {
                    cache.delete(key);
                }
            }
            const promise = fn(...args);
            cache.set(key, {
                promise,
                timestamp: ttl ? Date.now() : undefined,
            });
            // Clean up cache on rejection
            promise.catch(() => cache.delete(key));
            return promise;
        });
    }
    /**
     * Create a circuit breaker for promises
     */
    static circuitBreaker(fn, options = {}) {
        const { failureThreshold = 5, resetTimeout = 60000, monitoringPeriod = 10000, } = options;
        let state = 'closed';
        let failures = 0;
        let lastFailureTime = 0;
        let successes = 0;
        const resetFailures = () => {
            failures = 0;
            successes = 0;
        };
        const wrappedFn = ((...args) => {
            const now = Date.now();
            // Reset counters if monitoring period has passed
            if (now - lastFailureTime > monitoringPeriod) {
                resetFailures();
            }
            if (state === 'open') {
                if (now - lastFailureTime > resetTimeout) {
                    state = 'half-open';
                    successes = 0;
                }
                else {
                    return Promise.reject(new Error('Circuit breaker is open'));
                }
            }
            return fn(...args)
                .then(result => {
                if (state === 'half-open') {
                    successes++;
                    if (successes >= 3) {
                        state = 'closed';
                        resetFailures();
                    }
                }
                else {
                    resetFailures();
                }
                return result;
            })
                .catch(error => {
                failures++;
                lastFailureTime = now;
                if (state === 'half-open' || failures >= failureThreshold) {
                    state = 'open';
                }
                throw error;
            });
        });
        wrappedFn.getState = () => state;
        return wrappedFn;
    }
    /**
     * Create a promise pool for managing concurrent operations
     */
    static createPool(options = {}) {
        const { concurrency = 5, maxRetries = 3, retryDelay = 1000, signal, } = options;
        const queue = [];
        let running = 0;
        const processQueue = async () => {
            if (running >= concurrency || queue.length === 0) {
                return;
            }
            running++;
            const item = queue.shift();
            try {
                if (signal?.aborted) {
                    throw new Error('Aborted');
                }
                const result = await item.task();
                item.resolve(result);
            }
            catch (error) {
                if (item.retries < maxRetries) {
                    item.retries++;
                    // Add back to queue with delay
                    setTimeout(() => {
                        queue.unshift(item);
                        processQueue();
                    }, retryDelay);
                }
                else {
                    item.reject(error);
                }
            }
            finally {
                running--;
                processQueue();
            }
        };
        return {
            add: (task) => {
                return new Promise((resolve, reject) => {
                    queue.push({ task, resolve, reject, retries: 0 });
                    processQueue();
                });
            },
            size: () => queue.length,
            running: () => running,
            clear: () => {
                queue.forEach(item => item.reject(new Error('Pool cleared')));
                queue.length = 0;
            },
        };
    }
    /**
     * Create a debounced async function
     */
    static debounceAsync(fn, delay) {
        let timeoutId = null;
        let latestResolve = null;
        let latestReject = null;
        return ((...args) => {
            return new Promise((resolve, reject) => {
                if (timeoutId) {
                    clearTimeout(timeoutId);
                }
                latestResolve = resolve;
                latestReject = reject;
                timeoutId = setTimeout(async () => {
                    try {
                        const result = await fn(...args);
                        latestResolve?.(result);
                    }
                    catch (error) {
                        latestReject?.(error);
                    }
                }, delay);
            });
        });
    }
    /**
     * Create a throttled async function
     */
    static throttleAsync(fn, delay) {
        let lastExecution = 0;
        let timeoutId = null;
        return ((...args) => {
            return new Promise((resolve, reject) => {
                const now = Date.now();
                const timeSinceLastExecution = now - lastExecution;
                if (timeSinceLastExecution >= delay) {
                    lastExecution = now;
                    fn(...args).then(resolve).catch(reject);
                }
                else {
                    if (timeoutId) {
                        clearTimeout(timeoutId);
                    }
                    timeoutId = setTimeout(() => {
                        lastExecution = Date.now();
                        fn(...args).then(resolve).catch(reject);
                    }, delay - timeSinceLastExecution);
                }
            });
        });
    }
    /**
     * Check if value is a promise
     */
    static isPromise(value) {
        return value != null && typeof value.then === 'function';
    }
    /**
     * Wrap value in promise if not already a promise
     */
    static resolve(value) {
        return this.isPromise(value) ? value : Promise.resolve(value);
    }
    /**
     * Create rejected promise
     */
    static reject(reason) {
        return Promise.reject(reason);
    }
}
exports.PromiseUtils = PromiseUtils;
// Export commonly used functions
exports.delay = PromiseUtils.delay, exports.timeout = PromiseUtils.timeout, exports.retry = PromiseUtils.retry, exports.concurrent = PromiseUtils.concurrent, exports.batch = PromiseUtils.batch, exports.sequential = PromiseUtils.sequential, exports.raceWithTimeout = PromiseUtils.raceWithTimeout, exports.allSettled = PromiseUtils.allSettled, exports.any = PromiseUtils.any, exports.deferred = PromiseUtils.deferred, exports.promisify = PromiseUtils.promisify, exports.nextTick = PromiseUtils.nextTick, exports.nextMacroTask = PromiseUtils.nextMacroTask, exports.memoizeAsync = PromiseUtils.memoizeAsync, exports.circuitBreaker = PromiseUtils.circuitBreaker, exports.createPool = PromiseUtils.createPool, exports.debounceAsync = PromiseUtils.debounceAsync, exports.throttleAsync = PromiseUtils.throttleAsync, exports.isPromise = PromiseUtils.isPromise, exports.resolve = PromiseUtils.resolve, exports.reject = PromiseUtils.reject;
// Create AggregateError if not available
if (typeof AggregateError === 'undefined') {
    global.AggregateError = class AggregateError extends Error {
        constructor(errors, message) {
            super(message);
            this.name = 'AggregateError';
            this.errors = errors;
        }
    };
}
//# sourceMappingURL=promise-utils.js.map