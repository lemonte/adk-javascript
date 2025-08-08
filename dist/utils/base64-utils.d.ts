/**
 * Base64 utilities for encoding and decoding
 */
export interface Base64Options {
    urlSafe?: boolean;
    padding?: boolean;
}
export interface Base64EncodeOptions extends Base64Options {
    encoding?: BufferEncoding;
}
export interface Base64DecodeOptions extends Base64Options {
    encoding?: BufferEncoding;
}
/**
 * Base64 utilities class
 */
export declare class Base64Utils {
    private static readonly STANDARD_CHARS;
    private static readonly URL_SAFE_CHARS;
    private static readonly PADDING_CHAR;
    /**
     * Encode string to base64
     */
    static encode(input: string, options?: Base64EncodeOptions): string;
    /**
     * Decode base64 string
     */
    static decode(input: string, options?: Base64DecodeOptions): string;
    /**
     * Encode buffer to base64
     */
    static encodeBuffer(buffer: ArrayBuffer | Uint8Array, options?: Base64Options): string;
    /**
     * Decode base64 to buffer
     */
    static decodeBuffer(input: string, options?: Base64Options): Uint8Array;
    /**
     * Check if string is valid base64
     */
    static isValid(input: string, options?: Base64Options): boolean;
    /**
     * Encode URL-safe base64
     */
    static encodeUrl(input: string, options?: Omit<Base64EncodeOptions, 'urlSafe'>): string;
    /**
     * Decode URL-safe base64
     */
    static decodeUrl(input: string, options?: Omit<Base64DecodeOptions, 'urlSafe'>): string;
    /**
     * Encode without padding
     */
    static encodeNoPadding(input: string, options?: Omit<Base64EncodeOptions, 'padding'>): string;
    /**
     * Encode URL-safe without padding
     */
    static encodeUrlNoPadding(input: string, options?: Omit<Base64EncodeOptions, 'urlSafe' | 'padding'>): string;
    /**
     * Get base64 string length for given input length
     */
    static getEncodedLength(inputLength: number, options?: Base64Options): number;
    /**
     * Get decoded length for base64 string
     */
    static getDecodedLength(base64String: string): number;
    /**
     * Compare two base64 strings
     */
    static compare(a: string, b: string, options?: Base64Options): boolean;
    /**
     * Normalize base64 string (add padding, convert to standard format)
     */
    static normalize(input: string, options?: Base64Options): string;
    /**
     * Convert between URL-safe and standard base64
     */
    static convert(input: string, toUrlSafe: boolean, options?: Base64Options): string;
    /**
     * Encode JSON object to base64
     */
    static encodeJson(obj: any, options?: Base64EncodeOptions): string;
    /**
     * Decode base64 to JSON object
     */
    static decodeJson<T = any>(input: string, options?: Base64DecodeOptions): T;
    /**
     * Create base64 data URL
     */
    static createDataUrl(data: string, mimeType?: string, options?: Base64EncodeOptions): string;
    /**
     * Parse base64 data URL
     */
    static parseDataUrl(dataUrl: string, options?: Base64DecodeOptions): {
        mimeType: string;
        data: string;
    };
}
export declare const encode: typeof Base64Utils.encode, decode: typeof Base64Utils.decode, encodeBuffer: typeof Base64Utils.encodeBuffer, decodeBuffer: typeof Base64Utils.decodeBuffer, isValid: typeof Base64Utils.isValid, encodeUrl: typeof Base64Utils.encodeUrl, decodeUrl: typeof Base64Utils.decodeUrl, encodeNoPadding: typeof Base64Utils.encodeNoPadding, encodeUrlNoPadding: typeof Base64Utils.encodeUrlNoPadding, getEncodedLength: typeof Base64Utils.getEncodedLength, getDecodedLength: typeof Base64Utils.getDecodedLength, compare: typeof Base64Utils.compare, normalize: typeof Base64Utils.normalize, convert: typeof Base64Utils.convert, encodeJson: typeof Base64Utils.encodeJson, decodeJson: typeof Base64Utils.decodeJson, createDataUrl: typeof Base64Utils.createDataUrl, parseDataUrl: typeof Base64Utils.parseDataUrl;
//# sourceMappingURL=base64-utils.d.ts.map