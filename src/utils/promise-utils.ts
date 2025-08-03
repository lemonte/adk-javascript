/**
 * Promise utilities for async operations and promise handling
 */

// Declare AggregateError for TypeScript
declare global {
  class AggregateError extends Error {
    errors: any[];
    constructor(errors: any[], message?: string);
  }
}

// Create AggregateError if not available
if (typeof AggregateError === 'undefined') {
  (global as any).AggregateError = class AggregateError extends Error {
    errors: any[];
    
    constructor(errors: any[], message?: string) {
      super(message);
      this.name = 'AggregateError';
      this.errors = errors;
    }
  };
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
export class PromiseUtils {
  /**
   * Create a delay (sleep) promise
   */
  static delay(ms: number, options: DelayOptions = {}): Promise<void> {
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
  static timeout<T>(
    promise: Promise<T>,
    ms: number,
    options: TimeoutOptions = {}
  ): Promise<T> {
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
  static async retry<T>(
    fn: () => Promise<T>,
    options: RetryOptions = {}
  ): Promise<T> {
    const {
      attempts = 3,
      delay = 1000,
      backoff = 'exponential',
      factor = 2,
      maxDelay = 30000,
      signal,
      shouldRetry = () => true,
    } = options;
    
    let lastError: any;
    
    for (let attempt = 1; attempt <= attempts; attempt++) {
      if (signal?.aborted) {
        throw new Error('Aborted');
      }
      
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        
        if (attempt === attempts || !shouldRetry(error, attempt)) {
          throw error;
        }
        
        let currentDelay = delay;
        
        if (backoff === 'exponential') {
          currentDelay = Math.min(delay * Math.pow(factor, attempt - 1), maxDelay);
        } else if (backoff === 'linear') {
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
  static async concurrent<T>(
    tasks: (() => Promise<T>)[],
    options: ConcurrencyOptions = {}
  ): Promise<T[]> {
    const { concurrency = 5, signal } = options;
    
    if (tasks.length === 0) {
      return [];
    }
    
    if (signal?.aborted) {
      throw new Error('Aborted');
    }
    
    const results: T[] = new Array(tasks.length);
    const executing: Promise<void>[] = [];
    let index = 0;
    
    const executeTask = async (taskIndex: number): Promise<void> => {
      if (signal?.aborted) {
        throw new Error('Aborted');
      }
      
      try {
        results[taskIndex] = await tasks[taskIndex]();
      } catch (error) {
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
      } else {
        await Promise.race(executing);
      }
    }
    
    await Promise.all(executing);
    return results;
  }

  /**
   * Execute promises in batches
   */
  static async batch<T>(
    tasks: (() => Promise<T>)[],
    batchSize: number,
    options: { signal?: AbortSignal } = {}
  ): Promise<T[]> {
    const { signal } = options;
    const results: T[] = [];
    
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
  static async sequential<T>(
    tasks: (() => Promise<T>)[],
    options: { signal?: AbortSignal } = {}
  ): Promise<T[]> {
    const { signal } = options;
    const results: T[] = [];
    
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
  static raceWithTimeout<T>(
    promises: Promise<T>[],
    timeoutMs: number,
    options: { signal?: AbortSignal } = {}
  ): Promise<T> {
    const { signal } = options;
    
    const timeoutPromise = this.delay(timeoutMs, { signal }).then(() => {
      throw new Error(`Race timed out after ${timeoutMs}ms`);
    });
    
    return Promise.race([...promises, timeoutPromise]);
  }

  /**
   * Settle all promises and return results
   */
  static async allSettled<T>(
    promises: Promise<T>[]
  ): Promise<PromiseResult<T>[]> {
    const results = await Promise.allSettled(promises);
    
    return results.map(result => {
      if (result.status === 'fulfilled') {
        return {
          status: 'fulfilled' as const,
          value: result.value,
        };
      } else {
        return {
          status: 'rejected' as const,
          reason: result.reason,
        };
      }
    });
  }

  /**
   * Execute promises and return first successful result
   */
  static async any<T>(promises: Promise<T>[]): Promise<T> {
    if (promises.length === 0) {
      throw new Error('No promises provided');
    }
    
    return new Promise((resolve, reject) => {
      let rejectedCount = 0;
      const errors: any[] = [];
      
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
  static deferred<T>(): {
    promise: Promise<T>;
    resolve: (value: T | PromiseLike<T>) => void;
    reject: (reason?: any) => void;
  } {
    let resolve!: (value: T | PromiseLike<T>) => void;
    let reject!: (reason?: any) => void;
    
    const promise = new Promise<T>((res, rej) => {
      resolve = res;
      reject = rej;
    });
    
    return { promise, resolve, reject };
  }

  /**
   * Convert callback-style function to promise
   */
  static promisify<T>(
    fn: (...args: any[]) => void
  ): (...args: any[]) => Promise<T> {
    return (...args: any[]) => {
      return new Promise((resolve, reject) => {
        fn(...args, (error: any, result: T) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        });
      });
    };
  }

  /**
   * Create a promise that resolves after all microtasks
   */
  static nextTick(): Promise<void> {
    return Promise.resolve();
  }

  /**
   * Create a promise that resolves on next event loop
   */
  static nextMacroTask(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, 0));
  }

  /**
   * Memoize async function results
   */
  static memoizeAsync<T extends (...args: any[]) => Promise<any>>(
    fn: T,
    options: {
      keyFn?: (...args: Parameters<T>) => string;
      ttl?: number;
    } = {}
  ): T {
    const { keyFn = (...args) => JSON.stringify(args), ttl } = options;
    const cache = new Map<string, { promise: Promise<any>; timestamp?: number }>();
    
    return ((...args: Parameters<T>) => {
      const key = keyFn(...args);
      const cached = cache.get(key);
      
      if (cached) {
        if (!ttl || !cached.timestamp || Date.now() - cached.timestamp < ttl) {
          return cached.promise;
        } else {
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
    }) as T;
  }

  /**
   * Create a circuit breaker for promises
   */
  static circuitBreaker<T extends (...args: any[]) => Promise<any>>(
    fn: T,
    options: {
      failureThreshold?: number;
      resetTimeout?: number;
      monitoringPeriod?: number;
    } = {}
  ): T & { getState: () => 'closed' | 'open' | 'half-open' } {
    const {
      failureThreshold = 5,
      resetTimeout = 60000,
      monitoringPeriod = 10000,
    } = options;
    
    let state: 'closed' | 'open' | 'half-open' = 'closed';
    let failures = 0;
    let lastFailureTime = 0;
    let successes = 0;
    
    const resetFailures = () => {
      failures = 0;
      successes = 0;
    };
    
    const wrappedFn = ((...args: Parameters<T>) => {
      const now = Date.now();
      
      // Reset counters if monitoring period has passed
      if (now - lastFailureTime > monitoringPeriod) {
        resetFailures();
      }
      
      if (state === 'open') {
        if (now - lastFailureTime > resetTimeout) {
          state = 'half-open';
          successes = 0;
        } else {
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
          } else {
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
    }) as T;
    
    (wrappedFn as any).getState = () => state;
    
    return wrappedFn as T & { getState: () => 'closed' | 'open' | 'half-open' };
  }

  /**
   * Create a promise pool for managing concurrent operations
   */
  static createPool<T>(options: PoolOptions = {}) {
    const {
      concurrency = 5,
      maxRetries = 3,
      retryDelay = 1000,
      signal,
    } = options;
    
    const queue: Array<{
      task: () => Promise<T>;
      resolve: (value: T) => void;
      reject: (error: any) => void;
      retries: number;
    }> = [];
    
    let running = 0;
    
    const processQueue = async () => {
      if (running >= concurrency || queue.length === 0) {
        return;
      }
      
      running++;
      const item = queue.shift()!;
      
      try {
        if (signal?.aborted) {
          throw new Error('Aborted');
        }
        
        const result = await item.task();
        item.resolve(result);
      } catch (error) {
        if (item.retries < maxRetries) {
          item.retries++;
          
          // Add back to queue with delay
          setTimeout(() => {
            queue.unshift(item);
            processQueue();
          }, retryDelay);
        } else {
          item.reject(error);
        }
      } finally {
        running--;
        processQueue();
      }
    };
    
    return {
      add: (task: () => Promise<T>): Promise<T> => {
        return new Promise<T>((resolve, reject) => {
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
  static debounceAsync<T extends (...args: any[]) => Promise<any>>(
    fn: T,
    delay: number
  ): T {
    let timeoutId: NodeJS.Timeout | null = null;
    let latestResolve: ((value: any) => void) | null = null;
    let latestReject: ((error: any) => void) | null = null;
    
    return ((...args: Parameters<T>) => {
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
          } catch (error) {
            latestReject?.(error);
          }
        }, delay);
      });
    }) as T;
  }

  /**
   * Create a throttled async function
   */
  static throttleAsync<T extends (...args: any[]) => Promise<any>>(
    fn: T,
    delay: number
  ): T {
    let lastExecution = 0;
    let timeoutId: NodeJS.Timeout | null = null;
    
    return ((...args: Parameters<T>) => {
      return new Promise((resolve, reject) => {
        const now = Date.now();
        const timeSinceLastExecution = now - lastExecution;
        
        if (timeSinceLastExecution >= delay) {
          lastExecution = now;
          fn(...args).then(resolve).catch(reject);
        } else {
          if (timeoutId) {
            clearTimeout(timeoutId);
          }
          
          timeoutId = setTimeout(() => {
            lastExecution = Date.now();
            fn(...args).then(resolve).catch(reject);
          }, delay - timeSinceLastExecution);
        }
      });
    }) as T;
  }

  /**
   * Check if value is a promise
   */
  static isPromise(value: any): value is Promise<any> {
    return value != null && typeof value.then === 'function';
  }

  /**
   * Wrap value in promise if not already a promise
   */
  static resolve<T>(value: T | Promise<T>): Promise<T> {
    return this.isPromise(value) ? value : Promise.resolve(value);
  }

  /**
   * Create rejected promise
   */
  static reject<T = never>(reason?: any): Promise<T> {
    return Promise.reject(reason);
  }
}

// Export commonly used functions
export const {
  delay,
  timeout,
  retry,
  concurrent,
  batch,
  sequential,
  raceWithTimeout,
  allSettled,
  any,
  deferred,
  promisify,
  nextTick,
  nextMacroTask,
  memoizeAsync,
  circuitBreaker,
  createPool,
  debounceAsync,
  throttleAsync,
  isPromise,
  resolve,
  reject,
} = PromiseUtils;

// Create AggregateError if not available
if (typeof AggregateError === 'undefined') {
  (global as any).AggregateError = class AggregateError extends Error {
    errors: any[];
    
    constructor(errors: any[], message?: string) {
      super(message);
      this.name = 'AggregateError';
      this.errors = errors;
    }
  };
}