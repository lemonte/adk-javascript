/**
 * URL utilities for comprehensive URL manipulation and parsing
 */

// Declare FileReader for environments where it might not be available
declare global {
  interface ProgressEvent<T = EventTarget> {
    lengthComputable: boolean;
    loaded: number;
    total: number;
    target: T | null;
  }

  interface FileReader {
    new(): FileReader;
    readAsDataURL(blob: Blob): void;
    result: string | null;
    onload: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null;
    onerror: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null;
  }
}
var FileReader: {
  prototype: FileReader;
  new(): FileReader;
};


export interface ParsedUrl {
  protocol: string;
  hostname: string;
  port: string;
  pathname: string;
  search: string;
  hash: string;
  username: string;
  password: string;
  origin: string;
  href: string;
  searchParams: URLSearchParams;
}

export interface UrlBuildOptions {
  protocol?: string;
  hostname?: string;
  port?: string | number;
  pathname?: string;
  search?: string | Record<string, any> | URLSearchParams;
  hash?: string;
  username?: string;
  password?: string;
}

export interface QueryStringOptions {
  arrayFormat?: 'bracket' | 'index' | 'comma' | 'separator' | 'bracket-separator';
  arrayFormatSeparator?: string;
  encode?: boolean;
  encodeValuesOnly?: boolean;
  sort?: boolean | ((a: string, b: string) => number);
  skipNulls?: boolean;
  skipEmptyString?: boolean;
  strictNullHandling?: boolean;
}

export interface UrlValidationOptions {
  protocols?: string[];
  requireProtocol?: boolean;
  requireTld?: boolean;
  allowDataUrl?: boolean;
  allowFtp?: boolean;
  allowLocalhost?: boolean;
  allowIp?: boolean;
  allowUnicode?: boolean;
}

export interface UrlNormalizationOptions {
  stripWWW?: boolean;
  stripTrailingSlash?: boolean;
  stripDefaultPort?: boolean;
  sortQueryParameters?: boolean;
  removeEmptyParameters?: boolean;
  lowercaseHostname?: boolean;
  lowercaseProtocol?: boolean;
  removeFragment?: boolean;
  removeDirectoryIndex?: boolean;
  directoryIndexes?: string[];
}

export interface UrlShortenerOptions {
  length?: number;
  alphabet?: string;
  prefix?: string;
}

/**
 * URL utilities class
 */
export class UrlUtils {
  // Common URL patterns
  private static readonly URL_REGEX = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;
  private static readonly DOMAIN_REGEX = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/;
  private static readonly IPV4_REGEX = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  private static readonly IPV6_REGEX = /^\[?([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}\]?$|^\[?::1\]?$|^\[?::\]?$/;

  // Default ports for common protocols
  private static readonly DEFAULT_PORTS: Record<string, number> = {
    'http:': 80,
    'https:': 443,
    'ftp:': 21,
    'ftps:': 990,
    'ssh:': 22,
    'telnet:': 23,
    'smtp:': 25,
    'dns:': 53,
    'pop3:': 110,
    'imap:': 143,
    'ldap:': 389,
    'ldaps:': 636,
  };

  /**
   * Parse URL into components
   */
  static parse(url: string): ParsedUrl | null {
    try {
      const urlObj = new URL(url);

      return {
        protocol: urlObj.protocol,
        hostname: urlObj.hostname,
        port: urlObj.port,
        pathname: urlObj.pathname,
        search: urlObj.search,
        hash: urlObj.hash,
        username: urlObj.username,
        password: urlObj.password,
        origin: urlObj.origin,
        href: urlObj.href,
        searchParams: urlObj.searchParams,
      };
    } catch {
      return null;
    }
  }

  /**
   * Build URL from components
   */
  static build(options: UrlBuildOptions): string {
    const {
      protocol = 'https:',
      hostname = 'localhost',
      port,
      pathname = '/',
      search,
      hash,
      username,
      password
    } = options;

    let url = `${protocol}//${hostname}`;

    // Add authentication
    if (username) {
      const auth = password ? `${username}:${password}` : username;
      url = `${protocol}//${auth}@${hostname}`;
    }

    // Add port
    if (port && port !== this.DEFAULT_PORTS[protocol]) {
      url += `:${port}`;
    }

    // Add pathname
    if (pathname && !pathname.startsWith('/')) {
      url += '/';
    }
    url += pathname || '';

    // Add search parameters
    if (search) {
      if (typeof search === 'string') {
        url += search.startsWith('?') ? search : `?${search}`;
      } else if (search instanceof URLSearchParams) {
        const searchString = search.toString();
        if (searchString) {
          url += `?${searchString}`;
        }
      } else {
        const params = this.buildQueryString(search);
        if (params) {
          url += `?${params}`;
        }
      }
    }

    // Add hash
    if (hash) {
      url += hash.startsWith('#') ? hash : `#${hash}`;
    }

    return url;
  }

  /**
   * Validate URL
   */
  static isValid(url: string, options: UrlValidationOptions = {}): boolean {
    const {
      protocols = ['http', 'https'],
      requireProtocol = true,
      requireTld = true,
      allowDataUrl = false,
      allowFtp = false,
      allowLocalhost = true,
      allowIp = true,
      allowUnicode = false
    } = options;

    if (typeof url !== 'string' || !url.trim()) {
      return false;
    }

    // Handle data URLs
    if (url.startsWith('data:')) {
      return allowDataUrl;
    }

    try {
      const urlObj = new URL(url);

      // Check protocol
      const protocol = urlObj.protocol.slice(0, -1); // Remove trailing colon
      const allowedProtocols = [...protocols];

      if (allowFtp) {
        allowedProtocols.push('ftp', 'ftps');
      }

      if (requireProtocol && !allowedProtocols.includes(protocol)) {
        return false;
      }

      // Check hostname
      const hostname = urlObj.hostname;

      if (!hostname) {
        return false;
      }

      // Check for localhost
      if (!allowLocalhost && (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1')) {
        return false;
      }

      // Check for IP addresses
      if (!allowIp && (this.IPV4_REGEX.test(hostname) || this.IPV6_REGEX.test(hostname))) {
        return false;
      }

      // Check for TLD
      if (requireTld && !hostname.includes('.') && hostname !== 'localhost') {
        return false;
      }

      // Check for Unicode characters
      if (!allowUnicode && /[^\x00-\x7F]/.test(url)) {
        return false;
      }

      return true;
    } catch {
      return false;
    }
  }

  /**
   * Normalize URL
   */
  static normalize(url: string, options: UrlNormalizationOptions = {}): string {
    const {
      stripWWW = true,
      stripTrailingSlash = true,
      stripDefaultPort = true,
      sortQueryParameters = true,
      removeEmptyParameters = true,
      lowercaseHostname = true,
      lowercaseProtocol = true,
      removeFragment = false,
      removeDirectoryIndex = true,
      directoryIndexes = ['index.html', 'index.htm', 'index.php', 'default.html']
    } = options;

    try {
      const urlObj = new URL(url);

      // Lowercase protocol
      if (lowercaseProtocol) {
        urlObj.protocol = urlObj.protocol.toLowerCase();
      }

      // Lowercase hostname
      if (lowercaseHostname) {
        urlObj.hostname = urlObj.hostname.toLowerCase();
      }

      // Strip www
      if (stripWWW && urlObj.hostname.startsWith('www.')) {
        urlObj.hostname = urlObj.hostname.slice(4);
      }

      // Strip default port
      if (stripDefaultPort && urlObj.port === this.DEFAULT_PORTS[urlObj.protocol]?.toString()) {
        urlObj.port = '';
      }

      // Handle pathname
      let pathname = urlObj.pathname;

      // Remove directory index
      if (removeDirectoryIndex) {
        for (const index of directoryIndexes) {
          if (pathname.endsWith(`/${index}`)) {
            pathname = pathname.slice(0, -index.length);
            break;
          }
        }
      }

      // Strip trailing slash (except for root)
      if (stripTrailingSlash && pathname.length > 1 && pathname.endsWith('/')) {
        pathname = pathname.slice(0, -1);
      }

      urlObj.pathname = pathname;

      // Handle search parameters
      if (urlObj.search) {
        const params = new URLSearchParams(urlObj.search);

        // Remove empty parameters
        if (removeEmptyParameters) {
          for (const [key, value] of params.entries()) {
            if (value === '') {
              params.delete(key);
            }
          }
        }

        // Sort parameters
        if (sortQueryParameters) {
          const sortedParams = new URLSearchParams();
          const keys = Array.from(params.keys()).sort();

          for (const key of keys) {
            const values = params.getAll(key);
            for (const value of values) {
              sortedParams.append(key, value);
            }
          }

          urlObj.search = sortedParams.toString();
        } else {
          urlObj.search = params.toString();
        }
      }

      // Remove fragment
      if (removeFragment) {
        urlObj.hash = '';
      }

      return urlObj.toString();
    } catch {
      return url;
    }
  }

  /**
   * Join URL paths
   */
  static join(base: string, ...paths: string[]): string {
    try {
      let url = new URL(base);

      for (const path of paths) {
        if (!path) continue;

        const cleanPath = path.replace(/^\/+/, '').replace(/\/+$/, '');
        if (cleanPath) {
          url.pathname = url.pathname.replace(/\/+$/, '') + '/' + cleanPath;
        }
      }

      return url.toString();
    } catch {
      // Fallback for relative paths
      const parts = [base, ...paths].filter(Boolean);
      return parts.join('/').replace(/\/+/g, '/');
    }
  }

  /**
   * Get relative URL
   */
  static relative(from: string, to: string): string {
    try {
      const fromUrl = new URL(from);
      const toUrl = new URL(to);

      // If different origins, return absolute URL
      if (fromUrl.origin !== toUrl.origin) {
        return to;
      }

      // Return relative path
      return toUrl.pathname + toUrl.search + toUrl.hash;
    } catch {
      return to;
    }
  }

  /**
   * Resolve URL relative to base
   */
  static resolve(base: string, relative: string): string {
    try {
      return new URL(relative, base).toString();
    } catch {
      return relative;
    }
  }

  /**
   * Extract domain from URL
   */
  static getDomain(url: string, includeSubdomain = true): string | null {
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname;

      if (!includeSubdomain) {
        const parts = hostname.split('.');
        if (parts.length > 2) {
          return parts.slice(-2).join('.');
        }
      }

      return hostname;
    } catch {
      return null;
    }
  }

  /**
   * Extract subdomain from URL
   */
  static getSubdomain(url: string): string | null {
    try {
      const urlObj = new URL(url);
      const parts = urlObj.hostname.split('.');

      if (parts.length > 2) {
        return parts.slice(0, -2).join('.');
      }

      return null;
    } catch {
      return null;
    }
  }

  /**
   * Check if URLs have same origin
   */
  static isSameOrigin(url1: string, url2: string): boolean {
    try {
      const urlObj1 = new URL(url1);
      const urlObj2 = new URL(url2);

      return urlObj1.origin === urlObj2.origin;
    } catch {
      return false;
    }
  }

  /**
   * Build query string from object
   */
  static buildQueryString(params: Record<string, any>, options: QueryStringOptions = {}): string {
    const {
      arrayFormat = 'bracket',
      arrayFormatSeparator = ',',
      encode = true,
      encodeValuesOnly = false,
      sort = false,
      skipNulls = false,
      skipEmptyString = false,
      strictNullHandling = false
    } = options;

    const pairs: string[] = [];

    const processValue = (key: string, value: any) => {
      if (value === null) {
        if (skipNulls) return;
        if (strictNullHandling) {
          pairs.push(encode && !encodeValuesOnly ? encodeURIComponent(key) : key);
          return;
        }
        value = '';
      }

      if (value === undefined) {
        return;
      }

      if (value === '' && skipEmptyString) {
        return;
      }

      const encodedKey = encode && !encodeValuesOnly ? encodeURIComponent(key) : key;
      const encodedValue = encode ? encodeURIComponent(String(value)) : String(value);

      pairs.push(`${encodedKey}=${encodedValue}`);
    };

    const processArray = (key: string, array: any[]) => {
      switch (arrayFormat) {
        case 'bracket':
          array.forEach(value => processValue(`${key}[]`, value));
          break;
        case 'index':
          array.forEach((value, index) => processValue(`${key}[${index}]`, value));
          break;
        case 'comma':
          processValue(key, array.join(','));
          break;
        case 'separator':
          processValue(key, array.join(arrayFormatSeparator));
          break;
        case 'bracket-separator':
          processValue(`${key}[]`, array.join(arrayFormatSeparator));
          break;
        default:
          array.forEach(value => processValue(key, value));
      }
    };

    const keys = Object.keys(params);

    if (sort) {
      if (typeof sort === 'function') {
        keys.sort(sort);
      } else {
        keys.sort();
      }
    }

    for (const key of keys) {
      const value = params[key];

      if (Array.isArray(value)) {
        processArray(key, value);
      } else {
        processValue(key, value);
      }
    }

    return pairs.join('&');
  }

  /**
   * Parse query string to object
   */
  static parseQueryString(queryString: string, options: QueryStringOptions = {}): Record<string, any> {
    const {
      arrayFormat = 'bracket',
      arrayFormatSeparator = ','
    } = options;

    const result: Record<string, any> = {};

    if (!queryString) {
      return result;
    }

    // Remove leading ?
    const cleanQuery = queryString.replace(/^\?/, '');

    if (!cleanQuery) {
      return result;
    }

    const pairs = cleanQuery.split('&');

    for (const pair of pairs) {
      const [encodedKey, encodedValue = ''] = pair.split('=');

      if (!encodedKey) continue;

      const key = decodeURIComponent(encodedKey);
      const value = decodeURIComponent(encodedValue);

      // Handle arrays
      if (key.endsWith('[]')) {
        const baseKey = key.slice(0, -2);
        if (!result[baseKey]) {
          result[baseKey] = [];
        }

        if (arrayFormat === 'bracket-separator') {
          result[baseKey].push(...value.split(arrayFormatSeparator));
        } else {
          result[baseKey].push(value);
        }
      } else if (key.includes('[') && key.includes(']')) {
        // Handle indexed arrays
        const match = key.match(/^([^\[]+)\[(\d*)\]$/);
        if (match) {
          const [, baseKey, index] = match;
          if (!result[baseKey]) {
            result[baseKey] = [];
          }

          if (index === '') {
            result[baseKey].push(value);
          } else {
            result[baseKey][parseInt(index, 10)] = value;
          }
        } else {
          result[key] = value;
        }
      } else {
        // Handle comma-separated values
        if (arrayFormat === 'comma' && value.includes(',')) {
          result[key] = value.split(',');
        } else if (result[key]) {
          // Multiple values for same key
          if (Array.isArray(result[key])) {
            result[key].push(value);
          } else {
            result[key] = [result[key], value];
          }
        } else {
          result[key] = value;
        }
      }
    }

    return result;
  }

  /**
   * Add query parameters to URL
   */
  static addQueryParams(url: string, params: Record<string, any>): string {
    try {
      const urlObj = new URL(url);

      for (const [key, value] of Object.entries(params)) {
        if (Array.isArray(value)) {
          value.forEach(v => urlObj.searchParams.append(key, String(v)));
        } else if (value !== null && value !== undefined) {
          urlObj.searchParams.set(key, String(value));
        }
      }

      return urlObj.toString();
    } catch {
      return url;
    }
  }

  /**
   * Remove query parameters from URL
   */
  static removeQueryParams(url: string, params: string[]): string {
    try {
      const urlObj = new URL(url);

      for (const param of params) {
        urlObj.searchParams.delete(param);
      }

      return urlObj.toString();
    } catch {
      return url;
    }
  }

  /**
   * Get query parameter value
   */
  static getQueryParam(url: string, param: string): string | null {
    try {
      const urlObj = new URL(url);
      return urlObj.searchParams.get(param);
    } catch {
      return null;
    }
  }

  /**
   * Get all query parameter values
   */
  static getAllQueryParams(url: string, param: string): string[] {
    try {
      const urlObj = new URL(url);
      return urlObj.searchParams.getAll(param);
    } catch {
      return [];
    }
  }

  /**
   * Check if URL has query parameter
   */
  static hasQueryParam(url: string, param: string): boolean {
    try {
      const urlObj = new URL(url);
      return urlObj.searchParams.has(param);
    } catch {
      return false;
    }
  }

  /**
   * Generate URL slug from string
   */
  static slugify(text: string, options: { separator?: string; lowercase?: boolean; strict?: boolean } = {}): string {
    const { separator = '-', lowercase = true, strict = false } = options;

    let slug = text.trim();

    if (lowercase) {
      slug = slug.toLowerCase();
    }

    // Remove accents
    slug = slug.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    if (strict) {
      // Only allow alphanumeric and separator
      slug = slug.replace(new RegExp(`[^a-zA-Z0-9${separator.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}]`, 'g'), separator);
    } else {
      // Replace non-alphanumeric with separator
      slug = slug.replace(/[^a-zA-Z0-9]+/g, separator);
    }

    // Remove multiple separators
    slug = slug.replace(new RegExp(`${separator.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}+`, 'g'), separator);

    // Remove leading/trailing separators
    slug = slug.replace(new RegExp(`^${separator.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}+|${separator.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}+$`, 'g'), '');

    return slug;
  }

  /**
   * Encode URL component safely
   */
  static encode(str: string): string {
    return encodeURIComponent(str)
      .replace(/[!'()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);
  }

  /**
   * Decode URL component safely
   */
  static decode(str: string): string {
    try {
      return decodeURIComponent(str);
    } catch {
      return str;
    }
  }

  /**
   * Check if URL is absolute
   */
  static isAbsolute(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if URL is relative
   */
  static isRelative(url: string): boolean {
    return !this.isAbsolute(url);
  }

  /**
   * Get file extension from URL
   */
  static getExtension(url: string): string | null {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const lastDot = pathname.lastIndexOf('.');
      const lastSlash = pathname.lastIndexOf('/');

      if (lastDot > lastSlash && lastDot !== -1) {
        return pathname.slice(lastDot + 1).toLowerCase();
      }

      return null;
    } catch {
      return null;
    }
  }

  /**
   * Get filename from URL
   */
  static getFilename(url: string, includeExtension = true): string | null {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const filename = pathname.split('/').pop();

      if (!filename) {
        return null;
      }

      if (!includeExtension) {
        const lastDot = filename.lastIndexOf('.');
        if (lastDot !== -1) {
          return filename.slice(0, lastDot);
        }
      }

      return filename;
    } catch {
      return null;
    }
  }

  /**
   * Convert URL to data URL (for images, etc.)
   */
  static async toDataUrl(url: string): Promise<string> {
    try {
      const response = await fetch(url);
      const blob = await response.blob();

      // Check if FileReader is available (browser environment)
      if (typeof FileReader !== 'undefined') {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      } else {
        // Fallback for Node.js environment
        const arrayBuffer = await blob.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const mimeType = blob.type || 'application/octet-stream';
        return `data:${mimeType};base64,${buffer.toString('base64')}`;
      }
    } catch (error) {
      throw new Error(`Failed to convert URL to data URL: ${error}`);
    }
  }

  /**
   * Shorten URL (simple hash-based)
   */
  static shorten(url: string, options: UrlShortenerOptions = {}): string {
    const { length = 6, alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', prefix = '' } = options;

    // Simple hash function
    let hash = 0;
    for (let i = 0; i < url.length; i++) {
      const char = url.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }

    // Convert hash to base-N string
    let result = '';
    let num = Math.abs(hash);

    for (let i = 0; i < length; i++) {
      result = alphabet[num % alphabet.length] + result;
      num = Math.floor(num / alphabet.length);
    }

    return prefix + result;
  }
}

// Export commonly used functions
export const {
  parse,
  build,
  isValid,
  normalize,
  join,
  relative,
  resolve,
  getDomain,
  getSubdomain,
  isSameOrigin,
  buildQueryString,
  parseQueryString,
  addQueryParams,
  removeQueryParams,
  getQueryParam,
  getAllQueryParams,
  hasQueryParam,
  slugify,
  encode,
  decode,
  isAbsolute,
  isRelative,
  getExtension,
  getFilename,
  toDataUrl,
  shorten,
} = UrlUtils;