"use strict";
/**
 * String utilities for text manipulation and formatting
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAnagram = exports.isPalindrome = exports.charFrequency = exports.wordCount = exports.extractWords = exports.wordWrap = exports.parseTemplate = exports.format = exports.validate = exports.random = exports.similarity = exports.levenshteinDistance = exports.commonSuffix = exports.commonPrefix = exports.endsWithAny = exports.startsWithAny = exports.containsAll = exports.containsAny = exports.betweenAll = exports.between = exports.remove = exports.insert = exports.replaceAll = exports.count = exports.reverse = exports.repeat = exports.pad = exports.escapeRegex = exports.unescapeHtml = exports.escapeHtml = exports.removeAccents = exports.slugify = exports.toDotCase = exports.toConstantCase = exports.toKebabCase = exports.toSnakeCase = exports.toPascalCase = exports.toCamelCase = exports.capitalizeWords = exports.capitalize = exports.truncate = exports.isNotEmpty = exports.isEmpty = exports.StringUtils = void 0;
/**
 * String utilities class
 */
class StringUtils {
    /**
     * Check if string is empty or whitespace
     */
    static isEmpty(str) {
        return !str || str.trim().length === 0;
    }
    /**
     * Check if string is not empty
     */
    static isNotEmpty(str) {
        return !this.isEmpty(str);
    }
    /**
     * Truncate string to specified length
     */
    static truncate(str, options = {}) {
        const { maxLength = 100, ellipsis = '...', preserveWords = true, } = options;
        if (str.length <= maxLength) {
            return str;
        }
        if (!preserveWords) {
            return str.slice(0, maxLength - ellipsis.length) + ellipsis;
        }
        const truncated = str.slice(0, maxLength - ellipsis.length);
        const lastSpace = truncated.lastIndexOf(' ');
        if (lastSpace > 0) {
            return truncated.slice(0, lastSpace) + ellipsis;
        }
        return truncated + ellipsis;
    }
    /**
     * Capitalize first letter
     */
    static capitalize(str) {
        if (!str)
            return str;
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }
    /**
     * Capitalize each word
     */
    static capitalizeWords(str) {
        return str.replace(/\b\w/g, char => char.toUpperCase());
    }
    /**
     * Convert to camelCase
     */
    static toCamelCase(str, options = {}) {
        const { preserveConsecutiveUppercase = false } = options;
        let result = str
            .replace(/[^a-zA-Z0-9]+(.)/g, (_, char) => char.toUpperCase())
            .replace(/^[A-Z]/, char => char.toLowerCase());
        if (!preserveConsecutiveUppercase) {
            result = result.replace(/([A-Z]+)([A-Z][a-z])/g, '$1$2');
        }
        return result;
    }
    /**
     * Convert to PascalCase
     */
    static toPascalCase(str, options = {}) {
        const camelCase = this.toCamelCase(str, options);
        return camelCase.charAt(0).toUpperCase() + camelCase.slice(1);
    }
    /**
     * Convert to snake_case
     */
    static toSnakeCase(str, options = {}) {
        const { separator = '_' } = options;
        return str
            .replace(/([A-Z]+)([A-Z][a-z])/g, `$1${separator}$2`)
            .replace(/([a-z\d])([A-Z])/g, `$1${separator}$2`)
            .replace(/[^a-zA-Z0-9]+/g, separator)
            .toLowerCase()
            .replace(new RegExp(`^${separator}+|${separator}+$`, 'g'), '')
            .replace(new RegExp(`${separator}+`, 'g'), separator);
    }
    /**
     * Convert to kebab-case
     */
    static toKebabCase(str) {
        return this.toSnakeCase(str, { separator: '-' });
    }
    /**
     * Convert to CONSTANT_CASE
     */
    static toConstantCase(str) {
        return this.toSnakeCase(str).toUpperCase();
    }
    /**
     * Convert to dot.case
     */
    static toDotCase(str) {
        return this.toSnakeCase(str, { separator: '.' });
    }
    /**
     * Slugify string for URLs
     */
    static slugify(str) {
        return str
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '') // Remove special characters
            .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
            .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
    }
    /**
     * Remove accents and diacritics
     */
    static removeAccents(str) {
        return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }
    /**
     * Escape HTML characters
     */
    static escapeHtml(str) {
        const htmlEscapes = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;',
        };
        return str.replace(/[&<>"']/g, char => htmlEscapes[char]);
    }
    /**
     * Unescape HTML characters
     */
    static unescapeHtml(str) {
        const htmlUnescapes = {
            '&amp;': '&',
            '&lt;': '<',
            '&gt;': '>',
            '&quot;': '"',
            '&#39;': "'",
        };
        return str.replace(/&(?:amp|lt|gt|quot|#39);/g, entity => htmlUnescapes[entity]);
    }
    /**
     * Escape regular expression characters
     */
    static escapeRegex(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    /**
     * Pad string to specified length
     */
    static pad(str, length, padChar = ' ', direction = 'right') {
        const padLength = Math.max(0, length - str.length);
        switch (direction) {
            case 'left':
                return padChar.repeat(padLength) + str;
            case 'both':
                const leftPad = Math.floor(padLength / 2);
                const rightPad = padLength - leftPad;
                return padChar.repeat(leftPad) + str + padChar.repeat(rightPad);
            default:
                return str + padChar.repeat(padLength);
        }
    }
    /**
     * Repeat string n times
     */
    static repeat(str, count) {
        return str.repeat(Math.max(0, count));
    }
    /**
     * Reverse string
     */
    static reverse(str) {
        return str.split('').reverse().join('');
    }
    /**
     * Count occurrences of substring
     */
    static count(str, substring) {
        if (!substring)
            return 0;
        let count = 0;
        let position = 0;
        while ((position = str.indexOf(substring, position)) !== -1) {
            count++;
            position += substring.length;
        }
        return count;
    }
    /**
     * Replace all occurrences
     */
    static replaceAll(str, search, replacement) {
        if (typeof search === 'string') {
            return str.split(search).join(replacement);
        }
        return str.replace(search, replacement);
    }
    /**
     * Insert string at position
     */
    static insert(str, index, insertion) {
        const actualIndex = Math.max(0, Math.min(index, str.length));
        return str.slice(0, actualIndex) + insertion + str.slice(actualIndex);
    }
    /**
     * Remove substring at position
     */
    static remove(str, start, length) {
        const actualStart = Math.max(0, start);
        const actualEnd = Math.min(str.length, actualStart + length);
        return str.slice(0, actualStart) + str.slice(actualEnd);
    }
    /**
     * Extract substring between delimiters
     */
    static between(str, start, end, inclusive = false) {
        const startIndex = str.indexOf(start);
        if (startIndex === -1)
            return null;
        const searchStart = inclusive ? startIndex : startIndex + start.length;
        const endIndex = str.indexOf(end, searchStart);
        if (endIndex === -1)
            return null;
        const searchEnd = inclusive ? endIndex + end.length : endIndex;
        return str.slice(searchStart, searchEnd);
    }
    /**
     * Extract all substrings between delimiters
     */
    static betweenAll(str, start, end, inclusive = false) {
        const results = [];
        let searchStr = str;
        let offset = 0;
        while (true) {
            const result = this.between(searchStr, start, end, inclusive);
            if (result === null)
                break;
            results.push(result);
            const startIndex = searchStr.indexOf(start);
            const endIndex = searchStr.indexOf(end, startIndex + start.length);
            offset += endIndex + end.length;
            searchStr = str.slice(offset);
        }
        return results;
    }
    /**
     * Check if string contains any of the given substrings
     */
    static containsAny(str, substrings) {
        return substrings.some(substring => str.includes(substring));
    }
    /**
     * Check if string contains all of the given substrings
     */
    static containsAll(str, substrings) {
        return substrings.every(substring => str.includes(substring));
    }
    /**
     * Check if string starts with any of the given prefixes
     */
    static startsWithAny(str, prefixes) {
        return prefixes.some(prefix => str.startsWith(prefix));
    }
    /**
     * Check if string ends with any of the given suffixes
     */
    static endsWithAny(str, suffixes) {
        return suffixes.some(suffix => str.endsWith(suffix));
    }
    /**
     * Get common prefix of strings
     */
    static commonPrefix(strings) {
        if (strings.length === 0)
            return '';
        if (strings.length === 1)
            return strings[0];
        let prefix = '';
        const firstString = strings[0];
        for (let i = 0; i < firstString.length; i++) {
            const char = firstString[i];
            if (strings.every(str => str[i] === char)) {
                prefix += char;
            }
            else {
                break;
            }
        }
        return prefix;
    }
    /**
     * Get common suffix of strings
     */
    static commonSuffix(strings) {
        if (strings.length === 0)
            return '';
        if (strings.length === 1)
            return strings[0];
        const reversedStrings = strings.map(str => this.reverse(str));
        const reversedPrefix = this.commonPrefix(reversedStrings);
        return this.reverse(reversedPrefix);
    }
    /**
     * Calculate Levenshtein distance between two strings
     */
    static levenshteinDistance(str1, str2) {
        const matrix = [];
        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }
        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }
        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                }
                else {
                    matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, // substitution
                    matrix[i][j - 1] + 1, // insertion
                    matrix[i - 1][j] + 1 // deletion
                    );
                }
            }
        }
        return matrix[str2.length][str1.length];
    }
    /**
     * Calculate string similarity (0-1)
     */
    static similarity(str1, str2) {
        const maxLength = Math.max(str1.length, str2.length);
        if (maxLength === 0)
            return 1;
        const distance = this.levenshteinDistance(str1, str2);
        return (maxLength - distance) / maxLength;
    }
    /**
     * Generate random string
     */
    static random(length, charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789') {
        let result = '';
        for (let i = 0; i < length; i++) {
            result += charset.charAt(Math.floor(Math.random() * charset.length));
        }
        return result;
    }
    /**
     * Validate string against options
     */
    static validate(str, options = {}) {
        const { minLength, maxLength, pattern, allowEmpty = true, } = options;
        const errors = [];
        if (!allowEmpty && this.isEmpty(str)) {
            errors.push('String cannot be empty');
        }
        if (minLength !== undefined && str.length < minLength) {
            errors.push(`String must be at least ${minLength} characters long`);
        }
        if (maxLength !== undefined && str.length > maxLength) {
            errors.push(`String must be at most ${maxLength} characters long`);
        }
        if (pattern && !pattern.test(str)) {
            errors.push('String does not match required pattern');
        }
        return {
            valid: errors.length === 0,
            errors,
        };
    }
    /**
     * Format string with placeholders
     */
    static format(template, values) {
        return template.replace(/\{([^}]+)\}/g, (match, key) => {
            const value = values[key];
            return value !== undefined ? String(value) : match;
        });
    }
    /**
     * Parse template string
     */
    static parseTemplate(template) {
        const matches = template.match(/\{([^}]+)\}/g);
        return matches ? matches.map(match => match.slice(1, -1)) : [];
    }
    /**
     * Word wrap text
     */
    static wordWrap(str, width, breakChar = '\n') {
        if (width <= 0)
            return str;
        const words = str.split(' ');
        const lines = [];
        let currentLine = '';
        for (const word of words) {
            if (currentLine.length + word.length + 1 <= width) {
                currentLine += (currentLine ? ' ' : '') + word;
            }
            else {
                if (currentLine) {
                    lines.push(currentLine);
                }
                currentLine = word;
            }
        }
        if (currentLine) {
            lines.push(currentLine);
        }
        return lines.join(breakChar);
    }
    /**
     * Extract words from string
     */
    static extractWords(str) {
        return str.match(/\b\w+\b/g) || [];
    }
    /**
     * Count words in string
     */
    static wordCount(str) {
        return this.extractWords(str).length;
    }
    /**
     * Get character frequency
     */
    static charFrequency(str) {
        const frequency = {};
        for (const char of str) {
            frequency[char] = (frequency[char] || 0) + 1;
        }
        return frequency;
    }
    /**
     * Check if string is palindrome
     */
    static isPalindrome(str, ignoreCase = true, ignoreSpaces = true) {
        let processed = str;
        if (ignoreCase) {
            processed = processed.toLowerCase();
        }
        if (ignoreSpaces) {
            processed = processed.replace(/\s/g, '');
        }
        return processed === this.reverse(processed);
    }
    /**
     * Check if string is anagram of another
     */
    static isAnagram(str1, str2) {
        const normalize = (str) => str.toLowerCase().replace(/\s/g, '').split('').sort().join('');
        return normalize(str1) === normalize(str2);
    }
}
exports.StringUtils = StringUtils;
// Export commonly used functions
exports.isEmpty = StringUtils.isEmpty, exports.isNotEmpty = StringUtils.isNotEmpty, exports.truncate = StringUtils.truncate, exports.capitalize = StringUtils.capitalize, exports.capitalizeWords = StringUtils.capitalizeWords, exports.toCamelCase = StringUtils.toCamelCase, exports.toPascalCase = StringUtils.toPascalCase, exports.toSnakeCase = StringUtils.toSnakeCase, exports.toKebabCase = StringUtils.toKebabCase, exports.toConstantCase = StringUtils.toConstantCase, exports.toDotCase = StringUtils.toDotCase, exports.slugify = StringUtils.slugify, exports.removeAccents = StringUtils.removeAccents, exports.escapeHtml = StringUtils.escapeHtml, exports.unescapeHtml = StringUtils.unescapeHtml, exports.escapeRegex = StringUtils.escapeRegex, exports.pad = StringUtils.pad, exports.repeat = StringUtils.repeat, exports.reverse = StringUtils.reverse, exports.count = StringUtils.count, exports.replaceAll = StringUtils.replaceAll, exports.insert = StringUtils.insert, exports.remove = StringUtils.remove, exports.between = StringUtils.between, exports.betweenAll = StringUtils.betweenAll, exports.containsAny = StringUtils.containsAny, exports.containsAll = StringUtils.containsAll, exports.startsWithAny = StringUtils.startsWithAny, exports.endsWithAny = StringUtils.endsWithAny, exports.commonPrefix = StringUtils.commonPrefix, exports.commonSuffix = StringUtils.commonSuffix, exports.levenshteinDistance = StringUtils.levenshteinDistance, exports.similarity = StringUtils.similarity, exports.random = StringUtils.random, exports.validate = StringUtils.validate, exports.format = StringUtils.format, exports.parseTemplate = StringUtils.parseTemplate, exports.wordWrap = StringUtils.wordWrap, exports.extractWords = StringUtils.extractWords, exports.wordCount = StringUtils.wordCount, exports.charFrequency = StringUtils.charFrequency, exports.isPalindrome = StringUtils.isPalindrome, exports.isAnagram = StringUtils.isAnagram;
//# sourceMappingURL=string-utils.js.map