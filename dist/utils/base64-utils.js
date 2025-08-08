"use strict";
/**
 * Base64 utilities for encoding and decoding
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseDataUrl = exports.createDataUrl = exports.decodeJson = exports.encodeJson = exports.convert = exports.normalize = exports.compare = exports.getDecodedLength = exports.getEncodedLength = exports.encodeUrlNoPadding = exports.encodeNoPadding = exports.decodeUrl = exports.encodeUrl = exports.isValid = exports.decodeBuffer = exports.encodeBuffer = exports.decode = exports.encode = exports.Base64Utils = void 0;
/**
 * Base64 utilities class
 */
class Base64Utils {
    /**
     * Encode string to base64
     */
    static encode(input, options = {}) {
        const { urlSafe = false, padding = true, encoding = 'utf8' } = options;
        if (typeof Buffer !== 'undefined') {
            // Node.js environment
            let result = Buffer.from(input, encoding).toString('base64');
            if (urlSafe) {
                result = result.replace(/\+/g, '-').replace(/\//g, '_');
            }
            if (!padding) {
                result = result.replace(/=/g, '');
            }
            return result;
        }
        else {
            // Browser environment
            const encoded = btoa(unescape(encodeURIComponent(input)));
            if (urlSafe) {
                let result = encoded.replace(/\+/g, '-').replace(/\//g, '_');
                if (!padding) {
                    result = result.replace(/=/g, '');
                }
                return result;
            }
            return padding ? encoded : encoded.replace(/=/g, '');
        }
    }
    /**
     * Decode base64 string
     */
    static decode(input, options = {}) {
        const { urlSafe = false, encoding = 'utf8' } = options;
        let normalized = input;
        if (urlSafe) {
            normalized = normalized.replace(/-/g, '+').replace(/_/g, '/');
        }
        // Add padding if missing
        const padding = normalized.length % 4;
        if (padding > 0) {
            normalized += '='.repeat(4 - padding);
        }
        if (typeof Buffer !== 'undefined') {
            // Node.js environment
            return Buffer.from(normalized, 'base64').toString(encoding);
        }
        else {
            // Browser environment
            try {
                return decodeURIComponent(escape(atob(normalized)));
            }
            catch (error) {
                throw new Error('Invalid base64 string');
            }
        }
    }
    /**
     * Encode buffer to base64
     */
    static encodeBuffer(buffer, options = {}) {
        const { urlSafe = false, padding = true } = options;
        const bytes = buffer instanceof ArrayBuffer ? new Uint8Array(buffer) : buffer;
        const chars = urlSafe ? this.URL_SAFE_CHARS : this.STANDARD_CHARS;
        let result = '';
        let i = 0;
        while (i < bytes.length) {
            const a = bytes[i++];
            const b = i < bytes.length ? bytes[i++] : 0;
            const c = i < bytes.length ? bytes[i++] : 0;
            const bitmap = (a << 16) | (b << 8) | c;
            result += chars.charAt((bitmap >> 18) & 63);
            result += chars.charAt((bitmap >> 12) & 63);
            result += chars.charAt((bitmap >> 6) & 63);
            result += chars.charAt(bitmap & 63);
        }
        // Add padding
        const paddingLength = (3 - (bytes.length % 3)) % 3;
        if (padding && paddingLength > 0) {
            result = result.slice(0, -paddingLength) + this.PADDING_CHAR.repeat(paddingLength);
        }
        else if (!padding) {
            result = result.slice(0, result.length - paddingLength);
        }
        return result;
    }
    /**
     * Decode base64 to buffer
     */
    static decodeBuffer(input, options = {}) {
        const { urlSafe = false } = options;
        let normalized = input;
        if (urlSafe) {
            normalized = normalized.replace(/-/g, '+').replace(/_/g, '/');
        }
        // Add padding if missing
        const padding = normalized.length % 4;
        if (padding > 0) {
            normalized += '='.repeat(4 - padding);
        }
        const chars = urlSafe ? this.URL_SAFE_CHARS : this.STANDARD_CHARS;
        const lookup = new Array(256).fill(-1);
        // Build lookup table
        for (let i = 0; i < chars.length; i++) {
            lookup[chars.charCodeAt(i)] = i;
        }
        const bufferLength = Math.floor((normalized.length * 3) / 4);
        const buffer = new Uint8Array(bufferLength);
        let bufferIndex = 0;
        let i = 0;
        while (i < normalized.length) {
            const a = lookup[normalized.charCodeAt(i++)];
            const b = lookup[normalized.charCodeAt(i++)];
            const c = lookup[normalized.charCodeAt(i++)];
            const d = lookup[normalized.charCodeAt(i++)];
            if (a === -1 || b === -1 || c === -1 || d === -1) {
                throw new Error('Invalid base64 character');
            }
            const bitmap = (a << 18) | (b << 12) | (c << 6) | d;
            if (bufferIndex < buffer.length) {
                buffer[bufferIndex++] = (bitmap >> 16) & 255;
            }
            if (bufferIndex < buffer.length) {
                buffer[bufferIndex++] = (bitmap >> 8) & 255;
            }
            if (bufferIndex < buffer.length) {
                buffer[bufferIndex++] = bitmap & 255;
            }
        }
        return buffer;
    }
    /**
     * Check if string is valid base64
     */
    static isValid(input, options = {}) {
        const { urlSafe = false } = options;
        if (!input || typeof input !== 'string') {
            return false;
        }
        const chars = urlSafe ? this.URL_SAFE_CHARS : this.STANDARD_CHARS;
        const pattern = urlSafe
            ? /^[A-Za-z0-9_-]*={0,2}$/
            : /^[A-Za-z0-9+/]*={0,2}$/;
        if (!pattern.test(input)) {
            return false;
        }
        // Check length
        const withoutPadding = input.replace(/=/g, '');
        if (withoutPadding.length % 4 === 1) {
            return false;
        }
        try {
            this.decode(input, options);
            return true;
        }
        catch {
            return false;
        }
    }
    /**
     * Encode URL-safe base64
     */
    static encodeUrl(input, options = {}) {
        return this.encode(input, { ...options, urlSafe: true });
    }
    /**
     * Decode URL-safe base64
     */
    static decodeUrl(input, options = {}) {
        return this.decode(input, { ...options, urlSafe: true });
    }
    /**
     * Encode without padding
     */
    static encodeNoPadding(input, options = {}) {
        return this.encode(input, { ...options, padding: false });
    }
    /**
     * Encode URL-safe without padding
     */
    static encodeUrlNoPadding(input, options = {}) {
        return this.encode(input, { ...options, urlSafe: true, padding: false });
    }
    /**
     * Get base64 string length for given input length
     */
    static getEncodedLength(inputLength, options = {}) {
        const { padding = true } = options;
        if (padding) {
            return Math.ceil(inputLength / 3) * 4;
        }
        else {
            return Math.ceil((inputLength * 4) / 3);
        }
    }
    /**
     * Get decoded length for base64 string
     */
    static getDecodedLength(base64String) {
        const withoutPadding = base64String.replace(/=/g, '');
        return Math.floor((withoutPadding.length * 3) / 4);
    }
    /**
     * Compare two base64 strings
     */
    static compare(a, b, options = {}) {
        try {
            const decodedA = this.decode(a, options);
            const decodedB = this.decode(b, options);
            return decodedA === decodedB;
        }
        catch {
            return false;
        }
    }
    /**
     * Normalize base64 string (add padding, convert to standard format)
     */
    static normalize(input, options = {}) {
        const { urlSafe = false, padding = true } = options;
        try {
            const decoded = this.decode(input, { urlSafe: true }); // Try URL-safe first
            return this.encode(decoded, { urlSafe, padding });
        }
        catch {
            try {
                const decoded = this.decode(input, { urlSafe: false }); // Try standard
                return this.encode(decoded, { urlSafe, padding });
            }
            catch {
                throw new Error('Invalid base64 string');
            }
        }
    }
    /**
     * Convert between URL-safe and standard base64
     */
    static convert(input, toUrlSafe, options = {}) {
        const { padding = true } = options;
        try {
            const decoded = this.decode(input, { urlSafe: !toUrlSafe });
            return this.encode(decoded, { urlSafe: toUrlSafe, padding });
        }
        catch {
            throw new Error('Invalid base64 string');
        }
    }
    /**
     * Encode JSON object to base64
     */
    static encodeJson(obj, options = {}) {
        const json = JSON.stringify(obj);
        return this.encode(json, options);
    }
    /**
     * Decode base64 to JSON object
     */
    static decodeJson(input, options = {}) {
        const json = this.decode(input, options);
        return JSON.parse(json);
    }
    /**
     * Create base64 data URL
     */
    static createDataUrl(data, mimeType = 'text/plain', options = {}) {
        const encoded = this.encode(data, options);
        return `data:${mimeType};base64,${encoded}`;
    }
    /**
     * Parse base64 data URL
     */
    static parseDataUrl(dataUrl, options = {}) {
        const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
        if (!match) {
            throw new Error('Invalid data URL format');
        }
        const [, mimeType, base64Data] = match;
        const data = this.decode(base64Data, options);
        return { mimeType, data };
    }
}
exports.Base64Utils = Base64Utils;
Base64Utils.STANDARD_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
Base64Utils.URL_SAFE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
Base64Utils.PADDING_CHAR = '=';
// Export commonly used functions
exports.encode = Base64Utils.encode, exports.decode = Base64Utils.decode, exports.encodeBuffer = Base64Utils.encodeBuffer, exports.decodeBuffer = Base64Utils.decodeBuffer, exports.isValid = Base64Utils.isValid, exports.encodeUrl = Base64Utils.encodeUrl, exports.decodeUrl = Base64Utils.decodeUrl, exports.encodeNoPadding = Base64Utils.encodeNoPadding, exports.encodeUrlNoPadding = Base64Utils.encodeUrlNoPadding, exports.getEncodedLength = Base64Utils.getEncodedLength, exports.getDecodedLength = Base64Utils.getDecodedLength, exports.compare = Base64Utils.compare, exports.normalize = Base64Utils.normalize, exports.convert = Base64Utils.convert, exports.encodeJson = Base64Utils.encodeJson, exports.decodeJson = Base64Utils.decodeJson, exports.createDataUrl = Base64Utils.createDataUrl, exports.parseDataUrl = Base64Utils.parseDataUrl;
//# sourceMappingURL=base64-utils.js.map