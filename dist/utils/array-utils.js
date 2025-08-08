"use strict";
/**
 * Array utilities for array manipulation and processing
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.isEmpty = exports.median = exports.averageBy = exports.average = exports.sumBy = exports.sum = exports.max = exports.min = exports.reverse = exports.rotate = exports.move = exports.replaceAt = exports.removeBy = exports.remove = exports.removeAt = exports.insert = exports.findAllIndices = exports.findLastIndex = exports.findIndex = exports.dropWhile = exports.takeWhile = exports.dropLast = exports.drop = exports.takeLast = exports.take = exports.transpose = exports.unzip = exports.zip = exports.isEqualDeep = exports.isEqual = exports.symmetricDifference = exports.difference = exports.union = exports.intersection = exports.randomElement = exports.sample = exports.shuffle = exports.sort = exports.countBy = exports.groupBy = exports.partition = exports.chunk = exports.flattenDeep = exports.flatten = exports.uniqueBy = exports.unique = exports.range = exports.create = exports.isArray = exports.ArrayUtils = void 0;
exports.only = exports.without = exports.compact = exports.isNotEmpty = void 0;
/**
 * Array utilities class
 */
class ArrayUtils {
    /**
     * Check if value is an array
     */
    static isArray(value) {
        return Array.isArray(value);
    }
    /**
     * Create array of specified length with fill value
     */
    static create(length, fillValue) {
        return Array(length).fill(fillValue);
    }
    /**
     * Create array with range of numbers
     */
    static range(start, end, step = 1) {
        if (end === undefined) {
            end = start;
            start = 0;
        }
        const result = [];
        if (step > 0) {
            for (let i = start; i < end; i += step) {
                result.push(i);
            }
        }
        else if (step < 0) {
            for (let i = start; i > end; i += step) {
                result.push(i);
            }
        }
        return result;
    }
    /**
     * Get unique values from array
     */
    static unique(array) {
        return [...new Set(array)];
    }
    /**
     * Get unique values by key function
     */
    static uniqueBy(array, keyFn) {
        const seen = new Set();
        return array.filter(item => {
            const key = keyFn(item);
            if (seen.has(key)) {
                return false;
            }
            seen.add(key);
            return true;
        });
    }
    /**
     * Flatten array to specified depth
     */
    static flatten(array, depth = 1) {
        return depth > 0
            ? array.reduce((acc, val) => acc.concat(Array.isArray(val) ? this.flatten(val, depth - 1) : val), [])
            : array.slice();
    }
    /**
     * Flatten array completely
     */
    static flattenDeep(array) {
        return array.reduce((acc, val) => Array.isArray(val) ? acc.concat(this.flattenDeep(val)) : acc.concat(val), []);
    }
    /**
     * Chunk array into smaller arrays
     */
    static chunk(array, size) {
        if (size <= 0) {
            throw new Error('Chunk size must be greater than 0');
        }
        const result = [];
        for (let i = 0; i < array.length; i += size) {
            result.push(array.slice(i, i + size));
        }
        return result;
    }
    /**
     * Split array into two arrays based on predicate
     */
    static partition(array, predicate) {
        const truthy = [];
        const falsy = [];
        array.forEach((item, index) => {
            if (predicate(item, index)) {
                truthy.push(item);
            }
            else {
                falsy.push(item);
            }
        });
        return { truthy, falsy };
    }
    /**
     * Group array items by key function
     */
    static groupBy(array, keyFn) {
        return array.reduce((groups, item) => {
            const key = String(keyFn(item));
            if (!groups[key]) {
                groups[key] = [];
            }
            groups[key].push(item);
            return groups;
        }, {});
    }
    /**
     * Count occurrences of each value
     */
    static countBy(array, keyFn) {
        const getKey = keyFn || ((item) => String(item));
        return array.reduce((counts, item) => {
            const key = String(getKey(item));
            counts[key] = (counts[key] || 0) + 1;
            return counts;
        }, {});
    }
    /**
     * Sort array with advanced options
     */
    static sort(array, options = {}) {
        const { key, direction = 'asc', locale, numeric = false, } = options;
        const getValue = (item) => {
            if (typeof key === 'function') {
                return key(item);
            }
            else if (key) {
                return item[key];
            }
            return item;
        };
        return [...array].sort((a, b) => {
            const valueA = getValue(a);
            const valueB = getValue(b);
            let comparison = 0;
            if (typeof valueA === 'string' && typeof valueB === 'string') {
                if (numeric) {
                    comparison = valueA.localeCompare(valueB, locale, { numeric: true });
                }
                else {
                    comparison = valueA.localeCompare(valueB, locale);
                }
            }
            else if (valueA < valueB) {
                comparison = -1;
            }
            else if (valueA > valueB) {
                comparison = 1;
            }
            return direction === 'desc' ? -comparison : comparison;
        });
    }
    /**
     * Shuffle array randomly
     */
    static shuffle(array) {
        const result = [...array];
        for (let i = result.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [result[i], result[j]] = [result[j], result[i]];
        }
        return result;
    }
    /**
     * Get random sample from array
     */
    static sample(array, size = 1) {
        if (size >= array.length) {
            return this.shuffle(array);
        }
        const shuffled = this.shuffle(array);
        return shuffled.slice(0, size);
    }
    /**
     * Get random element from array
     */
    static randomElement(array) {
        if (array.length === 0) {
            return undefined;
        }
        return array[Math.floor(Math.random() * array.length)];
    }
    /**
     * Remove duplicates and return intersection of arrays
     */
    static intersection(...arrays) {
        if (arrays.length === 0) {
            return [];
        }
        if (arrays.length === 1) {
            return this.unique(arrays[0]);
        }
        const [first, ...rest] = arrays;
        return this.unique(first).filter(item => rest.every(array => array.includes(item)));
    }
    /**
     * Get union of arrays (all unique values)
     */
    static union(...arrays) {
        return this.unique(arrays.flat());
    }
    /**
     * Get difference between arrays (items in first array but not in others)
     */
    static difference(array, ...others) {
        const otherItems = new Set(others.flat());
        return array.filter(item => !otherItems.has(item));
    }
    /**
     * Get symmetric difference (items in either array but not in both)
     */
    static symmetricDifference(array1, array2) {
        const set1 = new Set(array1);
        const set2 = new Set(array2);
        return [
            ...array1.filter(item => !set2.has(item)),
            ...array2.filter(item => !set1.has(item)),
        ];
    }
    /**
     * Check if arrays are equal
     */
    static isEqual(array1, array2) {
        if (array1.length !== array2.length) {
            return false;
        }
        return array1.every((item, index) => item === array2[index]);
    }
    /**
     * Check if arrays are equal (deep comparison)
     */
    static isEqualDeep(array1, array2) {
        if (array1.length !== array2.length) {
            return false;
        }
        return array1.every((item, index) => {
            const other = array2[index];
            if (Array.isArray(item) && Array.isArray(other)) {
                return this.isEqualDeep(item, other);
            }
            if (typeof item === 'object' && typeof other === 'object' && item !== null && other !== null) {
                return JSON.stringify(item) === JSON.stringify(other);
            }
            return item === other;
        });
    }
    /**
     * Zip arrays together
     */
    static zip(...arrays) {
        if (arrays.length === 0) {
            return [];
        }
        const maxLength = Math.max(...arrays.map(arr => arr.length));
        const result = [];
        for (let i = 0; i < maxLength; i++) {
            result.push(arrays.map(arr => arr[i]));
        }
        return result;
    }
    /**
     * Unzip array of arrays
     */
    static unzip(array) {
        if (array.length === 0) {
            return [];
        }
        const maxLength = Math.max(...array.map(arr => arr.length));
        const result = [];
        for (let i = 0; i < maxLength; i++) {
            result.push(array.map(arr => arr[i]));
        }
        return result;
    }
    /**
     * Transpose 2D array (swap rows and columns)
     */
    static transpose(matrix) {
        if (matrix.length === 0) {
            return [];
        }
        return matrix[0].map((_, colIndex) => matrix.map(row => row[colIndex]));
    }
    /**
     * Get first n elements
     */
    static take(array, count) {
        return array.slice(0, Math.max(0, count));
    }
    /**
     * Get last n elements
     */
    static takeLast(array, count) {
        return array.slice(-Math.max(0, count));
    }
    /**
     * Skip first n elements
     */
    static drop(array, count) {
        return array.slice(Math.max(0, count));
    }
    /**
     * Skip last n elements
     */
    static dropLast(array, count) {
        return array.slice(0, -Math.max(0, count));
    }
    /**
     * Take elements while predicate is true
     */
    static takeWhile(array, predicate) {
        const result = [];
        for (let i = 0; i < array.length; i++) {
            if (predicate(array[i], i)) {
                result.push(array[i]);
            }
            else {
                break;
            }
        }
        return result;
    }
    /**
     * Drop elements while predicate is true
     */
    static dropWhile(array, predicate) {
        let startIndex = 0;
        while (startIndex < array.length && predicate(array[startIndex], startIndex)) {
            startIndex++;
        }
        return array.slice(startIndex);
    }
    /**
     * Find index of element using predicate
     */
    static findIndex(array, predicate, fromIndex = 0) {
        for (let i = Math.max(0, fromIndex); i < array.length; i++) {
            if (predicate(array[i], i)) {
                return i;
            }
        }
        return -1;
    }
    /**
     * Find last index of element using predicate
     */
    static findLastIndex(array, predicate, fromIndex) {
        const startIndex = fromIndex !== undefined ? Math.min(fromIndex, array.length - 1) : array.length - 1;
        for (let i = startIndex; i >= 0; i--) {
            if (predicate(array[i], i)) {
                return i;
            }
        }
        return -1;
    }
    /**
     * Get all indices where predicate is true
     */
    static findAllIndices(array, predicate) {
        const indices = [];
        array.forEach((item, index) => {
            if (predicate(item, index)) {
                indices.push(index);
            }
        });
        return indices;
    }
    /**
     * Insert element at index
     */
    static insert(array, index, ...items) {
        const result = [...array];
        result.splice(index, 0, ...items);
        return result;
    }
    /**
     * Remove element at index
     */
    static removeAt(array, index, count = 1) {
        const result = [...array];
        result.splice(index, count);
        return result;
    }
    /**
     * Remove all occurrences of value
     */
    static remove(array, value) {
        return array.filter(item => item !== value);
    }
    /**
     * Remove elements matching predicate
     */
    static removeBy(array, predicate) {
        return array.filter((item, index) => !predicate(item, index));
    }
    /**
     * Replace element at index
     */
    static replaceAt(array, index, newValue) {
        if (index < 0 || index >= array.length) {
            return [...array];
        }
        const result = [...array];
        result[index] = newValue;
        return result;
    }
    /**
     * Move element from one index to another
     */
    static move(array, fromIndex, toIndex) {
        if (fromIndex < 0 || fromIndex >= array.length || toIndex < 0 || toIndex >= array.length) {
            return [...array];
        }
        const result = [...array];
        const [item] = result.splice(fromIndex, 1);
        result.splice(toIndex, 0, item);
        return result;
    }
    /**
     * Rotate array by n positions
     */
    static rotate(array, positions) {
        if (array.length === 0) {
            return [];
        }
        const len = array.length;
        const normalizedPositions = ((positions % len) + len) % len;
        return [...array.slice(normalizedPositions), ...array.slice(0, normalizedPositions)];
    }
    /**
     * Reverse array
     */
    static reverse(array) {
        return [...array].reverse();
    }
    /**
     * Get min value from array
     */
    static min(array, keyFn) {
        if (array.length === 0) {
            return undefined;
        }
        if (keyFn) {
            return array.reduce((min, item) => keyFn(item) < keyFn(min) ? item : min);
        }
        return array.reduce((min, item) => item < min ? item : min);
    }
    /**
     * Get max value from array
     */
    static max(array, keyFn) {
        if (array.length === 0) {
            return undefined;
        }
        if (keyFn) {
            return array.reduce((max, item) => keyFn(item) > keyFn(max) ? item : max);
        }
        return array.reduce((max, item) => item > max ? item : max);
    }
    /**
     * Get sum of numeric array
     */
    static sum(array) {
        return array.reduce((sum, num) => sum + num, 0);
    }
    /**
     * Get sum by key function
     */
    static sumBy(array, keyFn) {
        return array.reduce((sum, item) => sum + keyFn(item), 0);
    }
    /**
     * Get average of numeric array
     */
    static average(array) {
        return array.length > 0 ? this.sum(array) / array.length : 0;
    }
    /**
     * Get average by key function
     */
    static averageBy(array, keyFn) {
        return array.length > 0 ? this.sumBy(array, keyFn) / array.length : 0;
    }
    /**
     * Get median of numeric array
     */
    static median(array) {
        if (array.length === 0) {
            return 0;
        }
        const sorted = [...array].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 === 0
            ? (sorted[mid - 1] + sorted[mid]) / 2
            : sorted[mid];
    }
    /**
     * Check if array is empty
     */
    static isEmpty(array) {
        return array.length === 0;
    }
    /**
     * Check if array is not empty
     */
    static isNotEmpty(array) {
        return array.length > 0;
    }
    /**
     * Compact array (remove falsy values)
     */
    static compact(array) {
        return array.filter(Boolean);
    }
    /**
     * Get array without specified values
     */
    static without(array, ...values) {
        const excludeSet = new Set(values);
        return array.filter(item => !excludeSet.has(item));
    }
    /**
     * Get array with only specified values
     */
    static only(array, ...values) {
        const includeSet = new Set(values);
        return array.filter(item => includeSet.has(item));
    }
}
exports.ArrayUtils = ArrayUtils;
// Export commonly used functions
exports.isArray = ArrayUtils.isArray, exports.create = ArrayUtils.create, exports.range = ArrayUtils.range, exports.unique = ArrayUtils.unique, exports.uniqueBy = ArrayUtils.uniqueBy, exports.flatten = ArrayUtils.flatten, exports.flattenDeep = ArrayUtils.flattenDeep, exports.chunk = ArrayUtils.chunk, exports.partition = ArrayUtils.partition, exports.groupBy = ArrayUtils.groupBy, exports.countBy = ArrayUtils.countBy, exports.sort = ArrayUtils.sort, exports.shuffle = ArrayUtils.shuffle, exports.sample = ArrayUtils.sample, exports.randomElement = ArrayUtils.randomElement, exports.intersection = ArrayUtils.intersection, exports.union = ArrayUtils.union, exports.difference = ArrayUtils.difference, exports.symmetricDifference = ArrayUtils.symmetricDifference, exports.isEqual = ArrayUtils.isEqual, exports.isEqualDeep = ArrayUtils.isEqualDeep, exports.zip = ArrayUtils.zip, exports.unzip = ArrayUtils.unzip, exports.transpose = ArrayUtils.transpose, exports.take = ArrayUtils.take, exports.takeLast = ArrayUtils.takeLast, exports.drop = ArrayUtils.drop, exports.dropLast = ArrayUtils.dropLast, exports.takeWhile = ArrayUtils.takeWhile, exports.dropWhile = ArrayUtils.dropWhile, exports.findIndex = ArrayUtils.findIndex, exports.findLastIndex = ArrayUtils.findLastIndex, exports.findAllIndices = ArrayUtils.findAllIndices, exports.insert = ArrayUtils.insert, exports.removeAt = ArrayUtils.removeAt, exports.remove = ArrayUtils.remove, exports.removeBy = ArrayUtils.removeBy, exports.replaceAt = ArrayUtils.replaceAt, exports.move = ArrayUtils.move, exports.rotate = ArrayUtils.rotate, exports.reverse = ArrayUtils.reverse, exports.min = ArrayUtils.min, exports.max = ArrayUtils.max, exports.sum = ArrayUtils.sum, exports.sumBy = ArrayUtils.sumBy, exports.average = ArrayUtils.average, exports.averageBy = ArrayUtils.averageBy, exports.median = ArrayUtils.median, exports.isEmpty = ArrayUtils.isEmpty, exports.isNotEmpty = ArrayUtils.isNotEmpty, exports.compact = ArrayUtils.compact, exports.without = ArrayUtils.without, exports.only = ArrayUtils.only;
//# sourceMappingURL=array-utils.js.map