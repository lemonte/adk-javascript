/**
 * Retry utilities for handling failed operations
 */

export interface RetryConfig {
  maxAttempts: number;
  baseDelay?: number; // Base delay in milliseconds
  maxDelay?: number; // Maximum delay in milliseconds
  backoffFactor?: number; // Exponential backoff factor
  jitter?: boolean; // Add random jitter to delays
  retryCondition?: (error: any, attempt: number) => boolean;
  onRetry?: (error: any, attempt: number, delay: number) => void;
  enableLogging?: boolean;
}

export interface RetryResult<T> {
  success: boolean;
  result?: T;
  error?: any;
  attempts: number;
  totalTime: number;
}

export interface RetryAttempt {
  attempt: number;
  error: any;
  delay: number;
  timestamp: number;
}

/**
 * Retry strategies
 */
export enum RetryStrategy {
  FIXED = 'fixed',
  LINEAR = 'linear',
  EXPONENTIAL = 'exponential',
  FIBONACCI = 'fibonacci',
}

/**
 * Default retry conditions
 */
export const RetryConditions = {
  /**
   * Always retry (up to max attempts)
   */
  always: () => true,

  /**
   * Never retry
   */
  never: () => false,

  /**
   * Retry on network errors
   */
  networkErrors: (error: any) => {
    if (error?.code) {
      return ['ECONNRESET', 'ENOTFOUND', 'ECONNREFUSED', 'ETIMEDOUT'].includes(error.code);
    }
    if (error?.message) {
      return error.message.includes('network') || error.message.includes('timeout');
    }
    return false;
  },

  /**
   * Retry on HTTP 5xx errors
   */
  serverErrors: (error: any) => {
    const status = error?.response?.status || error?.status;
    return status >= 500 && status < 600;
  },

  /**
   * Retry on specific HTTP status codes
   */
  httpStatus: (codes: number[]) => (error: any) => {
    const status = error?.response?.status || error?.status;
    return codes.includes(status);
  },

  /**
   * Retry on specific error types
   */
  errorTypes: (types: string[]) => (error: any) => {
    return types.includes(error?.constructor?.name) || types.includes(error?.name);
  },

  /**
   * Combine multiple conditions with OR logic
   */
  or: (...conditions: Array<(error: any, attempt: number) => boolean>) => {
    return (error: any, attempt: number) => {
      return conditions.some(condition => condition(error, attempt));
    };
  },

  /**
   * Combine multiple conditions with AND logic
   */
  and: (...conditions: Array<(error: any, attempt: number) => boolean>) => {
    return (error: any, attempt: number) => {
      return conditions.every(condition => condition(error, attempt));
    };
  },
};

/**
 * Calculate delay based on strategy
 */
export function calculateDelay(
  attempt: number,
  strategy: RetryStrategy,
  baseDelay: number,
  backoffFactor: number,
  maxDelay: number,
  jitter: boolean
): number {
  let delay: number;

  switch (strategy) {
    case RetryStrategy.FIXED:
      delay = baseDelay;
      break;

    case RetryStrategy.LINEAR:
      delay = baseDelay * attempt;
      break;

    case RetryStrategy.EXPONENTIAL:
      delay = baseDelay * Math.pow(backoffFactor, attempt - 1);
      break;

    case RetryStrategy.FIBONACCI:
      delay = baseDelay * fibonacci(attempt);
      break;

    default:
      delay = baseDelay;
  }

  // Apply maximum delay limit
  delay = Math.min(delay, maxDelay);

  // Add jitter if enabled
  if (jitter) {
    delay = delay * (0.5 + Math.random() * 0.5);
  }

  return Math.floor(delay);
}

/**
 * Calculate fibonacci number
 */
function fibonacci(n: number): number {
  if (n <= 1) return 1;
  if (n === 2) return 1;
  
  let a = 1, b = 1;
  for (let i = 3; i <= n; i++) {
    [a, b] = [b, a + b];
  }
  return b;
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry function with configurable strategy
 */
export async function retry<T>(
  fn: () => Promise<T>,
  config: RetryConfig
): Promise<T> {
  const {
    maxAttempts,
    baseDelay = 1000,
    maxDelay = 30000,
    backoffFactor = 2,
    jitter = true,
    retryCondition = RetryConditions.always,
    onRetry,
    enableLogging = false,
  } = config;

  const attempts: RetryAttempt[] = [];
  const startTime = Date.now();

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      if (enableLogging && attempt > 1) {
        console.log(`[Retry] Attempt ${attempt}/${maxAttempts}`);
      }

      const result = await fn();
      
      if (enableLogging && attempt > 1) {
        console.log(`[Retry] Success on attempt ${attempt}`);
      }

      return result;
    } catch (error) {
      const shouldRetry = attempt < maxAttempts && retryCondition(error, attempt);
      
      if (!shouldRetry) {
        if (enableLogging) {
          console.log(`[Retry] Failed after ${attempt} attempts:`, error);
        }
        throw error;
      }

      const delay = calculateDelay(
        attempt,
        RetryStrategy.EXPONENTIAL,
        baseDelay,
        backoffFactor,
        maxDelay,
        jitter
      );

      const attemptInfo: RetryAttempt = {
        attempt,
        error,
        delay,
        timestamp: Date.now(),
      };
      attempts.push(attemptInfo);

      if (enableLogging) {
        console.log(`[Retry] Attempt ${attempt} failed, retrying in ${delay}ms:`, error);
      }

      if (onRetry) {
        onRetry(error, attempt, delay);
      }

      await sleep(delay);
    }
  }

  // This should never be reached due to the logic above
  throw new Error('Retry logic error');
}

/**
 * Retry function with detailed result
 */
export async function retryWithResult<T>(
  fn: () => Promise<T>,
  config: RetryConfig
): Promise<RetryResult<T>> {
  const startTime = Date.now();
  let attempts = 0;
  let lastError: any;

  try {
    const result = await retry(async () => {
      attempts++;
      return await fn();
    }, {
      ...config,
      onRetry: (error, attempt, delay) => {
        lastError = error;
        config.onRetry?.(error, attempt, delay);
      },
    });

    return {
      success: true,
      result,
      attempts,
      totalTime: Date.now() - startTime,
    };
  } catch (error) {
    return {
      success: false,
      error: lastError || error,
      attempts,
      totalTime: Date.now() - startTime,
    };
  }
}

/**
 * Retry class for more advanced usage
 */
export class Retrier {
  private config: Required<RetryConfig>;
  private attempts: RetryAttempt[] = [];

  constructor(config: RetryConfig) {
    this.config = {
      baseDelay: 1000,
      maxDelay: 30000,
      backoffFactor: 2,
      jitter: true,
      retryCondition: RetryConditions.always,
      onRetry: () => {},
      enableLogging: false,
      ...config,
    };
  }

  /**
   * Execute function with retry logic
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    this.attempts = [];
    return await retry(fn, this.config);
  }

  /**
   * Execute with detailed result
   */
  async executeWithResult<T>(fn: () => Promise<T>): Promise<RetryResult<T>> {
    this.attempts = [];
    return await retryWithResult(fn, this.config);
  }

  /**
   * Get retry attempts history
   */
  getAttempts(): RetryAttempt[] {
    return [...this.attempts];
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<RetryConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Reset attempts history
   */
  reset(): void {
    this.attempts = [];
  }
}

/**
 * Retry decorator for methods
 */
export function retryable(config: RetryConfig) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      return await retry(() => originalMethod.apply(this, args), config);
    };

    return descriptor;
  };
}

/**
 * Circuit breaker with retry
 */
export class CircuitBreakerRetrier {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  private retrier: Retrier;

  constructor(
    private failureThreshold: number,
    private recoveryTimeout: number,
    retryConfig: RetryConfig
  ) {
    this.retrier = new Retrier(retryConfig);
  }

  /**
   * Execute function with circuit breaker and retry
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.recoveryTimeout) {
        this.state = 'HALF_OPEN';
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }

    try {
      const result = await this.retrier.execute(fn);
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  /**
   * Get current state
   */
  getState(): string {
    return this.state;
  }

  /**
   * Reset circuit breaker
   */
  reset(): void {
    this.failures = 0;
    this.lastFailureTime = 0;
    this.state = 'CLOSED';
    this.retrier.reset();
  }

  private onSuccess(): void {
    this.failures = 0;
    this.state = 'CLOSED';
  }

  private onFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.failures >= this.failureThreshold) {
      this.state = 'OPEN';
    }
  }
}

// Common retry configurations
export const RetryPresets = {
  // Quick retry for fast operations
  quick: {
    maxAttempts: 3,
    baseDelay: 100,
    maxDelay: 1000,
    backoffFactor: 2,
  },

  // Standard retry for API calls
  standard: {
    maxAttempts: 5,
    baseDelay: 1000,
    maxDelay: 10000,
    backoffFactor: 2,
  },

  // Aggressive retry for critical operations
  aggressive: {
    maxAttempts: 10,
    baseDelay: 500,
    maxDelay: 30000,
    backoffFactor: 1.5,
  },

  // Network-specific retry
  network: {
    maxAttempts: 5,
    baseDelay: 2000,
    maxDelay: 15000,
    backoffFactor: 2,
    retryCondition: RetryConditions.or(
      RetryConditions.networkErrors,
      RetryConditions.serverErrors
    ),
  },
} as const;