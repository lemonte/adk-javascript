/**
 * Common utility helper functions
 */
/**
 * Sleep for a specified number of milliseconds
 */
export declare function sleep(ms: number): Promise<void>;
/**
 * Execute a function with a timeout
 */
export declare function timeout<T>(promise: Promise<T>, ms: number): Promise<T>;
/**
 * Debounce a function
 */
export declare function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void;
/**
 * Throttle a function
 */
export declare function throttle<T extends (...args: any[]) => any>(func: T, limit: number): (...args: Parameters<T>) => void;
/**
 * Memoize a function
 */
export declare function memoize<T extends (...args: any[]) => any>(func: T, keyGenerator?: (...args: Parameters<T>) => string): T;
/**
 * Deep clone an object
 */
export declare function deepClone<T>(obj: T): T;
/**
 * Deep merge objects
 */
export declare function deepMerge<T extends Record<string, any>>(target: T, ...sources: Partial<T>[]): T;
/**
 * Check if value is a plain object
 */
export declare function isPlainObject(obj: any): obj is Record<string, any>;
/**
 * Check if value is empty
 */
export declare function isEmpty(value: any): boolean;
/**
 * Deep equality check
 */
export declare function isEqual(a: any, b: any): boolean;
/**
 * Pick properties from object
 */
export declare function pick<T extends Record<string, any>, K extends keyof T>(obj: T, keys: K[]): Pick<T, K>;
/**
 * Omit properties from object
 */
export declare function omit<T extends Record<string, any>, K extends keyof T>(obj: T, keys: K[]): Omit<T, K>;
/**
 * Flatten array
 */
export declare function flatten<T>(arr: (T | T[])[]): T[];
/**
 * Chunk array into smaller arrays
 */
export declare function chunk<T>(array: T[], size: number): T[][];
/**
 * Get unique values from array
 */
export declare function unique<T>(array: T[]): T[];
/**
 * Group array by key
 */
export declare function groupBy<T, K extends keyof T>(array: T[], key: K): Record<string, T[]>;
/**
 * Sort array by key
 */
export declare function sortBy<T, K extends keyof T>(array: T[], key: K, direction?: 'asc' | 'desc'): T[];
/**
 * Format bytes to human readable string
 */
export declare function formatBytes(bytes: number, decimals?: number): string;
/**
 * Format duration in milliseconds to human readable string
 */
export declare function formatDuration(ms: number): string;
/**
 * Safe JSON parse
 */
export declare function parseJson<T = any>(str: string, defaultValue?: T): T | undefined;
/**
 * Safe JSON stringify
 */
export declare function safeJsonStringify(obj: any, space?: number): string;
/**
 * Generate unique ID
 */
export declare function generateId(prefix?: string): string;
/**
 * Generate random string
 */
export declare function randomString(length?: number): string;
/**
 * Simple hash function
 */
export declare function hash(str: string): string;
/**
 * Simple encrypt (for demo purposes - use proper encryption in production)
 */
export declare function encrypt(text: string, key: string): string;
/**
 * Simple decrypt (for demo purposes - use proper encryption in production)
 */
export declare function decrypt(encryptedText: string, key: string): string;
/**
 * Encode to base64
 */
export declare function encodeBase64(str: string): string;
/**
 * Decode from base64
 */
export declare function decodeBase64(str: string): string;
/**
 * Escape HTML
 */
export declare function escapeHtml(text: string): string;
/**
 * Unescape HTML
 */
export declare function unescapeHtml(text: string): string;
/**
 * Convert string to slug
 */
export declare function slugify(text: string): string;
/**
 * Truncate string
 */
export declare function truncate(text: string, length: number, suffix?: string): string;
/**
 * Capitalize first letter
 */
export declare function capitalize(text: string): string;
/**
 * Convert to camelCase
 */
export declare function camelCase(text: string): string;
/**
 * Convert to snake_case
 */
export declare function snakeCase(text: string): string;
/**
 * Convert to kebab-case
 */
export declare function kebabCase(text: string): string;
/**
 * Convert to PascalCase
 */
export declare function pascalCase(text: string): string;
//# sourceMappingURL=helpers.d.ts.map