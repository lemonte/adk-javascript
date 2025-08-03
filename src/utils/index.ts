/**
 * ADK JavaScript Utilities
 * 
 * A comprehensive collection of utility functions for JavaScript/TypeScript development.
 * This package provides a wide range of utilities for common programming tasks including
 * data manipulation, validation, networking, cryptography, and more.
 */

// Array utilities
export * from './array-utils';

// Cache utilities
export * from './cache';

// Crypto utilities
export * from './crypto';

// Date utilities
export { DateUtils } from './date-utils';

// Event bus
export * from './event-bus';

// HTTP client
export * from './http-client';

// Logger
export * from './logger';
export { LogLevel } from './logger';

// Object utilities
export { ObjectUtils, get, set, has, omit as objectOmit, pick as objectPick, keys, values, entries, fromEntries, deepClone as objectDeepClone, deepMerge as objectDeepMerge, isPlainObject as isPlainObj } from './object-utils';

// Promise utilities
export { PromiseUtils, delay, timeout, retry as promiseRetry, concurrent, batch as promiseBatch, sequential, raceWithTimeout, allSettled, any, deferred, promisify, nextTick, nextMacroTask, memoizeAsync, circuitBreaker, createPool, debounceAsync, throttleAsync, isPromise, resolve, reject } from './promise-utils';

// Rate limiter
export * from './rate-limiter';

// Retry utilities
export * from './retry';

// Stream utilities
export { StreamUtils, fromArray, fromAsyncIterable, fromFunction, toArray, toAsyncIterable, transform, filter, map, reduce, take, skip, chunk, batch as streamBatch, throttle as streamThrottle, debounce as streamDebounce, merge, split, retry as streamRetry, createDuplex, pipeline, tee, count, isEmpty, first, last } from './stream-utils';

// String utilities
export { StringUtils } from './string-utils';

// URL utilities
export { UrlUtils } from './url-utils';

// UUID utilities
export { UuidUtils } from './uuid-utils';

// Validation utilities
export * from './validation';
export { ValidationUtils } from './validation-utils';

// Base64 utilities
export { Base64Utils } from './base64-utils';

// Color utilities
export { ColorUtils } from './color-utils';

// File utilities
export { FileUtils } from './file-utils';

// Helpers
export { 
  sleep, 
  debounce as helpersDebounce, 
  throttle as helpersThrottle, 
  memoize, 
  deepClone, 
  deepMerge, 
  isPlainObject, 
  isEqual, 
  pick, 
  omit, 
  flatten, 
  unique, 
  groupBy, 
  sortBy, 
  formatBytes, 
  formatDuration, 
  parseJson, 
  safeJsonStringify, 
  generateId, 
  randomString, 
  hash, 
  encrypt, 
  decrypt, 
  encodeBase64, 
  decodeBase64, 
  escapeHtml, 
  unescapeHtml, 
  slugify, 
  truncate, 
  capitalize, 
  camelCase, 
  snakeCase, 
  kebabCase, 
  pascalCase 
} from './helpers';

// JSON utilities
export { JsonUtils } from './json-utils';

// Version
export const VERSION = '1.0.0';

// Import all utilities for the default export
import { ArrayUtils } from './array-utils';
import { Base64Utils } from './base64-utils';
import { Cache } from './cache';
import { ColorUtils } from './color-utils';
import { CryptoUtils } from './crypto';
import { DateUtils } from './date-utils';
import { EventBus } from './event-bus';
import { FileUtils } from './file-utils';
import { HttpClient } from './http-client';
import { JsonUtils } from './json-utils';
import { Logger } from './logger';
import { ObjectUtils } from './object-utils';
import { PromiseUtils } from './promise-utils';
import { RateLimiterFactory } from './rate-limiter';
import { Retrier } from './retry';
import { StreamUtils } from './stream-utils';
import { StringUtils } from './string-utils';
import { UrlUtils } from './url-utils';
import { UuidUtils } from './uuid-utils';
import { ValidationUtils } from './validation-utils';

export const Utils = {
  Array: ArrayUtils,
  Base64: Base64Utils,
  Cache: Cache,
  Color: ColorUtils,
  Crypto: CryptoUtils,
  Date: DateUtils,
  EventBus: EventBus,
  File: FileUtils,
  Http: HttpClient,
  Json: JsonUtils,
  Logger: Logger,
  Object: ObjectUtils,
  Promise: PromiseUtils,
  RateLimit: RateLimiterFactory,
  Retry: Retrier,
  Stream: StreamUtils,
  String: StringUtils,
  Url: UrlUtils,
  Uuid: UuidUtils,
  Validation: ValidationUtils,
};