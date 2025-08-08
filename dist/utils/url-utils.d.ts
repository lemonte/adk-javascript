/**
 * URL utilities for comprehensive URL manipulation and parsing
 */
declare global {
    interface ProgressEvent<T = EventTarget> {
        lengthComputable: boolean;
        loaded: number;
        total: number;
        target: T | null;
    }
    interface FileReader {
        new (): FileReader;
        readAsDataURL(blob: Blob): void;
        result: string | null;
        onload: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null;
        onerror: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null;
    }
}
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
export declare class UrlUtils {
    private static readonly URL_REGEX;
    private static readonly DOMAIN_REGEX;
    private static readonly IPV4_REGEX;
    private static readonly IPV6_REGEX;
    private static readonly DEFAULT_PORTS;
    /**
     * Parse URL into components
     */
    static parse(url: string): ParsedUrl | null;
    /**
     * Build URL from components
     */
    static build(options: UrlBuildOptions): string;
    /**
     * Validate URL
     */
    static isValid(url: string, options?: UrlValidationOptions): boolean;
    /**
     * Normalize URL
     */
    static normalize(url: string, options?: UrlNormalizationOptions): string;
    /**
     * Join URL paths
     */
    static join(base: string, ...paths: string[]): string;
    /**
     * Get relative URL
     */
    static relative(from: string, to: string): string;
    /**
     * Resolve URL relative to base
     */
    static resolve(base: string, relative: string): string;
    /**
     * Extract domain from URL
     */
    static getDomain(url: string, includeSubdomain?: boolean): string | null;
    /**
     * Extract subdomain from URL
     */
    static getSubdomain(url: string): string | null;
    /**
     * Check if URLs have same origin
     */
    static isSameOrigin(url1: string, url2: string): boolean;
    /**
     * Build query string from object
     */
    static buildQueryString(params: Record<string, any>, options?: QueryStringOptions): string;
    /**
     * Parse query string to object
     */
    static parseQueryString(queryString: string, options?: QueryStringOptions): Record<string, any>;
    /**
     * Add query parameters to URL
     */
    static addQueryParams(url: string, params: Record<string, any>): string;
    /**
     * Remove query parameters from URL
     */
    static removeQueryParams(url: string, params: string[]): string;
    /**
     * Get query parameter value
     */
    static getQueryParam(url: string, param: string): string | null;
    /**
     * Get all query parameter values
     */
    static getAllQueryParams(url: string, param: string): string[];
    /**
     * Check if URL has query parameter
     */
    static hasQueryParam(url: string, param: string): boolean;
    /**
     * Generate URL slug from string
     */
    static slugify(text: string, options?: {
        separator?: string;
        lowercase?: boolean;
        strict?: boolean;
    }): string;
    /**
     * Encode URL component safely
     */
    static encode(str: string): string;
    /**
     * Decode URL component safely
     */
    static decode(str: string): string;
    /**
     * Check if URL is absolute
     */
    static isAbsolute(url: string): boolean;
    /**
     * Check if URL is relative
     */
    static isRelative(url: string): boolean;
    /**
     * Get file extension from URL
     */
    static getExtension(url: string): string | null;
    /**
     * Get filename from URL
     */
    static getFilename(url: string, includeExtension?: boolean): string | null;
    /**
     * Convert URL to data URL (for images, etc.)
     */
    static toDataUrl(url: string): Promise<string>;
    /**
     * Shorten URL (simple hash-based)
     */
    static shorten(url: string, options?: UrlShortenerOptions): string;
}
export declare const parse: typeof UrlUtils.parse, build: typeof UrlUtils.build, isValid: typeof UrlUtils.isValid, normalize: typeof UrlUtils.normalize, join: typeof UrlUtils.join, relative: typeof UrlUtils.relative, resolve: typeof UrlUtils.resolve, getDomain: typeof UrlUtils.getDomain, getSubdomain: typeof UrlUtils.getSubdomain, isSameOrigin: typeof UrlUtils.isSameOrigin, buildQueryString: typeof UrlUtils.buildQueryString, parseQueryString: typeof UrlUtils.parseQueryString, addQueryParams: typeof UrlUtils.addQueryParams, removeQueryParams: typeof UrlUtils.removeQueryParams, getQueryParam: typeof UrlUtils.getQueryParam, getAllQueryParams: typeof UrlUtils.getAllQueryParams, hasQueryParam: typeof UrlUtils.hasQueryParam, slugify: typeof UrlUtils.slugify, encode: typeof UrlUtils.encode, decode: typeof UrlUtils.decode, isAbsolute: typeof UrlUtils.isAbsolute, isRelative: typeof UrlUtils.isRelative, getExtension: typeof UrlUtils.getExtension, getFilename: typeof UrlUtils.getFilename, toDataUrl: typeof UrlUtils.toDataUrl, shorten: typeof UrlUtils.shorten;
//# sourceMappingURL=url-utils.d.ts.map