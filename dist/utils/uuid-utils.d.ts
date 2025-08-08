/**
 * UUID utilities for generating and validating UUIDs
 */
export interface UuidV4Options {
    random?: Uint8Array;
    rng?: () => Uint8Array;
}
export interface UuidV5Options {
    namespace: string;
    name: string;
}
export interface UuidV3Options {
    namespace: string;
    name: string;
}
export interface UuidV1Options {
    node?: Uint8Array;
    clockseq?: number;
    msecs?: number;
    nsecs?: number;
}
export type UuidVersion = 1 | 3 | 4 | 5;
export interface UuidInfo {
    version: UuidVersion;
    variant: string;
    timestamp?: number;
    node?: string;
    clockSequence?: number;
}
/**
 * UUID utilities class
 */
export declare class UuidUtils {
    static readonly NAMESPACE_DNS = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
    static readonly NAMESPACE_URL = "6ba7b811-9dad-11d1-80b4-00c04fd430c8";
    static readonly NAMESPACE_OID = "6ba7b812-9dad-11d1-80b4-00c04fd430c8";
    static readonly NAMESPACE_X500 = "6ba7b814-9dad-11d1-80b4-00c04fd430c8";
    private static readonly UUID_REGEX;
    private static readonly UUID_REGEX_NO_HYPHENS;
    private static _nodeId;
    private static _clockseq;
    private static _lastMSecs;
    private static _lastNSecs;
    /**
     * Generate UUID v4 (random)
     */
    static v4(options?: UuidV4Options): string;
    /**
     * Generate UUID v1 (timestamp-based)
     */
    static v1(options?: UuidV1Options): string;
    /**
     * Generate UUID v3 (MD5 hash-based)
     */
    static v3(options: UuidV3Options): string;
    /**
     * Generate UUID v5 (SHA-1 hash-based)
     */
    static v5(options: UuidV5Options): string;
    /**
     * Generate hash-based UUID (v3 or v5)
     */
    private static generateHashUuid;
    /**
     * Validate UUID string
     */
    static isValid(uuid: string): boolean;
    /**
     * Get UUID version
     */
    static getVersion(uuid: string): UuidVersion | null;
    /**
     * Get UUID information
     */
    static getInfo(uuid: string): UuidInfo | null;
    /**
     * Get variant string
     */
    private static getVariant;
    /**
     * Normalize UUID (add hyphens)
     */
    static normalize(uuid: string): string;
    /**
     * Remove hyphens from UUID
     */
    static compact(uuid: string): string;
    /**
     * Compare two UUIDs
     */
    static compare(a: string, b: string): number;
    /**
     * Check if two UUIDs are equal
     */
    static equals(a: string, b: string): boolean;
    /**
     * Generate NIL UUID (all zeros)
     */
    static nil(): string;
    /**
     * Check if UUID is NIL
     */
    static isNil(uuid: string): boolean;
    /**
     * Convert UUID to bytes
     */
    static uuidToBytes(uuid: string): Uint8Array;
    /**
     * Convert bytes to UUID
     */
    static bytesToUuid(bytes: Uint8Array): string;
    /**
     * Generate multiple UUIDs
     */
    static generate(count: number, version?: UuidVersion, options?: any): string[];
    /**
     * Parse UUID from various formats
     */
    static parse(input: string): string;
    /**
     * Format UUID with custom format
     */
    static format(uuid: string, format: 'default' | 'compact' | 'urn' | 'braces'): string;
    /**
     * Create UUID from timestamp (v1-like)
     */
    static fromTimestamp(timestamp: number, options?: Omit<UuidV1Options, 'msecs'>): string;
    /**
     * Extract timestamp from v1 UUID
     */
    static getTimestamp(uuid: string): number | null;
    /**
     * Check if UUID is time-based (v1)
     */
    static isTimeBased(uuid: string): boolean;
    /**
     * Check if UUID is random (v4)
     */
    static isRandom(uuid: string): boolean;
    /**
     * Check if UUID is hash-based (v3 or v5)
     */
    static isHashBased(uuid: string): boolean;
}
export declare const v1: typeof UuidUtils.v1, v3: typeof UuidUtils.v3, v4: typeof UuidUtils.v4, v5: typeof UuidUtils.v5, isValid: typeof UuidUtils.isValid, getVersion: typeof UuidUtils.getVersion, getInfo: typeof UuidUtils.getInfo, normalize: typeof UuidUtils.normalize, compact: typeof UuidUtils.compact, compare: typeof UuidUtils.compare, equals: typeof UuidUtils.equals, nil: typeof UuidUtils.nil, isNil: typeof UuidUtils.isNil, uuidToBytes: typeof UuidUtils.uuidToBytes, bytesToUuid: typeof UuidUtils.bytesToUuid, generate: typeof UuidUtils.generate, parse: typeof UuidUtils.parse, format: typeof UuidUtils.format, fromTimestamp: typeof UuidUtils.fromTimestamp, getTimestamp: typeof UuidUtils.getTimestamp, isTimeBased: typeof UuidUtils.isTimeBased, isRandom: typeof UuidUtils.isRandom, isHashBased: typeof UuidUtils.isHashBased, NAMESPACE_DNS: string, NAMESPACE_URL: string, NAMESPACE_OID: string, NAMESPACE_X500: string;
//# sourceMappingURL=uuid-utils.d.ts.map