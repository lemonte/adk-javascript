/**
 * JSON utilities for safe parsing, stringifying, and manipulation
 */

export interface JsonParseOptions {
  reviver?: (key: string, value: any) => any;
  fallback?: any;
  throwOnError?: boolean;
}

export interface JsonStringifyOptions {
  replacer?: (key: string, value: any) => any;
  space?: string | number;
  maxDepth?: number;
  detectCircular?: boolean;
}

export interface JsonValidationResult {
  valid: boolean;
  error?: string;
  data?: any;
}

/**
 * JSON utilities class
 */
export class JsonUtils {
  /**
   * Safe JSON parse with error handling
   */
  static safeParse<T = any>(
    text: string,
    options: JsonParseOptions = {}
  ): T | undefined {
    const { reviver, fallback, throwOnError = false } = options;
    
    try {
      return JSON.parse(text, reviver);
    } catch (error) {
      if (throwOnError) {
        throw error;
      }
      return fallback;
    }
  }

  /**
   * Safe JSON stringify with error handling
   */
  static safeStringify(
    value: any,
    options: JsonStringifyOptions = {}
  ): string {
    const { replacer, space, maxDepth = 10, detectCircular = true } = options;
    
    try {
      if (detectCircular) {
        return this.stringifyWithCircularCheck(value, replacer, space, maxDepth);
      }
      
      return JSON.stringify(value, replacer as any, space);
    } catch (error) {
      console.warn('JSON stringify failed:', error);
      return 'null';
    }
  }

  /**
   * Stringify with circular reference detection
   */
  private static stringifyWithCircularCheck(
    value: any,
    replacer?: (key: string, value: any) => any,
    space?: string | number,
    maxDepth = 10
  ): string {
    const seen = new WeakSet();
    let depth = 0;
    
    const circularReplacer = (key: string, val: any) => {
      if (depth > maxDepth) {
        return '[Max Depth Exceeded]';
      }
      
      if (val !== null && typeof val === 'object') {
        if (seen.has(val)) {
          return '[Circular Reference]';
        }
        seen.add(val);
        depth++;
      }
      
      const result = replacer ? replacer(key, val) : val;
      
      if (val !== null && typeof val === 'object') {
        depth--;
      }
      
      return result;
    };
    
    return JSON.stringify(value, circularReplacer, space);
  }

  /**
   * Validate JSON string
   */
  static validate(text: string): JsonValidationResult {
    try {
      const data = JSON.parse(text);
      return { valid: true, data };
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Invalid JSON',
      };
    }
  }

  /**
   * Pretty print JSON
   */
  static prettyPrint(value: any, indent = 2): string {
    return this.safeStringify(value, { space: indent }) || 'null';
  }

  /**
   * Minify JSON string
   */
  static minify(text: string): string {
    const parsed = this.safeParse(text);
    return this.safeStringify(parsed) || text;
  }

  /**
   * Deep clone using JSON (loses functions, undefined, symbols)
   */
  static clone<T>(value: T): T {
    return this.safeParse(this.safeStringify(value)) as T;
  }

  /**
   * Compare two JSON values for equality
   */
  static equals(a: any, b: any): boolean {
    try {
      return this.safeStringify(a) === this.safeStringify(b);
    } catch {
      return false;
    }
  }

  /**
   * Get JSON size in bytes
   */
  static getSize(value: any): number {
    const json = this.safeStringify(value);
    return json ? new Blob([json]).size : 0;
  }

  /**
   * Extract paths from JSON object
   */
  static getPaths(obj: any, prefix = ''): string[] {
    const paths: string[] = [];
    
    if (obj === null || typeof obj !== 'object') {
      return [prefix];
    }
    
    if (Array.isArray(obj)) {
      obj.forEach((item, index) => {
        const path = prefix ? `${prefix}[${index}]` : `[${index}]`;
        paths.push(...this.getPaths(item, path));
      });
    } else {
      Object.keys(obj).forEach(key => {
        const path = prefix ? `${prefix}.${key}` : key;
        paths.push(...this.getPaths(obj[key], path));
      });
    }
    
    return paths;
  }

  /**
   * Get value by path
   */
  static getByPath(obj: any, path: string): any {
    if (!path) return obj;
    
    const keys = path.split(/[.\[\]]/).filter(Boolean);
    let current = obj;
    
    for (const key of keys) {
      if (current === null || current === undefined) {
        return undefined;
      }
      current = current[key];
    }
    
    return current;
  }

  /**
   * Set value by path
   */
  static setByPath(obj: any, path: string, value: any): any {
    if (!path) return value;
    
    const keys = path.split(/[.\[\]]/).filter(Boolean);
    let current = obj;
    
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      const nextKey = keys[i + 1];
      
      if (!(key in current) || current[key] === null || typeof current[key] !== 'object') {
        current[key] = /^\d+$/.test(nextKey) ? [] : {};
      }
      
      current = current[key];
    }
    
    current[keys[keys.length - 1]] = value;
    return obj;
  }

  /**
   * Delete value by path
   */
  static deleteByPath(obj: any, path: string): boolean {
    if (!path) return false;
    
    const keys = path.split(/[.\[\]]/).filter(Boolean);
    let current = obj;
    
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!(key in current) || current[key] === null || typeof current[key] !== 'object') {
        return false;
      }
      current = current[key];
    }
    
    const lastKey = keys[keys.length - 1];
    if (lastKey in current) {
      if (Array.isArray(current)) {
        current.splice(parseInt(lastKey, 10), 1);
      } else {
        delete current[lastKey];
      }
      return true;
    }
    
    return false;
  }

  /**
   * Flatten nested JSON object
   */
  static flatten(obj: any, separator = '.', prefix = ''): Record<string, any> {
    const result: Record<string, any> = {};
    
    if (obj === null || typeof obj !== 'object') {
      result[prefix || 'value'] = obj;
      return result;
    }
    
    if (Array.isArray(obj)) {
      obj.forEach((item, index) => {
        const key = prefix ? `${prefix}${separator}${index}` : String(index);
        Object.assign(result, this.flatten(item, separator, key));
      });
    } else {
      Object.keys(obj).forEach(key => {
        const newKey = prefix ? `${prefix}${separator}${key}` : key;
        Object.assign(result, this.flatten(obj[key], separator, newKey));
      });
    }
    
    return result;
  }

  /**
   * Unflatten flattened JSON object
   */
  static unflatten(obj: Record<string, any>, separator = '.'): any {
    const result: any = {};
    
    Object.keys(obj).forEach(key => {
      this.setByPath(result, key.replace(new RegExp(`\\${separator}`, 'g'), '.'), obj[key]);
    });
    
    return result;
  }

  /**
   * Merge JSON objects deeply
   */
  static merge(target: any, ...sources: any[]): any {
    if (!sources.length) return target;
    
    const source = sources.shift();
    
    if (this.isObject(target) && this.isObject(source)) {
      Object.keys(source).forEach(key => {
        if (this.isObject(source[key])) {
          if (!target[key]) Object.assign(target, { [key]: {} });
          this.merge(target[key], source[key]);
        } else {
          Object.assign(target, { [key]: source[key] });
        }
      });
    }
    
    return this.merge(target, ...sources);
  }

  /**
   * Filter JSON object by predicate
   */
  static filter(
    obj: any,
    predicate: (value: any, key: string, path: string) => boolean,
    path = ''
  ): any {
    if (obj === null || typeof obj !== 'object') {
      return predicate(obj, '', path) ? obj : undefined;
    }
    
    if (Array.isArray(obj)) {
      const filtered = obj
        .map((item, index) => {
          const itemPath = path ? `${path}[${index}]` : `[${index}]`;
          return this.filter(item, predicate, itemPath);
        })
        .filter(item => item !== undefined);
      
      return filtered.length > 0 ? filtered : undefined;
    }
    
    const result: any = {};
    let hasValidKeys = false;
    
    Object.keys(obj).forEach(key => {
      const keyPath = path ? `${path}.${key}` : key;
      
      if (predicate(obj[key], key, keyPath)) {
        const filtered = this.filter(obj[key], predicate, keyPath);
        if (filtered !== undefined) {
          result[key] = filtered;
          hasValidKeys = true;
        }
      }
    });
    
    return hasValidKeys ? result : undefined;
  }

  /**
   * Transform JSON object values
   */
  static transform(
    obj: any,
    transformer: (value: any, key: string, path: string) => any,
    path = ''
  ): any {
    if (obj === null || typeof obj !== 'object') {
      return transformer(obj, '', path);
    }
    
    if (Array.isArray(obj)) {
      return obj.map((item, index) => {
        const itemPath = path ? `${path}[${index}]` : `[${index}]`;
        return this.transform(item, transformer, itemPath);
      });
    }
    
    const result: any = {};
    
    Object.keys(obj).forEach(key => {
      const keyPath = path ? `${path}.${key}` : key;
      result[key] = this.transform(obj[key], transformer, keyPath);
    });
    
    return result;
  }

  /**
   * Get JSON schema (simplified)
   */
  static getSchema(obj: any, path = ''): any {
    if (obj === null) return { type: 'null' };
    if (obj === undefined) return { type: 'undefined' };
    
    const type = Array.isArray(obj) ? 'array' : typeof obj;
    
    switch (type) {
      case 'object':
        const properties: any = {};
        Object.keys(obj).forEach(key => {
          const keyPath = path ? `${path}.${key}` : key;
          properties[key] = this.getSchema(obj[key], keyPath);
        });
        return { type: 'object', properties };
        
      case 'array':
        const items = obj.length > 0 ? this.getSchema(obj[0], `${path}[0]`) : { type: 'any' };
        return { type: 'array', items };
        
      default:
        return { type };
    }
  }

  /**
   * Escape JSON string for safe embedding
   */
  static escape(str: string): string {
    return str
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t')
      .replace(/\f/g, '\\f')
      .replace(/\b/g, '\\b');
  }

  /**
   * Unescape JSON string
   */
  static unescape(str: string): string {
    return str
      .replace(/\\\\/g, '\\')
      .replace(/\\"/g, '"')
      .replace(/\\n/g, '\n')
      .replace(/\\r/g, '\r')
      .replace(/\\t/g, '\t')
      .replace(/\\f/g, '\f')
      .replace(/\\b/g, '\b');
  }

  /**
   * Check if value is a plain object
   */
  private static isObject(item: any): boolean {
    return item && typeof item === 'object' && !Array.isArray(item);
  }

  /**
   * Convert JSON to CSV (for flat objects)
   */
  static toCsv(data: any[], delimiter = ','): string {
    if (!Array.isArray(data) || data.length === 0) {
      return '';
    }
    
    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(delimiter)];
    
    data.forEach(row => {
      const values = headers.map(header => {
        const value = row[header];
        const stringValue = typeof value === 'string' ? value : this.safeStringify(value) || '';
        return stringValue.includes(delimiter) ? `"${stringValue}"` : stringValue;
      });
      csvRows.push(values.join(delimiter));
    });
    
    return csvRows.join('\n');
  }

  /**
   * Convert JSON to XML (simplified)
   */
  static toXml(obj: any, rootName = 'root'): string {
    const convertValue = (value: any, key: string): string => {
      if (value === null || value === undefined) {
        return `<${key}></${key}>`;
      }
      
      if (typeof value === 'object') {
        if (Array.isArray(value)) {
          return value.map(item => convertValue(item, key)).join('');
        }
        
        const content = Object.keys(value)
          .map(k => convertValue(value[k], k))
          .join('');
        return `<${key}>${content}</${key}>`;
      }
      
      return `<${key}>${this.escape(String(value))}</${key}>`;
    };
    
    return `<?xml version="1.0" encoding="UTF-8"?>${convertValue(obj, rootName)}`;
  }
}

// Export commonly used functions
export const {
  safeParse,
  safeStringify,
  validate,
  prettyPrint,
  minify,
  clone,
  equals,
  getSize,
  getPaths,
  getByPath,
  setByPath,
  deleteByPath,
  flatten,
  unflatten,
  merge,
  filter,
  transform,
  getSchema,
  escape,
  unescape,
  toCsv,
  toXml,
} = JsonUtils;