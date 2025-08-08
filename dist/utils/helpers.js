"use strict";
/**
 * Common utility helper functions
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.sleep = sleep;
exports.timeout = timeout;
exports.debounce = debounce;
exports.throttle = throttle;
exports.memoize = memoize;
exports.deepClone = deepClone;
exports.deepMerge = deepMerge;
exports.isPlainObject = isPlainObject;
exports.isEmpty = isEmpty;
exports.isEqual = isEqual;
exports.pick = pick;
exports.omit = omit;
exports.flatten = flatten;
exports.chunk = chunk;
exports.unique = unique;
exports.groupBy = groupBy;
exports.sortBy = sortBy;
exports.formatBytes = formatBytes;
exports.formatDuration = formatDuration;
exports.parseJson = parseJson;
exports.safeJsonStringify = safeJsonStringify;
exports.generateId = generateId;
exports.randomString = randomString;
exports.hash = hash;
exports.encrypt = encrypt;
exports.decrypt = decrypt;
exports.encodeBase64 = encodeBase64;
exports.decodeBase64 = decodeBase64;
exports.escapeHtml = escapeHtml;
exports.unescapeHtml = unescapeHtml;
exports.slugify = slugify;
exports.truncate = truncate;
exports.capitalize = capitalize;
exports.camelCase = camelCase;
exports.snakeCase = snakeCase;
exports.kebabCase = kebabCase;
exports.pascalCase = pascalCase;
/**
 * Sleep for a specified number of milliseconds
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
/**
 * Execute a function with a timeout
 */
function timeout(promise, ms) {
    return Promise.race([
        promise,
        new Promise((_, reject) => setTimeout(() => reject(new Error(`Operation timed out after ${ms}ms`)), ms))
    ]);
}
/**
 * Debounce a function
 */
function debounce(func, wait) {
    let timeoutId;
    return (...args) => {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => func(...args), wait);
    };
}
/**
 * Throttle a function
 */
function throttle(func, limit) {
    let inThrottle;
    return (...args) => {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}
/**
 * Memoize a function
 */
function memoize(func, keyGenerator) {
    const cache = new Map();
    return ((...args) => {
        const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);
        if (cache.has(key)) {
            return cache.get(key);
        }
        const result = func(...args);
        cache.set(key, result);
        return result;
    });
}
/**
 * Deep clone an object
 */
function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }
    if (obj instanceof Date) {
        return new Date(obj.getTime());
    }
    if (obj instanceof Array) {
        return obj.map(item => deepClone(item));
    }
    if (typeof obj === 'object') {
        const cloned = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                cloned[key] = deepClone(obj[key]);
            }
        }
        return cloned;
    }
    return obj;
}
/**
 * Deep merge objects
 */
function deepMerge(target, ...sources) {
    if (!sources.length)
        return target;
    const source = sources.shift();
    if (isPlainObject(target) && isPlainObject(source)) {
        for (const key in source) {
            if (isPlainObject(source[key])) {
                if (!target[key])
                    Object.assign(target, { [key]: {} });
                deepMerge(target[key], source[key]);
            }
            else {
                Object.assign(target, { [key]: source[key] });
            }
        }
    }
    return deepMerge(target, ...sources);
}
/**
 * Check if value is a plain object
 */
function isPlainObject(obj) {
    return obj !== null && typeof obj === 'object' && obj.constructor === Object;
}
/**
 * Check if value is empty
 */
function isEmpty(value) {
    if (value == null)
        return true;
    if (typeof value === 'string' || Array.isArray(value))
        return value.length === 0;
    if (typeof value === 'object')
        return Object.keys(value).length === 0;
    return false;
}
/**
 * Deep equality check
 */
function isEqual(a, b) {
    if (a === b)
        return true;
    if (a == null || b == null)
        return false;
    if (typeof a !== typeof b)
        return false;
    if (Array.isArray(a) && Array.isArray(b)) {
        if (a.length !== b.length)
            return false;
        return a.every((item, index) => isEqual(item, b[index]));
    }
    if (isPlainObject(a) && isPlainObject(b)) {
        const keysA = Object.keys(a);
        const keysB = Object.keys(b);
        if (keysA.length !== keysB.length)
            return false;
        return keysA.every(key => isEqual(a[key], b[key]));
    }
    return false;
}
/**
 * Pick properties from object
 */
function pick(obj, keys) {
    const result = {};
    keys.forEach(key => {
        if (key in obj) {
            result[key] = obj[key];
        }
    });
    return result;
}
/**
 * Omit properties from object
 */
function omit(obj, keys) {
    const result = { ...obj };
    keys.forEach(key => {
        delete result[key];
    });
    return result;
}
/**
 * Flatten array
 */
function flatten(arr) {
    return arr.reduce((acc, val) => Array.isArray(val) ? acc.concat(flatten(val)) : acc.concat(val), []);
}
/**
 * Chunk array into smaller arrays
 */
function chunk(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
    }
    return chunks;
}
/**
 * Get unique values from array
 */
function unique(array) {
    return Array.from(new Set(array));
}
/**
 * Group array by key
 */
function groupBy(array, key) {
    return array.reduce((groups, item) => {
        const groupKey = String(item[key]);
        if (!groups[groupKey]) {
            groups[groupKey] = [];
        }
        groups[groupKey].push(item);
        return groups;
    }, {});
}
/**
 * Sort array by key
 */
function sortBy(array, key, direction = 'asc') {
    return [...array].sort((a, b) => {
        const aVal = a[key];
        const bVal = b[key];
        if (aVal < bVal)
            return direction === 'asc' ? -1 : 1;
        if (aVal > bVal)
            return direction === 'asc' ? 1 : -1;
        return 0;
    });
}
/**
 * Format bytes to human readable string
 */
function formatBytes(bytes, decimals = 2) {
    if (bytes === 0)
        return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
/**
 * Format duration in milliseconds to human readable string
 */
function formatDuration(ms) {
    if (ms < 1000)
        return `${ms}ms`;
    if (ms < 60000)
        return `${(ms / 1000).toFixed(1)}s`;
    if (ms < 3600000)
        return `${(ms / 60000).toFixed(1)}m`;
    return `${(ms / 3600000).toFixed(1)}h`;
}
/**
 * Safe JSON parse
 */
function parseJson(str, defaultValue) {
    try {
        return JSON.parse(str);
    }
    catch {
        return defaultValue;
    }
}
/**
 * Safe JSON stringify
 */
function safeJsonStringify(obj, space) {
    try {
        return JSON.stringify(obj, null, space);
    }
    catch {
        return '[Circular or Invalid Object]';
    }
}
/**
 * Generate unique ID
 */
function generateId(prefix = '') {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 9);
    return prefix ? `${prefix}_${timestamp}_${random}` : `${timestamp}_${random}`;
}
/**
 * Generate random string
 */
function randomString(length = 10) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}
/**
 * Simple hash function
 */
function hash(str) {
    let hash = 0;
    if (str.length === 0)
        return hash.toString();
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
}
/**
 * Simple encrypt (for demo purposes - use proper encryption in production)
 */
function encrypt(text, key) {
    // This is a simple XOR cipher for demo purposes
    // In production, use proper encryption libraries
    let result = '';
    for (let i = 0; i < text.length; i++) {
        result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return btoa(result);
}
/**
 * Simple decrypt (for demo purposes - use proper encryption in production)
 */
function decrypt(encryptedText, key) {
    try {
        const text = atob(encryptedText);
        let result = '';
        for (let i = 0; i < text.length; i++) {
            result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
        }
        return result;
    }
    catch {
        throw new Error('Failed to decrypt text');
    }
}
/**
 * Encode to base64
 */
function encodeBase64(str) {
    if (typeof btoa !== 'undefined') {
        return btoa(str);
    }
    // Node.js environment
    return Buffer.from(str, 'utf8').toString('base64');
}
/**
 * Decode from base64
 */
function decodeBase64(str) {
    if (typeof atob !== 'undefined') {
        return atob(str);
    }
    // Node.js environment
    return Buffer.from(str, 'base64').toString('utf8');
}
/**
 * Escape HTML
 */
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}
/**
 * Unescape HTML
 */
function unescapeHtml(text) {
    const map = {
        '&amp;': '&',
        '&lt;': '<',
        '&gt;': '>',
        '&quot;': '"',
        '&#039;': "'"
    };
    return text.replace(/&(amp|lt|gt|quot|#039);/g, (_, entity) => map[`&${entity};`]);
}
/**
 * Convert string to slug
 */
function slugify(text) {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
}
/**
 * Truncate string
 */
function truncate(text, length, suffix = '...') {
    if (text.length <= length)
        return text;
    return text.slice(0, length - suffix.length) + suffix;
}
/**
 * Capitalize first letter
 */
function capitalize(text) {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}
/**
 * Convert to camelCase
 */
function camelCase(text) {
    return text
        .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => index === 0 ? word.toLowerCase() : word.toUpperCase())
        .replace(/\s+/g, '');
}
/**
 * Convert to snake_case
 */
function snakeCase(text) {
    return text
        .replace(/\W+/g, ' ')
        .split(/ |\s+/)
        .map(word => word.toLowerCase())
        .join('_');
}
/**
 * Convert to kebab-case
 */
function kebabCase(text) {
    return text
        .replace(/\W+/g, ' ')
        .split(/ |\s+/)
        .map(word => word.toLowerCase())
        .join('-');
}
/**
 * Convert to PascalCase
 */
function pascalCase(text) {
    return text
        .replace(/(?:^\w|[A-Z]|\b\w)/g, word => word.toUpperCase())
        .replace(/\s+/g, '');
}
//# sourceMappingURL=helpers.js.map