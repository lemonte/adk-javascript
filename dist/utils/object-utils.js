"use strict";
/**
 * Object utilities for object manipulation and processing
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.assign = exports.defaults = exports.compact = exports.isNotEmpty = exports.size = exports.isEqualDeep = exports.isEqual = exports.groupBy = exports.invert = exports.fromEntries = exports.entries = exports.values = exports.keys = exports.reduce = exports.every = exports.some = exports.find = exports.filter = exports.mapKeys = exports.mapValues = exports.transform = exports.unflatten = exports.flatten = exports.paths = exports.unset = exports.has = exports.set = exports.get = exports.omit = exports.pick = exports.deepMergeWithOptions = exports.deepMerge = exports.deepClone = exports.isEmpty = exports.isPlainObject = exports.ObjectUtils = void 0;
/**
 * Object utilities class
 */
class ObjectUtils {
    /**
     * Check if value is a plain object
     */
    static isPlainObject(value) {
        if (typeof value !== 'object' || value === null) {
            return false;
        }
        if (Object.prototype.toString.call(value) !== '[object Object]') {
            return false;
        }
        if (Object.getPrototypeOf(value) === null) {
            return true;
        }
        let proto = value;
        while (Object.getPrototypeOf(proto) !== null) {
            proto = Object.getPrototypeOf(proto);
        }
        return Object.getPrototypeOf(value) === proto;
    }
    /**
     * Check if object is empty
     */
    static isEmpty(obj) {
        if (obj == null) {
            return true;
        }
        if (Array.isArray(obj) || typeof obj === 'string') {
            return obj.length === 0;
        }
        if (obj instanceof Map || obj instanceof Set) {
            return obj.size === 0;
        }
        if (this.isPlainObject(obj)) {
            return Object.keys(obj).length === 0;
        }
        return false;
    }
    /**
     * Deep clone an object
     */
    static deepClone(obj) {
        if (obj === null || typeof obj !== 'object') {
            return obj;
        }
        if (obj instanceof Date) {
            return new Date(obj.getTime());
        }
        if (obj instanceof RegExp) {
            return new RegExp(obj);
        }
        if (obj instanceof Map) {
            const cloned = new Map();
            for (const [key, value] of obj) {
                cloned.set(key, this.deepClone(value));
            }
            return cloned;
        }
        if (obj instanceof Set) {
            const cloned = new Set();
            for (const value of obj) {
                cloned.add(this.deepClone(value));
            }
            return cloned;
        }
        if (Array.isArray(obj)) {
            return obj.map(item => this.deepClone(item));
        }
        if (this.isPlainObject(obj)) {
            const cloned = {};
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    cloned[key] = this.deepClone(obj[key]);
                }
            }
            return cloned;
        }
        return obj;
    }
    /**
     * Deep merge objects
     */
    static deepMerge(target, ...sources) {
        return this.deepMergeWithOptions(target, { arrayMerge: 'replace' }, ...sources);
    }
    /**
     * Deep merge objects with options
     */
    static deepMergeWithOptions(target, options, ...sources) {
        if (!sources.length) {
            return target;
        }
        const { arrayMerge = 'replace', customMerge } = options;
        const result = this.deepClone(target);
        for (const source of sources) {
            this.mergeObject(result, source, arrayMerge, customMerge);
        }
        return result;
    }
    static mergeObject(target, source, arrayMerge, customMerge) {
        for (const key in source) {
            if (source.hasOwnProperty(key)) {
                if (customMerge) {
                    const customResult = customMerge(key, target[key], source[key]);
                    if (customResult !== undefined) {
                        target[key] = customResult;
                        continue;
                    }
                }
                if (Array.isArray(source[key])) {
                    if (arrayMerge === 'concat' && Array.isArray(target[key])) {
                        target[key] = target[key].concat(source[key]);
                    }
                    else if (arrayMerge === 'merge' && Array.isArray(target[key])) {
                        target[key] = this.deepClone(source[key]);
                    }
                    else {
                        target[key] = this.deepClone(source[key]);
                    }
                }
                else if (this.isPlainObject(source[key])) {
                    if (!this.isPlainObject(target[key])) {
                        target[key] = {};
                    }
                    this.mergeObject(target[key], source[key], arrayMerge, customMerge);
                }
                else {
                    target[key] = source[key];
                }
            }
        }
    }
    /**
     * Pick specified keys from object
     */
    static pick(obj, keys) {
        const result = {};
        for (const key of keys) {
            if (key in obj) {
                result[key] = obj[key];
            }
        }
        return result;
    }
    /**
     * Omit specified keys from object
     */
    static omit(obj, keys) {
        const result = { ...obj };
        for (const key of keys) {
            delete result[key];
        }
        return result;
    }
    /**
     * Get value at path
     */
    static get(obj, path, defaultValue) {
        const keys = this.parsePath(path);
        let current = obj;
        for (const key of keys) {
            if (current == null || typeof current !== 'object') {
                return defaultValue;
            }
            current = current[key];
        }
        return current !== undefined ? current : defaultValue;
    }
    /**
     * Set value at path
     */
    static set(obj, path, value) {
        const keys = this.parsePath(path);
        const result = this.deepClone(obj) || {};
        let current = result;
        for (let i = 0; i < keys.length - 1; i++) {
            const key = keys[i];
            const nextKey = keys[i + 1];
            if (current[key] == null || typeof current[key] !== 'object') {
                current[key] = typeof nextKey === 'number' ? [] : {};
            }
            current = current[key];
        }
        current[keys[keys.length - 1]] = value;
        return result;
    }
    /**
     * Check if path exists in object
     */
    static has(obj, path) {
        const keys = this.parsePath(path);
        let current = obj;
        for (const key of keys) {
            if (current == null || typeof current !== 'object' || !(key in current)) {
                return false;
            }
            current = current[key];
        }
        return true;
    }
    /**
     * Delete value at path
     */
    static unset(obj, path) {
        const keys = this.parsePath(path);
        const result = this.deepClone(obj);
        if (keys.length === 0) {
            return result;
        }
        let current = result;
        for (let i = 0; i < keys.length - 1; i++) {
            const key = keys[i];
            if (current == null || typeof current !== 'object' || !(key in current)) {
                return result;
            }
            current = current[key];
        }
        if (current != null && typeof current === 'object') {
            const lastKey = keys[keys.length - 1];
            if (Array.isArray(current)) {
                current.splice(Number(lastKey), 1);
            }
            else {
                delete current[lastKey];
            }
        }
        return result;
    }
    /**
     * Parse object path
     */
    static parsePath(path) {
        if (Array.isArray(path)) {
            return path;
        }
        if (typeof path === 'string') {
            return path
                .replace(/\[([^\]]+)\]/g, '.$1')
                .split('.')
                .filter(key => key !== '')
                .map(key => {
                const num = Number(key);
                return !isNaN(num) && Number.isInteger(num) ? num : key;
            });
        }
        return [];
    }
    /**
     * Get all paths in object
     */
    static paths(obj, options = {}) {
        const { includeArrays = false, maxDepth = Infinity } = options;
        const paths = [];
        const traverse = (current, path, depth) => {
            if (depth >= maxDepth) {
                return;
            }
            if (this.isPlainObject(current)) {
                for (const key in current) {
                    if (current.hasOwnProperty(key)) {
                        const newPath = [...path, key];
                        paths.push(newPath.join('.'));
                        traverse(current[key], newPath, depth + 1);
                    }
                }
            }
            else if (includeArrays && Array.isArray(current)) {
                current.forEach((item, index) => {
                    const newPath = [...path, String(index)];
                    paths.push(newPath.join('.'));
                    traverse(item, newPath, depth + 1);
                });
            }
        };
        traverse(obj, [], 0);
        return paths;
    }
    /**
     * Flatten object to dot notation
     */
    static flatten(obj, options = {}) {
        const { delimiter = '.', maxDepth = Infinity, includeArrays = false, } = options;
        const result = {};
        const traverse = (current, path, depth) => {
            if (depth >= maxDepth) {
                result[path.join(delimiter)] = current;
                return;
            }
            if (this.isPlainObject(current)) {
                for (const key in current) {
                    if (current.hasOwnProperty(key)) {
                        traverse(current[key], [...path, key], depth + 1);
                    }
                }
            }
            else if (includeArrays && Array.isArray(current)) {
                current.forEach((item, index) => {
                    traverse(item, [...path, String(index)], depth + 1);
                });
            }
            else {
                result[path.join(delimiter)] = current;
            }
        };
        traverse(obj, [], 0);
        return result;
    }
    /**
     * Unflatten dot notation object
     */
    static unflatten(obj, delimiter = '.') {
        const result = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                this.set(result, key.split(delimiter), obj[key]);
            }
        }
        return result;
    }
    /**
     * Transform object values
     */
    static transform(obj, options) {
        const { deep = true, includeArrays = false, transform } = options;
        const traverse = (current, path = []) => {
            if (this.isPlainObject(current)) {
                const result = {};
                for (const key in current) {
                    if (current.hasOwnProperty(key)) {
                        const newPath = [...path, key];
                        const value = deep ? traverse(current[key], newPath) : current[key];
                        result[key] = transform(value, key, newPath);
                    }
                }
                return result;
            }
            else if (includeArrays && Array.isArray(current)) {
                return current.map((item, index) => {
                    const newPath = [...path, String(index)];
                    const value = deep ? traverse(item, newPath) : item;
                    return transform(value, String(index), newPath);
                });
            }
            return current;
        };
        return traverse(obj);
    }
    /**
     * Map object values
     */
    static mapValues(obj, mapper) {
        const result = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                result[key] = mapper(obj[key], key);
            }
        }
        return result;
    }
    /**
     * Map object keys
     */
    static mapKeys(obj, mapper) {
        const result = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                const newKey = mapper(key, obj[key]);
                result[newKey] = obj[key];
            }
        }
        return result;
    }
    /**
     * Filter object by predicate
     */
    static filter(obj, predicate) {
        const result = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key) && predicate(obj[key], key)) {
                result[key] = obj[key];
            }
        }
        return result;
    }
    /**
     * Find key-value pair by predicate
     */
    static find(obj, predicate) {
        for (const key in obj) {
            if (obj.hasOwnProperty(key) && predicate(obj[key], key)) {
                return [key, obj[key]];
            }
        }
        return undefined;
    }
    /**
     * Check if any value matches predicate
     */
    static some(obj, predicate) {
        for (const key in obj) {
            if (obj.hasOwnProperty(key) && predicate(obj[key], key)) {
                return true;
            }
        }
        return false;
    }
    /**
     * Check if all values match predicate
     */
    static every(obj, predicate) {
        for (const key in obj) {
            if (obj.hasOwnProperty(key) && !predicate(obj[key], key)) {
                return false;
            }
        }
        return true;
    }
    /**
     * Reduce object to single value
     */
    static reduce(obj, reducer, initialValue) {
        let result = initialValue;
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                result = reducer(result, obj[key], key);
            }
        }
        return result;
    }
    /**
     * Get object keys
     */
    static keys(obj) {
        return Object.keys(obj);
    }
    /**
     * Get object values
     */
    static values(obj) {
        return Object.values(obj);
    }
    /**
     * Get object entries
     */
    static entries(obj) {
        return Object.entries(obj);
    }
    /**
     * Create object from entries
     */
    static fromEntries(entries) {
        return Object.fromEntries(entries);
    }
    /**
     * Invert object (swap keys and values)
     */
    static invert(obj) {
        const result = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                result[String(obj[key])] = key;
            }
        }
        return result;
    }
    /**
     * Group object entries by key function
     */
    static groupBy(obj, keyFn) {
        const result = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                const groupKey = keyFn(obj[key], key);
                if (!result[groupKey]) {
                    result[groupKey] = [];
                }
                result[groupKey].push([key, obj[key]]);
            }
        }
        return result;
    }
    /**
     * Check if objects are equal (shallow)
     */
    static isEqual(obj1, obj2) {
        const keys1 = this.keys(obj1);
        const keys2 = this.keys(obj2);
        if (keys1.length !== keys2.length) {
            return false;
        }
        for (const key of keys1) {
            if (obj1[key] !== obj2[key]) {
                return false;
            }
        }
        return true;
    }
    /**
     * Check if objects are equal (deep)
     */
    static isEqualDeep(obj1, obj2) {
        if (obj1 === obj2) {
            return true;
        }
        if (obj1 == null || obj2 == null) {
            return obj1 === obj2;
        }
        if (typeof obj1 !== typeof obj2) {
            return false;
        }
        if (Array.isArray(obj1) && Array.isArray(obj2)) {
            if (obj1.length !== obj2.length) {
                return false;
            }
            return obj1.every((item, index) => this.isEqualDeep(item, obj2[index]));
        }
        if (this.isPlainObject(obj1) && this.isPlainObject(obj2)) {
            const keys1 = this.keys(obj1);
            const keys2 = this.keys(obj2);
            if (keys1.length !== keys2.length) {
                return false;
            }
            return keys1.every(key => keys2.includes(key) && this.isEqualDeep(obj1[key], obj2[key]));
        }
        return false;
    }
    /**
     * Get size of object (number of keys)
     */
    static size(obj) {
        return this.keys(obj).length;
    }
    /**
     * Check if object has any keys
     */
    static isNotEmpty(obj) {
        return !this.isEmpty(obj);
    }
    /**
     * Compact object (remove undefined and null values)
     */
    static compact(obj) {
        return this.filter(obj, value => value != null);
    }
    /**
     * Default values for object
     */
    static defaults(obj, ...defaultObjects) {
        const result = { ...obj };
        for (const defaultObj of defaultObjects) {
            for (const key in defaultObj) {
                if (defaultObj.hasOwnProperty(key) && result[key] === undefined) {
                    result[key] = defaultObj[key];
                }
            }
        }
        return result;
    }
    /**
     * Assign properties from source objects (shallow)
     */
    static assign(target, ...sources) {
        return Object.assign({}, target, ...sources);
    }
}
exports.ObjectUtils = ObjectUtils;
// Export commonly used functions
exports.isPlainObject = ObjectUtils.isPlainObject, exports.isEmpty = ObjectUtils.isEmpty, exports.deepClone = ObjectUtils.deepClone, exports.deepMerge = ObjectUtils.deepMerge, exports.deepMergeWithOptions = ObjectUtils.deepMergeWithOptions, exports.pick = ObjectUtils.pick, exports.omit = ObjectUtils.omit, exports.get = ObjectUtils.get, exports.set = ObjectUtils.set, exports.has = ObjectUtils.has, exports.unset = ObjectUtils.unset, exports.paths = ObjectUtils.paths, exports.flatten = ObjectUtils.flatten, exports.unflatten = ObjectUtils.unflatten, exports.transform = ObjectUtils.transform, exports.mapValues = ObjectUtils.mapValues, exports.mapKeys = ObjectUtils.mapKeys, exports.filter = ObjectUtils.filter, exports.find = ObjectUtils.find, exports.some = ObjectUtils.some, exports.every = ObjectUtils.every, exports.reduce = ObjectUtils.reduce, exports.keys = ObjectUtils.keys, exports.values = ObjectUtils.values, exports.entries = ObjectUtils.entries, exports.fromEntries = ObjectUtils.fromEntries, exports.invert = ObjectUtils.invert, exports.groupBy = ObjectUtils.groupBy, exports.isEqual = ObjectUtils.isEqual, exports.isEqualDeep = ObjectUtils.isEqualDeep, exports.size = ObjectUtils.size, exports.isNotEmpty = ObjectUtils.isNotEmpty, exports.compact = ObjectUtils.compact, exports.defaults = ObjectUtils.defaults, exports.assign = ObjectUtils.assign;
//# sourceMappingURL=object-utils.js.map