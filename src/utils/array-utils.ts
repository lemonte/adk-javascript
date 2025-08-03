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
export class ArrayUtils {
  /**
   * Check if value is an array
   */
  static isArray(value: any): value is any[] {
    return Array.isArray(value);
  }

  /**
   * Create array of specified length with fill value
   */
  static create<T>(length: number, fillValue?: T): T[] {
    return Array(length).fill(fillValue);
  }

  /**
   * Create array with range of numbers
   */
  static range(start: number, end?: number, step = 1): number[] {
    if (end === undefined) {
      end = start;
      start = 0;
    }
    
    const result: number[] = [];
    
    if (step > 0) {
      for (let i = start; i < end; i += step) {
        result.push(i);
      }
    } else if (step < 0) {
      for (let i = start; i > end; i += step) {
        result.push(i);
      }
    }
    
    return result;
  }

  /**
   * Get unique values from array
   */
  static unique<T>(array: T[]): T[] {
    return [...new Set(array)];
  }

  /**
   * Get unique values by key function
   */
  static uniqueBy<T>(array: T[], keyFn: (item: T) => any): T[] {
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
  static flatten<T>(array: any[], depth = 1): T[] {
    return depth > 0
      ? array.reduce((acc, val) => acc.concat(
          Array.isArray(val) ? this.flatten(val, depth - 1) : val
        ), [])
      : array.slice();
  }

  /**
   * Flatten array completely
   */
  static flattenDeep<T>(array: any[]): T[] {
    return array.reduce((acc, val) => 
      Array.isArray(val) ? acc.concat(this.flattenDeep(val)) : acc.concat(val), []
    );
  }

  /**
   * Chunk array into smaller arrays
   */
  static chunk<T>(array: T[], size: number): T[][] {
    if (size <= 0) {
      throw new Error('Chunk size must be greater than 0');
    }
    
    const result: T[][] = [];
    
    for (let i = 0; i < array.length; i += size) {
      result.push(array.slice(i, i + size));
    }
    
    return result;
  }

  /**
   * Split array into two arrays based on predicate
   */
  static partition<T>(array: T[], predicate: (item: T, index: number) => boolean): PartitionResult<T> {
    const truthy: T[] = [];
    const falsy: T[] = [];
    
    array.forEach((item, index) => {
      if (predicate(item, index)) {
        truthy.push(item);
      } else {
        falsy.push(item);
      }
    });
    
    return { truthy, falsy };
  }

  /**
   * Group array items by key function
   */
  static groupBy<T>(array: T[], keyFn: (item: T) => string | number): GroupByResult<T> {
    return array.reduce((groups, item) => {
      const key = String(keyFn(item));
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(item);
      return groups;
    }, {} as GroupByResult<T>);
  }

  /**
   * Count occurrences of each value
   */
  static countBy<T>(array: T[], keyFn?: (item: T) => string | number): Record<string, number> {
    const getKey = keyFn || ((item: T) => String(item));
    
    return array.reduce((counts, item) => {
      const key = String(getKey(item));
      counts[key] = (counts[key] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);
  }

  /**
   * Sort array with advanced options
   */
  static sort<T>(array: T[], options: SortOptions<T> = {}): T[] {
    const {
      key,
      direction = 'asc',
      locale,
      numeric = false,
    } = options;
    
    const getValue = (item: T) => {
      if (typeof key === 'function') {
        return key(item);
      } else if (key) {
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
        } else {
          comparison = valueA.localeCompare(valueB, locale);
        }
      } else if (valueA < valueB) {
        comparison = -1;
      } else if (valueA > valueB) {
        comparison = 1;
      }
      
      return direction === 'desc' ? -comparison : comparison;
    });
  }

  /**
   * Shuffle array randomly
   */
  static shuffle<T>(array: T[]): T[] {
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
  static sample<T>(array: T[], size = 1): T[] {
    if (size >= array.length) {
      return this.shuffle(array);
    }
    
    const shuffled = this.shuffle(array);
    return shuffled.slice(0, size);
  }

  /**
   * Get random element from array
   */
  static randomElement<T>(array: T[]): T | undefined {
    if (array.length === 0) {
      return undefined;
    }
    
    return array[Math.floor(Math.random() * array.length)];
  }

  /**
   * Remove duplicates and return intersection of arrays
   */
  static intersection<T>(...arrays: T[][]): T[] {
    if (arrays.length === 0) {
      return [];
    }
    
    if (arrays.length === 1) {
      return this.unique(arrays[0]);
    }
    
    const [first, ...rest] = arrays;
    return this.unique(first).filter(item => 
      rest.every(array => array.includes(item))
    );
  }

  /**
   * Get union of arrays (all unique values)
   */
  static union<T>(...arrays: T[][]): T[] {
    return this.unique(arrays.flat());
  }

  /**
   * Get difference between arrays (items in first array but not in others)
   */
  static difference<T>(array: T[], ...others: T[][]): T[] {
    const otherItems = new Set(others.flat());
    return array.filter(item => !otherItems.has(item));
  }

  /**
   * Get symmetric difference (items in either array but not in both)
   */
  static symmetricDifference<T>(array1: T[], array2: T[]): T[] {
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
  static isEqual<T>(array1: T[], array2: T[]): boolean {
    if (array1.length !== array2.length) {
      return false;
    }
    
    return array1.every((item, index) => item === array2[index]);
  }

  /**
   * Check if arrays are equal (deep comparison)
   */
  static isEqualDeep<T>(array1: T[], array2: T[]): boolean {
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
  static zip<T>(...arrays: T[][]): T[][] {
    if (arrays.length === 0) {
      return [];
    }
    
    const maxLength = Math.max(...arrays.map(arr => arr.length));
    const result: T[][] = [];
    
    for (let i = 0; i < maxLength; i++) {
      result.push(arrays.map(arr => arr[i]));
    }
    
    return result;
  }

  /**
   * Unzip array of arrays
   */
  static unzip<T>(array: T[][]): T[][] {
    if (array.length === 0) {
      return [];
    }
    
    const maxLength = Math.max(...array.map(arr => arr.length));
    const result: T[][] = [];
    
    for (let i = 0; i < maxLength; i++) {
      result.push(array.map(arr => arr[i]));
    }
    
    return result;
  }

  /**
   * Transpose 2D array (swap rows and columns)
   */
  static transpose<T>(matrix: T[][]): T[][] {
    if (matrix.length === 0) {
      return [];
    }
    
    return matrix[0].map((_, colIndex) => 
      matrix.map(row => row[colIndex])
    );
  }

  /**
   * Get first n elements
   */
  static take<T>(array: T[], count: number): T[] {
    return array.slice(0, Math.max(0, count));
  }

  /**
   * Get last n elements
   */
  static takeLast<T>(array: T[], count: number): T[] {
    return array.slice(-Math.max(0, count));
  }

  /**
   * Skip first n elements
   */
  static drop<T>(array: T[], count: number): T[] {
    return array.slice(Math.max(0, count));
  }

  /**
   * Skip last n elements
   */
  static dropLast<T>(array: T[], count: number): T[] {
    return array.slice(0, -Math.max(0, count));
  }

  /**
   * Take elements while predicate is true
   */
  static takeWhile<T>(array: T[], predicate: (item: T, index: number) => boolean): T[] {
    const result: T[] = [];
    
    for (let i = 0; i < array.length; i++) {
      if (predicate(array[i], i)) {
        result.push(array[i]);
      } else {
        break;
      }
    }
    
    return result;
  }

  /**
   * Drop elements while predicate is true
   */
  static dropWhile<T>(array: T[], predicate: (item: T, index: number) => boolean): T[] {
    let startIndex = 0;
    
    while (startIndex < array.length && predicate(array[startIndex], startIndex)) {
      startIndex++;
    }
    
    return array.slice(startIndex);
  }

  /**
   * Find index of element using predicate
   */
  static findIndex<T>(array: T[], predicate: (item: T, index: number) => boolean, fromIndex = 0): number {
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
  static findLastIndex<T>(array: T[], predicate: (item: T, index: number) => boolean, fromIndex?: number): number {
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
  static findAllIndices<T>(array: T[], predicate: (item: T, index: number) => boolean): number[] {
    const indices: number[] = [];
    
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
  static insert<T>(array: T[], index: number, ...items: T[]): T[] {
    const result = [...array];
    result.splice(index, 0, ...items);
    return result;
  }

  /**
   * Remove element at index
   */
  static removeAt<T>(array: T[], index: number, count = 1): T[] {
    const result = [...array];
    result.splice(index, count);
    return result;
  }

  /**
   * Remove all occurrences of value
   */
  static remove<T>(array: T[], value: T): T[] {
    return array.filter(item => item !== value);
  }

  /**
   * Remove elements matching predicate
   */
  static removeBy<T>(array: T[], predicate: (item: T, index: number) => boolean): T[] {
    return array.filter((item, index) => !predicate(item, index));
  }

  /**
   * Replace element at index
   */
  static replaceAt<T>(array: T[], index: number, newValue: T): T[] {
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
  static move<T>(array: T[], fromIndex: number, toIndex: number): T[] {
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
  static rotate<T>(array: T[], positions: number): T[] {
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
  static reverse<T>(array: T[]): T[] {
    return [...array].reverse();
  }

  /**
   * Get min value from array
   */
  static min<T>(array: T[], keyFn?: (item: T) => number): T | undefined {
    if (array.length === 0) {
      return undefined;
    }
    
    if (keyFn) {
      return array.reduce((min, item) => 
        keyFn(item) < keyFn(min) ? item : min
      );
    }
    
    return array.reduce((min, item) => item < min ? item : min);
  }

  /**
   * Get max value from array
   */
  static max<T>(array: T[], keyFn?: (item: T) => number): T | undefined {
    if (array.length === 0) {
      return undefined;
    }
    
    if (keyFn) {
      return array.reduce((max, item) => 
        keyFn(item) > keyFn(max) ? item : max
      );
    }
    
    return array.reduce((max, item) => item > max ? item : max);
  }

  /**
   * Get sum of numeric array
   */
  static sum(array: number[]): number {
    return array.reduce((sum, num) => sum + num, 0);
  }

  /**
   * Get sum by key function
   */
  static sumBy<T>(array: T[], keyFn: (item: T) => number): number {
    return array.reduce((sum, item) => sum + keyFn(item), 0);
  }

  /**
   * Get average of numeric array
   */
  static average(array: number[]): number {
    return array.length > 0 ? this.sum(array) / array.length : 0;
  }

  /**
   * Get average by key function
   */
  static averageBy<T>(array: T[], keyFn: (item: T) => number): number {
    return array.length > 0 ? this.sumBy(array, keyFn) / array.length : 0;
  }

  /**
   * Get median of numeric array
   */
  static median(array: number[]): number {
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
  static isEmpty<T>(array: T[]): boolean {
    return array.length === 0;
  }

  /**
   * Check if array is not empty
   */
  static isNotEmpty<T>(array: T[]): boolean {
    return array.length > 0;
  }

  /**
   * Compact array (remove falsy values)
   */
  static compact<T>(array: T[]): NonNullable<T>[] {
    return array.filter(Boolean) as NonNullable<T>[];
  }

  /**
   * Get array without specified values
   */
  static without<T>(array: T[], ...values: T[]): T[] {
    const excludeSet = new Set(values);
    return array.filter(item => !excludeSet.has(item));
  }

  /**
   * Get array with only specified values
   */
  static only<T>(array: T[], ...values: T[]): T[] {
    const includeSet = new Set(values);
    return array.filter(item => includeSet.has(item));
  }
}

// Export commonly used functions
export const {
  isArray,
  create,
  range,
  unique,
  uniqueBy,
  flatten,
  flattenDeep,
  chunk,
  partition,
  groupBy,
  countBy,
  sort,
  shuffle,
  sample,
  randomElement,
  intersection,
  union,
  difference,
  symmetricDifference,
  isEqual,
  isEqualDeep,
  zip,
  unzip,
  transpose,
  take,
  takeLast,
  drop,
  dropLast,
  takeWhile,
  dropWhile,
  findIndex,
  findLastIndex,
  findAllIndices,
  insert,
  removeAt,
  remove,
  removeBy,
  replaceAt,
  move,
  rotate,
  reverse,
  min,
  max,
  sum,
  sumBy,
  average,
  averageBy,
  median,
  isEmpty,
  isNotEmpty,
  compact,
  without,
  only,
} = ArrayUtils;