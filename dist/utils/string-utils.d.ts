/**
 * String utilities for text manipulation and formatting
 */
export interface StringFormatOptions {
    maxLength?: number;
    ellipsis?: string;
    preserveWords?: boolean;
}
export interface StringCaseOptions {
    preserveConsecutiveUppercase?: boolean;
    separator?: string;
}
export interface StringValidationOptions {
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    allowEmpty?: boolean;
}
/**
 * String utilities class
 */
export declare class StringUtils {
    /**
     * Check if string is empty or whitespace
     */
    static isEmpty(str: string): boolean;
    /**
     * Check if string is not empty
     */
    static isNotEmpty(str: string): boolean;
    /**
     * Truncate string to specified length
     */
    static truncate(str: string, options?: StringFormatOptions): string;
    /**
     * Capitalize first letter
     */
    static capitalize(str: string): string;
    /**
     * Capitalize each word
     */
    static capitalizeWords(str: string): string;
    /**
     * Convert to camelCase
     */
    static toCamelCase(str: string, options?: StringCaseOptions): string;
    /**
     * Convert to PascalCase
     */
    static toPascalCase(str: string, options?: StringCaseOptions): string;
    /**
     * Convert to snake_case
     */
    static toSnakeCase(str: string, options?: StringCaseOptions): string;
    /**
     * Convert to kebab-case
     */
    static toKebabCase(str: string): string;
    /**
     * Convert to CONSTANT_CASE
     */
    static toConstantCase(str: string): string;
    /**
     * Convert to dot.case
     */
    static toDotCase(str: string): string;
    /**
     * Slugify string for URLs
     */
    static slugify(str: string): string;
    /**
     * Remove accents and diacritics
     */
    static removeAccents(str: string): string;
    /**
     * Escape HTML characters
     */
    static escapeHtml(str: string): string;
    /**
     * Unescape HTML characters
     */
    static unescapeHtml(str: string): string;
    /**
     * Escape regular expression characters
     */
    static escapeRegex(str: string): string;
    /**
     * Pad string to specified length
     */
    static pad(str: string, length: number, padChar?: string, direction?: 'left' | 'right' | 'both'): string;
    /**
     * Repeat string n times
     */
    static repeat(str: string, count: number): string;
    /**
     * Reverse string
     */
    static reverse(str: string): string;
    /**
     * Count occurrences of substring
     */
    static count(str: string, substring: string): number;
    /**
     * Replace all occurrences
     */
    static replaceAll(str: string, search: string | RegExp, replacement: string): string;
    /**
     * Insert string at position
     */
    static insert(str: string, index: number, insertion: string): string;
    /**
     * Remove substring at position
     */
    static remove(str: string, start: number, length: number): string;
    /**
     * Extract substring between delimiters
     */
    static between(str: string, start: string, end: string, inclusive?: boolean): string | null;
    /**
     * Extract all substrings between delimiters
     */
    static betweenAll(str: string, start: string, end: string, inclusive?: boolean): string[];
    /**
     * Check if string contains any of the given substrings
     */
    static containsAny(str: string, substrings: string[]): boolean;
    /**
     * Check if string contains all of the given substrings
     */
    static containsAll(str: string, substrings: string[]): boolean;
    /**
     * Check if string starts with any of the given prefixes
     */
    static startsWithAny(str: string, prefixes: string[]): boolean;
    /**
     * Check if string ends with any of the given suffixes
     */
    static endsWithAny(str: string, suffixes: string[]): boolean;
    /**
     * Get common prefix of strings
     */
    static commonPrefix(strings: string[]): string;
    /**
     * Get common suffix of strings
     */
    static commonSuffix(strings: string[]): string;
    /**
     * Calculate Levenshtein distance between two strings
     */
    static levenshteinDistance(str1: string, str2: string): number;
    /**
     * Calculate string similarity (0-1)
     */
    static similarity(str1: string, str2: string): number;
    /**
     * Generate random string
     */
    static random(length: number, charset?: string): string;
    /**
     * Validate string against options
     */
    static validate(str: string, options?: StringValidationOptions): {
        valid: boolean;
        errors: string[];
    };
    /**
     * Format string with placeholders
     */
    static format(template: string, values: Record<string, any>): string;
    /**
     * Parse template string
     */
    static parseTemplate(template: string): string[];
    /**
     * Word wrap text
     */
    static wordWrap(str: string, width: number, breakChar?: string): string;
    /**
     * Extract words from string
     */
    static extractWords(str: string): string[];
    /**
     * Count words in string
     */
    static wordCount(str: string): number;
    /**
     * Get character frequency
     */
    static charFrequency(str: string): Record<string, number>;
    /**
     * Check if string is palindrome
     */
    static isPalindrome(str: string, ignoreCase?: boolean, ignoreSpaces?: boolean): boolean;
    /**
     * Check if string is anagram of another
     */
    static isAnagram(str1: string, str2: string): boolean;
}
export declare const isEmpty: typeof StringUtils.isEmpty, isNotEmpty: typeof StringUtils.isNotEmpty, truncate: typeof StringUtils.truncate, capitalize: typeof StringUtils.capitalize, capitalizeWords: typeof StringUtils.capitalizeWords, toCamelCase: typeof StringUtils.toCamelCase, toPascalCase: typeof StringUtils.toPascalCase, toSnakeCase: typeof StringUtils.toSnakeCase, toKebabCase: typeof StringUtils.toKebabCase, toConstantCase: typeof StringUtils.toConstantCase, toDotCase: typeof StringUtils.toDotCase, slugify: typeof StringUtils.slugify, removeAccents: typeof StringUtils.removeAccents, escapeHtml: typeof StringUtils.escapeHtml, unescapeHtml: typeof StringUtils.unescapeHtml, escapeRegex: typeof StringUtils.escapeRegex, pad: typeof StringUtils.pad, repeat: typeof StringUtils.repeat, reverse: typeof StringUtils.reverse, count: typeof StringUtils.count, replaceAll: typeof StringUtils.replaceAll, insert: typeof StringUtils.insert, remove: typeof StringUtils.remove, between: typeof StringUtils.between, betweenAll: typeof StringUtils.betweenAll, containsAny: typeof StringUtils.containsAny, containsAll: typeof StringUtils.containsAll, startsWithAny: typeof StringUtils.startsWithAny, endsWithAny: typeof StringUtils.endsWithAny, commonPrefix: typeof StringUtils.commonPrefix, commonSuffix: typeof StringUtils.commonSuffix, levenshteinDistance: typeof StringUtils.levenshteinDistance, similarity: typeof StringUtils.similarity, random: typeof StringUtils.random, validate: typeof StringUtils.validate, format: typeof StringUtils.format, parseTemplate: typeof StringUtils.parseTemplate, wordWrap: typeof StringUtils.wordWrap, extractWords: typeof StringUtils.extractWords, wordCount: typeof StringUtils.wordCount, charFrequency: typeof StringUtils.charFrequency, isPalindrome: typeof StringUtils.isPalindrome, isAnagram: typeof StringUtils.isAnagram;
//# sourceMappingURL=string-utils.d.ts.map