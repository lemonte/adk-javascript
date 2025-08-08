/**
 * Array utilities for array manipulation and processing
 */
export interface GroupByResult<T> {
    [key: string]: T[];
}
export interface ChunkOptions {
    size: number;
    fillValue?: any;
}
export interface SortOptions<T> {
    key?: keyof T | ((item: T) => any);
    direction?: 'asc' | 'desc';
    locale?: string;
    numeric?: boolean;
}
export interface FindOptions<T> {
    fromIndex?: number;
    predicate?: (item: T, index: number, array: T[]) => boolean;
}
export interface PartitionResult<T> {
    truthy: T[];
    falsy: T[];
}
/**
 * Array utilities class
 */
export declare class ArrayUtils {
    /**
     * Check if value is an array
     */
    static isArray(value: any): value is any[];
    /**
     * Create array of specified length with fill value
     */
    static create<T>(length: number, fillValue?: T): T[];
    /**
     * Create array with range of numbers
     */
    static range(start: number, end?: number, step?: number): number[];
    /**
     * Get unique values from array
     */
    static unique<T>(array: T[]): T[];
    /**
     * Get unique values by key function
     */
    static uniqueBy<T>(array: T[], keyFn: (item: T) => any): T[];
    /**
     * Flatten array to specified depth
     */
    static flatten<T>(array: any[], depth?: number): T[];
    /**
     * Flatten array completely
     */
    static flattenDeep<T>(array: any[]): T[];
    /**
     * Chunk array into smaller arrays
     */
    static chunk<T>(array: T[], size: number): T[][];
    /**
     * Split array into two arrays based on predicate
     */
    static partition<T>(array: T[], predicate: (item: T, index: number) => boolean): PartitionResult<T>;
    /**
     * Group array items by key function
     */
    static groupBy<T>(array: T[], keyFn: (item: T) => string | number): GroupByResult<T>;
    /**
     * Count occurrences of each value
     */
    static countBy<T>(array: T[], keyFn?: (item: T) => string | number): Record<string, number>;
    /**
     * Sort array with advanced options
     */
    static sort<T>(array: T[], options?: SortOptions<T>): T[];
    /**
     * Shuffle array randomly
     */
    static shuffle<T>(array: T[]): T[];
    /**
     * Get random sample from array
     */
    static sample<T>(array: T[], size?: number): T[];
    /**
     * Get random element from array
     */
    static randomElement<T>(array: T[]): T | undefined;
    /**
     * Remove duplicates and return intersection of arrays
     */
    static intersection<T>(...arrays: T[][]): T[];
    /**
     * Get union of arrays (all unique values)
     */
    static union<T>(...arrays: T[][]): T[];
    /**
     * Get difference between arrays (items in first array but not in others)
     */
    static difference<T>(array: T[], ...others: T[][]): T[];
    /**
     * Get symmetric difference (items in either array but not in both)
     */
    static symmetricDifference<T>(array1: T[], array2: T[]): T[];
    /**
     * Check if arrays are equal
     */
    static isEqual<T>(array1: T[], array2: T[]): boolean;
    /**
     * Check if arrays are equal (deep comparison)
     */
    static isEqualDeep<T>(array1: T[], array2: T[]): boolean;
    /**
     * Zip arrays together
     */
    static zip<T>(...arrays: T[][]): T[][];
    /**
     * Unzip array of arrays
     */
    static unzip<T>(array: T[][]): T[][];
    /**
     * Transpose 2D array (swap rows and columns)
     */
    static transpose<T>(matrix: T[][]): T[][];
    /**
     * Get first n elements
     */
    static take<T>(array: T[], count: number): T[];
    /**
     * Get last n elements
     */
    static takeLast<T>(array: T[], count: number): T[];
    /**
     * Skip first n elements
     */
    static drop<T>(array: T[], count: number): T[];
    /**
     * Skip last n elements
     */
    static dropLast<T>(array: T[], count: number): T[];
    /**
     * Take elements while predicate is true
     */
    static takeWhile<T>(array: T[], predicate: (item: T, index: number) => boolean): T[];
    /**
     * Drop elements while predicate is true
     */
    static dropWhile<T>(array: T[], predicate: (item: T, index: number) => boolean): T[];
    /**
     * Find index of element using predicate
     */
    static findIndex<T>(array: T[], predicate: (item: T, index: number) => boolean, fromIndex?: number): number;
    /**
     * Find last index of element using predicate
     */
    static findLastIndex<T>(array: T[], predicate: (item: T, index: number) => boolean, fromIndex?: number): number;
    /**
     * Get all indices where predicate is true
     */
    static findAllIndices<T>(array: T[], predicate: (item: T, index: number) => boolean): number[];
    /**
     * Insert element at index
     */
    static insert<T>(array: T[], index: number, ...items: T[]): T[];
    /**
     * Remove element at index
     */
    static removeAt<T>(array: T[], index: number, count?: number): T[];
    /**
     * Remove all occurrences of value
     */
    static remove<T>(array: T[], value: T): T[];
    /**
     * Remove elements matching predicate
     */
    static removeBy<T>(array: T[], predicate: (item: T, index: number) => boolean): T[];
    /**
     * Replace element at index
     */
    static replaceAt<T>(array: T[], index: number, newValue: T): T[];
    /**
     * Move element from one index to another
     */
    static move<T>(array: T[], fromIndex: number, toIndex: number): T[];
    /**
     * Rotate array by n positions
     */
    static rotate<T>(array: T[], positions: number): T[];
    /**
     * Reverse array
     */
    static reverse<T>(array: T[]): T[];
    /**
     * Get min value from array
     */
    static min<T>(array: T[], keyFn?: (item: T) => number): T | undefined;
    /**
     * Get max value from array
     */
    static max<T>(array: T[], keyFn?: (item: T) => number): T | undefined;
    /**
     * Get sum of numeric array
     */
    static sum(array: number[]): number;
    /**
     * Get sum by key function
     */
    static sumBy<T>(array: T[], keyFn: (item: T) => number): number;
    /**
     * Get average of numeric array
     */
    static average(array: number[]): number;
    /**
     * Get average by key function
     */
    static averageBy<T>(array: T[], keyFn: (item: T) => number): number;
    /**
     * Get median of numeric array
     */
    static median(array: number[]): number;
    /**
     * Check if array is empty
     */
    static isEmpty<T>(array: T[]): boolean;
    /**
     * Check if array is not empty
     */
    static isNotEmpty<T>(array: T[]): boolean;
    /**
     * Compact array (remove falsy values)
     */
    static compact<T>(array: T[]): NonNullable<T>[];
    /**
     * Get array without specified values
     */
    static without<T>(array: T[], ...values: T[]): T[];
    /**
     * Get array with only specified values
     */
    static only<T>(array: T[], ...values: T[]): T[];
}
export declare const isArray: typeof ArrayUtils.isArray, create: typeof ArrayUtils.create, range: typeof ArrayUtils.range, unique: typeof ArrayUtils.unique, uniqueBy: typeof ArrayUtils.uniqueBy, flatten: typeof ArrayUtils.flatten, flattenDeep: typeof ArrayUtils.flattenDeep, chunk: typeof ArrayUtils.chunk, partition: typeof ArrayUtils.partition, groupBy: typeof ArrayUtils.groupBy, countBy: typeof ArrayUtils.countBy, sort: typeof ArrayUtils.sort, shuffle: typeof ArrayUtils.shuffle, sample: typeof ArrayUtils.sample, randomElement: typeof ArrayUtils.randomElement, intersection: typeof ArrayUtils.intersection, union: typeof ArrayUtils.union, difference: typeof ArrayUtils.difference, symmetricDifference: typeof ArrayUtils.symmetricDifference, isEqual: typeof ArrayUtils.isEqual, isEqualDeep: typeof ArrayUtils.isEqualDeep, zip: typeof ArrayUtils.zip, unzip: typeof ArrayUtils.unzip, transpose: typeof ArrayUtils.transpose, take: typeof ArrayUtils.take, takeLast: typeof ArrayUtils.takeLast, drop: typeof ArrayUtils.drop, dropLast: typeof ArrayUtils.dropLast, takeWhile: typeof ArrayUtils.takeWhile, dropWhile: typeof ArrayUtils.dropWhile, findIndex: typeof ArrayUtils.findIndex, findLastIndex: typeof ArrayUtils.findLastIndex, findAllIndices: typeof ArrayUtils.findAllIndices, insert: typeof ArrayUtils.insert, removeAt: typeof ArrayUtils.removeAt, remove: typeof ArrayUtils.remove, removeBy: typeof ArrayUtils.removeBy, replaceAt: typeof ArrayUtils.replaceAt, move: typeof ArrayUtils.move, rotate: typeof ArrayUtils.rotate, reverse: typeof ArrayUtils.reverse, min: typeof ArrayUtils.min, max: typeof ArrayUtils.max, sum: typeof ArrayUtils.sum, sumBy: typeof ArrayUtils.sumBy, average: typeof ArrayUtils.average, averageBy: typeof ArrayUtils.averageBy, median: typeof ArrayUtils.median, isEmpty: typeof ArrayUtils.isEmpty, isNotEmpty: typeof ArrayUtils.isNotEmpty, compact: typeof ArrayUtils.compact, without: typeof ArrayUtils.without, only: typeof ArrayUtils.only;
//# sourceMappingURL=array-utils.d.ts.map