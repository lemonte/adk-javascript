"use strict";
/**
 * ADK JavaScript Utilities
 *
 * A comprehensive collection of utility functions for JavaScript/TypeScript development.
 * This package provides a wide range of utilities for common programming tasks including
 * data manipulation, validation, networking, cryptography, and more.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.chunk = exports.skip = exports.take = exports.reduce = exports.map = exports.filter = exports.transform = exports.toAsyncIterable = exports.toArray = exports.fromFunction = exports.fromAsyncIterable = exports.fromArray = exports.StreamUtils = exports.reject = exports.resolve = exports.isPromise = exports.throttleAsync = exports.debounceAsync = exports.createPool = exports.circuitBreaker = exports.memoizeAsync = exports.nextMacroTask = exports.nextTick = exports.promisify = exports.deferred = exports.any = exports.allSettled = exports.raceWithTimeout = exports.sequential = exports.promiseBatch = exports.concurrent = exports.promiseRetry = exports.timeout = exports.delay = exports.PromiseUtils = exports.isPlainObj = exports.objectDeepMerge = exports.objectDeepClone = exports.fromEntries = exports.entries = exports.values = exports.keys = exports.objectPick = exports.objectOmit = exports.has = exports.set = exports.get = exports.ObjectUtils = exports.LogLevel = exports.DateUtils = void 0;
exports.capitalize = exports.truncate = exports.slugify = exports.unescapeHtml = exports.escapeHtml = exports.decodeBase64 = exports.encodeBase64 = exports.decrypt = exports.encrypt = exports.hash = exports.randomString = exports.generateId = exports.safeJsonStringify = exports.parseJson = exports.formatDuration = exports.formatBytes = exports.sortBy = exports.groupBy = exports.unique = exports.flatten = exports.omit = exports.pick = exports.isEqual = exports.isPlainObject = exports.deepMerge = exports.deepClone = exports.memoize = exports.helpersThrottle = exports.helpersDebounce = exports.sleep = exports.FileUtils = exports.ColorUtils = exports.Base64Utils = exports.ValidationUtils = exports.UuidUtils = exports.UrlUtils = exports.StringUtils = exports.last = exports.first = exports.isEmpty = exports.count = exports.tee = exports.pipeline = exports.createDuplex = exports.streamRetry = exports.split = exports.merge = exports.streamDebounce = exports.streamThrottle = exports.streamBatch = void 0;
exports.Utils = exports.VERSION = exports.JsonUtils = exports.pascalCase = exports.kebabCase = exports.snakeCase = exports.camelCase = void 0;
// Array utilities
__exportStar(require("./array-utils"), exports);
// Cache utilities
__exportStar(require("./cache"), exports);
// Crypto utilities
__exportStar(require("./crypto"), exports);
// Date utilities
var date_utils_1 = require("./date-utils");
Object.defineProperty(exports, "DateUtils", { enumerable: true, get: function () { return date_utils_1.DateUtils; } });
// Event bus
__exportStar(require("./event-bus"), exports);
// HTTP client
__exportStar(require("./http-client"), exports);
// Logger
__exportStar(require("./logger"), exports);
var logger_1 = require("./logger");
Object.defineProperty(exports, "LogLevel", { enumerable: true, get: function () { return logger_1.LogLevel; } });
// Object utilities
var object_utils_1 = require("./object-utils");
Object.defineProperty(exports, "ObjectUtils", { enumerable: true, get: function () { return object_utils_1.ObjectUtils; } });
Object.defineProperty(exports, "get", { enumerable: true, get: function () { return object_utils_1.get; } });
Object.defineProperty(exports, "set", { enumerable: true, get: function () { return object_utils_1.set; } });
Object.defineProperty(exports, "has", { enumerable: true, get: function () { return object_utils_1.has; } });
Object.defineProperty(exports, "objectOmit", { enumerable: true, get: function () { return object_utils_1.omit; } });
Object.defineProperty(exports, "objectPick", { enumerable: true, get: function () { return object_utils_1.pick; } });
Object.defineProperty(exports, "keys", { enumerable: true, get: function () { return object_utils_1.keys; } });
Object.defineProperty(exports, "values", { enumerable: true, get: function () { return object_utils_1.values; } });
Object.defineProperty(exports, "entries", { enumerable: true, get: function () { return object_utils_1.entries; } });
Object.defineProperty(exports, "fromEntries", { enumerable: true, get: function () { return object_utils_1.fromEntries; } });
Object.defineProperty(exports, "objectDeepClone", { enumerable: true, get: function () { return object_utils_1.deepClone; } });
Object.defineProperty(exports, "objectDeepMerge", { enumerable: true, get: function () { return object_utils_1.deepMerge; } });
Object.defineProperty(exports, "isPlainObj", { enumerable: true, get: function () { return object_utils_1.isPlainObject; } });
// Promise utilities
var promise_utils_1 = require("./promise-utils");
Object.defineProperty(exports, "PromiseUtils", { enumerable: true, get: function () { return promise_utils_1.PromiseUtils; } });
Object.defineProperty(exports, "delay", { enumerable: true, get: function () { return promise_utils_1.delay; } });
Object.defineProperty(exports, "timeout", { enumerable: true, get: function () { return promise_utils_1.timeout; } });
Object.defineProperty(exports, "promiseRetry", { enumerable: true, get: function () { return promise_utils_1.retry; } });
Object.defineProperty(exports, "concurrent", { enumerable: true, get: function () { return promise_utils_1.concurrent; } });
Object.defineProperty(exports, "promiseBatch", { enumerable: true, get: function () { return promise_utils_1.batch; } });
Object.defineProperty(exports, "sequential", { enumerable: true, get: function () { return promise_utils_1.sequential; } });
Object.defineProperty(exports, "raceWithTimeout", { enumerable: true, get: function () { return promise_utils_1.raceWithTimeout; } });
Object.defineProperty(exports, "allSettled", { enumerable: true, get: function () { return promise_utils_1.allSettled; } });
Object.defineProperty(exports, "any", { enumerable: true, get: function () { return promise_utils_1.any; } });
Object.defineProperty(exports, "deferred", { enumerable: true, get: function () { return promise_utils_1.deferred; } });
Object.defineProperty(exports, "promisify", { enumerable: true, get: function () { return promise_utils_1.promisify; } });
Object.defineProperty(exports, "nextTick", { enumerable: true, get: function () { return promise_utils_1.nextTick; } });
Object.defineProperty(exports, "nextMacroTask", { enumerable: true, get: function () { return promise_utils_1.nextMacroTask; } });
Object.defineProperty(exports, "memoizeAsync", { enumerable: true, get: function () { return promise_utils_1.memoizeAsync; } });
Object.defineProperty(exports, "circuitBreaker", { enumerable: true, get: function () { return promise_utils_1.circuitBreaker; } });
Object.defineProperty(exports, "createPool", { enumerable: true, get: function () { return promise_utils_1.createPool; } });
Object.defineProperty(exports, "debounceAsync", { enumerable: true, get: function () { return promise_utils_1.debounceAsync; } });
Object.defineProperty(exports, "throttleAsync", { enumerable: true, get: function () { return promise_utils_1.throttleAsync; } });
Object.defineProperty(exports, "isPromise", { enumerable: true, get: function () { return promise_utils_1.isPromise; } });
Object.defineProperty(exports, "resolve", { enumerable: true, get: function () { return promise_utils_1.resolve; } });
Object.defineProperty(exports, "reject", { enumerable: true, get: function () { return promise_utils_1.reject; } });
// Rate limiter
__exportStar(require("./rate-limiter"), exports);
// Retry utilities
__exportStar(require("./retry"), exports);
// Stream utilities
var stream_utils_1 = require("./stream-utils");
Object.defineProperty(exports, "StreamUtils", { enumerable: true, get: function () { return stream_utils_1.StreamUtils; } });
Object.defineProperty(exports, "fromArray", { enumerable: true, get: function () { return stream_utils_1.fromArray; } });
Object.defineProperty(exports, "fromAsyncIterable", { enumerable: true, get: function () { return stream_utils_1.fromAsyncIterable; } });
Object.defineProperty(exports, "fromFunction", { enumerable: true, get: function () { return stream_utils_1.fromFunction; } });
Object.defineProperty(exports, "toArray", { enumerable: true, get: function () { return stream_utils_1.toArray; } });
Object.defineProperty(exports, "toAsyncIterable", { enumerable: true, get: function () { return stream_utils_1.toAsyncIterable; } });
Object.defineProperty(exports, "transform", { enumerable: true, get: function () { return stream_utils_1.transform; } });
Object.defineProperty(exports, "filter", { enumerable: true, get: function () { return stream_utils_1.filter; } });
Object.defineProperty(exports, "map", { enumerable: true, get: function () { return stream_utils_1.map; } });
Object.defineProperty(exports, "reduce", { enumerable: true, get: function () { return stream_utils_1.reduce; } });
Object.defineProperty(exports, "take", { enumerable: true, get: function () { return stream_utils_1.take; } });
Object.defineProperty(exports, "skip", { enumerable: true, get: function () { return stream_utils_1.skip; } });
Object.defineProperty(exports, "chunk", { enumerable: true, get: function () { return stream_utils_1.chunk; } });
Object.defineProperty(exports, "streamBatch", { enumerable: true, get: function () { return stream_utils_1.batch; } });
Object.defineProperty(exports, "streamThrottle", { enumerable: true, get: function () { return stream_utils_1.throttle; } });
Object.defineProperty(exports, "streamDebounce", { enumerable: true, get: function () { return stream_utils_1.debounce; } });
Object.defineProperty(exports, "merge", { enumerable: true, get: function () { return stream_utils_1.merge; } });
Object.defineProperty(exports, "split", { enumerable: true, get: function () { return stream_utils_1.split; } });
Object.defineProperty(exports, "streamRetry", { enumerable: true, get: function () { return stream_utils_1.retry; } });
Object.defineProperty(exports, "createDuplex", { enumerable: true, get: function () { return stream_utils_1.createDuplex; } });
Object.defineProperty(exports, "pipeline", { enumerable: true, get: function () { return stream_utils_1.pipeline; } });
Object.defineProperty(exports, "tee", { enumerable: true, get: function () { return stream_utils_1.tee; } });
Object.defineProperty(exports, "count", { enumerable: true, get: function () { return stream_utils_1.count; } });
Object.defineProperty(exports, "isEmpty", { enumerable: true, get: function () { return stream_utils_1.isEmpty; } });
Object.defineProperty(exports, "first", { enumerable: true, get: function () { return stream_utils_1.first; } });
Object.defineProperty(exports, "last", { enumerable: true, get: function () { return stream_utils_1.last; } });
// String utilities
var string_utils_1 = require("./string-utils");
Object.defineProperty(exports, "StringUtils", { enumerable: true, get: function () { return string_utils_1.StringUtils; } });
// URL utilities
var url_utils_1 = require("./url-utils");
Object.defineProperty(exports, "UrlUtils", { enumerable: true, get: function () { return url_utils_1.UrlUtils; } });
// UUID utilities
var uuid_utils_1 = require("./uuid-utils");
Object.defineProperty(exports, "UuidUtils", { enumerable: true, get: function () { return uuid_utils_1.UuidUtils; } });
// Validation utilities
__exportStar(require("./validation"), exports);
var validation_utils_1 = require("./validation-utils");
Object.defineProperty(exports, "ValidationUtils", { enumerable: true, get: function () { return validation_utils_1.ValidationUtils; } });
// Base64 utilities
var base64_utils_1 = require("./base64-utils");
Object.defineProperty(exports, "Base64Utils", { enumerable: true, get: function () { return base64_utils_1.Base64Utils; } });
// Color utilities
var color_utils_1 = require("./color-utils");
Object.defineProperty(exports, "ColorUtils", { enumerable: true, get: function () { return color_utils_1.ColorUtils; } });
// File utilities
var file_utils_1 = require("./file-utils");
Object.defineProperty(exports, "FileUtils", { enumerable: true, get: function () { return file_utils_1.FileUtils; } });
// Helpers
var helpers_1 = require("./helpers");
Object.defineProperty(exports, "sleep", { enumerable: true, get: function () { return helpers_1.sleep; } });
Object.defineProperty(exports, "helpersDebounce", { enumerable: true, get: function () { return helpers_1.debounce; } });
Object.defineProperty(exports, "helpersThrottle", { enumerable: true, get: function () { return helpers_1.throttle; } });
Object.defineProperty(exports, "memoize", { enumerable: true, get: function () { return helpers_1.memoize; } });
Object.defineProperty(exports, "deepClone", { enumerable: true, get: function () { return helpers_1.deepClone; } });
Object.defineProperty(exports, "deepMerge", { enumerable: true, get: function () { return helpers_1.deepMerge; } });
Object.defineProperty(exports, "isPlainObject", { enumerable: true, get: function () { return helpers_1.isPlainObject; } });
Object.defineProperty(exports, "isEqual", { enumerable: true, get: function () { return helpers_1.isEqual; } });
Object.defineProperty(exports, "pick", { enumerable: true, get: function () { return helpers_1.pick; } });
Object.defineProperty(exports, "omit", { enumerable: true, get: function () { return helpers_1.omit; } });
Object.defineProperty(exports, "flatten", { enumerable: true, get: function () { return helpers_1.flatten; } });
Object.defineProperty(exports, "unique", { enumerable: true, get: function () { return helpers_1.unique; } });
Object.defineProperty(exports, "groupBy", { enumerable: true, get: function () { return helpers_1.groupBy; } });
Object.defineProperty(exports, "sortBy", { enumerable: true, get: function () { return helpers_1.sortBy; } });
Object.defineProperty(exports, "formatBytes", { enumerable: true, get: function () { return helpers_1.formatBytes; } });
Object.defineProperty(exports, "formatDuration", { enumerable: true, get: function () { return helpers_1.formatDuration; } });
Object.defineProperty(exports, "parseJson", { enumerable: true, get: function () { return helpers_1.parseJson; } });
Object.defineProperty(exports, "safeJsonStringify", { enumerable: true, get: function () { return helpers_1.safeJsonStringify; } });
Object.defineProperty(exports, "generateId", { enumerable: true, get: function () { return helpers_1.generateId; } });
Object.defineProperty(exports, "randomString", { enumerable: true, get: function () { return helpers_1.randomString; } });
Object.defineProperty(exports, "hash", { enumerable: true, get: function () { return helpers_1.hash; } });
Object.defineProperty(exports, "encrypt", { enumerable: true, get: function () { return helpers_1.encrypt; } });
Object.defineProperty(exports, "decrypt", { enumerable: true, get: function () { return helpers_1.decrypt; } });
Object.defineProperty(exports, "encodeBase64", { enumerable: true, get: function () { return helpers_1.encodeBase64; } });
Object.defineProperty(exports, "decodeBase64", { enumerable: true, get: function () { return helpers_1.decodeBase64; } });
Object.defineProperty(exports, "escapeHtml", { enumerable: true, get: function () { return helpers_1.escapeHtml; } });
Object.defineProperty(exports, "unescapeHtml", { enumerable: true, get: function () { return helpers_1.unescapeHtml; } });
Object.defineProperty(exports, "slugify", { enumerable: true, get: function () { return helpers_1.slugify; } });
Object.defineProperty(exports, "truncate", { enumerable: true, get: function () { return helpers_1.truncate; } });
Object.defineProperty(exports, "capitalize", { enumerable: true, get: function () { return helpers_1.capitalize; } });
Object.defineProperty(exports, "camelCase", { enumerable: true, get: function () { return helpers_1.camelCase; } });
Object.defineProperty(exports, "snakeCase", { enumerable: true, get: function () { return helpers_1.snakeCase; } });
Object.defineProperty(exports, "kebabCase", { enumerable: true, get: function () { return helpers_1.kebabCase; } });
Object.defineProperty(exports, "pascalCase", { enumerable: true, get: function () { return helpers_1.pascalCase; } });
// JSON utilities
var json_utils_1 = require("./json-utils");
Object.defineProperty(exports, "JsonUtils", { enumerable: true, get: function () { return json_utils_1.JsonUtils; } });
// Version
exports.VERSION = '1.0.0';
// Import all utilities for the default export
const array_utils_1 = require("./array-utils");
const base64_utils_2 = require("./base64-utils");
const cache_1 = require("./cache");
const color_utils_2 = require("./color-utils");
const crypto_1 = require("./crypto");
const date_utils_2 = require("./date-utils");
const event_bus_1 = require("./event-bus");
const file_utils_2 = require("./file-utils");
const http_client_1 = require("./http-client");
const json_utils_2 = require("./json-utils");
const logger_2 = require("./logger");
const object_utils_2 = require("./object-utils");
const promise_utils_2 = require("./promise-utils");
const rate_limiter_1 = require("./rate-limiter");
const retry_1 = require("./retry");
const stream_utils_2 = require("./stream-utils");
const string_utils_2 = require("./string-utils");
const url_utils_2 = require("./url-utils");
const uuid_utils_2 = require("./uuid-utils");
const validation_utils_2 = require("./validation-utils");
exports.Utils = {
    Array: array_utils_1.ArrayUtils,
    Base64: base64_utils_2.Base64Utils,
    Cache: cache_1.Cache,
    Color: color_utils_2.ColorUtils,
    Crypto: crypto_1.CryptoUtils,
    Date: date_utils_2.DateUtils,
    EventBus: event_bus_1.EventBus,
    File: file_utils_2.FileUtils,
    Http: http_client_1.HttpClient,
    Json: json_utils_2.JsonUtils,
    Logger: logger_2.Logger,
    Object: object_utils_2.ObjectUtils,
    Promise: promise_utils_2.PromiseUtils,
    RateLimit: rate_limiter_1.RateLimiterFactory,
    Retry: retry_1.Retrier,
    Stream: stream_utils_2.StreamUtils,
    String: string_utils_2.StringUtils,
    Url: url_utils_2.UrlUtils,
    Uuid: uuid_utils_2.UuidUtils,
    Validation: validation_utils_2.ValidationUtils,
};
//# sourceMappingURL=index.js.map