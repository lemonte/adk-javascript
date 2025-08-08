/**
 * Object utilities for object manipulation and processing
 */
export interface DeepMergeOptions {
    arrayMerge?: 'replace' | 'concat' | 'merge';
    customMerge?: (key: string, target: any, source: any) => any;
}
export interface FlattenOptions {
    delimiter?: string;
    maxDepth?: number;
    includeArrays?: boolean;
}
export interface TransformOptions<T, R> {
    deep?: boolean;
    includeArrays?: boolean;
    transform: (value: any, key: string, path: string[]) => R;
}
export type ObjectPath = string | (string | number)[];
/**
 * Object utilities class
 */
export declare class ObjectUtils {
    /**
     * Check if value is a plain object
     */
    static isPlainObject(value: any): value is Record<string, any>;
    /**
     * Check if object is empty
     */
    static isEmpty(obj: any): boolean;
    /**
     * Deep clone an object
     */
    static deepClone<T>(obj: T): T;
    /**
     * Deep merge objects
     */
    static deepMerge<T extends Record<string, any>>(target: T, ...sources: Partial<T>[]): T;
    /**
     * Deep merge objects with options
     */
    static deepMergeWithOptions<T extends Record<string, any>>(target: T, options: DeepMergeOptions, ...sources: Partial<T>[]): T;
    private static mergeObject;
    /**
     * Pick specified keys from object
     */
    static pick<T extends Record<string, any>, K extends keyof T>(obj: T, keys: K[]): Pick<T, K>;
    /**
     * Omit specified keys from object
     */
    static omit<T extends Record<string, any>, K extends keyof T>(obj: T, keys: K[]): Omit<T, K>;
    /**
     * Get value at path
     */
    static get(obj: any, path: ObjectPath, defaultValue?: any): any;
    /**
     * Set value at path
     */
    static set(obj: any, path: ObjectPath, value: any): any;
    /**
     * Check if path exists in object
     */
    static has(obj: any, path: ObjectPath): boolean;
    /**
     * Delete value at path
     */
    static unset(obj: any, path: ObjectPath): any;
    /**
     * Parse object path
     */
    private static parsePath;
    /**
     * Get all paths in object
     */
    static paths(obj: any, options?: {
        includeArrays?: boolean;
        maxDepth?: number;
    }): string[];
    /**
     * Flatten object to dot notation
     */
    static flatten(obj: any, options?: FlattenOptions): Record<string, any>;
    /**
     * Unflatten dot notation object
     */
    static unflatten(obj: Record<string, any>, delimiter?: string): any;
    /**
     * Transform object values
     */
    static transform<T, R>(obj: T, options: TransformOptions<T, R>): any;
    /**
     * Map object values
     */
    static mapValues<T extends Record<string, any>, R>(obj: T, mapper: (value: T[keyof T], key: keyof T) => R): Record<keyof T, R>;
    /**
     * Map object keys
     */
    static mapKeys<T extends Record<string, any>>(obj: T, mapper: (key: keyof T, value: T[keyof T]) => string): Record<string, T[keyof T]>;
    /**
     * Filter object by predicate
     */
    static filter<T extends Record<string, any>>(obj: T, predicate: (value: T[keyof T], key: keyof T) => boolean): Partial<T>;
    /**
     * Find key-value pair by predicate
     */
    static find<T extends Record<string, any>>(obj: T, predicate: (value: T[keyof T], key: keyof T) => boolean): [keyof T, T[keyof T]] | undefined;
    /**
     * Check if any value matches predicate
     */
    static some<T extends Record<string, any>>(obj: T, predicate: (value: T[keyof T], key: keyof T) => boolean): boolean;
    /**
     * Check if all values match predicate
     */
    static every<T extends Record<string, any>>(obj: T, predicate: (value: T[keyof T], key: keyof T) => boolean): boolean;
    /**
     * Reduce object to single value
     */
    static reduce<T extends Record<string, any>, R>(obj: T, reducer: (acc: R, value: T[keyof T], key: keyof T) => R, initialValue: R): R;
    /**
     * Get object keys
     */
    static keys<T extends Record<string, any>>(obj: T): (keyof T)[];
    /**
     * Get object values
     */
    static values<T extends Record<string, any>>(obj: T): T[keyof T][];
    /**
     * Get object entries
     */
    static entries<T extends Record<string, any>>(obj: T): [keyof T, T[keyof T]][];
    /**
     * Create object from entries
     */
    static fromEntries<K extends string | number | symbol, V>(entries: [K, V][]): Record<K, V>;
    /**
     * Invert object (swap keys and values)
     */
    static invert<T extends Record<string, string | number>>(obj: T): Record<string, keyof T>;
    /**
     * Group object entries by key function
     */
    static groupBy<T extends Record<string, any>>(obj: T, keyFn: (value: T[keyof T], key: keyof T) => string): Record<string, Array<[keyof T, T[keyof T]]>>;
    /**
     * Check if objects are equal (shallow)
     */
    static isEqual<T extends Record<string, any>>(obj1: T, obj2: T): boolean;
    /**
     * Check if objects are equal (deep)
     */
    static isEqualDeep<T>(obj1: T, obj2: T): boolean;
    /**
     * Get size of object (number of keys)
     */
    static size<T extends Record<string, any>>(obj: T): number;
    /**
     * Check if object has any keys
     */
    static isNotEmpty<T extends Record<string, any>>(obj: T): boolean;
    /**
     * Compact object (remove undefined and null values)
     */
    static compact<T extends Record<string, any>>(obj: T): Partial<T>;
    /**
     * Default values for object
     */
    static defaults<T extends Record<string, any>>(obj: T, ...defaultObjects: Partial<T>[]): T;
    /**
     * Assign properties from source objects (shallow)
     */
    static assign<T extends Record<string, any>>(target: T, ...sources: Partial<T>[]): T;
}
export declare const isPlainObject: typeof ObjectUtils.isPlainObject, isEmpty: typeof ObjectUtils.isEmpty, deepClone: typeof ObjectUtils.deepClone, deepMerge: typeof ObjectUtils.deepMerge, deepMergeWithOptions: typeof ObjectUtils.deepMergeWithOptions, pick: typeof ObjectUtils.pick, omit: typeof ObjectUtils.omit, get: typeof ObjectUtils.get, set: typeof ObjectUtils.set, has: typeof ObjectUtils.has, unset: typeof ObjectUtils.unset, paths: typeof ObjectUtils.paths, flatten: typeof ObjectUtils.flatten, unflatten: typeof ObjectUtils.unflatten, transform: typeof ObjectUtils.transform, mapValues: typeof ObjectUtils.mapValues, mapKeys: typeof ObjectUtils.mapKeys, filter: typeof ObjectUtils.filter, find: typeof ObjectUtils.find, some: typeof ObjectUtils.some, every: typeof ObjectUtils.every, reduce: typeof ObjectUtils.reduce, keys: typeof ObjectUtils.keys, values: typeof ObjectUtils.values, entries: typeof ObjectUtils.entries, fromEntries: typeof ObjectUtils.fromEntries, invert: typeof ObjectUtils.invert, groupBy: typeof ObjectUtils.groupBy, isEqual: typeof ObjectUtils.isEqual, isEqualDeep: typeof ObjectUtils.isEqualDeep, size: typeof ObjectUtils.size, isNotEmpty: typeof ObjectUtils.isNotEmpty, compact: typeof ObjectUtils.compact, defaults: typeof ObjectUtils.defaults, assign: typeof ObjectUtils.assign;
//# sourceMappingURL=object-utils.d.ts.map