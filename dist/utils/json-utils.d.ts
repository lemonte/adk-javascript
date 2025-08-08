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
export declare class JsonUtils {
    /**
     * Safe JSON parse with error handling
     */
    static safeParse<T = any>(text: string, options?: JsonParseOptions): T | undefined;
    /**
     * Safe JSON stringify with error handling
     */
    static safeStringify(value: any, options?: JsonStringifyOptions): string;
    /**
     * Stringify with circular reference detection
     */
    private static stringifyWithCircularCheck;
    /**
     * Validate JSON string
     */
    static validate(text: string): JsonValidationResult;
    /**
     * Pretty print JSON
     */
    static prettyPrint(value: any, indent?: number): string;
    /**
     * Minify JSON string
     */
    static minify(text: string): string;
    /**
     * Deep clone using JSON (loses functions, undefined, symbols)
     */
    static clone<T>(value: T): T;
    /**
     * Compare two JSON values for equality
     */
    static equals(a: any, b: any): boolean;
    /**
     * Get JSON size in bytes
     */
    static getSize(value: any): number;
    /**
     * Extract paths from JSON object
     */
    static getPaths(obj: any, prefix?: string): string[];
    /**
     * Get value by path
     */
    static getByPath(obj: any, path: string): any;
    /**
     * Set value by path
     */
    static setByPath(obj: any, path: string, value: any): any;
    /**
     * Delete value by path
     */
    static deleteByPath(obj: any, path: string): boolean;
    /**
     * Flatten nested JSON object
     */
    static flatten(obj: any, separator?: string, prefix?: string): Record<string, any>;
    /**
     * Unflatten flattened JSON object
     */
    static unflatten(obj: Record<string, any>, separator?: string): any;
    /**
     * Merge JSON objects deeply
     */
    static merge(target: any, ...sources: any[]): any;
    /**
     * Filter JSON object by predicate
     */
    static filter(obj: any, predicate: (value: any, key: string, path: string) => boolean, path?: string): any;
    /**
     * Transform JSON object values
     */
    static transform(obj: any, transformer: (value: any, key: string, path: string) => any, path?: string): any;
    /**
     * Get JSON schema (simplified)
     */
    static getSchema(obj: any, path?: string): any;
    /**
     * Escape JSON string for safe embedding
     */
    static escape(str: string): string;
    /**
     * Unescape JSON string
     */
    static unescape(str: string): string;
    /**
     * Check if value is a plain object
     */
    private static isObject;
    /**
     * Convert JSON to CSV (for flat objects)
     */
    static toCsv(data: any[], delimiter?: string): string;
    /**
     * Convert JSON to XML (simplified)
     */
    static toXml(obj: any, rootName?: string): string;
}
export declare const safeParse: typeof JsonUtils.safeParse, safeStringify: typeof JsonUtils.safeStringify, validate: typeof JsonUtils.validate, prettyPrint: typeof JsonUtils.prettyPrint, minify: typeof JsonUtils.minify, clone: typeof JsonUtils.clone, equals: typeof JsonUtils.equals, getSize: typeof JsonUtils.getSize, getPaths: typeof JsonUtils.getPaths, getByPath: typeof JsonUtils.getByPath, setByPath: typeof JsonUtils.setByPath, deleteByPath: typeof JsonUtils.deleteByPath, flatten: typeof JsonUtils.flatten, unflatten: typeof JsonUtils.unflatten, merge: typeof JsonUtils.merge, filter: typeof JsonUtils.filter, transform: typeof JsonUtils.transform, getSchema: typeof JsonUtils.getSchema, escape: typeof JsonUtils.escape, unescape: typeof JsonUtils.unescape, toCsv: typeof JsonUtils.toCsv, toXml: typeof JsonUtils.toXml;
//# sourceMappingURL=json-utils.d.ts.map