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
export class ObjectUtils {
  /**
   * Check if value is a plain object
   */
  static isPlainObject(value: any): value is Record<string, any> {
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
  static isEmpty(obj: any): boolean {
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
  static deepClone<T>(obj: T): T {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }
    
    if (obj instanceof Date) {
      return new Date(obj.getTime()) as T;
    }
    
    if (obj instanceof RegExp) {
      return new RegExp(obj) as T;
    }
    
    if (obj instanceof Map) {
      const cloned = new Map();
      for (const [key, value] of obj) {
        cloned.set(key, this.deepClone(value));
      }
      return cloned as T;
    }
    
    if (obj instanceof Set) {
      const cloned = new Set();
      for (const value of obj) {
        cloned.add(this.deepClone(value));
      }
      return cloned as T;
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.deepClone(item)) as T;
    }
    
    if (this.isPlainObject(obj)) {
      const cloned: any = {};
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
  static deepMerge<T extends Record<string, any>>(
    target: T,
    ...sources: Partial<T>[]
  ): T {
    return this.deepMergeWithOptions(target, { arrayMerge: 'replace' }, ...sources);
  }

  /**
   * Deep merge objects with options
   */
  static deepMergeWithOptions<T extends Record<string, any>>(
    target: T,
    options: DeepMergeOptions,
    ...sources: Partial<T>[]
  ): T {
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

  private static mergeObject(
    target: any,
    source: any,
    arrayMerge: 'replace' | 'concat' | 'merge',
    customMerge?: (key: string, target: any, source: any) => any
  ): void {
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
          } else if (arrayMerge === 'merge' && Array.isArray(target[key])) {
            target[key] = this.deepClone(source[key]);
          } else {
            target[key] = this.deepClone(source[key]);
          }
        } else if (this.isPlainObject(source[key])) {
          if (!this.isPlainObject(target[key])) {
            target[key] = {};
          }
          this.mergeObject(target[key], source[key], arrayMerge, customMerge);
        } else {
          target[key] = source[key];
        }
      }
    }
  }

  /**
   * Pick specified keys from object
   */
  static pick<T extends Record<string, any>, K extends keyof T>(
    obj: T,
    keys: K[]
  ): Pick<T, K> {
    const result = {} as Pick<T, K>;
    
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
  static omit<T extends Record<string, any>, K extends keyof T>(
    obj: T,
    keys: K[]
  ): Omit<T, K> {
    const result = { ...obj } as any;
    
    for (const key of keys) {
      delete result[key];
    }
    
    return result;
  }

  /**
   * Get value at path
   */
  static get(obj: any, path: ObjectPath, defaultValue?: any): any {
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
  static set(obj: any, path: ObjectPath, value: any): any {
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
  static has(obj: any, path: ObjectPath): boolean {
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
  static unset(obj: any, path: ObjectPath): any {
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
      } else {
        delete current[lastKey];
      }
    }
    
    return result;
  }

  /**
   * Parse object path
   */
  private static parsePath(path: ObjectPath): (string | number)[] {
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
  static paths(obj: any, options: { includeArrays?: boolean; maxDepth?: number } = {}): string[] {
    const { includeArrays = false, maxDepth = Infinity } = options;
    const paths: string[] = [];
    
    const traverse = (current: any, path: string[], depth: number) => {
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
      } else if (includeArrays && Array.isArray(current)) {
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
  static flatten(obj: any, options: FlattenOptions = {}): Record<string, any> {
    const {
      delimiter = '.',
      maxDepth = Infinity,
      includeArrays = false,
    } = options;
    
    const result: Record<string, any> = {};
    
    const traverse = (current: any, path: string[], depth: number) => {
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
      } else if (includeArrays && Array.isArray(current)) {
        current.forEach((item, index) => {
          traverse(item, [...path, String(index)], depth + 1);
        });
      } else {
        result[path.join(delimiter)] = current;
      }
    };
    
    traverse(obj, [], 0);
    return result;
  }

  /**
   * Unflatten dot notation object
   */
  static unflatten(obj: Record<string, any>, delimiter = '.'): any {
    const result: any = {};
    
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
  static transform<T, R>(
    obj: T,
    options: TransformOptions<T, R>
  ): any {
    const { deep = true, includeArrays = false, transform } = options;
    
    const traverse = (current: any, path: string[] = []): any => {
      if (this.isPlainObject(current)) {
        const result: any = {};
        
        for (const key in current) {
          if (current.hasOwnProperty(key)) {
            const newPath = [...path, key];
            const value = deep ? traverse(current[key], newPath) : current[key];
            result[key] = transform(value, key, newPath);
          }
        }
        
        return result;
      } else if (includeArrays && Array.isArray(current)) {
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
  static mapValues<T extends Record<string, any>, R>(
    obj: T,
    mapper: (value: T[keyof T], key: keyof T) => R
  ): Record<keyof T, R> {
    const result = {} as Record<keyof T, R>;
    
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
  static mapKeys<T extends Record<string, any>>(
    obj: T,
    mapper: (key: keyof T, value: T[keyof T]) => string
  ): Record<string, T[keyof T]> {
    const result: Record<string, T[keyof T]> = {};
    
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
  static filter<T extends Record<string, any>>(
    obj: T,
    predicate: (value: T[keyof T], key: keyof T) => boolean
  ): Partial<T> {
    const result: Partial<T> = {};
    
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
  static find<T extends Record<string, any>>(
    obj: T,
    predicate: (value: T[keyof T], key: keyof T) => boolean
  ): [keyof T, T[keyof T]] | undefined {
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
  static some<T extends Record<string, any>>(
    obj: T,
    predicate: (value: T[keyof T], key: keyof T) => boolean
  ): boolean {
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
  static every<T extends Record<string, any>>(
    obj: T,
    predicate: (value: T[keyof T], key: keyof T) => boolean
  ): boolean {
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
  static reduce<T extends Record<string, any>, R>(
    obj: T,
    reducer: (acc: R, value: T[keyof T], key: keyof T) => R,
    initialValue: R
  ): R {
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
  static keys<T extends Record<string, any>>(obj: T): (keyof T)[] {
    return Object.keys(obj) as (keyof T)[];
  }

  /**
   * Get object values
   */
  static values<T extends Record<string, any>>(obj: T): T[keyof T][] {
    return Object.values(obj);
  }

  /**
   * Get object entries
   */
  static entries<T extends Record<string, any>>(obj: T): [keyof T, T[keyof T]][] {
    return Object.entries(obj) as [keyof T, T[keyof T]][];
  }

  /**
   * Create object from entries
   */
  static fromEntries<K extends string | number | symbol, V>(
    entries: [K, V][]
  ): Record<K, V> {
    return Object.fromEntries(entries) as Record<K, V>;
  }

  /**
   * Invert object (swap keys and values)
   */
  static invert<T extends Record<string, string | number>>(
    obj: T
  ): Record<string, keyof T> {
    const result: Record<string, keyof T> = {};
    
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
  static groupBy<T extends Record<string, any>>(
    obj: T,
    keyFn: (value: T[keyof T], key: keyof T) => string
  ): Record<string, Array<[keyof T, T[keyof T]]>> {
    const result: Record<string, Array<[keyof T, T[keyof T]]>> = {};
    
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
  static isEqual<T extends Record<string, any>>(obj1: T, obj2: T): boolean {
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
  static isEqualDeep<T>(obj1: T, obj2: T): boolean {
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
      
      return keys1.every(key => 
        keys2.includes(key) && this.isEqualDeep(obj1[key], obj2[key])
      );
    }
    
    return false;
  }

  /**
   * Get size of object (number of keys)
   */
  static size<T extends Record<string, any>>(obj: T): number {
    return this.keys(obj).length;
  }

  /**
   * Check if object has any keys
   */
  static isNotEmpty<T extends Record<string, any>>(obj: T): boolean {
    return !this.isEmpty(obj);
  }

  /**
   * Compact object (remove undefined and null values)
   */
  static compact<T extends Record<string, any>>(obj: T): Partial<T> {
    return this.filter(obj, value => value != null);
  }

  /**
   * Default values for object
   */
  static defaults<T extends Record<string, any>>(
    obj: T,
    ...defaultObjects: Partial<T>[]
  ): T {
    const result = { ...obj };
    
    for (const defaultObj of defaultObjects) {
      for (const key in defaultObj) {
        if (defaultObj.hasOwnProperty(key) && result[key] === undefined) {
          result[key] = defaultObj[key]!;
        }
      }
    }
    
    return result;
  }

  /**
   * Assign properties from source objects (shallow)
   */
  static assign<T extends Record<string, any>>(
    target: T,
    ...sources: Partial<T>[]
  ): T {
    return Object.assign({}, target, ...sources);
  }
}

// Export commonly used functions
export const {
  isPlainObject,
  isEmpty,
  deepClone,
  deepMerge,
  deepMergeWithOptions,
  pick,
  omit,
  get,
  set,
  has,
  unset,
  paths,
  flatten,
  unflatten,
  transform,
  mapValues,
  mapKeys,
  filter,
  find,
  some,
  every,
  reduce,
  keys,
  values,
  entries,
  fromEntries,
  invert,
  groupBy,
  isEqual,
  isEqualDeep,
  size,
  isNotEmpty,
  compact,
  defaults,
  assign,
} = ObjectUtils;