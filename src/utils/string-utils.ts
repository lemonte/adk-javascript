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
export class StringUtils {
  /**
   * Check if string is empty or whitespace
   */
  static isEmpty(str: string): boolean {
    return !str || str.trim().length === 0;
  }

  /**
   * Check if string is not empty
   */
  static isNotEmpty(str: string): boolean {
    return !this.isEmpty(str);
  }

  /**
   * Truncate string to specified length
   */
  static truncate(
    str: string,
    options: StringFormatOptions = {}
  ): string {
    const {
      maxLength = 100,
      ellipsis = '...',
      preserveWords = true,
    } = options;

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
  static capitalize(str: string): string {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  /**
   * Capitalize each word
   */
  static capitalizeWords(str: string): string {
    return str.replace(/\b\w/g, char => char.toUpperCase());
  }

  /**
   * Convert to camelCase
   */
  static toCamelCase(
    str: string,
    options: StringCaseOptions = {}
  ): string {
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
  static toPascalCase(
    str: string,
    options: StringCaseOptions = {}
  ): string {
    const camelCase = this.toCamelCase(str, options);
    return camelCase.charAt(0).toUpperCase() + camelCase.slice(1);
  }

  /**
   * Convert to snake_case
   */
  static toSnakeCase(
    str: string,
    options: StringCaseOptions = {}
  ): string {
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
  static toKebabCase(str: string): string {
    return this.toSnakeCase(str, { separator: '-' });
  }

  /**
   * Convert to CONSTANT_CASE
   */
  static toConstantCase(str: string): string {
    return this.toSnakeCase(str).toUpperCase();
  }

  /**
   * Convert to dot.case
   */
  static toDotCase(str: string): string {
    return this.toSnakeCase(str, { separator: '.' });
  }

  /**
   * Slugify string for URLs
   */
  static slugify(str: string): string {
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
  static removeAccents(str: string): string {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  /**
   * Escape HTML characters
   */
  static escapeHtml(str: string): string {
    const htmlEscapes: Record<string, string> = {
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
  static unescapeHtml(str: string): string {
    const htmlUnescapes: Record<string, string> = {
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
  static escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Pad string to specified length
   */
  static pad(
    str: string,
    length: number,
    padChar = ' ',
    direction: 'left' | 'right' | 'both' = 'right'
  ): string {
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
  static repeat(str: string, count: number): string {
    return str.repeat(Math.max(0, count));
  }

  /**
   * Reverse string
   */
  static reverse(str: string): string {
    return str.split('').reverse().join('');
  }

  /**
   * Count occurrences of substring
   */
  static count(str: string, substring: string): number {
    if (!substring) return 0;
    
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
  static replaceAll(
    str: string,
    search: string | RegExp,
    replacement: string
  ): string {
    if (typeof search === 'string') {
      return str.split(search).join(replacement);
    }
    return str.replace(search, replacement);
  }

  /**
   * Insert string at position
   */
  static insert(str: string, index: number, insertion: string): string {
    const actualIndex = Math.max(0, Math.min(index, str.length));
    return str.slice(0, actualIndex) + insertion + str.slice(actualIndex);
  }

  /**
   * Remove substring at position
   */
  static remove(str: string, start: number, length: number): string {
    const actualStart = Math.max(0, start);
    const actualEnd = Math.min(str.length, actualStart + length);
    return str.slice(0, actualStart) + str.slice(actualEnd);
  }

  /**
   * Extract substring between delimiters
   */
  static between(
    str: string,
    start: string,
    end: string,
    inclusive = false
  ): string | null {
    const startIndex = str.indexOf(start);
    if (startIndex === -1) return null;
    
    const searchStart = inclusive ? startIndex : startIndex + start.length;
    const endIndex = str.indexOf(end, searchStart);
    if (endIndex === -1) return null;
    
    const searchEnd = inclusive ? endIndex + end.length : endIndex;
    return str.slice(searchStart, searchEnd);
  }

  /**
   * Extract all substrings between delimiters
   */
  static betweenAll(
    str: string,
    start: string,
    end: string,
    inclusive = false
  ): string[] {
    const results: string[] = [];
    let searchStr = str;
    let offset = 0;
    
    while (true) {
      const result = this.between(searchStr, start, end, inclusive);
      if (result === null) break;
      
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
  static containsAny(str: string, substrings: string[]): boolean {
    return substrings.some(substring => str.includes(substring));
  }

  /**
   * Check if string contains all of the given substrings
   */
  static containsAll(str: string, substrings: string[]): boolean {
    return substrings.every(substring => str.includes(substring));
  }

  /**
   * Check if string starts with any of the given prefixes
   */
  static startsWithAny(str: string, prefixes: string[]): boolean {
    return prefixes.some(prefix => str.startsWith(prefix));
  }

  /**
   * Check if string ends with any of the given suffixes
   */
  static endsWithAny(str: string, suffixes: string[]): boolean {
    return suffixes.some(suffix => str.endsWith(suffix));
  }

  /**
   * Get common prefix of strings
   */
  static commonPrefix(strings: string[]): string {
    if (strings.length === 0) return '';
    if (strings.length === 1) return strings[0];
    
    let prefix = '';
    const firstString = strings[0];
    
    for (let i = 0; i < firstString.length; i++) {
      const char = firstString[i];
      
      if (strings.every(str => str[i] === char)) {
        prefix += char;
      } else {
        break;
      }
    }
    
    return prefix;
  }

  /**
   * Get common suffix of strings
   */
  static commonSuffix(strings: string[]): string {
    if (strings.length === 0) return '';
    if (strings.length === 1) return strings[0];
    
    const reversedStrings = strings.map(str => this.reverse(str));
    const reversedPrefix = this.commonPrefix(reversedStrings);
    
    return this.reverse(reversedPrefix);
  }

  /**
   * Calculate Levenshtein distance between two strings
   */
  static levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = [];
    
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
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1,     // insertion
            matrix[i - 1][j] + 1      // deletion
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  /**
   * Calculate string similarity (0-1)
   */
  static similarity(str1: string, str2: string): number {
    const maxLength = Math.max(str1.length, str2.length);
    if (maxLength === 0) return 1;
    
    const distance = this.levenshteinDistance(str1, str2);
    return (maxLength - distance) / maxLength;
  }

  /**
   * Generate random string
   */
  static random(
    length: number,
    charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  ): string {
    let result = '';
    for (let i = 0; i < length; i++) {
      result += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return result;
  }

  /**
   * Validate string against options
   */
  static validate(
    str: string,
    options: StringValidationOptions = {}
  ): { valid: boolean; errors: string[] } {
    const {
      minLength,
      maxLength,
      pattern,
      allowEmpty = true,
    } = options;
    
    const errors: string[] = [];
    
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
  static format(template: string, values: Record<string, any>): string {
    return template.replace(/\{([^}]+)\}/g, (match, key) => {
      const value = values[key];
      return value !== undefined ? String(value) : match;
    });
  }

  /**
   * Parse template string
   */
  static parseTemplate(template: string): string[] {
    const matches = template.match(/\{([^}]+)\}/g);
    return matches ? matches.map(match => match.slice(1, -1)) : [];
  }

  /**
   * Word wrap text
   */
  static wordWrap(str: string, width: number, breakChar = '\n'): string {
    if (width <= 0) return str;
    
    const words = str.split(' ');
    const lines: string[] = [];
    let currentLine = '';
    
    for (const word of words) {
      if (currentLine.length + word.length + 1 <= width) {
        currentLine += (currentLine ? ' ' : '') + word;
      } else {
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
  static extractWords(str: string): string[] {
    return str.match(/\b\w+\b/g) || [];
  }

  /**
   * Count words in string
   */
  static wordCount(str: string): number {
    return this.extractWords(str).length;
  }

  /**
   * Get character frequency
   */
  static charFrequency(str: string): Record<string, number> {
    const frequency: Record<string, number> = {};
    
    for (const char of str) {
      frequency[char] = (frequency[char] || 0) + 1;
    }
    
    return frequency;
  }

  /**
   * Check if string is palindrome
   */
  static isPalindrome(str: string, ignoreCase = true, ignoreSpaces = true): boolean {
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
  static isAnagram(str1: string, str2: string): boolean {
    const normalize = (str: string) => str.toLowerCase().replace(/\s/g, '').split('').sort().join('');
    return normalize(str1) === normalize(str2);
  }
}

// Export commonly used functions
export const {
  isEmpty,
  isNotEmpty,
  truncate,
  capitalize,
  capitalizeWords,
  toCamelCase,
  toPascalCase,
  toSnakeCase,
  toKebabCase,
  toConstantCase,
  toDotCase,
  slugify,
  removeAccents,
  escapeHtml,
  unescapeHtml,
  escapeRegex,
  pad,
  repeat,
  reverse,
  count,
  replaceAll,
  insert,
  remove,
  between,
  betweenAll,
  containsAny,
  containsAll,
  startsWithAny,
  endsWithAny,
  commonPrefix,
  commonSuffix,
  levenshteinDistance,
  similarity,
  random,
  validate,
  format,
  parseTemplate,
  wordWrap,
  extractWords,
  wordCount,
  charFrequency,
  isPalindrome,
  isAnagram,
} = StringUtils;