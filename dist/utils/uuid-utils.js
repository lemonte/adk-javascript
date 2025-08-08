"use strict";
/**
 * UUID utilities for generating and validating UUIDs
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.NAMESPACE_X500 = exports.NAMESPACE_OID = exports.NAMESPACE_URL = exports.NAMESPACE_DNS = exports.isHashBased = exports.isRandom = exports.isTimeBased = exports.getTimestamp = exports.fromTimestamp = exports.format = exports.parse = exports.generate = exports.bytesToUuid = exports.uuidToBytes = exports.isNil = exports.nil = exports.equals = exports.compare = exports.compact = exports.normalize = exports.getInfo = exports.getVersion = exports.isValid = exports.v5 = exports.v4 = exports.v3 = exports.v1 = exports.UuidUtils = void 0;
/**
 * UUID utilities class
 */
class UuidUtils {
    /**
     * Generate UUID v4 (random)
     */
    static v4(options = {}) {
        const { random, rng } = options;
        let rnds;
        if (random) {
            rnds = random;
        }
        else if (rng) {
            rnds = rng();
        }
        else {
            rnds = new Uint8Array(16);
            if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
                crypto.getRandomValues(rnds);
            }
            else if (typeof require !== 'undefined') {
                // Node.js environment
                try {
                    const nodeCrypto = require('crypto');
                    const randomBytes = nodeCrypto.randomBytes(16);
                    rnds.set(randomBytes);
                }
                catch {
                    // Fallback to Math.random
                    for (let i = 0; i < 16; i++) {
                        rnds[i] = Math.floor(Math.random() * 256);
                    }
                }
            }
            else {
                // Fallback to Math.random
                for (let i = 0; i < 16; i++) {
                    rnds[i] = Math.floor(Math.random() * 256);
                }
            }
        }
        // Set version (4) and variant bits
        rnds[6] = (rnds[6] & 0x0f) | 0x40; // Version 4
        rnds[8] = (rnds[8] & 0x3f) | 0x80; // Variant 10
        return this.bytesToUuid(rnds);
    }
    /**
     * Generate UUID v1 (timestamp-based)
     */
    static v1(options = {}) {
        const { node, clockseq, msecs, nsecs } = options;
        // Initialize node ID if not provided
        let nodeId = node;
        if (!nodeId) {
            if (!this._nodeId) {
                this._nodeId = new Uint8Array(6);
                if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
                    crypto.getRandomValues(this._nodeId);
                }
                else {
                    for (let i = 0; i < 6; i++) {
                        this._nodeId[i] = Math.floor(Math.random() * 256);
                    }
                }
                // Set multicast bit
                this._nodeId[0] |= 0x01;
            }
            nodeId = this._nodeId;
        }
        // Initialize clock sequence if not provided
        let clockSeq = clockseq;
        if (clockSeq == null) {
            if (this._clockseq == null) {
                this._clockseq = Math.floor(Math.random() * 0x4000);
            }
            clockSeq = this._clockseq;
        }
        // Get timestamp
        const now = msecs != null ? msecs : Date.now();
        let nSecs = nsecs != null ? nsecs : 0;
        // Handle clock regression
        if (now < this._lastMSecs || (now === this._lastMSecs && nSecs <= this._lastNSecs)) {
            clockSeq = (clockSeq + 1) & 0x3fff;
        }
        if (now !== this._lastMSecs) {
            nSecs = 0;
        }
        this._lastMSecs = now;
        this._lastNSecs = nSecs;
        // Convert to UUID timestamp (100-nanosecond intervals since Oct 15, 1582)
        const timestamp = (now + 12219292800000) * 10000 + nSecs;
        const rnds = new Uint8Array(16);
        // Time low
        rnds[0] = (timestamp >>> 24) & 0xff;
        rnds[1] = (timestamp >>> 16) & 0xff;
        rnds[2] = (timestamp >>> 8) & 0xff;
        rnds[3] = timestamp & 0xff;
        // Time mid
        rnds[4] = (timestamp >>> 40) & 0xff;
        rnds[5] = (timestamp >>> 32) & 0xff;
        // Time high and version
        rnds[6] = ((timestamp >>> 56) & 0x0f) | 0x10; // Version 1
        rnds[7] = (timestamp >>> 48) & 0xff;
        // Clock sequence
        rnds[8] = ((clockSeq >>> 8) & 0x3f) | 0x80; // Variant 10
        rnds[9] = clockSeq & 0xff;
        // Node
        rnds.set(nodeId, 10);
        return this.bytesToUuid(rnds);
    }
    /**
     * Generate UUID v3 (MD5 hash-based)
     */
    static v3(options) {
        return this.generateHashUuid(options.namespace, options.name, 3, 'md5');
    }
    /**
     * Generate UUID v5 (SHA-1 hash-based)
     */
    static v5(options) {
        return this.generateHashUuid(options.namespace, options.name, 5, 'sha1');
    }
    /**
     * Generate hash-based UUID (v3 or v5)
     */
    static generateHashUuid(namespace, name, version, algorithm) {
        const namespaceBytes = this.uuidToBytes(namespace);
        const nameBytes = new TextEncoder().encode(name);
        // Combine namespace and name
        const combined = new Uint8Array(namespaceBytes.length + nameBytes.length);
        combined.set(namespaceBytes);
        combined.set(nameBytes, namespaceBytes.length);
        let hash;
        if (typeof crypto !== 'undefined' && crypto.subtle) {
            // Browser environment with Web Crypto API
            throw new Error(`UUID v${version} requires ${algorithm.toUpperCase()} hashing which is not available in this environment`);
        }
        else if (typeof require !== 'undefined') {
            // Node.js environment
            try {
                const nodeCrypto = require('crypto');
                const hasher = nodeCrypto.createHash(algorithm);
                hasher.update(combined);
                hash = new Uint8Array(hasher.digest());
            }
            catch {
                throw new Error(`UUID v${version} requires ${algorithm.toUpperCase()} hashing which is not available`);
            }
        }
        else {
            throw new Error(`UUID v${version} requires ${algorithm.toUpperCase()} hashing which is not available in this environment`);
        }
        // Take first 16 bytes
        const rnds = hash.slice(0, 16);
        // Set version and variant bits
        rnds[6] = (rnds[6] & 0x0f) | (version << 4);
        rnds[8] = (rnds[8] & 0x3f) | 0x80;
        return this.bytesToUuid(rnds);
    }
    /**
     * Validate UUID string
     */
    static isValid(uuid) {
        if (typeof uuid !== 'string') {
            return false;
        }
        return this.UUID_REGEX.test(uuid) || this.UUID_REGEX_NO_HYPHENS.test(uuid);
    }
    /**
     * Get UUID version
     */
    static getVersion(uuid) {
        if (!this.isValid(uuid)) {
            return null;
        }
        const normalized = this.normalize(uuid);
        const versionChar = normalized.charAt(14);
        const version = parseInt(versionChar, 16);
        return [1, 3, 4, 5].includes(version) ? version : null;
    }
    /**
     * Get UUID information
     */
    static getInfo(uuid) {
        const version = this.getVersion(uuid);
        if (!version) {
            return null;
        }
        const normalized = this.normalize(uuid);
        const bytes = this.uuidToBytes(normalized);
        const info = {
            version,
            variant: this.getVariant(bytes[8]),
        };
        if (version === 1) {
            // Extract timestamp for v1 UUIDs
            const timeLow = (bytes[0] << 24) | (bytes[1] << 16) | (bytes[2] << 8) | bytes[3];
            const timeMid = (bytes[4] << 8) | bytes[5];
            const timeHigh = ((bytes[6] & 0x0f) << 8) | bytes[7];
            const timestamp = (timeHigh << 32) | (timeMid << 16) | timeLow;
            info.timestamp = Math.floor((timestamp - 122192928000000000) / 10000);
            // Extract clock sequence
            info.clockSequence = ((bytes[8] & 0x3f) << 8) | bytes[9];
            // Extract node
            info.node = Array.from(bytes.slice(10))
                .map(b => b.toString(16).padStart(2, '0'))
                .join(':');
        }
        return info;
    }
    /**
     * Get variant string
     */
    static getVariant(byte) {
        if ((byte & 0x80) === 0) {
            return 'NCS';
        }
        else if ((byte & 0xc0) === 0x80) {
            return 'RFC 4122';
        }
        else if ((byte & 0xe0) === 0xc0) {
            return 'Microsoft';
        }
        else {
            return 'Reserved';
        }
    }
    /**
     * Normalize UUID (add hyphens)
     */
    static normalize(uuid) {
        if (!this.isValid(uuid)) {
            throw new Error('Invalid UUID');
        }
        const clean = uuid.replace(/-/g, '').toLowerCase();
        return [
            clean.slice(0, 8),
            clean.slice(8, 12),
            clean.slice(12, 16),
            clean.slice(16, 20),
            clean.slice(20, 32),
        ].join('-');
    }
    /**
     * Remove hyphens from UUID
     */
    static compact(uuid) {
        if (!this.isValid(uuid)) {
            throw new Error('Invalid UUID');
        }
        return uuid.replace(/-/g, '').toLowerCase();
    }
    /**
     * Compare two UUIDs
     */
    static compare(a, b) {
        const normalizedA = this.normalize(a);
        const normalizedB = this.normalize(b);
        if (normalizedA < normalizedB)
            return -1;
        if (normalizedA > normalizedB)
            return 1;
        return 0;
    }
    /**
     * Check if two UUIDs are equal
     */
    static equals(a, b) {
        return this.compare(a, b) === 0;
    }
    /**
     * Generate NIL UUID (all zeros)
     */
    static nil() {
        return '00000000-0000-0000-0000-000000000000';
    }
    /**
     * Check if UUID is NIL
     */
    static isNil(uuid) {
        return this.equals(uuid, this.nil());
    }
    /**
     * Convert UUID to bytes
     */
    static uuidToBytes(uuid) {
        const normalized = this.normalize(uuid);
        const hex = normalized.replace(/-/g, '');
        const bytes = new Uint8Array(16);
        for (let i = 0; i < 16; i++) {
            bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
        }
        return bytes;
    }
    /**
     * Convert bytes to UUID
     */
    static bytesToUuid(bytes) {
        if (bytes.length !== 16) {
            throw new Error('Bytes array must be exactly 16 bytes');
        }
        const hex = Array.from(bytes)
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
        return [
            hex.slice(0, 8),
            hex.slice(8, 12),
            hex.slice(12, 16),
            hex.slice(16, 20),
            hex.slice(20, 32),
        ].join('-');
    }
    /**
     * Generate multiple UUIDs
     */
    static generate(count, version = 4, options) {
        const uuids = [];
        for (let i = 0; i < count; i++) {
            switch (version) {
                case 1:
                    uuids.push(this.v1(options));
                    break;
                case 3:
                    uuids.push(this.v3(options));
                    break;
                case 4:
                    uuids.push(this.v4(options));
                    break;
                case 5:
                    uuids.push(this.v5(options));
                    break;
                default:
                    throw new Error(`Unsupported UUID version: ${version}`);
            }
        }
        return uuids;
    }
    /**
     * Parse UUID from various formats
     */
    static parse(input) {
        // Remove common prefixes and suffixes
        let cleaned = input.trim();
        // Remove URN prefix
        if (cleaned.startsWith('urn:uuid:')) {
            cleaned = cleaned.slice(9);
        }
        // Remove braces
        if (cleaned.startsWith('{') && cleaned.endsWith('}')) {
            cleaned = cleaned.slice(1, -1);
        }
        if (!this.isValid(cleaned)) {
            throw new Error('Invalid UUID format');
        }
        return this.normalize(cleaned);
    }
    /**
     * Format UUID with custom format
     */
    static format(uuid, format) {
        const normalized = this.normalize(uuid);
        switch (format) {
            case 'default':
                return normalized;
            case 'compact':
                return this.compact(uuid);
            case 'urn':
                return `urn:uuid:${normalized}`;
            case 'braces':
                return `{${normalized}}`;
            default:
                throw new Error(`Unknown format: ${format}`);
        }
    }
    /**
     * Create UUID from timestamp (v1-like)
     */
    static fromTimestamp(timestamp, options = {}) {
        return this.v1({ ...options, msecs: timestamp });
    }
    /**
     * Extract timestamp from v1 UUID
     */
    static getTimestamp(uuid) {
        const info = this.getInfo(uuid);
        return info?.timestamp || null;
    }
    /**
     * Check if UUID is time-based (v1)
     */
    static isTimeBased(uuid) {
        return this.getVersion(uuid) === 1;
    }
    /**
     * Check if UUID is random (v4)
     */
    static isRandom(uuid) {
        return this.getVersion(uuid) === 4;
    }
    /**
     * Check if UUID is hash-based (v3 or v5)
     */
    static isHashBased(uuid) {
        const version = this.getVersion(uuid);
        return version === 3 || version === 5;
    }
}
exports.UuidUtils = UuidUtils;
// Predefined namespaces
UuidUtils.NAMESPACE_DNS = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
UuidUtils.NAMESPACE_URL = '6ba7b811-9dad-11d1-80b4-00c04fd430c8';
UuidUtils.NAMESPACE_OID = '6ba7b812-9dad-11d1-80b4-00c04fd430c8';
UuidUtils.NAMESPACE_X500 = '6ba7b814-9dad-11d1-80b4-00c04fd430c8';
// UUID regex patterns
UuidUtils.UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
UuidUtils.UUID_REGEX_NO_HYPHENS = /^[0-9a-f]{32}$/i;
// Internal state for v1 UUIDs
UuidUtils._nodeId = null;
UuidUtils._clockseq = null;
UuidUtils._lastMSecs = 0;
UuidUtils._lastNSecs = 0;
// Export commonly used functions
exports.v1 = UuidUtils.v1, exports.v3 = UuidUtils.v3, exports.v4 = UuidUtils.v4, exports.v5 = UuidUtils.v5, exports.isValid = UuidUtils.isValid, exports.getVersion = UuidUtils.getVersion, exports.getInfo = UuidUtils.getInfo, exports.normalize = UuidUtils.normalize, exports.compact = UuidUtils.compact, exports.compare = UuidUtils.compare, exports.equals = UuidUtils.equals, exports.nil = UuidUtils.nil, exports.isNil = UuidUtils.isNil, exports.uuidToBytes = UuidUtils.uuidToBytes, exports.bytesToUuid = UuidUtils.bytesToUuid, exports.generate = UuidUtils.generate, exports.parse = UuidUtils.parse, exports.format = UuidUtils.format, exports.fromTimestamp = UuidUtils.fromTimestamp, exports.getTimestamp = UuidUtils.getTimestamp, exports.isTimeBased = UuidUtils.isTimeBased, exports.isRandom = UuidUtils.isRandom, exports.isHashBased = UuidUtils.isHashBased, exports.NAMESPACE_DNS = UuidUtils.NAMESPACE_DNS, exports.NAMESPACE_URL = UuidUtils.NAMESPACE_URL, exports.NAMESPACE_OID = UuidUtils.NAMESPACE_OID, exports.NAMESPACE_X500 = UuidUtils.NAMESPACE_X500;
//# sourceMappingURL=uuid-utils.js.map